//TODO use independent code to build voice
import { SynthUI } from './synthUI';
import { ModernAudioContext } from './modern';
import { Node } from './graph';


export class Instrument {
	voices: Voice[];
	voiceNum: number;

	constructor(ac: ModernAudioContext, json: any, numVoices: number) {
		this.voices = [];
		for (let i = 0; i < numVoices; i++)
			this.voices.push(new Voice(ac, json));
		this.voiceNum = 0;
	}

	close() {
		for (const voice of this.voices)
			voice.close();
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


export class Voice {
	synthUI: SynthUI;
	lastNote: number;

	constructor(ac: ModernAudioContext, json: any) {
		const jqCanvas = $('<canvas width="100" height="100" style="display: none">');
		const dummyCanvas: HTMLCanvasElement = <HTMLCanvasElement>jqCanvas[0];
		this.synthUI = new SynthUI(ac, dummyCanvas, null, jqCanvas, jqCanvas);
		this.synthUI.gr.fromJSON(json);
		this.lastNote = 0;
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		this.synthUI.synth.noteOn(midi, velocity, ratio);
		this.lastNote = midi;
	}

	close() {
		if (this.lastNote) this.noteOff(this.lastNote, 1);
		const nodes: Node[] = this.synthUI.gr.nodes.slice();
		for (const node of nodes)
			this.synthUI.removeNode(node);
	}

	noteOff(midi: number, velocity: number): void {
		this.synthUI.synth.noteOff(midi, velocity);
		this.lastNote = 0;
	}
}
