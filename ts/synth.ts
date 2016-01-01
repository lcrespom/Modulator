import { NoteHandler } from './notes';
import { NodeDef, NodeParamDef, NodePalette, palette } from './palette';
import { ModernAudioContext, ModernAudioNode, removeArrayElement } from './modern';
import * as popups from './popups';

interface ParamHandler {
	initialize(anode: AudioNode, def: NodeDef): void;
	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): JQuery;
	param2json(anode: AudioNode): any;
	json2param(anode: AudioNode, json: any);
}

/**
 * Performs global operations on all AudioNodes:
 * - Manages AudioNode creation and initialization from the palette
 * - Distributes MIDI keyboard events to NoteHandlers
 */
export class Synth {
	ac: ModernAudioContext;
	customNodes: { [key: string]: Function } = {};
	paramHandlers: { [key: string]: ParamHandler } = {};
	palette: NodePalette;
	noteHandlers: NoteHandler[] = [];

	constructor(ac: ModernAudioContext) {
		this.ac = ac;
		this.palette = palette;
		this.registerCustomNode('createADSR', ADSR);
		this.registerCustomNode('createNoise', NoiseGenerator);
		this.registerCustomNode('createNoiseCtrl', NoiseCtrlGenerator);
		this.registerCustomNode('createLineIn', LineInNode);
		this.registerCustomNode('createDetuner', Detuner);
		this.registerParamHandler('BufferURL', new BufferURL());
	}

	createAudioNode(type: string): AudioNode {
		const def: NodeDef = palette[type];
		if (!def) return null;
		const factory = def.custom ? this.customNodes : this.ac;
		if (!factory[def.constructor]) return null;
		const anode = factory[def.constructor]();
		if (!anode.context) anode.context = this.ac;
		this.initNodeParams(anode, def, type);
		return anode;
	}

	play() {
		this.ac.resume();
	}

	stop() {
		this.ac.suspend();
	}

	noteOn(midi: number, gain: number, ratio: number): void {
		for (const nh of this.noteHandlers) {
			if (nh.kbTrigger) nh.handlers = this.noteHandlers;
			nh.noteOn(midi, gain, ratio);
		}
	}

	noteOff(midi: number, gain: number): void {
		for (const nh of this.noteHandlers)
			nh.noteOff(midi, gain);
	}

	addNoteHandler(nh: NoteHandler): void {
		this.noteHandlers.push(nh);
	}

	removeNoteHandler(nh: NoteHandler): void {
		removeArrayElement(this.noteHandlers, nh)
	}

	initNodeParams(anode: AudioNode, def: NodeDef, type: string): void {
		for (const param of Object.keys(def.params || {}))
			if (anode[param] === undefined)
				console.warn(`Parameter '${param}' not found for node '${type}'`)
			else if (anode[param] instanceof AudioParam)
				anode[param].value = def.params[param].initial;
			else if (def.params[param].handler) {
				def.params[param].phandler = this.paramHandlers[def.params[param].handler];
				def.params[param].phandler.initialize(anode, def);
			}
			else
				anode[param] = def.params[param].initial;
	}

	registerCustomNode(constructorName: string, nodeClass: any): void {
		this.customNodes[constructorName] = () => new nodeClass(this.ac);
	}

	registerParamHandler(hname: string, handler: ParamHandler): void {
		this.paramHandlers[hname] = handler;
	}

}


//-------------------- Custom nodes --------------------

class CustomNodeBase implements AudioNode {
	custom = true;
	channelCount = 2;
	channelCountMode = 'max';
	channelInterpretation = 'speakers';
	context: AudioContext;
	numberOfInputs = 0;
	numberOfOutputs = 1;
	connect(param: AudioParam | AudioNode) {}
	disconnect() {}
	// Required for extending EventTarget
	addEventListener(){}
	dispatchEvent(evt: Event): boolean { return false; }
	removeEventListener(){}
}


export class ADSR extends CustomNodeBase {
	attack: number = 0.2;
	decay: number = 0.5;
	sustain: number = 0.5;
	release: number = 1;
	depth: number = 1;
	//TODO linear / exponential
	//TODO kb trigger (boolean)
}


class ScriptProcessor extends CustomNodeBase {
	gain: number = 1;
	anode: ScriptProcessorNode;
	playing: boolean = false;

	connect(node: AudioNode) {
		if (!this.anode) this.createScriptProcessor(node.context);
		this.anode.connect(node);
	}

	disconnect() {
		this.anode.disconnect();
	}

	createScriptProcessor(ac: AudioContext) {
		this.anode = ac.createScriptProcessor(1024);
		this.anode.onaudioprocess = evt => this.processAudio(evt);
	}

	start() {
		this.playing = true;
	}

	stop() {
		this.playing = false;
	}

	processAudio(evt: AudioProcessingEvent) {}
}


class NoiseGenerator extends ScriptProcessor {
	processAudio(evt: AudioProcessingEvent) {
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel);
			for (let sample = 0; sample < out.length; sample++)
				out[sample] = this.playing ? this.gain * (Math.random() * 2 - 1) : 0;
		}
	}
}


class NoiseCtrlGenerator extends ScriptProcessor {
	ac: ModernAudioContext;
	frequency: number;
	depth: number;
	sct: number;
	v: number;

	constructor(ac: ModernAudioContext) {
		super();
		this.ac = ac;
		this.frequency = 4;
		this.depth = 20;
		this.sct = 0;
		this.v = 0;
	}

	connect(param: any) {
		if (!this.anode) this.createScriptProcessor(this.ac);
		this.anode.connect(param);
	}

	processAudio(evt: AudioProcessingEvent) {
		const samplesPerCycle = this.ac.sampleRate / this.frequency;
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel);
			for (let sample = 0; sample < out.length; sample++) {
				this.sct++;
				if (this.sct > samplesPerCycle) {
					this.v = this.depth * (Math.random() * 2 - 1);
					this.sct = 0; //this.sct - Math.floor(this.sct);
				}
				out[sample] = this.v;
			}
		}
	}
}


class Detuner extends ScriptProcessor {
	octave: number = 0;
	numberOfInputs = 1;

	processAudio(evt: AudioProcessingEvent) {
		const dx = Math.pow(2, this.octave);
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel);
			let inbuf = evt.inputBuffer.getChannelData(channel);
			let sct = 0;
			for (let sample = 0; sample < out.length; sample++) {
				out[sample] = inbuf[Math.floor(sct)];
				sct += dx;
				if (sct >= inbuf.length) sct = 0;
			}
		}
	}
}


class LineInNode extends CustomNodeBase {
	srcNode: ModernAudioNode;
	dstNode: ModernAudioNode;
	stream: any;

	connect(anode: AudioNode) {
		if (this.srcNode) {
			this.srcNode.connect(anode);
			this.dstNode = anode;
			return;
		}
		const navigator: any = window.navigator;
		navigator.getUserMedia = (navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);
		navigator.getUserMedia({ audio: true }, stream => {
			const ac: any = anode.context;
			this.srcNode = ac.createMediaStreamSource(stream);
			let a2: any = anode;
			if (a2.custom && a2.anode) a2 = a2.anode;
			this.srcNode.connect(a2);
			this.dstNode = anode;
			this.stream = stream;
		}, error => console.error(error));
	}

	disconnect() {
		this.srcNode.disconnect(this.dstNode);
	}
}

//-------------------- Parameter handlers --------------------

class BufferURL implements ParamHandler {

	initialize(anode: AudioNode, def: NodeDef): void {
		const absn: AudioBufferSourceNode = <AudioBufferSourceNode>anode;
		const url: string = <string>def.params['buffer'].initial;
		if (!url) return;
		this.loadBufferParam(absn, url);
	}

	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): JQuery {
		const box = $('<div class="choice-box">');
		const button = $('<button class="btn btn-primary">URL</button>');
		box.append(button);
		button.after('<br/><br/>' + label);
		panel.append(box);
		button.click(_ => {
			popups.prompt('Audio buffer URL:', 'Please provide URL', null, url => {
				if (!url) return;
				const absn: AudioBufferSourceNode = <AudioBufferSourceNode>anode;
				this.loadBufferParam(absn, url);
			});
		});
		return box;
	}

	param2json(anode: AudioNode): any {
		return anode['_url'];
	}

	json2param(anode: AudioNode, json: any) {
		this.loadBufferParam(<AudioBufferSourceNode>anode, json);
	}

	loadBufferParam(absn: AudioBufferSourceNode, url: string): void {
		this.loadBuffer(absn.context, url, buffer => {
			absn['_buffer'] = buffer;
			absn['_url'] = url;
		});
	}

	loadBuffer(ac: AudioContext, url: string, cb: (buffer: AudioBuffer) => void): void {
		const w: any = window;
		w.audioBufferCache = w.audioBufferCache || {};
		if (w.audioBufferCache[url])
			return cb(w.audioBufferCache[url]);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = _ => {
			popups.close();
			ac.decodeAudioData(xhr.response, buffer => {
				w.audioBufferCache[url] = buffer;
				cb(buffer);
			});
		};
		xhr.send();
		setTimeout(_ => {
			if (xhr.readyState != xhr.DONE)
				popups.progress('Loading ' + url + '...');
		}, 300);
	}
}
