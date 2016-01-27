import * as tracker from './song';

const NOTE_COLOR = '#0CC';
const BASE_NOTE = 24;

export class NoteCanvas {
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	numKeys: number;
	noteW: number;
	part: tracker.Part;
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
			const row = this.part.rows[i];
			this.updateNotes(this.part.rows[i]);
			this.renderRow(y++, row);
		}
	}

	updateNotes(row: tracker.NoteRow) {
		const notes = row && row.notes ? row.notes : [];
		let note;
		for (note of notes) {
			if (note.type == tracker.Note.NoteOn)
				this.notes.push(note.midi);
			else if (note.type == tracker.Note.NoteOff)
				this.notes = this.notes.filter(midi => midi != note.midi);
		}
	}

	renderRow(y: number, row: tracker.NoteRow) {
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
