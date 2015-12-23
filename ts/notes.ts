import { Node } from './graph';
import { NodeData } from './synthUI';
import { ADSR } from './synth';

export interface NoteHandler {
	noteOn(midi: number, gain: number, ratio: number):void;
	noteOff(midi: number, gain: number): void;
	noteEnd(midi: number): void;
}


class BaseNoteHandler implements NoteHandler {
	node: Node;
	outTracker: OutputTracker;

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
				anode[pname].value = data.anode[pname].value;
			else
				anode[pname] = data.anode[pname];
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

	disconnect(anode: AudioNode): void {
		// Disconnect outputs
		for (const out of this.outTracker.outputs)
			anode.disconnect(<any>out);
		// Disconnect control inputs
		for (const inNode of this.node.inputs) {
			const inData: NodeData = inNode.data;
			inNode.data.anode.disconnect(anode[inData.controlParam]);
		}
	}
}

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
		//TODO if ADSR is present, noteEnd will be generated by ADSR module
		if (midi != this.lastNote) return;
		this.noteEnd(midi);
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


class ADSRNoteHandler extends BaseNoteHandler {

	noteOn(midi: number, gain: number, ratio: number):void {
		const adsr: ADSR = this.node.data.anode;
		const now = adsr.context.currentTime;
		for (const out of this.outTracker.outputs)
			if (out instanceof AudioParam) {
				const v = this.getParamValue(out);
				out.cancelScheduledValues(now);
				out.linearRampToValueAtTime(0, now);
				out.linearRampToValueAtTime(v, now + adsr.attack);
				out.linearRampToValueAtTime(v * adsr.sustain, now + adsr.attack + adsr.decay);
			}
	}

	noteOff(midi: number, gain: number): void {
		const adsr: ADSR = this.node.data.anode;
		const now = adsr.context.currentTime;
		for (const out of this.outTracker.outputs)
			if (out instanceof AudioParam) {
				const v = this.getParamValue(out);
				out.cancelScheduledValues(now);
				out.linearRampToValueAtTime(0, now + adsr.release);
			}
	}

	noteEnd(midi: number): void {
	}

	getParamValue(p: AudioParam): number {
		if (p['_value'] === undefined) p['_value'] = p.value;
		return p['_value'];
	}
}


export const NoteHandlers = {
	'osc': OscNoteHandler,
	'ADSR': ADSRNoteHandler
};



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


export function removeArrayElement(a: any[], e: any): boolean {
	const pos = a.indexOf(e);
	if (pos < 0) return false;	// not found
	a.splice(pos, 1);
	return true;
}