import * as tracker from './song';
import { PianoKeys } from '../piano/piano';

const NUM_WHITES = 28;

const NOTE_COLOR = '#0CC';
const BASE_NOTE = 24;

export class Pianola {
	pk: PianoKeys;
	keys: JQuery[];
	past: NoteCanvas;
	future: NoteCanvas;
	notes: number[];

	constructor($past, $piano, $future) {
		this.pk = new PianoKeys(NUM_WHITES);
		this.keys = this.pk.createKeys($('#piano'));
		this.past = new NoteCanvas($('#past-notes'), NUM_WHITES * 2);
		this.future = new NoteCanvas($('#future-notes'), NUM_WHITES * 2);
		this.notes = [];
	}

	render(part: tracker.Part, currentRow: number) {
		this.past.paintNoteColumns();
		this.future.paintNoteColumns();
		this.future.keys = this.keys;
		let y = 0;
		for (let i = 0; i < part.rows.length; i++) {
			const row = part.rows[i];
			this.updateNotes(part.rows[i]);
			if (i < currentRow) this.renderPastRow();
			else if (i == currentRow) this.renderCurrentRow();
			else this.renderFutureRow(y++);
		}
	}

	renderPastRow() {
	}

	renderCurrentRow() {
		for (const note of this.notes) {
			
		}
	}

	renderFutureRow(y: number) {
		this.future.renderNoteRow(y, this.notes);
	}

	updateNotes(row: tracker.NoteRow) {
		const rowNotes = row && row.notes ? row.notes : [];
		let note;
		for (note of rowNotes) {
			if (note.type == tracker.Note.NoteOn)
				this.notes.push(note.midi);
			else if (note.type == tracker.Note.NoteOff)
				this.notes = this.notes.filter(midi => midi != note.midi);
		}
	}
}

class PianoKeyHelper {
	constructor(public pk: PianoKeys) {
	}
}

class NoteCanvas {
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	numKeys: number;
	noteW: number;
	keys: JQuery[];

	constructor($canvas: JQuery, numKeys: number) {
		this.canvas = <HTMLCanvasElement>$canvas[0];
		this.gc = this.canvas.getContext('2d');
		this.numKeys = numKeys;
	}

	paintNoteColumns() {
		//TODO paint only the area belonging to existing part rows
		this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

	renderNoteRow(y: number, notes: number[]) {
		this.gc.fillStyle = NOTE_COLOR;
		const wh = this.noteW;
		const ofs = $(this.canvas).offset().left;
		for (const midi of notes) {
			const $key = this.keys[midi - BASE_NOTE];
			let x = $key.offset().left - ofs;
			x -= $key.hasClass('piano-black') ? 6.5 : 3;
			this.gc.fillRect(x, y * wh, wh, wh);
		}
	}
}
