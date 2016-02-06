import { SynthUI } from './synthUI';
import * as popups from '../utils/popups';
import * as file from '../utils/file';
import { focusable } from '../utils/modern';

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
		this.registerListeners(synthUI.gr.canvas);
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

	registerListeners(elem) {
		$('#save-but').click(_ => this.savePreset());
		$('#load-file').on('change', evt  => this.loadPreset(evt));
		$('#prev-preset-but').click(_ => this.changePreset(this.presetNum - 1));
		$('#next-preset-but').click(_ => this.changePreset(this.presetNum + 1));
		$(focusable(elem)).keydown(evt => {
			if (evt.target.nodeName == 'INPUT' || popups.isOpen) return;
			if (evt.keyCode == 37) this.changePreset(this.presetNum - 1);
			if (evt.keyCode == 39) this.changePreset(this.presetNum + 1);
		});
		$('#preset-num').click(_ => this.togglePresetSelector());
		const preSel = $('.preset-selector select');
		preSel.change(_ => {
			const sel = preSel.val().split(':')[0];
			this.changePreset(sel - 1);
		});
	}

	togglePresetSelector() {
		const seldiv = $('.preset-selector');
		seldiv.toggle();
		if (!seldiv.is(':visible')) return;
		// Fill select contents
		this.synth2preset();
		const sel = seldiv.find('select');
		sel.empty();
		sel.focus();
		let i = 0;
		for (const preset of this.presets) {
			const selected = i == this.presetNum ? ' selected' : '';
			i++;
			if (preset.nodes.length > 1)
				sel.append(`<option${selected}>${i}: ${preset.name}</option>`);
		}
	}

	changePreset(newNum: number) {
		if (newNum < 0) newNum = MAX_PRESETS - 1;
		else if (newNum >= MAX_PRESETS) newNum = 0;
		this.synth2preset();
		this.presetNum = newNum;
		this.preset2synth();
	}

	synth2preset() {
		const json = this.synthUI.gr.toJSON();
		json.name = $('#preset-name').val().trim();
		json.modulatorType = 'synth';
		this.beforeSave(json);
		this.presets[this.presetNum] = json;
		return json;
	}

	preset2synth() {
		const preset = this.presets[this.presetNum];
		this.afterLoad(preset);
		$('#preset-num').text(this.presetNum + 1);
		$('#preset-name').val(preset.name);
		$('#node-params').empty();
		this.synthUI.gr.fromJSON(preset);
		this.selectBestNode();
	}

	selectBestNode() {
		const getFirstNode = (isGood) => this.synthUI.gr.nodes.filter(isGood)[0];
		let n = getFirstNode(n => n.data.type == 'Filter');
		if (!n) n = getFirstNode(n => n.data.type == 'ADSR');
		if (!n) n = getFirstNode(n => n.data.anode.numberOfInputs == 0);
		if (n) this.synthUI.gr.selectNode(n);
	}

	loadPreset(evt) {
		file.uploadText(evt, data => {
			try {
				const json = JSON.parse(data);
				if (json.modulatorType != 'synth') throw 'Invalid file format';
				this.presets[this.presetNum] = json;
				this.preset2synth();
			}
			catch (e) {
				console.error(e);
				popups.alert('Could not load synth: invalid file format', 'Load error');
			}
		});
	}

	savePreset() {
		const json = this.synth2preset();
		const jsonData = JSON.stringify(json);
		if (file.browserSupportsDownload()) {
			if (json.name.length == 0) json.name = '' + this.presetNum;
			file.download(json.name + '.json', jsonData);
		}
		else {
			popups.prompt(
				'Copy the text below to the clipboard and save it to a local text file',
				'Save preset', jsonData, null);
		}
	}

	// Extension point to specify additional data to save, e.g. keyboard settings
	beforeSave(json: any): void {}
	// Extension point to handle previously saved additional data
	afterLoad(json: any): void {}
}
