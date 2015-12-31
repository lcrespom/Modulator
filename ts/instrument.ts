//TODO use independent code to build voice
import { SynthUI } from './synthUI';

export class Instrument {
	voices: Voice[];
	voiceNum: number;

	constructor(json: any, numVoices: number) {
		this.voices = [];
		for (let i = 0; i < numVoices; i++)
			this.voices.push(new Voice(json));
		this.voiceNum = 0;
	}

	close() {
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		const voice = this.voices[this.voiceNum];
		voice.noteOn(midi, velocity, ratio);
		this.voiceNum = (this.voiceNum + 1) % this.voices.length;
	}

	noteOff(midi: number, velocity: number): void {
		for (const voice of this.voices) {
			if (voice.lastNote == midi) {
				voice.noteOff(midi, velocity);
				break;
			}
		}
	}

}

//TODO fix canvas problem
//TODO use a more global audio context

export class Voice {
	synthUI: SynthUI;
	lastNote: number;

	constructor(json: any) {
		const jqCanvas = $('<canvas width="100" height="100" style="display: none">');
		const dummyCanvas: HTMLCanvasElement = <HTMLCanvasElement>jqCanvas[0];
		this.synthUI = new SynthUI(dummyCanvas, null);
		//this.synthUI = new SynthUI(null, null);
		this.synthUI.gr.fromJSON(json);
		this.lastNote = 0;
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		this.synthUI.synth.noteOn(midi, velocity, ratio);
		this.lastNote = midi;
	}

	noteOff(midi: number, velocity: number): void {
		this.synthUI.synth.noteOff(midi, velocity);
		this.lastNote = 0;
	}
}