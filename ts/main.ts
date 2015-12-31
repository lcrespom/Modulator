/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI } from './synthUI';
import { setupNoteInputs } from './noteInputs'
import { Presets } from './presets';

setupPalette();
const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
setupNoteInputs(synthUI);
new Presets(synthUI);


function setupPalette() {
	$(function() {
		$('.nano')['nanoScroller']();
	});
}