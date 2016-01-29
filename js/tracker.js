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

	var tracker = __webpack_require__(20);
	var pianola_1 = __webpack_require__(21);
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
	    i += 4;
	    rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	    i += 4;
	    rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	    rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	    rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	    rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	    i += 4;
	    rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	    i += 4;
	    rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	    rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	    rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(53));
	    rows[i] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(50));
	    i += 4;
	    rows[i] = rowWithNotes(tracker.Note.off(50));
	    return rows;
	}
	function starWars() {
	    var p = new tracker.Part();
	    p.instrument = null; //TODO
	    p.voices = 1;
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
	var pianola = new pianola_1.Pianola($('#past-notes'), $('#piano'), $('#future-notes'));
	var sw = starWars();
	var part = sw.tracks[0].parts[0];
	var tick = 0;
	var rowNum = 0;
	var animationTick = function (_) {
	    if (rowNum > part.rows.length)
	        return;
	    requestAnimationFrame(animationTick);
	    if (tick++ < 15)
	        return;
	    tick = 0;
	    pianola.render(part, rowNum++);
	};
	requestAnimationFrame(animationTick);


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

/***/ 20:
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

/***/ 21:
/***/ function(module, exports, __webpack_require__) {

	var tracker = __webpack_require__(20);
	var piano_1 = __webpack_require__(15);
	var NUM_WHITES = 28;
	var NOTE_COLOR = '#0CC';
	var BASE_NOTE = 24;
	var Pianola = (function () {
	    function Pianola($past, $piano, $future) {
	        this.pkh = new PianoKeyHelper(new piano_1.PianoKeys(NUM_WHITES));
	        this.past = new NoteCanvas($('#past-notes'), NUM_WHITES * 2, this.pkh);
	        this.future = new NoteCanvas($('#future-notes'), NUM_WHITES * 2, this.pkh);
	        this.notes = [];
	        this.oldNotes = [];
	    }
	    Pianola.prototype.render = function (part, currentRow) {
	        this.past.paintNoteColumns(this.past.numRows - currentRow, this.past.numRows);
	        this.future.paintNoteColumns(0, part.rows.length - currentRow);
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
	        this.past.renderNoteRow(y, this.notes);
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
	    function PianoKeyHelper(pk) {
	        this.pk = pk;
	        this.keys = this.pk.createKeys($('#piano'));
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
	        this.gc.fillStyle = '#E0E0E0';
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
	    return NoteCanvas;
	})();


/***/ }

/******/ });
//# sourceMappingURL=tracker.js.map