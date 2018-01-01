import * as popups from '../utils/popups'
import { log2linear, linear2log } from '../utils/modern'

const NUM_WHITES = 17
const BASE_NOTE = 36

const ARPEGGIO_MODES = ['', 'u', 'd', 'ud']
const ARPEGGIO_LABELS = ['-', '&uarr;', '&darr;', '&uarr;&darr;']
const MAX_ARPEGGIO_OCT = 3
const ARPEGGIO_MIN = 15
const ARPEGGIO_MAX = 480

const PORTAMENTO_MIN = 0
const PORTAMENTO_MAX = 1


/** Builds a piano keyboard out of DIVs */
export class PianoKeys {
	constructor(public numWhites = NUM_WHITES) {}

	createKeys(panel: JQuery): JQuery[] {
		const keys = []
		const pw = panel.width() || 0
		const ph = panel.height() || 0
		const fromX = parseFloat(panel.css('padding-left'))
		const fromY = parseFloat(panel.css('padding-top'))
		const kw = pw / this.numWhites + 1
		const bw = Math.round(kw * 2 / 3)
		const bh = Math.round(ph * 2 / 3)
		// Create white keys
		let knum = 0
		for (let i = 0; i < this.numWhites; i++) {
			const key = $('<div class="piano-key">').css({
				width: '' + kw + 'px',
				height: '' + ph + 'px'
			})
			panel.append(key)
			keys[knum++] = key
			if (this.hasBlack(i)) knum++
		}
		// Create black keys
		knum = 0
		let x = fromX - bw / 2
		for (let i = 0; i < this.numWhites - 1; i++) {
			x += kw - 1
			knum++
			if (!this.hasBlack(i)) continue
			const key = $('<div class="piano-key piano-black">').css({
				width: '' + bw + 'px',
				height: '' + bh + 'px',
				left: '' + x + 'px',
				top: '' + fromY + 'px'
			})
			panel.append(key)
			keys[knum++] = key
		}
		return keys
	}

	hasBlack(num: number): boolean {
		const mod7 = num % 7
		return mod7 != 2 && mod7 != 6
	}

}

/**
 * A virtual piano keyboard that:
 * 	- Captures mouse input and generates corresponding note events
 * 	- Displays note events as CSS-animated colors in the pressed keys
 * 	- Supports octave switching
 * 	- Provides a poly/mono button
 */
export class PianoKeyboard {
	keys: JQuery[]
	k1note: number
	baseNote: number
	octave: number
	poly: boolean
	lastKey: JQuery
	envelope: { attack: number; release: number }
	portaSlider: JQuery
	controls: JQuery
	pressedKey: JQuery | null
	arpeggio = {
		mode: 0,
		octave: 1,
		bpm: 60
	}

	constructor(panel: JQuery) {
		this.baseNote = BASE_NOTE
		this.octave = 3
		this.poly = false
		this.envelope = { attack: 0, release: 0 }
		const pianoKeys = new PianoKeys()
		this.keys = pianoKeys.createKeys(panel)
		for (let i = 0; i < this.keys.length; i++)
			this.registerKey(this.keys[i], i)
		this.controls = panel.parent()
		this.registerButtons(this.controls)
		this.portaSlider = this.controls.find('.portamento-box input')
	}

	registerKey(key: JQuery, knum: number): void {
		key.mousedown(_ => {
			const midi = knum + this.baseNote
			this.displayKeyDown(key)
			this.noteOn(midi)
			this.pressedKey = key
		})
		key.mouseup(_ => {
			const midi = knum + this.baseNote
			this.displayKeyUp(key)
			this.noteOff(midi)
			this.pressedKey = null
		})
		key.mouseout(_ => {
			if (key != this.pressedKey) return
			const midi = knum + this.baseNote
			this.displayKeyUp(key)
			this.noteOff(midi)
			this.pressedKey = null
		})
	}

	registerButtons(panel: JQuery): void {
		// Octave navigation
		$('#prev-octave-but').click(_ => {
			this.octave--
			this.updateOctave()
		})
		$('#next-octave-but').click(_ => {
			this.octave++
			this.updateOctave()
		})
		// Arpeggio
		const arpeggioSlider = panel.find('.arpeggio-box input')
		arpeggioSlider.on('input', _ => {
			this.arpeggio.bpm =
				log2linear(parseFloat('' + arpeggioSlider.val()), ARPEGGIO_MIN, ARPEGGIO_MAX)
				// ARPEGGIO_MIN + parseFloat(arpeggioSlider.val()) * (ARPEGGIO_MAX - ARPEGGIO_MIN);
			this.triggerArpeggioChange()
		})
		const butArpMode = panel.find('.btn-arpeggio-ud')
		butArpMode.click(_ => this.changeArpeggioMode(butArpMode))
		const butArpOct = panel.find('.btn-arpeggio-oct')
		butArpOct.click(_ => this.changeArpeggioOctave(butArpOct))
		// Monophonic / polyphonic mode
		$('#poly-but').click(_ => this.togglePoly())
	}

	updateOctave() {
		$('#prev-octave-but').prop('disabled', this.octave <= 1)
		$('#next-octave-but').prop('disabled', this.octave >= 8)
		$('#octave-label').text('C' + this.octave)
		this.baseNote = BASE_NOTE + 12 * (this.octave - 3)
		this.octaveChanged(this.baseNote)
	}

	displayKeyDown(key: any): void {
		if (typeof key == 'number') key = this.midi2key(key)
		if (!key) return
		if (!this.poly && this.arpeggio.mode == 0 && this.lastKey)
			this.displayKeyUp(this.lastKey, true)
		key.css('transition', `background-color ${this.envelope.attack}s linear`)
		key.addClass('piano-key-pressed')
		this.lastKey = key
	}

	displayKeyUp(key: any, immediate?: boolean) {
		if (typeof key == 'number') key = this.midi2key(key)
		if (!key) return
		const release = immediate ? 0 : this.envelope.release
		key.css('transition', `background-color ${release}s linear`)
		key.removeClass('piano-key-pressed')
	}

	midi2key(midi: number) {
		return this.keys[midi - this.baseNote]
	}

	setEnvelope(adsr: any) {
		this.envelope = adsr
	}

	togglePoly() {
		this.poly = !this.poly
		if (this.poly) {
			const cover = $('<div>').addClass('editor-cover')
			cover.append('<p>You can use the PC keyboard to play notes<br><br>' +
				'Synth editing is disabled in polyphonic mode</p>')
			$('body').append(cover)
			$('#poly-but').text('Poly')
			popups.setOpen(true)
			this.polyOn()
		}
		else {
			$('.editor-cover').remove()
			$('#poly-but').text('Mono')
			popups.setOpen(false)
			this.polyOff()
		}
	}

	getPortamento(): number {
		const sv = parseFloat('' + this.portaSlider.val())
		return log2linear(sv, PORTAMENTO_MIN, PORTAMENTO_MAX)
	}

	changeArpeggioMode(button: JQuery) {
		this.arpeggio.mode++
		if (this.arpeggio.mode >= ARPEGGIO_MODES.length)
			this.arpeggio.mode = 0
		button.html(ARPEGGIO_LABELS[this.arpeggio.mode])
		this.triggerArpeggioChange()
	}

	changeArpeggioOctave(button: JQuery) {
		this.arpeggio.octave++
		if (this.arpeggio.octave > MAX_ARPEGGIO_OCT)
			this.arpeggio.octave = 1
		button.text(this.arpeggio.octave)
		this.triggerArpeggioChange()
	}

	triggerArpeggioChange() {
		this.arpeggioChanged(this.arpeggio.bpm,
			ARPEGGIO_MODES[this.arpeggio.mode], this.arpeggio.octave)
	}

	toJSON(): any {
		return {
			portamento: this.getPortamento(),
			octave: this.octave,
			arpeggio: {
				bpm: this.arpeggio.bpm,
				mode: this.arpeggio.mode,
				octave: this.arpeggio.octave
			}
		}
	}

	fromJSON(json: any): void {
		if (!json) return
		if (json.portamento) {
			this.portaSlider.val(
				linear2log(json.portamento, PORTAMENTO_MIN, PORTAMENTO_MAX))
		}
		if (json.octave) {
			this.octave = json.octave
			this.updateOctave()
		}
		if (json.arpeggio) {
			this.arpeggio.bpm = json.arpeggio.bpm
			this.arpeggio.mode = json.arpeggio.mode
			this.arpeggio.octave = json.arpeggio.octave
			this.controls.find('.arpeggio-box input').val(
				linear2log(this.arpeggio.bpm, ARPEGGIO_MIN, ARPEGGIO_MAX))
			this.controls.find('.btn-arpeggio-ud').html(ARPEGGIO_LABELS[this.arpeggio.mode])
			this.controls.find('.btn-arpeggio-oct').text(this.arpeggio.octave)
			this.triggerArpeggioChange()
		}
	}

	// Simple event handlers
	noteOn(midi: number): void {}
	noteOff(midi: number): void {}
	polyOn() {}
	polyOff() {}
	octaveChanged(baseNote: number) {}
	arpeggioChanged(bpm: number, mode: string, octaves: number) {}
}
