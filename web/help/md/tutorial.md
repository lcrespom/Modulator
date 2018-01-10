# Live Coding tutorial

## Playing some notes

Let's begin with a simple example that plays 3 notes:

```javascript
// Load an instrument from Modulator patches and change its default name
lc.instrument('Fat Bass', 'bass')
// Create a track and play 3 notes in sequence
lc.track('bass_line', t => t
	.instrument(instruments.bass)
	.play(Note.C3).sleep(1)
	.play(Note.E3).sleep(1)
	.play(Note.G3).sleep(1)
)
```
Go ahead, copy the code inside the editor and click the play button on the top left. You should hear three consecutive notes.

The `lc.instrument` line creates a new instrument from the patch called 'Fat Bass'
and sets its new name to 'bass'. The result is that a new instrument object is created and placed as a new member of the global `instruments` object. Now we can access the instrument in the `instruments.bass` property.

The `lc.track` method expects a track name as its first parameter and a function as its second parameter. When invoked, it creates a new track and immediately calls the provided function, passing the newly created track as a parameter. The user function can then use the provided track object to schedule notes.

Using the *traditional* JavaScript notation, the above `lc.track` call would look like this:

```javascript
lc.track('bass_line', function(track) {
	track.instrument(instruments.bass);
	track.play(Note.C3);
	track.sleep(1);
	track.play(Note.E3);
	track.sleep(1);
	track.play(Note.G3);
	track.sleep(1);
});
```

Using the "fat arrow" `=>` function shorthand, in combination with the fact that all track methods return the track itself, we can make the code much more readable and fluent:

```javascript
lc.track('bass_line', t => t
	.instrument(instruments.bass)
	.play(Note.C3).sleep(1)
	.play(Note.E3).sleep(1)
	.play(Note.G3).sleep(1)
)
```

Both versions of the code have the same effect; it is a user's choice which one to use.

The calls to `play` and `sleep` track methods inside the user function are used to schedule notes to be played by the track at their appropriate times:
- The `play` method is used to specify the note to be played. The method expects a note number, but the `Note` object stores the numbers of all notes from C0 to B8. Sharps and flats are also available. For example, `Note.Cs4` stands for C sharp, octave 4, and `Note.Bb3` stands for B flat, octave 3.
- The `sleep` method is used to specify the time, in seconds, to wait until the next note is played.

The live coding engine sets up a background process that is continuously checking what is the note to play at a given time.


## Keyboard shortcuts
To execute the code in our editor, we can click the play button on the top-left corner of the editor box. Alternatively, you can press the `Ctrl+Alt+Enter` keyboard combination (or `Cmd` instead of `Ctrl` if you are using a Mac).

This keyboard combination is very useful, but sometimes you will need to execute only a line of code, or a group of lines. For that, you can use the second button at the top right of the editor, or the more convenient `Ctrl+Enter` keyboard combination (`Cmd+Enter` for Mac users). If you have some lines of code selected, it will execute the selected code. Otherwise, it will execute the line of code where the cursor is located.

If at any moment you want to immediately stop all audio, you can press the stop button or press `Ctrl+.` (`Cmd+.` for the fancy Mac users).


## Looping

Let's now try the following code:

```javascript
lc.instrument('TB-303', 'lead')
lc.loop_track('melody', t => t
	.instrument(instruments.lead)
	.play(Note.E4).sleep(0.25)
	.play(Note.C4).sleep(0.25)
	.play(Note.G3).sleep(0.25)
	.play(Note.C3).sleep(0.25)
)
```

When you run it, you will hear that it loops endlessly. You can click the stop button any time to end all sound playback. The `lc.loop_track` method is identical to `lc.track`, but creates a looping track that repeats itself over and over. Creating looping tracks and then interactively changing and manipulating them is the main technique for performing live musing, hence the ***Live Coding*** name.


## Updating a playing track

Because we have named our track `melody`, we have access to this looping melody track in the `tracks.melody` object at any time we want to use it. Every time a track is created, it is added to the global `tracks` object with the user-provided name.

Let's modify the volume of the looping track. Write the following code below the previous code:

```javascript
tracks.melody.gain(0, 5)
```

Now place the cursor in that line and press `Ctrl+Enter` (or `Cmd+Enter` if Mac). You should notice how the track volume gradually decreases to 0 during 5 seconds.

Let's now raise the volume to 0.5 in one second. Add the following line and run it:

```javascript
tracks.melody.gain(0.5, 1)
```

Finally, let's stop the track loop by running the following code:

```javascript
tracks.melody.stop()
```

You will notice that the track plays until the end of the loop, and then stops.

Tracks in the `tracks` object have a different set of methods than during the track creation step


## Replacing a looping track
Not let's start over: click the stop button and select and run the code that creates the loop:

```javascript
lc.loop_track('melody', t => t
	.instrument(instruments.lead)
	.play(Note.E4).sleep(0.25)
	.play(Note.C4).sleep(0.25)
	.play(Note.G3).sleep(0.25)
	.play(Note.C3).sleep(0.25)
)
```

Now let's edit the code and change the first note, E4, into D4. Select the code block, from `lc.loop_track(` to its matching `)` and hit `Ctrl+Enter` (or `Cmd+Enter`).
After the current loop ends, the track melody will change accordingly.

What we have just done is creating a new version of the track. The live coding engine schedules the new track to be played at the end of the current loop, and then that track keeps looping.

It is important that the track name is maintained. Otherwise, a new independent track will start playing immediately.

## Multiple tracks

Now, play the previous loop again, and while it is playing copy and run the following code:

```javascript
lc.instrument('Tesla', 'bass')
lc.loop_track('bassLine', t => t
    .instrument(instruments.bass)
    .play(Note.C3).sleep(2)
    .play(Note.G3).sleep(2)
)
```

You can hear two independent instruments playing independent loops. By calling `lc.track` or `lc.loop_track` multiple times and using different track names, we can create multi-track songs. Each track can then be controlled independently using the `tracks.`*`track_name`* property, where *`track_name`* is the name given to the track in the `lc.track` or `lc.loop_track` call.

## Instruments

In the examples above we have seen that instruments are created by calling `lc.instrument` and are assigned to tracks by calling `track.instrument`.

In the examples above, we have created instruments by providing a *patch name* to the `lc.instrument` call, e.g. `'Fat Bass'` or `'TB-303'`. The names of these patches correspond to the patches you find in the Modulator [Synth](../#synth) page. You can also provide the patch number, e.g. `lc.instrument(2, 'lead')` will create an instrument from patch number `2` and store it in `instruments.lead`.

### General Midi standard instruments
You can design great sounds with Modulator's synthesizer. But if you want immediately available instruments, you can also use [General Midi](https://en.wikipedia.org/wiki/General_MIDI) standard instruments. Since those instruments are created from tables of pre-recorded waves, their instrument names are prefixed with `wavetable/` and followed by a standard General Midi number (and then some extra text that we'll explain later). Let's see an example:

```javascript
lc.instrument('wavetable/0000_Aspirin', 'piano')
instruments.piano.duration = 3
let chord = [Note.C3, Note.E3, Note.G3]
lc.track('wavetable_test', t => t
    .instrument(instruments.piano)
    .play_notes(chord, 0.5)
    .sleep(0.5)
    .play_notes(chord)
)
```

If you try that code out, you will hear it sounds just like a real piano. That is because the instrument is created by recording the sound of a real piano at different pitches. This technique is called [Wavetable Synthesis](https://en.wikipedia.org/wiki/Wavetable_synthesis).

The General Midi standard defines 128 different instruments and 47 different percussion sounds. Modulator is taking advantage of the great [WebAudioFont](https://surikov.github.io/webaudiofont/) library by [Srgy Surkv](https://github.com/surikov), which maintains a curated list of GM instruments from different synthesizer models.

How do we know which instrument names are available to use in our `lc.instrument` calls? The (long) list of all possible instrument names is available in [this page](https://surikov.github.io/webaudiofontdata/sound/). For example, for the first instrument, **Acoustic Grand Piano: Piano**, we have 11 different versions of the same sound: `0000_Aspirin_sf2_file`, `0000_Chaos_sf2_file`, etc.

You can play the different instruments in that page and once you have decided for one, just use the instrument name with the `wavetable/` prefix and without the `.html` suffix. For example:

```javascript
lc.instrument('wavetable/0750_Chaos', 'flute')
```

Loads a pan flute sound and stores it in `instruments.flute`.

### Creating instruments from local audio files
If you have audio files in your computer, such as some voice recordings, sound effects or recorded instruments, you can use them as the sound source of instruments. To make those audio files available to the Live Coding environment, simply drag them from your file explorer into the Modulator browser page. You will see that the log panel informs you about the sample being loaded. You can drag and drop multiple files at once, and all will be loaded into memory, ready to be used.

Once you have added the sample, you can create an instrument from it by calling
`lc.instrument('sample/`*`sample-name`*`')`, where *`sample-name`* is the audio file name, without its extension. For example, if you drag and drop `hello.wav`, you can then create an instrument that says "hello" by calling `lc.instrument('sample/hello')`.

By default, instruments created from samples ignore the note you pass them in the `track.play(note)` call, and play at the original pitch of the audio file. If you want to be able to play the audio sample at different pitches, you need to set the instrument's `ignoreNote` parameter to `false`. For example:

```javascript
lc.instrument('sample/hello')
instruments.hello.param('ignoreNote', false)
lc.track('test', t => t
	.instrument(instruments.hello)
	.play(Note.A4)
)
```

The code above will play the `hello` sample at its original pitch, because we are playing the **A4** note, which is the default base note. If you now change **A4** into **A5** and run the code again, you will notice that the sound plays one octave higher, and also twice as fast. This is an effect of sample playback: when you play a sample at higher pitches, its playback speed increases, and likewise, the speed decreases for lower pitches.

You can change the `baseNote` parameter to any note number you want, and the playback pitch will be calculated accordingly.

You can also loop your sound by changing the `loops` parameter to the number of times you want it to loop. So if you call `instruments.hello.param('loops', 3)`, the sound will repeat itself 3 times. By default, the sound will play from start to end and then repeat itself from the start. You can change the loop start and end times with the `loopStart` and `loopEnd` parameters, respectively.


## Effects

Audio effects transform the sound generated by instruments, and they can be added to tracks to make their final sound more interesting. Let's try the following code:

```javascript
lc.instrument('Bells', 'bells')
lc.effect('BiquadFilter', 'filter')
effects.filter.param('frequency', 4000)

lc.loop_track('melody', t => t
	.instrument(instruments.bells)
    .effect(effects.filter)
    .play_notes([Note.C3, Note.E3, Note.G3, Note.C4], 0.5)
)
```

The `lc.effect` call in the second line creates a `BiquadFilter` effect and stores it in `effects.filter`. Then in line 3 we are setting the `frequency` parameter of the filter to 4000 hertz. With that filter setting, you can notice that the bells sound quite bright.

Now while the loop is playing, add the following line and run it individually (remember, `Ctrl+Enter` or `Cmd+Enter`):

```javascript
effects.filter.param('frequency', 400, 5)
```

We are changing the filter's frequency to 400 hertz, but the change is not immediate: it will gradually change from 4000 to 400 during 5 seconds, as specified in the third parameter of our `param` call.

While live playing some looping tracks, you can interactively change instruments and effects parameters using the `param` method.

### The Tuna effect library
The first parameter of the `lc.effect` method is the effect name. How do we know which effects we have available? Modulator uses the standard [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) effects: BiquadFilter, Gain, Delay, Panner, DynamicsCompressor, etc.

However those effects are quite rudimentary. For more interesting effects, Modulator takes advantage of the famous [Tuna](https://github.com/Theodeus/tuna) effect library.

To create an effect from this library, just prefix the effect name with `tuna/` and select one of the effects listed [here](https://github.com/Theodeus/tuna/wiki).

For example, let's change the previous `BiquadFilter` with a stereo ping-pong delay:

```javascript
lc.instrument('Bells', 'bells')
lc.effect('tuna/PingPongDelay', 'delay')
effects.filter.param('frequency', 4000)

lc.loop_track('melody', t => t
    .instrument(instruments.bells)
    .effect(effects.delay)
    .play_notes([Note.C3, Note.E3, Note.G3, Note.C4], 0.5)
)
```

Notice the difference? You can play with the parameters to change the delay times, mix levels, etc. The parameter names are specified in the same page where the effects are documented.


## Scales
Although the tutorial has not explained the `track.play_notes` method, it has been used in a couple of examples; `play_notes` is similar to `play`, but instead of a single note it accepts an array of notes, and an optional time or array of times.

For example, `track.playNotes([Note.C3, Note.E3], 1)` will play C3 and E3 in sequence, separated by 1 second time. If no time parameter is specified, then all notes are played at the same time, that is, as a chord.

The `lc.scale` method can be used to create arrays of notes according to a given scale. Let's try the following code:

```javascript
lc.instrument('Bells', 'bells')
lc.track('melody', t => t
    .instrument(instruments.bells)
    .play_notes(lc.scale(Note.C3), 0.8)
)
```

You will hear all the notes of the C major scale, from C3 to C4. The parameters of `lc.scale` are the following:
- A mandatory note number
- An optional scale name, either "major", "minor", "major_pentatonic", "minor\_pentatonic" and "chromatic". It defaults to "major".
- An optional number of octaves, defaulting to 1.


## Rings
There is a lot of interesting things we can do with arrays of notes to create melodies, such as transposing them, selecting some notes at the start or end, shuffling them, etc. For that purpose, the Live Coding API provides the `Ring` class, which extends the `Array` class with additional convenient methods.

The `lc.scale` method actually returns a Ring object, not just an Array. You can also create a ring from an array by invoking its `ring()` method. For example, the following code creates a ring containing the numbers from 60 to 63:

```javascript
let r = [60, 61, 62, 63].ring()
```

Let's play a scale:

```javascript
lc.instrument('TB-303', 'lead')
let notes = lc.scale(Note.C3, 'major_pentatonic')
lc.loop_track('melody', t => t
	.instrument(instruments.lead)
	.play(notes.tick()).sleep(0.5)
)
```

This loop plays all the notes in the pentatonic scale. It makes use of the `tick` method of the Ring class, which selects one element at a time and increments the counter. Once the element counter has reached the end of the array, it will go back to the start, hence the *ring* name.

We can play around with ring methods for fancy melodies, for example:

```javascript
lc.instrument('TB-303', 'lead')
instruments.lead.duration = 0.1
let notes = lc.scale(Note.C3, 'major_pentatonic')
lc.track('melody', t => t
	.instrument(instruments.lead)
	.play_notes(notes.reflect(), 0.25)
)
```

The `reflect` method inverts the contents of the ring and appends it to its end, without repeating the last note of the original ring.

Or we can replace the `notes.reflect()` call with `notes.shuffle()` which will randomly shuffle the notes of the scale. There are many more ring manipulation methods available that you can check in the live coding [API](#lc-definitions.ts).


## Randomness
We have seen that the `shuffle` method randomly reorders the elements of a ring.
We also have the `choose` method, which randomly selects an element.

There is a `random` object that is available for generating random numbers. For example, `random.integer(50, 70)` returns a random integer between 50 and 70, both inclusive. Or you can call `random.dice(6)` to get a random number between 1 and 6. As usual, you can check the [API](#lc-definitions.ts) for all the available methods.

For music composition, randomness is helpful, but once we have found a nice random pattern, we want to be able to repeat it again. That is why Modulator uses a predictable random number generator, which is reset every time some code is run.

So if you run a track containing `notes.shuffle()` and then run it again, it will shuffle the notes exactly the same way as before. If you want it to shuffle differently, you must call `random.seed` and pass it an arbitrary seed number, such as `random.seed(123)`. You will then see that your notes are shuffled differently, but every time you run the same code the shuffling will be identical. And that is convenient, because once we have found an interesting random melody after testing different seed values, we will want to keep it.

## Logging
When something does not work as expected, it is very handy to write some data to the log window and see what is going on.
We can use the `lc.log` method and pass any arguments we want, and they will be appended to the Log box at the right of the code. For example:

```javascript
lc.log('Current BPM: ' + lc.bpm())
```

Will log the current BPM.

Because notes and other track events are being added to the log when music is playing, you can disable event tracing by invoking `lc.log_enable(false)`, and enable it back with `lc.log_enable(true)`.

Finally, if you want to clear the log box, you can invoke `lc.clear_log()`.
