import { PianoKeys } from './piano/piano'

const NUM_WHITES = 28;

const pk = new PianoKeys(NUM_WHITES);
const keys = pk.createKeys($('#piano'));

setupCanvas('past-notes');
setupCanvas('future-notes');


function setupCanvas(id) {
	const canvas: HTMLCanvasElement = <HTMLCanvasElement>$('#' + id)[0];
	paintNoteColumns(canvas, canvas.getContext('2d'), NUM_WHITES * 2);
}

function paintNoteColumns(
	canvas: HTMLCanvasElement, gc: CanvasRenderingContext2D, numKeys) {
	const w = canvas.width / numKeys;
	let x = w/2;
	gc.translate(-2, 0);
	gc.fillStyle = '#E0E0E0';
	let oldx = 0;
	for (let i = 0; i < numKeys - 1; i++) {
		if (i % 2)	//  && pk.hasBlack((i-1)/2)
			gc.fillRect(Math.round(x), 0, Math.round(x - oldx), canvas.height);
		oldx = x;
		x += w;
	}
}

class Note {
	type: number;
	midi: number;
	velocity: number;
}

class NoteRow {
	notes: Note[];
	commands: any[];
}

class Part {
	name: string;
	voices: number;
	instrument: any;
	rows: NoteRow[];
}

class Track {
	parts: Part[];
}

class Song {
	title: string;
	bpm: number;
	tracks: Track[];
	play() {}
	stop() {}
}
