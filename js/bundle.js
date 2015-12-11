/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var graph_1 = __webpack_require__(1);
	var gr = new graph_1.Graph($('#graph-canvas')[0]);
	var tmp = $('<div>').addClass('arrow');
	$('body').append(tmp);
	gr.arrowColor = tmp.css('color');
	tmp.remove();
	var n1 = new graph_1.Node(10, 10);
	var n2 = new graph_1.Node(30, 100);
	var n3 = new graph_1.Node(60, 200);
	gr.addNode(n1);
	gr.addNode(n2);
	gr.addNode(n3);
	n1.addInput(n2);
	n2.addInput(n3);
	gr.draw();
	$('.palette > .node').click(function (evt) {
	    var n = new graph_1.Node(260, 180);
	    gr.addNode(n);
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	var Graph = (function () {
	    function Graph(canvas) {
	        this.nodes = [];
	        this.mouseInside = false;
	        this.nodeCanvas = $(canvas.parentElement);
	        this._setupConnectHandler();
	        this.graphDraw = new GraphDraw(canvas.getContext('2d'), canvas);
	    }
	    Object.defineProperty(Graph.prototype, "arrowColor", {
	        set: function (color) {
	            this.graphDraw.arrowColor = color;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Graph.prototype.addNode = function (n) {
	        n.element = $('<div>')
	            .addClass('node')
	            .css({ left: n.x, top: n.y });
	        this.nodeCanvas.append(n.element);
	        this.nodes.push(n);
	        this._setupDnD(n);
	        this.draw();
	    };
	    Graph.prototype.draw = function () {
	        this.graphDraw.draw(this.nodes);
	    };
	    Graph.prototype._setupDnD = function (n) {
	        var _this = this;
	        n.element.draggable({
	            containment: 'parent',
	            cursor: 'move',
	            distance: 5,
	            stack: '.node',
	            drag: function (event, ui) {
	                n.x = ui.position.left;
	                n.y = ui.position.top;
	                _this.draw();
	            }
	        });
	    };
	    Graph.prototype._setupConnectHandler = function () {
	        var _this = this;
	        this.nodeCanvas.mouseenter(function (evt) { return _this.mouseInside = true; });
	        this.nodeCanvas.mouseleave(function (evt) { return _this.mouseInside = false; });
	        $('body').keydown(function (evt) {
	            if (evt.keyCode != 16)
	                return;
	            if (_this.mouseInside)
	                _this.nodeCanvas.css('cursor', 'crosshair');
	        })
	            .keyup(function (evt) {
	            if (evt.keyCode == 16)
	                _this.nodeCanvas.css('cursor', '');
	        });
	    };
	    return Graph;
	})();
	exports.Graph = Graph;
	/**
	 * A node in a graph. Nodes can be connected to other nodes.
	 */
	var Node = (function () {
	    function Node(x, y) {
	        this.inputs = [];
	        this.x = x;
	        this.y = y;
	    }
	    /**
	     * Connects two nodes by adding a given node as input.
	     * Warning: nodes should be connected only after they have been added to the graph.
	     * @param n the node to connect as input
	     */
	    Node.prototype.addInput = function (n) {
	        this.inputs.push(n);
	    };
	    return Node;
	})();
	exports.Node = Node;
	var GraphDraw = (function () {
	    function GraphDraw(gc, canvas) {
	        this.arrowColor = "black";
	        this.gc = gc;
	        this.canvas = canvas;
	    }
	    GraphDraw.prototype.draw = function (nodes) {
	        this.clearCanvas();
	        this.gc.strokeStyle = this.arrowColor;
	        this.gc.lineWidth = 2;
	        for (var _i = 0; _i < nodes.length; _i++) {
	            var ndst = nodes[_i];
	            for (var _a = 0, _b = ndst.inputs; _a < _b.length; _a++) {
	                var nsrc = _b[_a];
	                this.drawArrow(nsrc, ndst);
	            }
	        }
	    };
	    GraphDraw.prototype.clearCanvas = function () {
	        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
	    };
	    GraphDraw.prototype.drawArrow = function (srcNode, dstNode) {
	        var srcPoint = this.getNodeCenter(srcNode);
	        var dstPoint = this.getNodeCenter(dstNode);
	        this.gc.beginPath();
	        this.gc.moveTo(srcPoint.x, srcPoint.y);
	        this.gc.lineTo(dstPoint.x, dstPoint.y);
	        this.drawArrowTip(srcPoint, dstPoint);
	        this.gc.closePath();
	        this.gc.stroke();
	    };
	    GraphDraw.prototype.drawArrowTip = function (src, dst) {
	        var posCoef = 0.6;
	        var mx = src.x + (dst.x - src.x) * posCoef;
	        var my = src.y + (dst.y - src.y) * posCoef;
	        var headlen = 10;
	        var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	        this.gc.moveTo(mx, my);
	        this.gc.lineTo(mx - headlen * Math.cos(angle - Math.PI / 6), my - headlen * Math.sin(angle - Math.PI / 6));
	        this.gc.moveTo(mx, my);
	        this.gc.lineTo(mx - headlen * Math.cos(angle + Math.PI / 6), my - headlen * Math.sin(angle + Math.PI / 6));
	    };
	    GraphDraw.prototype.getNodeCenter = function (n) {
	        n.w = n.w || n.element.outerWidth();
	        n.h = n.h || n.element.outerHeight();
	        return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	    };
	    return GraphDraw;
	})();


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map