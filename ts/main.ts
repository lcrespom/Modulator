/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI } from './synthUI';
import { Keyboard } from './keyboard';
import { Presets } from './presets';
import { PianoKeyboard } from './piano';

setupTheme();
setupPalette();
const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
setupKeyboard();
new Presets(synthUI);


function setupKeyboard() {
	var kb = new Keyboard();
	kb.noteOn = (midi, ratio) => {
		if (document.activeElement.nodeName == 'INPUT' &&
			document.activeElement.getAttribute('type') != 'range') return;
		synthUI.synth.noteOn(midi, 1, ratio);
	};
	kb.noteOff = (midi) => {
		synthUI.synth.noteOff(midi, 1);
	};
	var piano = new PianoKeyboard($('#piano'));
	piano.noteOn = (midi, ratio) => synthUI.synth.noteOn(midi, 1, ratio);
	piano.noteOff = (midi) => synthUI.synth.noteOff(midi, 1);
}

function setupTheme() {
	const search: any = getSearch();
	if (search.theme)
		$('body').addClass(search.theme);
}

function getSearch() {
	const search = {};
	let sstr = document.location.search;
	if (!sstr) return search;
	if (sstr[0] == '?') sstr = sstr.substr(1);
	for (const part of sstr.split('&')) {
		const kv = part.split('=');
		search[kv[0]] = kv[1];
	}
	return search;
}

function setupPalette() {
	$(function() {
		$('.nano')['nanoScroller']();
	});
}