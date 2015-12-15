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
	        if (n.nodeDef.control) {
	            if (!n.controlParam)
	                n.controlParam = Object.keys(this.nodeDef.params)[0];
	            n.anode.connect(this.anode[n.controlParam]);
	        }
	        else
	            n.anode.connect(this.anode);
	    };
	    SynthNode.prototype.removeInput = function (np) {
	        var removed = _super.prototype.removeInput.call(this, np);
	        if (removed.nodeDef.control) {
	            removed.anode.disconnect(this.anode[removed.controlParam]);
	            removed.controlParam = null;
	        }
	        else {
	            //TODO test fan-out
	            removed.anode.disconnect(this.anode);
	        }
	        return removed;
	    };
	    SynthNode.prototype.canBeSource = function () {
	        return this.anode.numberOfOutputs > 0;
	    };
	    SynthNode.prototype.canConnectInput = function (n) {
	        if (n.nodeDef.control)
	            return true;
	        return this.anode.numberOfInputs > 0;
	    };
	    return SynthNode;
	})(graph_1.Node);
	var gr = new graph_1.Graph($('#graph-canvas')[0]);
	var synth = new synth_1.Synth();
	main();
	function main() {
	    registerNodeSelection();
	    setArrowColors();
	    registerPaletteHandler();
	    registerPlayHandler();
	    addOutputNode();
	}
	function registerNodeSelection() {
	    gr.nodeSelected = function (n) {
	        paramsUI_1.renderParams(n.anode, synth.palette[n.type], $('.params-box'));
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
	        n.anode = synth.createAudioNode(n.type);
	        n.nodeDef = synth.palette[n.type];
	        gr.addNode(n, n.nodeDef.control ? 'node-ctrl' : undefined);
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
	function setArrowColors() {
	    var arrowColor = getCssFromClass('arrow', 'color');
	    var ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	    var originalDrawArrow = gr.graphDraw.drawArrow;
	    gr.graphDraw.drawArrow = function (srcNode, dstNode) {
	        this.arrowColor = srcNode.nodeDef.control ? ctrlArrowColor : arrowColor;
	        originalDrawArrow.bind(this)(srcNode, dstNode);
	    };
	}
	function getCssFromClass(className, propName) {
	    var tmp = $('<div>').addClass(className);
	    $('body').append(tmp);
	    var propValue = tmp.css(propName);
	    tmp.remove();
	    return propValue;
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
	    Graph.prototype.addNode = function (n, classes) {
	        n.element = $('<div>')
	            .addClass('node')
	            .text(n.name)
	            .css({ left: n.x, top: n.y, cursor: 'default' });
	        //TODO check if $.addClass admits multiple classes
	        if (classes)
	            n.element.addClass(classes);
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
	        this.gc.strokeStyle = this.arrowColor;
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
	    Synth.prototype.createAudioNode = function (type) {
	        var def = palette[type];
	        if (!def || !this.ac[def.constructor])
	            return null;
	        var anode = this.ac[def.constructor]();
	        for (var _i = 0, _a = Object.keys(def.params || {}); _i < _a.length; _i++) {
	            var param = _a[_i];
	            if (!anode[param])
	                console.warn("Parameter '" + param + "' not found for node " + type + "'");
	            else if (anode[param] instanceof AudioParam)
	                anode[param].value = def.params[param].initial;
	            else
	                anode[param] = def.params[param].initial;
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
	//-------------------- Node palette definition --------------------
	var OCTAVE_DETUNE = {
	    initial: 0,
	    min: -1200,
	    max: 1200,
	    linear: true
	};
	var FREQUENCY = {
	    initial: 220,
	    min: 20,
	    max: 20000
	};
	var palette = {
	    // Sources
	    Oscillator: {
	        constructor: 'createOscillator',
	        params: {
	            frequency: FREQUENCY,
	            detune: OCTAVE_DETUNE,
	            type: {
	                initial: 'sawtooth',
	                choices: ['sine', 'square', 'sawtooth', 'triangle']
	            }
	        }
	    },
	    // Effects
	    Gain: {
	        constructor: 'createGain',
	        params: {
	            gain: {
	                initial: 1,
	                min: 0,
	                max: 1,
	                linear: true
	            }
	        }
	    },
	    Filter: {
	        constructor: 'createBiquadFilter',
	        params: {
	            frequency: FREQUENCY,
	            Q: {
	                initial: 0,
	                min: 0,
	                max: 100
	            },
	            //TODO gain
	            detune: OCTAVE_DETUNE,
	            type: {
	                initial: 'lowpass',
	                choices: ['lowpass', 'highpass', 'bandpass',
	                    'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
	            }
	        },
	    },
	    // Controllers
	    LFO: {
	        constructor: 'createOscillator',
	        control: true,
	        params: {
	            frequency: {
	                initial: 2,
	                min: 0.01,
	                max: 200
	            },
	            detune: OCTAVE_DETUNE,
	            type: {
	                initial: 'sine',
	                choices: ['sine', 'square', 'sawtooth', 'triangle']
	            }
	        }
	    },
	    Speaker: {
	        constructor: null,
	        params: null
	    }
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	function renderParams(anode, ndef, panel) {
	    panel.empty();
	    for (var _i = 0, _a = Object.keys(ndef.params || {}); _i < _a.length; _i++) {
	        var param = _a[_i];
	        if (anode[param] instanceof AudioParam)
	            renderAudioParam(anode, ndef, param, panel);
	        else
	            renderOtherParam(anode, ndef, param, panel);
	    }
	}
	exports.renderParams = renderParams;
	function renderAudioParam(anode, ndef, param, panel) {
	    var pdef = ndef.params[param];
	    var aparam = anode[param];
	    var sliderBox = $('<div class="slider-box">');
	    var slider = $('<input type="range" orient="vertical">')
	        .attr('min', 0)
	        .attr('max', 1)
	        .attr('step', 0.001)
	        .attr('value', param2slider(aparam.value, pdef))
	        .on('input', function (_) {
	        var value = slider2param(parseFloat(slider.val()), pdef);
	        //TODO linear/log ramp at frame rate
	        aparam.setValueAtTime(value, 0);
	    });
	    sliderBox.append(slider);
	    slider.after('<br/>' + ucfirst(param));
	    panel.append(sliderBox);
	}
	function renderOtherParam(anode, ndef, param, panel) {
	    var pdef = ndef.params[param];
	    var choiceBox = $('<div class="choice-box">');
	    var combo = $('<select>').attr('size', pdef.choices.length);
	    for (var _i = 0, _a = pdef.choices; _i < _a.length; _i++) {
	        var choice = _a[_i];
	        var option = $('<option>').text(choice);
	        if (choice == anode[param])
	            option.attr('selected', 'selected');
	        combo.append(option);
	    }
	    choiceBox.append(combo);
	    combo.after('<br/><br/>' + ucfirst(param));
	    panel.append(choiceBox);
	    combo.on('input', function (_) {
	        anode[param] = combo.val();
	    });
	}
	var LOG_BASE = 2;
	function logarithm(base, x) {
	    return Math.log(x) / Math.log(base);
	}
	function param2slider(paramValue, pdef) {
	    if (pdef.linear) {
	        return (paramValue - pdef.min) / (pdef.max - pdef.min);
	    }
	    else {
	        if (paramValue - pdef.min == 0)
	            return 0;
	        var logRange = logarithm(LOG_BASE, pdef.max - pdef.min);
	        return logarithm(LOG_BASE, paramValue - pdef.min) / logRange;
	    }
	}
	function slider2param(sliderValue, pdef) {
	    if (pdef.linear) {
	        return pdef.min + sliderValue * (pdef.max - pdef.min);
	    }
	    else {
	        var logRange = logarithm(LOG_BASE, pdef.max - pdef.min);
	        return pdef.min + Math.pow(LOG_BASE, sliderValue * logRange);
	    }
	}
	//-------------------- Misc utilities --------------------
	function ucfirst(str) {
	    return str[0].toUpperCase() + str.substring(1);
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map