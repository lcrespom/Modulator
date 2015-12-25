import { SynthUI } from './synthUI';

export class Presets {

	synthUI: SynthUI;

	constructor(synthUI: SynthUI) {
		this.synthUI = synthUI;
		this.setupButtons();
	}

	setupButtons() {
		$('#save-but').click(_ =>
			prompt(
				'Copy the text below to the clipboard and save it to a local text file',
				this.synthUI.gr.toJSON()
			)
		);
		$('#load-but').click(_ => {
			const json = prompt('Paste below the contents of a previously saved synth');
			if (json) this.synthUI.gr.fromJSON(json);
		});
	}

}

