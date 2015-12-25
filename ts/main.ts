/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI } from './synthUI';
import { Keyboard } from './keyboard';

setupTheme();
const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
setupKeyboard();
setupButtons();


function setupKeyboard() {
	var kb = new Keyboard();
	kb.noteOn = (midi, ratio) => {
		synthUI.synth.noteOn(midi, 1, ratio);
	};
	kb.noteOff = (midi) => {
		synthUI.synth.noteOff(midi, 1);
	};
}

function setupButtons() {
	$('#save-but').click(_ =>
		prompt(
			'Copy the text below to the clipboard and save it to a local text file',
			synthUI.gr.toJSON()
		)
	);
	$('#load-but').click(_ => {
		const json = prompt('Paste below the contents of a previously saved synth');
		if (json) synthUI.gr.fromJSON(json);
	});
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