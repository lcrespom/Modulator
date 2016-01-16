import { Keyboard } from './keyboard';
import { MidiKeyboard } from './midi';
import { PianoKeyboard } from './piano';
import { Arpeggiator } from './arpeggiator';

import { NodeData } from '../synth/synth';
import { SynthUI } from '../synthUI/synthUI';
import { Instrument } from '../synth/instrument';

const NUM_VOICES = 8;

/**
 * Manages all note-generation inputs:
 * 	- PC Keyboard
 * 	- Virtual piano keyboard
 *	- An external MIDI keyboard
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
		piano.noteOn = (midi) => this.arpeggiator.sendNoteOn(midi, 1);
		piano.noteOff = (midi) => this.arpeggiator.sendNoteOff(midi, 1);
		// Register poly on/off handlers
		piano.polyOn = () => this.polyOn();
		piano.polyOff = () => this.polyOff();
		// Setup PC keyboard
		var kb = this.setupPCKeyboard(piano);
		// Bind piano octave with PC keyboard
		kb.baseNote = piano.baseNote;
		piano.octaveChanged = baseNote => kb.baseNote = baseNote;
		this.setupEnvelopeAnimation(piano);
		// Setup arpeggiator
		this.setupArpeggiator(piano, synthUI.synth.ac);
		// Setup MIDI keyboard
		this.setupMidiKeyboard(piano);
	}

	setupPCKeyboard(piano: PianoKeyboard): Keyboard {
		var kb = new Keyboard();
		kb.noteOn = (midi) => {
			if (document.activeElement.nodeName == 'INPUT' &&
				document.activeElement.getAttribute('type') != 'range') return;
			this.arpeggiator.sendNoteOn(midi, 1);
			piano.displayKeyDown(midi);
		};
		kb.noteOff = (midi) => {
			this.arpeggiator.sendNoteOff(midi, 1);
			piano.displayKeyUp(midi);
		};
		return kb;
	}

	setupMidiKeyboard(piano: PianoKeyboard) {
		var midi = new MidiKeyboard();
		midi.noteOn = (midi: number, velocity: number, channel: number): void => {
			this.arpeggiator.sendNoteOn(midi, 1);
			piano.displayKeyDown(midi);
		};
		midi.noteOff = (midi: number, velocity: number, channel: number): void => {
			this.arpeggiator.sendNoteOff(midi, 1);
			piano.displayKeyUp(midi);
		};
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

	setupArpeggiator(piano: PianoKeyboard, ac: AudioContext) {
		this.arpeggiator = new Arpeggiator(ac);
		piano.arpeggioChanged = (bpm, mode, octaves) => {
			this.arpeggiator.mode = mode;
			this.arpeggiator.octaves = octaves;
			this.arpeggiator.bpm = bpm;
		}
		this.arpeggiator.noteOn =
			(midi, velocity, time) => this.noteOn(midi, velocity, time);
		this.arpeggiator.noteOff =
			(midi, velocity, time) => this.noteOff(midi, velocity, time);
	}


	noteOn(midi: number, velocity: number, time?: number): void {
		this.lastNote = midi;
		const portamento = this.piano.getPortamento();
		if (this.poly) {
			this.instrument.portamento.time = portamento;
			this.instrument.noteOn(midi, velocity, time);
		}
		else {
			this.synthUI.synth.portamento.time = portamento;
			this.synthUI.synth.noteOn(midi, velocity, time);
		}
	}

	noteOff(midi: number, velocity: number, time?: number): void {
		this.lastNote = 0;
		if (this.poly)
			this.instrument.noteOff(midi, velocity, time);
		else
			this.synthUI.synth.noteOff(midi, velocity, time);
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