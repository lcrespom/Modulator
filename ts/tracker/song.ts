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
	notes: Note[];
	commands: any[];
}

export class Part {
	name: string;
	voices: number;
	instrument: any;
	rows: NoteRow[] = [];
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
