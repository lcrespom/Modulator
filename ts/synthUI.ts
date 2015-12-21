import { NoteHandler, NoteHandlers } from './notes';

export class SynthUI {
	gr: Graph;
	synth: Synth;

	constructor(graphCanvas: HTMLCanvasElement, jqParams: JQuery) {
		this.gr = new Graph(graphCanvas);
		this.gr.handler = new SynthGraphHandler(jqParams);
		this.synth = new Synth();
		this.registerPaletteHandler();
		this.addOutputNode();
	}

	addOutputNode() {
		//TODO avoid using hardcoded position
		const out = new Node(500, 180, 'Out');
		const data = new NodeData();
		out.data = data;
		data.anode = this.synth.ac.destination;
		data.nodeDef = this.synth.palette['Speaker'];
		this.gr.addNode(out);
	}

	registerPaletteHandler() {
		var self = this;	// JQuery sets 'this' in event handlers
		$('.palette > .node').click(function(evt) {
			const elem = $(this);
			self.addNode(elem.attr('data-type'), elem.text());
		});
	}

	addNode(type: string, text: string): void {
		const n = new Node(260, 180, text);
		const data = new NodeData();
		n.data = data;
		data.anode = this.synth.createAudioNode(type);
		data.nodeDef = this.synth.palette[type];
		this.gr.addNode(n, data.nodeDef.control ? 'node-ctrl' : undefined);
		if (!data.anode) {
			console.warn(`No AudioNode found for '${type}'`);
			n.element.css('background-color', '#BBB');
		}
		else {
			const nh = data.nodeDef.noteHandler; 
			if (nh) {
				data.noteHandler = new NoteHandlers[nh](data.anode);
				this.synth.addNoteHandler(data.noteHandler);
			}
		}
	}

}


export class NodeData {
	// Used by all nodes
	anode: ModernAudioNode;
	nodeDef: NodeDef;
	// Used by control nodes
	controlParam: string;
	controlParams: string[];
	controlTarget: ModernAudioNode;
	// Used by source audio nodes
	noteHandler: NoteHandler;
}


//-------------------- Privates --------------------

import { Graph, Node, GraphHandler } from './graph';
import { Synth, NodeDef } from './synth';
import { renderParams } from './paramsUI';

class SynthGraphHandler implements GraphHandler {

	jqParams: JQuery;
	arrowColor: string;
	ctrlArrowColor: string;

	constructor(jqParams) {
		this.jqParams = jqParams;
		this.arrowColor = getCssFromClass('arrow', 'color');
		this.ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	}

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

	connected(src: Node, dst: Node): void {
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

	disconnected(src: Node, dst: Node): void {
		const srcData: NodeData = src.data;
		const dstData: NodeData = dst.data;
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = null;
			srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
		}
		else //TODO test fan-out
			srcData.anode.disconnect(dstData.anode);
	}

	nodeSelected(n: Node): void {
		const data: NodeData = n.data;
		renderParams(data, this.jqParams);
	}

	getArrowColor(src: Node, dst: Node): string {
		const srcData: NodeData = src.data;
		return srcData.nodeDef.control ? this.ctrlArrowColor : this.arrowColor;
	}
}


interface ModernAudioNode extends AudioNode {
	disconnect(output?: number | AudioNode | AudioParam): void
}

function getCssFromClass(className, propName) {
	const tmp = $('<div>').addClass(className);
	$('body').append(tmp);
	const propValue = tmp.css(propName);
	tmp.remove();
	return propValue;
}
