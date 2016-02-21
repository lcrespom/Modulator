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
	partNum: number;
	rowNum: number;
	currentInstrument: Instrument;

	constructor() {
		this.reset();
	}

	playRow(when: number) {
		if (this.partNum >= this.parts.length) return false;
		const part = this.parts[this.partNum];
		this.currentInstrument = part.instrument;
		part.playRow(this.rowNum, when);
		this.rowNum++;
		if (this.rowNum >= part.rows.length)
			this.partNum++;
		return true;
	}

	reset() {
		this.partNum = 0;
		this.rowNum = 0;
	}

	allNotesOff() {
		if (this.currentInstrument)
			this.currentInstrument.allNotesOff();
	}
}


export class Song {
	title: string;
	_bpm: number;
	tracks: Track[] = [];
	parts: Part[] = [];
	audioCtx: AudioContext;
	timer: Timer;
	playing: boolean;

	constructor(audioCtx: AudioContext) {
		this.playing = false;
		this.audioCtx = audioCtx;
	}

	get bpm() { return this._bpm; }

	set bpm(v) {
		this._bpm = v;
		if (this.timer) this.timer.bpm = v;
	}

	play(cb: () => void) {
		this.timer = new Timer(this.audioCtx, this.bpm);
		this.timer.start(when => {
			this.playing = false;
			for (const track of this.tracks)
				this.playing = track.playRow(when) || this.playing;
			if (!this.playing) this.stop();
			cb();
		});
	}

	pause() {
		this.timer.stop();
		for (const track of this.tracks)
			track.allNotesOff();
	}

	reset() {
		for (const track of this.tracks) track.reset();
	}

	stop() {
		this.pause();
		this.reset();
	}

}
