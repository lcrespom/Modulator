import { Graph, Node } from './graph';
import { Synth } from './synth';
import { renderParams } from './paramsUI';


class SynthNode extends Node {
	anode: AudioNode;
	type: string;

	addInput(n: SynthNode) {
		super.addInput(n);
		n.anode.connect(this.anode);
	}

	removeInput(np: SynthNode | number): Node {
		const removed: SynthNode = <SynthNode>super.removeInput(np);
		removed.anode.disconnect();
		return removed;
	}

	canBeSource(): boolean {
		return this.anode.numberOfOutputs > 0;
	}

	canConnectInput(n: Node): boolean {
		return this.anode.numberOfInputs > 0;
	}
}


const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);
const synth = new Synth();

main();

function main() {
	registerNodeSelection();
	setArrowColor();
	registerPaletteHandler();
	registerPlayHandler();
	addOutputNode();
}

function registerNodeSelection() {
	gr.nodeSelected = function(n: SynthNode) {
		renderParams(n.anode, synth.palette[n.type], $('.params-box'));
	}
}

function addOutputNode() {
	const out = new SynthNode(500, 180, 'Out');
	out.anode = synth.ac.destination;
	out.type = 'Speaker';
	gr.addNode(out);
}

function registerPlayHandler() {
	let playing = false;

	const $playBut = $('#play-stop');
	$playBut.click(togglePlayStop);
	$('body').keypress(evt => {
		if (evt.keyCode == 32)
			togglePlayStop();
	});

	function togglePlayStop() {
		if (playing) {
			synth.stop();
			$playBut.text('Play');
		}
		else {
			synth.play();
			$playBut.text('Stop');
		}
		playing = !playing;
	}

}

function registerPaletteHandler() {
	$('.palette > .node').click(function(evt) {
		const elem = $(this);
		const n = new SynthNode(260, 180, elem.text());
		n.type = elem.attr('data-type');
		n.anode = synth.createNode(n.type);
		gr.addNode(n);
		if (!n.anode) {
			console.warn(`No AudioNode found for '${n.type}'`);
			n.element.css('background-color', '#BBB');
		}
		else {
			if (n.anode['start']) n.anode['start']();
		}
	});
}


function setArrowColor() {
	const tmp = $('<div>').addClass('arrow');
	$('body').append(tmp);
	gr.arrowColor = tmp.css('color');
	tmp.remove();
}