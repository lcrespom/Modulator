export class Graph {

	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	nodeCanvas: JQuery;
	nodes: Node[] = [];
	arrowColor: string = "black";
	
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.gc = canvas.getContext('2d');
		this.nodeCanvas = $(canvas.parentElement);
	}

	addNode(n: Node) {
		n.element = $('<div>')
		.addClass('node')
		.css({ left: n.x, top: n.y });
		this.nodeCanvas.append(n.element);
		this.nodes.push(n);
		this.setupDnD(n);
		this.draw();
	}

	draw() {
		clearCanvas(this.gc, this.canvas);
		this.gc.strokeStyle = this.arrowColor;
		this.gc.lineWidth = 2;
		for (const ndst of this.nodes)
			for (const nsrc of ndst.inputs)
				drawArrow(this.gc, nsrc, ndst);
	}

	setupDnD(n: Node) {
		n.element.draggable({
			containment: 'parent',
			cursor: 'move',
			distance: 5,
			stack: '.node',
			drag: (event, ui) => {
				n.x = ui.position.left;
				n.y = ui.position.top;
				this.draw();
			}
		});
	}
}


interface Point {
	x: number,
	y: number
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

function clearCanvas(gc:CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
	gc.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArrow(gc: CanvasRenderingContext2D, srcNode: Node, dstNode: Node) {
	const srcPoint = getNodeCenter(srcNode);
	const dstPoint = getNodeCenter(dstNode);
	gc.beginPath();
	gc.moveTo(srcPoint.x, srcPoint.y);
	gc.lineTo(dstPoint.x, dstPoint.y);
	gc.closePath();
	gc.stroke();
	drawArrowTip(gc, srcPoint, dstPoint);
}

function drawArrowTip(gc: CanvasRenderingContext2D, src: Point, dst: Point) {
	const mx = (src.x + dst.x) / 2;
	const my = (src.y + dst.y) / 2;
	const headlen = 10;
	var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	gc.beginPath();
	gc.moveTo(mx, my);
	gc.lineTo(
		mx - headlen * Math.cos(angle - Math.PI/6),
		my - headlen * Math.sin(angle - Math.PI/6)
	);
	gc.moveTo(mx, my);
	gc.lineTo(
		mx - headlen * Math.cos(angle + Math.PI/6),
		my - headlen * Math.sin(angle + Math.PI/6)
	);
	gc.closePath();
	gc.stroke();
 }

function getNodeCenter(n: Node): Point {
	n.w = n.w || n.element.outerWidth();
	n.h = n.h || n.element.outerHeight();
	return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}
