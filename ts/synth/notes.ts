import { NodeData } from './synth';
import { ADSR } from './customNodes';
import { ModernAudioNode, removeArrayElement } from './modern';


/**
 * A note handler handles MIDI keyboard events on behalf of a synth node,
 * updating the node status accordingly.
 */
export interface NoteHandler {
	noteOn(midi: number, gain: number, ratio: number, when: number):void;
	noteOff(midi: number, gain: number, when: number): void;
	noteEnd(midi: number, when: number): void;
	kbTrigger: boolean;
	releaseTime: number;
	handlers: NoteHandler[];
}

/**
 * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
 */
class BaseNoteHandler implements NoteHandler {
	ndata: NodeData;
	outTracker: OutputTracker;
	kbTrigger = false;
	releaseTime = 0;
	handlers: NoteHandler[] = null;

	constructor(ndata: NodeData) {
		this.ndata = ndata;
		this.outTracker = new OutputTracker(ndata.anode);
	}

	noteOn(midi: number, gain: number, ratio: number, when: number):void {}
	noteOff(midi: number, gain: number, when: number): void {}
	noteEnd(midi: number, when: number): void {}

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

	rampParam(param: AudioParam, ratio: number, when: number): void {
		const portamento = this.ndata.synth.portamento;
		const newv = param.value * ratio;
		param['_value'] = newv;	// Required for ADSR to capture the correct value
		if (portamento.time > 0 && portamento.ratio > 0) {
			const oldv = param.value * portamento.ratio;
			param.cancelScheduledValues(when);
			param.linearRampToValueAtTime(oldv, when);
			param.exponentialRampToValueAtTime(newv, when + portamento.time);
		}
		else param.setValueAtTime(newv, when);
	}
}

var firstWhen = -1;
/**
 * Handles note events for an OscillatorNode
 */
class OscNoteHandler extends BaseNoteHandler {
	oscClone: OscillatorNode;
	lastNote: number;
	playing = false;

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		if (firstWhen < 0) firstWhen = when;
		console.log(`> noteOn: midi=${midi}, when=${when - firstWhen}`);
		//  if (this.playing)
		//  	this.noteEnd(midi, when - 0.01);
		if (this.oscClone) this.oscClone.stop(when);
		this.playing = true;
		this.oscClone = <OscillatorNode>this.clone();
		this.rampParam(this.oscClone.frequency, ratio, when);
		this.oscClone.start(when);
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number, when: number): void {
		console.log(`> noteOff: midi=${midi}, when=${when - firstWhen}`);
		if (midi != this.lastNote) return;
		this.noteEnd(midi, when + this.releaseTime);
	}

	noteEnd(midi: number, when: number): void {
		console.log(`> noteEnd: midi=${midi}, when=${when - firstWhen}`);
		// Stop and disconnect
		if (!this.playing) return;
		this.playing = false;
		this.oscClone.stop(when);
		//TODO ensure that not disconnecting does not produce memory leaks
		// this.disconnect(this.oscClone);
		// this.oscClone = null;
	}
}

/**
 * Handles note events for an LFO node. This is identical to a regular
 * oscillator node, but the note does not affect the oscillator frequency
 */
class LFONoteHandler extends OscNoteHandler {
	rampParam(param: AudioParam, ratio: number, when: number) {
		// Disable portamento for LFO
		param.setValueAtTime(param.value, when);
	}
}

/**
 * Handles note events for an AudioBufferSourceNode
 */
class BufferNoteHandler extends BaseNoteHandler {
	absn: AudioBufferSourceNode;
	lastNote: number;
	playing = false;

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		if (this.playing)
			this.noteEnd(midi, when);
		const buf = this.ndata.anode['_buffer'];
		if (!buf) return;	// Buffer still loading or failed
		this.playing = true;
		this.absn = <AudioBufferSourceNode>this.clone();
		this.absn.buffer = buf;
		const pbr = this.absn.playbackRate;
		const newRate = pbr.value * ratio;
		this.rampParam(pbr, pbr.value * ratio, when);
		this.absn.start(when);
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number, when: number): void {
		if (midi != this.lastNote) return;
		this.noteEnd(midi, when + this.releaseTime);
	}

	noteEnd(midi: number, when: number): void {
		// Stop and disconnect
		if (!this.playing) return;
		this.playing = false;
		this.absn.stop(when);
		//TODO ensure that not disconnecting does not produce memory leaks
		// this.disconnect(this.absn);
		// this.absn = null;
	}

}


/**
 * Handles note events for a custom ADSR node
 */
class ADSRNoteHandler extends BaseNoteHandler {
	lastNote: number;
	kbTrigger = true;

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		this.lastNote = midi;
		const adsr: ADSR = <ADSR>this.ndata.anode;
		this.setupOtherHandlers(adsr);
		this.loopParams(out => {
			const v = this.getParamValue(out);
			out.cancelScheduledValues(when);
			const initial = (1 - adsr.depth) * v;
			out.linearRampToValueAtTime(initial, when);
			out.linearRampToValueAtTime(v, when + adsr.attack);
			const target = v * adsr.sustain + initial * (1 - adsr.sustain);
			out.linearRampToValueAtTime(target, when + adsr.attack + adsr.decay);
		});
	}

	noteOff(midi: number, gain: number, when: number): void {
		if (midi != this.lastNote) return;
		const adsr: ADSR = <ADSR>this.ndata.anode;
		this.loopParams(out => {
			const v = out.value;	// Get the really current value
			const finalv = (1 - adsr.depth) * v;
			out.cancelScheduledValues(when);
			out.linearRampToValueAtTime(v, when);
			out.linearRampToValueAtTime(finalv, when + adsr.release);
		});
	}

	setupOtherHandlers(adsr: ADSR) {
		//TODO should be set to 0 when ADSR node is removed
		//	or more in general, to the longest release time of all
		//	remaining ADSR nodes in the graph 
		//TODO this code should be moved up to the synth level, which
		//	should keep track of the ADSR node with the longest release time, etc.
		for (const nh of this.handlers) nh.releaseTime = adsr.release;
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

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		if (this.playing)
			this.noteEnd(midi, when);
		this.playing = true;
		const anode: any = this.ndata.anode;
		anode.start(when);
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number, when: number): void {
		if (midi != this.lastNote) return;
		this.noteEnd(midi, when + this.releaseTime);
	}

	noteEnd(midi: number, when: number): void {
		if (!this.playing) return;
		this.playing = false;
		const anode: any = this.ndata.anode;
		anode.stop(when);
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
