import { Keyboard } from './keyboard';
import { PianoKeyboard } from './piano';
import { SynthUI, NodeData } from './synthUI';
import { Instrument } from './instrument';

const NUM_VOICES = 5;

/**
 * Manages all note-generation inputs:
 * 	- PC Keyboard
 * 	- Virtual piano keyboard
 *	- Eventually it should also integrate with Web MIDI
 * Handles switching to polyphonic mode and back to mono
 */
export class NoteInputs {
	synthUI: SynthUI;
	poly: boolean;
	instrument: Instrument;
	lastNote: number;

	constructor(synthUI: SynthUI) {
		this.synthUI = synthUI;
		this.poly = false;
		// Setup piano panel
		var piano = new PianoKeyboard($('#piano'));
		piano.noteOn = (midi, ratio) => this.noteOn(midi, 1, ratio);
		piano.noteOff = (midi) => this.noteOff(midi, 1);
		// Register poly on/off handlers
		piano.polyOn = () => this.polyOn();
		piano.polyOff = () => this.polyOff();
		// Setup PC keyboard
		var kb = new Keyboard();
		kb.noteOn = (midi, ratio) => {
			if (document.activeElement.nodeName == 'INPUT' &&
				document.activeElement.getAttribute('type') != 'range') return;
			this.noteOn(midi, 1, ratio);
			piano.displayKeyDown(midi);
		};
		kb.noteOff = (midi) => {
			this.noteOff(midi, 1);
			piano.displayKeyUp(midi);
		};
		// Bind piano octave with PC keyboard
		kb.baseNote = piano.baseNote;
		piano.octaveChanged = baseNote => kb.baseNote = baseNote;
		this.setupEnvelopeAnimation(piano);
	}

	setupEnvelopeAnimation(piano: PianoKeyboard) {
		const loaded = this.synthUI.gr.handler.graphLoaded;
		this.synthUI.gr.handler.graphLoaded = function() {
			loaded.bind(this.synthUI.gr.handler)();
			let adsr = null;
			for (const node of this.synthUI.gr.nodes) {
				const data: NodeData = node.data;
				if (data.type == 'ADSR') {
					adsr = data.anode;
					break;
				}
			}
			piano.setEnvelope(adsr || { attack: 0, release: 0 });
		}
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		this.lastNote = midi;
		if (this.poly)
			this.instrument.noteOn(midi, velocity, ratio);
		else
			this.synthUI.synth.noteOn(midi, velocity, ratio);
	}

	noteOff(midi: number, velocity: number): void {
		this.lastNote = 0;
		if (this.poly)
			this.instrument.noteOff(midi, velocity);
		else
			this.synthUI.synth.noteOff(midi, velocity);
	}

	polyOn() {
		if (this.lastNote) this.noteOff(this.lastNote, 1);
		this.poly = true;
		const json = this.synthUI.gr.toJSON();
		this.instrument = new Instrument(this.synthUI.synth.ac, json, NUM_VOICES);
	}

	polyOff() {
		this.poly = false;
		this.instrument.close();
	}
}