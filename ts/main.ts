import { Graph, Node } from './graph';
import { Synth } from './synth';
import { renderParams } from './paramsUI';


class SynthNode extends Node {
	anode: ModernAudioNode;
	type: string;
	isControl: boolean;
	controlParam: string; 

	addInput(n: SynthNode) {
		super.addInput(n);
		if (n.isControl) {
			if (!n.controlParam)
				n.controlParam = 'TODO';//TODO retrieve first available control param
			n.anode.connect(this.anode[n.controlParam]);
			//TODO connect to parameter
		}
		else n.anode.connect(this.anode);
	}

	removeInput(np: SynthNode | number): Node {
		const removed: SynthNode = <SynthNode>super.removeInput(np);
		if (removed.isControl) {
			//TODO disconnect parameter (...if possible)			
		}
		else {
			//TODO test fan-out
			removed.anode.disconnect(this.anode);
		}
		return removed;
	}

	canBeSource(): boolean {
		return this.anode.numberOfOutputs > 0;
	}

	canConnectInput(n: SynthNode): boolean {
		if (n.isControl) return true;
		return this.anode.numberOfInputs > 0;
	}
}

interface ModernAudioNode extends AudioNode {
	disconnect(output?: number | AudioNode | AudioParam): void
}

const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);
const synth = new Synth();

main();

function main() {
	registerNodeSelection();
	setArrowColors();
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
		n.anode = synth.createAudioNode(n.type);
		n.isControl = synth.palette[n.type].control;
		gr.addNode(n, n.isControl ? 'node-ctrl' : undefined);
		if (!n.anode) {
			console.warn(`No AudioNode found for '${n.type}'`);
			n.element.css('background-color', '#BBB');
		}
		else {
			if (n.anode['start']) n.anode['start']();
		}
	});
}

function setArrowColors() {
	const arrowColor = getCssFromClass('arrow', 'color');
	const ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	const originalDrawArrow = gr.graphDraw.drawArrow;
	gr.graphDraw.drawArrow = function(srcNode: SynthNode, dstNode: SynthNode) {
		this.arrowColor = srcNode.isControl ? ctrlArrowColor : arrowColor;
		originalDrawArrow.bind(this)(srcNode, dstNode);
	}
}

function getCssFromClass(className, propName) {	
	const tmp = $('<div>').addClass(className);
	$('body').append(tmp);
	const propValue = tmp.css(propName);
	tmp.remove();
	return propValue;
}