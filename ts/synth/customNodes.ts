import { ModernAudioContext, ModernAudioNode } from './modern';

/**
 * Base class to derive all custom nodes from it
 */
class CustomNodeBase implements ModernAudioNode {
	custom = true;
	channelCount = 2;
	channelCountMode = 'max';
	channelInterpretation = 'speakers';
	context: AudioContext;
	numberOfInputs = 0;
	numberOfOutputs = 1;
	connect(param: AudioParam | AudioNode) {}
	disconnect(dest: AudioNode | AudioParam) {}
	// Required for extending EventTarget
	addEventListener(){}
	dispatchEvent(evt: Event): boolean { return false; }
	removeEventListener(){}
}


/**
 * Envelope generator that controls the evolution over time of a destination
 * node's parameter. All parameter control is performed in the corresponding
 * ADSR note handler.
 */
export class ADSR extends CustomNodeBase {
	attack: number = 0.2;
	decay: number = 0.5;
	sustain: number = 0.5;
	release: number = 1;
	depth: number = 1;
	//TODO linear / exponential
}


/**
 * Base ScriptProcessor, to derive all custom audio processing nodes from it.
 */
class ScriptProcessor extends CustomNodeBase {
	gain: number = 1;
	anode: ScriptProcessorNode;
	playing: boolean = false;

	constructor(ac: AudioContext) {
		super();
		this.anode = ac.createScriptProcessor(1024);
		this.anode.onaudioprocess = evt => this.processAudio(evt);
	}

	connect(node: AudioNode) {
		this.anode.connect(node);
	}

	disconnect() {
		this.anode.disconnect();
	}

	start() {
		this.playing = true;
	}

	stop() {
		this.playing = false;
	}

	processAudio(evt: AudioProcessingEvent) {}
}


/**
 * Simple noise generator
 */
export class NoiseGenerator extends ScriptProcessor {
	processAudio(evt: AudioProcessingEvent) {
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel);
			for (let sample = 0; sample < out.length; sample++)
				out[sample] = this.playing ? this.gain * (Math.random() * 2 - 1) : 0;
		}
	}
}


/**
 * Noise generator to be used as control node.
 * It uses sample & hold in order to implement the 'frequency' parameter.
 */
export class NoiseCtrlGenerator extends ScriptProcessor {
	ac: ModernAudioContext;
	frequency: number;
	depth: number;
	sct: number;
	v: number;

	constructor(ac: ModernAudioContext) {
		super(ac);
		this.ac = ac;
		this.frequency = 4;
		this.depth = 20;
		this.sct = 0;
		this.v = 0;
	}

	connect(param: any) {
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


/**
 * Simple Pitch Shifter implemented in a quick & dirty way
 */
export class Detuner extends ScriptProcessor {
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


/**
 * Captures audio from the PC audio input.
 * Requires user's authorization to grab audio input.
 */
export class LineInNode extends CustomNodeBase {
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
