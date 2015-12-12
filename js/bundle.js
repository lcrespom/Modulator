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

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var graph_1 = __webpack_require__(1);
	var audio_1 = __webpack_require__(2);
	var SynthNode = (function (_super) {
	    __extends(SynthNode, _super);
	    function SynthNode() {
	        _super.apply(this, arguments);
	    }
	    SynthNode.prototype.addInput = function (n) {
	        _super.prototype.addInput.call(this, n);
	        n.anode.connect(this.anode);
	    };
	    SynthNode.prototype.removeInput = function (np) {
	        var removed = _super.prototype.removeInput.call(this, np);
	        //TODO disconnect audio nodes
	        return removed;
	    };
	    return SynthNode;
	})(graph_1.Node);
	var gr = new graph_1.Graph($('#graph-canvas')[0]);
	var synth = new audio_1.Synth();
	main();
	function main() {
	    setArrowColor();
	    registerPaletteHandler();
	    registerPlayHandler();
	    addOuptutNode();
	}
	function addOuptutNode() {
	    var out = new SynthNode(500, 180, 'Out');
	    out.anode = synth.ac.destination;
	    out.type = 'Speaker';
	    gr.addNode(out);
	}
	function registerPlayHandler() {
	    var playing = false;
	    var $playBut = $('#play-stop');
	    $playBut.click(function (_) {
	        if (playing) {
	            synth.stop();
	            $playBut.text('Play');
	        }
	        else {
	            synth.play();
	            $playBut.text('Stop');
	        }
	    });
	}
	function registerPaletteHandler() {
	    $('.palette > .node').click(function (evt) {
	        var elem = $(this);
	        var n = new SynthNode(260, 180, elem.text());
	        n.type = elem.attr('data-type');
	        n.anode = synth.createNode(n.type);
	        gr.addNode(n);
	        if (!n.anode) {
	            console.warn("No AudioNode found for '" + n.type + "'");
	            n.element.css('background-color', '#BBB');
	        }
	    });
	}
	function setArrowColor() {
	    var tmp = $('<div>').addClass('arrow');
	    $('body').append(tmp);
	    gr.arrowColor = tmp.css('color');
	    tmp.remove();
	}


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
	            .text(n.name)
	            .css({ left: n.x, top: n.y, cursor: 'default' });
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
	    function Node(x, y, name) {
	        this.inputs = [];
	        this.x = x;
	        this.y = y;
	        this.name = name;
	    }
	    Node.prototype.addInput = function (n) {
	        this.inputs.push(n);
	        //TODO check if connections are accepted, both at source and destination nodes
	    };
	    Node.prototype.removeInput = function (np) {
	        var pos;
	        var result;
	        if (np instanceof Node) {
	            pos = this.inputs.indexOf(np);
	            result = np;
	        }
	        else {
	            pos = np;
	            result = this.inputs[pos];
	        }
	        if (np >= 0)
	            this.inputs.splice(np, 1);
	        return result;
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
	            distance: 5,
	            stack: '.node',
	            drag: function (event, ui) {
	                n.x = ui.position.left;
	                n.y = ui.position.top;
	                _this.grDraw.draw();
	            },
	            start: function (event, ui) { return ui.helper.css('cursor', 'move'); },
	            stop: function (event, ui) { return ui.helper.css('cursor', 'default'); }
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
	            _this.nodeCanvas.find('.node').css('cursor', 'crosshair');
	            _this.connecting = true;
	            _this.registerRubberBanding(srcn);
	        })
	            .keyup(function (evt) {
	            if (evt.keyCode != 16)
	                return;
	            _this.connecting = false;
	            _this.nodeCanvas.css('cursor', '');
	            _this.nodeCanvas.find('.node').css('cursor', 'default');
	            _this.deregisterRubberBanding();
	            var dstn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!dstn)
	                return;
	            _this.connectOrDisconnect(srcn, dstn);
	            _this.grDraw.draw();
	        })
	            .mousedown(function (evt) { return mouseIsDown = true; })
	            .mouseup(function (evt) { return mouseIsDown = false; });
	    };
	    GraphInteraction.prototype.connectOrDisconnect = function (srcn, dstn) {
	        var pos = dstn.inputs.indexOf(srcn);
	        if (pos >= 0)
	            dstn.removeInput(pos);
	        else
	            dstn.addInput(srcn);
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
	        var dstn = new Node(0, 0, '');
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	var Synth = (function () {
	    function Synth() {
	        var CtxClass = window.AudioContext || window.webkitAudioContext;
	        this.ac = new CtxClass();
	    }
	    Synth.prototype.createNode = function (type) {
	        var def = palette[type];
	        if (!def || !this.ac[def.constructor])
	            return null;
	        var anode = this.ac[def.constructor]();
	        for (var _i = 0, _a = Object.keys(def.params || {}); _i < _a.length; _i++) {
	            var param = _a[_i];
	            anode[param] = def.params[param];
	        }
	        for (var _b = 0, _c = Object.keys(def.audioParams || {}); _b < _c.length; _b++) {
	            var param = _c[_b];
	            anode[param].value = def.audioParams[param];
	        }
	        return anode;
	    };
	    Synth.prototype.play = function () {
	    };
	    Synth.prototype.stop = function () {
	    };
	    return Synth;
	})();
	exports.Synth = Synth;
	var palette = {
	    Oscillator: {
	        constructor: 'createOscillator',
	        params: {
	            type: 'sawtooth'
	        },
	        audioParams: {
	            frequency: 220
	        },
	        paramValues: {
	            type: ['sine', 'square', 'sawtooth', 'triangle']
	        }
	    }
	};


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map