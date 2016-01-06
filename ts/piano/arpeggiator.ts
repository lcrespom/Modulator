export class Arpeggiator {
	mode: string;
	octaves: number;
	time: number;
	notes: NoteTable;
	notect: number;
	lastNote: NoteData;
	backward = false;

	constructor() {
		this.mode = '';
		this.octaves = 1;
		this.time = 0.25;
		this.notect = 0;
		this.notes = new NoteTable();
		this.timer();
	}

	timer() {
		//TODO improve accuracy, read article
		setTimeout(this.timer.bind(this), this.time * 1000);
		// Release previous note
		if (this.lastNote) {
			this.noteOff(this.lastNote.midi, this.lastNote.velocity);
			this.lastNote = null;
		}
		// Return if disabled or no notes
		if (this.mode.length == 0) return;
		const len = this.notes.length();
		if (len == 0) return;
		// Check note counter
		if (this.notect >= len) {
			if (this.mode != 'ud')
				this.notect = 0;
			else {
				this.backward = true;
				this.notect = len < 2 ? 0 : len - 2;
			}
		}
		else if (this.notect < 0) {
			if (this.mode != 'ud')
				this.notect = len - 1;
			else {
				this.backward = false;
				this.notect = len < 2 ? 0 : 1;
			}
		}
		// Get current note and play it
		const ndata = this.notes.get(this.notect);
		this.noteOn(ndata.midi, ndata.velocity);
		this.lastNote = ndata;
		// Update note counter
		if (this.mode == 'u')
			this.notect++;
		else if (this.mode == 'd')
			this.notect--;
		else if (this.mode == 'ud') {
			if (this.backward) this.notect--;
			else this.notect++;
		}
	}

	sendNoteOn(midi: number, velocity: number): void {
		if (this.mode.length == 0)
			return this.noteOn(midi, velocity);
		this.notes.add(midi, velocity);
	}
	sendNoteOff(midi: number, velocity: number): void {
		if (this.mode.length == 0)
			this.noteOff(midi, velocity);
		this.notes.remove(midi, velocity);
	}

	// Event handlers
	noteOn(midi: number, velocity: number): void {}
	noteOff(midi: number, velocity: number): void {}
}


class NoteData {
	constructor(public midi, public velocity) {}
}

class NoteTable {
	private notes: NoteData[] = [];

	length(): number { return this.notes.length; }

	get(i: number): NoteData { return this.notes[i]; }

	add(midi: number, velocity: number): void {
		const ndata = new NoteData(midi, velocity);
		for (let i = 0; i < this.notes.length; i++) {
			if (midi < this.notes[i].midi) {
				this.notes.splice(i, 0, ndata);
				return;
			}
		}
		this.notes.push(ndata);
	}

	remove(midi, velocity): void {
		for (let i = 0; i < this.notes.length; i++) {
			if (this.notes[i].midi == midi) {
				this.notes.splice(i, 1);
				return;
			}
		}
	}
}