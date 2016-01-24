import { PianoKeys } from './piano/piano'

const NUM_WHITES = 24;

console.log('Hello from tracker');
const pk = new PianoKeys(NUM_WHITES);
const keys = pk.createKeys($('#piano'));

const canvas: HTMLCanvasElement = <HTMLCanvasElement>$('#past-notes')[0];
paintNoteColumns(canvas, canvas.getContext('2d'), NUM_WHITES * 2);

function paintNoteColumns(
	canvas: HTMLCanvasElement, gc: CanvasRenderingContext2D, numKeys) {
	const w = canvas.width / numKeys;
	let x = w/2;
	gc.translate(-0.5, 0);
	gc.strokeStyle = '#999';
	gc.lineWidth = 1;
	gc.setLineDash([1, 2]);
	for (let i = 0; i <= numKeys; i++) {
		const ix = Math.round(x);
		gc.moveTo(ix, 0);
		gc.lineTo(ix, canvas.height);
		gc.stroke();
		x += w;
	}
}
