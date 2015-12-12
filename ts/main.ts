import { Graph, Node } from './graph';
import { Synth } from './audio';


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
	setArrowColor();
	registerPaletteHandler();
	registerPlayHandler();
	addOutputNode();
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
	$playBut.click(_ => {
		if (playing) {
			stop();
			$playBut.text('Play');
		}
		else {
			play();
			$playBut.text('Stop');
		}
		playing = !playing;
	});
}

function play() {
	gr.nodes
		.filter(n => (<any>n).anode.start)
		.forEach(n => (<any>n).anode.start())
}

function stop() {
	gr.nodes
		.filter(n => (<any>n).anode.stop)
		.forEach(n => (<any>n).anode.stop())
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