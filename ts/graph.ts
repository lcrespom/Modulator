const SHIFT_KEY = 16;
const CAPS_LOCK = 20;

/**
 * A generic directed graph editor.
 */
export class Graph {

	nodeCanvas: JQuery;
	canvas: HTMLCanvasElement;
	nodes: Node[] = [];
	graphDraw: GraphDraw;
	graphInteract: GraphInteraction;
	handler: GraphHandler;
	lastId: number = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.nodeCanvas = $(canvas.parentElement);
		this.canvas = canvas;
		const gc = canvas.getContext('2d');
		this.graphDraw = new GraphDraw(this, gc, canvas);
		this.graphInteract = new GraphInteraction(this, gc);
		this.handler = new DefaultGraphHandler();
	}

	addNode(n: Node, classes?: string) {
		n.id = this.lastId++;
		n.element = $('<div>')
			.addClass('node')
			.text(n.name)
			.css({ left: n.x, top: n.y, cursor: 'default' });
		if (classes) n.element.addClass(classes);
		this.nodeCanvas.append(n.element);
		this.nodes.push(n);
		this.graphInteract.registerNode(n);
		this.draw();
	}

	removeNode(n: Node): void {
		const pos = this.nodes.indexOf(n);
		if (pos < 0)
			return console.warn(`Node '${n.name}' is not a member of graph`);
		for (const nn of this.nodes) {
			if (n == nn) continue;
			this.disconnect(n, nn);
			this.disconnect(nn, n);
		}
		this.nodes.splice(pos, 1);
		n.element.remove();
		this.handler.nodeRemoved(n);
		this.draw();
	}

	selectNode(n: Node) {
		this.graphInteract.selectNode(n);
	}

	connect(srcn: Node, dstn: Node): boolean {
		if (!this.handler.canBeSource(srcn) || !this.handler.canConnect(srcn, dstn))
			return false;
		dstn.addInput(srcn);
		this.handler.connected(srcn, dstn);
		return true;
	}

	disconnect(srcn: Node, dstn: Node): boolean {
		if (!dstn.removeInput(srcn)) return false;
		this.handler.disconnected(srcn, dstn);
		return true;
	}

	draw() {
		this.graphDraw.draw();
	}

	toJSON(): any {
		const jsonNodes = [];
		const jsonNodeData = [];
		for (const node of this.nodes) {
			const nodeInputs = [];
			for (const nin of node.inputs)
				nodeInputs.push(nin.id);
			jsonNodes.push({
				id: node.id,
				x: node.x,
				y: node.y,
				name: node.name,
				inputs: nodeInputs,
				classes: this.getAppClasses(node)
			});
			jsonNodeData.push(this.handler.data2json(node));
		}
		const jsonGraph = {
			nodes: jsonNodes,
			nodeData: jsonNodeData
		}
		return jsonGraph;
	}

	fromJSON(json: any) {
		// First, remove existing nodes
		while (this.nodes.length > 0)
			this.removeNode(this.nodes[0]);
		this.lastId = 0;
		// Then add nodes
		for (const jn of json.nodes) {
			const node = new Node(jn.x, jn.y, jn.name);
			this.addNode(node);
			node.id = jn.id;	// Override id after being initialized inside addNode
			node.element.attr('class', jn.classes);
		}
		// Then connect them
		const gh = this.handler;
		this.handler = new DefaultGraphHandler();	// Disable graph handler
		for (let i = 0; i < json.nodes.length; i++) {
			for (const inum of json.nodes[i].inputs) {
				const src = this.nodeById(inum);
				this.connect(src, this.nodes[i]);
			}
		}
		this.handler = gh;	// Restore graph handler
		// Then set their data
		for (let i = 0; i < json.nodes.length; i++) {
			this.handler.json2data(this.nodes[i], json.nodeData[i]);
		}
		// Then notify connections to handler
		for (const dst of this.nodes)
			for (const src of dst.inputs)
				this.handler.connected(src, dst);
		// And finally, draw the new graph
		this.draw();
	}

	nodeById(id: number): Node {
		for (const node of this.nodes)
			if (node.id === id) return node;
		return null;
	}

	getAppClasses(n: Node): string {
		const classes = n.element[0].className.split(/\s+/);
		const result = [];
		for (const cname of classes) {
			if (cname == 'selected') continue;
			if (cname.substr(0, 3) == 'ui-') continue;
			result.push(cname);
		}
		return result.join(' ');
	}
}

/**
 * A node in the graph. Application-specific data can be attached
 * to its data property.
 */
export class Node {
	id: number;
	x: number;
	y: number;
	name: string;
	inputs: Node[] = [];
	element: JQuery;
	w: number;
	h: number;
	data: any;

	constructor(x: number, y: number, name: string) {
		this.x = x;
		this.y = y;
		this.name = name;
	}

	addInput(n: Node) {
		this.inputs.push(n);
	}

	removeInput(n: Node): boolean {
		const pos: number = this.inputs.indexOf(n);
		if (pos < 0) return false;
		this.inputs.splice(pos, 1);
		return true;
	}

}

/**
 * A set of callbacks to be implemented by the application in order
 * to customize the graph editor and add application-specific behavior.
 */
export interface GraphHandler {
	canBeSource(n: Node): boolean;
	canConnect(src: Node, dst: Node): boolean;
	connected(src: Node, dst: Node): void;
	disconnected(src: Node, dst: Node): void;
	nodeSelected(n: Node): void;
	nodeRemoved(n: Node): void;
	getArrowColor(src: Node, dst: Node): string;
	data2json(n: Node): any;
	json2data(n: Node, json: any): void;
}


//------------------------- Privates -------------------------

/** Default, do-nothing GraphHandler implementation */
class DefaultGraphHandler implements GraphHandler {
	canBeSource(n: Node): boolean { return true; }
	canConnect(src: Node, dst: Node): boolean { return true; }
	connected(src: Node, dst: Node): void {}
	disconnected(src: Node, dst: Node):void {}
	nodeSelected(n: Node): void {}
	nodeRemoved(n: Node): void {}
	getArrowColor(src: Node, dst: Node): string { return "black"; }
	data2json(n: Node): any { return {}; }
	json2data(n: Node, json: any): void {}
}

/**
 * Handles all UI interaction with graph in order to move, select, connect
 * and disconnect nodes.
 */
class GraphInteraction {

	graph: Graph;
	gc: CanvasRenderingContext2D;
	dragging = false;
	selectedNode: Node;

	constructor(graph: Graph, gc: CanvasRenderingContext2D) {
		this.graph = graph;
		this.gc = gc;
		this.setupConnectHandler();
	}

	registerNode(n: Node) {
		n.element.draggable({
			containment: 'parent',
			distance: 5,
			stack: '.node',
			drag: (event, ui) => {
				n.x = ui.position.left;
				n.y = ui.position.top;
				this.graph.draw();
			},
			start: (event, ui) => {
				this.dragging = true;
				ui.helper.css('cursor', 'move');
			},
			stop: (event, ui) => {
				ui.helper.css('cursor', 'default');
				this.dragging = false;
			}
		});
		n.element.click(_ => {
			if (this.dragging) return;
			if (this.selectedNode == n) return;
			this.selectNode(n);
		});
	}

	selectNode(n: Node): void {
		if (this.selectedNode)
			this.selectedNode.element.removeClass('selected');
		n.element.addClass('selected');
		this.selectedNode = n;
		this.graph.handler.nodeSelected(n);
	}

	setupConnectHandler() {
		let srcn: Node;
		let connecting = false;
		$('body').keydown(evt => {
			if (evt.keyCode == CAPS_LOCK) return this.setGrid([20, 20]);
			if (evt.keyCode != SHIFT_KEY || connecting) return;
			srcn = this.getNodeFromDOM(this.getElementUnderMouse());
			if (!srcn) return;
			if (!this.graph.handler.canBeSource(srcn)) {
				srcn.element.css('cursor', 'not-allowed');
				return;
			}
			connecting = true;
			this.registerRubberBanding(srcn);
		})
		.keyup(evt => {
			if (evt.keyCode == CAPS_LOCK) return this.setGrid(null);
			if (evt.keyCode != SHIFT_KEY) return;
			connecting = false;
			this.deregisterRubberBanding();
			const dstn = this.getNodeFromDOM(this.getElementUnderMouse());
			if (!dstn || srcn == dstn) return;
			this.connectOrDisconnect(srcn, dstn);
			this.graph.draw();
		});
	}

	setGrid(grid: any): void {
		$(this.graph.nodeCanvas).find('.node').draggable( "option", "grid", grid);
	}

	connectOrDisconnect(srcn: Node, dstn: Node) {
		if (this.graph.disconnect(srcn, dstn)) return;
		else this.graph.connect(srcn, dstn);
	}

	getElementUnderMouse(): JQuery {
		const hovered = $(':hover');
		if (hovered.length <= 0) return null;
		const jqNode = $(hovered.get(hovered.length - 1));
		if (!jqNode.hasClass('node')) return null;
		return jqNode;
	}

	registerRubberBanding(srcn: Node) {
		const ofs = this.graph.nodeCanvas.offset();
		const dstn = new Node(0, 0, '');
		dstn.w = 0;
		dstn.h = 0;
		$(this.graph.nodeCanvas).on('mousemove', evt => {
			dstn.x = evt.clientX - ofs.left;
			dstn.y = evt.clientY - ofs.top + $('body').scrollTop();
			this.graph.draw();
			this.gc.save();
			this.gc.setLineDash([10]);
			this.graph.graphDraw.drawArrow(srcn, dstn);
			this.gc.restore();
		});
		// Setup cursors
		this.graph.nodeCanvas.css('cursor', 'crosshair');
		this.graph.nodeCanvas.find('.node').css('cursor', 'crosshair');
		for (const n of this.graph.nodes)
			if (n != srcn && !this.graph.handler.canConnect(srcn, n))
				n.element.css('cursor', 'not-allowed');
	}

	deregisterRubberBanding() {
		this.graph.nodeCanvas.css('cursor', '');
		this.graph.nodeCanvas.find('.node').css('cursor', 'default');
		this.graph.nodeCanvas.off('mousemove');
		this.graph.graphDraw.draw();
	}

	getNodeFromDOM(jqNode: JQuery) {
		if (!jqNode) return null;
		for (const n of this.graph.nodes)
			if (n.element[0] == jqNode[0]) return n;
		return null;
	}
}


interface Point {
	x: number,
	y: number
}


/**
 * Handles graph drawing by rendering arrows in a canvas.
 */
class GraphDraw {

	graph: Graph;
	gc: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	arrowHeadLen = 10;
	nodes: Node[];

	constructor(graph: Graph, gc: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		this.graph = graph;
		this.gc = gc;
		this.canvas = canvas;
		this.nodes = graph.nodes;
	}

	draw() {
		this.clearCanvas();
		this.gc.lineWidth = 2;
		for (const ndst of this.nodes)
			for (const nsrc of ndst.inputs)
				this.drawArrow(nsrc, ndst);
	}

	clearCanvas() {
		this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawArrow(srcNode: Node, dstNode: Node) {
		const srcPoint = this.getNodeCenter(srcNode);
		const dstPoint = this.getNodeCenter(dstNode);
		this.gc.strokeStyle = this.graph.handler.getArrowColor(srcNode, dstNode);
		this.gc.beginPath();
		this.gc.moveTo(srcPoint.x, srcPoint.y);
		this.gc.lineTo(dstPoint.x, dstPoint.y);
		this.drawArrowTip(srcPoint, dstPoint);
		this.gc.closePath();
		this.gc.stroke();
	}

	drawArrowTip(src: Point, dst: Point) {
		const posCoef = 0.6;
		const mx = src.x + (dst.x - src.x) * posCoef;
		const my = src.y + (dst.y - src.y) * posCoef;
		var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
		this.gc.moveTo(mx, my);
		this.gc.lineTo(
			mx - this.arrowHeadLen * Math.cos(angle - Math.PI/6),
			my - this.arrowHeadLen * Math.sin(angle - Math.PI/6)
		);
		this.gc.moveTo(mx, my);
		this.gc.lineTo(
			mx - this.arrowHeadLen * Math.cos(angle + Math.PI/6),
			my - this.arrowHeadLen * Math.sin(angle + Math.PI/6)
		);
	}

	getNodeCenter(n: Node): Point {
		n.w = n.w !== undefined ? n.w : n.element.outerWidth();
		n.h = n.h !== undefined ? n.h : n.element.outerHeight();
		return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	}
}
