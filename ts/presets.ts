import { SynthUI } from './synthUI';

const MAX_PRESETS = 20;

/**
 * Manages the presets box:
 * - Handles navigation through presets
 * - Handles preset loading & saving
 */
export class Presets {

	synthUI: SynthUI;
	presets: any[];
	presetNum: number = 0;

	constructor(synthUI: SynthUI) {
		this.synthUI = synthUI;
		this.registerListeners();
		this.loadPresets();
	}

	loadPresets() {
		this.presets = new Array(MAX_PRESETS);
		for (let i = 0; i < MAX_PRESETS; i++)
			this.presets[i] = this.getEmptyPreset();
		$.get('js/presets.json', data => {
			if (!(data instanceof Array)) return;
			for (let i = 0; i < MAX_PRESETS; i++)
				if (data[i]) this.presets[i] = data[i];
			this.preset2synth();
		});
	}

	getEmptyPreset(): any {
		return {
			name: '',
			nodes: [
				{ id: 0, x: 500, y: 180, name: 'Out', inputs: [], classes: 'node node-out' }
			],
			nodeData: [
				{ type: 'out', params: {} }
			]
		};
	}

	checkButtons() {
		$('#prev-preset-but').prop('disabled', this.presetNum <= 0);
		$('#next-preset-but').prop('disabled', this.presetNum >= MAX_PRESETS - 1);
	}

	registerListeners() {
		$('#save-but').click(_ => {
			const json = this.synthUI.gr.toJSON();
			json.name = $('#preset-name').val();
			prompt(
				'Copy the text below to the clipboard and save it to a local text file',
				JSON.stringify(json)
			);
		});
		$('#load-but').click(_ => {
			const json = prompt('Paste below the contents of a previously saved synth');
			if (json) {
				this.presets[this.presetNum] = JSON.parse(json);
				this.preset2synth();
			}
		});
		$('#prev-preset-but').click(_ => this.changePreset(-1));
		$('#next-preset-but').click(_ => this.changePreset(+1));
		$('body').keydown(evt => {
			if (evt.target.nodeName == 'INPUT') return;
			if (evt.keyCode == 37) this.changePreset(-1);
			if (evt.keyCode == 39) this.changePreset(+1);
		});
	}

	changePreset(increment: number) {
		const newNum = this.presetNum + increment;
		if (newNum < 0 || newNum >= MAX_PRESETS) return;
		this.synth2preset();
		this.presetNum = newNum;
		this.preset2synth();
	}

	synth2preset() {
		this.presets[this.presetNum] = this.synthUI.gr.toJSON();
		this.presets[this.presetNum].name = $('#preset-name').val();
	}

	preset2synth() {
		const preset = this.presets[this.presetNum];
		$('#preset-num').text(this.presetNum + 1);
		$('#preset-name').val(preset.name);
		$('#node-params').empty();
		this.checkButtons();
		this.synthUI.gr.fromJSON(preset);
	}

}

