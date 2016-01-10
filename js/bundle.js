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

	/**
	 * Main entry point: setup synth editor and keyboard listener.
	 */
	var synthUI_1 = __webpack_require__(1);
	var noteInputs_1 = __webpack_require__(11);
	var presets_1 = __webpack_require__(18);
	var graphCanvas = $('#graph-canvas')[0];
	var synthUI = new synthUI_1.SynthUI(createAudioContext(), graphCanvas, $('#node-params'), $('#audio-graph-fft'), $('#audio-graph-osc'));
	setupPanels();
	function createAudioContext() {
	    var CtxClass = window.AudioContext || window.webkitAudioContext;
	    return new CtxClass();
	}
	function setupPanels() {
	    setupPalette();
	    var inputs = new noteInputs_1.NoteInputs(synthUI);
	    var presets = new presets_1.Presets(synthUI);
	    presets.beforeSave = function (json) { return $.extend(json, { keyboard: inputs.piano.toJSON() }); };
	    presets.afterLoad = function (json) { return inputs.piano.fromJSON(json.keyboard); };
	}
	function setupPalette() {
	    $(function () {
	        $('.nano')['nanoScroller']({ preventPageScrolling: true });
	    });
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var graph_1 = __webpack_require__(2);
	var synth_1 = __webpack_require__(3);
	var popups = __webpack_require__(8);
	/**
	 * Customizes the generic graph editor in order to manipulate and control a graph of
	 * AudioNodes
	 */
	var SynthUI = (function () {
	    function SynthUI(ac, graphCanvas, jqParams, jqFFT, jqOsc) {
	        this.gr = new graph_1.Graph(graphCanvas);
	        this.gr.handler = new SynthGraphHandler(this, jqParams, jqFFT, jqOsc);
	        this.synth = new synth_1.Synth(ac);
	        this.synth.paramHandlers.BufferURL.popups = popups;
	        this.registerPaletteHandler();
	        this.addOutputNode();
	    }
	    SynthUI.prototype.addOutputNode = function () {
	        //TODO avoid using hardcoded position
	        var out = new graph_1.Node(500, 210, 'Out');
	        out.data = new GraphNodeData(out);
	        this.synth.initOutputNodeData(out.data, this.synth.ac.destination);
	        this.outNode = out.data.anode;
	        this.gr.addNode(out, 'node-out');
	        this.initNodeDimensions(out);
	    };
	    SynthUI.prototype.registerPaletteHandler = function () {
	        var self = this; // JQuery sets 'this' in event handlers
	        $('.palette .node').click(function (evt) {
	            var elem = $(this);
	            var classes = elem.attr('class').split(/\s+/).filter(function (c) { return c != 'node'; });
	            self.addNode(elem.attr('data-type'), elem.find('.node-text').html(), classes.join(' '));
	        });
	    };
	    SynthUI.prototype.addNode = function (type, text, classes) {
	        var _a = this.findFreeSpot(), x = _a.x, y = _a.y;
	        var n = new graph_1.Node(x, y, text);
	        this.createNodeData(n, type);
	        this.gr.addNode(n, classes);
	        this.gr.selectNode(n);
	    };
	    SynthUI.prototype.removeNode = function (n) {
	        this.gr.removeNode(n);
	    };
	    SynthUI.prototype.removeNodeData = function (data) {
	        this.synth.removeNodeData(data);
	    };
	    SynthUI.prototype.createNodeData = function (n, type) {
	        n.data = new GraphNodeData(n);
	        if (type == 'out') {
	            this.synth.initOutputNodeData(n.data, this.synth.ac.destination);
	            this.outNode = n.data.anode;
	        }
	        else
	            this.synth.initNodeData(n.data, type);
	    };
	    //----- Rest of methods are used to find a free spot in the canvas -----
	    SynthUI.prototype.findFreeSpot = function () {
	        var maxDist = 0;
	        var canvasW = this.gr.canvas.width;
	        var canvasH = this.gr.canvas.height;
	        var x = canvasW / 2;
	        var y = canvasH / 2;
	        for (var xx = 10; xx < canvasW - this.nw; xx += 10) {
	            for (var yy = 10; yy < canvasH - this.nh; yy += 10) {
	                var dist = this.dist2nearestNode(xx, yy);
	                if (dist > maxDist && dist < this.nw * 3) {
	                    x = xx;
	                    y = yy;
	                    maxDist = dist;
	                }
	            }
	        }
	        return { x: x, y: y };
	    };
	    SynthUI.prototype.dist2nearestNode = function (x, y) {
	        var minDist = Number.MAX_VALUE;
	        for (var _i = 0, _a = this.gr.nodes; _i < _a.length; _i++) {
	            var n = _a[_i];
	            var dx = x - n.x;
	            var dy = y - n.y;
	            var dist = Math.sqrt(dx * dx + dy * dy);
	            if (dist < minDist)
	                minDist = dist;
	        }
	        return minDist;
	    };
	    SynthUI.prototype.initNodeDimensions = function (n) {
	        this.nw = n.element.outerWidth();
	        this.nh = n.element.outerHeight();
	    };
	    return SynthUI;
	})();
	exports.SynthUI = SynthUI;
	var paramsUI_1 = __webpack_require__(9);
	var analyzer_1 = __webpack_require__(10);
	var GraphNodeData = (function (_super) {
	    __extends(GraphNodeData, _super);
	    function GraphNodeData(node) {
	        _super.call(this);
	        this.node = node;
	    }
	    GraphNodeData.prototype.getInputs = function () {
	        var result = [];
	        for (var _i = 0, _a = this.node.inputs; _i < _a.length; _i++) {
	            var nin = _a[_i];
	            result.push(nin.data);
	        }
	        return result;
	    };
	    return GraphNodeData;
	})(synth_1.NodeData);
	var SynthGraphHandler = (function () {
	    function SynthGraphHandler(synthUI, jqParams, jqFFT, jqOsc) {
	        this.synthUI = synthUI;
	        this.jqParams = jqParams;
	        this.arrowColor = getCssFromClass('arrow', 'color');
	        this.ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
	        this.registerNodeDelete();
	        this.analyzer = new analyzer_1.AudioAnalyzer(jqFFT, jqOsc);
	    }
	    SynthGraphHandler.prototype.registerNodeDelete = function () {
	        var _this = this;
	        $('body').keydown(function (evt) {
	            if (!(evt.keyCode == 46 || (evt.keyCode == 8 && evt.metaKey)))
	                return;
	            if (popups.isOpen)
	                return;
	            var selectedNode = _this.getSelectedNode();
	            if (!selectedNode)
	                return;
	            if (selectedNode.data.isOut)
	                return;
	            popups.confirm('Delete node?', 'Please confirm node deletion', function (confirmed) {
	                if (!confirmed)
	                    return;
	                _this.synthUI.removeNode(selectedNode);
	                _this.jqParams.empty();
	            });
	        });
	    };
	    SynthGraphHandler.prototype.getSelectedNode = function () {
	        for (var _i = 0, _a = this.synthUI.gr.nodes; _i < _a.length; _i++) {
	            var node = _a[_i];
	            if (node.element.hasClass('selected'))
	                return node;
	        }
	        return null;
	    };
	    SynthGraphHandler.prototype.hasAudioParams = function (ndata) {
	        var aparams = Object.keys(ndata.nodeDef.params)
	            .filter(function (pname) { return ndata.anode[pname] instanceof AudioParam; });
	        return aparams.length > 0;
	    };
	    //-------------------- Implementation of the GraphHandler interface -------------------- 
	    SynthGraphHandler.prototype.canBeSource = function (n) {
	        var data = n.data;
	        return data.anode != this.synthUI.outNode;
	    };
	    SynthGraphHandler.prototype.canConnect = function (src, dst) {
	        var srcData = src.data;
	        var dstData = dst.data;
	        if (srcData.nodeDef.control)
	            return this.hasAudioParams(dstData);
	        return dstData.anode.numberOfInputs > 0;
	    };
	    SynthGraphHandler.prototype.connected = function (src, dst) {
	        this.synthUI.synth.connectNodes(src.data, dst.data);
	        //TODO update paramsUI in case selected node is src
	    };
	    SynthGraphHandler.prototype.disconnected = function (src, dst) {
	        this.synthUI.synth.disconnectNodes(src.data, dst.data);
	    };
	    SynthGraphHandler.prototype.nodeSelected = function (n) {
	        var data = n.data;
	        paramsUI_1.renderParams(data, this.jqParams);
	    };
	    SynthGraphHandler.prototype.nodeRemoved = function (n) {
	        this.synthUI.removeNodeData(n.data);
	    };
	    SynthGraphHandler.prototype.getArrowColor = function (src, dst) {
	        var srcData = src.data;
	        return srcData.nodeDef.control ? this.ctrlArrowColor : this.arrowColor;
	    };
	    SynthGraphHandler.prototype.data2json = function (n) {
	        return this.synthUI.synth.nodeData2json(n.data);
	    };
	    SynthGraphHandler.prototype.json2data = function (n, json) {
	        this.synthUI.createNodeData(n, json.type);
	        this.synthUI.synth.json2NodeData(json, n.data);
	    };
	    SynthGraphHandler.prototype.graphLoaded = function () {
	        this.analyzer.analyze(this.synthUI.outNode);
	    };
	    SynthGraphHandler.prototype.graphSaved = function () { };
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

	var SHIFT_KEY = 16;
	var CAPS_LOCK = 20;
	/**
	 * A generic directed graph editor.
	 */
	var Graph = (function () {
	    function Graph(canvas) {
	        this.nodes = [];
	        this.lastId = 0;
	        this.nodeCanvas = $(canvas.parentElement);
	        this.canvas = canvas;
	        var gc = canvas.getContext('2d');
	        this.graphDraw = new GraphDraw(this, gc, canvas);
	        this.graphInteract = new GraphInteraction(this, gc);
	        this.handler = new DefaultGraphHandler();
	    }
	    Graph.prototype.addNode = function (n, classes) {
	        n.id = this.lastId++;
	        n.element = $('<div>')
	            .addClass('node')
	            .html("<div class=\"node-text\">" + n.name + "</div>")
	            .css({ left: n.x, top: n.y, cursor: 'default' });
	        if (classes)
	            n.element.addClass(classes);
	        this.nodeCanvas.append(n.element);
	        this.nodes.push(n);
	        this.graphInteract.registerNode(n);
	        this.draw();
	    };
	    Graph.prototype.removeNode = function (n) {
	        var pos = this.nodes.indexOf(n);
	        if (pos < 0)
	            return console.warn("Node '" + n.name + "' is not a member of graph");
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var nn = _a[_i];
	            if (n == nn)
	                continue;
	            this.disconnect(n, nn);
	            this.disconnect(nn, n);
	        }
	        this.nodes.splice(pos, 1);
	        n.element.remove();
	        this.handler.nodeRemoved(n);
	        this.draw();
	    };
	    Graph.prototype.selectNode = function (n) {
	        this.graphInteract.selectNode(n);
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
	    Graph.prototype.toJSON = function () {
	        var jsonNodes = [];
	        var jsonNodeData = [];
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var node = _a[_i];
	            var nodeInputs = [];
	            for (var _b = 0, _c = node.inputs; _b < _c.length; _b++) {
	                var nin = _c[_b];
	                nodeInputs.push(nin.id);
	            }
	            jsonNodes.push({
	                id: node.id,
	                x: node.x,
	                y: node.y,
	                name: node.name,
	                inputs: nodeInputs,
	                classes: this.getAppClasses(node)
	            });
	            jsonNodeData.push(this.handler.data2json(node));
	        }
	        var jsonGraph = {
	            nodes: jsonNodes,
	            nodeData: jsonNodeData
	        };
	        this.handler.graphSaved();
	        return jsonGraph;
	    };
	    Graph.prototype.fromJSON = function (json) {
	        // First, remove existing nodes
	        while (this.nodes.length > 0)
	            this.removeNode(this.nodes[0]);
	        this.lastId = 0;
	        // Then add nodes
	        for (var _i = 0, _a = json.nodes; _i < _a.length; _i++) {
	            var jn = _a[_i];
	            var node = new Node(jn.x, jn.y, jn.name);
	            this.addNode(node);
	            node.id = jn.id; // Override id after being initialized inside addNode
	            node.element.attr('class', jn.classes);
	        }
	        // Then connect them
	        var gh = this.handler;
	        this.handler = new DefaultGraphHandler(); // Disable graph handler
	        for (var i = 0; i < json.nodes.length; i++) {
	            for (var _b = 0, _c = json.nodes[i].inputs; _b < _c.length; _b++) {
	                var inum = _c[_b];
	                var src = this.nodeById(inum);
	                this.connect(src, this.nodes[i]);
	            }
	        }
	        this.handler = gh; // Restore graph handler
	        // Then set their data
	        for (var i = 0; i < json.nodes.length; i++) {
	            this.handler.json2data(this.nodes[i], json.nodeData[i]);
	        }
	        // Then notify connections to handler
	        for (var _d = 0, _e = this.nodes; _d < _e.length; _d++) {
	            var dst = _e[_d];
	            for (var _f = 0, _g = dst.inputs; _f < _g.length; _f++) {
	                var src = _g[_f];
	                this.handler.connected(src, dst);
	            }
	        }
	        // And finally, draw the new graph
	        this.draw();
	        this.handler.graphLoaded();
	    };
	    Graph.prototype.nodeById = function (id) {
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var node = _a[_i];
	            if (node.id === id)
	                return node;
	        }
	        return null;
	    };
	    Graph.prototype.getAppClasses = function (n) {
	        var classes = n.element[0].className.split(/\s+/);
	        var result = [];
	        for (var _i = 0; _i < classes.length; _i++) {
	            var cname = classes[_i];
	            if (cname == 'selected')
	                continue;
	            if (cname.substr(0, 3) == 'ui-')
	                continue;
	            result.push(cname);
	        }
	        return result.join(' ');
	    };
	    return Graph;
	})();
	exports.Graph = Graph;
	/**
	 * A node in the graph. Application-specific data can be attached
	 * to its data property.
	 */
	var Node = (function () {
	    function Node(x, y, name) {
	        this.inputs = [];
	        this.x = x;
	        this.y = y;
	        this.name = name.replace(/<[^<]*>/g, function (t) { return t == '<br>' ? t : ''; });
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
	/** Default, do-nothing GraphHandler implementation */
	var DefaultGraphHandler = (function () {
	    function DefaultGraphHandler() {
	    }
	    DefaultGraphHandler.prototype.canBeSource = function (n) { return true; };
	    DefaultGraphHandler.prototype.canConnect = function (src, dst) { return true; };
	    DefaultGraphHandler.prototype.connected = function (src, dst) { };
	    DefaultGraphHandler.prototype.disconnected = function (src, dst) { };
	    DefaultGraphHandler.prototype.nodeSelected = function (n) { };
	    DefaultGraphHandler.prototype.nodeRemoved = function (n) { };
	    DefaultGraphHandler.prototype.getArrowColor = function (src, dst) { return "black"; };
	    DefaultGraphHandler.prototype.data2json = function (n) { return {}; };
	    DefaultGraphHandler.prototype.json2data = function (n, json) { };
	    DefaultGraphHandler.prototype.graphLoaded = function () { };
	    DefaultGraphHandler.prototype.graphSaved = function () { };
	    return DefaultGraphHandler;
	})();
	/**
	 * Handles all UI interaction with graph in order to move, select, connect
	 * and disconnect nodes.
	 */
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
	            _this.selectNode(n);
	        });
	    };
	    GraphInteraction.prototype.selectNode = function (n) {
	        if (this.selectedNode)
	            this.selectedNode.element.removeClass('selected');
	        n.element.addClass('selected');
	        this.selectedNode = n;
	        this.graph.handler.nodeSelected(n);
	    };
	    GraphInteraction.prototype.setupConnectHandler = function () {
	        var _this = this;
	        var srcn;
	        var connecting = false;
	        $('body').keydown(function (evt) {
	            if (evt.keyCode == CAPS_LOCK)
	                return _this.setGrid([20, 20]);
	            if (evt.keyCode != SHIFT_KEY || connecting)
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
	            if (evt.keyCode == CAPS_LOCK)
	                return _this.setGrid(null);
	            if (evt.keyCode != SHIFT_KEY)
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
	    GraphInteraction.prototype.setGrid = function (grid) {
	        $(this.graph.nodeCanvas).find('.node').draggable("option", "grid", grid);
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
	        if (jqNode.hasClass('node'))
	            return jqNode;
	        if (jqNode.parent().hasClass('node'))
	            return jqNode.parent();
	        return null;
	    };
	    GraphInteraction.prototype.registerRubberBanding = function (srcn) {
	        var _this = this;
	        var ofs = this.graph.nodeCanvas.offset();
	        var dstn = new Node(0, 0, '');
	        dstn.w = 0;
	        dstn.h = 0;
	        $(this.graph.nodeCanvas).on('mousemove', function (evt) {
	            dstn.x = evt.clientX - ofs.left;
	            dstn.y = evt.clientY - ofs.top + $('body').scrollTop();
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
	/**
	 * Handles graph drawing by rendering arrows in a canvas.
	 */
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var notes_1 = __webpack_require__(4);
	var palette_1 = __webpack_require__(6);
	var modern_1 = __webpack_require__(5);
	var custom = __webpack_require__(7);
	var SEMITONE = Math.pow(2, 1 / 12);
	var A4 = 57;
	/**
	 * Holds all data associated with an AudioNode
	 */
	var NodeData = (function () {
	    function NodeData() {
	        // Flag to avoid deleting output node
	        this.isOut = false;
	    }
	    // To be implemented by user code
	    NodeData.prototype.getInputs = function () {
	        throw 'Error: getInputs() function should be implemented by user';
	    };
	    return NodeData;
	})();
	exports.NodeData = NodeData;
	/**
	 * Global paramters that apply to the whole monophonic synthesizer.
	 */
	var Portamento = (function () {
	    function Portamento() {
	        this.time = 0;
	        this.ratio = 0;
	    }
	    return Portamento;
	})();
	exports.Portamento = Portamento;
	/**
	 * Performs global operations on all AudioNodes:
	 * - Manages AudioNode creation, initialization and connection
	 * - Distributes MIDI keyboard events to NoteHandlers
	 */
	var Synth = (function () {
	    function Synth(ac) {
	        this.customNodes = {};
	        this.paramHandlers = {};
	        this.noteHandlers = [];
	        this.portamento = new Portamento();
	        this.ac = ac;
	        this.palette = palette_1.palette;
	        this.registerCustomNode('createADSR', custom.ADSR);
	        this.registerCustomNode('createNoise', custom.NoiseGenerator);
	        this.registerCustomNode('createNoiseCtrl', custom.NoiseCtrlGenerator);
	        this.registerCustomNode('createLineIn', custom.LineInNode);
	        this.registerCustomNode('createDetuner', custom.Detuner);
	        this.registerParamHandler('BufferURL', new BufferURL());
	    }
	    Synth.prototype.createAudioNode = function (type) {
	        var def = palette_1.palette[type];
	        if (!def)
	            return null;
	        var factory = def.custom ? this.customNodes : this.ac;
	        if (!factory[def.constructor])
	            return null;
	        var anode = factory[def.constructor]();
	        if (!anode.context)
	            anode.context = this.ac;
	        this.initNodeParams(anode, def, type);
	        return anode;
	    };
	    Synth.prototype.initNodeData = function (ndata, type) {
	        ndata.synth = this;
	        ndata.type = type;
	        ndata.anode = this.createAudioNode(type);
	        if (!ndata.anode)
	            return console.error("No AudioNode found for '" + type + "'");
	        ndata.nodeDef = this.palette[type];
	        var nh = ndata.nodeDef.noteHandler;
	        if (nh) {
	            ndata.noteHandler = new notes_1.NoteHandlers[nh](ndata);
	            this.addNoteHandler(ndata.noteHandler);
	        }
	    };
	    Synth.prototype.initOutputNodeData = function (ndata, dst) {
	        ndata.synth = this;
	        ndata.type = 'out';
	        ndata.anode = this.ac.createGain();
	        ndata.anode.connect(dst);
	        ndata.nodeDef = this.palette['Speaker'];
	        ndata.isOut = true;
	    };
	    Synth.prototype.removeNodeData = function (data) {
	        if (data.noteHandler)
	            this.removeNoteHandler(data.noteHandler);
	    };
	    Synth.prototype.connectNodes = function (srcData, dstData) {
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
	    Synth.prototype.disconnectNodes = function (srcData, dstData) {
	        if (srcData.nodeDef.control && !dstData.nodeDef.control) {
	            srcData.controlParams = null;
	            srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
	        }
	        else
	            srcData.anode.disconnect(dstData.anode);
	    };
	    Synth.prototype.json2NodeData = function (json, data) {
	        for (var _i = 0, _a = Object.keys(json.params); _i < _a.length; _i++) {
	            var pname = _a[_i];
	            var pvalue = data.anode[pname];
	            var jv = json.params[pname];
	            if (data.nodeDef.params[pname].handler)
	                this.paramHandlers[data.nodeDef.params[pname].handler]
	                    .json2param(data.anode, jv);
	            else if (pvalue instanceof AudioParam) {
	                pvalue.value = jv;
	                pvalue['_value'] = jv;
	            }
	            else
	                data.anode[pname] = jv;
	        }
	    };
	    Synth.prototype.nodeData2json = function (data) {
	        var params = {};
	        for (var _i = 0, _a = Object.keys(data.nodeDef.params); _i < _a.length; _i++) {
	            var pname = _a[_i];
	            var pvalue = data.anode[pname];
	            if (data.nodeDef.params[pname].handler)
	                params[pname] = this.paramHandlers[data.nodeDef.params[pname].handler]
	                    .param2json(data.anode);
	            else if (pvalue instanceof AudioParam)
	                if (pvalue['_value'] === undefined)
	                    params[pname] = pvalue.value;
	                else
	                    params[pname] = pvalue['_value'];
	            else
	                params[pname] = pvalue;
	        }
	        return {
	            type: data.type,
	            params: params,
	            controlParam: data.controlParam,
	            controlParams: data.controlParams
	        };
	    };
	    Synth.prototype.midi2freqRatio = function (midi) {
	        return Math.pow(SEMITONE, midi - A4);
	    };
	    Synth.prototype.noteOn = function (midi, gain, when) {
	        if (!when)
	            when = this.ac.currentTime;
	        var ratio = this.midi2freqRatio(midi);
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            if (nh.kbTrigger)
	                nh.handlers = this.noteHandlers;
	            nh.noteOn(midi, gain, ratio, when);
	        }
	        this.portamento.ratio = ratio;
	    };
	    Synth.prototype.noteOff = function (midi, gain, when) {
	        if (!when)
	            when = this.ac.currentTime;
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            nh.noteOff(midi, gain, when);
	        }
	    };
	    Synth.prototype.addNoteHandler = function (nh) {
	        this.noteHandlers.push(nh);
	    };
	    Synth.prototype.removeNoteHandler = function (nh) {
	        modern_1.removeArrayElement(this.noteHandlers, nh);
	    };
	    Synth.prototype.initNodeParams = function (anode, def, type) {
	        for (var _i = 0, _a = Object.keys(def.params || {}); _i < _a.length; _i++) {
	            var param = _a[_i];
	            if (anode[param] === undefined)
	                console.warn("Parameter '" + param + "' not found for node '" + type + "'");
	            else if (anode[param] instanceof AudioParam)
	                anode[param].value = def.params[param].initial;
	            else if (def.params[param].handler) {
	                def.params[param].phandler = this.paramHandlers[def.params[param].handler];
	                def.params[param].phandler.initialize(anode, def);
	            }
	            else
	                anode[param] = def.params[param].initial;
	        }
	    };
	    Synth.prototype.registerCustomNode = function (constructorName, nodeClass) {
	        var _this = this;
	        this.customNodes[constructorName] = function () { return new nodeClass(_this.ac); };
	    };
	    Synth.prototype.registerParamHandler = function (hname, handler) {
	        this.paramHandlers[hname] = handler;
	    };
	    return Synth;
	})();
	exports.Synth = Synth;
	//-------------------- Parameter handlers --------------------
	var BufferURL = (function () {
	    function BufferURL() {
	    }
	    BufferURL.prototype.initialize = function (anode, def) {
	        var absn = anode;
	        var url = def.params['buffer'].initial;
	        if (!url)
	            return;
	        if (!this.popups)
	            this.popups = {
	                prompt: function () { },
	                close: function () { },
	                progress: function () { }
	            };
	        this.loadBufferParam(absn, url);
	    };
	    BufferURL.prototype.renderParam = function (panel, pdef, anode, param, label) {
	        var _this = this;
	        var box = $('<div class="choice-box">');
	        var button = $('<button class="btn btn-primary">URL</button>');
	        box.append(button);
	        button.after('<br/><br/>' + label);
	        panel.append(box);
	        button.click(function (_) {
	            _this.popups.prompt('Audio buffer URL:', 'Please provide URL', null, function (url) {
	                if (!url)
	                    return;
	                var absn = anode;
	                _this.loadBufferParam(absn, url);
	            });
	        });
	        return box;
	    };
	    BufferURL.prototype.param2json = function (anode) {
	        return anode['_url'];
	    };
	    BufferURL.prototype.json2param = function (anode, json) {
	        this.loadBufferParam(anode, json);
	    };
	    BufferURL.prototype.loadBufferParam = function (absn, url) {
	        this.loadBuffer(absn.context, url, function (buffer) {
	            absn['_buffer'] = buffer;
	            absn['_url'] = url;
	        });
	    };
	    BufferURL.prototype.loadBuffer = function (ac, url, cb) {
	        var _this = this;
	        var w = window;
	        w.audioBufferCache = w.audioBufferCache || {};
	        if (w.audioBufferCache[url])
	            return cb(w.audioBufferCache[url]);
	        var xhr = new XMLHttpRequest();
	        xhr.open('GET', url, true);
	        xhr.responseType = 'arraybuffer';
	        xhr.onload = function (_) {
	            _this.popups.close();
	            ac.decodeAudioData(xhr.response, function (buffer) {
	                w.audioBufferCache[url] = buffer;
	                cb(buffer);
	            });
	        };
	        xhr.send();
	        setTimeout(function (_) {
	            if (xhr.readyState != xhr.DONE)
	                _this.popups.progress('Loading ' + url + '...');
	        }, 300);
	    };
	    return BufferURL;
	})();


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var modern_1 = __webpack_require__(5);
	/**
	 * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
	 */
	var BaseNoteHandler = (function () {
	    function BaseNoteHandler(ndata) {
	        this.kbTrigger = false;
	        this.playAfterNoteOff = false;
	        this.handlers = null;
	        this.ndata = ndata;
	        this.outTracker = new OutputTracker(ndata.anode);
	    }
	    BaseNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) { };
	    BaseNoteHandler.prototype.noteOff = function (midi, gain, when) { };
	    BaseNoteHandler.prototype.noteEnd = function (midi, when) { };
	    BaseNoteHandler.prototype.clone = function () {
	        // Create clone
	        var anode = this.ndata.anode.context[this.ndata.nodeDef.constructor]();
	        // Copy parameters
	        for (var _i = 0, _a = Object.keys(this.ndata.nodeDef.params); _i < _a.length; _i++) {
	            var pname = _a[_i];
	            var param = this.ndata.anode[pname];
	            if (param instanceof AudioParam)
	                anode[pname].value = param.value;
	            else if (param !== null && param !== undefined)
	                anode[pname] = param;
	        }
	        // Copy output connections
	        for (var _b = 0, _c = this.outTracker.outputs; _b < _c.length; _b++) {
	            var out = _c[_b];
	            var o2 = out;
	            if (o2.custom && o2.anode)
	                o2 = o2.anode;
	            anode.connect(o2);
	        }
	        // Copy control input connections
	        for (var _d = 0, _e = this.ndata.getInputs(); _d < _e.length; _d++) {
	            var inData = _e[_d];
	            inData.anode.connect(anode[inData.controlParam]);
	        }
	        //TODO should copy snapshot of list of inputs and outputs
	        //...in case user connects or disconnects during playback
	        return anode;
	    };
	    BaseNoteHandler.prototype.disconnect = function (anode) {
	        // Disconnect outputs
	        for (var _i = 0, _a = this.outTracker.outputs; _i < _a.length; _i++) {
	            var out = _a[_i];
	            anode.disconnect(out);
	        }
	        // Disconnect control inputs
	        for (var _b = 0, _c = this.ndata.getInputs(); _b < _c.length; _b++) {
	            var inData = _c[_b];
	            inData.anode.disconnect(anode[inData.controlParam]);
	        }
	    };
	    BaseNoteHandler.prototype.rampParam = function (param, ratio, when) {
	        var portamento = this.ndata.synth.portamento;
	        var newv = param.value * ratio;
	        param['_value'] = newv; // Required for ADSR to capture the correct value
	        if (portamento.time > 0 && portamento.ratio > 0) {
	            var oldv = param.value * portamento.ratio;
	            param.cancelScheduledValues(when);
	            param.linearRampToValueAtTime(oldv, when);
	            param.exponentialRampToValueAtTime(newv, when + portamento.time);
	        }
	        else
	            param.setValueAtTime(newv, when);
	    };
	    return BaseNoteHandler;
	})();
	/**
	 * Handles note events for an OscillatorNode
	 */
	var OscNoteHandler = (function (_super) {
	    __extends(OscNoteHandler, _super);
	    function OscNoteHandler() {
	        _super.apply(this, arguments);
	        this.playing = false;
	    }
	    OscNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        if (this.playing)
	            this.noteEnd(midi, when); // Because this is monophonic
	        this.playing = true;
	        this.oscClone = this.clone();
	        this.rampParam(this.oscClone.frequency, ratio, when);
	        this.oscClone.start(when);
	        this.lastNote = midi;
	    };
	    OscNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return;
	        if (!this.playAfterNoteOff)
	            this.noteEnd(midi, when);
	    };
	    OscNoteHandler.prototype.noteEnd = function (midi, when) {
	        // Stop and disconnect
	        if (!this.playing)
	            return;
	        this.playing = false;
	        this.oscClone.stop(when);
	        //TODO ensure that not disconnecting does not produce memory leaks
	        // this.disconnect(this.oscClone);
	        // this.oscClone = null;
	    };
	    return OscNoteHandler;
	})(BaseNoteHandler);
	/**
	 * Handles note events for an LFO node. This is identical to a regular
	 * oscillator node, but the note does not affect the oscillator frequency
	 */
	var LFONoteHandler = (function (_super) {
	    __extends(LFONoteHandler, _super);
	    function LFONoteHandler() {
	        _super.apply(this, arguments);
	    }
	    LFONoteHandler.prototype.rampParam = function (param, ratio, when) {
	        // Disable portamento for LFO
	        param.setValueAtTime(param.value, when);
	    };
	    return LFONoteHandler;
	})(OscNoteHandler);
	/**
	 * Handles note events for an AudioBufferSourceNode
	 */
	var BufferNoteHandler = (function (_super) {
	    __extends(BufferNoteHandler, _super);
	    function BufferNoteHandler() {
	        _super.apply(this, arguments);
	        this.playing = false;
	    }
	    BufferNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        if (this.playing)
	            this.noteEnd(midi, when);
	        var buf = this.ndata.anode['_buffer'];
	        if (!buf)
	            return; // Buffer still loading or failed
	        this.playing = true;
	        this.absn = this.clone();
	        this.absn.buffer = buf;
	        var pbr = this.absn.playbackRate;
	        var newRate = pbr.value * ratio;
	        this.rampParam(pbr, pbr.value * ratio, when);
	        this.absn.start(when);
	        this.lastNote = midi;
	    };
	    BufferNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return;
	        if (!this.playAfterNoteOff)
	            this.noteEnd(midi, when);
	    };
	    BufferNoteHandler.prototype.noteEnd = function (midi, when) {
	        // Stop and disconnect
	        if (!this.playing)
	            return;
	        this.playing = false;
	        this.absn.stop(when);
	        //TODO ensure that not disconnecting does not produce memory leaks
	        // this.disconnect(this.absn);
	        // this.absn = null;
	    };
	    return BufferNoteHandler;
	})(BaseNoteHandler);
	/**
	 * Handles note events for a custom ADSR node
	 */
	var ADSRNoteHandler = (function (_super) {
	    __extends(ADSRNoteHandler, _super);
	    function ADSRNoteHandler() {
	        _super.apply(this, arguments);
	        this.kbTrigger = true;
	    }
	    ADSRNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        var _this = this;
	        this.setupOtherHandlers();
	        this.lastNote = midi;
	        var adsr = this.ndata.anode;
	        this.loopParams(function (out) {
	            var v = _this.getParamValue(out);
	            out.cancelScheduledValues(when);
	            var initial = (1 - adsr.depth) * v;
	            out.linearRampToValueAtTime(initial, when);
	            out.linearRampToValueAtTime(v, when + adsr.attack);
	            var target = v * adsr.sustain + initial * (1 - adsr.sustain);
	            out.linearRampToValueAtTime(target, when + adsr.attack + adsr.decay);
	        });
	    };
	    ADSRNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return;
	        var adsr = this.ndata.anode;
	        this.loopParams(function (out) {
	            var v = out.value; // Get the really current value
	            var finalv = (1 - adsr.depth) * v;
	            out.cancelScheduledValues(when);
	            out.linearRampToValueAtTime(v, when);
	            out.linearRampToValueAtTime(finalv, when + adsr.release);
	        });
	    };
	    ADSRNoteHandler.prototype.setupOtherHandlers = function () {
	        //TODO should set to false when ADSR node is removed
	        for (var _i = 0, _a = this.handlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            nh.playAfterNoteOff = true;
	        }
	    };
	    ADSRNoteHandler.prototype.loopParams = function (cb) {
	        for (var _i = 0, _a = this.outTracker.outputs; _i < _a.length; _i++) {
	            var out = _a[_i];
	            if (out instanceof AudioParam)
	                cb(out);
	        }
	    };
	    ADSRNoteHandler.prototype.getParamValue = function (p) {
	        if (p['_value'] === undefined)
	            p['_value'] = p.value;
	        return p['_value'];
	    };
	    return ADSRNoteHandler;
	})(BaseNoteHandler);
	/**
	 * Handles note events for any node that allows calling start() after stop(),
	 * such as custom nodes.
	 */
	var RestartableNoteHandler = (function (_super) {
	    __extends(RestartableNoteHandler, _super);
	    function RestartableNoteHandler() {
	        _super.apply(this, arguments);
	        this.playing = false;
	    }
	    RestartableNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        if (this.playing)
	            this.noteEnd(midi, when);
	        this.playing = true;
	        var anode = this.ndata.anode;
	        anode.start(when);
	        this.lastNote = midi;
	    };
	    RestartableNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return;
	        if (!this.playAfterNoteOff)
	            this.noteEnd(midi, when);
	    };
	    RestartableNoteHandler.prototype.noteEnd = function (midi, when) {
	        // Stop and disconnect
	        if (!this.playing)
	            return;
	        this.playing = false;
	        var anode = this.ndata.anode;
	        anode.stop(when);
	    };
	    return RestartableNoteHandler;
	})(BaseNoteHandler);
	/**
	 * Exports available note handlers so they are used by their respective
	 * nodes from the palette.
	 */
	exports.NoteHandlers = {
	    'osc': OscNoteHandler,
	    'buffer': BufferNoteHandler,
	    'ADSR': ADSRNoteHandler,
	    'LFO': LFONoteHandler,
	    'restartable': RestartableNoteHandler
	};
	/**
	 * Tracks a node output connections and disconnections, to be used
	 * when cloning, removing or controlling nodes.
	 */
	var OutputTracker = (function () {
	    function OutputTracker(anode) {
	        this.outputs = [];
	        this.onBefore(anode, 'connect', this.connect, function (oldf, obj, args) {
	            if (args[0].custom && args[0].anode)
	                args[0] = args[0].anode;
	            oldf.apply(obj, args);
	        });
	        this.onBefore(anode, 'disconnect', this.disconnect);
	    }
	    OutputTracker.prototype.connect = function (np) {
	        this.outputs.push(np);
	    };
	    OutputTracker.prototype.disconnect = function (np) {
	        modern_1.removeArrayElement(this.outputs, np);
	    };
	    OutputTracker.prototype.onBefore = function (obj, fname, funcToCall, cb) {
	        var oldf = obj[fname];
	        var self = this;
	        obj[fname] = function () {
	            funcToCall.apply(self, arguments);
	            if (cb)
	                cb(oldf, obj, arguments);
	            else
	                oldf.apply(obj, arguments);
	        };
	    };
	    return OutputTracker;
	})();


/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Modernize browser interfaces so that TypeScript does not complain
	 * when using new features.
	 *
	 * Also provides some basic utility funcitons which should be part of
	 * the standard JavaScript library.
	 */
	function removeArrayElement(a, e) {
	    var pos = a.indexOf(e);
	    if (pos < 0)
	        return false; // not found
	    a.splice(pos, 1);
	    return true;
	}
	exports.removeArrayElement = removeArrayElement;
	var LOG_BASE = 2;
	function logarithm(base, x) {
	    return Math.log(x) / Math.log(base);
	}
	function linear2log(value, min, max) {
	    var logRange = logarithm(LOG_BASE, max + 1 - min);
	    return logarithm(LOG_BASE, value + 1 - min) / logRange;
	}
	exports.linear2log = linear2log;
	function log2linear(value, min, max) {
	    var logRange = logarithm(LOG_BASE, max + 1 - min);
	    return min + Math.pow(LOG_BASE, value * logRange) - 1;
	}
	exports.log2linear = log2linear;


/***/ },
/* 6 */
/***/ function(module, exports) {

	//-------------------- Node palette definition --------------------
	var OCTAVE_DETUNE = {
	    initial: 0,
	    min: -1200,
	    max: 1200,
	    linear: true
	};
	/**
	 * The set of AudioNodes available to the application, along with
	 * their configuration.
	 */
	exports.palette = {
	    // Sources
	    Oscillator: {
	        constructor: 'createOscillator',
	        noteHandler: 'osc',
	        params: {
	            frequency: { initial: 220, min: 20, max: 20000 },
	            detune: OCTAVE_DETUNE,
	            type: {
	                initial: 'sawtooth',
	                choices: ['sine', 'square', 'sawtooth', 'triangle']
	            }
	        }
	    },
	    Buffer: {
	        constructor: 'createBufferSource',
	        noteHandler: 'buffer',
	        params: {
	            playbackRate: { initial: 1, min: 0, max: 8 },
	            detune: OCTAVE_DETUNE,
	            buffer: {
	                initial: null,
	                handler: 'BufferURL'
	            },
	            loop: { initial: false },
	            loopStart: { initial: 0, min: 0, max: 10 },
	            loopEnd: { initial: 3, min: 0, max: 10 }
	        }
	    },
	    Noise: {
	        constructor: 'createNoise',
	        noteHandler: 'restartable',
	        custom: true,
	        params: {
	            gain: { initial: 1, min: 0, max: 10 }
	        }
	    },
	    LineIn: {
	        constructor: 'createLineIn',
	        custom: true,
	        params: {}
	    },
	    // Effects
	    Gain: {
	        constructor: 'createGain',
	        params: {
	            gain: { initial: 1, min: 0, max: 10, linear: true }
	        }
	    },
	    Filter: {
	        constructor: 'createBiquadFilter',
	        params: {
	            frequency: { initial: 440, min: 20, max: 20000 },
	            Q: { initial: 0, min: 0, max: 100 },
	            detune: OCTAVE_DETUNE,
	            gain: { initial: 0, min: -40, max: 40, linear: true },
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
	            delayTime: { initial: 1, min: 0, max: 5 }
	        }
	    },
	    StereoPan: {
	        constructor: 'createStereoPanner',
	        params: {
	            pan: { initial: 0, min: -1, max: 1, linear: true }
	        }
	    },
	    Compressor: {
	        constructor: 'createDynamicsCompressor',
	        params: {
	            threshold: { initial: -24, min: -100, max: 0, linear: true },
	            knee: { initial: 30, min: 0, max: 40, linear: true },
	            ratio: { initial: 12, min: 1, max: 20, linear: true },
	            reduction: { initial: 0, min: -20, max: 0, linear: true },
	            attack: { initial: 0.003, min: 0, max: 1 },
	            release: { initial: 0.25, min: 0, max: 1 }
	        }
	    },
	    Detuner: {
	        constructor: 'createDetuner',
	        custom: true,
	        params: {
	            octave: { initial: 0, min: -2, max: 2, linear: true }
	        }
	    },
	    // Controllers
	    LFO: {
	        constructor: 'createOscillator',
	        noteHandler: 'LFO',
	        control: true,
	        params: {
	            frequency: { initial: 5, min: 0.01, max: 200 },
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
	            gain: { initial: 10, min: 0, max: 100, linear: true }
	        }
	    },
	    ADSR: {
	        constructor: 'createADSR',
	        noteHandler: 'ADSR',
	        control: true,
	        custom: true,
	        params: {
	            attack: { initial: 0.2, min: 0, max: 10 },
	            decay: { initial: 0.5, min: 0, max: 10 },
	            sustain: { initial: 0.5, min: 0, max: 1, linear: true },
	            release: { initial: 1.0, min: 0, max: 10 },
	            depth: { initial: 1.0, min: 0, max: 1 }
	        }
	    },
	    NoiseCtrl: {
	        constructor: 'createNoiseCtrl',
	        control: true,
	        custom: true,
	        params: {
	            frequency: { initial: 4, min: 0, max: 200 },
	            depth: { initial: 20, min: 0, max: 200 }
	        }
	    },
	    // Output
	    Speaker: {
	        constructor: null,
	        params: {}
	    }
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/**
	 * Base class to derive all custom nodes from it
	 */
	var CustomNodeBase = (function () {
	    function CustomNodeBase() {
	        this.custom = true;
	        this.channelCount = 2;
	        this.channelCountMode = 'max';
	        this.channelInterpretation = 'speakers';
	        this.numberOfInputs = 0;
	        this.numberOfOutputs = 1;
	    }
	    CustomNodeBase.prototype.connect = function (param) { };
	    CustomNodeBase.prototype.disconnect = function () { };
	    // Required for extending EventTarget
	    CustomNodeBase.prototype.addEventListener = function () { };
	    CustomNodeBase.prototype.dispatchEvent = function (evt) { return false; };
	    CustomNodeBase.prototype.removeEventListener = function () { };
	    return CustomNodeBase;
	})();
	/**
	 * Envelope generator that controls the evolution over time of a destination
	 * node's parameter. All parameter control is performed in the corresponding
	 * ADSR note handler.
	 */
	var ADSR = (function (_super) {
	    __extends(ADSR, _super);
	    function ADSR() {
	        _super.apply(this, arguments);
	        this.attack = 0.2;
	        this.decay = 0.5;
	        this.sustain = 0.5;
	        this.release = 1;
	        this.depth = 1;
	    }
	    return ADSR;
	})(CustomNodeBase);
	exports.ADSR = ADSR;
	/**
	 * Base ScriptProcessor, to derive all custom audio processing nodes from it.
	 */
	var ScriptProcessor = (function (_super) {
	    __extends(ScriptProcessor, _super);
	    function ScriptProcessor(ac) {
	        var _this = this;
	        _super.call(this);
	        this.gain = 1;
	        this.playing = false;
	        this.anode = ac.createScriptProcessor(1024);
	        this.anode.onaudioprocess = function (evt) { return _this.processAudio(evt); };
	    }
	    ScriptProcessor.prototype.connect = function (node) {
	        this.anode.connect(node);
	    };
	    ScriptProcessor.prototype.disconnect = function () {
	        this.anode.disconnect();
	    };
	    ScriptProcessor.prototype.start = function () {
	        this.playing = true;
	    };
	    ScriptProcessor.prototype.stop = function () {
	        this.playing = false;
	    };
	    ScriptProcessor.prototype.processAudio = function (evt) { };
	    return ScriptProcessor;
	})(CustomNodeBase);
	/**
	 * Simple noise generator
	 */
	var NoiseGenerator = (function (_super) {
	    __extends(NoiseGenerator, _super);
	    function NoiseGenerator() {
	        _super.apply(this, arguments);
	    }
	    NoiseGenerator.prototype.processAudio = function (evt) {
	        for (var channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
	            var out = evt.outputBuffer.getChannelData(channel);
	            for (var sample = 0; sample < out.length; sample++)
	                out[sample] = this.playing ? this.gain * (Math.random() * 2 - 1) : 0;
	        }
	    };
	    return NoiseGenerator;
	})(ScriptProcessor);
	exports.NoiseGenerator = NoiseGenerator;
	/**
	 * Noise generator to be used as control node.
	 * It uses sample & hold in order to implement the 'frequency' parameter.
	 */
	var NoiseCtrlGenerator = (function (_super) {
	    __extends(NoiseCtrlGenerator, _super);
	    function NoiseCtrlGenerator(ac) {
	        _super.call(this, ac);
	        this.ac = ac;
	        this.frequency = 4;
	        this.depth = 20;
	        this.sct = 0;
	        this.v = 0;
	    }
	    NoiseCtrlGenerator.prototype.connect = function (param) {
	        this.anode.connect(param);
	    };
	    NoiseCtrlGenerator.prototype.processAudio = function (evt) {
	        var samplesPerCycle = this.ac.sampleRate / this.frequency;
	        for (var channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
	            var out = evt.outputBuffer.getChannelData(channel);
	            for (var sample = 0; sample < out.length; sample++) {
	                this.sct++;
	                if (this.sct > samplesPerCycle) {
	                    this.v = this.depth * (Math.random() * 2 - 1);
	                    this.sct = 0; //this.sct - Math.floor(this.sct);
	                }
	                out[sample] = this.v;
	            }
	        }
	    };
	    return NoiseCtrlGenerator;
	})(ScriptProcessor);
	exports.NoiseCtrlGenerator = NoiseCtrlGenerator;
	/**
	 * Simple Pitch Shifter implemented in a quick & dirty way
	 */
	var Detuner = (function (_super) {
	    __extends(Detuner, _super);
	    function Detuner() {
	        _super.apply(this, arguments);
	        this.octave = 0;
	        this.numberOfInputs = 1;
	    }
	    Detuner.prototype.processAudio = function (evt) {
	        var dx = Math.pow(2, this.octave);
	        for (var channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
	            var out = evt.outputBuffer.getChannelData(channel);
	            var inbuf = evt.inputBuffer.getChannelData(channel);
	            var sct = 0;
	            for (var sample = 0; sample < out.length; sample++) {
	                out[sample] = inbuf[Math.floor(sct)];
	                sct += dx;
	                if (sct >= inbuf.length)
	                    sct = 0;
	            }
	        }
	    };
	    return Detuner;
	})(ScriptProcessor);
	exports.Detuner = Detuner;
	/**
	 * Captures audio from the PC audio input.
	 * Requires user's authorization to grab audio input.
	 */
	var LineInNode = (function (_super) {
	    __extends(LineInNode, _super);
	    function LineInNode() {
	        _super.apply(this, arguments);
	    }
	    LineInNode.prototype.connect = function (anode) {
	        var _this = this;
	        if (this.srcNode) {
	            this.srcNode.connect(anode);
	            this.dstNode = anode;
	            return;
	        }
	        var navigator = window.navigator;
	        navigator.getUserMedia = (navigator.getUserMedia ||
	            navigator.webkitGetUserMedia ||
	            navigator.mozGetUserMedia ||
	            navigator.msGetUserMedia);
	        navigator.getUserMedia({ audio: true }, function (stream) {
	            var ac = anode.context;
	            _this.srcNode = ac.createMediaStreamSource(stream);
	            var a2 = anode;
	            if (a2.custom && a2.anode)
	                a2 = a2.anode;
	            _this.srcNode.connect(a2);
	            _this.dstNode = anode;
	            _this.stream = stream;
	        }, function (error) { return console.error(error); });
	    };
	    LineInNode.prototype.disconnect = function () {
	        this.srcNode.disconnect(this.dstNode);
	    };
	    return LineInNode;
	})(CustomNodeBase);
	exports.LineInNode = LineInNode;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/** Informs whether a popup is open or not */
	exports.isOpen = false;
	/** Bootstrap-based equivalent of standard alert function */
	function alert(msg, title, hideClose, options) {
	    popup.find('.popup-message').html(msg);
	    popup.find('.modal-title').text(title || 'Alert');
	    popup.find('.popup-ok').hide();
	    if (hideClose)
	        popup.find('.popup-close').hide();
	    else
	        popup.find('.popup-close').html('Close');
	    popup.find('.popup-prompt > input').hide();
	    exports.isOpen = true;
	    popup.one('hidden.bs.modal', function (_) { return exports.isOpen = false; });
	    popup.modal(options);
	}
	exports.alert = alert;
	/** Like an alert, but without a close button */
	function progress(msg, title) {
	    alert(msg, title, true, { keyboard: false });
	}
	exports.progress = progress;
	/** Closes a popup in case it is open */
	function close() {
	    if (!exports.isOpen)
	        return;
	    popup.find('.popup-ok').click();
	}
	exports.close = close;
	/** Bootstrap-based equivalent of standard confirm function */
	function confirm(msg, title, cbClose, cbOpen) {
	    var result = false;
	    popup.find('.popup-message').html(msg);
	    popup.find('.modal-title').text(title || 'Please confirm');
	    var okButton = popup.find('.popup-ok');
	    okButton.show().click(function (_) { return result = true; });
	    popup.find('.popup-prompt > input').hide();
	    popup.find('.popup-close').text('Cancel');
	    popup.one('shown.bs.modal', function (_) {
	        okButton.focus();
	        if (cbOpen)
	            cbOpen();
	    });
	    popup.find('form').one('submit', function (_) {
	        result = true;
	        okButton.click();
	        return false;
	    });
	    popup.one('hide.bs.modal', function (_) {
	        okButton.off('click');
	        exports.isOpen = false;
	        cbClose(result);
	    });
	    exports.isOpen = true;
	    popup.modal();
	}
	exports.confirm = confirm;
	/** Bootstrap-based equivalent of standard prompt function */
	function prompt(msg, title, initialValue, cb) {
	    var input = popup.find('.popup-prompt > input');
	    confirm(msg, title, function (confirmed) {
	        if (!cb)
	            return;
	        if (!confirmed)
	            cb(null);
	        else
	            cb(input.val());
	    }, function () {
	        input.show();
	        input.focus();
	        if (initialValue) {
	            input.val(initialValue);
	            var hinput = input[0];
	            hinput.select();
	        }
	        else
	            input.val('');
	    });
	}
	exports.prompt = prompt;
	var popup = $("\n\t<div class=\"normal-font modal fade\" id=\"myModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\">\n\t<div class=\"modal-dialog\" role=\"document\">\n\t\t<div class=\"modal-content\">\n\t\t<div class=\"modal-header\">\n\t\t\t<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n\t\t\t<h4 class=\"modal-title\" id=\"myModalLabel\"></h4>\n\t\t</div>\n\t\t<div class=\"modal-body\">\n\t\t\t<div class=\"popup-message\"></div>\n\t\t\t<form class=\"popup-prompt\">\n\t\t\t\t<input type=\"text\" style=\"width: 100%\">\n\t\t\t</form>\n\t\t</div>\n\t\t<div class=\"modal-footer\">\n\t\t\t<button type=\"button\" class=\"btn btn-default popup-close\" data-dismiss=\"modal\"></button>\n\t\t\t<button type=\"button\" class=\"btn btn-primary popup-ok\" data-dismiss=\"modal\">OK</button>\n\t\t</div>\n\t\t</div>\n\t</div>\n\t</div>\n");
	$('body').append(popup);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var modern_1 = __webpack_require__(5);
	/**
	 * Renders the UI controls associated with the parameters of a given node
	 */
	function renderParams(ndata, panel) {
	    panel.empty();
	    var boxes = [];
	    if (ndata.nodeDef.control && ndata.controlParams)
	        boxes.push(renderParamControl(ndata, panel));
	    var params = Object.keys(ndata.nodeDef.params || {});
	    if (params.length <= 0)
	        return;
	    for (var _i = 0; _i < params.length; _i++) {
	        var param = params[_i];
	        if (ndata.anode[param] instanceof AudioParam)
	            boxes.push(renderAudioParam(ndata.anode, ndata.nodeDef, param, panel));
	        else
	            boxes.push(renderOtherParam(ndata.anode, ndata.nodeDef, param, panel));
	    }
	    positionBoxes(panel, boxes);
	}
	exports.renderParams = renderParams;
	function positionBoxes(panel, boxes) {
	    var pw = panel.width();
	    var bw = boxes[0].width();
	    var sep = (pw - boxes.length * bw) / (boxes.length + 1);
	    var x = sep;
	    for (var _i = 0; _i < boxes.length; _i++) {
	        var box = boxes[_i];
	        box.css({
	            position: 'relative',
	            left: x
	        });
	        x += sep;
	    }
	}
	function renderAudioParam(anode, ndef, param, panel) {
	    var pdef = ndef.params[param];
	    var aparam = anode[param];
	    if (aparam['_value'])
	        aparam.value = aparam['_value'];
	    return renderSlider(panel, pdef, param, aparam.value, function (value) {
	        aparam.value = value;
	        aparam['_value'] = value;
	    });
	}
	function renderParamControl(ndata, panel) {
	    if (!ndata.controlParams)
	        return;
	    var combo = renderCombo(panel, ndata.controlParams, ndata.controlParam, 'Controlling');
	    combo.change(function (_) {
	        if (ndata.controlParam)
	            ndata.anode.disconnect(ndata.controlTarget[ndata.controlParam]);
	        ndata.controlParam = combo.val();
	        ndata.anode.connect(ndata.controlTarget[ndata.controlParam]);
	    });
	    return combo.parent();
	}
	function renderOtherParam(anode, ndef, param, panel) {
	    var pdef = ndef.params[param];
	    if (pdef.choices) {
	        var combo = renderCombo(panel, pdef.choices, anode[param], ucfirst(param));
	        combo.change(function (_) {
	            anode[param] = combo.val();
	        });
	        return combo.parent();
	    }
	    else if (pdef.min != undefined)
	        return renderSlider(panel, pdef, param, anode[param], function (value) { return anode[param] = value; });
	    else if (typeof pdef.initial == 'boolean')
	        return renderBoolean(panel, pdef, param, anode, ucfirst(param));
	    else if (pdef.phandler)
	        return pdef.phandler.renderParam(panel, pdef, anode, param, ucfirst(param));
	}
	function renderSlider(panel, pdef, param, value, setValue) {
	    var sliderBox = $('<div class="slider-box">');
	    var slider = $('<input type="range" orient="vertical">')
	        .attr('min', 0)
	        .attr('max', 1)
	        .attr('step', 0.001)
	        .attr('value', param2slider(value, pdef));
	    var numInput = $('<input type="number">')
	        .attr('min', pdef.min)
	        .attr('max', pdef.max)
	        .attr('value', truncateFloat(value, 5));
	    sliderBox.append(numInput);
	    sliderBox.append(slider);
	    sliderBox.append($('<span><br/>' + ucfirst(param) + '</span>'));
	    panel.append(sliderBox);
	    slider.on('input', function (_) {
	        var value = slider2param(parseFloat(slider.val()), pdef);
	        numInput.val(truncateFloat(value, 5));
	        setValue(value);
	    });
	    numInput.on('input', function (_) {
	        var value = parseFloat(numInput.val());
	        if (isNaN(value))
	            return;
	        slider.val(param2slider(value, pdef));
	        setValue(value);
	    });
	    return sliderBox;
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
	function renderBoolean(panel, pdef, param, anode, label) {
	    var box = $('<div class="choice-box">');
	    var button = $('<button class="btn btn-info" data-toggle="button" aria-pressed="false">');
	    box.append(button);
	    button.after('<br/><br/>' + label);
	    panel.append(box);
	    if (anode[param]) {
	        button.text('Enabled');
	        button.addClass('active');
	        button.attr('aria-pressed', 'true');
	    }
	    else {
	        button.text('Disabled');
	        button.removeClass('active');
	        button.attr('aria-pressed', 'false');
	    }
	    button.click(function (_) {
	        anode[param] = !anode[param];
	        button.text(anode[param] ? 'Enabled' : 'Disabled');
	    });
	    return box;
	}
	function param2slider(paramValue, pdef) {
	    if (pdef.linear)
	        return (paramValue - pdef.min) / (pdef.max - pdef.min);
	    else
	        return modern_1.linear2log(paramValue, pdef.min, pdef.max);
	}
	function slider2param(sliderValue, pdef) {
	    if (pdef.linear)
	        return pdef.min + sliderValue * (pdef.max - pdef.min);
	    else
	        return modern_1.log2linear(sliderValue, pdef.min, pdef.max);
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
/* 10 */
/***/ function(module, exports) {

	/**
	 * Displays FFT and Oscilloscope graphs from the output of a given AudioNode
	 */
	var AudioAnalyzer = (function () {
	    function AudioAnalyzer(jqfft, jqosc) {
	        this.canvasFFT = this.createCanvas(jqfft);
	        this.gcFFT = this.canvasFFT.getContext('2d');
	        this.canvasOsc = this.createCanvas(jqosc);
	        this.gcOsc = this.canvasOsc.getContext('2d');
	    }
	    AudioAnalyzer.prototype.createCanvas = function (panel) {
	        var jqCanvas = $("<canvas width=\"" + panel.width() + "\" height=\"" + panel.height() + "\">");
	        panel.append(jqCanvas);
	        var canvas = jqCanvas[0];
	        return canvas;
	    };
	    AudioAnalyzer.prototype.createAnalyzerNode = function (ac) {
	        if (this.anode)
	            return;
	        this.anode = ac.createAnalyser();
	        this.fftData = new Uint8Array(this.anode.fftSize);
	        this.oscData = new Uint8Array(this.anode.fftSize);
	    };
	    AudioAnalyzer.prototype.analyze = function (input) {
	        this.disconnect();
	        this.createAnalyzerNode(input.context);
	        this.input = input;
	        this.input.connect(this.anode);
	        this.requestAnimationFrame();
	    };
	    AudioAnalyzer.prototype.disconnect = function () {
	        if (!this.input)
	            return;
	        this.input.disconnect(this.anode);
	        this.input = null;
	    };
	    AudioAnalyzer.prototype.requestAnimationFrame = function () {
	        var _this = this;
	        window.requestAnimationFrame(function (_) { return _this.updateCanvas(); });
	    };
	    AudioAnalyzer.prototype.updateCanvas = function () {
	        if (!this.input)
	            return;
	        this.drawFFT(this.gcFFT, this.canvasFFT, this.fftData, '#00FF00');
	        this.drawOsc(this.gcOsc, this.canvasOsc, this.oscData, '#FFFF00');
	        this.requestAnimationFrame();
	    };
	    AudioAnalyzer.prototype.drawFFT = function (gc, canvas, data, color) {
	        var _a = this.setupDraw(gc, canvas, data, color), w = _a[0], h = _a[1];
	        this.anode.getByteFrequencyData(data);
	        var dx = (data.length / 2) / canvas.width;
	        var x = 0;
	        //TODO calculate average of all samples from x to x + dx - 1
	        for (var i = 0; i < w; i++) {
	            var y = data[Math.floor(x)];
	            x += dx;
	            gc.moveTo(i, h - 1);
	            gc.lineTo(i, h - 1 - h * y / 256);
	        }
	        gc.stroke();
	        gc.closePath();
	    };
	    AudioAnalyzer.prototype.drawOsc = function (gc, canvas, data, color) {
	        var _a = this.setupDraw(gc, canvas, data, color), w = _a[0], h = _a[1];
	        this.anode.getByteTimeDomainData(data);
	        gc.moveTo(0, h / 2);
	        var x = 0;
	        while (data[x] > 128 && x < data.length / 4)
	            x++;
	        while (data[x] < 128 && x < data.length / 4)
	            x++;
	        var dx = (data.length * 0.75) / canvas.width;
	        for (var i = 0; i < w; i++) {
	            var y = data[Math.floor(x)];
	            x += dx;
	            gc.lineTo(i, h * y / 256);
	        }
	        gc.stroke();
	        gc.closePath();
	    };
	    AudioAnalyzer.prototype.setupDraw = function (gc, canvas, data, color) {
	        var w = canvas.width;
	        var h = canvas.height;
	        gc.clearRect(0, 0, w, h);
	        gc.beginPath();
	        gc.strokeStyle = color;
	        return [w, h];
	    };
	    return AudioAnalyzer;
	})();
	exports.AudioAnalyzer = AudioAnalyzer;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var keyboard_1 = __webpack_require__(12);
	var midi_1 = __webpack_require__(13);
	var piano_1 = __webpack_require__(14);
	var arpeggiator_1 = __webpack_require__(15);
	var instrument_1 = __webpack_require__(17);
	var NUM_VOICES = 5;
	/**
	 * Manages all note-generation inputs:
	 * 	- PC Keyboard
	 * 	- Virtual piano keyboard
	 *	- An external MIDI keyboard
	 * Handles switching to polyphonic mode and back to mono
	 */
	var NoteInputs = (function () {
	    function NoteInputs(synthUI) {
	        var _this = this;
	        this.synthUI = synthUI;
	        this.poly = false;
	        // Setup piano panel
	        var piano = new piano_1.PianoKeyboard($('#piano'));
	        this.piano = piano;
	        piano.noteOn = function (midi) { return _this.arpeggiator.sendNoteOn(midi, 1); };
	        piano.noteOff = function (midi) { return _this.arpeggiator.sendNoteOff(midi, 1); };
	        // Register poly on/off handlers
	        piano.polyOn = function () { return _this.polyOn(); };
	        piano.polyOff = function () { return _this.polyOff(); };
	        // Setup PC keyboard
	        var kb = this.setupPCKeyboard(piano);
	        // Bind piano octave with PC keyboard
	        kb.baseNote = piano.baseNote;
	        piano.octaveChanged = function (baseNote) { return kb.baseNote = baseNote; };
	        this.setupEnvelopeAnimation(piano);
	        // Setup arpeggiator
	        this.setupArpeggiator(piano, synthUI.synth.ac);
	        // Setup MIDI keyboard
	        this.setupMidiKeyboard(piano);
	    }
	    NoteInputs.prototype.setupPCKeyboard = function (piano) {
	        var _this = this;
	        var kb = new keyboard_1.Keyboard();
	        kb.noteOn = function (midi) {
	            if (document.activeElement.nodeName == 'INPUT' &&
	                document.activeElement.getAttribute('type') != 'range')
	                return;
	            _this.arpeggiator.sendNoteOn(midi, 1);
	            piano.displayKeyDown(midi);
	        };
	        kb.noteOff = function (midi) {
	            _this.arpeggiator.sendNoteOff(midi, 1);
	            piano.displayKeyUp(midi);
	        };
	        return kb;
	    };
	    NoteInputs.prototype.setupMidiKeyboard = function (piano) {
	        var _this = this;
	        var midi = new midi_1.MidiKeyboard();
	        midi.noteOn = function (midi, velocity, channel) {
	            _this.arpeggiator.sendNoteOn(midi, 1);
	            piano.displayKeyDown(midi);
	        };
	        midi.noteOff = function (midi, velocity, channel) {
	            _this.arpeggiator.sendNoteOff(midi, 1);
	            piano.displayKeyUp(midi);
	        };
	    };
	    NoteInputs.prototype.setupEnvelopeAnimation = function (piano) {
	        var loaded = this.synthUI.gr.handler.graphLoaded;
	        this.synthUI.gr.handler.graphLoaded = function () {
	            loaded.bind(this.synthUI.gr.handler)();
	            var adsr = null;
	            for (var _i = 0, _a = this.synthUI.gr.nodes; _i < _a.length; _i++) {
	                var node = _a[_i];
	                var data = node.data;
	                if (data.type == 'ADSR') {
	                    adsr = data.anode;
	                    break;
	                }
	            }
	            piano.setEnvelope(adsr || { attack: 0, release: 0 });
	        };
	    };
	    NoteInputs.prototype.setupArpeggiator = function (piano, ac) {
	        var _this = this;
	        this.arpeggiator = new arpeggiator_1.Arpeggiator(ac);
	        piano.arpeggioChanged = function (bpm, mode, octaves) {
	            _this.arpeggiator.mode = mode;
	            _this.arpeggiator.octaves = octaves;
	            _this.arpeggiator.bpm = bpm;
	        };
	        this.arpeggiator.noteOn =
	            function (midi, velocity, time) { return _this.noteOn(midi, velocity, time); };
	        this.arpeggiator.noteOff =
	            function (midi, velocity, time) { return _this.noteOff(midi, velocity, time); };
	    };
	    NoteInputs.prototype.noteOn = function (midi, velocity, time) {
	        this.lastNote = midi;
	        var portamento = this.piano.getPortamento();
	        if (this.poly) {
	            this.instrument.portamento.time = portamento;
	            this.instrument.noteOn(midi, velocity, time);
	        }
	        else {
	            this.synthUI.synth.portamento.time = portamento;
	            this.synthUI.synth.noteOn(midi, velocity, time);
	        }
	    };
	    NoteInputs.prototype.noteOff = function (midi, velocity, time) {
	        this.lastNote = 0;
	        if (this.poly)
	            this.instrument.noteOff(midi, velocity, time);
	        else
	            this.synthUI.synth.noteOff(midi, velocity, time);
	    };
	    NoteInputs.prototype.polyOn = function () {
	        if (this.lastNote)
	            this.noteOff(this.lastNote, 1);
	        this.poly = true;
	        var json = this.synthUI.gr.toJSON();
	        this.instrument = new instrument_1.Instrument(this.synthUI.synth.ac, json, NUM_VOICES);
	    };
	    NoteInputs.prototype.polyOff = function () {
	        this.poly = false;
	        this.instrument.close();
	    };
	    return NoteInputs;
	})();
	exports.NoteInputs = NoteInputs;


/***/ },
/* 12 */
/***/ function(module, exports) {

	var KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
	var BASE_NOTE = 36;
	/**
	 * Provides a piano keyboard using the PC keyboard.
	 * Listens to keyboard events and generates MIDI-style noteOn/noteOff events.
	 */
	var Keyboard = (function () {
	    function Keyboard() {
	        this.setupHandler();
	        this.baseNote = BASE_NOTE;
	    }
	    Keyboard.prototype.setupHandler = function () {
	        var _this = this;
	        var pressedKeys = {};
	        $('body')
	            .on('keydown', function (evt) {
	            if (pressedKeys[evt.keyCode])
	                return; // Skip repetitions
	            if (evt.metaKey || evt.altKey || evt.ctrlKey)
	                return; // Skip browser shortcuts
	            pressedKeys[evt.keyCode] = true;
	            var midi = _this.key2midi(evt.keyCode);
	            if (midi < 0)
	                return;
	            _this.noteOn(midi);
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
	        return this.baseNote + pos;
	    };
	    Keyboard.prototype.noteOn = function (midi) { };
	    Keyboard.prototype.noteOff = function (midi) { };
	    return Keyboard;
	})();
	exports.Keyboard = Keyboard;


/***/ },
/* 13 */
/***/ function(module, exports) {

	var MidiKeyboard = (function () {
	    function MidiKeyboard() {
	        var _this = this;
	        this.connected = false;
	        if (!navigator.requestMIDIAccess)
	            return;
	        navigator.requestMIDIAccess({ sysex: false }).then(function (midiAccess) {
	            if (midiAccess.inputs.size <= 0)
	                return;
	            var input = midiAccess.inputs.values().next().value;
	            if (!input)
	                return;
	            input.onmidimessage = function (msg) { return _this.midiMessage(msg); };
	            _this.connected = true;
	        });
	    }
	    MidiKeyboard.prototype.midiMessage = function (msg) {
	        var data = msg.data;
	        var cmd = data[0] >> 4;
	        var channel = data[0] & 0xf;
	        var note = data[1];
	        var velocity = data[2];
	        switch (cmd) {
	            case 9:
	                this.noteOn(note, velocity, channel);
	                break;
	            case 8:
	                this.noteOff(note, velocity, channel);
	                break;
	        }
	    };
	    MidiKeyboard.prototype.noteOn = function (midi, velocity, channel) { };
	    MidiKeyboard.prototype.noteOff = function (midi, velocity, channel) { };
	    return MidiKeyboard;
	})();
	exports.MidiKeyboard = MidiKeyboard;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var popups = __webpack_require__(8);
	var modern_1 = __webpack_require__(5);
	var NUM_WHITES = 17;
	var BASE_NOTE = 36;
	var ARPEGGIO_MODES = ['', 'u', 'd', 'ud'];
	var ARPEGGIO_LABELS = ['-', '&uarr;', '&darr;', '&uarr;&darr;'];
	var MAX_ARPEGGIO_OCT = 3;
	var ARPEGGIO_MIN = 15;
	var ARPEGGIO_MAX = 480;
	var PORTAMENTO_MIN = 0;
	var PORTAMENTO_MAX = 1;
	/**
	 * A virtual piano keyboard that:
	 * 	- Captures mouse input and generates corresponding note events
	 * 	- Displays note events as CSS-animated colors in the pressed keys
	 * 	- Supports octave switching
	 * 	- Provides a poly/mono button
	 */
	var PianoKeyboard = (function () {
	    function PianoKeyboard(panel) {
	        this.arpeggio = {
	            mode: 0,
	            octave: 1,
	            bpm: 60
	        };
	        this.baseNote = BASE_NOTE;
	        this.octave = 3;
	        this.poly = false;
	        this.envelope = { attack: 0, release: 0 };
	        this.createKeys(panel);
	        for (var i = 0; i < this.keys.length; i++)
	            this.registerKey(this.keys[i], i);
	        this.controls = panel.parent();
	        this.registerButtons(this.controls);
	        this.portaSlider = this.controls.find('.portamento-box input');
	    }
	    PianoKeyboard.prototype.createKeys = function (panel) {
	        this.keys = [];
	        var pw = panel.width();
	        var ph = panel.height();
	        var kw = pw / NUM_WHITES + 1;
	        var bw = kw * 2 / 3;
	        var bh = ph * 2 / 3;
	        // Create white keys
	        var knum = 0;
	        for (var i = 0; i < NUM_WHITES; i++) {
	            var key = $('<div class="piano-key">').css({
	                width: '' + kw + 'px',
	                height: '' + ph + 'px'
	            });
	            panel.append(key);
	            this.keys[knum++] = key;
	            if (this.hasBlack(i))
	                knum++;
	        }
	        // Create black keys
	        var knum = 0;
	        var x = 10 - bw / 2;
	        for (var i = 0; i < NUM_WHITES - 1; i++) {
	            x += kw - 1;
	            knum++;
	            if (!this.hasBlack(i))
	                continue;
	            var key = $('<div class="piano-key piano-black">').css({
	                width: '' + bw + 'px',
	                height: '' + bh + 'px',
	                left: '' + x + 'px',
	                top: '10px'
	            });
	            panel.append(key);
	            this.keys[knum++] = key;
	        }
	    };
	    PianoKeyboard.prototype.hasBlack = function (num) {
	        var mod7 = num % 7;
	        return mod7 != 2 && mod7 != 6;
	    };
	    PianoKeyboard.prototype.registerKey = function (key, knum) {
	        var _this = this;
	        key.mousedown(function (_) {
	            var midi = knum + _this.baseNote;
	            _this.displayKeyDown(key);
	            _this.noteOn(midi);
	        });
	        key.mouseup(function (_) {
	            var midi = knum + _this.baseNote;
	            _this.displayKeyUp(key);
	            _this.noteOff(midi);
	        });
	    };
	    PianoKeyboard.prototype.registerButtons = function (panel) {
	        var _this = this;
	        // Octave navigation
	        $('#prev-octave-but').click(function (_) {
	            _this.octave--;
	            _this.updateOctave();
	        });
	        $('#next-octave-but').click(function (_) {
	            _this.octave++;
	            _this.updateOctave();
	        });
	        // Arpeggio
	        var arpeggioSlider = panel.find('.arpeggio-box input');
	        arpeggioSlider.on('input', function (_) {
	            _this.arpeggio.bpm =
	                modern_1.log2linear(parseFloat(arpeggioSlider.val()), ARPEGGIO_MIN, ARPEGGIO_MAX);
	            // ARPEGGIO_MIN + parseFloat(arpeggioSlider.val()) * (ARPEGGIO_MAX - ARPEGGIO_MIN);
	            _this.triggerArpeggioChange();
	        });
	        var butArpMode = panel.find('.btn-arpeggio-ud');
	        butArpMode.click(function (_) { return _this.changeArpeggioMode(butArpMode); });
	        var butArpOct = panel.find('.btn-arpeggio-oct');
	        butArpOct.click(function (_) { return _this.changeArpeggioOctave(butArpOct); });
	        // Monophonic / polyphonic mode
	        $('#poly-but').click(function (_) { return _this.togglePoly(); });
	    };
	    PianoKeyboard.prototype.updateOctave = function () {
	        $('#prev-octave-but').prop('disabled', this.octave <= 1);
	        $('#next-octave-but').prop('disabled', this.octave >= 8);
	        $('#octave-label').text('C' + this.octave);
	        this.baseNote = BASE_NOTE + 12 * (this.octave - 3);
	        this.octaveChanged(this.baseNote);
	    };
	    PianoKeyboard.prototype.displayKeyDown = function (key) {
	        if (typeof key == 'number')
	            key = this.midi2key(key);
	        if (!key)
	            return;
	        if (!this.poly && this.arpeggio.mode == 0 && this.lastKey)
	            this.displayKeyUp(this.lastKey, true);
	        key.css('transition', "background-color " + this.envelope.attack + "s linear");
	        key.addClass('piano-key-pressed');
	        this.lastKey = key;
	    };
	    PianoKeyboard.prototype.displayKeyUp = function (key, immediate) {
	        if (typeof key == 'number')
	            key = this.midi2key(key);
	        if (!key)
	            return;
	        var release = immediate ? 0 : this.envelope.release;
	        key.css('transition', "background-color " + release + "s linear");
	        key.removeClass('piano-key-pressed');
	    };
	    PianoKeyboard.prototype.midi2key = function (midi) {
	        return this.keys[midi - this.baseNote];
	    };
	    PianoKeyboard.prototype.setEnvelope = function (adsr) {
	        this.envelope = adsr;
	    };
	    PianoKeyboard.prototype.togglePoly = function () {
	        this.poly = !this.poly;
	        if (this.poly) {
	            var cover = $('<div>').addClass('editor-cover');
	            cover.append('<p>You can use the PC keyboard to play notes<br><br>' +
	                'Synth editing is disabled in polyphonic mode</p>');
	            $('body').append(cover);
	            $('#poly-but').text('Poly');
	            popups.isOpen = true;
	            this.polyOn();
	        }
	        else {
	            $('.editor-cover').remove();
	            $('#poly-but').text('Mono');
	            popups.isOpen = false;
	            this.polyOff();
	        }
	    };
	    PianoKeyboard.prototype.getPortamento = function () {
	        var sv = parseFloat(this.portaSlider.val());
	        ;
	        return modern_1.log2linear(sv, PORTAMENTO_MIN, PORTAMENTO_MAX);
	    };
	    PianoKeyboard.prototype.changeArpeggioMode = function (button) {
	        this.arpeggio.mode++;
	        if (this.arpeggio.mode >= ARPEGGIO_MODES.length)
	            this.arpeggio.mode = 0;
	        button.html(ARPEGGIO_LABELS[this.arpeggio.mode]);
	        this.triggerArpeggioChange();
	    };
	    PianoKeyboard.prototype.changeArpeggioOctave = function (button) {
	        this.arpeggio.octave++;
	        if (this.arpeggio.octave > MAX_ARPEGGIO_OCT)
	            this.arpeggio.octave = 1;
	        button.text(this.arpeggio.octave);
	        this.triggerArpeggioChange();
	    };
	    PianoKeyboard.prototype.triggerArpeggioChange = function () {
	        this.arpeggioChanged(this.arpeggio.bpm, ARPEGGIO_MODES[this.arpeggio.mode], this.arpeggio.octave);
	    };
	    PianoKeyboard.prototype.toJSON = function () {
	        return {
	            portamento: this.getPortamento(),
	            octave: this.octave,
	            arpeggio: {
	                bpm: this.arpeggio.bpm,
	                mode: this.arpeggio.mode,
	                octave: this.arpeggio.octave
	            }
	        };
	    };
	    PianoKeyboard.prototype.fromJSON = function (json) {
	        if (!json)
	            return;
	        if (json.portamento) {
	            this.portaSlider.val(modern_1.linear2log(json.portamento, PORTAMENTO_MIN, PORTAMENTO_MAX));
	        }
	        if (json.octave) {
	            this.octave = json.octave;
	            this.updateOctave();
	        }
	        if (json.arpeggio) {
	            this.arpeggio.bpm = json.arpeggio.bpm;
	            this.arpeggio.mode = json.arpeggio.mode;
	            this.arpeggio.octave = json.arpeggio.octave;
	            this.controls.find('.arpeggio-box input').val(modern_1.linear2log(this.arpeggio.bpm, ARPEGGIO_MIN, ARPEGGIO_MAX));
	            this.controls.find('.btn-arpeggio-ud').html(ARPEGGIO_LABELS[this.arpeggio.mode]);
	            this.controls.find('.btn-arpeggio-oct').text(this.arpeggio.octave);
	            this.triggerArpeggioChange();
	        }
	    };
	    // Simple event handlers
	    PianoKeyboard.prototype.noteOn = function (midi) { };
	    PianoKeyboard.prototype.noteOff = function (midi) { };
	    PianoKeyboard.prototype.polyOn = function () { };
	    PianoKeyboard.prototype.polyOff = function () { };
	    PianoKeyboard.prototype.octaveChanged = function (baseNote) { };
	    PianoKeyboard.prototype.arpeggioChanged = function (bpm, mode, octaves) { };
	    return PianoKeyboard;
	})();
	exports.PianoKeyboard = PianoKeyboard;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var timer_1 = __webpack_require__(16);
	var Arpeggiator = (function () {
	    function Arpeggiator(ac) {
	        var _this = this;
	        this.backward = false;
	        this.mode = '';
	        this.octaves = 1;
	        this.bpm = 60;
	        this.notect = 0;
	        this.notes = new NoteTable();
	        this.timer = new timer_1.Timer(ac, this.bpm);
	        this.timer.start(function (time) { return _this.timerCB(time); });
	    }
	    Object.defineProperty(Arpeggiator.prototype, "bpm", {
	        get: function () { return this._bpm; },
	        set: function (v) {
	            this._bpm = v;
	            if (this.timer)
	                this.timer.bpm = v;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Arpeggiator.prototype.timerCB = function (time) {
	        // Release previous note
	        if (this.lastNote) {
	            this.noteOff(this.lastNote.noteToPlay, this.lastNote.velocity, time);
	            this.lastNote = null;
	        }
	        // Return if disabled or no notes
	        if (this.mode.length == 0)
	            return;
	        var len = this.notes.length();
	        if (len == 0)
	            return;
	        // Check note counter
	        this.wrapCounter(len);
	        // Get current note and play it
	        var ndata = this.notes.get(this.notect);
	        this.noteOn(ndata.noteToPlay, ndata.velocity, time);
	        this.lastNote = ndata;
	        // Update note counter
	        if (this.mode == 'u')
	            this.notect++;
	        else if (this.mode == 'd')
	            this.notect--;
	        else if (this.mode == 'ud') {
	            if (this.backward)
	                this.notect--;
	            else
	                this.notect++;
	        }
	    };
	    Arpeggiator.prototype.wrapCounter = function (len) {
	        if (this.notect >= len) {
	            if (this.mode != 'ud')
	                this.notect = 0;
	            else {
	                this.backward = true;
	                this.notect = len < 2 ? 0 : len - 2;
	            }
	        }
	        else if (this.notect < 0) {
	            if (this.mode != 'ud')
	                this.notect = len - 1;
	            else {
	                this.backward = false;
	                this.notect = len < 2 ? 0 : 1;
	            }
	        }
	    };
	    Arpeggiator.prototype.sendNoteOn = function (midi, velocity) {
	        if (this.mode.length == 0)
	            return this.noteOn(midi, velocity);
	        var shouldStart = this.notes.length() == 0;
	        this.notes.add(midi, midi, velocity);
	        if (this.octaves > 1)
	            this.notes.add(midi, midi + 12, velocity);
	        if (this.octaves > 2)
	            this.notes.add(midi, midi + 24, velocity);
	        if (shouldStart)
	            this.timer.start();
	    };
	    Arpeggiator.prototype.sendNoteOff = function (midi, velocity) {
	        if (this.mode.length == 0)
	            this.noteOff(midi, velocity);
	        this.notes.remove(midi);
	        if (this.notes.length() == 0) {
	            this.timerCB(0);
	            this.timer.stop();
	            this.backward = false;
	            this.notect = 0;
	        }
	    };
	    // Event handlers
	    Arpeggiator.prototype.noteOn = function (midi, velocity, time) { };
	    Arpeggiator.prototype.noteOff = function (midi, velocity, time) { };
	    return Arpeggiator;
	})();
	exports.Arpeggiator = Arpeggiator;
	var NoteData = (function () {
	    function NoteData(note, noteToPlay, velocity) {
	        this.note = note;
	        this.noteToPlay = noteToPlay;
	        this.velocity = velocity;
	    }
	    return NoteData;
	})();
	var NoteTable = (function () {
	    function NoteTable() {
	        this.notes = [];
	    }
	    NoteTable.prototype.length = function () { return this.notes.length; };
	    NoteTable.prototype.get = function (i) { return this.notes[i]; };
	    NoteTable.prototype.add = function (note, noteToPlay, velocity) {
	        var ndata = new NoteData(note, noteToPlay, velocity);
	        for (var i = 0; i < this.notes.length; i++) {
	            if (noteToPlay < this.notes[i].noteToPlay) {
	                this.notes.splice(i, 0, ndata);
	                return;
	            }
	        }
	        this.notes.push(ndata);
	    };
	    NoteTable.prototype.remove = function (note) {
	        this.notes = this.notes.filter(function (ndata) { return ndata.note != note; });
	    };
	    return NoteTable;
	})();


/***/ },
/* 16 */
/***/ function(module, exports) {

	var Timer = (function () {
	    function Timer(ac, bpm, interval, ahead) {
	        if (bpm === void 0) { bpm = 60; }
	        if (interval === void 0) { interval = 0.025; }
	        if (ahead === void 0) { ahead = 0.1; }
	        this.running = false;
	        this.ac = ac;
	        this.dt = 0;
	        this.nextNoteTime = 0;
	        this.bpm = bpm;
	        this.interval = interval;
	        this.ahead = ahead;
	    }
	    Object.defineProperty(Timer.prototype, "bpm", {
	        get: function () { return this._bpm; },
	        set: function (v) {
	            this._bpm = v;
	            this.nextNoteTime -= this.dt;
	            this.dt = (1 / 4) * 60 / this._bpm;
	            this.nextNoteTime += this.dt;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Timer.prototype.start = function (cb) {
	        if (this.running)
	            return;
	        this.running = true;
	        if (cb)
	            this.cb = cb;
	        this.nextNoteTime = this.ac.currentTime;
	        this.tick();
	    };
	    Timer.prototype.stop = function () {
	        this.running = false;
	    };
	    Timer.prototype.tick = function () {
	        if (!this.running)
	            return;
	        setTimeout(this.tick.bind(this), this.interval * 1000);
	        while (this.nextNoteTime < this.ac.currentTime + this.ahead) {
	            if (this.cb)
	                this.cb(this.nextNoteTime);
	            this.nextNoteTime += this.dt;
	        }
	    };
	    return Timer;
	})();
	exports.Timer = Timer;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var synth_1 = __webpack_require__(3);
	/**
	 * A polyphonic synth controlling an array of voices
	 */
	var Instrument = (function () {
	    function Instrument(ac, json, numVoices, dest) {
	        // Setup voices
	        this.pressed = [];
	        this.released = [];
	        this.voices = [];
	        for (var i = 0; i < numVoices; i++) {
	            this.voices.push(new Voice(ac, json, dest));
	            this.released.push(i);
	        }
	        // Setup synth params by having a common instance for all voices
	        this.portamento = this.voices[0].synth.portamento;
	        if (json.keyboard && json.keyboard.portamento)
	            this.portamento.time = json.keyboard.portamento;
	        for (var i = 1; i < numVoices; i++)
	            this.voices[i].synth.portamento = this.portamento;
	    }
	    Instrument.prototype.noteOn = function (midi, velocity, when) {
	        if (velocity === void 0) { velocity = 1; }
	        var vnum = this.findVoice();
	        var voice = this.voices[vnum];
	        this.pressed.push(vnum);
	        voice.noteOn(midi, velocity, when);
	    };
	    Instrument.prototype.noteOff = function (midi, velocity, when) {
	        if (velocity === void 0) { velocity = 1; }
	        for (var i = 0; i < this.voices.length; i++) {
	            var voice = this.voices[i];
	            if (voice.lastNote == midi) {
	                voice.noteOff(midi, velocity, when);
	                this.released.push(i);
	                break;
	            }
	        }
	    };
	    Instrument.prototype.findVoice = function () {
	        var voices;
	        if (this.released.length > 0)
	            voices = this.released;
	        else if (this.pressed.length > 0)
	            voices = this.pressed;
	        else
	            throw "This should never happen";
	        return voices.splice(0, 1)[0];
	    };
	    Instrument.prototype.close = function () {
	        for (var _i = 0, _a = this.voices; _i < _a.length; _i++) {
	            var voice = _a[_i];
	            voice.close();
	        }
	    };
	    return Instrument;
	})();
	exports.Instrument = Instrument;
	/**
	 * An independent monophonic synth
	 */
	var Voice = (function () {
	    function Voice(ac, json, dest) {
	        this.loader = new SynthLoader();
	        this.synth = this.loader.load(ac, json, dest || ac.destination);
	        this.lastNote = 0;
	    }
	    Voice.prototype.noteOn = function (midi, velocity, when) {
	        if (velocity === void 0) { velocity = 1; }
	        this.synth.noteOn(midi, velocity, when);
	        this.lastNote = midi;
	    };
	    Voice.prototype.noteOff = function (midi, velocity, when) {
	        if (velocity === void 0) { velocity = 1; }
	        this.synth.noteOff(midi, velocity, when);
	        this.lastNote = 0;
	    };
	    Voice.prototype.close = function () {
	        // This method must be called to avoid memory leaks at the Web Audio level
	        if (this.lastNote)
	            this.noteOff(this.lastNote, 1);
	        this.loader.close();
	    };
	    return Voice;
	})();
	exports.Voice = Voice;
	//-------------------- Private --------------------
	var VoiceNodeData = (function (_super) {
	    __extends(VoiceNodeData, _super);
	    function VoiceNodeData(id) {
	        _super.call(this);
	        this.id = id;
	        this.inputs = [];
	    }
	    VoiceNodeData.prototype.getInputs = function () {
	        return this.inputs;
	    };
	    return VoiceNodeData;
	})(synth_1.NodeData);
	var SynthLoader = (function () {
	    function SynthLoader() {
	        this.nodes = [];
	    }
	    SynthLoader.prototype.load = function (ac, json, dest) {
	        var synth = new synth_1.Synth(ac);
	        // Add nodes into id-based table
	        var i = 0;
	        for (var _i = 0, _a = json.nodes; _i < _a.length; _i++) {
	            var jn = _a[_i];
	            this.nodes[i++] = new VoiceNodeData(jn.id);
	        }
	        // Then set their list of inputs
	        for (var i_1 = 0; i_1 < json.nodes.length; i_1++)
	            for (var _b = 0, _c = json.nodes[i_1].inputs; _b < _c.length; _b++) {
	                var inum = _c[_b];
	                this.nodes[i_1].inputs.push(this.nodeById(inum));
	            }
	        // Then set their data
	        for (var i_2 = 0; i_2 < json.nodes.length; i_2++) {
	            var type = json.nodeData[i_2].type;
	            if (type == 'out')
	                synth.initOutputNodeData(this.nodes[i_2], dest);
	            else
	                synth.initNodeData(this.nodes[i_2], type);
	            synth.json2NodeData(json.nodeData[i_2], this.nodes[i_2]);
	        }
	        // Then notify connections to handler
	        for (var _d = 0, _e = this.nodes; _d < _e.length; _d++) {
	            var dst = _e[_d];
	            for (var _f = 0, _g = dst.inputs; _f < _g.length; _f++) {
	                var src = _g[_f];
	                synth.connectNodes(src, dst);
	            }
	        }
	        // Finally, return the newly created synth
	        this.synth = synth;
	        return synth;
	    };
	    SynthLoader.prototype.nodeById = function (id) {
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var node = _a[_i];
	            if (node.id === id)
	                return node;
	        }
	        return null;
	    };
	    SynthLoader.prototype.close = function () {
	        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
	            var node = _a[_i];
	            for (var _b = 0, _c = node.inputs; _b < _c.length; _b++) {
	                var input = _c[_b];
	                this.synth.disconnectNodes(input, node);
	            }
	        }
	    };
	    return SynthLoader;
	})();


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var popups = __webpack_require__(8);
	var MAX_PRESETS = 20;
	/**
	 * Manages the presets box:
	 * - Handles navigation through presets
	 * - Handles preset loading & saving
	 */
	var Presets = (function () {
	    function Presets(synthUI) {
	        this.presetNum = 0;
	        this.synthUI = synthUI;
	        this.registerListeners();
	        this.loadPresets();
	    }
	    Presets.prototype.loadPresets = function () {
	        var _this = this;
	        this.presets = new Array(MAX_PRESETS);
	        for (var i = 0; i < MAX_PRESETS; i++)
	            this.presets[i] = this.getEmptyPreset();
	        $.get('js/presets.json', function (data) {
	            if (!(data instanceof Array))
	                return;
	            for (var i = 0; i < MAX_PRESETS; i++)
	                if (data[i])
	                    _this.presets[i] = data[i];
	            _this.preset2synth();
	        });
	    };
	    Presets.prototype.getEmptyPreset = function () {
	        return {
	            name: '',
	            nodes: [
	                { id: 0, x: 500, y: 180, name: 'Out', inputs: [], classes: 'node node-out' }
	            ],
	            nodeData: [
	                { type: 'out', params: {} }
	            ]
	        };
	    };
	    Presets.prototype.registerListeners = function () {
	        var _this = this;
	        $('#save-but').click(function (_) { return _this.savePreset(); });
	        $('#load-file').on('change', function (evt) { return _this.loadPreset(evt); });
	        $('#prev-preset-but').click(function (_) { return _this.changePreset(_this.presetNum - 1); });
	        $('#next-preset-but').click(function (_) { return _this.changePreset(_this.presetNum + 1); });
	        $('body').keydown(function (evt) {
	            if (evt.target.nodeName == 'INPUT' || popups.isOpen)
	                return;
	            if (evt.keyCode == 37)
	                _this.changePreset(_this.presetNum - 1);
	            if (evt.keyCode == 39)
	                _this.changePreset(_this.presetNum + 1);
	        });
	        $('#preset-num').click(function (_) { return _this.togglePresetSelector(); });
	        var preSel = $('.preset-selector select');
	        preSel.change(function (_) {
	            var sel = preSel.val().split(':')[0];
	            _this.changePreset(sel - 1);
	        });
	    };
	    Presets.prototype.togglePresetSelector = function () {
	        var seldiv = $('.preset-selector');
	        seldiv.toggle();
	        if (!seldiv.is(':visible'))
	            return;
	        // Fill select contents
	        var sel = seldiv.find('select');
	        sel.empty();
	        sel.focus();
	        var i = 0;
	        for (var _i = 0, _a = this.presets; _i < _a.length; _i++) {
	            var preset = _a[_i];
	            var selected = i == this.presetNum ? ' selected' : '';
	            i++;
	            if (preset.nodes.length > 1)
	                sel.append("<option" + selected + ">" + i + ": " + preset.name + "</option>");
	        }
	    };
	    Presets.prototype.changePreset = function (newNum) {
	        if (newNum < 0)
	            newNum = MAX_PRESETS - 1;
	        else if (newNum >= MAX_PRESETS)
	            newNum = 0;
	        this.synth2preset();
	        this.presetNum = newNum;
	        this.preset2synth();
	    };
	    Presets.prototype.synth2preset = function () {
	        this.presets[this.presetNum] = this.synthUI.gr.toJSON();
	        this.presets[this.presetNum].name = $('#preset-name').val();
	    };
	    Presets.prototype.preset2synth = function () {
	        var preset = this.presets[this.presetNum];
	        this.afterLoad(preset);
	        $('#preset-num').text(this.presetNum + 1);
	        $('#preset-name').val(preset.name);
	        $('#node-params').empty();
	        this.synthUI.gr.fromJSON(preset);
	        this.selectBestNode();
	    };
	    Presets.prototype.selectBestNode = function () {
	        var _this = this;
	        var getFirstNode = function (isGood) { return _this.synthUI.gr.nodes.filter(isGood)[0]; };
	        var n = getFirstNode(function (n) { return n.data.type == 'Filter'; });
	        if (!n)
	            n = getFirstNode(function (n) { return n.data.type == 'ADSR'; });
	        if (!n)
	            n = getFirstNode(function (n) { return n.data.anode.numberOfInputs == 0; });
	        if (n)
	            this.synthUI.gr.selectNode(n);
	    };
	    Presets.prototype.loadPreset = function (evt) {
	        var _this = this;
	        if (!evt.target.files || evt.target.files.length <= 0)
	            return;
	        var file = evt.target.files[0];
	        var reader = new FileReader();
	        reader.onload = function (loadEvt) {
	            var json = JSON.parse(loadEvt.target.result);
	            _this.presets[_this.presetNum] = json;
	            _this.preset2synth();
	        };
	        reader.readAsText(file);
	    };
	    Presets.prototype.savePreset = function () {
	        var json = this.synthUI.gr.toJSON();
	        this.beforeSave(json);
	        json.name = $('#preset-name').val().trim();
	        var jsonData = JSON.stringify(json);
	        if (this.browserSupportsDownload()) {
	            //TODO: open popup to ask for file name before saving
	            if (json.name.length == 0)
	                json.name = '' + this.presetNum;
	            var a = $('<a>');
	            a.attr('download', json.name + '.json');
	            a.attr('href', 'data:application/octet-stream;base64,' + btoa(jsonData));
	            var clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: false });
	            a[0].dispatchEvent(clickEvent);
	        }
	        else {
	            popups.prompt('Copy the text below to the clipboard and save it to a local text file', 'Save preset', jsonData, null);
	        }
	    };
	    Presets.prototype.browserSupportsDownload = function () {
	        return !window.externalHost && 'download' in $('<a>')[0];
	    };
	    // Extension point to specify additional data to save, e.g. keyboard settings
	    Presets.prototype.beforeSave = function (json) { };
	    // Extension point to handle previously saved additional data
	    Presets.prototype.afterLoad = function (json) { };
	    return Presets;
	})();
	exports.Presets = Presets;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map