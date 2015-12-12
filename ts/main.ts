import { Graph, Node } from './graph';
import { Synth } from './audio';


class SynthNode extends Node {
	anode: AudioNode;
	type: string;

	addInput(n: SynthNode) {
		super.addInput(n);
		n.anode.connect(this.anode);
	}

	removeInput(np: Node | number): Node {
		const removed = super.removeInput(np);
		//TODO disconnect audio nodes
		return removed;
	}
}


const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);
const synth = new Synth();

main();

function main() {
	setArrowColor();
	registerPaletteHandler();
	registerPlayHandler();
	addOuptutNode();
}

function addOuptutNode() {
	const out = new SynthNode(500, 180, 'Out');
	out.anode = synth.ac.destination;
	out.type = 'Speaker';
	gr.addNode(out);
}

function registerPlayHandler() {
	let playing = false;
	const $playBut = $('#play-stop');
	$playBut.click(_ => {
		if (playing) {
			synth.stop();
			$playBut.text('Play');
		}
		else {
			synth.play();
			$playBut.text('Stop');
		}
	});
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
	});
}


function setArrowColor() {
	const tmp = $('<div>').addClass('arrow');
	$('body').append(tmp);
	gr.arrowColor = tmp.css('color');
	tmp.remove();	
}