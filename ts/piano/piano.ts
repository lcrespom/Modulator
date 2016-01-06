import * as popups from '../popups';

const NUM_WHITES = 17;
const BASE_NOTE = 36;

const ARPEGGIO_MODES = ['', 'u', 'd', 'ud'];
const ARPEGGIO_LABELS = ['-', '&uarr;', '&darr;', '&uarr;&darr;'];
const MAX_ARPEGGIO_OCT = 3;
/**
 * A virtual piano keyboard that:
 * 	- Captures mouse input and generates corresponding note events
 * 	- Displays note events as CSS-animated colors in the pressed keys
 * 	- Supports octave switching
 * 	- Provides a poly/mono button
 */
export class PianoKeyboard {
	keys: JQuery[];
	k1note: number;
	baseNote: number;
	octave: number;
	poly: boolean;
	lastKey: JQuery;
	envelope: { attack: number; release: number };
	portaSlider: JQuery;
	arpeggio = {
		mode: 0,
		octave: 1,
		time: 0.5
	}

	constructor(panel: JQuery) {
		this.baseNote = BASE_NOTE;
		this.octave = 3;
		this.poly = false;
		this.envelope = { attack: 0, release: 0 };
		this.createKeys(panel);
		for (let i = 0; i < this.keys.length; i++)
			this.registerKey(this.keys[i], i);
		this.registerButtons(panel.parent());
		this.portaSlider = panel.parent().find('.portamento-box input');
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
			this.noteOn(midi);
		});
		key.mouseup(_ => {
			const midi = knum + this.baseNote;
			this.displayKeyUp(key);
			this.noteOff(midi);
		});
	}

	registerButtons(panel: JQuery): void {
		// Octave navigation
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
		// Arpeggio
		const arpeggioSlider = panel.find('.arpeggio-box input');
		arpeggioSlider.on('input',_ => {
			this.arpeggio.time = parseFloat(arpeggioSlider.val());
			this.triggerArpeggioChange();
		});
		const butArpMode = panel.find('.btn-arpeggio-ud');
		butArpMode.click(_ => this.changeArpeggioMode(butArpMode));
		const butArpOct = panel.find('.btn-arpeggio-oct');
		butArpOct.click(_ => this.changeArpeggioOctave(butArpOct));
		// Monophonic / polyphonic mode
		$('#poly-but').click(_ => this.togglePoly());
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
			cover.append('<p>You can use the PC keyboard to play notes<br><br>' +
				'Synth editing is disabled in polyphonic mode</p>');
			$('body').append(cover);
			$('#poly-but').text('Poly');
			popups.isOpen = true;
			this.polyOn();
		}
		else {
			$('.editor-cover').remove();
			$('#poly-but').text('Mono');
			popups.isOpen = false;
			this.polyOff();
		}
	}

	getPortamento(): number {
		return parseFloat(this.portaSlider.val());
	}

	changeArpeggioMode(button: JQuery) {
		this.arpeggio.mode++;
		if (this.arpeggio.mode >= ARPEGGIO_MODES.length)
			this.arpeggio.mode = 0;
		button.html(ARPEGGIO_LABELS[this.arpeggio.mode]);
		this.triggerArpeggioChange();
	}

	changeArpeggioOctave(button: JQuery) {
		this.arpeggio.octave++;
		if (this.arpeggio.octave > MAX_ARPEGGIO_OCT)
			this.arpeggio.octave = 1;
		button.text(this.arpeggio.octave);
		this.triggerArpeggioChange();
	}

	triggerArpeggioChange() {
		this.arpeggioChanged(this.arpeggio.time,
			ARPEGGIO_MODES[this.arpeggio.mode], this.arpeggio.octave);
	}

	// Simple event handlers
	noteOn(midi: number): void {}
	noteOff(midi: number): void {}
	polyOn() {}
	polyOff() {}
	octaveChanged(baseNote) {}
	arpeggioChanged(time: number, mode: string, octaves: number) {}
}