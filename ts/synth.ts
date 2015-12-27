import { NoteHandler } from './notes';
import { NodeDef, NodeParamDef, NodePalette, palette } from './palette';
import { ModernWindow, ModernAudioContext, removeArrayElement } from './modern';

interface ParamHandler {
	initialize(anode: AudioNode, def: NodeDef): void;
	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): void;
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

	constructor() {
		const CtxClass: any = window.AudioContext || window.webkitAudioContext;
		this.ac = new CtxClass();
		this.palette = palette;
		this.registerCustomNode('createADSR', ADSR);
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
		this.customNodes[constructorName] = () => new nodeClass();
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

/**
 * A custom AudioNode providing ADSR envelope control
 */
export class ADSR extends CustomNodeBase {
	attack: number = 0.2;
	decay: number = 0.5;
	sustain: number = 0.5;
	release: number = 1;
	//TODO 0 <= depth <= 1
	//TODO linear / exponential
	//TODO kb trigger (boolean)
}

//-------------------- Parameter handlers --------------------

class BufferURL implements ParamHandler {

	initialize(anode: AudioNode, def: NodeDef): void {
		const absn: AudioBufferSourceNode = <AudioBufferSourceNode>anode;
		const url: string = <string>def.params['buffer'].initial;
		this.loadBuffer(absn.context, url, buffer => absn['_buffer'] = buffer);
	}

	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): void {
		const box = $('<div class="choice-box">');
		const button = $('<button class="btn btn-primary">URL</button>');
		box.append(button);
		button.after('<br/><br/>' + label);
		panel.append(box);
		button.click(_ => {
			const url = prompt('Audio buffer URL:');
			if (!url) return;
			const absn: AudioBufferSourceNode = <AudioBufferSourceNode>anode;
			//TODO problem: buffer can only be set once
			// solution: save buffer to different property, set it just before play
			this.loadBuffer(absn.context, url, buffer => absn['_buffer'] = buffer);
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
			ac.decodeAudioData(xhr.response, buffer => {
				w.audioBufferCache[url] = buffer;
				cb(buffer);
			});
		};
		xhr.send();
	}
}


declare var window: ModernWindow;
