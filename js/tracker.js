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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var piano_1 = __webpack_require__(15);
	var NUM_WHITES = 28;
	var pk = new piano_1.PianoKeys(NUM_WHITES);
	var keys = pk.createKeys($('#piano'));
	setupCanvas('past-notes');
	setupCanvas('future-notes');
	function setupCanvas(id) {
	    var canvas = $('#' + id)[0];
	    paintNoteColumns(canvas, canvas.getContext('2d'), NUM_WHITES * 2);
	}
	function paintNoteColumns(canvas, gc, numKeys) {
	    var w = canvas.width / numKeys;
	    var x = w / 2;
	    gc.translate(-0.5, -0.5);
	    gc.fillStyle = '#E0E0E0';
	    var oldx = 0;
	    for (var i = 0; i < numKeys - 1; i++) {
	        if (i % 2)
	            gc.fillRect(Math.round(x), 0, Math.round(x - oldx), canvas.height);
	        oldx = x;
	        x += w;
	    }
	}


/***/ },

/***/ 5:
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

/***/ 9:
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

/***/ 15:
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
	        var bw = kw * 2 / 3;
	        var bh = ph * 2 / 3;
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


/***/ }

/******/ });
//# sourceMappingURL=tracker.js.map