import { Node } from './graph';
import { NodeData } from '../synth/synth';
import { NodeDef, NodeParamDef } from '../synth/palette';
import { log2linear, linear2log } from '../utils/modern';
import * as file from '../utils/file';
import * as popups from '../utils/popups';

/**
 * Renders the UI controls associated with the parameters of a given node
 */
export function renderParams(ndata: NodeData, panel: JQuery): void {
	panel.empty();
	const boxes: JQuery[] = [];
	if (ndata.nodeDef.control && ndata.controlParams) {
		let box = renderParamControl(ndata, panel);
		if (box) boxes.push(box);
	}
	const params = Object.keys(ndata.nodeDef.params || {});
	if (params.length <= 0) return;
	for (const param of params)
		if ((<any>ndata.anode)[param] instanceof AudioParam) {
			boxes.push(renderAudioParam(ndata.anode, ndata.nodeDef, param, panel));
		}
		else {
			let box = renderOtherParam(ndata.anode, ndata.nodeDef, param, panel);
			if (box) boxes.push(box);
		}
	positionBoxes(panel, boxes);
}


function positionBoxes(panel: JQuery, boxes: JQuery[]) {
	if (boxes.length < 1) return;
	const pw = panel.width() || 0;
	const bw = boxes[0].width() || 0;
	const sep = (pw - boxes.length * bw) / (boxes.length + 1);
	let x = sep;
	for (const box of boxes) {
		box.css({
			position: 'relative',
			left: x
		});
		x += sep;
	}
}

function renderAudioParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery): JQuery {
	const pdef: NodeParamDef = ndef.params[param];
	const aparam: any = (<any>anode)[param];
	if (aparam['_value']) aparam.value = aparam['_value'];
	return renderSlider(panel, pdef, param, aparam.value, value => {
		aparam.value = value;
		aparam['_value'] = value;
	});
}

function renderParamControl(ndata: NodeData, panel: JQuery): JQuery | null {
	if (!ndata.controlParams) return null;
	const combo = renderCombo(panel, ndata.controlParams, ndata.controlParam, 'Controlling');
	combo.change(_ => {
		if (ndata.controlParam)
			ndata.anode.disconnect((<any>ndata.controlTarget)[ndata.controlParam]);
		ndata.controlParam = '' + combo.val();
		ndata.anode.connect((<any>ndata.controlTarget)[ndata.controlParam]);
	});
	return combo.parent();
}

const customRenderMethods = {
	renderBufferData,
	renderSoundBank
};

function renderOtherParam(anode: any, ndef: NodeDef,
	param: string, panel: JQuery): JQuery | null {
	const pdef: NodeParamDef = ndef.params[param];
	if (pdef.choices) {
		const combo = renderCombo(panel, pdef.choices, anode[param], ucfirst(param));
		combo.change(_ => {
			anode[param] = combo.val();
		});
		return combo.parent();
	}
	else if (pdef.min != undefined)
		return renderSlider(panel, pdef, param, anode[param], value => anode[param] = value);
	else if (typeof pdef.initial == 'boolean')
		return renderBoolean(panel, pdef, param, anode, ucfirst(param));
	else if (pdef.phandler)
		return (<any>customRenderMethods)[pdef.phandler.uiRender](panel, pdef, anode, param, ucfirst(param));
	return null;
}


function renderSlider(panel: JQuery, pdef: NodeParamDef,
	param: string, value: number, setValue: (value: number) => void): JQuery {
	const sliderBox = $('<div class="slider-box">');
	const slider = $('<input type="range" orient="vertical">')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.001)
		.attr('value', param2slider(value, pdef))
	const numInput = $('<input type="number">')
		.attr('min', pdef.min || 0)
		.attr('max', pdef.max || 1)
		.attr('value', truncateFloat(value, 5));
	sliderBox.append(numInput);
	sliderBox.append(slider);
	sliderBox.append($('<span><br/>' + ucfirst(param) + '</span>'));
	panel.append(sliderBox);
	slider.on('input', _ => {
		const value = slider2param(parseFloat('' + slider.val()), pdef);
		numInput.val(truncateFloat(value, 5));
		setValue(value);
	});
	numInput.on('input', _ => {
		const value = parseFloat('' + numInput.val());
		if (isNaN(value)) return;
		slider.val(param2slider(value, pdef));
		setValue(value);
	});
	return sliderBox;
}

function renderCombo(panel: JQuery, choices: string[], selected: string, label: string): JQuery {
	const choiceBox = $('<div class="choice-box">');
	const combo = $('<select>').attr('size', choices.length || 2);
	for (const choice of choices) {
		const option = $('<option>').text(choice);
		if (choice == selected) option.attr('selected', 'selected');
		combo.append(option);
	}
	choiceBox.append(combo);
	combo.after('<br/><br/>' + label);
	panel.append(choiceBox);
	return combo;
}

function renderBoolean(panel: JQuery, pdef: NodeParamDef, param: string,
	anode: any, label: string): JQuery {
	const box = $('<div class="choice-box">');
	const button = $('<button class="btn btn-info" data-toggle="button" aria-pressed="false">');
	box.append(button);
	button.after('<br/><br/>' + label);
	panel.append(box);
	if (anode[param]) {
		button.text('Enabled');
		button.addClass('active');
		button.attr('aria-pressed', 'true');
	}
	else {
		button.text('Disabled');
		button.removeClass('active');
		button.attr('aria-pressed', 'false');
	}
	button.click(_ => {
		anode[param] = !anode[param];
		button.text(anode[param] ? 'Enabled' : 'Disabled');
	});
	return box;
}


function param2slider(paramValue: number, pdef: NodeParamDef): number {
	let min = pdef.min || 0;
	let max = pdef.max || 1;
	if (pdef.linear)
		return (paramValue - min) / (max - min);
	else
		return linear2log(paramValue, min, max);
}

function slider2param(sliderValue: number, pdef: NodeParamDef): number {
	let min = pdef.min || 0;
	let max = pdef.max || 1;
	if (pdef.linear)
		return min + sliderValue * (max - min);
	else
		return log2linear(sliderValue, min, max);
}


//-------------------- Custom parameter rendering --------------------

function renderBufferData(panel: JQuery, pdef: NodeParamDef,
	anode: any, param: string, label: string): JQuery {
	const box = $('<div class="choice-box">');
	const button = $(`
		<span class="btn btn-primary upload">
			<input type="file">
			Load&nbsp;
			<span class="glyphicon glyphicon-open" aria-hidden="true"></span>
		</span>`);
	box.append(button);
	button.after('<br/><br/>' + label);
	panel.append(box);
	let loading = true;
	button.find('input').change(evt => {
		// Trigger asynchronous upload & decode
		file.uploadArrayBuffer(evt, soundFile => {
			anode['_encoded'] = soundFile;
			anode.context.decodeAudioData(soundFile, (buffer: any) => {
				anode['_buffer'] = buffer;
				loading = false;
				//TODO capture errors and report them with popups.alert
				popups.close();
			});
		});
		// Open progress popup
		setTimeout(_ => {
			if (loading)
				popups.progress('Loading and decoding audio data...');
		}, 300);
	});
	return box;
}

function setComboOptions(combo: JQuery, names: string[]) {
	combo.empty();
	for (const name of names)
		combo.append('<option>' + name + '</option>');
}

function renderSoundBank(panel: JQuery, pdef: NodeParamDef,
	anode: any, param: string, label: string): JQuery {
	const combo = renderCombo(panel, [], '', 'Buffers');
	combo.css({
		marginBottom: '10px', marginLeft: '-20px',
		width: '140px', height: '100px',
		overflowX: 'auto'
	});
	const buttons = $(`<div style="margin-bottom: -24px">
		<span class="btn btn-primary upload">
			<input type="file">
			<span class="glyphicon glyphicon-open" aria-hidden="true"></span>
		</span>
		&nbsp;&nbsp;&nbsp;
		<span class="btn btn-danger">
			<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
		</span></div>`);
	combo.after(buttons);
	const bufs = anode['_buffers'];
	const encs = anode['_encodedBuffers'];
	const names = anode['_names'];
	setComboOptions(combo, names);
	buttons.find('input').change(evt => {
		// Trigger asynchronous upload & decode
		file.uploadArrayBuffer(evt, (fileData, file) => {
			encs.push(fileData);
			anode.context.decodeAudioData(fileData,
				(buffer: any) => bufs.push(buffer));
			names.push(file.name);
			setComboOptions(combo, names);
		});
	});
	buttons.find('.btn-danger').click(_ => {
		const idx = names.indexOf(combo.val());
		if (idx < 0) return;
		[encs, bufs, names].forEach(a => a.splice(idx, 1));
		setComboOptions(combo, names);
	});
	return combo.parent();
}

//-------------------- Misc utilities --------------------

function ucfirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

function truncateFloat(f: number, len: number): string {
	let s: string = '' + f;
	s = s.substr(0, len);
	if (s[s.length - 1] == '.') return s.substr(0, len - 1);
	else return s;
}