import { NoteHandler, NoteHandlers } from './notes';
import { ModernAudioNode } from './modern';
import * as popups from './popups';

/**
 * Customizes the generic graph editor in order to manipulate and control a graph of
 * AudioNodes
 */
export class SynthUI {
	gr: Graph;
	synth: Synth;
	nw: number;
	nh: number;
	outNode: ModernAudioNode;

	constructor(graphCanvas: HTMLCanvasElement, jqParams: JQuery) {
		this.gr = new Graph(graphCanvas);
		this.gr.handler = new SynthGraphHandler(this, jqParams);
		this.synth = new Synth();
		this.registerPaletteHandler();
		this.addOutputNode();
	}

	addOutputNode() {
		//TODO avoid using hardcoded position
		const out = new Node(500, 210, 'Out');
		out.data = new NodeData();
		this.initOutputNodeData(out.data);
		this.gr.addNode(out, 'node-out');
		this.initNodeDimensions(out);
	}

	initOutputNodeData(data: NodeData): void {
		data.type = 'out';
		data.anode = this.synth.ac.createGain();
		data.anode.connect(this.synth.ac.destination);
		data.nodeDef = this.synth.palette['Speaker'];
		data.isOut = true;
		this.outNode = data.anode;
	}

	registerPaletteHandler() {
		var self = this;	// JQuery sets 'this' in event handlers
		$('.palette .node').click(function(evt) {
			const elem = $(this);
			const classes = elem.attr('class').split(/\s+/).filter(c => c != 'node');
			self.addNode(elem.attr('data-type'), elem.text(), classes.join(' '));
		});
	}

	addNode(type: string, text: string, classes: string): void {
		let { x, y } = this.findFreeSpot();
		const n = new Node(x, y, text);
		this.createNodeData(n, type);
		this.gr.addNode(n, classes);
		this.gr.selectNode(n);
	}

	removeNode(n: Node): void {
		this.gr.removeNode(n);
	}

	removeNodeData(data: NodeData): void {
		if (data.noteHandler)
			this.synth.removeNoteHandler(data.noteHandler);
	}

	createNodeData(n: Node, type: string): void {
		const data = new NodeData();
		n.data = data;
		if (type == 'out')
			return this.initOutputNodeData(n.data);
		data.type = type;
		data.anode = this.synth.createAudioNode(type);
		if (!data.anode)
			return console.error(`No AudioNode found for '${type}'`);
		data.nodeDef = this.synth.palette[type];
		const nh = data.nodeDef.noteHandler;
		if (nh) {
			data.noteHandler = new NoteHandlers[nh](n);
			this.synth.addNoteHandler(data.noteHandler);
		}
		// LFO does not have a note handler yet needs to be started
		else if (data.anode['start']) data.anode['start']();
	}

	//----- Rest of methods are used to find a free spot in the canvas -----

	findFreeSpot() {
		let maxDist = 0;
		const canvasW = this.gr.canvas.width;
		const canvasH = this.gr.canvas.height;
		let x = canvasW / 2;
		let y = canvasH / 2;
		for (let xx = 10; xx < canvasW - this.nw; xx += 10) {
			for (let yy = 10; yy < canvasH - this.nh; yy += 10) {
				const dist = this.dist2nearestNode(xx, yy);
				if (dist > maxDist && dist < this.nw * 3) {
					x = xx;
					y = yy;
					maxDist = dist;
				}
			}
		}
		return { x, y };
	}

	dist2nearestNode(x: number, y: number) {
		let minDist = Number.MAX_VALUE;
		for (const n of this.gr.nodes) {
			const dx = x - n.x;
			const dy = y - n.y;
			const dist = Math.sqrt(dx*dx + dy*dy);
			if (dist < minDist) minDist = dist;
		}
		return minDist;
	}

	initNodeDimensions(n) {
		this.nw = n.element.outerWidth();
		this.nh = n.element.outerHeight();
	}

}

/**
 * Holds all data associated with an AudioNode in the graph
 */
export class NodeData {
	// Used by all nodes
	type: string;
	anode: ModernAudioNode;
	nodeDef: NodeDef;
	// Used by control nodes
	controlParam: string;
	controlParams: string[];
	controlTarget: ModernAudioNode;
	// Used by source audio nodes
	noteHandler: NoteHandler;
	// Flag to avoid deleting output node
	isOut: boolean = false;
}


//-------------------- Privates --------------------

import { Graph, Node, GraphHandler } from './graph';
import { Synth } from './synth';
import { NodeDef } from './palette';
import { renderParams } from './paramsUI';
import { AudioAnalyzer } from './analyzer';

class SynthGraphHandler implements GraphHandler {

	synthUI: SynthUI;
	jqParams: JQuery;
	arrowColor: string;
	ctrlArrowColor: string;
	analyzer: AudioAnalyzer;

	constructor(synthUI: SynthUI, jqParams: JQuery) {
		this.synthUI = synthUI;
		this.jqParams = jqParams;
		this.arrowColor = getCssFromClass('arrow', 'color');
		this.ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
		this.registerNodeDelete();
		this.analyzer = new AudioAnalyzer($('#audio-graph-fft'), $('#audio-graph-osc'));
	}

	registerNodeDelete() {
		$('body').keydown(evt => {
			if (!(evt.keyCode == 46 || (evt.keyCode == 8 && evt.metaKey))) return;
			const selectedNode = this.getSelectedNode();
			if (!selectedNode) return;
			if (selectedNode.data.isOut) return;
			popups.confirm('Delete node?',
				'Please confirm node deletion', confirmed => {
				if (!confirmed) return;
				this.synthUI.removeNode(selectedNode);
				this.jqParams.empty();
			});
		});
	}

	getSelectedNode(): Node {
		for (const node of this.synthUI.gr.nodes)
			if (node.element.hasClass('selected')) return node;
		return null;
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
		else
			srcData.anode.disconnect(dstData.anode);
	}

	nodeSelected(n: Node): void {
		const data: NodeData = n.data;
		renderParams(data, this.jqParams);
	}

	nodeRemoved(n: Node) {
		this.synthUI.removeNodeData(n.data);
	}

	getArrowColor(src: Node, dst: Node): string {
		const srcData: NodeData = src.data;
		return srcData.nodeDef.control ? this.ctrlArrowColor : this.arrowColor;
	}

	data2json(n: Node): any {
		const data: NodeData = n.data;
		const params = {};
		for (const pname of Object.keys(data.nodeDef.params)) {
			const pvalue = data.anode[pname];
			if (pvalue instanceof AudioParam)
				if (pvalue['_value'] === undefined) params[pname] = pvalue.value;
				else params[pname] = pvalue['_value'];
			else params[pname] = pvalue;
		}
		return {
			type: data.type,
			params,
			controlParam: data.controlParam,
			controlParams: data.controlParams
		}
	}

	json2data(n: Node, json: any): void {
		this.synthUI.createNodeData(n, json.type);
		const data: NodeData = n.data;
		for (const pname of Object.keys(json.params)) {
			const pvalue = data.anode[pname];
			const jv = json.params[pname];
			if (pvalue instanceof AudioParam) {
				pvalue.value = jv;
				pvalue['_value'] = jv;
			}
			else data.anode[pname] = jv;
		}
	}

	graphLoaded() {
		this.analyzer.analyze(this.synthUI.outNode);
	}

	graphSaved() {}
}


function getCssFromClass(className, propName) {
	const tmp = $('<div>').addClass(className);
	$('body').append(tmp);
	const propValue = tmp.css(propName);
	tmp.remove();
	return propValue;
}
