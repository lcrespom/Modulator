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
	        this.nodeCanvas = $(canvas.parentElement);
	        var gc = canvas.getContext('2d');
	        this.graphDraw = new GraphDraw(gc, canvas, this.nodes);
	        this.graphInteract = new GraphInteraction(gc, this.nodeCanvas, this.nodes, this.graphDraw);
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
	        this.graphInteract.registerNode(n);
	        this.draw();
	    };
	    Graph.prototype.draw = function () {
	        this.graphDraw.draw();
	    };
	    return Graph;
	})();
	exports.Graph = Graph;
	var Node = (function () {
	    function Node(x, y) {
	        this.inputs = [];
	        this.x = x;
	        this.y = y;
	    }
	    Node.prototype.addInput = function (n) {
	        this.inputs.push(n);
	    };
	    return Node;
	})();
	exports.Node = Node;
	//------------------------- Privates -------------------------
	var GraphInteraction = (function () {
	    function GraphInteraction(gc, nodeCanvas, nodes, grDraw) {
	        this.connecting = false;
	        this.gc = gc;
	        this.nodeCanvas = nodeCanvas;
	        this.nodes = nodes;
	        this.grDraw = grDraw;
	        this.setupConnectHandler();
	    }
	    GraphInteraction.prototype.registerNode = function (n) {
	        var _this = this;
	        n.element.draggable({
	            containment: 'parent',
	            cursor: 'move',
	            distance: 5,
	            stack: '.node',
	            drag: function (event, ui) {
	                n.x = ui.position.left;
	                n.y = ui.position.top;
	                _this.grDraw.draw();
	            }
	        });
	    };
	    GraphInteraction.prototype.setupConnectHandler = function () {
	        var _this = this;
	        var mouseIsDown = false;
	        var srcn;
	        $('body').keydown(function (evt) {
	            if (evt.keyCode != 16 || _this.connecting || mouseIsDown)
	                return;
	            srcn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!srcn)
	                return;
	            _this.nodeCanvas.css('cursor', 'crosshair');
	            _this.connecting = true;
	            _this.registerRubberBanding(srcn);
	        })
	            .keyup(function (evt) {
	            if (evt.keyCode != 16)
	                return;
	            _this.connecting = false;
	            _this.nodeCanvas.css('cursor', '');
	            _this.deregisterRubberBanding();
	            var dstn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!dstn)
	                return;
	            dstn.addInput(srcn);
	            _this.grDraw.draw();
	        })
	            .mousedown(function (evt) { return mouseIsDown = true; })
	            .mouseup(function (evt) { return mouseIsDown = false; });
	    };
	    GraphInteraction.prototype.getElementUnderMouse = function () {
	        var hovered = $(':hover');
	        if (hovered.length <= 0)
	            return null;
	        var jqNode = $(hovered.get(hovered.length - 1));
	        if (!jqNode.hasClass('node'))
	            return null;
	        return jqNode;
	    };
	    GraphInteraction.prototype.registerRubberBanding = function (srcn) {
	        var _this = this;
	        var ofs = this.nodeCanvas.offset();
	        var dstn = new Node(0, 0);
	        dstn.w = 0;
	        dstn.h = 0;
	        $(this.nodeCanvas).on('mousemove', function (evt) {
	            dstn.x = evt.clientX - ofs.left;
	            dstn.y = evt.clientY - ofs.top;
	            _this.grDraw.draw();
	            _this.gc.save();
	            _this.gc.setLineDash([10]);
	            _this.grDraw.drawArrow(srcn, dstn);
	            _this.gc.restore();
	        });
	    };
	    GraphInteraction.prototype.deregisterRubberBanding = function () {
	        this.nodeCanvas.off('mousemove');
	        this.grDraw.draw();
	    };
	    GraphInteraction.prototype.getNodeFromDOM = function (jqNode) {
	        if (!jqNode)
	            return null;
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var n = _a[_i];
	            if (n.element[0] == jqNode[0])
	                return n;
	        }
	        return null;
	    };
	    return GraphInteraction;
	})();
	var GraphDraw = (function () {
	    function GraphDraw(gc, canvas, nodes) {
	        this.arrowColor = "black";
	        this.arrowHeadLen = 10;
	        this.gc = gc;
	        this.canvas = canvas;
	        this.nodes = nodes;
	    }
	    GraphDraw.prototype.draw = function () {
	        this.clearCanvas();
	        this.gc.strokeStyle = this.arrowColor;
	        this.gc.lineWidth = 2;
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var ndst = _a[_i];
	            for (var _b = 0, _c = ndst.inputs; _b < _c.length; _b++) {
	                var nsrc = _c[_b];
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
	        var angle = Math.atan2(dst.y - src.y, dst.x - src.x);
	        this.gc.moveTo(mx, my);
	        this.gc.lineTo(mx - this.arrowHeadLen * Math.cos(angle - Math.PI / 6), my - this.arrowHeadLen * Math.sin(angle - Math.PI / 6));
	        this.gc.moveTo(mx, my);
	        this.gc.lineTo(mx - this.arrowHeadLen * Math.cos(angle + Math.PI / 6), my - this.arrowHeadLen * Math.sin(angle + Math.PI / 6));
	    };
	    GraphDraw.prototype.getNodeCenter = function (n) {
	        n.w = n.w !== undefined ? n.w : n.element.outerWidth();
	        n.h = n.h !== undefined ? n.h : n.element.outerHeight();
	        return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
	    };
	    return GraphDraw;
	})();


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map