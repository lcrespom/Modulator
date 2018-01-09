/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 46);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = removeArrayElement;
/* harmony export (immutable) */ __webpack_exports__["b"] = linear2log;
/* harmony export (immutable) */ __webpack_exports__["c"] = log2linear;
/* harmony export (immutable) */ __webpack_exports__["a"] = focusable;
/**
 * Modernize browser interfaces so that TypeScript does not complain
 * when using new features.
 *
 * Also provides some basic utility funcitons
 */
function removeArrayElement(a, e) {
    const pos = a.indexOf(e);
    if (pos < 0)
        return false; // not found
    a.splice(pos, 1);
    return true;
}
const LOG_BASE = 2;
function logarithm(base, x) {
    return Math.log(x) / Math.log(base);
}
function linear2log(value, min, max) {
    const logRange = logarithm(LOG_BASE, max + 1 - min);
    return logarithm(LOG_BASE, value + 1 - min) / logRange;
}
function log2linear(value, min, max) {
    const logRange = logarithm(LOG_BASE, max + 1 - min);
    return min + Math.pow(LOG_BASE, value * logRange) - 1;
}
function focusable(elem) {
    while (elem != null && elem.tabIndex < 0 &&
        elem.nodeName.toLowerCase() != 'body')
        elem = elem.parentElement;
    return elem || document.body;
}


/***/ }),

/***/ 10:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return palette; });
// -------------------- Node palette definition --------------------
const OCTAVE_DETUNE = {
    initial: 0,
    min: -1200,
    max: 1200,
    linear: true
};
/**
 * The set of AudioNodes available to the application, along with
 * their configuration.
 */
let palette = {
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
                handler: 'BufferDataHandler'
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
    SoundBank: {
        constructor: 'createBufferSource',
        noteHandler: 'soundBank',
        params: {
            buffer: {
                initial: null,
                handler: 'SoundBankHandler'
            }
        }
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


/***/ }),

/***/ 11:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Base class to derive all custom nodes from it
 */
class CustomNodeBase {
    constructor() {
        this.custom = true;
        this.channelCount = 2;
        this.channelCountMode = 'max';
        this.channelInterpretation = 'speakers';
        this.numberOfInputs = 0;
        this.numberOfOutputs = 1;
    }
    // Connect - disconnect
    connect(destination, output, input) {
        return destination;
    }
    disconnect(destination, output, input) { }
    // Required for extending EventTarget
    addEventListener() { }
    dispatchEvent(evt) { return false; }
    removeEventListener() { }
}
/* unused harmony export CustomNodeBase */

/**
 * Envelope generator that controls the evolution over time of a destination
 * node's parameter. All parameter control is performed in the corresponding
 * ADSR note handler.
 */
class ADSR extends CustomNodeBase {
    constructor() {
        super(...arguments);
        this.attack = 0.2;
        this.decay = 0.5;
        this.sustain = 0.5;
        this.release = 1;
        this.depth = 1;
        // TODO linear / exponential
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ADSR;

/**
 * Base ScriptProcessor, to derive all custom audio processing nodes from it.
 */
class ScriptProcessor extends CustomNodeBase {
    constructor(ac) {
        super();
        this.gain = 1;
        this.playing = false;
        this.anode = ac.createScriptProcessor(1024);
        this.anode.onaudioprocess = evt => this.processAudio(evt);
    }
    connect(node) {
        return this.anode.connect(node);
    }
    disconnect() {
        this.anode.disconnect();
    }
    start() {
        this.playing = true;
    }
    stop() {
        this.playing = false;
    }
    processAudio(evt) { }
}
/* unused harmony export ScriptProcessor */

/**
 * Simple noise generator
 */
class NoiseGenerator extends ScriptProcessor {
    processAudio(evt) {
        for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
            const out = evt.outputBuffer.getChannelData(channel);
            for (let sample = 0; sample < out.length; sample++)
                out[sample] = this.playing ? this.gain * (Math.random() * 2 - 1) : 0;
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["e"] = NoiseGenerator;

/**
 * Noise generator to be used as control node.
 * It uses sample & hold in order to implement the 'frequency' parameter.
 */
class NoiseCtrlGenerator extends ScriptProcessor {
    constructor(ac) {
        super(ac);
        this.ac = ac;
        this.frequency = 4;
        this.depth = 20;
        this.sct = 0;
        this.v = 0;
    }
    connect(param) {
        return this.anode.connect(param);
    }
    processAudio(evt) {
        const samplesPerCycle = this.ac.sampleRate / this.frequency;
        for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
            let out = evt.outputBuffer.getChannelData(channel);
            for (let sample = 0; sample < out.length; sample++) {
                this.sct++;
                if (this.sct > samplesPerCycle) {
                    this.v = this.depth * (Math.random() * 2 - 1);
                    this.sct = 0; // this.sct - Math.floor(this.sct);
                }
                out[sample] = this.v;
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["d"] = NoiseCtrlGenerator;

/**
 * Simple Pitch Shifter implemented in a quick & dirty way
 */
class Detuner extends ScriptProcessor {
    constructor() {
        super(...arguments);
        this.octave = 0;
        this.numberOfInputs = 1;
    }
    processAudio(evt) {
        const dx = Math.pow(2, this.octave);
        for (let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
            let out = evt.outputBuffer.getChannelData(channel);
            let inbuf = evt.inputBuffer.getChannelData(channel);
            let sct = 0;
            for (let sample = 0; sample < out.length; sample++) {
                out[sample] = inbuf[Math.floor(sct)];
                sct += dx;
                if (sct >= inbuf.length)
                    sct = 0;
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Detuner;

/**
 * Captures audio from the PC audio input.
 * Requires user's authorization to grab audio input.
 */
class LineInNode extends CustomNodeBase {
    connect(anode) {
        if (this.srcNode) {
            this.srcNode.connect(anode);
            this.dstNode = anode;
            return anode;
        }
        const navigator = window.navigator;
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
        navigator.getUserMedia({ audio: true }, (stream) => {
            const ac = anode.context;
            this.srcNode = ac.createMediaStreamSource(stream);
            let a2 = anode;
            if (a2.custom && a2.anode)
                a2 = a2.anode;
            this.srcNode.connect(a2);
            this.dstNode = anode;
            this.stream = stream;
        }, (error) => console.error(error));
    }
    disconnect() {
        this.srcNode.disconnect(this.dstNode);
    }
}
/* harmony export (immutable) */ __webpack_exports__["c"] = LineInNode;



/***/ }),

/***/ 4:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = arrayBufferToBase64;
/* harmony export (immutable) */ __webpack_exports__["b"] = base64ToArrayBuffer;
/* harmony export (immutable) */ __webpack_exports__["c"] = browserSupportsDownload;
/* harmony export (immutable) */ __webpack_exports__["d"] = download;
/* harmony export (immutable) */ __webpack_exports__["f"] = uploadText;
/* harmony export (immutable) */ __webpack_exports__["e"] = uploadArrayBuffer;
// -------------------- Encoding / decoding --------------------
function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
// -------------------- Downloading --------------------
function browserSupportsDownload() {
    return !window.externalHost && 'download' in $('<a>')[0];
}
function download(fileName, fileData) {
    const a = $('<a>');
    a.attr('download', fileName);
    a.attr('href', 'data:application/octet-stream;base64,' + btoa(fileData));
    const clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: false });
    a[0].dispatchEvent(clickEvent);
}
function uploadText(event, cb) {
    upload(event, cb, 'readAsText');
}
function uploadArrayBuffer(event, cb) {
    upload(event, cb, 'readAsArrayBuffer');
}
function upload(event, cb, readFunc) {
    let files = event.target.files;
    if (!files || files.length <= 0)
        return cb('', '');
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (loadEvt) => cb(loadEvt.target.result, file);
    // let func = (<any>reader)[readFunc]
    // func.bind(reader)(file)
    reader[readFunc](file);
}


/***/ }),

/***/ 46:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(47);


/***/ }),

/***/ 47:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synth_instrument__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__synth_timer__ = __webpack_require__(7);
/**
 * Library that exports the Instrument and Voice classes
 */


const global = window;
global.Modulator = global.Modulator || {};
global.Modulator.Instrument = __WEBPACK_IMPORTED_MODULE_0__synth_instrument__["a" /* Instrument */];
global.Modulator.Voice = __WEBPACK_IMPORTED_MODULE_0__synth_instrument__["b" /* Voice */];
global.Modulator.Timer = __WEBPACK_IMPORTED_MODULE_1__synth_timer__["a" /* Timer */];


/***/ }),

/***/ 5:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__notes__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__palette__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_modern__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__customNodes__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_file__ = __webpack_require__(4);





const SEMITONE = Math.pow(2, 1 / 12);
const A4 = 57;
/**
 * Holds all data associated with an AudioNode
 */
class NodeData {
    constructor() {
        // Flag to avoid deleting output node
        this.isOut = false;
    }
    // To be implemented by user code
    getInputs() {
        throw 'Error: getInputs() function should be implemented by user';
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NodeData;

/**
 * Global paramters that apply to the whole monophonic synthesizer.
 */
class Portamento {
    constructor() {
        this.time = 0;
        this.ratio = 0;
    }
}
/* unused harmony export Portamento */

/**
 * Performs global operations on all AudioNodes:
 * - Manages AudioNode creation, initialization and connection
 * - Distributes MIDI keyboard events to NoteHandlers
 */
class Synth {
    constructor(ac) {
        this.customNodes = {};
        this.paramHandlers = {};
        this.noteHandlers = [];
        this.portamento = new Portamento();
        this.ac = ac;
        this.palette = __WEBPACK_IMPORTED_MODULE_1__palette__["a" /* palette */];
        this.registerCustomNode('createADSR', __WEBPACK_IMPORTED_MODULE_3__customNodes__["a" /* ADSR */]);
        this.registerCustomNode('createNoise', __WEBPACK_IMPORTED_MODULE_3__customNodes__["e" /* NoiseGenerator */]);
        this.registerCustomNode('createNoiseCtrl', __WEBPACK_IMPORTED_MODULE_3__customNodes__["d" /* NoiseCtrlGenerator */]);
        this.registerCustomNode('createLineIn', __WEBPACK_IMPORTED_MODULE_3__customNodes__["c" /* LineInNode */]);
        this.registerCustomNode('createDetuner', __WEBPACK_IMPORTED_MODULE_3__customNodes__["b" /* Detuner */]);
        this.registerParamHandler('BufferDataHandler', new BufferDataHandler());
        this.registerParamHandler('SoundBankHandler', new SoundBankHandler());
    }
    createAudioNode(type) {
        const def = __WEBPACK_IMPORTED_MODULE_1__palette__["a" /* palette */][type];
        if (!def)
            return null;
        const factory = def.custom ? this.customNodes : this.ac;
        if (!def.constructor || !factory[def.constructor])
            return null;
        const anode = factory[def.constructor]();
        if (!anode.context)
            anode.context = this.ac;
        this.initNodeParams(anode, def, type);
        return anode;
    }
    initNodeData(ndata, type) {
        ndata.synth = this;
        ndata.type = type;
        let anode = this.createAudioNode(type);
        if (!anode)
            throw new Error(`No AudioNode found for "${type}"`);
        ndata.anode = anode;
        ndata.nodeDef = this.palette[type];
        const nh = ndata.nodeDef.noteHandler;
        if (nh) {
            ndata.noteHandler = new __WEBPACK_IMPORTED_MODULE_0__notes__["a" /* NoteHandlers */][nh](ndata);
            this.addNoteHandler(ndata.noteHandler);
        }
        return anode;
    }
    initOutputNodeData(ndata, dst) {
        ndata.synth = this;
        ndata.type = 'out';
        this.outGainNode = this.ac.createGain();
        ndata.anode = this.outGainNode;
        ndata.anode.connect(dst);
        ndata.nodeDef = this.palette['Speaker'];
        ndata.isOut = true;
        return ndata.anode;
    }
    removeNodeData(data) {
        if (data.noteHandler)
            this.removeNoteHandler(data.noteHandler);
    }
    connectNodes(srcData, dstData) {
        if (srcData.nodeDef.control && !dstData.nodeDef.control) {
            let anode = dstData.anode;
            srcData.controlParams = Object.keys(dstData.nodeDef.params)
                .filter(pname => anode[pname] instanceof AudioParam);
            srcData.controlParam = srcData.controlParams[0];
            srcData.controlTarget = dstData.anode;
            srcData.anode.connect(anode[srcData.controlParam]);
        }
        else
            srcData.anode.connect(dstData.anode);
    }
    disconnectNodes(srcData, dstData) {
        if (srcData.nodeDef.control && !dstData.nodeDef.control) {
            srcData.controlParams = null;
            srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
        }
        else
            srcData.anode.disconnect(dstData.anode);
    }
    json2NodeData(json, data) {
        let anydata = data;
        for (const pname of Object.keys(json.params)) {
            const pvalue = anydata.anode[pname];
            const jv = json.params[pname];
            if (anydata.nodeDef.params[pname].handler)
                this.paramHandlers[anydata.nodeDef.params[pname].handler]
                    .json2param(anydata.anode, jv);
            else if (pvalue instanceof AudioParam) {
                pvalue.value = jv;
                pvalue['_value'] = jv;
            }
            else
                anydata.anode[pname] = jv;
        }
    }
    nodeData2json(data) {
        const params = {};
        for (const pname of Object.keys(data.nodeDef.params)) {
            const pvalue = data.anode[pname];
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
            params,
            controlParam: data.controlParam,
            controlParams: data.controlParams
        };
    }
    midi2freqRatio(midi) {
        return Math.pow(SEMITONE, midi - A4);
    }
    noteOn(midi, gain, when) {
        if (!when)
            when = this.ac.currentTime;
        this.outGainNode.gain.value = gain;
        const ratio = this.midi2freqRatio(midi);
        this.setupNoteHandlers();
        for (const nh of this.noteHandlers)
            nh.noteOn(midi, gain, ratio, when);
        this.portamento.ratio = ratio;
    }
    noteOff(midi, gain, when) {
        if (!when)
            when = this.ac.currentTime;
        for (const nh of this.noteHandlers)
            nh.noteOff(midi, gain, when);
    }
    addNoteHandler(nh) {
        this.noteHandlers.push(nh);
    }
    removeNoteHandler(nh) {
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_modern__["d" /* removeArrayElement */])(this.noteHandlers, nh);
    }
    setupNoteHandlers() {
        let maxRelease = 0;
        for (const nh of this.noteHandlers) {
            if (nh.kbTrigger && nh.releaseTime > maxRelease)
                maxRelease = nh.releaseTime;
        }
        for (const nh of this.noteHandlers) {
            if (!nh.kbTrigger)
                nh.releaseTime = maxRelease;
        }
    }
    initNodeParams(anode, def, type) {
        let anynode = anode;
        for (const param of Object.keys(def.params || {}))
            if (anynode[param] === undefined)
                console.warn(`Parameter '${param}' not found for node '${type}'`);
            else if (anynode[param] instanceof AudioParam)
                anynode[param].value = def.params[param].initial;
            else if (def.params[param].handler) {
                def.params[param].phandler = this.paramHandlers[def.params[param].handler || ''];
                def.params[param].phandler.initialize(anynode, def);
            }
            else
                anynode[param] = def.params[param].initial;
    }
    registerCustomNode(constructorName, nodeClass) {
        this.customNodes[constructorName] = () => new nodeClass(this.ac);
    }
    registerParamHandler(hname, handler) {
        this.paramHandlers[hname] = handler;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Synth;

class BufferDataHandler {
    constructor() {
        this.uiRender = 'renderBufferData';
    }
    initialize(anode, def) { }
    param2json(anode) {
        return __WEBPACK_IMPORTED_MODULE_4__utils_file__["a" /* arrayBufferToBase64 */](anode._encoded);
    }
    json2param(anode, json) {
        const encoded = __WEBPACK_IMPORTED_MODULE_4__utils_file__["b" /* base64ToArrayBuffer */](json);
        anode._encoded = encoded;
        anode.context.decodeAudioData(encoded, buffer => anode._buffer = buffer);
    }
}
class SoundBankHandler {
    constructor() {
        this.uiRender = 'renderSoundBank';
    }
    initialize(anode, def) {
        anode._buffers = [];
        anode._encodedBuffers = [];
        anode._names = [];
    }
    param2json(anode) {
        const files = [];
        const encs = anode._encodedBuffers;
        const names = anode._names;
        for (let i = 0; i < names.length; i++)
            files.push({
                name: names[i],
                data: __WEBPACK_IMPORTED_MODULE_4__utils_file__["a" /* arrayBufferToBase64 */](encs[i])
            });
        return files;
    }
    json2param(anode, json) {
        const bufs = anode._buffers;
        bufs.length = 0;
        const encs = anode._encodedBuffers;
        encs.length = 0;
        const names = anode._names;
        names.length = 0;
        for (let i = 0; i < json.length; i++) {
            const item = json[i];
            names.push(item.name);
            const encoded = __WEBPACK_IMPORTED_MODULE_4__utils_file__["b" /* base64ToArrayBuffer */](item.data);
            encs.push(encoded);
            this.decodeBuffer(anode, encoded, bufs, i);
        }
    }
    decodeBuffer(anode, data, bufs, i) {
        anode.context.decodeAudioData(data, buffer => bufs[i] = buffer);
    }
}


/***/ }),

/***/ 7:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Timer {
    constructor(ac, bpm = 60, ahead = 0.1) {
        this.running = false;
        this.ac = ac;
        this.noteDuration = 0;
        this.nextNoteTime = 0;
        this.bpm = bpm;
        this.ahead = ahead;
    }
    get bpm() { return this._bpm; }
    set bpm(v) {
        this._bpm = v;
        this.nextNoteTime -= this.noteDuration;
        this.noteDuration = (1 / 4) * 60 / this._bpm;
        this.nextNoteTime += this.noteDuration;
    }
    start(cb) {
        if (this.running)
            return;
        this.running = true;
        if (cb)
            this.cb = cb;
        this.nextNoteTime = this.ac.currentTime;
        this.tick();
    }
    stop() {
        this.running = false;
    }
    tick() {
        if (!this.running)
            return;
        requestAnimationFrame(this.tick.bind(this));
        while (this.nextNoteTime < this.ac.currentTime + this.ahead) {
            if (this.cb)
                this.cb(this.nextNoteTime);
            this.nextNoteTime += this.noteDuration;
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Timer;



/***/ }),

/***/ 8:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synth__ = __webpack_require__(5);

/**
 * A polyphonic synth controlling an array of voices
 */
class Instrument {
    constructor(ac, json, numVoices, dest) {
        // Setup voices
        this.pressed = [];
        this.released = [];
        this.voices = [];
        for (let i = 0; i < numVoices; i++) {
            this.voices.push(new Voice(ac, json, dest));
            this.released.push(i);
        }
        // Setup synth params by having a common instance for all voices
        this.portamento = this.voices[0].synth.portamento;
        if (json.keyboard && json.keyboard.portamento)
            this.portamento.time = json.keyboard.portamento;
        for (let i = 1; i < numVoices; i++)
            this.voices[i].synth.portamento = this.portamento;
    }
    noteOn(midi, velocity = 1, when) {
        const vnum = this.findVoice();
        const voice = this.voices[vnum];
        this.pressed.push(vnum);
        voice.noteOn(midi, velocity, when);
    }
    noteOff(midi, velocity = 1, when) {
        for (let i = 0; i < this.voices.length; i++) {
            const voice = this.voices[i];
            if (voice.lastNote == midi) {
                voice.noteOff(midi, velocity, when);
                this.released.push(i);
                break;
            }
        }
    }
    allNotesOff() {
        for (const voice of this.voices) {
            if (voice.lastNote)
                voice.noteOff(voice.lastNote);
        }
    }
    findVoice() {
        let voices;
        if (this.released.length > 0)
            voices = this.released;
        else if (this.pressed.length > 0)
            voices = this.pressed;
        else
            throw 'This should never happen';
        return voices.splice(0, 1)[0];
    }
    close() {
        for (const voice of this.voices)
            voice.close();
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Instrument;

/**
 * An independent monophonic synth
 */
class Voice {
    constructor(ac, json, dest) {
        this.nodes = {};
        this.loader = new SynthLoader();
        this.synth = this.loader.load(ac, json, dest || ac.destination, this.nodes);
        this.lastNote = 0;
    }
    noteOn(midi, velocity = 1, when) {
        this.synth.noteOn(midi, velocity, when);
        this.lastNote = midi;
    }
    noteOff(midi, velocity = 1, when) {
        this.synth.noteOff(midi, velocity, when);
        this.lastNote = 0;
    }
    getParameterNode(nname, pname) {
        let n = this.nodes[nname];
        if (!n)
            throw new Error(`Node "${nname}" not found`);
        let prm = n[pname];
        if (!prm)
            throw new Error(`Parameter "${pname}" not found in node "${nname}"`);
        return prm;
    }
    close() {
        // This method must be called to avoid memory leaks at the Web Audio level
        if (this.lastNote)
            this.noteOff(this.lastNote, 1);
        this.loader.close();
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Voice;

// -------------------- Private --------------------
class VoiceNodeData extends __WEBPACK_IMPORTED_MODULE_0__synth__["a" /* NodeData */] {
    constructor(id) {
        super();
        this.id = id;
        this.inputs = [];
    }
    getInputs() {
        return this.inputs;
    }
}
class SynthLoader {
    constructor() {
        this.nodes = [];
    }
    load(ac, json, dest, nodes) {
        const synth = new __WEBPACK_IMPORTED_MODULE_0__synth__["b" /* Synth */](ac);
        // Add nodes into id-based table
        let j = 0;
        for (const jn of json.nodes)
            this.nodes[j++] = new VoiceNodeData(jn.id);
        // Then set their list of inputs
        for (let i = 0; i < json.nodes.length; i++)
            for (const inum of json.nodes[i].inputs) {
                let input = this.nodeById(inum);
                if (input)
                    this.nodes[i].inputs.push(input);
            }
        // Then set their data
        for (let i = 0; i < json.nodes.length; i++) {
            const type = json.nodeData[i].type;
            let anode;
            if (type == 'out')
                anode = synth.initOutputNodeData(this.nodes[i], dest);
            else
                anode = synth.initNodeData(this.nodes[i], type);
            synth.json2NodeData(json.nodeData[i], this.nodes[i]);
            this.registerNode(anode, nodes, json.nodes[i].name);
        }
        // Then notify connections to handler
        for (const dst of this.nodes)
            for (const src of dst.inputs)
                synth.connectNodes(src, dst);
        // Finally, return the newly created synth
        this.synth = synth;
        return synth;
    }
    nodeById(id) {
        for (const node of this.nodes)
            if (node.id === id)
                return node;
        return null;
    }
    registerNode(anode, nodes, name) {
        nodes[name] = anode;
    }
    close() {
        for (const node of this.nodes)
            for (const input of node.inputs)
                this.synth.disconnectNodes(input, node);
    }
}


/***/ }),

/***/ 9:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_modern__ = __webpack_require__(1);

/**
 * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
 */
class BaseNoteHandler {
    constructor(ndata) {
        this.kbTrigger = false;
        this.releaseTime = 0;
        this.ndata = ndata;
        this.outTracker = new OutputTracker(ndata.anode);
    }
    noteOn(midi, gain, ratio, when) { }
    noteOff(midi, gain, when) { }
    clone() {
        // Create clone
        let ctor = this.ndata.nodeDef.constructor;
        if (!ctor)
            return null;
        const anode = this.ndata.anode.context[ctor]();
        // Copy parameters
        for (const pname of Object.keys(this.ndata.nodeDef.params)) {
            const param = this.ndata.anode[pname];
            if (param instanceof AudioParam)
                anode[pname].value = param.value;
            else if (param !== null && param !== undefined)
                anode[pname] = param;
        }
        // Copy output connections
        for (const out of this.outTracker.outputs) {
            let o2 = out;
            if (o2.custom && o2.anode)
                o2 = o2.anode;
            anode.connect(o2);
        }
        // Copy control input connections
        for (const inData of this.ndata.getInputs()) {
            inData.anode.connect(anode[inData.controlParam]);
        }
        // TODO should copy snapshot of list of inputs and outputs
        // ...in case user connects or disconnects during playback
        return anode;
    }
    disconnect(anode) {
        // Disconnect outputs
        for (const out of this.outTracker.outputs)
            anode.disconnect(out);
        // Disconnect control inputs
        for (const inData of this.ndata.getInputs()) {
            inData.anode.disconnect(anode[inData.controlParam]);
        }
    }
    rampParam(param, ratio, when) {
        const portamento = this.ndata.synth.portamento;
        const newv = param.value * ratio;
        param._value = newv; // Required for ADSR to capture the correct value
        if (portamento.time > 0 && portamento.ratio > 0) {
            const oldv = param.value * portamento.ratio;
            param.cancelScheduledValues(when);
            param.linearRampToValueAtTime(oldv, when);
            param.exponentialRampToValueAtTime(newv, when + portamento.time);
        }
        else
            param.setValueAtTime(newv, when);
    }
}
/* unused harmony export BaseNoteHandler */

/**
 * Handles note events for an OscillatorNode
 */
class OscNoteHandler extends BaseNoteHandler {
    noteOn(midi, gain, ratio, when) {
        if (this.oscClone)
            this.oscClone.stop(when);
        this.oscClone = this.clone();
        this.rampParam(this.oscClone.frequency, ratio, when);
        this.oscClone.start(when);
        this.lastNote = midi;
    }
    noteOff(midi, gain, when) {
        if (midi != this.lastNote)
            return; // Avoid multple keys artifacts in mono mode
        this.oscClone.stop(when + this.releaseTime);
    }
}
/* unused harmony export OscNoteHandler */

/**
 * Handles note events for an LFO node. This is identical to a regular
 * oscillator node, but the note does not affect the oscillator frequency
 */
class LFONoteHandler extends OscNoteHandler {
    rampParam(param, ratio, when) {
        // Disable portamento for LFO
        param.setValueAtTime(param.value, when);
    }
}
/* unused harmony export LFONoteHandler */

/**
 * Handles note events for an AudioBufferSourceNode
 */
class BufferNoteHandler extends BaseNoteHandler {
    noteOn(midi, gain, ratio, when) {
        if (this.absn)
            this.absn.stop(when);
        const buf = this.ndata.anode._buffer;
        if (!buf)
            return; // Buffer still loading or failed
        this.absn = this.clone();
        this.absn.buffer = buf;
        const pbr = this.absn.playbackRate;
        const newRate = pbr.value * ratio;
        this.rampParam(pbr, pbr.value * ratio, when);
        this.absn.start(when);
        this.lastNote = midi;
    }
    noteOff(midi, gain, when) {
        if (midi != this.lastNote)
            return;
        this.absn.stop(when + this.releaseTime);
    }
}
/* unused harmony export BufferNoteHandler */

/**
 * Performs computations about ramps so they can be easily rescheduled
 */
class Ramp {
    constructor(v1, v2, t1, t2) {
        this.v1 = v1;
        this.v2 = v2;
        this.t1 = t1;
        this.t2 = t2;
    }
    inside(t) {
        return this.t1 < this.t2 && this.t1 <= t && t <= this.t2;
    }
    cut(t) {
        const newv = this.v1 + (this.v2 - this.v1) * (t - this.t1) / (this.t2 - this.t1);
        return new Ramp(this.v1, newv, this.t1, t);
    }
    run(p, follow = false) {
        if (this.t2 - this.t1 <= 0) {
            p.setValueAtTime(this.v2, this.t2);
        }
        else {
            if (!follow)
                p.setValueAtTime(this.v1, this.t1);
            p.linearRampToValueAtTime(this.v2, this.t2);
        }
    }
}
/* unused harmony export Ramp */

/**
 * Handles note events for a custom ADSR node
 */
class ADSRNoteHandler extends BaseNoteHandler {
    constructor(ndata) {
        super(ndata);
        this.kbTrigger = true;
        const adsr = this.getADSR();
        const oldMethod = adsr.disconnect;
        adsr.disconnect = (dest) => {
            this.loopParams(param => {
                if (param == dest)
                    param.setValueAtTime(param._value, adsr.context.currentTime);
            });
            oldMethod(dest);
        };
    }
    getADSR() {
        let anode = this.ndata.anode;
        return anode;
    }
    get releaseTime() {
        const adsr = this.getADSR();
        return adsr.release;
    }
    set releaseTime(relTime) { }
    noteOn(midi, gain, ratio, when) {
        this.lastNote = midi;
        const adsr = this.getADSR();
        this.loopParams(param => {
            const v = this.getParamValue(param);
            const initial = (1 - adsr.depth) * v;
            const sustain = v * adsr.sustain + initial * (1 - adsr.sustain);
            const now = adsr.context.currentTime;
            param.cancelScheduledValues(now);
            if (when > now)
                this.rescheduleRamp(param, param._release, now);
            param._attack = new Ramp(initial, v, when, when + adsr.attack);
            param._decay = new Ramp(v, sustain, when + adsr.attack, when + adsr.attack + adsr.decay);
            param._attack.run(param);
            param._decay.run(param, true);
        });
    }
    noteOff(midi, gain, when) {
        if (midi != this.lastNote)
            return; // Avoid multple keys artifacts in mono mode
        const adsr = this.getADSR();
        this.loopParams(param => {
            let v = this.getRampValueAtTime(param, when);
            if (v === null)
                v = this.getParamValue(param) * adsr.sustain;
            const finalv = (1 - adsr.depth) * v;
            param.cancelScheduledValues(when);
            const now = adsr.context.currentTime;
            if (when > now)
                // tslint:disable-next-line:no-unused-expression
                this.rescheduleRamp(param, param._attack, now) ||
                    this.rescheduleRamp(param, param._decay, now);
            param._release = new Ramp(v, finalv, when, when + adsr.release);
            param._release.run(param);
        });
    }
    rescheduleRamp(param, ramp, now) {
        if (ramp && ramp.inside(now)) {
            ramp.cut(now).run(param);
            return true;
        }
        return false;
    }
    getRampValueAtTime(param, t) {
        let ramp;
        if (param._attack && param._attack.inside(t))
            return param._attack.cut(t).v2;
        if (param._decay && param._decay.inside(t))
            return param._decay.cut(t).v2;
        return null;
    }
    loopParams(cb) {
        for (const out of this.outTracker.outputs)
            if (out instanceof AudioParam)
                cb(out);
    }
    getParamValue(p) {
        if (p._value === undefined)
            p._value = p.value;
        return p._value;
    }
}
/* unused harmony export ADSRNoteHandler */

/**
 * Handles note events for any node that allows calling start() after stop(),
 * such as custom nodes.
 */
class RestartableNoteHandler extends BaseNoteHandler {
    constructor() {
        super(...arguments);
        this.playing = false;
    }
    noteOn(midi, gain, ratio, when) {
        const anode = this.ndata.anode;
        if (this.playing)
            anode.stop(when);
        this.playing = true;
        anode.start(when);
        this.lastNote = midi;
    }
    noteOff(midi, gain, when) {
        if (midi != this.lastNote)
            return;
        this.playing = false;
        const anode = this.ndata.anode;
        anode.stop(when + this.releaseTime);
    }
}
/* unused harmony export RestartableNoteHandler */

/**
 * Handles note events for the SoundBank source node
 */
class SoundBankNoteHandler extends BaseNoteHandler {
    noteOn(midi, gain, ratio, when) {
        const bufs = this.ndata.anode['_buffers'];
        const absn = this.clone();
        absn.buffer = bufs[midi % bufs.length];
        absn.start(when);
    }
    noteOff(midi, gain, when) { }
}
/* unused harmony export SoundBankNoteHandler */

// -------------------- Exported note handlers --------------------
/**
 * Exports available note handlers so they are used by their respective
 * nodes from the palette.
 */
const NoteHandlers = {
    'osc': OscNoteHandler,
    'buffer': BufferNoteHandler,
    'ADSR': ADSRNoteHandler,
    'LFO': LFONoteHandler,
    'restartable': RestartableNoteHandler,
    'soundBank': SoundBankNoteHandler
};
/* harmony export (immutable) */ __webpack_exports__["a"] = NoteHandlers;

// -------------------- Private classes --------------------
/**
 * Tracks a node output connections and disconnections, to be used
 * when cloning, removing or controlling nodes.
 */
class OutputTracker {
    constructor(anode) {
        this.outputs = [];
        this.onBefore(anode, 'connect', this.connect, (oldf, obj, args) => {
            if (args[0].custom && args[0].anode)
                args[0] = args[0].anode;
            oldf.apply(obj, args);
        });
        this.onBefore(anode, 'disconnect', this.disconnect);
    }
    connect(np) {
        this.outputs.push(np);
    }
    disconnect(np) {
        Object(__WEBPACK_IMPORTED_MODULE_0__utils_modern__["d" /* removeArrayElement */])(this.outputs, np);
    }
    onBefore(obj, fname, funcToCall, cb) {
        const oldf = obj[fname];
        const self = this;
        obj[fname] = function () {
            funcToCall.apply(self, arguments);
            if (cb)
                cb(oldf, obj, arguments);
            else
                oldf.apply(obj, arguments);
        };
    }
}
/* unused harmony export OutputTracker */



/***/ })

/******/ });
//# sourceMappingURL=synthlib.js.map