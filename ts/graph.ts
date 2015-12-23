export class Graph {

	nodeCanvas: JQuery;
	canvas: HTMLCanvasElement;
	nodes: Node[] = [];
	graphDraw: GraphDraw;
	graphInteract: GraphInteraction;
	handler: GraphHandler;

	constructor(canvas: HTMLCanvasElement) {
		this.nodeCanvas = $(canvas.parentElement);
		this.canvas = canvas;
		const gc = canvas.getContext('2d');
		this.graphDraw = new GraphDraw(this, gc, canvas);
		this.graphInteract = new GraphInteraction(this, gc);
		this.handler = new DefaultGraphHandler();
	}

	addNode(n: Node, classes?: string) {
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

	removeNode(n: Node) {
		alert('Sorry, not available yet');
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

}


export class Node {
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

export interface GraphHandler {
	canBeSource(n: Node): boolean;
	canConnect(src: Node, dst: Node): boolean;
	connected(src: Node, dst: Node): void;
	disconnected(src: Node, dst: Node): void;
	nodeSelected(n: Node): void;
	getArrowColor(src: Node, dst: Node): string;
}


//------------------------- Privates -------------------------

class DefaultGraphHandler implements GraphHandler {
	canBeSource(n: Node): boolean { return true; }
	canConnect(src: Node, dst: Node): boolean { return true; }
	connected(src: Node, dst: Node): void {}
	disconnected(src: Node, dst: Node):void {}
	nodeSelected(n: Node): void {}
	getArrowColor(src: Node, dst: Node): string { return "black"; }
}


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
			if (evt.keyCode != 16  || connecting) return;
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
			if (evt.keyCode != 16) return;
			connecting = false;
			this.deregisterRubberBanding();
			const dstn = this.getNodeFromDOM(this.getElementUnderMouse());
			if (!dstn || srcn == dstn) return;
			this.connectOrDisconnect(srcn, dstn);
			this.graph.draw();
		});
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
			dstn.y = evt.clientY - ofs.top;
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
