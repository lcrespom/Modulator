import { NodeData } from './synth';
import { ADSR } from './customNodes';
import { ModernAudioNode, removeArrayElement } from './modern';


/**
 * A note handler handles MIDI keyboard events on behalf of a synth node,
 * updating the node status accordingly.
 */
export interface NoteHandler {
	noteOn(midi: number, gain: number, ratio: number, portamento: number):void;
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
	ndata: NodeData;
	outTracker: OutputTracker;
	kbTrigger = false;
	playAfterNoteOff = false;
	handlers = null;

	constructor(ndata: NodeData) {
		this.ndata = ndata;
		this.outTracker = new OutputTracker(ndata.anode);
	}

	noteOn(midi: number, gain: number, ratio: number, portamento: number):void {}
	noteOff(midi: number, gain: number): void {}
	noteEnd(midi: number): void {}

	clone(): AudioNode {
		// Create clone
		const anode = this.ndata.anode.context[this.ndata.nodeDef.constructor]();
		// Copy parameters
		for (const pname of Object.keys(this.ndata.nodeDef.params)) {
			const param = this.ndata.anode[pname];
			if (param instanceof AudioParam)
				anode[pname].value = param.value;
			else if (param !== null && param !== undefined)
				anode[pname] = param;
		}
		// Copy output connections
		for (const out of this.outTracker.outputs) {
			let o2: any = out;
			if (o2.custom && o2.anode) o2 = o2.anode;
			anode.connect(o2);
		}
		// Copy control input connections
		for (const inData of this.ndata.getInputs()) {
			inData.anode.connect(anode[inData.controlParam]);
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
		for (const inData of this.ndata.getInputs()) {
			inData.anode.disconnect(anode[inData.controlParam]);
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
	oldfreq = 0;

	noteOn(midi: number, gain: number, ratio: number, portamento: number):void {
		if (this.playing) this.noteEnd(midi);	// Because this is monophonic
		this.playing = true;
		this.oscClone = <OscillatorNode>this.clone();
		const fparam = this.oscClone.frequency;
		const newFreq = fparam.value * ratio;
		if (portamento > 0 && this.oldfreq > 0) {
			const now = this.oscClone.context.currentTime;
			fparam.cancelScheduledValues(now);
			fparam.linearRampToValueAtTime(this.oldfreq, now);
			fparam.exponentialRampToValueAtTime(newFreq, now + portamento);
		}
		else fparam.value = newFreq;
		this.oscClone.start();
		this.oldfreq = newFreq;
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
 * Handles note events for an LFO node. This is identical to a regular
 * oscillator node, but the note does not affect the oscillator frequency
 */
class LFONoteHandler extends OscNoteHandler {
	noteOn(midi: number, gain: number, ratio: number):void {
		super.noteOn(midi, gain, 1, 0);
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
		if (this.playing) this.noteEnd(midi);
		const buf = this.ndata.anode['_buffer'];
		if (!buf) return;	// Buffer still loading or failed
		this.playing = true;
		this.absn = <AudioBufferSourceNode>this.clone();
		this.absn.buffer = buf;
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
		const adsr: ADSR = <ADSR>this.ndata.anode;
		const now = adsr.context.currentTime;
		this.loopParams(out => {
			const v = this.getParamValue(out);
			out.cancelScheduledValues(now);
			const initial = (1 - adsr.depth) * v;
			out.linearRampToValueAtTime(initial, now);
			out.linearRampToValueAtTime(v, now + adsr.attack);
			const target = v * adsr.sustain + initial * (1 - adsr.sustain);
			out.linearRampToValueAtTime(target, now + adsr.attack + adsr.decay);
		});
	}

	noteOff(midi: number, gain: number): void {
		if (midi != this.lastNote) return;
		const adsr: ADSR = <ADSR>this.ndata.anode;
		const now = adsr.context.currentTime;
		this.loopParams(out => {
			const v = out.value;	// Get the really current value
			const finalv = (1 - adsr.depth) * v;
			out.cancelScheduledValues(now);
			out.linearRampToValueAtTime(v, now);
			out.linearRampToValueAtTime(finalv, now + adsr.release);
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
 * Handles note events for any node that allows calling start() after stop(),
 * such as custom nodes.
 */
class RestartableNoteHandler extends BaseNoteHandler {
	lastNote: number;
	playing = false;

	noteOn(midi: number, gain: number, ratio: number):void {
		if (this.playing) this.noteEnd(midi);
		this.playing = true;
		const anode: any = this.ndata.anode;
		anode.start();
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
		const anode: any = this.ndata.anode;
		anode.stop();
	}
}

/**
 * Exports available note handlers so they are used by their respective
 * nodes from the palette.
 */
export const NoteHandlers = {
	'osc': OscNoteHandler,
	'buffer': BufferNoteHandler,
	'ADSR': ADSRNoteHandler,
	'LFO': LFONoteHandler,
	'restartable': RestartableNoteHandler
};


/**
 * Tracks a node output connections and disconnections, to be used
 * when cloning, removing or controlling nodes.
 */
class OutputTracker {
	outputs: (AudioNode | AudioParam) [] = [];

	constructor(anode: AudioNode) {
		this.onBefore(anode, 'connect', this.connect, (oldf, obj, args) => {
			if (args[0].custom && args[0].anode) args[0] = args[0].anode;
			oldf.apply(obj, args);
		});
		this.onBefore(anode, 'disconnect', this.disconnect);
	}

	connect(np) {
		this.outputs.push(np);
	}

	disconnect(np) {
		removeArrayElement(this.outputs, np);
	}

	onBefore(obj: any, fname: string, funcToCall: Function, cb?: (oldf, obj, args) => void): void {
		const oldf = obj[fname];
		const self = this;
		obj[fname] = function() {
			funcToCall.apply(self, arguments);
			if (cb) cb(oldf, obj, arguments)
			else oldf.apply(obj, arguments);
		}
	}
}
