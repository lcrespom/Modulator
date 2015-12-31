import { midi2freqRatio } from './keyboard';
import * as popups from './popups';

const NUM_WHITES = 17;
const BASE_NOTE = 36;

export class PianoKeyboard {
	keys: JQuery[];
	k1note: number;
	baseNote: number;
	octave: number;
	poly: boolean;
	lastKey: JQuery;
	envelope: { attack: number; release: number };

	constructor(panel: JQuery) {
		this.baseNote = BASE_NOTE;
		this.octave = 3;
		this.poly = false;
		this.envelope = { attack: 0, release: 0 };
		this.createKeys(panel);
		for (let i = 0; i < this.keys.length; i++)
			this.registerKey(this.keys[i], i);
		this.registerButtons();
	}

	createKeys(panel: JQuery) {
		this.keys = [];
		var pw = panel.width();
		var ph = panel.height();
		var kw = pw / NUM_WHITES + 1;
		var bw = kw * 2 / 3;
		var bh = ph * 2 / 3;
		// Create white keys
		var knum = 0;
		for (let i = 0; i < NUM_WHITES; i++) {
			const key = $('<div class="piano-key">').css({
				width: '' + kw + 'px',
				height: '' + ph + 'px'
			});
			panel.append(key);
			this.keys[knum++] = key;
			if (this.hasBlack(i)) knum++;
		}
		// Create black keys
		var knum = 0;
		let x = 10 - bw / 2;
		for (let i = 0; i < NUM_WHITES - 1; i++) {
			x += kw - 1;
			knum++;
			if (!this.hasBlack(i)) continue;
			const key = $('<div class="piano-key piano-black">').css({
				width: '' + bw + 'px',
				height: '' + bh + 'px',
				left: '' + x + 'px',
				top: '10px'
			});
			panel.append(key);
			this.keys[knum++] = key;
		}
	}

	hasBlack(num: number): boolean {
		const mod7 = num % 7;
		return mod7 != 2 && mod7 != 6;
	}

	registerKey(key: JQuery, knum: number): void {
		key.mousedown(_ => {
			const midi = knum + this.baseNote;
			this.displayKeyDown(key);
			this.noteOn(midi, midi2freqRatio(midi));
		});
		key.mouseup(_ => {
			const midi = knum + this.baseNote;
			this.displayKeyUp(key);
			this.noteOff(midi);
		});
	}

	registerButtons(): void {
		$('#poly-but').click(_ => this.togglePoly());
		$('#prev-octave-but').click(_ => {
			this.octave--;
			this.baseNote -= 12;
			this.updateOctave();
		});
		$('#next-octave-but').click(_ => {
			this.octave++;
			this.baseNote += 12;
			this.updateOctave();
		});
	}

	updateOctave() {
		$('#prev-octave-but').prop('disabled', this.octave <= 1);
		$('#next-octave-but').prop('disabled', this.octave >= 8);
		$('#octave-label').text('C' + this.octave);
		this.octaveChanged(this.baseNote);
	}

	displayKeyDown(key): void {
		if (typeof key == 'number') key = this.midi2key(key);
		if (!key) return;
		if (!this.poly && this.lastKey) this.displayKeyUp(this.lastKey, true);
		key.css('transition', `background-color ${this.envelope.attack}s linear`);
		key.addClass('piano-key-pressed');
		this.lastKey = key;
	}

	displayKeyUp(key, immediate?) {
		if (typeof key == 'number') key = this.midi2key(key);
		if (!key) return;
		const release = immediate ? 0 : this.envelope.release;
		key.css('transition', `background-color ${release}s linear`);
		key.removeClass('piano-key-pressed');
	}

	midi2key(midi: number) {
		return this.keys[midi - this.baseNote];
	}

	setEnvelope(adsr) {
		this.envelope = adsr;
	}

	togglePoly() {
		this.poly = !this.poly;
		if (this.poly) {
			const cover = $('<div>').addClass('editor-cover');
			cover.append('<p>Synth editing is disabled in polyphonic mode</p>');
			$('body').append(cover);
			$('#poly-but').text('Back to mono');
			popups.isOpen = true;
			this.polyOn();
		}
		else {
			$('.editor-cover').remove();
			$('#poly-but').text('Poly');
			popups.isOpen = false;
			this.polyOff();
		}
	}

	// Simple event handlers
	noteOn(midi: number, ratio: number): void {}
	noteOff(midi: number): void {}
	polyOn() {}
	polyOff() {}
	octaveChanged(baseNote) {}
}