/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI } from './synthUI';
import { NoteInputs } from './noteInputs'
import { Presets } from './presets';
import { ModernWindow, ModernAudioContext } from './synth/modern';

setupPalette();
const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(createAudioContext(), graphCanvas,
	$('#node-params'), $('#audio-graph-fft'), $('#audio-graph-osc'));
new NoteInputs(synthUI);
new Presets(synthUI);


function createAudioContext(): ModernAudioContext {
	const CtxClass: any = window.AudioContext || window.webkitAudioContext;
	return new CtxClass();
}

function setupPalette() {
	$(function() {
		$('.nano')['nanoScroller']();
	});
}


declare var window: ModernWindow;
