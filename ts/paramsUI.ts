import { Node } from './graph';
import { NodeDef } from './synth';

//TODO refactor main so that SynthNode is available
export function renderParams(n: any, ndef: NodeDef, panel: JQuery) {
	panel.empty();
	for (const param of Object.keys(ndef.audioParams || {}))
		renderAudioParam(n.anode, ndef, param, panel);
	for (const param of Object.keys(ndef.params || {}))
		renderOtherParam(n.anode, ndef, param, panel);
}

function renderAudioParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery) {
	const range: ParamRange = ndef.paramTypes[param];
	const aparam: AudioParam = anode[param];
	const sliderBox = $('<div class="slider-box">');
	const slider = $('<input type="range" orient="vertical">')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.001)
		.attr('value', param2slider(aparam.value, range))
		.on('input', _ => {
			const value = slider2param(parseFloat(slider.val()), range);
			aparam.setValueAtTime(value, 0);
		});
	sliderBox.append(slider);
	slider.after('<br/>' + ucfirst(param));
	panel.append(sliderBox);
}

function renderOtherParam(n: Node, ndef: NodeDef, param: string, panel: JQuery) {
	console.log(n.name, param);
}

function param2slider(paramValue: number, range: ParamRange): number {
	const logRange = Math.log10(range.max - range.min);
	return Math.log10(paramValue - range.min) / logRange;
}

function slider2param(sliderValue: number, range: ParamRange): number {
	const logRange = Math.log10(range.max - range.min);
	return range.min + Math.pow(10, sliderValue * logRange);
}

interface ParamRange {
	min: number,
	max: number
}

//-------------------- Misc utilities --------------------

function ucfirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

interface MathLog10 extends Math {
	log10: (number) => number
}

declare var Math: MathLog10;

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) / Math.LN10;
};

