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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
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
    reader[readFunc](file);
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__notes__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__palette__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_modern__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__customNodes__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_file__ = __webpack_require__(1);





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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isOpen; });
/* harmony export (immutable) */ __webpack_exports__["g"] = setOpen;
/* harmony export (immutable) */ __webpack_exports__["a"] = alert;
/* harmony export (immutable) */ __webpack_exports__["e"] = progress;
/* harmony export (immutable) */ __webpack_exports__["b"] = close;
/* harmony export (immutable) */ __webpack_exports__["c"] = confirm;
/* harmony export (immutable) */ __webpack_exports__["f"] = prompt;
/** Informs whether a popup is open or not */
let isOpen = false;
function setOpen(open) {
    isOpen = open;
}
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
    isOpen = true;
    popup.one('hidden.bs.modal', _ => isOpen = false);
    popup.modal(options);
}
/** Like an alert, but without a close button */
function progress(msg, title) {
    alert(msg, title, true, { keyboard: false });
}
/** Closes a popup in case it is open */
function close() {
    if (!isOpen)
        return;
    popup.find('.popup-ok').click();
}
/** Bootstrap-based equivalent of standard confirm function */
function confirm(msg, title, cbClose, cbOpen) {
    let result = false;
    popup.find('.popup-message').html(msg);
    popup.find('.modal-title').text(title || 'Please confirm');
    const okButton = popup.find('.popup-ok');
    okButton.show().click(_ => result = true);
    popup.find('.popup-prompt > input').hide();
    popup.find('.popup-close').text('Cancel');
    popup.one('shown.bs.modal', _ => {
        okButton.focus();
        if (cbOpen)
            cbOpen();
    });
    popup.find('form').one('submit', _ => {
        result = true;
        okButton.click();
        return false;
    });
    popup.one('hide.bs.modal', _ => {
        okButton.off('click');
        isOpen = false;
        cbClose(result);
    });
    isOpen = true;
    popup.modal();
}
/** Bootstrap-based equivalent of standard prompt function */
function prompt(msg, title, initialValue, cb) {
    const input = popup.find('.popup-prompt > input');
    confirm(msg, title, confirmed => {
        if (!cb)
            return;
        if (!confirmed)
            cb(null);
        else
            cb(input.val());
    }, () => {
        input.show();
        input.focus();
        if (initialValue) {
            input.val(initialValue);
            const hinput = input[0];
            hinput.select();
        }
        else
            input.val('');
    });
}
const popup = $(`
	<div class="normal-font modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<h4 class="modal-title" id="myModalLabel"></h4>
		</div>
		<div class="modal-body">
			<div class="popup-message"></div>
			<form class="popup-prompt">
				<input type="text" style="width: 100%">
			</form>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-default popup-close" data-dismiss="modal"></button>
			<button type="button" class="btn btn-primary popup-ok" data-dismiss="modal">OK</button>
		</div>
		</div>
	</div>
	</div>
`);
$('body').append(popup);


/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synth__ = __webpack_require__(2);

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
            throw new Error(`Node "${nname}" not found in synth`);
        return n[pname];
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
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_modern__ = __webpack_require__(0);

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



/***/ }),
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(10);


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synthUI_synthUI__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__piano_noteInputs__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__synthUI_presets__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__live_coding_editor__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_routes__ = __webpack_require__(27);
/**
 * Main entry point: setup synth editor and keyboard listener.
 */





const graphCanvas = $('#graph-canvas')[0];
const ac = createAudioContext();
const synthUI = new __WEBPACK_IMPORTED_MODULE_0__synthUI_synthUI__["a" /* SynthUI */](ac, graphCanvas, $('#node-params'), $('#audio-graph-fft'), $('#audio-graph-osc'));
const presets = setupPanels();
function createAudioContext() {
    const CtxClass = window.AudioContext || window.webkitAudioContext;
    return new CtxClass();
}
function setupPanels() {
    setupPalette();
    const inputs = new __WEBPACK_IMPORTED_MODULE_1__piano_noteInputs__["a" /* NoteInputs */](synthUI);
    const prsts = new __WEBPACK_IMPORTED_MODULE_2__synthUI_presets__["a" /* Presets */](synthUI);
    prsts.beforeSave = (json) => $.extend(json, { keyboard: inputs.piano.toJSON() });
    prsts.afterLoad = (json) => inputs.piano.fromJSON(json.keyboard);
    $(function () {
        $('#synth').focus();
    });
    Object(__WEBPACK_IMPORTED_MODULE_4__utils_routes__["a" /* setupRoutes */])('#synth').then(_ => Object(__WEBPACK_IMPORTED_MODULE_3__live_coding_editor__["a" /* createEditor */])(ac, prsts, synthUI));
    return prsts.presets;
}
function setupPalette() {
    $(function () {
        let nano = $('.nano');
        nano.nanoScroller({ preventPageScrolling: true });
    });
}


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__graph__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__synth_synth__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_modern__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_popups__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__paramsUI__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__analyzer__ = __webpack_require__(14);




/**
 * Customizes the generic graph editor in order to manipulate and control
 * a graph of AudioNodes
 */
class SynthUI {
    constructor(ac, graphCanvas, jqParams, jqFFT, jqOsc) {
        this.gr = new __WEBPACK_IMPORTED_MODULE_0__graph__["a" /* Graph */](graphCanvas);
        this.gr.handler = new SynthGraphHandler(this, jqParams, jqFFT, jqOsc);
        this.synth = new __WEBPACK_IMPORTED_MODULE_1__synth_synth__["b" /* Synth */](ac);
        this.registerPaletteHandler();
        this.addOutputNode();
    }
    addOutputNode() {
        // TODO avoid using hardcoded position
        const out = new __WEBPACK_IMPORTED_MODULE_0__graph__["b" /* Node */](500, 210, 'Out');
        out.data = new GraphNodeData(out);
        this.synth.initOutputNodeData(out.data, this.synth.ac.destination);
        this.outNode = out.data.anode;
        this.gr.addNode(out, 'node-out');
        this.initNodeDimensions(out);
    }
    registerPaletteHandler() {
        let self = this; // JQuery sets 'this' in event handlers
        $('.palette .node').click(function (evt) {
            let elem = $(this);
            let classAttr = elem.attr('class') || '';
            let classes = classAttr.split(/\s+/).filter(c => c != 'node');
            let type = elem.attr('data-type');
            if (!type)
                return;
            self.addNode(type, elem.find('.node-text').html(), classes.join(' '));
        });
    }
    addNode(type, text, classes) {
        let { x, y } = this.findFreeSpot();
        const n = new __WEBPACK_IMPORTED_MODULE_0__graph__["b" /* Node */](x, y, text);
        this.createNodeData(n, type);
        this.gr.addNode(n, classes);
        this.gr.selectNode(n);
    }
    removeNode(n) {
        this.gr.removeNode(n);
    }
    removeNodeData(data) {
        this.synth.removeNodeData(data);
    }
    createNodeData(n, type) {
        n.data = new GraphNodeData(n);
        if (type == 'out') {
            this.synth.initOutputNodeData(n.data, this.synth.ac.destination);
            this.outNode = n.data.anode;
        }
        else
            this.synth.initNodeData(n.data, type);
    }
    // ----- Rest of methods are used to find a free spot in the canvas -----
    findFreeSpot() {
        let maxDist = 0;
        const canvasW = this.gr.canvas.width;
        const canvasH = this.gr.canvas.height;
        let x = canvasW / 2;
        let y = canvasH / 2;
        for (let xx = 10; xx < canvasW - this.nw; xx += 10) {
            for (let yy = 10; yy < canvasH - this.nh; yy += 10) {
                const dist = this.dist2nearestNode(xx, yy);
                if (dist > maxDist && dist < this.nw * 3) {
                    x = xx;
                    y = yy;
                    maxDist = dist;
                }
            }
        }
        return { x, y };
    }
    dist2nearestNode(x, y) {
        let minDist = Number.MAX_VALUE;
        for (const n of this.gr.nodes) {
            const dx = x - n.x;
            const dy = y - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist)
                minDist = dist;
        }
        return minDist;
    }
    initNodeDimensions(n) {
        this.nw = n.element.outerWidth() || 0;
        this.nh = n.element.outerHeight() || 0;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SynthUI;



class GraphNodeData extends __WEBPACK_IMPORTED_MODULE_1__synth_synth__["a" /* NodeData */] {
    constructor(node) {
        super();
        this.node = node;
    }
    getInputs() {
        const result = [];
        for (const nin of this.node.inputs)
            result.push(nin.data);
        return result;
    }
}
class SynthGraphHandler {
    constructor(synthUI, jqParams, jqFFT, jqOsc) {
        this.synthUI = synthUI;
        this.jqParams = jqParams;
        this.arrowColor = getCssFromClass('arrow', 'color');
        this.ctrlArrowColor = getCssFromClass('arrow-ctrl', 'color');
        this.registerNodeDelete(jqParams.parent()[0]);
        this.analyzer = new __WEBPACK_IMPORTED_MODULE_5__analyzer__["a" /* AudioAnalyzer */](jqFFT, jqOsc);
    }
    registerNodeDelete(elem) {
        $(Object(__WEBPACK_IMPORTED_MODULE_2__utils_modern__["a" /* focusable */])(elem)).keydown((evt) => {
            if (!(evt.keyCode == 46 || (evt.keyCode == 8 && evt.metaKey)))
                return;
            if (__WEBPACK_IMPORTED_MODULE_3__utils_popups__["d" /* isOpen */])
                return;
            const selectedNode = this.getSelectedNode();
            if (!selectedNode)
                return;
            if (selectedNode.data.isOut)
                return;
            __WEBPACK_IMPORTED_MODULE_3__utils_popups__["c" /* confirm */]('Delete node?', 'Please confirm node deletion', confirmed => {
                if (!confirmed)
                    return;
                this.synthUI.removeNode(selectedNode);
                this.jqParams.empty();
            });
        });
    }
    getSelectedNode() {
        for (const node of this.synthUI.gr.nodes)
            if (node.element.hasClass('selected'))
                return node;
        return null;
    }
    hasAudioParams(ndata) {
        const aparams = Object.keys(ndata.nodeDef.params)
            .filter(pname => ndata.anode[pname] instanceof AudioParam);
        return aparams.length > 0;
    }
    // --------------- Implementation of the GraphHandler interface ---------------
    canBeSource(n) {
        const data = n.data;
        return data.anode != this.synthUI.outNode;
    }
    canConnect(src, dst) {
        const srcData = src.data;
        const dstData = dst.data;
        if (srcData.nodeDef.control)
            return this.hasAudioParams(dstData);
        return dstData.anode.numberOfInputs > 0;
    }
    connected(src, dst) {
        this.synthUI.synth.connectNodes(src.data, dst.data);
        // TODO update paramsUI in case selected node is src
    }
    disconnected(src, dst) {
        this.synthUI.synth.disconnectNodes(src.data, dst.data);
    }
    nodeSelected(n) {
        const data = n.data;
        Object(__WEBPACK_IMPORTED_MODULE_4__paramsUI__["a" /* renderParams */])(data, this.jqParams);
    }
    nodeRemoved(n) {
        this.synthUI.removeNodeData(n.data);
    }
    getArrowColor(src, dst) {
        const srcData = src.data;
        return srcData.nodeDef.control ? this.ctrlArrowColor : this.arrowColor;
    }
    data2json(n) {
        return this.synthUI.synth.nodeData2json(n.data);
    }
    json2data(n, json) {
        this.synthUI.createNodeData(n, json.type);
        this.synthUI.synth.json2NodeData(json, n.data);
    }
    graphLoaded() {
        this.analyzer.analyze(this.synthUI.outNode);
    }
    graphSaved() { }
}
function getCssFromClass(className, propName) {
    const tmp = $('<div>').addClass(className);
    $('body').append(tmp);
    const propValue = tmp.css(propName);
    tmp.remove();
    return propValue;
}


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const SHIFT_KEY = 16;
const CAPS_LOCK = 20;
/**
 * A generic directed graph editor.
 */
class Graph {
    constructor(canvas) {
        this.nodes = [];
        this.lastId = 0;
        if (!canvas.parentElement)
            return;
        this.nodeCanvas = $(canvas.parentElement);
        this.canvas = canvas;
        const gc = canvas.getContext('2d');
        if (!gc)
            return;
        this.graphDraw = new GraphDraw(this, gc, canvas);
        this.graphInteract = new GraphInteraction(this, gc);
        this.handler = new DefaultGraphHandler();
    }
    addNode(n, classes) {
        n.id = this.lastId++;
        n.element = $('<div>')
            .addClass('node')
            .html(`<div class="node-text">${n.name}</div>`)
            .css({ left: n.x, top: n.y, cursor: 'default' });
        if (classes)
            n.element.addClass(classes);
        this.nodeCanvas.append(n.element);
        this.nodes.push(n);
        this.graphInteract.registerNode(n);
        this.draw();
    }
    removeNode(n) {
        const pos = this.nodes.indexOf(n);
        if (pos < 0)
            return console.warn(`Node '${n.name}' is not a member of graph`);
        for (const nn of this.nodes) {
            if (n == nn)
                continue;
            this.disconnect(n, nn);
            this.disconnect(nn, n);
        }
        this.nodes.splice(pos, 1);
        n.element.remove();
        this.handler.nodeRemoved(n);
        this.draw();
    }
    selectNode(n) {
        this.graphInteract.selectNode(n);
    }
    connect(srcn, dstn) {
        if (!this.handler.canBeSource(srcn) || !this.handler.canConnect(srcn, dstn))
            return false;
        dstn.addInput(srcn);
        this.handler.connected(srcn, dstn);
        return true;
    }
    disconnect(srcn, dstn) {
        if (!dstn.removeInput(srcn))
            return false;
        this.handler.disconnected(srcn, dstn);
        return true;
    }
    draw() {
        this.graphDraw.draw();
    }
    toJSON() {
        const jsonNodes = [];
        const jsonNodeData = [];
        for (const node of this.nodes) {
            const nodeInputs = [];
            for (const nin of node.inputs)
                nodeInputs.push(nin.id);
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
        const jsonGraph = {
            nodes: jsonNodes,
            nodeData: jsonNodeData
        };
        this.handler.graphSaved();
        return jsonGraph;
    }
    fromJSON(json) {
        // First, remove existing nodes
        while (this.nodes.length > 0)
            this.removeNode(this.nodes[0]);
        this.lastId = 0;
        // Then add nodes
        for (const jn of json.nodes) {
            const node = new Node(jn.x, jn.y, jn.name);
            this.addNode(node);
            node.id = jn.id; // Override id after being initialized inside addNode
            node.element.attr('class', jn.classes);
        }
        // Then connect them
        const gh = this.handler;
        this.handler = new DefaultGraphHandler(); // Disable graph handler
        for (let i = 0; i < json.nodes.length; i++) {
            for (const inum of json.nodes[i].inputs) {
                const src = this.nodeById(inum);
                if (src)
                    this.connect(src, this.nodes[i]);
            }
        }
        this.handler = gh; // Restore graph handler
        // Then set their data
        for (let i = 0; i < json.nodes.length; i++) {
            this.handler.json2data(this.nodes[i], json.nodeData[i]);
        }
        // Then notify connections to handler
        for (const dst of this.nodes)
            for (const src of dst.inputs)
                this.handler.connected(src, dst);
        // And finally, draw the new graph
        this.draw();
        this.handler.graphLoaded();
    }
    nodeById(id) {
        for (const node of this.nodes)
            if (node.id === id)
                return node;
        return null;
    }
    getAppClasses(n) {
        const classes = n.element[0].className.split(/\s+/);
        const result = [];
        for (const cname of classes) {
            if (cname == 'selected')
                continue;
            if (cname.substr(0, 3) == 'ui-')
                continue;
            result.push(cname);
        }
        return result.join(' ');
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Graph;

/**
 * A node in the graph. Application-specific data can be attached
 * to its data property.
 */
class Node {
    constructor(x, y, name) {
        this.inputs = [];
        this.x = x;
        this.y = y;
        this.name = name.replace(/<[^<]*>/g, t => t == '<br>' ? t : '');
    }
    addInput(n) {
        this.inputs.push(n);
    }
    removeInput(n) {
        const pos = this.inputs.indexOf(n);
        if (pos < 0)
            return false;
        this.inputs.splice(pos, 1);
        return true;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Node;

// ------------------------- Privates -------------------------
/** Default, do-nothing GraphHandler implementation */
class DefaultGraphHandler {
    canBeSource(n) { return true; }
    canConnect(src, dst) { return true; }
    connected(src, dst) { }
    disconnected(src, dst) { }
    nodeSelected(n) { }
    nodeRemoved(n) { }
    getArrowColor(src, dst) { return 'black'; }
    data2json(n) { return {}; }
    json2data(n, json) { }
    graphLoaded() { }
    graphSaved() { }
}
/**
 * Handles all UI interaction with graph in order to move, select, connect
 * and disconnect nodes.
 */
class GraphInteraction {
    constructor(graph, gc) {
        this.dragging = false;
        this.graph = graph;
        this.gc = gc;
        this.setupConnectHandler(gc.canvas);
    }
    registerNode(n) {
        n.element.draggable({
            containment: 'parent',
            distance: 5,
            stack: '.node',
            drag: (event, ui) => {
                n.x = ui.position.left;
                n.y = ui.position.top;
                this.graph.draw();
            },
            start: (event, ui) => {
                this.dragging = true;
                ui.helper.css('cursor', 'move');
            },
            stop: (event, ui) => {
                ui.helper.css('cursor', 'default');
                this.dragging = false;
            }
        });
        n.element.click(_ => {
            if (this.dragging)
                return;
            if (this.selectedNode == n)
                return;
            this.selectNode(n);
        });
    }
    selectNode(n) {
        if (this.selectedNode)
            this.selectedNode.element.removeClass('selected');
        n.element.addClass('selected');
        this.selectedNode = n;
        this.graph.handler.nodeSelected(n);
    }
    setupConnectHandler(elem) {
        if (!elem)
            return;
        let srcn;
        let connecting = false;
        while (elem != null && elem.tabIndex < 0
            && elem.nodeName.toLowerCase() != 'body')
            elem = elem.parentElement;
        if (!elem)
            return;
        $(elem).keydown(evt => {
            if (evt.keyCode == CAPS_LOCK)
                return this.setGrid([20, 20]);
            if (evt.keyCode != SHIFT_KEY || connecting)
                return;
            srcn = this.getNodeFromDOM(this.getElementUnderMouse());
            if (!srcn)
                return;
            if (!this.graph.handler.canBeSource(srcn)) {
                srcn.element.css('cursor', 'not-allowed');
                return;
            }
            connecting = true;
            this.registerRubberBanding(srcn);
        })
            .keyup(evt => {
            if (evt.keyCode == CAPS_LOCK)
                return this.setGrid(null);
            if (evt.keyCode != SHIFT_KEY)
                return;
            connecting = false;
            this.deregisterRubberBanding();
            const dstn = this.getNodeFromDOM(this.getElementUnderMouse());
            if (!dstn || srcn == dstn)
                return;
            if (srcn)
                this.connectOrDisconnect(srcn, dstn);
            this.graph.draw();
        });
    }
    setGrid(grid) {
        $(this.graph.nodeCanvas).find('.node').draggable('option', 'grid', grid);
    }
    connectOrDisconnect(srcn, dstn) {
        if (this.graph.disconnect(srcn, dstn))
            return;
        else
            this.graph.connect(srcn, dstn);
    }
    getElementUnderMouse() {
        const hovered = $(':hover');
        if (hovered.length <= 0)
            return null;
        const jqNode = $(hovered.get(hovered.length - 1));
        if (jqNode.hasClass('node'))
            return jqNode;
        if (jqNode.parent().hasClass('node'))
            return jqNode.parent();
        return null;
    }
    registerRubberBanding(srcn) {
        const ofs = this.graph.nodeCanvas.offset();
        if (!ofs)
            return;
        const dstn = new Node(0, 0, '');
        dstn.w = 0;
        dstn.h = 0;
        $(this.graph.nodeCanvas).on('mousemove', evt => {
            if (!evt)
                return;
            let cltx = evt.clientX || 0;
            let clty = evt.clientY || 0;
            dstn.x = cltx - ofs.left;
            dstn.y = clty - ofs.top + ($('body').scrollTop() || 0);
            this.graph.draw();
            this.gc.save();
            this.gc.setLineDash([10]);
            this.graph.graphDraw.drawArrow(srcn, dstn);
            this.gc.restore();
        });
        // Setup cursors
        this.graph.nodeCanvas.css('cursor', 'crosshair');
        this.graph.nodeCanvas.find('.node').css('cursor', 'crosshair');
        for (const n of this.graph.nodes)
            if (n != srcn && !this.graph.handler.canConnect(srcn, n))
                n.element.css('cursor', 'not-allowed');
    }
    deregisterRubberBanding() {
        this.graph.nodeCanvas.css('cursor', '');
        this.graph.nodeCanvas.find('.node').css('cursor', 'default');
        this.graph.nodeCanvas.off('mousemove');
        this.graph.graphDraw.draw();
    }
    getNodeFromDOM(jqNode) {
        if (!jqNode)
            return null;
        for (const n of this.graph.nodes)
            if (n.element[0] == jqNode[0])
                return n;
        return null;
    }
}
/* unused harmony export GraphInteraction */

/**
 * Handles graph drawing by rendering arrows in a canvas.
 */
class GraphDraw {
    constructor(graph, gc, canvas) {
        this.arrowHeadLen = 10;
        this.graph = graph;
        this.gc = gc;
        this.canvas = canvas;
        this.nodes = graph.nodes;
    }
    draw() {
        this.clearCanvas();
        this.gc.lineWidth = 2;
        for (const ndst of this.nodes)
            for (const nsrc of ndst.inputs)
                this.drawArrow(nsrc, ndst);
    }
    clearCanvas() {
        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawArrow(srcNode, dstNode) {
        const srcPoint = this.getNodeCenter(srcNode);
        const dstPoint = this.getNodeCenter(dstNode);
        this.gc.strokeStyle = this.graph.handler.getArrowColor(srcNode, dstNode);
        this.gc.beginPath();
        this.gc.moveTo(srcPoint.x, srcPoint.y);
        this.gc.lineTo(dstPoint.x, dstPoint.y);
        this.drawArrowTip(srcPoint, dstPoint);
        this.gc.closePath();
        this.gc.stroke();
    }
    drawArrowTip(src, dst) {
        const posCoef = 0.6;
        const mx = src.x + (dst.x - src.x) * posCoef;
        const my = src.y + (dst.y - src.y) * posCoef;
        let angle = Math.atan2(dst.y - src.y, dst.x - src.x);
        this.gc.moveTo(mx, my);
        this.gc.lineTo(mx - this.arrowHeadLen * Math.cos(angle - Math.PI / 6), my - this.arrowHeadLen * Math.sin(angle - Math.PI / 6));
        this.gc.moveTo(mx, my);
        this.gc.lineTo(mx - this.arrowHeadLen * Math.cos(angle + Math.PI / 6), my - this.arrowHeadLen * Math.sin(angle + Math.PI / 6));
    }
    getNodeCenter(n) {
        n.w = n.w !== undefined ? n.w : n.element.outerWidth() || 0;
        n.h = n.h !== undefined ? n.h : n.element.outerHeight() || 0;
        return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
    }
}
/* unused harmony export GraphDraw */



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = renderParams;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_modern__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_file__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_popups__ = __webpack_require__(3);



/**
 * Renders the UI controls associated with the parameters of a given node
 */
function renderParams(ndata, panel) {
    panel.empty();
    const boxes = [];
    if (ndata.nodeDef.control && ndata.controlParams) {
        let box = renderParamControl(ndata, panel);
        if (box)
            boxes.push(box);
    }
    const params = Object.keys(ndata.nodeDef.params || {});
    if (params.length <= 0)
        return;
    for (const param of params)
        if (ndata.anode[param] instanceof AudioParam) {
            boxes.push(renderAudioParam(ndata.anode, ndata.nodeDef, param, panel));
        }
        else {
            let box = renderOtherParam(ndata.anode, ndata.nodeDef, param, panel);
            if (box)
                boxes.push(box);
        }
    positionBoxes(panel, boxes);
}
function positionBoxes(panel, boxes) {
    if (boxes.length < 1)
        return;
    const pw = panel.width() || 0;
    const bw = boxes[0].width() || 0;
    const sep = (pw - boxes.length * bw) / (boxes.length + 1);
    let x = sep;
    for (const box of boxes) {
        box.css({
            position: 'relative',
            left: x
        });
        x += sep;
    }
}
function renderAudioParam(anode, ndef, param, panel) {
    const pdef = ndef.params[param];
    const aparam = anode[param];
    if (aparam['_value'])
        aparam.value = aparam['_value'];
    return renderSlider(panel, pdef, param, aparam.value, value => {
        aparam.value = value;
        aparam['_value'] = value;
    });
}
function renderParamControl(ndata, panel) {
    if (!ndata.controlParams)
        return null;
    const combo = renderCombo(panel, ndata.controlParams, ndata.controlParam, 'Controlling');
    combo.change(_ => {
        if (ndata.controlParam)
            ndata.anode.disconnect(ndata.controlTarget[ndata.controlParam]);
        ndata.controlParam = '' + combo.val();
        ndata.anode.connect(ndata.controlTarget[ndata.controlParam]);
    });
    return combo.parent();
}
const customRenderMethods = {
    renderBufferData,
    renderSoundBank
};
function renderOtherParam(anode, ndef, param, panel) {
    const pdef = ndef.params[param];
    if (pdef.choices) {
        const combo = renderCombo(panel, pdef.choices, anode[param], ucfirst(param));
        combo.change(_ => {
            anode[param] = combo.val();
        });
        return combo.parent();
    }
    else if (pdef.min != undefined)
        return renderSlider(panel, pdef, param, anode[param], value => anode[param] = value);
    else if (typeof pdef.initial == 'boolean')
        return renderBoolean(panel, pdef, param, anode, ucfirst(param));
    else if (pdef.phandler)
        return customRenderMethods[pdef.phandler.uiRender](panel, pdef, anode, param, ucfirst(param));
    return null;
}
function renderSlider(panel, pdef, param, value, setValue) {
    const sliderBox = $('<div class="slider-box">');
    const slider = $('<input type="range" orient="vertical">')
        .attr('min', 0)
        .attr('max', 1)
        .attr('step', 0.001)
        .attr('value', param2slider(value, pdef));
    const numInput = $('<input type="number">')
        .attr('min', pdef.min || 0)
        .attr('max', pdef.max || 1)
        .attr('value', truncateFloat(value, 5));
    sliderBox.append(numInput);
    sliderBox.append(slider);
    sliderBox.append($('<span><br/>' + ucfirst(param) + '</span>'));
    panel.append(sliderBox);
    slider.on('input', _ => {
        const v = slider2param(parseFloat('' + slider.val()), pdef);
        numInput.val(truncateFloat(v, 5));
        setValue(v);
    });
    numInput.on('input', _ => {
        const v = parseFloat('' + numInput.val());
        if (isNaN(v))
            return;
        slider.val(param2slider(v, pdef));
        setValue(v);
    });
    return sliderBox;
}
function renderCombo(panel, choices, selected, label) {
    const choiceBox = $('<div class="choice-box">');
    const combo = $('<select>').attr('size', choices.length || 2);
    for (const choice of choices) {
        const option = $('<option>').text(choice);
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
    const box = $('<div class="choice-box">');
    const button = $('<button class="btn btn-info" data-toggle="button" aria-pressed="false">');
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
    button.click(_ => {
        anode[param] = !anode[param];
        button.text(anode[param] ? 'Enabled' : 'Disabled');
    });
    return box;
}
function param2slider(paramValue, pdef) {
    let min = pdef.min || 0;
    let max = pdef.max || 1;
    if (pdef.linear)
        return (paramValue - min) / (max - min);
    else
        return Object(__WEBPACK_IMPORTED_MODULE_0__utils_modern__["b" /* linear2log */])(paramValue, min, max);
}
function slider2param(sliderValue, pdef) {
    let min = pdef.min || 0;
    let max = pdef.max || 1;
    if (pdef.linear)
        return min + sliderValue * (max - min);
    else
        return Object(__WEBPACK_IMPORTED_MODULE_0__utils_modern__["c" /* log2linear */])(sliderValue, min, max);
}
// -------------------- Custom parameter rendering --------------------
function renderBufferData(panel, pdef, anode, param, label) {
    const box = $('<div class="choice-box">');
    const button = $(`
		<span class="btn btn-primary upload">
			<input type="file">
			Load&nbsp;
			<span class="glyphicon glyphicon-open" aria-hidden="true"></span>
		</span>`);
    box.append(button);
    button.after('<br/><br/>' + label);
    panel.append(box);
    let loading = true;
    button.find('input').change(evt => {
        // Trigger asynchronous upload & decode
        __WEBPACK_IMPORTED_MODULE_1__utils_file__["e" /* uploadArrayBuffer */](evt, soundFile => {
            anode['_encoded'] = soundFile;
            anode.context.decodeAudioData(soundFile, (buffer) => {
                anode['_buffer'] = buffer;
                loading = false;
                // TODO capture errors and report them with popups.alert
                __WEBPACK_IMPORTED_MODULE_2__utils_popups__["b" /* close */]();
            });
        });
        // Open progress popup
        setTimeout(_ => {
            if (loading)
                __WEBPACK_IMPORTED_MODULE_2__utils_popups__["e" /* progress */]('Loading and decoding audio data...');
        }, 300);
    });
    return box;
}
function setComboOptions(combo, names) {
    combo.empty();
    for (const name of names)
        combo.append('<option>' + name + '</option>');
}
function renderSoundBank(panel, pdef, anode, param, label) {
    const combo = renderCombo(panel, [], '', 'Buffers');
    combo.css({
        marginBottom: '10px', marginLeft: '-20px',
        width: '140px', height: '100px',
        overflowX: 'auto'
    });
    const buttons = $(`<div style="margin-bottom: -24px">
		<span class="btn btn-primary upload">
			<input type="file">
			<span class="glyphicon glyphicon-open" aria-hidden="true"></span>
		</span>
		&nbsp;&nbsp;&nbsp;
		<span class="btn btn-danger">
			<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
		</span></div>`);
    combo.after(buttons);
    const bufs = anode['_buffers'];
    const encs = anode['_encodedBuffers'];
    const names = anode['_names'];
    setComboOptions(combo, names);
    buttons.find('input').change(evt => {
        // Trigger asynchronous upload & decode
        __WEBPACK_IMPORTED_MODULE_1__utils_file__["e" /* uploadArrayBuffer */](evt, (fileData, f) => {
            encs.push(fileData);
            anode.context.decodeAudioData(fileData, (buffer) => bufs.push(buffer));
            names.push(f.name);
            setComboOptions(combo, names);
        });
    });
    buttons.find('.btn-danger').click(_ => {
        const idx = names.indexOf(combo.val());
        if (idx < 0)
            return;
        [encs, bufs, names].forEach(a => a.splice(idx, 1));
        setComboOptions(combo, names);
    });
    return combo.parent();
}
// -------------------- Misc utilities --------------------
function ucfirst(str) {
    return str[0].toUpperCase() + str.substring(1);
}
function truncateFloat(f, len) {
    let s = '' + f;
    s = s.substr(0, len);
    if (s[s.length - 1] == '.')
        return s.substr(0, len - 1);
    else
        return s;
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Displays FFT and Oscilloscope graphs from the output of a given AudioNode
 */
class AudioAnalyzer {
    constructor(jqfft, jqosc) {
        this.canvasFFT = this.createCanvas(jqfft);
        this.gcFFT = this.canvasFFT.getContext('2d');
        this.canvasOsc = this.createCanvas(jqosc);
        this.gcOsc = this.canvasOsc.getContext('2d');
    }
    createCanvas(panel) {
        const jqCanvas = $(`<canvas width="${panel.width()}" height="${panel.height()}">`);
        panel.append(jqCanvas);
        const canvas = jqCanvas[0];
        return canvas;
    }
    createAnalyzerNode(ac) {
        if (this.anode)
            return;
        this.anode = ac.createAnalyser();
        this.fftData = new Uint8Array(this.anode.fftSize);
        this.oscData = new Uint8Array(this.anode.fftSize);
    }
    analyze(input) {
        this.disconnect();
        this.createAnalyzerNode(input.context);
        this.input = input;
        this.input.connect(this.anode);
        this.requestAnimationFrame();
    }
    disconnect() {
        if (!this.input)
            return;
        this.input.disconnect(this.anode);
        this.input = null;
    }
    requestAnimationFrame() {
        window.requestAnimationFrame(_ => this.updateCanvas());
    }
    updateCanvas() {
        if (!this.input)
            return;
        if (this.gcFFT)
            this.drawFFT(this.gcFFT, this.canvasFFT, this.fftData, '#00FF00');
        if (this.gcOsc)
            this.drawOsc(this.gcOsc, this.canvasOsc, this.oscData, '#FFFF00');
        this.requestAnimationFrame();
    }
    drawFFT(gc, canvas, data, color) {
        const [w, h] = this.setupDraw(gc, canvas, data, color);
        this.anode.getByteFrequencyData(data);
        const dx = (data.length / 2) / canvas.width;
        let x = 0;
        // TODO calculate average of all samples from x to x + dx - 1
        for (let i = 0; i < w; i++) {
            let y = data[Math.floor(x)];
            x += dx;
            gc.moveTo(i, h - 1);
            gc.lineTo(i, h - 1 - h * y / 256);
        }
        gc.stroke();
        gc.closePath();
    }
    drawOsc(gc, canvas, data, color) {
        const [w, h] = this.setupDraw(gc, canvas, data, color);
        this.anode.getByteTimeDomainData(data);
        gc.moveTo(0, h / 2);
        let x = 0;
        while (data[x] > 128 && x < data.length / 4)
            x++;
        while (data[x] < 128 && x < data.length / 4)
            x++;
        const dx = (data.length * 0.75) / canvas.width;
        for (let i = 0; i < w; i++) {
            let y = data[Math.floor(x)];
            x += dx;
            gc.lineTo(i, h * y / 256);
        }
        gc.stroke();
        gc.closePath();
    }
    setupDraw(gc, canvas, data, color) {
        const w = canvas.width;
        const h = canvas.height;
        gc.clearRect(0, 0, w, h);
        gc.beginPath();
        gc.strokeStyle = color;
        return [w, h];
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = AudioAnalyzer;



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__keyboard__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__midi__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__piano__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__arpeggiator__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__synth_instrument__ = __webpack_require__(5);





const NUM_VOICES = 8;
/**
 * Manages all note-generation inputs:
 * 	- PC Keyboard
 * 	- Virtual piano keyboard
 *	- An external MIDI keyboard
 * Handles switching to polyphonic mode and back to mono
 */
class NoteInputs {
    constructor(synthUI) {
        this.synthUI = synthUI;
        this.poly = false;
        // Setup piano panel
        let piano = new __WEBPACK_IMPORTED_MODULE_2__piano__["a" /* PianoKeyboard */]($('#piano'));
        this.piano = piano;
        piano.noteOn = (midi) => this.arpeggiator.sendNoteOn(midi, 1);
        piano.noteOff = (midi) => this.arpeggiator.sendNoteOff(midi, 1);
        // Register poly on/off handlers
        piano.polyOn = () => this.polyOn();
        piano.polyOff = () => this.polyOff();
        // Setup PC keyboard
        let kb = this.setupPCKeyboard(piano);
        // Bind piano octave with PC keyboard
        kb.baseNote = piano.baseNote;
        piano.octaveChanged = baseNote => kb.baseNote = baseNote;
        this.setupEnvelopeAnimation(piano);
        // Setup arpeggiator
        this.setupArpeggiator(piano, synthUI.synth.ac);
        // Setup MIDI keyboard
        this.setupMidiKeyboard(piano);
    }
    setupPCKeyboard(piano) {
        let kb = new __WEBPACK_IMPORTED_MODULE_0__keyboard__["a" /* Keyboard */]('#synth');
        kb.noteOn = (midi) => {
            if (document.activeElement.nodeName == 'INPUT' &&
                document.activeElement.getAttribute('type') != 'range')
                return;
            this.arpeggiator.sendNoteOn(midi, 1);
            piano.displayKeyDown(midi);
        };
        kb.noteOff = (midi) => {
            this.arpeggiator.sendNoteOff(midi, 1);
            piano.displayKeyUp(midi);
        };
        return kb;
    }
    setupMidiKeyboard(piano) {
        let midi = new __WEBPACK_IMPORTED_MODULE_1__midi__["a" /* MidiKeyboard */]();
        midi.noteOn = (note, velocity, channel) => {
            this.arpeggiator.sendNoteOn(note, 1);
            piano.displayKeyDown(note);
        };
        midi.noteOff = (note, velocity, channel) => {
            this.arpeggiator.sendNoteOff(note, 1);
            piano.displayKeyUp(note);
        };
    }
    setupEnvelopeAnimation(piano) {
        const loaded = this.synthUI.gr.handler.graphLoaded;
        this.synthUI.gr.handler.graphLoaded = function () {
            loaded.bind(this.synthUI.gr.handler)();
            let adsr = null;
            for (const node of this.synthUI.gr.nodes) {
                const data = node.data;
                if (data.type == 'ADSR') {
                    adsr = data.anode;
                    break;
                }
            }
            piano.setEnvelope(adsr || { attack: 0, release: 0 });
        };
    }
    setupArpeggiator(piano, ac) {
        this.arpeggiator = new __WEBPACK_IMPORTED_MODULE_3__arpeggiator__["a" /* Arpeggiator */](ac);
        piano.arpeggioChanged = (bpm, mode, octaves) => {
            this.arpeggiator.mode = mode;
            this.arpeggiator.octaves = octaves;
            this.arpeggiator.bpm = bpm;
        };
        this.arpeggiator.noteOn =
            (midi, velocity, time) => this.noteOn(midi, velocity, time);
        this.arpeggiator.noteOff =
            (midi, velocity, time) => this.noteOff(midi, velocity, time);
    }
    noteOn(midi, velocity, time) {
        this.lastNote = midi;
        const portamento = this.piano.getPortamento();
        if (this.poly) {
            this.instrument.portamento.time = portamento;
            this.instrument.noteOn(midi, velocity, time);
        }
        else {
            this.synthUI.synth.portamento.time = portamento;
            this.synthUI.synth.noteOn(midi, velocity, time);
        }
    }
    noteOff(midi, velocity, time) {
        this.lastNote = 0;
        if (this.poly)
            this.instrument.noteOff(midi, velocity, time);
        else
            this.synthUI.synth.noteOff(midi, velocity, time);
    }
    polyOn() {
        if (this.lastNote)
            this.noteOff(this.lastNote, 1);
        this.poly = true;
        const json = this.synthUI.gr.toJSON();
        this.instrument = new __WEBPACK_IMPORTED_MODULE_4__synth_instrument__["a" /* Instrument */](this.synthUI.synth.ac, json, NUM_VOICES, this.synthUI.outNode);
    }
    polyOff() {
        this.poly = false;
        this.instrument.close();
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = NoteInputs;



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
const BASE_NOTE = 36;
/**
 * Provides a piano keyboard using the PC keyboard.
 * Listens to keyboard events and generates MIDI-style noteOn/noteOff events.
 */
class Keyboard {
    constructor(kbTarget = 'body') {
        this.setupHandler(kbTarget);
        this.baseNote = BASE_NOTE;
    }
    setupHandler(kbTarget) {
        const pressedKeys = {};
        $(kbTarget)
            .on('keydown', evt => {
            let kcode = evt.keyCode || 0;
            if (pressedKeys[kcode])
                return; // Skip repetitions
            if (evt.metaKey || evt.altKey || evt.ctrlKey)
                return; // Skip browser shortcuts
            pressedKeys[kcode] = true;
            const midi = this.key2midi(kcode);
            if (midi < 0)
                return;
            this.noteOn(midi);
        })
            .on('keyup', evt => {
            let kcode = evt.keyCode || 0;
            pressedKeys[kcode] = false;
            const midi = this.key2midi(kcode);
            if (midi < 0)
                return;
            this.noteOff(midi);
        });
    }
    key2midi(keyCode) {
        const pos = KB_NOTES.indexOf(String.fromCharCode(keyCode));
        if (pos < 0)
            return -1;
        return this.baseNote + pos;
    }
    noteOn(midi) { }
    noteOff(midi) { }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Keyboard;



/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class MidiKeyboard {
    constructor() {
        this.connected = false;
        if (!navigator.requestMIDIAccess)
            return;
        navigator.requestMIDIAccess({ sysex: false })
            .then((midiAccess) => {
            if (midiAccess.inputs.size <= 0)
                return;
            const input = midiAccess.inputs.values().next().value;
            if (!input)
                return;
            input.onmidimessage = (msg) => this.midiMessage(msg);
            this.connected = true;
        });
    }
    midiMessage(msg) {
        const data = msg.data;
        const cmd = data[0] >> 4;
        const channel = data[0] & 0xf;
        const note = data[1];
        const velocity = data[2];
        switch (cmd) {
            case 9:
                this.noteOn(note, velocity, channel);
                break;
            case 8:
                this.noteOff(note, velocity, channel);
                break;
        }
    }
    noteOn(midi, velocity, channel) { }
    noteOff(midi, velocity, channel) { }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MidiKeyboard;



/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_popups__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_modern__ = __webpack_require__(0);


const NUM_WHITES = 17;
const BASE_NOTE = 36;
const ARPEGGIO_MODES = ['', 'u', 'd', 'ud'];
const ARPEGGIO_LABELS = ['-', '&uarr;', '&darr;', '&uarr;&darr;'];
const MAX_ARPEGGIO_OCT = 3;
const ARPEGGIO_MIN = 15;
const ARPEGGIO_MAX = 480;
const PORTAMENTO_MIN = 0;
const PORTAMENTO_MAX = 1;
/** Builds a piano keyboard out of DIVs */
class PianoKeys {
    constructor(numWhites = NUM_WHITES) {
        this.numWhites = numWhites;
    }
    createKeys(panel) {
        const keys = [];
        const pw = panel.width() || 0;
        const ph = panel.height() || 0;
        const fromX = parseFloat(panel.css('padding-left'));
        const fromY = parseFloat(panel.css('padding-top'));
        const kw = pw / this.numWhites + 1;
        const bw = Math.round(kw * 2 / 3);
        const bh = Math.round(ph * 2 / 3);
        // Create white keys
        let knum = 0;
        for (let i = 0; i < this.numWhites; i++) {
            const key = $('<div class="piano-key">').css({
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
        let x = fromX - bw / 2;
        for (let i = 0; i < this.numWhites - 1; i++) {
            x += kw - 1;
            knum++;
            if (!this.hasBlack(i))
                continue;
            const key = $('<div class="piano-key piano-black">').css({
                width: '' + bw + 'px',
                height: '' + bh + 'px',
                left: '' + x + 'px',
                top: '' + fromY + 'px'
            });
            panel.append(key);
            keys[knum++] = key;
        }
        return keys;
    }
    hasBlack(num) {
        const mod7 = num % 7;
        return mod7 != 2 && mod7 != 6;
    }
}
/* unused harmony export PianoKeys */

/**
 * A virtual piano keyboard that:
 * 	- Captures mouse input and generates corresponding note events
 * 	- Displays note events as CSS-animated colors in the pressed keys
 * 	- Supports octave switching
 * 	- Provides a poly/mono button
 */
class PianoKeyboard {
    constructor(panel) {
        this.arpeggio = {
            mode: 0,
            octave: 1,
            bpm: 60
        };
        this.baseNote = BASE_NOTE;
        this.octave = 3;
        this.poly = false;
        this.envelope = { attack: 0, release: 0 };
        const pianoKeys = new PianoKeys();
        this.keys = pianoKeys.createKeys(panel);
        for (let i = 0; i < this.keys.length; i++)
            this.registerKey(this.keys[i], i);
        this.controls = panel.parent();
        this.registerButtons(this.controls);
        this.portaSlider = this.controls.find('.portamento-box input');
    }
    registerKey(key, knum) {
        key.mousedown(_ => {
            const midi = knum + this.baseNote;
            this.displayKeyDown(key);
            this.noteOn(midi);
        });
        key.mouseup(_ => {
            const midi = knum + this.baseNote;
            this.displayKeyUp(key);
            this.noteOff(midi);
        });
    }
    registerButtons(panel) {
        // Octave navigation
        $('#prev-octave-but').click(_ => {
            this.octave--;
            this.updateOctave();
        });
        $('#next-octave-but').click(_ => {
            this.octave++;
            this.updateOctave();
        });
        // Arpeggio
        const arpeggioSlider = panel.find('.arpeggio-box input');
        arpeggioSlider.on('input', _ => {
            this.arpeggio.bpm =
                Object(__WEBPACK_IMPORTED_MODULE_1__utils_modern__["c" /* log2linear */])(parseFloat('' + arpeggioSlider.val()), ARPEGGIO_MIN, ARPEGGIO_MAX);
            // ARPEGGIO_MIN + parseFloat(arpeggioSlider.val()) * (ARPEGGIO_MAX - ARPEGGIO_MIN);
            this.triggerArpeggioChange();
        });
        const butArpMode = panel.find('.btn-arpeggio-ud');
        butArpMode.click(_ => this.changeArpeggioMode(butArpMode));
        const butArpOct = panel.find('.btn-arpeggio-oct');
        butArpOct.click(_ => this.changeArpeggioOctave(butArpOct));
        // Monophonic / polyphonic mode
        $('#poly-but').click(_ => this.togglePoly());
    }
    updateOctave() {
        $('#prev-octave-but').prop('disabled', this.octave <= 1);
        $('#next-octave-but').prop('disabled', this.octave >= 8);
        $('#octave-label').text('C' + this.octave);
        this.baseNote = BASE_NOTE + 12 * (this.octave - 3);
        this.octaveChanged(this.baseNote);
    }
    displayKeyDown(key) {
        if (typeof key == 'number')
            key = this.midi2key(key);
        if (!key)
            return;
        if (!this.poly && this.arpeggio.mode == 0 && this.lastKey)
            this.displayKeyUp(this.lastKey, true);
        key.css('transition', `background-color ${this.envelope.attack}s linear`);
        key.addClass('piano-key-pressed');
        this.lastKey = key;
    }
    displayKeyUp(key, immediate) {
        if (typeof key == 'number')
            key = this.midi2key(key);
        if (!key)
            return;
        const release = immediate ? 0 : this.envelope.release;
        key.css('transition', `background-color ${release}s linear`);
        key.removeClass('piano-key-pressed');
    }
    midi2key(midi) {
        return this.keys[midi - this.baseNote];
    }
    setEnvelope(adsr) {
        this.envelope = adsr;
    }
    togglePoly() {
        this.poly = !this.poly;
        if (this.poly) {
            const cover = $('<div>').addClass('editor-cover');
            cover.append('<p>You can use the PC keyboard to play notes<br><br>' +
                'Synth editing is disabled in polyphonic mode</p>');
            $('body').append(cover);
            $('#poly-but').text('Poly');
            __WEBPACK_IMPORTED_MODULE_0__utils_popups__["g" /* setOpen */](true);
            this.polyOn();
        }
        else {
            $('.editor-cover').remove();
            $('#poly-but').text('Mono');
            __WEBPACK_IMPORTED_MODULE_0__utils_popups__["g" /* setOpen */](false);
            this.polyOff();
        }
    }
    getPortamento() {
        const sv = parseFloat('' + this.portaSlider.val());
        return Object(__WEBPACK_IMPORTED_MODULE_1__utils_modern__["c" /* log2linear */])(sv, PORTAMENTO_MIN, PORTAMENTO_MAX);
    }
    changeArpeggioMode(button) {
        this.arpeggio.mode++;
        if (this.arpeggio.mode >= ARPEGGIO_MODES.length)
            this.arpeggio.mode = 0;
        button.html(ARPEGGIO_LABELS[this.arpeggio.mode]);
        this.triggerArpeggioChange();
    }
    changeArpeggioOctave(button) {
        this.arpeggio.octave++;
        if (this.arpeggio.octave > MAX_ARPEGGIO_OCT)
            this.arpeggio.octave = 1;
        button.text(this.arpeggio.octave);
        this.triggerArpeggioChange();
    }
    triggerArpeggioChange() {
        this.arpeggioChanged(this.arpeggio.bpm, ARPEGGIO_MODES[this.arpeggio.mode], this.arpeggio.octave);
    }
    toJSON() {
        return {
            portamento: this.getPortamento(),
            octave: this.octave,
            arpeggio: {
                bpm: this.arpeggio.bpm,
                mode: this.arpeggio.mode,
                octave: this.arpeggio.octave
            }
        };
    }
    fromJSON(json) {
        if (!json)
            return;
        if (json.portamento) {
            this.portaSlider.val(Object(__WEBPACK_IMPORTED_MODULE_1__utils_modern__["b" /* linear2log */])(json.portamento, PORTAMENTO_MIN, PORTAMENTO_MAX));
        }
        if (json.octave) {
            this.octave = json.octave;
            this.updateOctave();
        }
        if (json.arpeggio) {
            this.arpeggio.bpm = json.arpeggio.bpm;
            this.arpeggio.mode = json.arpeggio.mode;
            this.arpeggio.octave = json.arpeggio.octave;
            this.controls.find('.arpeggio-box input').val(Object(__WEBPACK_IMPORTED_MODULE_1__utils_modern__["b" /* linear2log */])(this.arpeggio.bpm, ARPEGGIO_MIN, ARPEGGIO_MAX));
            this.controls.find('.btn-arpeggio-ud').html(ARPEGGIO_LABELS[this.arpeggio.mode]);
            this.controls.find('.btn-arpeggio-oct').text(this.arpeggio.octave);
            this.triggerArpeggioChange();
        }
    }
    // Simple event handlers
    noteOn(midi) { }
    noteOff(midi) { }
    polyOn() { }
    polyOff() { }
    octaveChanged(baseNote) { }
    arpeggioChanged(bpm, mode, octaves) { }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = PianoKeyboard;



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synth_timer__ = __webpack_require__(4);

class Arpeggiator {
    constructor(ac) {
        this.backward = false;
        this.noteOnTime = 0.75;
        this.mode = '';
        this.octaves = 1;
        this.bpm = 60;
        this.notect = 0;
        this.notes = new NoteTable();
        this.timer = new __WEBPACK_IMPORTED_MODULE_0__synth_timer__["a" /* Timer */](ac, this.bpm);
    }
    get bpm() { return this._bpm; }
    set bpm(v) {
        this._bpm = v;
        if (this.timer)
            this.timer.bpm = v;
    }
    timerCB(time) {
        // Return if disabled or no notes
        if (this.mode.length == 0)
            return;
        const len = this.notes.length();
        if (len == 0)
            return;
        // Check note counter
        this.wrapCounter(len);
        // Get current note and play it
        const ndata = this.notes.get(this.notect);
        this.noteOn(ndata.noteToPlay, ndata.velocity, time);
        this.noteOff(ndata.noteToPlay, ndata.velocity, time + this.timer.noteDuration * this.noteOnTime);
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
    }
    wrapCounter(len) {
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
    }
    sendNoteOn(midi, velocity) {
        if (this.mode.length == 0)
            return this.noteOn(midi, velocity);
        const shouldStart = this.notes.length() == 0;
        this.notes.add(midi, midi, velocity);
        if (this.octaves > 1)
            this.notes.add(midi, midi + 12, velocity);
        if (this.octaves > 2)
            this.notes.add(midi, midi + 24, velocity);
        if (shouldStart)
            this.timer.start(time => this.timerCB(time));
    }
    sendNoteOff(midi, velocity) {
        if (this.mode.length == 0)
            this.noteOff(midi, velocity);
        this.notes.remove(midi);
        if (this.notes.length() == 0) {
            this.timerCB(0);
            this.timer.stop();
            this.backward = false;
            this.notect = 0;
        }
    }
    // Event handlers
    noteOn(midi, velocity, time) { }
    noteOff(midi, velocity, time) { }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Arpeggiator;

class NoteData {
    constructor(note, noteToPlay, velocity) {
        this.note = note;
        this.noteToPlay = noteToPlay;
        this.velocity = velocity;
    }
}
/* unused harmony export NoteData */

class NoteTable {
    constructor() {
        this.notes = [];
    }
    length() { return this.notes.length; }
    get(i) { return this.notes[i]; }
    add(note, noteToPlay, velocity) {
        const ndata = new NoteData(note, noteToPlay, velocity);
        for (let i = 0; i < this.notes.length; i++) {
            if (noteToPlay < this.notes[i].noteToPlay) {
                this.notes.splice(i, 0, ndata);
                return;
            }
        }
        this.notes.push(ndata);
    }
    remove(note) {
        this.notes = this.notes.filter(ndata => ndata.note != note);
    }
}
/* unused harmony export NoteTable */



/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_popups__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_file__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_modern__ = __webpack_require__(0);



const MAX_PRESETS = 20;
/**
 * Manages the presets box:
 * - Handles navigation through presets
 * - Handles preset loading & saving
 */
class Presets {
    constructor(synthUI) {
        this.presetNum = 0;
        this.synthUI = synthUI;
        this.registerListeners(synthUI.gr.canvas);
        this.loadPresets();
    }
    loadPresets() {
        this.presets = new Array(MAX_PRESETS);
        for (let i = 0; i < MAX_PRESETS; i++)
            this.presets[i] = this.getEmptyPreset();
        $.get('js/presets.json', data => {
            if (!(data instanceof Array))
                return;
            for (let i = 0; i < MAX_PRESETS; i++)
                if (data[i])
                    this.presets[i] = data[i];
            this.preset2synth();
        });
    }
    getEmptyPreset() {
        return {
            name: '',
            nodes: [
                { id: 0, x: 500, y: 180, name: 'Out', inputs: [], classes: 'node node-out' }
            ],
            nodeData: [
                { type: 'out', params: {} }
            ]
        };
    }
    registerListeners(elem) {
        $('#save-but').click(_ => this.savePreset());
        $('#load-file').on('change', evt => this.loadPreset(evt));
        $('#prev-preset-but').click(_ => this.changePreset(this.presetNum - 1));
        $('#next-preset-but').click(_ => this.changePreset(this.presetNum + 1));
        $(Object(__WEBPACK_IMPORTED_MODULE_2__utils_modern__["a" /* focusable */])(elem)).keydown(evt => {
            if (evt.target.nodeName == 'INPUT' || __WEBPACK_IMPORTED_MODULE_0__utils_popups__["d" /* isOpen */])
                return;
            if (evt.keyCode == 37)
                this.changePreset(this.presetNum - 1);
            if (evt.keyCode == 39)
                this.changePreset(this.presetNum + 1);
        });
        $('#preset-num').click(_ => this.togglePresetSelector());
        const preSel = $('.preset-selector select');
        preSel.change(_ => {
            let val = preSel.val();
            if (!val)
                return;
            const sel = val.toString().split(':')[0];
            this.changePreset(parseInt(sel, 10) - 1);
        });
    }
    togglePresetSelector() {
        const seldiv = $('.preset-selector');
        seldiv.toggle();
        if (!seldiv.is(':visible'))
            return;
        // Fill select contents
        this.synth2preset();
        const sel = seldiv.find('select');
        sel.empty();
        sel.focus();
        let i = 0;
        for (const preset of this.presets) {
            const selected = i == this.presetNum ? ' selected' : '';
            i++;
            if (preset.nodes.length > 1)
                sel.append(`<option${selected}>${i}: ${preset.name}</option>`);
        }
    }
    changePreset(newNum) {
        if (newNum < 0)
            newNum = MAX_PRESETS - 1;
        else if (newNum >= MAX_PRESETS)
            newNum = 0;
        this.synth2preset();
        this.presetNum = newNum;
        this.preset2synth();
    }
    synth2preset() {
        const json = this.synthUI.gr.toJSON();
        let val = '' + $('#preset-name').val();
        json.name = val.trim();
        json.modulatorType = 'synth';
        this.beforeSave(json);
        this.presets[this.presetNum] = json;
        return json;
    }
    preset2synth() {
        const preset = this.presets[this.presetNum];
        this.afterLoad(preset);
        $('#preset-num').text(this.presetNum + 1);
        $('#preset-name').val(preset.name);
        $('#node-params').empty();
        this.synthUI.gr.fromJSON(preset);
        this.selectBestNode();
    }
    selectBestNode() {
        const getFirstNode = (isGood) => this.synthUI.gr.nodes.filter(isGood)[0];
        let n = getFirstNode(nn => nn.data.type == 'Filter');
        if (!n)
            n = getFirstNode(nn => nn.data.type == 'ADSR');
        if (!n)
            n = getFirstNode(nn => nn.data.anode.numberOfInputs == 0);
        if (n)
            this.synthUI.gr.selectNode(n);
    }
    loadPreset(evt) {
        if (!evt)
            return;
        __WEBPACK_IMPORTED_MODULE_1__utils_file__["f" /* uploadText */](evt, data => {
            try {
                const json = JSON.parse(data);
                if (json.modulatorType != 'synth')
                    throw 'Invalid file format';
                this.presets[this.presetNum] = json;
                this.preset2synth();
            }
            catch (e) {
                console.error(e);
                __WEBPACK_IMPORTED_MODULE_0__utils_popups__["a" /* alert */]('Could not load synth: invalid file format', 'Load error');
            }
        });
    }
    savePreset() {
        const json = this.synth2preset();
        const jsonData = JSON.stringify(json);
        if (__WEBPACK_IMPORTED_MODULE_1__utils_file__["c" /* browserSupportsDownload */]()) {
            if (json.name.length == 0)
                json.name = '' + this.presetNum;
            __WEBPACK_IMPORTED_MODULE_1__utils_file__["d" /* download */](json.name + '.json', jsonData);
        }
        else {
            __WEBPACK_IMPORTED_MODULE_0__utils_popups__["f" /* prompt */]('Copy the text below to the clipboard and save it to a local text file', 'Save preset', jsonData, null);
        }
    }
    // Extension point to specify additional data to save, e.g. keyboard settings
    beforeSave(json) { }
    // Extension point to handle previously saved additional data
    afterLoad(json) { }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Presets;



/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createEditor;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__live_coding__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lc_definitions__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__buttons__ = __webpack_require__(28);



let sinkDiv = document.createElement('div');
function byId(id) {
    return document.getElementById(id) || sinkDiv;
}
// -------------------- Editor setup --------------------
let global = window;
let monacoRequire = global.require;
let editor;
let decorations = [];
function loadMonaco(cb) {
    monacoRequire.config({ paths: { 'vs': 'js/vendor/monaco/min/vs' } });
    monacoRequire(['vs/editor/editor.main'], cb);
}
function createEditor(ac, presets, synthUI) {
    global.lc = new __WEBPACK_IMPORTED_MODULE_0__live_coding__["a" /* LiveCoding */](ac, presets, synthUI);
    global.tracks = __WEBPACK_IMPORTED_MODULE_0__live_coding__["b" /* tracks */];
    loadMonaco(function () {
        let editorElem = byId('walc-code-editor');
        setupDefinitions();
        editor = monaco.editor.create(editorElem, {
            value: '',
            language: 'typescript',
            lineNumbers: false,
            renderLineHighlight: 'none',
            minimap: { enabled: false }
            // fontSize: 15
        });
        handleEditorResize(editorElem);
        registerActions();
        preventParentScroll(editorElem);
        editor.focus();
        Object(__WEBPACK_IMPORTED_MODULE_2__buttons__["a" /* registerButtons */])(editor);
        $(document).on('route:show', (e, h) => {
            if (h != '#live-coding')
                return;
            editor.focus();
            window.scrollTo(0, 0);
        });
    });
}
function preventParentScroll(elem) {
    $(elem).bind('mousewheel', e => e.preventDefault());
}
function setupDefinitions() {
    monaco.languages.typescript.
        typescriptDefaults.addExtraLib(__WEBPACK_IMPORTED_MODULE_1__lc_definitions__["a" /* LC_DEFINITIONS */]);
}
function registerActions() {
    editor.addAction({
        id: 'walc-run-all',
        label: 'Run all code',
        keybindings: [
            monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
        ],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1,
        run: runAllCode
    });
    editor.addAction({
        id: 'walc-run-part',
        label: 'Run current line or selection',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1,
        run: runSomeCode
    });
}
function handleEditorResize(elem) {
    let edw = elem.clientWidth;
    setInterval(_ => {
        let newW = elem.clientWidth;
        if (edw != newW) {
            edw = newW;
            editor.layout();
        }
    }, 1000);
}
// -------------------- Error handling --------------------
function getRuntimeErrorDecoration(lineNum) {
    let decs = editor.getLineDecorations(lineNum);
    if (!decs || decs.length <= 0)
        return null;
    for (let dec of decs)
        if (dec.options.className == 'walc-error')
            return dec;
    return null;
}
function getErrorLocation(e) {
    // Safari
    if (e.line)
        return { line: e.line, column: e.column };
    // Chrome: <anonymous>
    // Firefox: > eval
    if (!e.stack)
        return null;
    let match = e.stack.match(/(<anonymous>|> eval):(\d+):(\d+)/);
    if (match && match.length == 4) {
        return {
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10)
        };
    }
    return null;
}
function showError(msg, line, col) {
    console.log(`Runtime error: "${msg}" at line ${line}, column ${col}`);
    editor.revealLineInCenter(line);
    let errorRange = getErrorRange(editor.getModel().getLineContent(line), col);
    decorations = editor.deltaDecorations(decorations, [{
            range: new monaco.Range(line, errorRange.from, line, errorRange.to),
            options: {
                isWholeLine: false,
                className: 'walc-error',
                hoverMessage: ['**Runtime Error**', msg]
            }
        }]);
    return errorRange;
}
function getErrorRange(s, col) {
    s = s.substring(col - 1);
    let m = s.match(/\s*[\w_$]+/);
    if (m && m.index !== undefined && m[0]) {
        return { from: col + m.index, to: col + m.index + m[0].length };
    }
    return { from: 0, to: s.length + 1 };
}
// -------------------- Code execution --------------------
function flashRange(range) {
    let decs = [];
    decs = editor.deltaDecorations(decs, [{
            range,
            options: {
                isWholeLine: false,
                className: 'walc-running'
            }
        }]);
    setTimeout(_ => {
        $('.walc-running').css('background-color', 'inherit');
        setTimeout(() => {
            decs = editor.deltaDecorations(decs, []);
        }, 1000);
    }, 100);
}
function doRunCode(code) {
    try {
        decorations = editor.deltaDecorations(decorations, []);
        // tslint:disable-next-line:no-eval
        eval(code);
    }
    catch (e) {
        let location = getErrorLocation(e);
        if (location)
            showError(e.message, location.line, location.column);
    }
}
function runAllCode() {
    let model = editor.getModel();
    doRunCode(model.getValue());
    flashRange(model.getFullModelRange());
}
function runSomeCode() {
    let range = editor.getSelection();
    let sel;
    if (range.startLineNumber != range.endLineNumber
        || range.startColumn != range.endColumn) {
        sel = editor.getModel().getValueInRange(range);
    }
    else {
        sel = editor.getModel().getLineContent(range.startLineNumber);
        range.startColumn = 1;
        range.endColumn = sel.length + 1;
    }
    sel = '\n'.repeat(range.startLineNumber - 1) + sel;
    doRunCode(sel);
    flashRange(range);
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return tracks; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__synth_instrument__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__synth_timer__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__track__ = __webpack_require__(26);



class LCInstrument extends __WEBPACK_IMPORTED_MODULE_0__synth_instrument__["a" /* Instrument */] {
    param(pname, value) {
        let names = pname.split('/');
        if (names.length < 2)
            throw new Error(`Instrument parameters require "node/param" format`);
        let node = names[0];
        let name = names[1];
        if (value === undefined) {
            let prm = this.voices[0].getParameterNode(node, name);
            return prm ? prm.value : NaN;
        }
        for (let v of this.voices) {
            let prm = v.getParameterNode(node, name);
            if (!prm)
                throw new Error(`Parameter "{name"} not found in node "${node}" of instrument "${this.name}"`);
            prm._value = value;
        }
        return this;
    }
}
/* unused harmony export LCInstrument */

class LiveCoding {
    constructor(ac, presets, synthUI) {
        this.ac = ac;
        this.presets = presets;
        this.synthUI = synthUI;
        this.timer = new __WEBPACK_IMPORTED_MODULE_1__synth_timer__["a" /* Timer */](ac, 60, 0.2);
        this.timer.start(time => timerCB(this.timer, time));
    }
    instrument(preset, numVoices = 4) {
        let prst = getPreset(this.presets, preset);
        let instr = new LCInstrument(this.ac, prst, numVoices, this.synthUI.outNode);
        instr.name = prst.name;
        instr.duration = findNoteDuration(prst);
        return instr;
    }
    effect(name) {
        return new Effect(this.ac, name);
    }
    track(name, cb) {
        let t = new __WEBPACK_IMPORTED_MODULE_2__track__["a" /* Track */](this.ac, this.synthUI.outNode, this.timer);
        t.name = name;
        if (tracks[name])
            nextTracks[name] = t;
        else
            tracks[name] = t;
        if (cb)
            cb(t);
        return t;
    }
    loop_track(name, cb) {
        let t = this.track(name, cb);
        t.loop = true;
        return t;
    }
    use_log(flag = true) {
        logEnabled = flag;
    }
    bpm(value) {
        if (value === undefined)
            return this.timer.bpm;
        this.timer.bpm = value;
        return value;
    }
    stop() {
        eachTrack(t => t.stop());
    }
    pause() {
        eachTrack(t => t.pause());
    }
    continue() {
        eachTrack(t => t.continue());
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = LiveCoding;

class Effect {
    constructor(ac, name) {
        this.name = name;
        let methodName = 'create' + name;
        let anyac = ac;
        if (!anyac[methodName])
            throw new Error(`Effect "${name}" does not exist`);
        this.in = ac[methodName]();
        this.out = this.in;
    }
    param(name, value) {
        let prm = this.in[name];
        if (!prm)
            throw new Error(`Parameter "${name}" not found in effect "${this.name}"`);
        if (value === undefined)
            return prm.value;
        prm.value = value;
        return this;
    }
}
/* unused harmony export Effect */

function getPreset(presets, preset) {
    if (typeof preset == 'number') {
        let maxPrst = presets.presets.length;
        if (preset < 1 || preset > maxPrst)
            throw new Error(`The preset number should be between 1 and ${maxPrst}`);
        return presets.presets[preset - 1];
    }
    else if (typeof preset == 'string') {
        for (let prs of presets.presets)
            if (prs.name == preset)
                return prs;
        throw new Error(`Preset "${preset}" does not exist`);
    }
    return preset;
}
function findNoteDuration(preset) {
    let duration = 0;
    for (let node of preset.nodeData) {
        if (node.type == 'ADSR') {
            let d = node.params.attack + node.params.decay;
            if (d > duration)
                duration = d;
        }
    }
    if (duration)
        duration += 0.01;
    return duration;
}
let tracks = {};
let nextTracks = {};
let logEnabled = false;
function log(...args) {
    if (!logEnabled)
        return;
    console.log(...args);
}
function eachTrack(cb) {
    let tnames = Object.getOwnPropertyNames(tracks);
    for (let tname of tnames)
        cb(tracks[tname]);
}
function timerCB(timer, time) {
    eachTrack(t => playTrack(timer, t, time));
}
function playTrack(timer, track, time) {
    let played;
    do {
        played = false;
        if (shouldTrackEnd(track))
            break;
        track = tracks[track.name];
        let note = track.notes[track.notect];
        if (track.startTime + note.time <= time) {
            playNote(note, timer, track.startTime);
            played = true;
            track.notect++;
        }
    } while (played);
}
function playNote(note, timer, startTime) {
    if (note.options)
        setOptions(note.options);
    if (note.number < 1)
        return;
    log(`Note: ${note.number} - ${note.instrument.name}`);
    note.instrument.noteOn(note.number, note.velocity, startTime + note.time);
    let duration = note.duration
        || note.instrument.duration || timer.noteDuration;
    note.instrument.noteOff(note.number, note.velocity, startTime + note.time + duration);
}
function setOptions(opts) {
    if (opts.effect) {
        let e = opts.effect;
        for (let pname of Object.getOwnPropertyNames(opts))
            if (pname != 'effect')
                e.param(pname, opts[pname]);
    }
    else if (opts.instrument) {
        let i = opts.instrument;
        for (let pname of Object.getOwnPropertyNames(opts))
            if (pname != 'instrument')
                i.param(pname, opts[pname]);
    }
}
function shouldTrackEnd(track) {
    if (track.stopped)
        return true;
    if (track.notect < track.notes.length)
        return false;
    track.notect = 0;
    if (track.shouldStop) {
        track.stopped = true;
        track.shouldStop = false;
        return true;
    }
    if (nextTracks[track.name]) {
        let nextTrack = nextTracks[track.name];
        nextTrack.startTime = track.startTime + track.time;
        tracks[track.name] = nextTrack;
        delete nextTracks[track.name];
        return false;
    }
    if (track.loop) {
        track.startTime += track.time;
        return false;
    }
    else {
        delete tracks[track.name];
        return true;
    }
}


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const LC_DEFINITIONS = `
interface Instrument {
	/** Name of the preset used to create the instrument */
	name: string
	/** Default note duration, in seconds */
	duration: number
	/** Gets or sets the value of a parameter */
	param(pname: string, value?: number): number | this
}

interface Effect {
	/** Effect name */
	name: string
	/** Gets or sets the value of a parameter */
	param(name: string, value?: number): number | this
}

type TrackCallback = (t: Track) => void;

interface InstrumentOptions {
	instrument: LCInstrument
	[k: string]: number | LCInstrument
}

interface EffectOptions {
	effect: Effect
	[k: string]: number | Effect
}

type NoteOptions = InstrumentOptions | EffectOptions

interface PresetData {
	name: string
	nodes: any[]
	nodeData: any[]
	modulatorType: string
}

interface LiveCoding {
	/** Creates an instrument from a preset name, number or data */
	instrument(preset: number | string | PresetData, numVoices?: number): Instrument
	/** Creates an effect */
	effect(name: string): Effect
	/** Creates a named track */
	track(name: string, cb?: TrackCallback): Track
	/** Creates a looping track */
	loop_track(name: string, cb?: TrackCallback): Track
	/** Enables or disables logging */
	use_log(enable = true): void
	/** Change global BPM */
	bpm(value?: number): number
	/** Stops all looping track at the end of their loop */
	stop(): this
	/** Pauses all tracks at their current position */
	pause(): this
	/** Continues playback of stopped or paused tracks */
	continue(): this
}

interface Track {
	/** Sets the instrument to play in the track */
	instrument(inst: Instrument): this
	/** Adds an effect to the track. All sound played in the track will be altered by the effect */
	effect(e: Effect): this
	/** Sets the volume to use in the track */
	volume(v: number): this
	/** Plays a given note */
	play(note: number, duration?: number, options?: NoteOptions): this
	/** Changes a parameter of the current instrument */
	param(pname: string, value: number): this
	/** Changes parameters of instrument or effect */
	params(options: NoteOptions): this
	/** Waits the specified time in seconds before playing the next note */
	sleep(time: number): this
	/** Mutes track audio */
	mute(): this
	/** Unmutes track */
	unmute(): this
	/** Sets global gain for all notes */
	gain(value: number): this
	/** Stops a looping track at the end of the loop */
	stop(): this
	/** Pauses a track at its current position */
	pause(): this
	/** Continues playback of a stopped or paused track */
	continue(): this
}

interface TrackTable {
	[trackName: string]: Track
}

declare let tracks: TrackTable
declare let lc: LiveCoding
`;
/* harmony export (immutable) */ __webpack_exports__["a"] = LC_DEFINITIONS;



/***/ }),
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Track {
    constructor(ac, out, timer) {
        this.ac = ac;
        this.out = out;
        this.timer = timer;
        this.notect = 0;
        this.notes = [];
        this.time = 0;
        this.loop = false;
        this.velocity = 1;
        this.shouldStop = false;
        this.stopped = false;
        this._gain = ac.createGain();
        this._gain.connect(out);
        this.lastGain = this._gain.gain.value;
        this.startTime = this.ac.currentTime;
    }
    // ---------- Timed methods ----------
    instrument(inst) {
        for (let v of inst.voices) {
            v.synth.outGainNode.disconnect();
            v.synth.outGainNode.connect(this._gain);
        }
        this.inst = inst;
        return this;
    }
    volume(v) {
        this.velocity = v;
        return this;
    }
    play(note = 64, duration, options) {
        if (!this.inst)
            throw new Error(`Must call instrument before playing a note or setting parameters`);
        this.notes.push({
            instrument: this.inst,
            number: note,
            time: this.time,
            velocity: this.velocity,
            duration,
            options
        });
        return this;
    }
    params(options) {
        return this.play(0, undefined, options);
    }
    param(pname, value) {
        return this.params({ instrument: this.inst, [pname]: value });
    }
    sleep(time) {
        this.time += time * 60 / this.timer.bpm;
        return this;
    }
    stop() {
        this.shouldStop = true;
        return this;
    }
    pause() {
        this.stopped = true;
        return this;
    }
    continue() {
        this.shouldStop = false;
        this.stopped = false;
        return this;
    }
    // ----------Instantaneous methods ----------
    effect(e) {
        let dst = this._effect ? this._effect.out : this._gain;
        dst.disconnect();
        dst.connect(e.in);
        e.out.connect(this.out);
        this._effect = e;
        return this;
    }
    mute() {
        this.lastGain = this._gain.gain.value;
        this._gain.gain.value = 0;
        return this;
    }
    unmute() {
        this._gain.gain.value = this.lastGain;
        return this;
    }
    gain(value) {
        this._gain.gain.value = value;
        return this;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Track;



/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = setupRoutes;
let oldPage;
let mainRoute;
function setupRoutes(initialRoute) {
    window.onhashchange = showPageFromHash;
    mainRoute = initialRoute;
    showPageFromHash();
    return loadPages();
}
function showPageFromHash() {
    const hash = location.hash || mainRoute;
    $('#page > div').hide();
    $(hash).show().css('outline', 'none').focus();
    if (oldPage)
        $(document).trigger('route:hide', oldPage);
    $(document).trigger('route:show', hash);
    oldPage = hash;
    window.scrollTo(0, 0);
}
function loadPages() {
    return new Promise(resolve => {
        $.get('live-coding.html', data => {
            $('#live-coding').empty().append(data);
            resolve();
        });
    });
}


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = registerButtons;
function registerButtons(editor) {
    $('#walc-font-sm').click(_ => reduceFont(editor));
    $('#walc-font-lg').click(_ => enlargeFont(editor));
    registerShortcuts(editor);
}
function reduceFont(editor) {
    let fs = getFontSize(editor);
    if (fs <= 1)
        return;
    editor.updateOptions({ fontSize: fs - 1 });
}
function enlargeFont(editor) {
    editor.updateOptions({ fontSize: getFontSize(editor) + 1 });
}
function getFontSize(editor) {
    return editor.getConfiguration().fontInfo.fontSize;
}
function registerShortcuts(editor) {
    editor.addAction({
        id: 'walc-font-sm',
        label: 'Reduce code font',
        keybindings: [
            monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA,
            monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_MINUS
        ],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 2,
        run: () => reduceFont(editor)
    });
    editor.addAction({
        id: 'walc-font-lg',
        label: 'Enlarge code font',
        keybindings: [
            monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_DOT,
            monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_EQUAL
        ],
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 2,
        run: () => enlargeFont(editor)
    });
}


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map