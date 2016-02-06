/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI } from './synthUI/synthUI';
import { NoteInputs } from './piano/noteInputs'
import { Presets } from './synthUI/presets';
import { ModernWindow, ModernAudioContext } from './utils/modern';
import { setupRoutes } from './utils/routes';
import { setupTracker } from './tracker/tracker';

const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const ac = createAudioContext();
const synthUI = new SynthUI(ac, graphCanvas,
	$('#node-params'), $('#audio-graph-fft'), $('#audio-graph-osc'));

setupPanels();
setupRoutes('#synth').then(_ => setupTracker(ac));

function createAudioContext(): ModernAudioContext {
	const CtxClass: any = window.AudioContext || window.webkitAudioContext;
	return new CtxClass();
}

function setupPanels() {
	setupPalette();
	const inputs = new NoteInputs(synthUI);
	const presets = new Presets(synthUI);
	presets.beforeSave = (json) => $.extend(json, { keyboard: inputs.piano.toJSON() });
	presets.afterLoad = (json) => inputs.piano.fromJSON(json.keyboard);
}


function setupPalette() {
	$(function() {
		$('.nano')['nanoScroller']({ preventPageScrolling: true });
	});
}


declare var window: ModernWindow;
