import { Instrument } from '../synth/instrument';
import { Timer } from '../synth/timer';


export class Note {
	static NoteOn = 0;
	static NoteOff = 1;
	type: number;
	midi: number;
	velocity: number;
	constructor(type, midi, velocity = 1) {
		this.type = type;
		this.midi = midi;
		this.velocity = velocity;
	}
	static on(midi, velocity = 1): Note {
		return new Note(Note.NoteOn, midi, velocity);
	}
	static off(midi, velocity = 1): Note {
		return new Note(Note.NoteOff, midi, velocity);
	}
}

export class NoteRow {
	notes: Note[] = [];
	commands: any[] = [];
}

export class Part {
	name: string;
	instrument: Instrument;
	preset: any;
	rows: NoteRow[];
	timer: Timer;

	constructor(numRows: number) {
		this.rows = [];
		for (let i = 0; i < numRows; i++)
			this.rows.push(new NoteRow());
	}

	play(rowNum: number, bpm: number, cb: (rowNum: number) => void) {
		const audioCtx = this.instrument.voices[0].synth.ac;
		this.timer = new Timer(audioCtx, bpm);
		this.timer.start(when => {
			this.playRow(rowNum, when);
			cb(rowNum);
			rowNum++;
			if (rowNum > this.rows.length) this.timer.stop();
		});
	}

	stop() {
		this.timer.stop();
	}

	playRow(rowNum: number, when: number, offDelay = 0) {
		const row = this.rows[rowNum];
		if (!row) return;
		for (const note of row.notes) {
			if (note.type == Note.NoteOn) {
				this.instrument.noteOn(note.midi, note.velocity, when);
				if (offDelay)
					this.instrument.noteOff(note.midi, 1, when + offDelay);
			}
			else if (note.type == Note.NoteOff)
				this.instrument.noteOff(note.midi, note.velocity, when);
		}
	}

	playNote(note: Note, when, offDelay = 0.5) {
		this.instrument.noteOn(note.midi, note.velocity, when);
		this.instrument.noteOff(note.midi, 1, when + offDelay);
	}
}

export class Track {
	parts: Part[] = [];
}

export class Song {
	title: string;
	bpm: number;
	tracks: Track[] = [];
	parts: Part[] = [];
	timer: Timer;
	audioCtx: AudioContext;

	constructor(audioCtx: AudioContext) {
		this.audioCtx = audioCtx;
	}

	play() {
		this.timer = new Timer(this.audioCtx, this.bpm);
	}

	stop() {}

}
