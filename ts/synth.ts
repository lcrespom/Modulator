import { NoteHandler, removeArrayElement } from './notes';

export class Synth {
	ac: ModernAudioContext;
	palette: NodePalette;
	noteHandlers: NoteHandler[] = [];

	constructor() {
		const CtxClass: any = window.AudioContext || window.webkitAudioContext;
		this.ac = new CtxClass();
		this.palette = palette;
	}

	createAudioNode(type: string): AudioNode {
		const def: NodeDef = palette[type];
		if (!def || !this.ac[def.constructor]) return null;
		const anode = this.ac[def.constructor]();
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
		for (const nh of this.noteHandlers)
			nh.noteOn(midi, gain, ratio);
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

}

export interface NodePalette {
	[key: string]: NodeDef;
}

export interface NodeDef {
	constructor: string;
	noteHandler?: string;
	control?: boolean;
	params: { [key: string]: NodeParamDef };
}

export interface NodeParamDef {
	initial: number | string;
	min?: number;
	max?: number;
	linear?: boolean;
	choices?: string[];
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
	// Sources
	Oscillator: {
		constructor: 'createOscillator',
		noteHandler: 'osc',
		params: {
			frequency: FREQUENCY,
			detune: OCTAVE_DETUNE,
			type: {
				initial: 'sawtooth',
				choices: ['sine', 'square', 'sawtooth', 'triangle']
			}
		}
	},
	// Effects
	Gain: {
		constructor: 'createGain',
		params: {
			gain: {
				initial: 1,
				min: 0,
				max: 10,
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
	Delay: {
		constructor: 'createDelay',
		params: {
			delayTime: {
				initial: 1,
				min: 0,
				max: 5
			}
		}
	},
	// Controllers
	LFO: {
		constructor: 'createOscillator',
		control: true,
		params: {
			frequency: {
				initial: 2,
				min: 0.01,
				max: 200
			},
			detune: OCTAVE_DETUNE,
			type: {
				initial: 'sine',
				choices: ['sine', 'square', 'sawtooth', 'triangle']
			}
		}
	},
	GainCtrl: {
		constructor: 'createGain',
		control: true,
		params: {
			gain: {
				initial: 10,
				min: 0,
				max: 1000,
				linear: true
			}
		}
	},
	// Output
	Speaker: {
		constructor: null,
		params: null
	}
};


//-------------------- Internal interfaces --------------------

interface ModernWindow extends Window {
	AudioContext: AudioContext,
	webkitAudioContext: AudioContext
}
declare var window: ModernWindow;

interface ModernAudioContext extends AudioContext {
	suspend: () => void,
	resume: () => void,
}