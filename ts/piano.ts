import { midi2freqRatio } from './keyboard';

const NUM_WHITES = 17;
const BASE_NOTE = 36;

export class PianoKeyboard {
	keys: JQuery[];
	k1note: number;
	baseNote: number;

	constructor(panel: JQuery) {
		this.baseNote = BASE_NOTE;
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
		const midi = knum + this.baseNote;
		key.mousedown(_ => {
			key.addClass('piano-key-pressed');
			this.noteOn(midi, midi2freqRatio(midi));
		});
		key.mouseup(_ => {
			key.removeClass('piano-key-pressed');
			this.noteOff(midi);
		});
	}

	registerButtons(): void {
		//TODO
	}

	noteOn(midi: number, ratio: number):void {}
	noteOff(midi: number): void {}
}