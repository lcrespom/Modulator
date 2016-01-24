import { Node } from './graph';
import { NodeData } from '../synth/synth';
import { NodeDef, NodeParamDef } from '../synth/palette';
import { log2linear, linear2log } from '../utils/modern';

/**
 * Renders the UI controls associated with the parameters of a given node
 */
export function renderParams(ndata: NodeData, panel: JQuery): void {
	panel.empty();
	const boxes: JQuery[] = [];
	if (ndata.nodeDef.control && ndata.controlParams)
		boxes.push(renderParamControl(ndata, panel));
	const params = Object.keys(ndata.nodeDef.params || {});
	if (params.length <= 0) return;
	for (const param of params)
		if (ndata.anode[param] instanceof AudioParam)
			boxes.push(renderAudioParam(ndata.anode, ndata.nodeDef, param, panel));
		else
			boxes.push(renderOtherParam(ndata.anode, ndata.nodeDef, param, panel));
	positionBoxes(panel, boxes);
}


function positionBoxes(panel: JQuery, boxes: JQuery[]) {
	const pw = panel.width();
	const bw = boxes[0].width();
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
	const aparam: AudioParam = anode[param];
	if (aparam['_value']) aparam.value = aparam['_value'];
	return renderSlider(panel, pdef, param, aparam.value, value => {
		aparam.value = value;
		aparam['_value'] = value;
	});
}

function renderParamControl(ndata: NodeData, panel: JQuery): JQuery {
	if (!ndata.controlParams) return;
	const combo = renderCombo(panel, ndata.controlParams, ndata.controlParam, 'Controlling');
	combo.change(_ => {
		if (ndata.controlParam)
			ndata.anode.disconnect(ndata.controlTarget[ndata.controlParam]);
		ndata.controlParam = combo.val();
		ndata.anode.connect(ndata.controlTarget[ndata.controlParam]);
	});
	return combo.parent();
}

function renderOtherParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery): JQuery {
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
		return pdef.phandler.renderParam(panel, pdef, anode, param, ucfirst(param));
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
		.attr('min', pdef.min)
		.attr('max', pdef.max)
		.attr('value', truncateFloat(value, 5));
	sliderBox.append(numInput);
	sliderBox.append(slider);
	sliderBox.append($('<span><br/>' + ucfirst(param) + '</span>'));
	panel.append(sliderBox);
	slider.on('input', _ => {
		const value = slider2param(parseFloat(slider.val()), pdef);
		numInput.val(truncateFloat(value, 5));
		setValue(value);
	});
	numInput.on('input', _ => {
		const value = parseFloat(numInput.val());
		if (isNaN(value)) return;
		slider.val(param2slider(value, pdef));
		setValue(value);
	});
	return sliderBox;
}

function renderCombo(panel: JQuery, choices: string[], selected: string, label: string): JQuery {
	const choiceBox = $('<div class="choice-box">');
	const combo = $('<select>').attr('size', choices.length);
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

function renderBoolean(panel: JQuery, pdef: NodeParamDef, param: string, anode: AudioNode, label: string): JQuery {
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
	if (pdef.linear)
		return (paramValue - pdef.min) / (pdef.max - pdef.min);
	else
		return linear2log(paramValue, pdef.min, pdef.max);
}

function slider2param(sliderValue: number, pdef: NodeParamDef): number {
	if (pdef.linear)
		return pdef.min + sliderValue * (pdef.max - pdef.min);
	else
		return log2linear(sliderValue, pdef.min, pdef.max);
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