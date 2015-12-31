import { Keyboard } from './keyboard';
import { PianoKeyboard } from './piano';
import { SynthUI, NodeData } from './synthUI';

export function setupNoteInputs(synthUI: SynthUI) {
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
	setupEnvelopeAnimation(piano, synthUI);
}

function setupEnvelopeAnimation(piano: PianoKeyboard, synthUI: SynthUI) {
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

