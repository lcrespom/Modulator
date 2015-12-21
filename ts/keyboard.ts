const KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
const BASE_NOTE = 36;
const SEMITONE = Math.pow(2, 1/12);
const A4 = 57;


export class Keyboard {

	constructor() {
		this.setupHandler();
	}

	setupHandler() {
		const pressedKeys = {};
		$('body')
		.on('keydown', evt => {
			if (pressedKeys[evt.keyCode]) return;	// Skip repetitions
			pressedKeys[evt.keyCode] = true;
			const midi = this.key2midi(evt.keyCode);
			if (midi < 0) return;
			this.noteOn(midi, this.midi2freqRatio(midi));
		})
		.on('keyup', evt => {
			pressedKeys[evt.keyCode] = false;
			const midi = this.key2midi(evt.keyCode);
			if (midi < 0) return;
			this.noteOff(midi);
		});
	}

	key2midi(keyCode: number): number {
		const pos = KB_NOTES.indexOf(String.fromCharCode(keyCode));
		if (pos < 0) return -1;
		return BASE_NOTE + pos;
	}

	midi2freqRatio(midi: number): number {
		return Math.pow(SEMITONE, midi - A4);
	}

	noteOn(midi: number, ratio: number):void {}
	noteOff(midi: number): void {}
}
