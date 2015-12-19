import { Graph, Node, GraphHandler } from './graph';
import { Synth, NodeDef } from './synth';
import { renderParams } from './paramsUI';

class NodeData {
	anode: ModernAudioNode;
	nodeDef: NodeDef;
	// Used by control nodes only
	controlParam: string;
	controlParams: string[];
	controlTarget: ModernAudioNode;
}

class SynthGraphHandler implements GraphHandler {

	canBeSource(n: Node): boolean {
		const data: NodeData = n.data;
		return data.anode.numberOfOutputs > 0;
	}

	canConnect(src: Node, dst: Node): boolean {
		const srcData: NodeData = src.data;
		const dstData: NodeData = dst.data;
		//TODO even if src node is control, should not connect to Speaker output
		if (srcData.nodeDef.control) return true;
		return dstData.anode.numberOfInputs > 0;
	}

	connected(src: Node, dst: Node) {
		const srcData: NodeData = src.data;
		const dstData: NodeData = dst.data;
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = Object.keys(dstData.nodeDef.params)
				.filter(pname => dstData.anode[pname] instanceof AudioParam);
			srcData.controlParam = srcData.controlParams[0];
			srcData.controlTarget = dstData.anode;
			srcData.anode.connect(dstData.anode[srcData.controlParam]);
			//TODO update params box in case selected node is src
		}
		else srcData.anode.connect(dstData.anode);
	}

	disconnected(src: Node, dst: Node) {
		const srcData: NodeData = src.data;
		const dstData: NodeData = dst.data;
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = null;
			srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
		}
		else //TODO test fan-out
			srcData.anode.disconnect(dstData.anode);
		return srcData;
	}

}


interface ModernAudioNode extends AudioNode {
	disconnect(output?: number | AudioNode | AudioParam): void
}

const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);
gr.handler = new SynthGraphHandler();
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
	gr.nodeSelected = function(n: Node) {
		const data: NodeData = n.data;
		renderParams(data, data.nodeDef, $('#node-params'));
	}
}

function addOutputNode() {
	//TODO avoid using hardcoded position
	const out = new Node(500, 180, 'Out');
	const data = new NodeData();
	out.data = data;
	data.anode = synth.ac.destination;
	data.nodeDef = synth.palette['Speaker'];
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
		const n = new Node(260, 180, elem.text());
		const data = new NodeData();
		n.data = data;
		const type = elem.attr('data-type');
		data.anode = synth.createAudioNode(type);
		data.nodeDef = synth.palette[type];
		gr.addNode(n, data.nodeDef.control ? 'node-ctrl' : undefined);
		if (!data.anode) {
			console.warn(`No AudioNode found for '${type}'`);
			n.element.css('background-color', '#BBB');
		}
		else {
			if (data.anode['start']) data.anode['start']();
		}
	});
}

function setArrowColors() {
	const arrowColor = getCssFromClass('arrow', 'color');
	const ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	const originalDrawArrow = gr.graphDraw.drawArrow;
	gr.graphDraw.drawArrow = function(srcNode: Node, dstNode: Node) {
		const srcData: NodeData = srcNode.data;
		this.arrowColor = srcData.nodeDef.control ? ctrlArrowColor : arrowColor;
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