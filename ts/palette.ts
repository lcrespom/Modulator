/** Configuration data for an AudioNode parameter */
export interface NodeParamDef {
	initial: number | string;
	min?: number;
	max?: number;
	linear?: boolean;
	choices?: string[];
}

/** Configuration data for an AudioNode */
export interface NodeDef {
	constructor: string;
	custom?: boolean;
	noteHandler?: string;
	control?: boolean;
	params: { [key: string]: NodeParamDef };
}

/** A set of AudioNode configuration elements */
export interface NodePalette {
	[key: string]: NodeDef;
}

//-------------------- Node palette definition --------------------

const OCTAVE_DETUNE: NodeParamDef = {
	initial: 0,
	min: -1200,
	max: 1200,
	linear: true
};

/**
 * The set of AudioNodes available to the application, along with
 * their configuration.
 */
export var palette: NodePalette = {
	// Sources
	Oscillator: {
		constructor: 'createOscillator',
		noteHandler: 'osc',
		params: {
			frequency: { initial: 220, min: 20, max: 20000 },
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
			gain: { initial: 1, min: 0, max: 10, linear: true }
		}
	},
	Filter: {
		constructor: 'createBiquadFilter',
		params: {
			frequency: { initial: 440, min: 20, max: 20000 },
			Q: { initial: 0, min: 0, max: 100 },
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
			delayTime: { initial: 1, min: 0, max: 5 }
		}
	},
	// Controllers
	LFO: {
		constructor: 'createOscillator',
		control: true,
		params: {
			frequency: { initial: 5, min: 0.01, max: 200 },
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
			gain: { initial: 10, min: 0, max: 1000, linear: true }
		}
	},
	// Output
	Speaker: {
		constructor: null,
		params: null
	},
	// Custom
	ADSR: {
		constructor: 'createADSR',
		noteHandler: 'ADSR',
		control: true,
		custom: true,
		params: {
			attack:  { initial: 0.2, min: 0, max: 10 },
			decay:   { initial: 0.5, min: 0, max: 10 },
			sustain: { initial: 0.5, min: 0, max: 1, linear: true },
			release: { initial: 1.0, min: 0, max: 10 },
		}
	}

};
