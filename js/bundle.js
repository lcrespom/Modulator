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
	var synth_1 = __webpack_require__(2);
	var paramsUI_1 = __webpack_require__(3);
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
	        removed.anode.disconnect();
	        return removed;
	    };
	    SynthNode.prototype.canBeSource = function () {
	        return this.anode.numberOfOutputs > 0;
	    };
	    SynthNode.prototype.canConnectInput = function (n) {
	        return this.anode.numberOfInputs > 0;
	    };
	    return SynthNode;
	})(graph_1.Node);
	var gr = new graph_1.Graph($('#graph-canvas')[0]);
	var synth = new synth_1.Synth();
	main();
	function main() {
	    registerNodeSelection();
	    setArrowColor();
	    registerPaletteHandler();
	    registerPlayHandler();
	    addOutputNode();
	}
	function registerNodeSelection() {
	    gr.nodeSelected = function (n) {
	        paramsUI_1.renderParams(n, synth.palette[n.type], $('.params-box'));
	    };
	}
	function addOutputNode() {
	    var out = new SynthNode(500, 180, 'Out');
	    out.anode = synth.ac.destination;
	    out.type = 'Speaker';
	    gr.addNode(out);
	}
	function registerPlayHandler() {
	    var playing = false;
	    var $playBut = $('#play-stop');
	    $playBut.click(togglePlayStop);
	    $('body').keypress(function (evt) {
	        if (evt.keyCode == 32)
	            togglePlayStop();
	    });
	    function togglePlayStop() {
	        if (playing) {
	            synth.stop();
	            $playBut.text('Play');
	        }
	        else {
	            synth.play();
	            $playBut.text('Stop');
	        }
	        playing = !playing;
	    }
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
	        else {
	            if (n.anode['start'])
	                n.anode['start']();
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
	        this.graphInteract = new GraphInteraction(this, gc);
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
	    Graph.prototype.nodeSelected = function (n) { };
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
	    Node.prototype.canBeSource = function () {
	        return true;
	    };
	    Node.prototype.canConnectInput = function (n) {
	        return true;
	    };
	    return Node;
	})();
	exports.Node = Node;
	//------------------------- Privates -------------------------
	var GraphInteraction = (function () {
	    function GraphInteraction(graph, gc) {
	        this.connecting = false;
	        this.dragging = false;
	        this.graph = graph;
	        this.gc = gc;
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
	                _this.graph.draw();
	            },
	            start: function (event, ui) {
	                _this.dragging = true;
	                ui.helper.css('cursor', 'move');
	            },
	            stop: function (event, ui) {
	                ui.helper.css('cursor', 'default');
	                _this.dragging = false;
	            }
	        });
	        n.element.click(function (_) {
	            if (_this.dragging)
	                return;
	            if (_this.selectedNode == n)
	                return;
	            if (_this.selectedNode)
	                _this.selectedNode.element.removeClass('selected');
	            n.element.addClass('selected');
	            _this.selectedNode = n;
	            _this.graph.nodeSelected(n);
	        });
	    };
	    GraphInteraction.prototype.setupConnectHandler = function () {
	        var _this = this;
	        var srcn;
	        $('body').keydown(function (evt) {
	            if (evt.keyCode != 16 || _this.connecting)
	                return;
	            srcn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!srcn)
	                return;
	            if (!srcn.canBeSource()) {
	                srcn.element.css('cursor', 'not-allowed');
	                return;
	            }
	            _this.graph.nodeCanvas.css('cursor', 'crosshair');
	            _this.graph.nodeCanvas.find('.node').css('cursor', 'crosshair');
	            _this.connecting = true;
	            _this.registerRubberBanding(srcn);
	        })
	            .keyup(function (evt) {
	            if (evt.keyCode != 16)
	                return;
	            _this.connecting = false;
	            _this.graph.nodeCanvas.css('cursor', '');
	            _this.graph.nodeCanvas.find('.node').css('cursor', 'default');
	            _this.deregisterRubberBanding();
	            var dstn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!dstn)
	                return;
	            _this.connectOrDisconnect(srcn, dstn);
	            _this.graph.draw();
	        });
	    };
	    GraphInteraction.prototype.connectOrDisconnect = function (srcn, dstn) {
	        if (srcn == dstn)
	            return; // duh!
	        var pos = dstn.inputs.indexOf(srcn);
	        if (pos >= 0)
	            dstn.removeInput(pos);
	        else if (srcn.canBeSource() && dstn.canConnectInput(srcn))
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
	        var ofs = this.graph.nodeCanvas.offset();
	        var dstn = new Node(0, 0, '');
	        dstn.w = 0;
	        dstn.h = 0;
	        $(this.graph.nodeCanvas).on('mousemove', function (evt) {
	            dstn.x = evt.clientX - ofs.left;
	            dstn.y = evt.clientY - ofs.top;
	            _this.graph.draw();
	            _this.gc.save();
	            _this.gc.setLineDash([10]);
	            _this.graph.graphDraw.drawArrow(srcn, dstn);
	            _this.gc.restore();
	        });
	        for (var _i = 0, _a = this.graph.nodes; _i < _a.length; _i++) {
	            var n = _a[_i];
	            if (n != srcn && !n.canConnectInput(srcn))
	                n.element.css('cursor', 'not-allowed');
	        }
	    };
	    GraphInteraction.prototype.deregisterRubberBanding = function () {
	        this.graph.nodeCanvas.off('mousemove');
	        this.graph.graphDraw.draw();
	    };
	    GraphInteraction.prototype.getNodeFromDOM = function (jqNode) {
	        if (!jqNode)
	            return null;
	        for (var _i = 0, _a = this.graph.nodes; _i < _a.length; _i++) {
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
	        this.stop();
	        this.palette = palette;
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
	        this.ac.resume();
	    };
	    Synth.prototype.stop = function () {
	        this.ac.suspend();
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
	        paramTypes: {
	            type: ['sine', 'square', 'sawtooth', 'triangle'],
	            frequency: {
	                min: 50,
	                max: 20000
	            }
	        }
	    },
	    Gain: {
	        constructor: 'createGain',
	        audioParams: {
	            gain: 1
	        },
	        paramTypes: {
	            gain: {
	                min: 0,
	                max: 1
	            }
	        }
	    },
	    Speaker: {
	        constructor: null
	    }
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	//TODO refactor main so that SynthNode is available
	function renderParams(n, ndef, panel) {
	    var form = $('<form>');
	    form.submit(function (_) { return handleForm(form, n.anode); });
	    panel.empty().append(form);
	    for (var _i = 0, _a = Object.keys(ndef.audioParams || {}); _i < _a.length; _i++) {
	        var param = _a[_i];
	        renderAudioParam(n.anode, ndef, param, form);
	    }
	    for (var _b = 0, _c = Object.keys(ndef.params || {}); _b < _c.length; _b++) {
	        var param = _c[_b];
	        renderOtherParam(n.anode, ndef, param, form);
	    }
	}
	exports.renderParams = renderParams;
	function renderAudioParam(anode, ndef, param, panel) {
	    var sliderBox = $('<div class="slider-box">');
	    var slider = $('<input type="range" orient="vertical">')
	        .attr('min', 0)
	        .attr('max', 1)
	        .attr('step', 0.001)
	        .attr('value', 0.5)
	        .on('input', function (_) {
	        updateAudioParam(anode, ndef.paramTypes[param], param, slider.val());
	    });
	    sliderBox.append(slider);
	    slider.after('<br/>' + ucfirst(param));
	    panel.append(sliderBox);
	}
	function renderOtherParam(n, ndef, param, panel) {
	    console.log(n.name, param);
	}
	function updateAudioParam(anode, ndef, param, svalue) {
	    //TODO use log scale
	    var value = parseFloat(svalue);
	    value = ndef.min + value * (ndef.max - ndef.min);
	    anode[param].setValueAtTime(value, 0);
	}
	function handleForm(form, n) {
	    form.find(':input').each(function (i, e) {
	        var $e = $(e);
	        //TODO set linear...
	        //TODO ramp with frame rate time
	        n[$e.attr('name')].setValueAtTime($e.val(), 0);
	    });
	    return false;
	}
	function ucfirst(str) {
	    return str[0].toUpperCase() + str.substring(1);
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map