export class Graph {

	nodeCanvas: JQuery;
	nodes: Node[] = [];
	graphDraw: GraphDraw;
	graphInteract: GraphInteraction;

	constructor(canvas: HTMLCanvasElement) {
		this.nodeCanvas = $(canvas.parentElement);
		this.graphDraw = new GraphDraw(canvas.getContext('2d'), canvas);
		this.graphInteract = new GraphInteraction(this.nodeCanvas);
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
		this.graphInteract.setupDnD(n, () => this.draw());
		this.draw();
	}

	draw() {
		this.graphDraw.draw(this.nodes);
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

	nodeCanvas: JQuery;
	mouseInside = false;

	constructor(nodeCanvas: JQuery) {
		this.nodeCanvas = nodeCanvas;
		this.setupConnectHandler();
	}

	setupConnectHandler() {
		this.nodeCanvas.mouseenter(evt => this.mouseInside = true);
		this.nodeCanvas.mouseleave(evt => this.mouseInside = false);
		$('body').keydown(evt => {
			if (evt.keyCode != 16) return;
			if (this.mouseInside) this.nodeCanvas.css('cursor', 'crosshair');
		})
		.keyup(evt => {
			if (evt.keyCode == 16) this.nodeCanvas.css('cursor', '');
		});
	}

	setupDnD(n: Node, draw: () => void) {
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
}

interface Point {
	x: number,
	y: number
}

class GraphDraw {

	gc: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	arrowColor: string = "black";

	constructor(gc: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		this.gc = gc;
		this.canvas = canvas;
	}

	draw(nodes: Node[]) {
		this.clearCanvas();
		this.gc.strokeStyle = this.arrowColor;
		this.gc.lineWidth = 2;
		for (const ndst of nodes)
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
		const headlen = 10;
		var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
		this.gc.moveTo(mx, my);
		this.gc.lineTo(
			mx - headlen * Math.cos(angle - Math.PI/6),
			my - headlen * Math.sin(angle - Math.PI/6)
		);
		this.gc.moveTo(mx, my);
		this.gc.lineTo(
			mx - headlen * Math.cos(angle + Math.PI/6),
			my - headlen * Math.sin(angle + Math.PI/6)
		);
	}

	getNodeCenter(n: Node): Point {
		n.w = n.w || n.element.outerWidth();
		n.h = n.h || n.element.outerHeight();
		return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	}
}
