import { NoteHandler } from './notes';
import { NodeDef, NodePalette, palette } from './palette';
import { ModernWindow, ModernAudioContext, removeArrayElement } from './modern';

/**
 * Performs global operations on all AudioNodes:
 * - Manages AudioNode creation and initialization from the palette
 * - Distributes MIDI keyboard events to NoteHandlers
 */
export class Synth {
	ac: ModernAudioContext;
	customNodes: { [key: string]: Function } = {};
	palette: NodePalette;
	noteHandlers: NoteHandler[] = [];

	constructor() {
		const CtxClass: any = window.AudioContext || window.webkitAudioContext;
		this.ac = new CtxClass();
		this.palette = palette;
		this.registerCustomNode('createADSR', ADSR);
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
			if (!anode[param])
				console.warn(`Parameter '${param}' not found for node ${type}'`)
			else if (anode[param] instanceof AudioParam)
				anode[param].value = def.params[param].initial;
			else
				anode[param] = def.params[param].initial;
	}

	registerCustomNode(constructorName: string, nodeClass: any) {
		this.customNodes[constructorName] = () => new nodeClass();
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


declare var window: ModernWindow;
