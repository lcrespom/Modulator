import * as tracker from './song';

import { PianoKeys } from '../piano/piano';
import { Keyboard } from '../piano/keyboard';
import { MidiKeyboard } from '../piano/midi';

const NUM_WHITES = 28;
const BASE_NOTE = 24;
const NOTE_COLOR = '#0CC';
const COLUMN_COLOR = '#E0E0E0';


export class Pianola {
	pkh: PianoKeyHelper;
	past: NoteCanvas;
	future: NoteCanvas;
	notes: number[];
	oldNotes: number[];
	parent: JQuery;

	constructor($past, $piano, $future) {
		this.pkh = new PianoKeyHelper(new PianoKeys(NUM_WHITES), $piano);
		this.past = new NoteCanvas($past, NUM_WHITES * 2, this.pkh);
		this.future = new NoteCanvas($future, NUM_WHITES * 2, this.pkh);
		this.notes = [];
		this.oldNotes = [];
		this.parent = $piano.parent();
	}

	render(part: tracker.Part, currentRow: number) {
		this.past.paintNoteColumns(this.past.numRows - currentRow, this.past.numRows);
		this.future.paintNoteColumns(0, part.rows.length - currentRow - 1);
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
		this.renderCanvasRow(this.past, rowNum, y);
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
		this.renderCanvasRow(this.future, rowNum, y);
	}

	renderCanvasRow(nc: NoteCanvas, rowNum: number, y: number) {
		nc.renderNoteRow(y, this.notes);
		if (rowNum % 4 == 0) nc.renderBar(y);
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

	constructor(public pk: PianoKeys, $elem: JQuery) {
		// Setup virtual keyboard
		this.keys = this.pk.createKeys($elem);
		for (var i = 0; i < this.keys.length; i++)
			this.registerKeyClick(i);
		// Setup PC keyboard
		const kb = new Keyboard();
		kb.noteOn = midi => this.noteOn(midi, 1);
		// Setup MIDI keyboard
		const mk = new MidiKeyboard();
		mk.noteOn = (midi, velocity, channel) => this.noteOn(midi, velocity);
	}

	registerKeyClick(i) {
		this.keys[i].mousedown(_ =>	this.noteOn(i + BASE_NOTE, 1));
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

	noteOn(midi: number, velocity: number) {}
}


class NoteCanvas {
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	numKeys: number;
	pkh: PianoKeyHelper;
	noteW: number;
	noteH: number;
	numRows: number;

	constructor($canvas: JQuery, numKeys: number, pkh: PianoKeyHelper) {
		this.canvas = <HTMLCanvasElement>$canvas[0];
		this.gc = this.canvas.getContext('2d');
		this.numKeys = numKeys;
		this.pkh = pkh;
		this.noteW = this.canvas.width / this.numKeys;
		this.noteH = this.noteW;
		this.numRows = Math.floor(this.canvas.height / this.noteH);
	}

	paintNoteColumns(fromRow: number, toRow: number) {
		this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let x = this.noteW / 2;
		this.gc.fillStyle = COLUMN_COLOR;
		let oldx = 0;
		let colY = fromRow * this.noteH;
		let colH = (toRow + 1) * this.noteH - colY;
		for (let i = 0; i < this.numKeys - 1; i++) {
			if (i % 2)
				this.gc.fillRect(Math.round(x) - 1, colY, Math.round(x - oldx), colH);
			oldx = x;
			x += this.noteW;
		}
	}

	renderNoteRow(y: number, notes: number[]) {
		const yy = y * this.noteH;
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

	renderBar(y: number) {
		const yy = y * this.noteH - 0.5;
		this.gc.save();
		this.gc.strokeStyle = 'black';
		this.gc.setLineDash([1, 4]);
		this.gc.beginPath();
		this.gc.moveTo(0, yy);
		this.gc.lineTo(this.canvas.width, yy);
		this.gc.stroke();
		this.gc.closePath();
		this.gc.restore();
	}
}
