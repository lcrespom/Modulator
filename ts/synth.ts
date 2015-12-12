export class Synth {
	ac: FullAudioContext;
	palette: any;

	constructor() {
		const CtxClass: any = window.AudioContext || window.webkitAudioContext;
		this.ac = new CtxClass();
		this.stop();
		this.palette = palette;
	}

	createNode(type: string): AudioNode {
		const def: NodeDef = palette[type];
		if (!def || !this.ac[def.constructor
		]) return null;
		const anode = this.ac[def.constructor]();
		for (const param of Object.keys(def.params || {}))
			anode[param] = def.params[param];
		for (const param of Object.keys(def.audioParams || {}))
			anode[param].value = def.audioParams[param];
		return anode;
	}

	play() {
		this.ac.resume();
	}

	stop() {
		this.ac.suspend();
	}
}

var palette = {
	Oscillator: {
		constructor: 'createOscillator',
		params: {
			type: 'sawtooth'
		},
		audioParams: {
			frequency: 220
		},
		paramTypes: {
			type: ['sine', 'square', 'sawtooth', 'triangle']
		}
	},
	Gain: {
		constructor: 'createGain',
		audioParams: {
			gain: 1
		}
	}
};


export interface NodeDef {
	constructor: string,
	params?: any,
	audioParams?: any,
	paramTypes?: any
}

interface WindowWithAudio extends Window {
	AudioContext: AudioContext,
	webkitAudioContext: AudioContext
}
declare var window: WindowWithAudio;

interface FullAudioContext extends AudioContext {
	suspend: () => void,
	resume: () => void,	
}