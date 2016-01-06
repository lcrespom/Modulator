export class Arpeggiator {
	mode: string;
	octaves: number;
	time: number;
	notes: NoteTable;
	notect: number;
	lastNote: NoteData;

	constructor() {
		this.mode = '';
		this.octaves = 1;
		this.time = 2;
		this.notect = 0;
		this.notes = new NoteTable();
		this.timer();
	}

	timer() {
		//TODO improve accuracy, read article
		setTimeout(this.timer.bind(this), this.time * 1000);
		if (this.lastNote) {
			this.noteOff(this.lastNote.midi, this.lastNote.velocity);
			this.lastNote = null;
		}
		if (this.mode.length == 0) return;
		if (this.notes.length() == 0) return;
		if (this.notect >= this.notes.length()) this.notect = 0;
		else if (this.notect < 0) this.notect = this.notes.length() - 1;
		const ndata = this.notes.get(this.notect);
		this.noteOn(ndata.midi, ndata.velocity, ndata.ratio);
		this.lastNote = ndata;
		// if (this.mode == 'u')
		// 	this.notect++;
		// else if (this.mode == 'd')
		// 	this.notect--;
		this.notect++;
	}

	sendNoteOn(midi: number, velocity: number, ratio: number): void {
		if (this.mode.length == 0)
			return this.noteOn(midi, velocity, ratio);
		this.notes.add(midi, velocity, ratio);
	}
	sendNoteOff(midi: number, velocity: number): void {
		if (this.mode.length == 0)
			this.noteOff(midi, velocity);
		this.notes.remove(midi, velocity);
	}

	// Event handlers
	noteOn(midi: number, velocity: number, ratio: number): void {}
	noteOff(midi: number, velocity: number): void {}
}


class NoteData {
	constructor(public midi, public velocity, public ratio) {}
}

class NoteTable {
	notes: NoteData[] = [];

	length(): number { return this.notes.length; }

	get(i: number): NoteData { return this.notes[i]; }

	add(midi, velocity, ratio): void {
		const ndata = new NoteData(midi, velocity, ratio);
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
			if (this.notes[i].midi = midi) {
				this.notes.splice(i, 1);
				return;
			}
		}
	}
}