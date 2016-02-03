import { Instrument } from '../synth/instrument';


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
	voices: number;
	instrument: Instrument;
	rows: NoteRow[] = [];
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
}

export class Track {
	parts: Part[] = [];
}

export class Song {
	title: string;
	bpm: number;
	tracks: Track[] = [];
	play() {}
	stop() {}
}
