import { NoteHandler, NoteHandlers } from './notes';
import { NodeDef, NodeParamDef, NodePalette, palette } from './palette';
import { ModernAudioContext, ModernAudioNode, removeArrayElement } from './modern';
import * as custom from './customNodes';


/**
 * Holds all data associated with an AudioNode
 */
export class NodeData {
	// Used by all nodes
	type: string;
	anode: ModernAudioNode;
	nodeDef: NodeDef;
	// Used by control nodes
	controlParam: string;
	controlParams: string[];
	controlTarget: ModernAudioNode;
	// Used by source audio nodes
	noteHandler: NoteHandler;
	// Flag to avoid deleting output node
	isOut: boolean = false;
	// To be implemented by user code
	getInputs(): NodeData[] {
		throw 'Error: getInputs() function should be implemented by user';
	}
}

//TODO *** refactor & decouple from UI
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
		this.registerCustomNode('createADSR', custom.ADSR);
		this.registerCustomNode('createNoise', custom.NoiseGenerator);
		this.registerCustomNode('createNoiseCtrl', custom.NoiseCtrlGenerator);
		this.registerCustomNode('createLineIn', custom.LineInNode);
		this.registerCustomNode('createDetuner', custom.Detuner);
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

	initNodeData(ndata: NodeData, type: string): void {
		ndata.type = type;
		ndata.anode = this.createAudioNode(type);
		if (!ndata.anode)
			return console.error(`No AudioNode found for '${type}'`);
		ndata.nodeDef = this.palette[type];
		const nh = ndata.nodeDef.noteHandler;
		if (nh) {
			ndata.noteHandler = new NoteHandlers[nh](ndata);
			this.addNoteHandler(ndata.noteHandler);
		}
		// LFO does not have a note handler yet needs to be started
		//TODO cleanup: assign note handler to LFO and review other source modules
		else if (ndata.anode['start']) ndata.anode['start']();
	}

	initOutputNodeData(data: NodeData): void {
		data.type = 'out';
		data.anode = this.ac.createGain();
		data.anode.connect(this.ac.destination);
		data.nodeDef = this.palette['Speaker'];
		data.isOut = true;
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



//-------------------- Parameter handlers --------------------
import * as popups from '../popups';

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
