import { SynthUI } from './synthUI';
import { Keyboard } from './keyboard';

const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
setupKeyboard();


function setupKeyboard() {
	var kb = new Keyboard();
	kb.noteOn = (midi, ratio) => {
		synthUI.synth.noteOn(midi, 1, ratio);
	};
	kb.noteOff = (midi) => {
		synthUI.synth.noteOff(midi, 1);
	};
}