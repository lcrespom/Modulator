/**
 * Main entry point: setup synth editor and keyboard listener.
 */

import { SynthUI, NodeData } from './synthUI';
import { Keyboard } from './keyboard';
import { Presets } from './presets';
import { PianoKeyboard } from './piano';

setupPalette();
const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
setupKeyboard();
new Presets(synthUI);


function setupKeyboard() {
	// Setup piano panel
	var piano = new PianoKeyboard($('#piano'));
	piano.noteOn = (midi, ratio) => synthUI.synth.noteOn(midi, 1, ratio);
	piano.noteOff = (midi) => synthUI.synth.noteOff(midi, 1);
	// Setup PC keyboard
	var kb = new Keyboard();
	kb.noteOn = (midi, ratio) => {
		if (document.activeElement.nodeName == 'INPUT' &&
			document.activeElement.getAttribute('type') != 'range') return;
		synthUI.synth.noteOn(midi, 1, ratio);
		piano.displayKeyDown(midi);
	};
	kb.noteOff = (midi) => {
		synthUI.synth.noteOff(midi, 1);
		piano.displayKeyUp(midi);
	};
	// Bind piano octave with PC keyboard
	kb.baseNote = piano.baseNote;
	piano.octaveChanged = baseNote => kb.baseNote = baseNote;
	setupEnvelopeAnimation(piano);
}

function setupEnvelopeAnimation(piano: PianoKeyboard) {
	const loaded = synthUI.gr.handler.graphLoaded;
	synthUI.gr.handler.graphLoaded = function() {
		loaded.bind(synthUI.gr.handler)();
		let adsr = null;
		for (const node of synthUI.gr.nodes) {
			const data: NodeData = node.data;
			if (data.type == 'ADSR') {
				adsr = data.anode;
				break;
			}
		}
		piano.setEnvelope(adsr || { attack: 0, release: 0 });
	}
}

function setupPalette() {
	$(function() {
		$('.nano')['nanoScroller']();
	});
}