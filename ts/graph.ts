export class Graph {

	nodeCanvas: JQuery;
	nodes: Node[] = [];
	graphDraw: GraphDraw;
	graphInteract: GraphInteraction;

	constructor(canvas: HTMLCanvasElement) {
		this.nodeCanvas = $(canvas.parentElement);
		const gc = canvas.getContext('2d'); 
		this.graphDraw = new GraphDraw(gc, canvas, this.nodes);
		this.graphInteract = new GraphInteraction(gc, this.nodeCanvas, this.nodes, this.graphDraw);
	}

	set arrowColor(color: string) {
		this.graphDraw.arrowColor = color;
	}

	addNode(n: Node) {
		n.element = $('<div>')
		.addClass('node')
		.css({ left: n.x, top: n.y });
		this.nodeCanvas.append(n.element);
		this.nodes.push(n);
		this.graphInteract.registerNode(n, () => this.draw());
		this.draw();
	}

	draw() {
		this.graphDraw.draw();
	}

}


/**
 * A node in a graph. Nodes can be connected to other nodes.
 */
export class Node {
	x: number;
	y: number;
	inputs: Node[] = [];
	element: JQuery;
	w: number;
	h: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Connects two nodes by adding a given node as input.
	 * Warning: nodes should be connected only after they have been added to the graph.
	 * @param n the node to connect as input
	 */
	addInput(n: Node) {
		this.inputs.push(n);
	}

}


//------------------------- Privates -------------------------

class GraphInteraction {

	gc: CanvasRenderingContext2D;
	nodeCanvas: JQuery;
	nodes: Node[];
	grDraw: GraphDraw;
	connecting = false;

	constructor(gc: CanvasRenderingContext2D,
		nodeCanvas: JQuery, nodes: Node[], grDraw: GraphDraw) {
		this.gc = gc;
		this.nodeCanvas = nodeCanvas;
		this.nodes = nodes;
		this.grDraw = grDraw;
		this.setupConnectHandler();
	}

	registerNode(n: Node, draw: () => void) {
		n.element.draggable({
			containment: 'parent',
			cursor: 'move',
			distance: 5,
			stack: '.node',
			drag: (event, ui) => {
				n.x = ui.position.left;
				n.y = ui.position.top;
				draw();
			}
		});
	}

	setupConnectHandler() {
		$('body').keydown(evt => {
			if (evt.keyCode != 16  || this.connecting) return;
			const srcNode = this.getNodeUnderMouse();
			if (!srcNode) return;
			console.log('>>> src node:', srcNode);
			this.nodeCanvas.css('cursor', 'crosshair');
			this.connecting = true;
			this.registerRubberBanding(srcNode);
		})
		.keyup(evt => {
			if (evt.keyCode != 16) return;
			this.connecting = false;
			this.nodeCanvas.css('cursor', '');
			this.deregisterRubberBanding();
			const dstNode = this.getNodeUnderMouse();
			if (!dstNode) return;
			console.log('>>> dest node:', dstNode);
		});
	}

	getNodeUnderMouse(): JQuery {
		const hovered = $(':hover');
		if (hovered.length <= 0) return null;
		const jqNode = $(hovered.get(hovered.length - 1));
		if (!jqNode.hasClass('node')) return null;
		return jqNode;
	}

	registerRubberBanding(srcNode: JQuery) {
		const srcn = this.getNodeFromDOM(srcNode);
		if (!srcn) return;
		const ofs = this.nodeCanvas.offset();
		const dstn = new Node(0, 0);
		dstn.w = .01;
		dstn.h = .01;
		$(this.nodeCanvas).on('mousemove', evt => {
			dstn.x = evt.clientX - ofs.left;
			dstn.y = evt.clientY - ofs.top;
			this.grDraw.draw();
			this.gc.save();
			this.gc.setLineDash([10]);
			this.grDraw.drawArrow(srcn, dstn);
			this.gc.restore();
		});
	}

	deregisterRubberBanding() {
		this.nodeCanvas.off('mousemove');
		this.grDraw.draw();
	}

	getNodeFromDOM(jqNode: JQuery) {
		for (const n of this.nodes)
			if (n.element[0] == jqNode[0]) return n;
		return null;
	}
}


interface Point {
	x: number,
	y: number
}


class GraphDraw {

	gc: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	arrowColor: string = "black";
	arrowHeadLen = 10;
	nodes: Node[];

	constructor(gc: CanvasRenderingContext2D, canvas: HTMLCanvasElement, nodes: Node[]) {
		this.gc = gc;
		this.canvas = canvas;
		this.nodes = nodes;
	}

	draw() {
		this.clearCanvas();
		this.gc.strokeStyle = this.arrowColor;
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
		n.w = n.w || n.element.outerWidth();
		n.h = n.h || n.element.outerHeight();
		return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	}
}
