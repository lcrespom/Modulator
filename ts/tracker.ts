import { PianoKeys } from './piano/piano'

const NOTE_COLOR = '#0CC';
const BASE_NOTE = 24;

class NoteCanvas {
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	numKeys: number;
	noteW: number;
	part: Part;
	keys: JQuery[];
	notes: number[];

	constructor($canvas: JQuery, numKeys: number) {
		this.canvas = <HTMLCanvasElement>$canvas[0];
		this.gc = this.canvas.getContext('2d');
		this.numKeys = numKeys;
		this.notes = [];
	}

	paintNoteColumns() {
		const w = this.canvas.width / this.numKeys;
		this.noteW = w;
		let x = w/2;
		this.gc.translate(-2, 0);
		this.gc.fillStyle = '#E0E0E0';
		let oldx = 0;
		for (let i = 0; i < this.numKeys - 1; i++) {
			if (i % 2)	//  && pk.hasBlack((i-1)/2)
				this.gc.fillRect(Math.round(x), 0, Math.round(x - oldx), this.canvas.height);
			oldx = x;
			x += w;
		}
	}

	renderPastNotes(start: number) {
	}

	renderFutureNotes(start: number) {
		let y = 0;
		for (let i = start; i < this.part.rows.length; i++) {
			this.renderRow(y++, this.part.rows[i]);
		}
	}

	renderRow(y: number, row: NoteRow) {
		// Update notes array
		const notes = row && row.notes ? row.notes : [];
		let note;
		for (note of notes) {
			if (note.type == Note.NoteOn)
				this.notes.push(note.midi);
			else if (note.type == Note.NoteOff)
				this.notes = this.notes.filter(midi => midi != note.midi);
		}
		// Render row according to current state of notes array
		this.gc.fillStyle = NOTE_COLOR;
		const wh = this.noteW;
		const ofs = $(this.canvas).offset().left;
		for (const midi of this.notes) {
			const $key = this.keys[midi - BASE_NOTE];
			let x = $key.offset().left - ofs;
			x -= $key.hasClass('piano-black') ? 6.5 : 3;
			this.gc.fillRect(x, y * wh, wh, wh);
		}
	}
}


//--------------------------------------------------------

class Note {
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

class NoteRow {
	notes: Note[];
	commands: any[];
}

class Part {
	name: string;
	voices: number;
	instrument: any;
	rows: NoteRow[] = [];
}

class Track {
	parts: Part[] = [];
}

class Song {
	title: string;
	bpm: number;
	tracks: Track[] = [];
	play() {}
	stop() {}
}


//--------------------------------------------------------

function rowWithNotes(...notes): NoteRow {
	const nr = new NoteRow();
	nr.notes = notes;
	return nr;
}

function createNotes(): NoteRow[] {
	const rows = [];
	let i = 0;
	rows[i] = rowWithNotes(Note.on(48));
	i += 4;
	rows[i] = rowWithNotes(Note.off(48), Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(Note.off(55), Note.on(53));
	rows[i++] = rowWithNotes(Note.off(53), Note.on(52));
	rows[i++] = rowWithNotes(Note.off(52), Note.on(50));
	rows[i] = rowWithNotes(Note.off(50), Note.on(60));
	i += 4;
	rows[i] = rowWithNotes(Note.off(60), Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(Note.off(55), Note.on(53));
	rows[i++] = rowWithNotes(Note.off(53), Note.on(52));
	rows[i++] = rowWithNotes(Note.off(52), Note.on(50));
	rows[i] = rowWithNotes(Note.off(50), Note.on(60));
	i += 4;
	rows[i] = rowWithNotes(Note.off(60), Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(Note.off(55), Note.on(53));
	rows[i++] = rowWithNotes(Note.off(53), Note.on(52));
	rows[i++] = rowWithNotes(Note.off(52), Note.on(53));
	rows[i] = rowWithNotes(Note.off(53), Note.on(50));
	i += 4;
	rows[i] = rowWithNotes(Note.off(50));
	return rows;
}

function starWars(): Song {
	const p = new Part();
	p.instrument = null; //TODO
	p.voices = 1;
	p.name = 'Main theme';
	p.rows = createNotes();
	const t = new Track();
	t.parts.push(p);
	const s = new Song();
	s.title = 'Star Wars';
	s.bpm = 90;
	s.tracks.push(t);
	return s;
}


//--------------------------------------------------

const NUM_WHITES = 28;

const pk = new PianoKeys(NUM_WHITES);
const keys = pk.createKeys($('#piano'));

const past = new NoteCanvas($('#past-notes'), NUM_WHITES * 2);
past.paintNoteColumns();
const future = new NoteCanvas($('#future-notes'), NUM_WHITES * 2);
future.paintNoteColumns();

const sw = starWars();
future.part = sw.tracks[0].parts[0];
future.keys = keys;
future.renderFutureNotes(0);