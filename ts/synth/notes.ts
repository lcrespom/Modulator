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
}

/**
 * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
 */
class BaseNoteHandler implements NoteHandler {
	ndata: NodeData;
	outTracker: OutputTracker;
	kbTrigger = false;
	releaseTime = 0;

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

	rampParam(param: MAudioParam, ratio: number, when: number): void {
		const portamento = this.ndata.synth.portamento;
		const newv = param.value * ratio;
		param._value = newv;	// Required for ADSR to capture the correct value
		if (portamento.time > 0 && portamento.ratio > 0) {
			const oldv = param.value * portamento.ratio;
			param.cancelScheduledValues(when);
			param.linearRampToValueAtTime(oldv, when);
			param.exponentialRampToValueAtTime(newv, when + portamento.time);
		}
		else param.setValueAtTime(newv, when);
	}
}

/**
 * Handles note events for an OscillatorNode
 */
class OscNoteHandler extends BaseNoteHandler {
	oscClone: OscillatorNode;
	lastNote: number;

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		if (this.oscClone) this.oscClone.stop(when);
		this.oscClone = <OscillatorNode>this.clone();
		this.rampParam(<MAudioParam>this.oscClone.frequency, ratio, when);
		this.oscClone.start(when);
		this.lastNote = midi;
	}

	noteOff(midi: number, gain: number, when: number): void {
		//TODO maybe get rid of noteEnd
		if (midi != this.lastNote) return;	// Avoid multple keys artifacts in mono mode
		this.noteEnd(midi, when + this.releaseTime);
	}

	noteEnd(midi: number, when: number): void {
		this.oscClone.stop(when);
		//TODO ensure that not disconnecting does not produce memory leaks,
		//	especially when ADSR controls frequency
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
		this.rampParam(<MAudioParam>pbr, pbr.value * ratio, when);
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
 * Performs computations about ramps so they can be easily rescheduled
 */
class Ramp {
	constructor(public v1: number, public v2: number, public t1: number, public t2: number) {}
	inside(t: number) {
		return this.t1 < this.t2 && this.t1 <= t && t <= this.t2;
	}
	cut(t: number) {
		const newv = this.v1 + (this.v2 - this.v1) * (t - this.t1) / (this.t2 - this.t1);
		return new Ramp(this.v1, newv, this.t1, t);
	}
	run(p: AudioParam, follow: boolean = false) {
		if (this.t2 - this.t1 <= 0) {
			p.setValueAtTime(this.v2, this.t2);
		}
		else {
			if (!follow) p.setValueAtTime(this.v1, this.t1);
			p.linearRampToValueAtTime(this.v2, this.t2);
		}
	}
}

interface MAudioParam extends AudioParam {
	_attack: Ramp;
	_decay: Ramp;
	_release: Ramp;
	_value: number;
}
/**
 * Handles note events for a custom ADSR node
 */
class ADSRNoteHandler extends BaseNoteHandler {
	lastNote: number;
	kbTrigger = true;

	constructor(ndata: NodeData) {
		super(ndata);
		const adsr: ADSR = <ADSR>ndata.anode;
		const oldMethod = adsr.disconnect;
		adsr.disconnect = (dest: AudioParam) => {
			this.loopParams(param => {
				if (param == dest)
					param.setValueAtTime(param._value, adsr.context.currentTime);
			});
			oldMethod(dest);
		}
	}

	get releaseTime() {
		const adsr: ADSR = <ADSR>this.ndata.anode;
		return adsr.release;
	}

	noteOn(midi: number, gain: number, ratio: number, when: number):void {
		this.lastNote = midi;
		const adsr: ADSR = <ADSR>this.ndata.anode;
		this.loopParams(param => {
			const v = this.getParamValue(param);
			const initial = (1 - adsr.depth) * v;
			const sustain = v * adsr.sustain + initial * (1 - adsr.sustain);
			const now = adsr.context.currentTime;
			param.cancelScheduledValues(now);
			if (when > now)
				this.rescheduleRamp(param, param._release, now);
			param._attack = new Ramp(initial, v, when, when + adsr.attack);
			param._decay = new Ramp(v, sustain, when + adsr.attack, when + adsr.attack + adsr.decay);
			param._attack.run(param);
			param._decay.run(param, true);
		});
	}

	noteOff(midi: number, gain: number, when: number): void {
		if (midi != this.lastNote) return;	// Avoid multple keys artifacts in mono mode
		const adsr: ADSR = <ADSR>this.ndata.anode;
		this.loopParams(param => {
			let v = this.getRampValueAtTime(param, when);
			if (v === null)
				v = this.getParamValue(param) * adsr.sustain;
			const finalv = (1 - adsr.depth) * v;
			param.cancelScheduledValues(when);
			const now = adsr.context.currentTime;
			if (when > now)
				this.rescheduleRamp(param, param._attack, now) ||
				this.rescheduleRamp(param, param._decay, now);
			param._release = new Ramp(v, finalv, when, when + adsr.release);
			param._release.run(param);
		});
	}

	rescheduleRamp(param: MAudioParam, ramp: Ramp, now: number): boolean {
		if (ramp && ramp.inside(now)) {
			ramp.cut(now).run(param);
			return true;
		}
		return false;
	}

	getRampValueAtTime(param: MAudioParam, t: number): number {
		let ramp;
		if (param._attack && param._attack.inside(t))
			return param._attack.cut(t).v2;
		if (param._decay && param._decay.inside(t))
			return param._decay.cut(t).v2;
		return null;
	}

	loopParams(cb: (out: MAudioParam) => void): void {
		for (const out of this.outTracker.outputs)
			if (out instanceof AudioParam)
				cb(<MAudioParam>out);
	}

	getParamValue(p: MAudioParam): number {
		if (p._value === undefined) p._value = p.value;
		return p._value;
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
