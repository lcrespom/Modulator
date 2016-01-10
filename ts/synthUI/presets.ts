import { SynthUI } from './synthUI';
import * as popups from '../popups';

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

	registerListeners() {
		$('#save-but').click(_ => this.savePreset());
		$('#load-file').on('change', evt  => this.loadPreset(evt));
		$('#prev-preset-but').click(_ => this.changePreset(this.presetNum - 1));
		$('#next-preset-but').click(_ => this.changePreset(this.presetNum + 1));
		$('body').keydown(evt => {
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
		this.presets[this.presetNum] = this.synthUI.gr.toJSON();
		this.presets[this.presetNum].name = $('#preset-name').val();
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
		if (!evt.target.files || evt.target.files.length <= 0) return;
		const file = evt.target.files[0];
		const reader = new FileReader();
		reader.onload = (loadEvt: any)  => {
			const json = JSON.parse(loadEvt.target.result);
			this.presets[this.presetNum] = json;
			this.preset2synth();
		};
		reader.readAsText(file);
	}

	savePreset() {
		const json = this.synthUI.gr.toJSON();
		this.beforeSave(json);
		json.name = $('#preset-name').val().trim();
		const jsonData = JSON.stringify(json);
		if (this.browserSupportsDownload()) {
			//TODO: open popup to ask for file name before saving
			if (json.name.length == 0) json.name = '' + this.presetNum;
			const a = $('<a>');
			a.attr('download', json.name + '.json');
			a.attr('href',
				'data:application/octet-stream;base64,' + btoa(jsonData));
			var clickEvent = new MouseEvent('click',
				{ view: window, bubbles: true, cancelable: false });
			a[0].dispatchEvent(clickEvent);
		}
		else {
			popups.prompt(
				'Copy the text below to the clipboard and save it to a local text file',
				'Save preset', jsonData, null);
		}
	}

	browserSupportsDownload(): boolean {
		return !(<any>window).externalHost && 'download' in $('<a>')[0];
	}

	// Extension point to specify additional data to save, e.g. keyboard settings
	beforeSave(json: any): void {}
	// Extension point to handle previously saved additional data
	afterLoad(json: any): void {}
}
