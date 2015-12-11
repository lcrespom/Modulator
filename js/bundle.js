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
	        this.arrowColor = "black";
	        this.mouseInside = false;
	        this.canvas = canvas;
	        this.gc = canvas.getContext('2d');
	        this.nodeCanvas = $(canvas.parentElement);
	        this._setupConnectHandler();
	    }
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
	        clearCanvas(this.gc, this.canvas);
	        this.gc.strokeStyle = this.arrowColor;
	        this.gc.lineWidth = 2;
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var ndst = _a[_i];
	            for (var _b = 0, _c = ndst.inputs; _b < _c.length; _b++) {
	                var nsrc = _c[_b];
	                drawArrow(this.gc, nsrc, ndst);
	            }
	        }
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
	//------------------------- Privates -------------------------
	function clearCanvas(gc, canvas) {
	    gc.clearRect(0, 0, canvas.width, canvas.height);
	}
	function drawArrow(gc, srcNode, dstNode) {
	    var srcPoint = getNodeCenter(srcNode);
	    var dstPoint = getNodeCenter(dstNode);
	    gc.beginPath();
	    gc.moveTo(srcPoint.x, srcPoint.y);
	    gc.lineTo(dstPoint.x, dstPoint.y);
	    drawArrowTip(gc, srcPoint, dstPoint);
	    gc.closePath();
	    gc.stroke();
	}
	function drawArrowTip(gc, src, dst) {
	    var posCoef = 0.6;
	    var mx = src.x + (dst.x - src.x) * posCoef;
	    var my = src.y + (dst.y - src.y) * posCoef;
	    var headlen = 10;
	    var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	    gc.moveTo(mx, my);
	    gc.lineTo(mx - headlen * Math.cos(angle - Math.PI / 6), my - headlen * Math.sin(angle - Math.PI / 6));
	    gc.moveTo(mx, my);
	    gc.lineTo(mx - headlen * Math.cos(angle + Math.PI / 6), my - headlen * Math.sin(angle + Math.PI / 6));
	}
	function getNodeCenter(n) {
	    n.w = n.w || n.element.outerWidth();
	    n.h = n.h || n.element.outerHeight();
	    return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map