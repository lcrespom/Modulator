import { Keyboard } from './keyboard';
import { PianoKeyboard } from './piano';
import { Arpeggiator } from './arpeggiator';

import { NodeData } from '../synth/synth';
import { SynthUI } from '../synthUI/synthUI';
import { Instrument } from '../synth/instrument';

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
	piano: PianoKeyboard;
	arpeggiator: Arpeggiator;

	constructor(synthUI: SynthUI) {
		this.synthUI = synthUI;
		this.poly = false;
		// Setup piano panel
		var piano = new PianoKeyboard($('#piano'));
		this.piano = piano;
		piano.noteOn = (midi, ratio) => this.arpeggiator.sendNoteOn(midi, 1, ratio);
		piano.noteOff = (midi) => this.arpeggiator.sendNoteOff(midi, 1);
		// Register poly on/off handlers
		piano.polyOn = () => this.polyOn();
		piano.polyOff = () => this.polyOff();
		// Setup PC keyboard
		var kb = new Keyboard();
		kb.noteOn = (midi, ratio) => {
			if (document.activeElement.nodeName == 'INPUT' &&
				document.activeElement.getAttribute('type') != 'range') return;
			this.arpeggiator.sendNoteOn(midi, 1, ratio);
			piano.displayKeyDown(midi);
		};
		kb.noteOff = (midi) => {
			this.arpeggiator.sendNoteOff(midi, 1);
			piano.displayKeyUp(midi);
		};
		// Bind piano octave with PC keyboard
		kb.baseNote = piano.baseNote;
		piano.octaveChanged = baseNote => kb.baseNote = baseNote;
		this.setupEnvelopeAnimation(piano);
		// Setup arpeggiator
		this.setupArpeggiator(piano);
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

	setupArpeggiator(piano: PianoKeyboard) {
		this.arpeggiator = new Arpeggiator();
		piano.arpeggioChanged = (time, mode, octaves) => {
			this.arpeggiator.mode = mode;
			this.arpeggiator.octaves = octaves;
			this.arpeggiator.time = time;
		}
		this.arpeggiator.noteOn =
			(midi, velocity, ratio) => this.noteOn(midi, velocity, ratio);
		this.arpeggiator.noteOff =
			(midi, velocity) => this.noteOff(midi, velocity);
	}


	noteOn(midi: number, velocity: number, ratio: number): void {
		this.lastNote = midi;
		const portamento = this.piano.getPortamento();
		if (this.poly) {
			this.instrument.portamento.time = portamento;
			this.instrument.noteOn(midi, velocity, ratio);
		}
		else {
			this.synthUI.synth.portamento.time = portamento;
			this.synthUI.synth.noteOn(midi, velocity, ratio);
		}
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