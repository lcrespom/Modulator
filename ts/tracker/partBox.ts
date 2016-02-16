import { Pianola } from './pianola';
import { Part, NoteRow, Note } from './song';
import { Timer } from '../synth/timer';
import { Instrument } from '../synth/instrument';
import { ModernAudioContext } from '../utils/modern';
import { focusable } from '../utils/modern';
import * as popups from '../utils/popups';

export class PartBox {
	playing = false;
	timer: Timer;
	ac: ModernAudioContext;
	part: Part;
	pianola: Pianola;
	rowNum: number;
	rowOfs: number;
	presets: any[];
	$playBut: JQuery;
	$delBut: JQuery;
	$newBut: JQuery;
	$instCombo: JQuery;
	$nvCombo: JQuery;
	$nrCombo: JQuery;
	$nameInput: JQuery;

	constructor(ac: ModernAudioContext, $elem: JQuery, part: Part,
		pianola: Pianola, presets: any[]) {
		this.rowNum = 0;
		this.ac = ac;
		this.$playBut = $elem.find('.but-play');
		this.$delBut = $elem.find('.but-del-part');
		this.$newBut = $elem.find('.but-new-part');
		this.part = part;
		this.pianola = pianola;
		this.registerPianolaScroll();
		this.pianola.pkh.noteOn = (midi, velocity) => this.editNote(midi, velocity);
		this.rowOfs = 0;
		this.presets = presets;
		this.registerButtons();
		this.$instCombo = $elem.find('.combo-instrument');
		this.registerInstrumentCombo();
		this.$nvCombo = $elem.find('.combo-voices');
		this.registerNumVoicesCombo();
		this.$nrCombo = $elem.find('.combo-rows');
        this.registerNumRowsCombo();
		this.$nameInput = $elem.find('.part-name');
		this.refresh();
	}

	refresh() {
		this.pianola.render(this.part, this.rowNum);
		// Fill instrument combo
		this.$instCombo.empty();
		let i = 0;
		for (const preset of this.presets) {
			const name = preset.name;
			const selected = this.part.preset == preset ? ' selected' : '';
			if (preset.nodes.length > 1)
				this.$instCombo.append(`<option${selected} value="${i}">${name}</option>`);
			i++;
		}
		// Set voices combo
		this.$nvCombo.val('' + this.part.instrument.voices.length);
		// Set num rows combo
		this.$nrCombo.val('' + this.part.rows.length);
		// Part name
		this.$nameInput.val(this.part.name);
	}

	play() {
		if (!this.part) return;
		this.playing = !this.playing;
		if (this.playing) {
			this.setButIcon(this.$playBut, 'pause');
			this.timer = new Timer(this.ac, 90);
			this.timer.start(when => {
				this.part.playRow(this.rowNum, when);
				this.pianola.render(this.part, this.rowNum++);
				this.rowOfs = this.rowNum;
				if (this.rowNum > this.part.rows.length)
					this.stop();
			});
		}
		else {
			this.pause();
		}
	}

	pause() {
		this.setButIcon(this.$playBut, 'play');
		this.timer.stop();
		this.part.instrument.allNotesOff();
	}

	stop() {
		if (!this.playing) return;
		this.pause();
		this.playing = false;
		this.rowNum = 0;
	}

	setButIcon($but: JQuery, icon: string) {
		const $glyph = $but.find('.glyphicon');
		const classes = $glyph.attr('class').split(/\s+/)
			.filter(c => !c.match(/glyphicon-/)).concat('glyphicon-' + icon);
		$glyph.attr('class', classes.join(' '));
	}

	updateRowOfs(dy: number) {
		this.rowOfs += dy;
		if (this.rowOfs < 0)
			this.rowOfs = 0;
		else if (this.rowOfs > this.part.rows.length)
			this.rowOfs = this.part.rows.length;
		const newRow = Math.floor(this.rowOfs);
		if (newRow != this.rowNum) {
			this.rowNum = newRow;
			this.pianola.render(this.part, this.rowNum);
			this.playRowNotes();
		}
	}

	playRowNotes() {
		this.part.playRow(this.rowNum, this.ac.currentTime, 0.5);
	}

	editNote(midi: number, velocity: number) {
		const rowNotes = this.getRowNotes();
		const currentNotes = this.pianola.calcNotesAtRow(this.part, this.rowNum);
		// If Note is playing in current row
		if (currentNotes.some(n => n == midi)) {
			if (rowNotes.some(n => n.midi == midi)) {
				// If noteOn is in current row, remove it
				this.setRowNotes(rowNotes.filter(n => n.midi != midi));
			}
			else {
				// Otherwise cancel previous noteOn with a noteOff
				rowNotes.push(Note.off(midi, velocity));
			}
			this.cancelNoteOff(midi);
		}
		// Note is not playing, so add a noteOn
		else {
			const note = Note.on(midi, velocity);
			rowNotes.push(note);
			this.part.playNote(note, this.ac.currentTime);
		}
		this.pianola.render(this.part, this.rowNum);
	}

	cancelNoteOff(midi) {
		for (let i = this.rowNum + 1; i < this.part.rows.length; i++) {
			const rowNotes = this.getRowNotes(i);
			const thisNote = rowNotes.filter(n => n.midi == midi);
			if (thisNote.length == 0) continue;
			if (thisNote[0].type = Note.NoteOff)
				this.setRowNotes(rowNotes
					.filter(n => n.midi != midi || n.type == Note.NoteOn), i);
			return;
		}
	}

	setRowNotes(notes: Note[], pos = this.rowNum) {
		this.part.rows[pos].notes = notes;
	}

	getRowNotes(pos = this.rowNum) {
		if (!this.part.rows[pos])
			this.part.rows[pos] = new NoteRow();
		return this.part.rows[pos].notes;
	}

	getNumVoices() {
		return parseInt(this.$nvCombo.val());
	}

	changeInstrument() {
		if (this.playing) this.part.instrument.allNotesOff();
		this.part.preset = this.presets[this.$instCombo.val()];
		this.part.instrument = new Instrument(
			this.ac, this.part.preset, this.getNumVoices());
	}

	//-------------------- Event handlers --------------------

	registerButtons() {
		this.$playBut.click(_ => this.play());
	}

	registerInstrumentCombo() {
		this.$instCombo.change(_ => this.changeInstrument());
	}

	registerNumVoicesCombo() {
		this.$nvCombo.change(_ => this.changeInstrument());
	}

	registerNumRowsCombo() {
		this.$nrCombo.change(_ => {
			const numRows = parseInt(this.$nrCombo.val());
			if (this.part.rows.length > numRows) {
				popups.confirm('Reduce part length?', 'Warning', ok => {
					if (ok)
						this.part.rows.length = numRows;
					this.refresh();
				});
			}
			else {
				for (let i = this.part.rows.length; i < numRows; i++)
					this.part.rows[i] = new NoteRow();
				this.refresh();
			}
		});
	}

	registerPianolaScroll() {
		this.pianola.parent.on('wheel', evt => {
			if (this.playing) return;
			var oe = <any>evt.originalEvent;
			evt.preventDefault();
			var dy = oe.deltaY;
			if (oe.deltaMode == 1) dy *= 100 / 3;
			this.updateRowOfs(dy / 10);
		});
		const $e = focusable(this.pianola.parent[0]);
		$($e).on('keydown', evt => {
			let dy = 0;
			switch (evt.keyCode) {
				case 33: dy = -4; break;
				case 34: dy = +4; break;
				case 38: dy = -1; break;
				case 40: dy = +1; break;
				default: return;
			}
			this.updateRowOfs(dy);
		});
	}

}