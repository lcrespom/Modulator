const KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
const BASE_NOTE = 36;

/**
 * Provides a piano keyboard using the PC keyboard.
 * Listens to keyboard events and generates MIDI-style noteOn/noteOff events.
 */
export class Keyboard {

	baseNote: number;

	constructor(query = 'body') {
		this.setupHandler(query);
		this.baseNote = BASE_NOTE;
	}

	setupHandler(query) {
		const pressedKeys = {};
		$(query)
		.on('keydown', evt => {
			if (pressedKeys[evt.keyCode]) return;					// Skip repetitions
			if (evt.metaKey || evt.altKey || evt.ctrlKey) return;	// Skip browser shortcuts
			pressedKeys[evt.keyCode] = true;
			const midi = this.key2midi(evt.keyCode);
			if (midi < 0) return;
			this.noteOn(midi);
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
		return this.baseNote + pos;
	}

	noteOn(midi: number):void {}
	noteOff(midi: number): void {}
}
