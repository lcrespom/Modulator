export class MidiKeyboard {
	connected = false

	constructor() {
		if (!navigator.requestMIDIAccess) return
		navigator.requestMIDIAccess({ sysex: false })
		.then((midiAccess: any) => {
			if (midiAccess.inputs.size <= 0) return
			const input = midiAccess.inputs.values().next().value
			if (!input) return
			input.onmidimessage = (msg: any) => this.midiMessage(msg)
			this.connected = true
		})
	}

	midiMessage(msg: any) {
		const data = msg.data
		const cmd = data[0] >> 4
		const channel = data[0] & 0xf
		const note = data[1]
		const velocity = data[2]
		switch (cmd) {
			case 9:
				this.noteOn(note, velocity, channel)
				break
			case 8:
				this.noteOff(note, velocity, channel)
				break
		}
	}

	noteOn(midi: number, velocity: number, channel: number): void {}
	noteOff(midi: number, velocity: number, channel: number): void {}
}

declare var navigator: any
