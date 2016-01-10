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
	 * Library that exports the Instrument and Voice classes
	 */
	var instrument_1 = __webpack_require__(15);
	var timer_1 = __webpack_require__(17);
	var global = window;
	global.Modulator = global.Modulator || {};
	global.Modulator.Instrument = instrument_1.Instrument;
	global.Modulator.Voice = instrument_1.Voice;
	global.Modulator.Timer = timer_1.Timer;


/***/ },
/* 1 */,
/* 2 */,
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
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */
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
/* 16 */,
/* 17 */
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


/***/ }
/******/ ]);
//# sourceMappingURL=synthlib.js.map