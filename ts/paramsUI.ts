import { Node } from './graph';
import { NodeDef, NodeParamDef } from './synth';

//TODO refactor main so that SynthNode is available and 'n' can be typed
export function renderParams(n: any, ndef: NodeDef, panel: JQuery) {
	panel.empty();
	for (const param of Object.keys(ndef.params || {}))
		if (n.anode[param] instanceof AudioParam)
			renderAudioParam(n.anode, ndef, param, panel);
		else
			renderOtherParam(n.anode, ndef, param, panel);
}

function renderAudioParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery) {
	const pdef: NodeParamDef = ndef.params[param];
	const aparam: AudioParam = anode[param];
	const sliderBox = $('<div class="slider-box">');
	const slider = $('<input type="range" orient="vertical">')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.001)
		.attr('value', param2slider(aparam.value, pdef))
		.on('input', _ => {
			const value = slider2param(parseFloat(slider.val()), pdef);
			//TODO linear/log ramp at frame rate
			aparam.setValueAtTime(value, 0);
		});
	sliderBox.append(slider);
	slider.after('<br/>' + ucfirst(param));
	panel.append(sliderBox);
}

function renderOtherParam(anode: AudioNode, ndef: NodeDef, param: string, panel: JQuery) {
	console.log(`TODO: render non-AudioParam ${param} = ${ndef.params[param].initial}`);
}

const LOG_BASE = 2;

function logarithm(base: number, x: number): number {
	return Math.log(x) / Math.log(base);
}

function param2slider(paramValue: number, pdef: NodeParamDef): number {
	if (pdef.linear) {
		return (paramValue - pdef.min) / (pdef.max - pdef.min);
	}
	else {
		if (paramValue - pdef.min == 0) return 0;
		const logRange = logarithm(LOG_BASE, pdef.max - pdef.min);
		return logarithm(LOG_BASE, paramValue - pdef.min) / logRange;
	}
}

function slider2param(sliderValue: number, pdef: NodeParamDef): number {
	if (pdef.linear) {
		return pdef.min + sliderValue * (pdef.max - pdef.min);
	}
	else {
		const logRange = logarithm(LOG_BASE, pdef.max - pdef.min);
		return pdef.min + Math.pow(LOG_BASE, sliderValue * logRange);
	}
}


//-------------------- Misc utilities --------------------

function ucfirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}


