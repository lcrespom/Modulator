import { Node } from './graph';
import { NodeDef } from './synth';

//TODO refactor main so that SynthNode is available
export function renderParams(n: any, ndef: NodeDef, panel: JQuery) {
	const form = $('<form>');
	form.submit(_ => handleForm(form, n.anode));
	panel.empty().append(form);
	for (const param of Object.keys(ndef.audioParams || {}))
		renderAudioParam(n.anode, ndef, param, form);
	for (const param of Object.keys(ndef.params || {}))
		renderOtherParam(n.anode, ndef, param, form);
}

function renderAudioParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery) {
	const sliderBox = $('<div class="slider-box">');
	const slider = $('<input type="range" orient="vertical">')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.001)
		.attr('value', 0.5)
		.on('input', _ => {
			updateAudioParam(anode, ndef.paramTypes[param], param, slider.val());
		});
	sliderBox.append(slider);
	slider.after('<br/>' + ucfirst(param));
	panel.append(sliderBox);
}

function renderOtherParam(n: Node, ndef: NodeDef, param: string, panel: JQuery) {
	console.log(n.name, param);
}

function updateAudioParam(anode: AudioNode, ndef, param: string, svalue: string) {
	//TODO use log scale
	let value = parseFloat(svalue);
	value = ndef.min + value * (ndef.max - ndef.min);
	anode[param].setValueAtTime(value, 0);
}

function handleForm(form: JQuery, n) {
	form.find(':input').each((i, e) => {
		const $e = $(e);
		//TODO set linear...
		//TODO ramp with frame rate time
		n[$e.attr('name')].setValueAtTime($e.val(), 0);
	});
	return false;
}

function ucfirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}