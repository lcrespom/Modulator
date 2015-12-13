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
		if (!def || !this.ac[def.constructor]) return null;
		const anode = this.ac[def.constructor]();
		for (const param of Object.keys(def.params || {}))
			if (!anode[param])
				console.warn(`Parameter '${param}' not found for node ${type}'`)
			else if (anode[param] instanceof AudioParam)
				anode[param].value = def.params[param].initial;
			else
				anode[param] = def.params[param].initial;
		return anode;
	}

	play() {
		this.ac.resume();
	}

	stop() {
		this.ac.suspend();
	}
}

export interface NodePalette {
	[key: string]: NodeDef
}

export interface NodeDef {
	constructor: string,
	params: { [key: string]: NodeParamDef }
}

export interface NodeParamDef {
	initial: number | string,
	min?: number,
	max?: number,
	linear?: boolean,
	choices?: string[]
}

//-------------------- Node palette definition --------------------

const OCTAVE_DETUNE: NodeParamDef = {
	initial: 0,
	min: -1200,
	max: 1200,
	linear: true
};

const FREQUENCY: NodeParamDef = {
	initial: 220,
	min: 20,
	max: 20000
};

var palette: NodePalette = {
	Oscillator: {
		constructor: 'createOscillator',
		params: {
			frequency: FREQUENCY,
			detune: OCTAVE_DETUNE,
			type: {
				initial: 'sawtooth',
				choices: ['sine', 'square', 'sawtooth', 'triangle']
			}
		}
	},
	Gain: {
		constructor: 'createGain',
		params: {
			gain: {
				initial: 1,
				min: 0,
				max: 1,
				linear: true
			}
		}
	},
	Filter: {
		constructor: 'createBiquadFilter',
		params: {
			frequency: FREQUENCY,
			Q: {
				initial: 0,
				min: 0,
				max: 100
			},
			//TODO gain
			detune: OCTAVE_DETUNE,
			type: {
				initial: 'lowpass',
				choices: ['lowpass', 'highpass', 'bandpass',
					'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
			}
		},
	},
	Speaker: {
		constructor: null,
		params: null
	}
};


//-------------------- Internal interfaces --------------------

interface WindowWithAudio extends Window {
	AudioContext: AudioContext,
	webkitAudioContext: AudioContext
}
declare var window: WindowWithAudio;

interface FullAudioContext extends AudioContext {
	suspend: () => void,
	resume: () => void,
}