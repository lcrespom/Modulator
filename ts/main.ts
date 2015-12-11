import { Graph, Node } from './graph';

const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);

const tmp = $('<div>').addClass('arrow');
$('body').append(tmp);
gr.arrowColor = tmp.css('color');
tmp.remove();

$('.palette > .node').click(evt => {
	const n = new Node(260, 180);
	gr.addNode(n);
});