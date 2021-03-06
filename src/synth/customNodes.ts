import { ModernAudioNode } from '../utils/modern'

/**
 * Base class to derive all custom nodes from it
 */
export class CustomNodeBase implements ModernAudioNode {
	custom = true
	channelCount = 2
	channelCountMode: ChannelCountMode = 'max'
	channelInterpretation: ChannelInterpretation = 'speakers'
	context: AudioContext
	numberOfInputs = 0
	numberOfOutputs = 1
	// Connect - disconnect
	connect(destination: AudioNode | AudioParam,
		output?: number, input?: number): AudioNode {
			return <AudioNode>destination
		}
	disconnect(destination: AudioNode | AudioParam,
		output?: number, input?: number): void {}
	// Required for extending EventTarget
	addEventListener() {}
	dispatchEvent(evt: Event): boolean { return false }
	removeEventListener() {}
}


/**
 * Envelope generator that controls the evolution over time of a destination
 * node's parameter. All parameter control is performed in the corresponding
 * ADSR note handler.
 */
export class ADSR extends CustomNodeBase {
	attack = 0.2
	decay = 0.5
	sustain = 0.5
	release = 1
	depth = 1
	// TODO linear / exponential
}


/**
 * Base ScriptProcessor, to derive all custom audio processing nodes from it.
 */
export class ScriptProcessor extends CustomNodeBase {
	gain = 1
	anode: ScriptProcessorNode
	playing = false

	constructor(ac: AudioContext) {
		super()
		this.anode = ac.createScriptProcessor(1024)
		this.anode.onaudioprocess = evt => this.processAudio(evt)
	}

	connect(node: AudioNode) {
		return this.anode.connect(node)
	}

	disconnect() {
		this.anode.disconnect()
	}

	start() {
		this.playing = true
	}

	stop() {
		this.playing = false
	}

	processAudio(evt: AudioProcessingEvent) {}
}


/**
 * Simple noise generator
 */
export class NoiseGenerator extends ScriptProcessor {
	processAudio(evt: AudioProcessingEvent) {
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			const out = evt.outputBuffer.getChannelData(channel)
			for (let sample = 0; sample < out.length; sample++)
				out[sample] = this.playing ? this.gain * (Math.random() * 2 - 1) : 0
		}
	}
}


/**
 * Noise generator to be used as control node.
 * It uses sample & hold in order to implement the 'frequency' parameter.
 */
export class NoiseCtrlGenerator extends ScriptProcessor {
	ac: AudioContext
	frequency: number
	depth: number
	sct: number
	v: number

	constructor(ac: AudioContext) {
		super(ac)
		this.ac = ac
		this.frequency = 4
		this.depth = 20
		this.sct = 0
		this.v = 0
	}

	connect(param: any) {
		return this.anode.connect(param)
	}

	processAudio(evt: AudioProcessingEvent) {
		const samplesPerCycle = this.ac.sampleRate / this.frequency
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel)
			for (let sample = 0; sample < out.length; sample++) {
				this.sct++
				if (this.sct > samplesPerCycle) {
					this.v = this.depth * (Math.random() * 2 - 1)
					this.sct = 0 // this.sct - Math.floor(this.sct);
				}
				out[sample] = this.v
			}
		}
	}
}


/**
 * Simple Pitch Shifter implemented in a quick & dirty way
 */
export class Detuner extends ScriptProcessor {
	octave = 0
	numberOfInputs = 1

	processAudio(evt: AudioProcessingEvent) {
		const dx = Math.pow(2, this.octave)
		for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			let out = evt.outputBuffer.getChannelData(channel)
			let inbuf = evt.inputBuffer.getChannelData(channel)
			let sct = 0
			for (let sample = 0; sample < out.length; sample++) {
				out[sample] = inbuf[Math.floor(sct)]
				sct += dx
				if (sct >= inbuf.length) sct = 0
			}
		}
	}
}


/**
 * Captures audio from the PC audio input.
 * Requires user's authorization to grab audio input.
 */
export class LineInNode extends CustomNodeBase {
	srcNode: ModernAudioNode
	dstNode: ModernAudioNode
	stream: any

	connect(anode: any) {
		if (this.srcNode) {
			this.srcNode.connect(anode)
			this.dstNode = anode
			return anode
		}
		const navigator: any = window.navigator
		navigator.getUserMedia = (navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia)
		navigator.getUserMedia({ audio: true }, (stream: any) => {
			const ac: any = anode.context
			this.srcNode = ac.createMediaStreamSource(stream)
			let a2: any = anode
			if (a2.custom && a2.anode) a2 = a2.anode
			this.srcNode.connect(a2)
			this.dstNode = anode
			this.stream = stream
		}, (error: any) => console.error(error))
	}

	disconnect() {
		this.srcNode.disconnect(this.dstNode)
	}
}
