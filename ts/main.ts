import { Graph, Node } from './graph';

const gr = new Graph(<HTMLCanvasElement>$('#graph-canvas')[0]);

const tmp = $('<div>').addClass('arrow');
$('body').append(tmp);
gr.arrowColor = tmp.css('color');
tmp.remove();

$('.palette > .node').click(function(evt) {
	const n = new Node(260, 180, $(this).text());
	gr.addNode(n);
});

const out = new Node(500, 180, 'Out');
gr.addNode(out);
