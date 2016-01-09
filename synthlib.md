#SynthLib
SynthLib is a standalone, UI-independent library that can load and play instruments
created with [Modulator](https://github.com/lcrespom/Modulator).
Synthlib is small: it takes 19 kb minified and 5kb gzipped.

Synthlib exposes a global object called "Modulator", containing three classes that
can be instantiated and used by the application:

- Voice: a monophonic synthesizer
- Instrument: a polyphonic synthesizer that maintains an array of voices
	and delegates on them to play individual notes
- Timer: a high precision timer, to be used by the application for triggering
	notes at specific times

##Voice class
A voice object is responsible for loading a Modulator patch into a
monophonic synthetizer, and then sending note events to it.

####constructor(ac, json, dest)
Creates a new Voice object, loading the synthesizer definition from
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
Creates a new Instrument object, loading a patch from a parsed JSON
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

####close()
To be called upon shutdown in order to ensure that all sounds are stopped. It will
forward the close call to all its voices.


##Timer class
This timer uses the technique documented by Chris Wilson in his article
*[A Tale of Two Clocks](http://www.html5rocks.com/en/tutorials/audio/scheduling/)*,
in order to ensure notes are played at the precise time according to a specified
tempo.

####constructor(ac, bpm = 60, interval = 0.025, ahead = 0.1)
Creates a timer object, using a specified AudioContext and tempo. The additional
timing precision parameters *interval* and *ahead* can be safely left out, and
the timer will use good defaults. For an understanding of how those timing parameters
are used, refer to the article mentioned above.

- **ac**: the AudioContext to be used for getting precise time measurements.
- **bpm**: an optional tempo, specified in Beats Per Measure (BPM). If not specified,
	the default value of 60 BPM will be used.
	The BPM parameter can be changed later on at any time by accessing the *bpm*
	property, and the timer will pick it up and use it in the next tick.
- **interval**: an optional timeout interval time, which will be used by
	the timer to schedule itself. If not specified, it will default to 25 milliseconds.
- **ahead**: an optional time gap to schedule future note events. If not specified,
	it will default to 100 milliseconds.

####start(callback)
Starts the timer, which will periodically invoke the provided callback function.

- **callback**: a user function that will be invoked once for every note frame.
	There are BPM * 4 frames in a minute, so for example a BPM of 120 has
	8 note frames per second.
	The callback receives a *time* parameter which should be passed to the
	corresponding *when* parameter of the Voice or Instrument noteOn and noteOff
	methods, in order to accurately time the moment when the note should be
	played.

The *start()* method can be invoked several times in combination with the *stop()* method.
The *callback* parameter is only required in the first call.
If not specified, later calls to start() will use the previously specified callback.

A call to *start()* when the timer is already started has no effect.

####stop()
Stops the timer, so that the callback is no longer invoked periodically. As described
above, the *start()* and *stop()* methods can be invoked several times, and the timer
will start / stop / resume / stop again / etc. accordingly.
Calls to *stop()* when the timer is already stopped has no effect.



##Example
```JavaScript
function playSynthDemo() {
	// Setup voice
	var json = { /* JSON from a patch saved from Modulator */ };
	var ac = new AudioContext();
	var voice = new Modulator.Voice(ac, json);

	// Setup score
	var KB_NOTES = 'ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P';
	var score = 'Q   T   REWI   T   REWI   T   RERW      ';
	var notes = score.split('').map(function(k) {
		return k != ' ' ? 36 + KB_NOTES.indexOf(k) : 0;
	});
	var lastNote = 0;
	var ct = 0;

	// Setup timer to play score
	var timer = new Modulator.Timer(ac);
	timer.start(time => {
		var note = notes[ct++];
		if (ct > score.length) {
			voice.noteOff(lastNote, time);
			timer.stop();
		}
		else if (note > 0) {
			if (lastNote) voice.noteOff(lastNote, time);
			voice.noteOn(note, time);
			lastNote = note;
		}
	});

}
```