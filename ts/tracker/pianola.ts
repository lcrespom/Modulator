import * as tracker from './song';
import { PianoKeys } from '../piano/piano';

const NUM_WHITES = 28;

const NOTE_COLOR = '#0CC';
const BASE_NOTE = 24;

export class Pianola {
	pkh: PianoKeyHelper;
	past: NoteCanvas;
	future: NoteCanvas;
	notes: number[];
	oldNotes: number[];

	constructor($past, $piano, $future) {
		this.pkh = new PianoKeyHelper(new PianoKeys(NUM_WHITES));
		this.past = new NoteCanvas($('#past-notes'), NUM_WHITES * 2, this.pkh);
		this.future = new NoteCanvas($('#future-notes'), NUM_WHITES * 2, this.pkh);
		this.notes = [];
		this.oldNotes = [];
	}

	render(part: tracker.Part, currentRow: number) {
		this.past.paintNoteColumns();
		this.future.paintNoteColumns();
		for (let i = 0; i < part.rows.length; i++) {
			const row = part.rows[i];
			this.updateNotes(part.rows[i]);
			if (i < currentRow) this.renderPastRow(i, currentRow);
			else if (i == currentRow) this.renderCurrentRow();
			else this.renderFutureRow(i, currentRow);
		}
	}

	renderPastRow(rowNum: number, currentRow: number) {
		const y = this.past.numRows - currentRow + rowNum;
		this.past.renderNoteRow(y, this.notes, this.past.remainH);
	}

	renderCurrentRow() {
		for (const note of this.oldNotes)
			this.pkh.keyUp(note);
		for (const note of this.notes)
			this.pkh.keyDown(note);
		this.oldNotes = this.notes.slice();
	}

	renderFutureRow(rowNum: number, currentRow: number) {
		const y = rowNum - currentRow - 1;
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
	keys: JQuery[];

	constructor(public pk: PianoKeys) {
		this.keys = this.pk.createKeys($('#piano'));
	}

	getKey(midi: number): JQuery {
		return this.keys[midi - BASE_NOTE];
	}

	keyDown(midi: number) {
		const key = this.getKey(midi);
		key.addClass('piano-key-pressed');
	}

	keyUp(midi: number) {
		const key = this.getKey(midi);
		key.removeClass('piano-key-pressed');
	}

	reset() {
		for (const key in this.keys)
			key.removeClass('piano-key-pressed');
	}
}


class NoteCanvas {
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	numKeys: number;
	pkh: PianoKeyHelper;
	noteW: number;
	noteH: number;
	numRows: number;
	remainH: number;

	constructor($canvas: JQuery, numKeys: number, pkh: PianoKeyHelper) {
		this.canvas = <HTMLCanvasElement>$canvas[0];
		this.gc = this.canvas.getContext('2d');
		this.numKeys = numKeys;
		this.pkh = pkh;
		this.noteW = this.canvas.width / this.numKeys;
		this.noteH = this.noteW;
		this.numRows = Math.floor(this.canvas.height / this.noteH);
		this.remainH = this.canvas.height % this.noteH;
	}

	paintNoteColumns() {
		//TODO paint only the area belonging to existing part rows
		this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let x = this.noteW / 2;
		//this.gc.translate(-2, 0);
		this.gc.fillStyle = '#E0E0E0';
		let oldx = 0;
		for (let i = 0; i < this.numKeys - 1; i++) {
			if (i % 2)	//  && pk.hasBlack((i-1)/2)
				this.gc.fillRect(Math.round(x) - 1, 0, Math.round(x - oldx), this.canvas.height);
			oldx = x;
			x += this.noteW;
		}
	}

	renderNoteRow(y: number, notes: number[], yOffset = 0) {
		const yy = y * this.noteH + yOffset;
		if (yy + this.noteH < 0 || yy > this.canvas.height) return;
		this.gc.fillStyle = NOTE_COLOR;
		const xOffset = $(this.canvas).offset().left;
		for (const midi of notes) {
			const $key = this.pkh.getKey(midi);
			let x = $key.offset().left - xOffset;
			x -= $key.hasClass('piano-black') ? 7.5 : 4;
			this.gc.fillRect(x, yy, this.noteW, this.noteH);
		}
	}
}
