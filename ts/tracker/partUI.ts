import { Pianola } from './pianola';
import { Part, NoteRow, Note } from './song';
import { Timer } from '../synth/timer';
import { ModernAudioContext } from '../utils/modern';

export class PartBox {
	playing = false;
	$play: JQuery;
	timer: Timer;
	ac: ModernAudioContext;
	part: Part;
	pianola: Pianola;
	rowNum: number;
	rowOfs: number;

	constructor(ac: ModernAudioContext, $elem: JQuery, part: Part, pianola: Pianola) {
		this.rowNum = 0;
		this.ac = ac;
		this.$play = $elem.find('.play');
		this.$play.click(_ => this.play());
		this.part = part;
		this.pianola = pianola;
		this.pianola.render(this.part, this.rowNum);
		this.registerPianolaScroll();
		this.pianola.pkh.noteOn = (midi, velocity) => this.editNote(midi, velocity);
		this.rowOfs = 0;
	}

	play() {
		if (!this.part) return;
		this.playing = !this.playing;
		if (this.playing) {
			this.setButIcon(this.$play, 'pause');
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
		this.setButIcon(this.$play, 'play');
		this.timer.stop();
		this.part.instrument.allNotesOff();
	}

	stop() {
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

	registerPianolaScroll() {
		this.pianola.parent.on('wheel', evt => {
			if (this.playing) return;
			var oe = <any>evt.originalEvent;
			evt.preventDefault();
			var dy = oe.deltaY;
			if (oe.deltaMode == 1) dy *= 100 / 3;
			this.updateRowOfs(dy / 10);
		});
		$('body').on('keydown', evt => {
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
				//TODO move down to future rows and cancel note off if present
			}
			else {
				// Otherwise cancel previous noteOn with a noteOff
				rowNotes.push(Note.off(midi, velocity));
			}
		}
		// Note is not playing, so add a noteOn
		else {
			const note = Note.on(midi, velocity);
			rowNotes.push(note);
			this.part.playNote(note, this.ac.currentTime);
		}
		this.pianola.render(this.part, this.rowNum);
	}

	setRowNotes(notes: Note[]) {
		this.part.rows[this.rowNum].notes = notes;
	}
	getRowNotes() {
		if (!this.part.rows[this.rowNum])
			this.part.rows[this.rowNum] = new NoteRow();
		return this.part.rows[this.rowNum].notes;
	}

}