import { Node } from './graph';
import { NodeDef } from './synth';

//TODO refactor main so that SynthNode is available
export function renderParams(n: any, ndef: NodeDef, panel: JQuery) {
	const form = $('<form>');
	form.submit(_ => handleForm(form, n.anode));
	panel.empty().append(form);
	for (const param of Object.keys(ndef.audioParams || {}))
		renderAudioParam(n, ndef, param, form);
	for (const param of Object.keys(ndef.params || {}))
		renderOtherParam(n, ndef, param, form);
}

function renderAudioParam(n: any, ndef: NodeDef, param: string, panel: JQuery) {
	panel.append($(`<label>${param}</label>`));
	panel.append($(`<input type="number" name="${param}"
		value="${n.anode[param].value}">`));
}

function renderOtherParam(n: Node, ndef: NodeDef, param: string, panel: JQuery) {
	console.log(n.name, param);
}

function handleForm(form: JQuery, n) {
	form.find(':input').each((i, e) => {
		const $e = $(e);
		//TODO set linear...
		n[$e.attr('name')].setValueAtTime($e.val(), 0);
	});
	return false;
}