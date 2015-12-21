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

	var synthUI_1 = __webpack_require__(1);
	var keyboard_1 = __webpack_require__(6);
	var graphCanvas = $('#graph-canvas')[0];
	var synthUI = new synthUI_1.SynthUI(graphCanvas, $('#node-params'));
	setupKeyboard();
	function setupKeyboard() {
	    var kb = new keyboard_1.Keyboard();
	    kb.noteOn = function (midi, ratio) {
	        synthUI.synth.noteOn(midi, 1, ratio);
	    };
	    kb.noteOff = function (midi) {
	        synthUI.synth.noteOff(midi, 1);
	    };
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var notes_1 = __webpack_require__(2);
	var SynthUI = (function () {
	    function SynthUI(graphCanvas, jqParams) {
	        this.gr = new graph_1.Graph(graphCanvas);
	        this.gr.handler = new SynthGraphHandler(jqParams);
	        this.synth = new synth_1.Synth();
	        this.registerPaletteHandler();
	        this.addOutputNode();
	    }
	    SynthUI.prototype.addOutputNode = function () {
	        //TODO avoid using hardcoded position
	        var out = new graph_1.Node(500, 180, 'Out');
	        var data = new NodeData();
	        out.data = data;
	        data.anode = this.synth.ac.destination;
	        data.nodeDef = this.synth.palette['Speaker'];
	        this.gr.addNode(out);
	    };
	    SynthUI.prototype.registerPaletteHandler = function () {
	        var self = this; // JQuery sets 'this' in event handlers
	        $('.palette > .node').click(function (evt) {
	            var elem = $(this);
	            self.addNode(elem.attr('data-type'), elem.text());
	        });
	    };
	    SynthUI.prototype.addNode = function (type, text) {
	        var n = new graph_1.Node(260, 180, text);
	        var data = new NodeData();
	        n.data = data;
	        data.anode = this.synth.createAudioNode(type);
	        data.nodeDef = this.synth.palette[type];
	        this.gr.addNode(n, data.nodeDef.control ? 'node-ctrl' : undefined);
	        if (!data.anode) {
	            console.warn("No AudioNode found for '" + type + "'");
	            n.element.css('background-color', '#BBB');
	        }
	        else {
	            var nh = data.nodeDef.noteHandler;
	            if (nh) {
	                data.noteHandler = new notes_1.NoteHandlers[nh](n);
	                this.synth.addNoteHandler(data.noteHandler);
	            }
	            else if (data.anode['start'])
	                data.anode['start']();
	        }
	    };
	    return SynthUI;
	})();
	exports.SynthUI = SynthUI;
	var NodeData = (function () {
	    function NodeData() {
	    }
	    return NodeData;
	})();
	exports.NodeData = NodeData;
	//-------------------- Privates --------------------
	var graph_1 = __webpack_require__(3);
	var synth_1 = __webpack_require__(4);
	var paramsUI_1 = __webpack_require__(5);
	var SynthGraphHandler = (function () {
	    function SynthGraphHandler(jqParams) {
	        this.jqParams = jqParams;
	        this.arrowColor = getCssFromClass('arrow', 'color');
	        this.ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	    }
	    SynthGraphHandler.prototype.canBeSource = function (n) {
	        var data = n.data;
	        return data.anode.numberOfOutputs > 0;
	    };
	    SynthGraphHandler.prototype.canConnect = function (src, dst) {
	        var srcData = src.data;
	        var dstData = dst.data;
	        //TODO even if src node is control, should not connect to Speaker output
	        if (srcData.nodeDef.control)
	            return true;
	        return dstData.anode.numberOfInputs > 0;
	    };
	    SynthGraphHandler.prototype.connected = function (src, dst) {
	        var srcData = src.data;
	        var dstData = dst.data;
	        if (srcData.nodeDef.control && !dstData.nodeDef.control) {
	            srcData.controlParams = Object.keys(dstData.nodeDef.params)
	                .filter(function (pname) { return dstData.anode[pname] instanceof AudioParam; });
	            srcData.controlParam = srcData.controlParams[0];
	            srcData.controlTarget = dstData.anode;
	            srcData.anode.connect(dstData.anode[srcData.controlParam]);
	        }
	        else
	            srcData.anode.connect(dstData.anode);
	    };
	    SynthGraphHandler.prototype.disconnected = function (src, dst) {
	        var srcData = src.data;
	        var dstData = dst.data;
	        if (srcData.nodeDef.control && !dstData.nodeDef.control) {
	            srcData.controlParams = null;
	            srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
	        }
	        else
	            srcData.anode.disconnect(dstData.anode);
	    };
	    SynthGraphHandler.prototype.nodeSelected = function (n) {
	        var data = n.data;
	        paramsUI_1.renderParams(data, this.jqParams);
	    };
	    SynthGraphHandler.prototype.getArrowColor = function (src, dst) {
	        var srcData = src.data;
	        return srcData.nodeDef.control ? this.ctrlArrowColor : this.arrowColor;
	    };
	    return SynthGraphHandler;
	})();
	function getCssFromClass(className, propName) {
	    var tmp = $('<div>').addClass(className);
	    $('body').append(tmp);
	    var propValue = tmp.css(propName);
	    tmp.remove();
	    return propValue;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	var OscNoteHandler = (function () {
	    function OscNoteHandler(n) {
	        this.clones = [];
	        this.node = n;
	        this.outTracker = new OutputTracker(n.data.anode);
	    }
	    OscNoteHandler.prototype.noteOn = function (midi, gain, ratio) {
	        // Clone, connect and start
	        var osc = this.clone();
	        //TODO should also listen to value changes on original osc and apply them to clones
	        this.clones[midi] = osc;
	        osc.frequency.value = osc.frequency.value * ratio;
	        osc.start();
	    };
	    OscNoteHandler.prototype.noteOff = function (midi, gain) {
	        //TODO if ADSR is present, noteEnd will be generated by ADSR module
	        this.noteEnd(midi);
	    };
	    OscNoteHandler.prototype.noteEnd = function (midi) {
	        // Stop and disconnect
	        var osc = this.clones[midi];
	        if (!osc)
	            return;
	        osc.stop();
	        this.disconnect(osc);
	        this.clones[midi] = null;
	    };
	    OscNoteHandler.prototype.clone = function () {
	        var data = this.node.data;
	        // Create clone
	        var anode = data.anode.context[data.nodeDef.constructor]();
	        // Copy parameters
	        for (var _i = 0, _a = Object.keys(data.nodeDef.params); _i < _a.length; _i++) {
	            var pname = _a[_i];
	            var param = data.anode[pname];
	            if (param instanceof AudioParam)
	                anode[pname].value = data.anode[pname].value;
	            else
	                anode[pname] = data.anode[pname];
	        }
	        // Copy output connections
	        for (var _b = 0, _c = this.outTracker.outputs; _b < _c.length; _b++) {
	            var out = _c[_b];
	            anode.connect(out);
	        }
	        // Copy control input connections
	        for (var _d = 0, _e = this.node.inputs; _d < _e.length; _d++) {
	            var inNode = _e[_d];
	            var inData = inNode.data;
	            inNode.data.anode.connect(anode[inData.controlParam]);
	        }
	        //TODO should copy snapshot of list of inputs and outputs
	        //...in case user connects or disconnects during playback
	        return anode;
	    };
	    OscNoteHandler.prototype.disconnect = function (anode) {
	        // Disconnect outputs
	        for (var _i = 0, _a = this.outTracker.outputs; _i < _a.length; _i++) {
	            var out = _a[_i];
	            anode.disconnect(out);
	        }
	        // Disconnect control inputs
	        for (var _b = 0, _c = this.node.inputs; _b < _c.length; _b++) {
	            var inNode = _c[_b];
	            var inData = inNode.data;
	            inNode.data.anode.disconnect(anode[inData.controlParam]);
	        }
	    };
	    return OscNoteHandler;
	})();
	exports.NoteHandlers = {
	    'osc': OscNoteHandler
	};
	var OutputTracker = (function () {
	    function OutputTracker(anode) {
	        this.outputs = [];
	        this.onBefore(anode, 'connect', this.connect);
	        this.onBefore(anode, 'disconnect', this.disconnect);
	    }
	    OutputTracker.prototype.connect = function (anode) {
	        if (!(anode instanceof AudioNode))
	            return;
	        this.outputs.push(anode);
	    };
	    OutputTracker.prototype.disconnect = function (anode) {
	        if (!(anode instanceof AudioNode))
	            return;
	        removeArrayElement(this.outputs, anode);
	    };
	    OutputTracker.prototype.onBefore = function (obj, fname, funcToCall) {
	        var oldf = obj[fname];
	        var self = this;
	        obj[fname] = function () {
	            funcToCall.apply(self, arguments);
	            oldf.apply(obj, arguments);
	        };
	    };
	    return OutputTracker;
	})();
	function removeArrayElement(a, e) {
	    var pos = a.indexOf(e);
	    if (pos < 0)
	        return false; // not found
	    a.splice(pos, 1);
	    return true;
	}
	exports.removeArrayElement = removeArrayElement;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Graph = (function () {
	    function Graph(canvas) {
	        this.nodes = [];
	        this.nodeCanvas = $(canvas.parentElement);
	        var gc = canvas.getContext('2d');
	        this.graphDraw = new GraphDraw(this, gc, canvas);
	        this.graphInteract = new GraphInteraction(this, gc);
	        this.handler = new DefaultGraphHandler();
	    }
	    Graph.prototype.addNode = function (n, classes) {
	        n.element = $('<div>')
	            .addClass('node')
	            .text(n.name)
	            .css({ left: n.x, top: n.y, cursor: 'default' });
	        if (classes)
	            n.element.addClass(classes);
	        this.nodeCanvas.append(n.element);
	        this.nodes.push(n);
	        this.graphInteract.registerNode(n);
	        this.draw();
	    };
	    Graph.prototype.removeNode = function (n) {
	        alert('Sorry, not available yet');
	    };
	    Graph.prototype.connect = function (srcn, dstn) {
	        if (!this.handler.canBeSource(srcn) || !this.handler.canConnect(srcn, dstn))
	            return false;
	        dstn.addInput(srcn);
	        this.handler.connected(srcn, dstn);
	        return true;
	    };
	    Graph.prototype.disconnect = function (srcn, dstn) {
	        if (!dstn.removeInput(srcn))
	            return false;
	        this.handler.disconnected(srcn, dstn);
	        return true;
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
	    };
	    Node.prototype.removeInput = function (n) {
	        var pos = this.inputs.indexOf(n);
	        if (pos < 0)
	            return false;
	        this.inputs.splice(pos, 1);
	        return true;
	    };
	    return Node;
	})();
	exports.Node = Node;
	//------------------------- Privates -------------------------
	var DefaultGraphHandler = (function () {
	    function DefaultGraphHandler() {
	    }
	    DefaultGraphHandler.prototype.canBeSource = function (n) { return true; };
	    DefaultGraphHandler.prototype.canConnect = function (src, dst) { return true; };
	    DefaultGraphHandler.prototype.connected = function (src, dst) { };
	    DefaultGraphHandler.prototype.disconnected = function (src, dst) { };
	    DefaultGraphHandler.prototype.nodeSelected = function (n) { };
	    DefaultGraphHandler.prototype.getArrowColor = function (src, dst) { return "black"; };
	    return DefaultGraphHandler;
	})();
	var GraphInteraction = (function () {
	    function GraphInteraction(graph, gc) {
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
	            _this.graph.handler.nodeSelected(n);
	        });
	    };
	    GraphInteraction.prototype.setupConnectHandler = function () {
	        var _this = this;
	        var srcn;
	        var connecting = false;
	        $('body').keydown(function (evt) {
	            if (evt.keyCode != 16 || connecting)
	                return;
	            srcn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!srcn)
	                return;
	            if (!_this.graph.handler.canBeSource(srcn)) {
	                srcn.element.css('cursor', 'not-allowed');
	                return;
	            }
	            connecting = true;
	            _this.registerRubberBanding(srcn);
	        })
	            .keyup(function (evt) {
	            if (evt.keyCode != 16)
	                return;
	            connecting = false;
	            _this.deregisterRubberBanding();
	            var dstn = _this.getNodeFromDOM(_this.getElementUnderMouse());
	            if (!dstn || srcn == dstn)
	                return;
	            _this.connectOrDisconnect(srcn, dstn);
	            _this.graph.draw();
	        });
	    };
	    GraphInteraction.prototype.connectOrDisconnect = function (srcn, dstn) {
	        if (this.graph.disconnect(srcn, dstn))
	            return;
	        else
	            this.graph.connect(srcn, dstn);
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
	        // Setup cursors
	        this.graph.nodeCanvas.css('cursor', 'crosshair');
	        this.graph.nodeCanvas.find('.node').css('cursor', 'crosshair');
	        for (var _i = 0, _a = this.graph.nodes; _i < _a.length; _i++) {
	            var n = _a[_i];
	            if (n != srcn && !this.graph.handler.canConnect(srcn, n))
	                n.element.css('cursor', 'not-allowed');
	        }
	    };
	    GraphInteraction.prototype.deregisterRubberBanding = function () {
	        this.graph.nodeCanvas.css('cursor', '');
	        this.graph.nodeCanvas.find('.node').css('cursor', 'default');
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
	    function GraphDraw(graph, gc, canvas) {
	        this.arrowHeadLen = 10;
	        this.graph = graph;
	        this.gc = gc;
	        this.canvas = canvas;
	        this.nodes = graph.nodes;
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
	        this.gc.strokeStyle = this.graph.handler.getArrowColor(srcNode, dstNode);
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var notes_1 = __webpack_require__(2);
	var Synth = (function () {
	    function Synth() {
	        this.noteHandlers = [];
	        var CtxClass = window.AudioContext || window.webkitAudioContext;
	        this.ac = new CtxClass();
	        this.palette = palette;
	    }
	    Synth.prototype.createAudioNode = function (type) {
	        var def = palette[type];
	        if (!def || !this.ac[def.constructor])
	            return null;
	        var anode = this.ac[def.constructor]();
	        this.initNodeParams(anode, def, type);
	        return anode;
	    };
	    Synth.prototype.play = function () {
	        this.ac.resume();
	    };
	    Synth.prototype.stop = function () {
	        this.ac.suspend();
	    };
	    Synth.prototype.noteOn = function (midi, gain, ratio) {
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            nh.noteOn(midi, gain, ratio);
	        }
	    };
	    Synth.prototype.noteOff = function (midi, gain) {
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            nh.noteOff(midi, gain);
	        }
	    };
	    Synth.prototype.addNoteHandler = function (nh) {
	        this.noteHandlers.push(nh);
	    };
	    Synth.prototype.removeNoteHandler = function (nh) {
	        notes_1.removeArrayElement(this.noteHandlers, nh);
	    };
	    Synth.prototype.initNodeParams = function (anode, def, type) {
	        for (var _i = 0, _a = Object.keys(def.params || {}); _i < _a.length; _i++) {
	            var param = _a[_i];
	            if (!anode[param])
	                console.warn("Parameter '" + param + "' not found for node " + type + "'");
	            else if (anode[param] instanceof AudioParam)
	                anode[param].value = def.params[param].initial;
	            else
	                anode[param] = def.params[param].initial;
	        }
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
	        noteHandler: 'osc',
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
	                max: 10,
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
	    Delay: {
	        constructor: 'createDelay',
	        params: {
	            delayTime: {
	                initial: 1,
	                min: 0,
	                max: 5
	            }
	        }
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
	    GainCtrl: {
	        constructor: 'createGain',
	        control: true,
	        params: {
	            gain: {
	                initial: 10,
	                min: 0,
	                max: 1000,
	                linear: true
	            }
	        }
	    },
	    // Output
	    Speaker: {
	        constructor: null,
	        params: null
	    }
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	function renderParams(ndata, panel) {
	    panel.empty();
	    if (ndata.nodeDef.control)
	        renderParamControl(ndata, panel);
	    for (var _i = 0, _a = Object.keys(ndata.nodeDef.params || {}); _i < _a.length; _i++) {
	        var param = _a[_i];
	        if (ndata.anode[param] instanceof AudioParam)
	            renderAudioParam(ndata.anode, ndata.nodeDef, param, panel);
	        else
	            renderOtherParam(ndata.anode, ndata.nodeDef, param, panel);
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
	        .attr('value', param2slider(aparam.value, pdef));
	    var numInput = $('<input type="number">')
	        .attr('min', pdef.min)
	        .attr('max', pdef.max)
	        .attr('value', aparam.value);
	    sliderBox.append(numInput);
	    sliderBox.append(slider);
	    sliderBox.append($('<span><br/>' + ucfirst(param) + '</span>'));
	    panel.append(sliderBox);
	    slider.on('input', function (_) {
	        var value = slider2param(parseFloat(slider.val()), pdef);
	        numInput.val(truncateFloat(value, 5));
	        aparam.value = value;
	    });
	    numInput.on('input', function (_) {
	        var value = numInput.val();
	        if (value.length == 0 || isNaN(value))
	            return;
	        slider.val(param2slider(value, pdef));
	        aparam.value = value;
	    });
	}
	function renderParamControl(ndata, panel) {
	    if (!ndata.controlParams)
	        return;
	    var combo = renderCombo(panel, ndata.controlParams, ndata.controlParam, 'Controlling');
	    combo.on('input', function (_) {
	        if (ndata.controlParam)
	            ndata.anode.disconnect(ndata.controlTarget[ndata.controlParam]);
	        ndata.controlParam = combo.val();
	        ndata.anode.connect(ndata.controlTarget[ndata.controlParam]);
	    });
	}
	function renderOtherParam(anode, ndef, param, panel) {
	    var combo = renderCombo(panel, ndef.params[param].choices, anode[param], ucfirst(param));
	    combo.on('input', function (_) {
	        anode[param] = combo.val();
	    });
	}
	function renderCombo(panel, choices, selected, label) {
	    var choiceBox = $('<div class="choice-box">');
	    var combo = $('<select>').attr('size', choices.length);
	    for (var _i = 0; _i < choices.length; _i++) {
	        var choice = choices[_i];
	        var option = $('<option>').text(choice);
	        if (choice == selected)
	            option.attr('selected', 'selected');
	        combo.append(option);
	    }
	    choiceBox.append(combo);
	    combo.after('<br/><br/>' + label);
	    panel.append(choiceBox);
	    return combo;
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
	function truncateFloat(f, len) {
	    var s = '' + f;
	    s = s.substr(0, len);
	    if (s[s.length - 1] == '.')
	        return s.substr(0, len - 1);
	    else
	        return s;
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	var KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
	var BASE_NOTE = 36;
	var SEMITONE = Math.pow(2, 1 / 12);
	var A4 = 57;
	var Keyboard = (function () {
	    function Keyboard() {
	        this.setupHandler();
	    }
	    Keyboard.prototype.setupHandler = function () {
	        var _this = this;
	        var pressedKeys = {};
	        $('body')
	            .on('keydown', function (evt) {
	            if (pressedKeys[evt.keyCode])
	                return; // Skip repetitions
	            pressedKeys[evt.keyCode] = true;
	            var midi = _this.key2midi(evt.keyCode);
	            if (midi < 0)
	                return;
	            _this.noteOn(midi, _this.midi2freqRatio(midi));
	        })
	            .on('keyup', function (evt) {
	            pressedKeys[evt.keyCode] = false;
	            var midi = _this.key2midi(evt.keyCode);
	            if (midi < 0)
	                return;
	            _this.noteOff(midi);
	        });
	    };
	    Keyboard.prototype.key2midi = function (keyCode) {
	        var pos = KB_NOTES.indexOf(String.fromCharCode(keyCode));
	        if (pos < 0)
	            return -1;
	        return BASE_NOTE + pos;
	    };
	    Keyboard.prototype.midi2freqRatio = function (midi) {
	        return Math.pow(SEMITONE, midi - A4);
	    };
	    Keyboard.prototype.noteOn = function (midi, ratio) { };
	    Keyboard.prototype.noteOff = function (midi) { };
	    return Keyboard;
	})();
	exports.Keyboard = Keyboard;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map