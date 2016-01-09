#SynthLib
SynthLib is a standalone, UI-independent library that can load and play instruments
created with [Modulator](https://github.com/lcrespom/Modulator).
Synthlib is small: it takes less than 18 kb minified and less than 5kb gzipped.

Synthlib exposes a global object called "Modulator", containing two classes that
can be instantiated and used by the application:

- Voice: a monophonic synthesizer
- Instrument: a polyphonic synthesizer that maintains an array of voices
	and delegates on them to play individual notes

##Voice class
A voice object is responsible for loading a Modulator patch into a
monophonic synthetizer, and then sending note events to it.

####constructor(ac, json, dest)
Creates a new Voice instance, loading the synthesizer definition from
a parsed JSON object, obtained from a previously-saved Modulator patch.

- **ac**: the AudioContext to be used for generating the sound.
- **json**: the object resulting from the parsing of a previosly-saved
	Modulator patch.
- **dest**: an optional destination AudioNode. If not specified, the
	*destination* property of the *ac* parameter will be used.

####noteOn(midi, velocity, when)
Sends a noteOn event to the synthesizer, equivalent to pressing a
key in the synthesizer keyboard.

- **midi**: the MIDI note number, starting at 0 for C0, 12 for C1, and
	so on.
- **velocity**: the force with which the key was stricken, from 0 to 1.
	If not specified, it defaults to 1, i.e. full force. Currently most
	audio nodes ignore this parameter, so the default can be used.
- **when**: the AudioContext time when the note event should be executed.
	If not specified, the note will be played immediately.

####noteOff(midi, velocity, when)
Sends a noteOff event to the synthesizer, equivalent to releasing a key
in the synthesizer keyboard.

- **midi**: the MIDI note number, same as with the *noteOn* method.
- **velocity**: the speed with which the key was released, from 0 to 1.
	If not specified, it defaults to 1, i.e. maximum speed. Same as with the
	*noteOn* method, the parameter is ignored in most if not all cases, so
	the default can be used.
- **when**: the AudioContext time when the note event should be executed.
	If not specified, the note will be stopped immediately.

####close()
To be called upon shutdown in order to ensure that all sounds are stopped.

##Instrument class
An instrument object is handles an array of voices, and forwards *noteOn* / *noteOff*
calls to them in order to implement a polyphonic synthesizer.

####constructor(ac, json, numVoices, dest)
Creates a new Instrument instance, loading a patch from a parsed JSON
object into each of its voices.

- **ac**: the AudioContext to be used for generating the sound of all voices.
- **json**: the object resulting from the parsing of a previosly-saved
	Modulator patch.
- **numVoices**: the number of voices to use for polyphony.
- **dest**: an optional destination AudioNode. If not specified, the
	*destination* property of the *ac* parameter will be used.

####noteOn(midi, velocity, when)
Forwards the *noteOn* call to one of the voices. Currently the voice selection criterion
is based on the least-recently started note. The parameters are the same as with the
Voice class *noteOn* method.

####noteOff(midi, velocity, when)
Forwards the *noteOff* call to the voice that was selected for the corresponding
*noteOn* call. The parameters are the same as with the Voice class *noteOff* method.

####close(): void
To be called upon shutdown in order to ensure that all sounds are stopped. It will
forward the close call to all its voices.


##Example
```JavaScript
function playSynthDemo() {
	// Setup instrument
	var ac = new AudioContext();
	var json = { /* JSON from a patch saved from Modulator */ };
	var instrument = new Modulator.Instrument(ac, json, 4);

	// Setup score
	var KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
	var score = 'Q   T   REWI   T   REWI   T   RERW      ';
	var notes = score.split('').map(function(k) {
		return k != ' ' ? 36 + KB_NOTES.indexOf(k) : 0;
	});
	var lastNote = 0;
	var ct = 0;

	// Timer to play score
	function tick() {
		var note = notes[ct++];
		if (ct > score.length) {
			instrument.noteOff(lastNote);
			return;
		}
		if (note > 0) {
			instrument.noteOn(note);
			if (lastNote) instrument.noteOff(lastNote);
			lastNote = note;
		}
		setTimeout(tick, 150);
	}

	tick();
}
```