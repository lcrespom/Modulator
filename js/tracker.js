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

	var tracker = __webpack_require__(20);
	var pianola_1 = __webpack_require__(21);
	var partUI_1 = __webpack_require__(22);
	var instrument_1 = __webpack_require__(18);
	function rowWithNotes() {
	    var notes = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        notes[_i - 0] = arguments[_i];
	    }
	    var nr = new tracker.NoteRow();
	    nr.notes = notes;
	    return nr;
	}
	function createNotes() {
	    var rows = [];
	    var i = 0;
	    rows[i] = rowWithNotes(tracker.Note.on(48));
	    i += 4;
	    rows[i] = rowWithNotes(tracker.Note.off(48), tracker.Note.on(55));
	    i += 4;
	    rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	    rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	    rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	    rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	    i += 5;
	    rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	    i += 4;
	    rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	    rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	    rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	    rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	    i += 5;
	    rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	    i += 4;
	    rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	    rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	    rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(53));
	    rows[i] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(50));
	    i += 5;
	    rows[i] = rowWithNotes(tracker.Note.off(50));
	    return rows;
	}
	function starWars(ac) {
	    var p = new tracker.Part();
	    p.voices = 1;
	    var json = {
	        nodes: [
	            { id: 0, inputs: [1] },
	            { id: 1, inputs: [] }
	        ],
	        nodeData: [
	            { type: 'out', params: {} },
	            { type: 'Oscillator', params: { frequency: 440, detune: 0, type: 'square' } }
	        ]
	    };
	    p.instrument = new instrument_1.Instrument(ac, json, p.voices);
	    p.name = 'Main theme';
	    p.rows = createNotes();
	    var t = new tracker.Track();
	    t.parts.push(p);
	    var s = new tracker.Song();
	    s.title = 'Star Wars';
	    s.bpm = 90;
	    s.tracks.push(t);
	    return s;
	}
	//--------------------------------------------------
	var ac = new AudioContext();
	var sw = starWars(ac);
	var part = sw.tracks[0].parts[0];
	var pianola = new pianola_1.Pianola($('#past-notes'), $('#piano'), $('#future-notes'));
	var pbox = new partUI_1.PartBox(ac, $('#part-box'), part, pianola);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var notes_1 = __webpack_require__(4);
	var palette_1 = __webpack_require__(6);
	var modern_1 = __webpack_require__(5);
	var custom = __webpack_require__(7);
	var file = __webpack_require__(8);
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
	        this.registerParamHandler('BufferData', new BufferData());
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
	        this.setupNoteHandlers();
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
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
	    Synth.prototype.setupNoteHandlers = function () {
	        var maxRelease = 0;
	        for (var _i = 0, _a = this.noteHandlers; _i < _a.length; _i++) {
	            var nh = _a[_i];
	            if (nh.kbTrigger && nh.releaseTime > maxRelease)
	                maxRelease = nh.releaseTime;
	        }
	        for (var _b = 0, _c = this.noteHandlers; _b < _c.length; _b++) {
	            var nh = _c[_b];
	            if (!nh.kbTrigger)
	                nh.releaseTime = maxRelease;
	        }
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
	var BufferData = (function () {
	    function BufferData() {
	    }
	    BufferData.prototype.initialize = function (anode, def) { };
	    BufferData.prototype.renderParam = function (panel, pdef, anode, param, label) {
	        var box = $('<div class="choice-box">');
	        var button = $("\n\t\t\t<span class=\"btn btn-primary upload\">\n\t\t\t\t<input type=\"file\" id=\"load-file\">\n\t\t\t\tLoad&nbsp;\n\t\t\t\t<span class=\"glyphicon glyphicon-open\" aria-hidden=\"true\"></span>\n\t\t\t</span>");
	        box.append(button);
	        button.after('<br/><br/>' + label);
	        panel.append(box);
	        button.find('input').change(function (evt) { return file.uploadArrayBuffer(evt, function (soundFile) {
	            anode['_encoded'] = soundFile;
	            anode.context.decodeAudioData(soundFile, function (buffer) { return anode['_buffer'] = buffer; });
	        }); });
	        return box;
	    };
	    BufferData.prototype.param2json = function (anode) {
	        return file.arrayBufferToBase64(anode['_encoded']);
	    };
	    BufferData.prototype.json2param = function (anode, json) {
	        var encoded = file.base64ToArrayBuffer(json);
	        anode['_encoded'] = encoded;
	        anode.context.decodeAudioData(encoded, function (buffer) { return anode['_buffer'] = buffer; });
	    };
	    return BufferData;
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
	        this.releaseTime = 0;
	        this.ndata = ndata;
	        this.outTracker = new OutputTracker(ndata.anode);
	    }
	    BaseNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) { };
	    BaseNoteHandler.prototype.noteOff = function (midi, gain, when) { };
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
	        param._value = newv; // Required for ADSR to capture the correct value
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
	    }
	    OscNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        if (this.oscClone)
	            this.oscClone.stop(when);
	        this.oscClone = this.clone();
	        this.rampParam(this.oscClone.frequency, ratio, when);
	        this.oscClone.start(when);
	        this.lastNote = midi;
	    };
	    OscNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return; // Avoid multple keys artifacts in mono mode
	        this.oscClone.stop(when + this.releaseTime);
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
	    }
	    BufferNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        if (this.absn)
	            this.absn.stop(when);
	        var buf = this.ndata.anode['_buffer'];
	        if (!buf)
	            return; // Buffer still loading or failed
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
	        this.absn.stop(when + this.releaseTime);
	    };
	    return BufferNoteHandler;
	})(BaseNoteHandler);
	/**
	 * Performs computations about ramps so they can be easily rescheduled
	 */
	var Ramp = (function () {
	    function Ramp(v1, v2, t1, t2) {
	        this.v1 = v1;
	        this.v2 = v2;
	        this.t1 = t1;
	        this.t2 = t2;
	    }
	    Ramp.prototype.inside = function (t) {
	        return this.t1 < this.t2 && this.t1 <= t && t <= this.t2;
	    };
	    Ramp.prototype.cut = function (t) {
	        var newv = this.v1 + (this.v2 - this.v1) * (t - this.t1) / (this.t2 - this.t1);
	        return new Ramp(this.v1, newv, this.t1, t);
	    };
	    Ramp.prototype.run = function (p, follow) {
	        if (follow === void 0) { follow = false; }
	        if (this.t2 - this.t1 <= 0) {
	            p.setValueAtTime(this.v2, this.t2);
	        }
	        else {
	            if (!follow)
	                p.setValueAtTime(this.v1, this.t1);
	            p.linearRampToValueAtTime(this.v2, this.t2);
	        }
	    };
	    return Ramp;
	})();
	/**
	 * Handles note events for a custom ADSR node
	 */
	var ADSRNoteHandler = (function (_super) {
	    __extends(ADSRNoteHandler, _super);
	    function ADSRNoteHandler(ndata) {
	        var _this = this;
	        _super.call(this, ndata);
	        this.kbTrigger = true;
	        var adsr = ndata.anode;
	        var oldMethod = adsr.disconnect;
	        adsr.disconnect = function (dest) {
	            _this.loopParams(function (param) {
	                if (param == dest)
	                    param.setValueAtTime(param._value, adsr.context.currentTime);
	            });
	            oldMethod(dest);
	        };
	    }
	    Object.defineProperty(ADSRNoteHandler.prototype, "releaseTime", {
	        get: function () {
	            var adsr = this.ndata.anode;
	            return adsr.release;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ADSRNoteHandler.prototype.noteOn = function (midi, gain, ratio, when) {
	        var _this = this;
	        this.lastNote = midi;
	        var adsr = this.ndata.anode;
	        this.loopParams(function (param) {
	            var v = _this.getParamValue(param);
	            var initial = (1 - adsr.depth) * v;
	            var sustain = v * adsr.sustain + initial * (1 - adsr.sustain);
	            var now = adsr.context.currentTime;
	            param.cancelScheduledValues(now);
	            if (when > now)
	                _this.rescheduleRamp(param, param._release, now);
	            param._attack = new Ramp(initial, v, when, when + adsr.attack);
	            param._decay = new Ramp(v, sustain, when + adsr.attack, when + adsr.attack + adsr.decay);
	            param._attack.run(param);
	            param._decay.run(param, true);
	        });
	    };
	    ADSRNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        var _this = this;
	        if (midi != this.lastNote)
	            return; // Avoid multple keys artifacts in mono mode
	        var adsr = this.ndata.anode;
	        this.loopParams(function (param) {
	            var v = _this.getRampValueAtTime(param, when);
	            if (v === null)
	                v = _this.getParamValue(param) * adsr.sustain;
	            var finalv = (1 - adsr.depth) * v;
	            param.cancelScheduledValues(when);
	            var now = adsr.context.currentTime;
	            if (when > now)
	                _this.rescheduleRamp(param, param._attack, now) ||
	                    _this.rescheduleRamp(param, param._decay, now);
	            param._release = new Ramp(v, finalv, when, when + adsr.release);
	            param._release.run(param);
	        });
	    };
	    ADSRNoteHandler.prototype.rescheduleRamp = function (param, ramp, now) {
	        if (ramp && ramp.inside(now)) {
	            ramp.cut(now).run(param);
	            return true;
	        }
	        return false;
	    };
	    ADSRNoteHandler.prototype.getRampValueAtTime = function (param, t) {
	        var ramp;
	        if (param._attack && param._attack.inside(t))
	            return param._attack.cut(t).v2;
	        if (param._decay && param._decay.inside(t))
	            return param._decay.cut(t).v2;
	        return null;
	    };
	    ADSRNoteHandler.prototype.loopParams = function (cb) {
	        for (var _i = 0, _a = this.outTracker.outputs; _i < _a.length; _i++) {
	            var out = _a[_i];
	            if (out instanceof AudioParam)
	                cb(out);
	        }
	    };
	    ADSRNoteHandler.prototype.getParamValue = function (p) {
	        if (p._value === undefined)
	            p._value = p.value;
	        return p._value;
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
	        var anode = this.ndata.anode;
	        if (this.playing)
	            anode.stop(when);
	        this.playing = true;
	        anode.start(when);
	        this.lastNote = midi;
	    };
	    RestartableNoteHandler.prototype.noteOff = function (midi, gain, when) {
	        if (midi != this.lastNote)
	            return;
	        this.playing = false;
	        var anode = this.ndata.anode;
	        anode.stop(when + this.releaseTime);
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
	                handler: 'BufferData'
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
	    CustomNodeBase.prototype.disconnect = function (dest) { };
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

	//-------------------- Encoding / decoding --------------------
	function arrayBufferToBase64(buffer) {
	    var binary = '';
	    var bytes = new Uint8Array(buffer);
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode(bytes[i]);
	    }
	    return window.btoa(binary);
	}
	exports.arrayBufferToBase64 = arrayBufferToBase64;
	function base64ToArrayBuffer(base64) {
	    var binary_string = window.atob(base64);
	    var len = binary_string.length;
	    var bytes = new Uint8Array(len);
	    for (var i = 0; i < len; i++) {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes.buffer;
	}
	exports.base64ToArrayBuffer = base64ToArrayBuffer;
	//-------------------- Downloading --------------------
	function browserSupportsDownload() {
	    return !window.externalHost && 'download' in $('<a>')[0];
	}
	exports.browserSupportsDownload = browserSupportsDownload;
	function download(fileName, fileData) {
	    var a = $('<a>');
	    a.attr('download', fileName);
	    a.attr('href', 'data:application/octet-stream;base64,' + btoa(fileData));
	    var clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: false });
	    a[0].dispatchEvent(clickEvent);
	}
	exports.download = download;
	//-------------------- Uploading --------------------
	function uploadText(event, cb) {
	    upload(event, cb, 'readAsText');
	}
	exports.uploadText = uploadText;
	function uploadArrayBuffer(event, cb) {
	    upload(event, cb, 'readAsArrayBuffer');
	}
	exports.uploadArrayBuffer = uploadArrayBuffer;
	function upload(event, cb, readFunc) {
	    if (!event.target.files || event.target.files.length <= 0)
	        return cb(null);
	    var file = event.target.files[0];
	    var reader = new FileReader();
	    reader.onload = function (loadEvt) { return cb(loadEvt.target.result); };
	    reader[readFunc](file);
	}


/***/ },
/* 9 */
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
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var popups = __webpack_require__(9);
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
	/** Builds a piano keyboard out of DIVs */
	var PianoKeys = (function () {
	    function PianoKeys(numWhites) {
	        if (numWhites === void 0) { numWhites = NUM_WHITES; }
	        this.numWhites = numWhites;
	    }
	    PianoKeys.prototype.createKeys = function (panel) {
	        var keys = [];
	        var pw = panel.width();
	        var ph = panel.height();
	        var fromX = parseFloat(panel.css('padding-left'));
	        var fromY = parseFloat(panel.css('padding-top'));
	        var kw = pw / this.numWhites + 1;
	        var bw = Math.round(kw * 2 / 3);
	        var bh = Math.round(ph * 2 / 3);
	        // Create white keys
	        var knum = 0;
	        for (var i = 0; i < this.numWhites; i++) {
	            var key = $('<div class="piano-key">').css({
	                width: '' + kw + 'px',
	                height: '' + ph + 'px'
	            });
	            panel.append(key);
	            keys[knum++] = key;
	            if (this.hasBlack(i))
	                knum++;
	        }
	        // Create black keys
	        knum = 0;
	        var x = fromX - bw / 2;
	        for (var i = 0; i < this.numWhites - 1; i++) {
	            x += kw - 1;
	            knum++;
	            if (!this.hasBlack(i))
	                continue;
	            var key = $('<div class="piano-key piano-black">').css({
	                width: '' + bw + 'px',
	                height: '' + bh + 'px',
	                left: '' + x + 'px',
	                top: '' + fromY + 'px'
	            });
	            panel.append(key);
	            keys[knum++] = key;
	        }
	        return keys;
	    };
	    PianoKeys.prototype.hasBlack = function (num) {
	        var mod7 = num % 7;
	        return mod7 != 2 && mod7 != 6;
	    };
	    return PianoKeys;
	})();
	exports.PianoKeys = PianoKeys;
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
	        var pianoKeys = new PianoKeys();
	        this.keys = pianoKeys.createKeys(panel);
	        for (var i = 0; i < this.keys.length; i++)
	            this.registerKey(this.keys[i], i);
	        this.controls = panel.parent();
	        this.registerButtons(this.controls);
	        this.portaSlider = this.controls.find('.portamento-box input');
	    }
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
/* 16 */,
/* 17 */
/***/ function(module, exports) {

	var Timer = (function () {
	    function Timer(ac, bpm, ahead) {
	        if (bpm === void 0) { bpm = 60; }
	        if (ahead === void 0) { ahead = 0.1; }
	        this.running = false;
	        this.ac = ac;
	        this.noteDuration = 0;
	        this.nextNoteTime = 0;
	        this.bpm = bpm;
	        this.ahead = ahead;
	    }
	    Object.defineProperty(Timer.prototype, "bpm", {
	        get: function () { return this._bpm; },
	        set: function (v) {
	            this._bpm = v;
	            this.nextNoteTime -= this.noteDuration;
	            this.noteDuration = (1 / 4) * 60 / this._bpm;
	            this.nextNoteTime += this.noteDuration;
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
	        requestAnimationFrame(this.tick.bind(this));
	        while (this.nextNoteTime < this.ac.currentTime + this.ahead) {
	            if (this.cb)
	                this.cb(this.nextNoteTime);
	            this.nextNoteTime += this.noteDuration;
	        }
	    };
	    return Timer;
	})();
	exports.Timer = Timer;


/***/ },
/* 18 */
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
	    Instrument.prototype.allNotesOff = function () {
	        for (var _i = 0, _a = this.voices; _i < _a.length; _i++) {
	            var voice = _a[_i];
	            if (voice.lastNote)
	                voice.noteOff(voice.lastNote);
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
/* 19 */,
/* 20 */
/***/ function(module, exports) {

	var Note = (function () {
	    function Note(type, midi, velocity) {
	        if (velocity === void 0) { velocity = 1; }
	        this.type = type;
	        this.midi = midi;
	        this.velocity = velocity;
	    }
	    Note.on = function (midi, velocity) {
	        if (velocity === void 0) { velocity = 1; }
	        return new Note(Note.NoteOn, midi, velocity);
	    };
	    Note.off = function (midi, velocity) {
	        if (velocity === void 0) { velocity = 1; }
	        return new Note(Note.NoteOff, midi, velocity);
	    };
	    Note.NoteOn = 0;
	    Note.NoteOff = 1;
	    return Note;
	})();
	exports.Note = Note;
	var NoteRow = (function () {
	    function NoteRow() {
	    }
	    return NoteRow;
	})();
	exports.NoteRow = NoteRow;
	var Part = (function () {
	    function Part() {
	        this.rows = [];
	    }
	    Part.prototype.playRow = function (rowNum, when, offDelay) {
	        if (offDelay === void 0) { offDelay = 0; }
	        var row = this.rows[rowNum];
	        if (!row || !row.notes)
	            return;
	        for (var _i = 0, _a = row.notes; _i < _a.length; _i++) {
	            var note = _a[_i];
	            if (note.type == Note.NoteOn) {
	                this.instrument.noteOn(note.midi, note.velocity, when);
	                if (offDelay)
	                    this.instrument.noteOff(note.midi, 1, when + offDelay);
	            }
	            else if (note.type == Note.NoteOff)
	                this.instrument.noteOff(note.midi, note.velocity, when);
	        }
	    };
	    return Part;
	})();
	exports.Part = Part;
	var Track = (function () {
	    function Track() {
	        this.parts = [];
	    }
	    return Track;
	})();
	exports.Track = Track;
	var Song = (function () {
	    function Song() {
	        this.tracks = [];
	    }
	    Song.prototype.play = function () { };
	    Song.prototype.stop = function () { };
	    return Song;
	})();
	exports.Song = Song;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var tracker = __webpack_require__(20);
	var piano_1 = __webpack_require__(15);
	var NUM_WHITES = 28;
	var BASE_NOTE = 24;
	var NOTE_COLOR = '#0CC';
	var COLUMN_COLOR = '#E0E0E0';
	var Pianola = (function () {
	    function Pianola($past, $piano, $future) {
	        this.pkh = new PianoKeyHelper(new piano_1.PianoKeys(NUM_WHITES), $piano);
	        this.past = new NoteCanvas($past, NUM_WHITES * 2, this.pkh);
	        this.future = new NoteCanvas($future, NUM_WHITES * 2, this.pkh);
	        this.notes = [];
	        this.oldNotes = [];
	        this.parent = $piano.parent();
	    }
	    Pianola.prototype.render = function (part, currentRow) {
	        this.past.paintNoteColumns(this.past.numRows - currentRow, this.past.numRows);
	        this.future.paintNoteColumns(0, part.rows.length - currentRow - 1);
	        for (var i = 0; i < part.rows.length; i++) {
	            var row = part.rows[i];
	            this.updateNotes(part.rows[i]);
	            if (i < currentRow)
	                this.renderPastRow(i, currentRow);
	            else if (i == currentRow)
	                this.renderCurrentRow();
	            else
	                this.renderFutureRow(i, currentRow);
	        }
	    };
	    Pianola.prototype.renderPastRow = function (rowNum, currentRow) {
	        var y = this.past.numRows - currentRow + rowNum;
	        //TODO this is WET, should be DRY
	        this.past.renderNoteRow(y, this.notes);
	        if (rowNum % 4 == 0)
	            this.past.renderBar(y);
	    };
	    Pianola.prototype.renderCurrentRow = function () {
	        for (var _i = 0, _a = this.oldNotes; _i < _a.length; _i++) {
	            var note = _a[_i];
	            this.pkh.keyUp(note);
	        }
	        for (var _b = 0, _c = this.notes; _b < _c.length; _b++) {
	            var note = _c[_b];
	            this.pkh.keyDown(note);
	        }
	        this.oldNotes = this.notes.slice();
	    };
	    Pianola.prototype.renderFutureRow = function (rowNum, currentRow) {
	        var y = rowNum - currentRow - 1;
	        this.future.renderNoteRow(y, this.notes);
	        if (rowNum % 4 == 0)
	            this.future.renderBar(y);
	    };
	    Pianola.prototype.updateNotes = function (row) {
	        var rowNotes = row && row.notes ? row.notes : [];
	        var note;
	        for (var _i = 0; _i < rowNotes.length; _i++) {
	            note = rowNotes[_i];
	            if (note.type == tracker.Note.NoteOn)
	                this.notes.push(note.midi);
	            else if (note.type == tracker.Note.NoteOff)
	                this.notes = this.notes.filter(function (midi) { return midi != note.midi; });
	        }
	    };
	    return Pianola;
	})();
	exports.Pianola = Pianola;
	var PianoKeyHelper = (function () {
	    function PianoKeyHelper(pk, $elem) {
	        this.pk = pk;
	        this.keys = this.pk.createKeys($elem);
	    }
	    PianoKeyHelper.prototype.getKey = function (midi) {
	        return this.keys[midi - BASE_NOTE];
	    };
	    PianoKeyHelper.prototype.keyDown = function (midi) {
	        var key = this.getKey(midi);
	        key.addClass('piano-key-pressed');
	    };
	    PianoKeyHelper.prototype.keyUp = function (midi) {
	        var key = this.getKey(midi);
	        key.removeClass('piano-key-pressed');
	    };
	    PianoKeyHelper.prototype.reset = function () {
	        for (var key in this.keys)
	            key.removeClass('piano-key-pressed');
	    };
	    return PianoKeyHelper;
	})();
	var NoteCanvas = (function () {
	    function NoteCanvas($canvas, numKeys, pkh) {
	        this.canvas = $canvas[0];
	        this.gc = this.canvas.getContext('2d');
	        this.numKeys = numKeys;
	        this.pkh = pkh;
	        this.noteW = this.canvas.width / this.numKeys;
	        this.noteH = this.noteW;
	        this.numRows = Math.floor(this.canvas.height / this.noteH);
	    }
	    NoteCanvas.prototype.paintNoteColumns = function (fromRow, toRow) {
	        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
	        var x = this.noteW / 2;
	        this.gc.fillStyle = COLUMN_COLOR;
	        var oldx = 0;
	        var colY = fromRow * this.noteH;
	        var colH = (toRow + 1) * this.noteH - colY;
	        for (var i = 0; i < this.numKeys - 1; i++) {
	            if (i % 2)
	                this.gc.fillRect(Math.round(x) - 1, colY, Math.round(x - oldx), colH);
	            oldx = x;
	            x += this.noteW;
	        }
	    };
	    NoteCanvas.prototype.renderNoteRow = function (y, notes) {
	        var yy = y * this.noteH;
	        if (yy + this.noteH < 0 || yy > this.canvas.height)
	            return;
	        this.gc.fillStyle = NOTE_COLOR;
	        var xOffset = $(this.canvas).offset().left;
	        for (var _i = 0; _i < notes.length; _i++) {
	            var midi = notes[_i];
	            var $key = this.pkh.getKey(midi);
	            var x = $key.offset().left - xOffset;
	            x -= $key.hasClass('piano-black') ? 7.5 : 4;
	            this.gc.fillRect(x, yy, this.noteW, this.noteH);
	        }
	    };
	    NoteCanvas.prototype.renderBar = function (y) {
	        var yy = y * this.noteH - 0.5;
	        this.gc.save();
	        this.gc.strokeStyle = 'black';
	        this.gc.setLineDash([1, 4]);
	        this.gc.beginPath();
	        this.gc.moveTo(0, yy);
	        this.gc.lineTo(this.canvas.width, yy);
	        this.gc.stroke();
	        this.gc.closePath();
	        this.gc.restore();
	    };
	    return NoteCanvas;
	})();


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var timer_1 = __webpack_require__(17);
	var PartBox = (function () {
	    function PartBox(ac, $elem, part, pianola) {
	        var _this = this;
	        this.playing = false;
	        this.rowNum = 0;
	        this.ac = ac;
	        this.$play = $elem.find('.play');
	        this.$play.click(function (_) { return _this.play(); });
	        this.part = part;
	        this.pianola = pianola;
	        this.pianola.render(this.part, this.rowNum);
	        this.registerPianolaScroll();
	        this.rowOfs = 0;
	    }
	    PartBox.prototype.play = function () {
	        var _this = this;
	        if (!this.part)
	            return;
	        this.playing = !this.playing;
	        if (this.playing) {
	            this.setButIcon(this.$play, 'pause');
	            this.timer = new timer_1.Timer(this.ac, 90);
	            this.timer.start(function (when) {
	                _this.part.playRow(_this.rowNum, when);
	                _this.pianola.render(_this.part, _this.rowNum++);
	                _this.rowOfs = _this.rowNum;
	                if (_this.rowNum > _this.part.rows.length)
	                    _this.stop();
	            });
	        }
	        else {
	            this.pause();
	        }
	    };
	    PartBox.prototype.pause = function () {
	        this.setButIcon(this.$play, 'play');
	        this.timer.stop();
	        this.part.instrument.allNotesOff();
	    };
	    PartBox.prototype.stop = function () {
	        this.pause();
	        this.playing = false;
	        this.rowNum = 0;
	    };
	    PartBox.prototype.setButIcon = function ($but, icon) {
	        var $glyph = $but.find('.glyphicon');
	        var classes = $glyph.attr('class').split(/\s+/)
	            .filter(function (c) { return !c.match(/glyphicon-/); }).concat('glyphicon-' + icon);
	        $glyph.attr('class', classes.join(' '));
	    };
	    PartBox.prototype.registerPianolaScroll = function () {
	        var _this = this;
	        this.pianola.parent.on('wheel', function (evt) {
	            if (_this.playing)
	                return;
	            var oe = evt.originalEvent;
	            evt.preventDefault();
	            var dy = oe.deltaY;
	            if (oe.deltaMode == 1)
	                dy *= 100 / 3;
	            _this.updateRowOfs(dy / 10);
	        });
	        $('body').on('keydown', function (evt) {
	            var dy = 0;
	            switch (evt.keyCode) {
	                case 33:
	                    dy = -4;
	                    break;
	                case 34:
	                    dy = +4;
	                    break;
	                case 38:
	                    dy = -1;
	                    break;
	                case 40:
	                    dy = +1;
	                    break;
	                default: return;
	            }
	            _this.updateRowOfs(dy);
	        });
	    };
	    PartBox.prototype.updateRowOfs = function (dy) {
	        this.rowOfs += dy;
	        if (this.rowOfs < 0)
	            this.rowOfs = 0;
	        else if (this.rowOfs > this.part.rows.length)
	            this.rowOfs = this.part.rows.length;
	        var newRow = Math.floor(this.rowOfs);
	        if (newRow != this.rowNum) {
	            this.rowNum = newRow;
	            this.pianola.render(this.part, this.rowNum);
	            this.playRowNotes();
	        }
	    };
	    PartBox.prototype.playRowNotes = function () {
	        //TODO play notes of current row, with auto note off after 0.5 seconds
	    };
	    return PartBox;
	})();
	exports.PartBox = PartBox;


/***/ }
/******/ ]);
//# sourceMappingURL=tracker.js.map