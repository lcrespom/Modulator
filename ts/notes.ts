import { Node } from './graph';
import { NodeData } from './synthUI';
import { ADSR } from './synth';
import { ModernAudioNode, removeArrayElement } from './modern';

/**
 * A note handler handles MIDI keyboard events on behalf of a synth node,
 * updating the node status accordingly.
 */
export interface NoteHandler {
	noteOn(midi: number, gain: number, ratio: number):void;
	noteOff(midi: number, gain: number): void;
	noteEnd(midi: number): void;
	kbTrigger: boolean;
	playAfterNoteOff: boolean;
	handlers: NoteHandler[];
}

/**
 * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
 */
class BaseNoteHandler implements NoteHandler {
	node: Node;
	outTracker: OutputTracker;
	kbTrigger = false;
	playAfterNoteOff = false;
	handlers = null;

	constructor(n: Node) {
		this.node = n;
		this.outTracker = new OutputTracker(n.data.anode);
	}

	noteOn(midi: number, gain: number, ratio: number):void {}
	noteOff(midi: number, gain: number): void {}
	noteEnd(midi: number): void {}

	clone(): AudioNode {
		const data: NodeData = this.node.data;
		// Create clone
		const anode = data.anode.context[data.nodeDef.constructor]();
		// Copy parameters
		for (const pname of Object.keys(data.nodeDef.params)) {
			const param = data.anode[pname];
			if (param instanceof AudioParam)
				anode[pname].value = param.value;
			else if (param !== null && param !== undefined)
				anode[pname] = param;
		}
		// Copy output connections
		for (const out of this.outTracker.outputs)
			anode.connect(out);
		// Copy control input connections
		for (const inNode of this.node.inputs) {
			const inData: NodeData = inNode.data;
			inNode.data.anode.connect(anode[inData.controlParam]);
		}
		//TODO should copy snapshot of list of inputs and outputs
		//...in case user connects or disconnects during playback
		return anode;
	}

	disconnect(anode: ModernAudioNode): void {
		// Disconnect outputs
		for (const out of this.outTracker.outputs)
			anode.disconnect(out);
		// Disconnect control inputs
		for (const inNode of this.node.inputs) {
			const inData: NodeData = inNode.data;
			inNode.data.anode.disconnect(anode[inData.controlParam]);
		}
	}
}

/**
 * Handles note events for an OscillatorNode
 */
class OscNoteHandler extends BaseNoteHandler {
	oscClone: OscillatorNode;
	lastNote: number;
	playing = false;

	noteOn(midi: number, gain: number, ratio: number):void {
		if (this.playing) this.noteEnd(midi);	// Because this is monophonic
		this.playing = true;
		this.oscClone = <OscillatorNode>this.clone();
		//TODO should also listen to value changes on original osc and apply them to clone
		this.oscClone.frequency.value = this.oscClone.frequency.value * ratio;
		this.oscClone.start();
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number): void {
		if (midi != this.lastNote) return;
		if (!this.playAfterNoteOff) this.noteEnd(midi);
	}

	noteEnd(midi: number): void {
		// Stop and disconnect
		if (!this.playing) return;
		this.playing = false;
		this.oscClone.stop();
		this.disconnect(this.oscClone);
		this.oscClone = null;
	}

}

/**
 * Handles note events for an AudioBufferSourceNode
 */
class BufferNoteHandler extends BaseNoteHandler {
	absn: AudioBufferSourceNode;
	lastNote: number;
	playing = false;

	noteOn(midi: number, gain: number, ratio: number):void {
		if (this.playing) this.noteEnd(midi);	// Because this is monophonic
		this.playing = true;
		this.absn = <AudioBufferSourceNode>this.clone();
		this.absn.buffer = this.node.data.anode._buffer;
		this.absn.playbackRate.value = this.absn.playbackRate.value * ratio;
		this.absn.start();
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number): void {
		if (midi != this.lastNote) return;
		if (!this.playAfterNoteOff) this.noteEnd(midi);
	}

	noteEnd(midi: number): void {
		// Stop and disconnect
		if (!this.playing) return;
		this.playing = false;
		this.absn.stop();
		this.disconnect(this.absn);
		this.absn = null;
	}

}

/**
 * Handles note events for a custom ADSR node
 */

class ADSRNoteHandler extends BaseNoteHandler {
	lastNote: number;
	kbTrigger = true;

	noteOn(midi: number, gain: number, ratio: number):void {
		this.setupOtherHandlers();
		this.lastNote = midi;
		const adsr: ADSR = this.node.data.anode;
		const now = adsr.context.currentTime;
		this.loopParams(out => {
			const v = this.getParamValue(out);
			out.cancelScheduledValues(now);
			out.linearRampToValueAtTime(0, now);
			out.linearRampToValueAtTime(v, now + adsr.attack);
			out.linearRampToValueAtTime(v * adsr.sustain, now + adsr.attack + adsr.decay);
		});
	}

	noteOff(midi: number, gain: number): void {
		if (midi != this.lastNote) return;
		const adsr: ADSR = this.node.data.anode;
		const now = adsr.context.currentTime;
		this.loopParams(out => {
			const v = out.value;	// Get the really current value
			out.cancelScheduledValues(now);
			out.linearRampToValueAtTime(v, now);
			out.linearRampToValueAtTime(0, now + adsr.release);
			//setTimeout(_ => this.sendNoteEnd(midi), adsr.release * 2000);
		});
	}

	noteEnd(midi: number): void {}

	sendNoteEnd(midi: number): void {
		for (const nh of this.handlers) nh.noteEnd(midi);
	}

	setupOtherHandlers() {
		//TODO should set to false when ADSR node is removed
		for (const nh of this.handlers) nh.playAfterNoteOff = true;
	}

	loopParams(cb: (out: AudioParam) => void): void {
		for (const out of this.outTracker.outputs)
			if (out instanceof AudioParam)
				cb(out);
	}

	getParamValue(p: AudioParam): number {
		if (p['_value'] === undefined) p['_value'] = p.value;
		return p['_value'];
	}
}

/**
 * Exports available note handlers so they are used by their respective
 * nodes from the palette.
 */
export const NoteHandlers = {
	'osc': OscNoteHandler,
	'buffer': BufferNoteHandler,
	'ADSR': ADSRNoteHandler
};


/**
 * Tracks a node output connections and disconnections, to be used
 * when cloning, removing or controlling nodes.
 */
class OutputTracker {
	outputs: (AudioNode | AudioParam) [] = [];

	constructor(anode: AudioNode) {
		this.onBefore(anode, 'connect', this.connect);
		this.onBefore(anode, 'disconnect', this.disconnect);
	}

	connect(np) {
		this.outputs.push(np);
	}

	disconnect(np) {
		removeArrayElement(this.outputs, np);
	}

	onBefore(obj: any, fname: string, funcToCall: Function) {
		const oldf = obj[fname];
		const self = this;
		obj[fname] = function() {
			funcToCall.apply(self, arguments);
			oldf.apply(obj, arguments);
		}
	}
}
