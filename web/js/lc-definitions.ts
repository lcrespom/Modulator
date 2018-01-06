// tslint:disable:max-line-length

/**
 # Live Coding API
 The Live Coding page lets the user enter any valid JavaScript code
 and execute it under the application environment, which exposes
 an API oriented to real-time music performance and provides access
 to the synthesizer instruments and effects.

This document describes all the available API elements using the
[TypeScript](https://www.typescriptlang.org/) language, which is a superset
of JavaScrpit with additional type information. The API TypeScript
definitions are used by the code editor in order to provide helpful code
completion and error validation.
 */

// ------------------------- The LiveCoding API ------------------------------

/**
The `lc` global variable implements the LiveCoding interface, and can be used to invoke its methods.
For example, `lc.bpm(120)` will set the global BPM to 120 Beats Per Minute.
*/
declare let lc: LiveCoding

/**
The **LiveCoding** interface provides the main API entry point, and is used to
create instruments, effects and tracks, and controlling global settings.
*/
interface LiveCoding {
	/** Creates a new instrument and stores it in the global `instruments` table. It can then be used by a track to play its notes with it.
	@param preset The preset to be used to create the instrument.
	If a number is used, it corresponds to the present number as displayed in the *Presets* box in the main Modulator page.
	If a string is used, it corresponds either to the preset as displayed in the *Presets* box or a wavetable instrument name.
	If an object is used, it should be a JSON object in the format of a preset downloaded from	Modulator.
	@param name An optional instrument name. This name will be used to store it in the `instruments` table. For example, if name == 'flute', then `instruments.flute` will hold an instance to the instrument.
	@param numVoices an optional number of voices to be used by the instrument. It defaults to 4 voices, meaning that 4 independent notes can be played simultaneously.
	*/
	instrument(preset: number | string | PresetData,
		name?: string, numVoices?: number): Instrument

	/** Creates an effect and stores it in the global `effects` table, available to be used by a track to modify its sound.
	@param name a name that identifies the effect. It can either be a WebAudio processing node or a [Tuna](https://github.com/Theodeus/tuna) effect.
	@param newName an optional name to be used to store the effect in the global `effects` table.
	*/
	effect(name: string, newName?: string): Effect

	/** Creates a named track and calls the provided callback, passing the newly created track, ready to be used for playing notes with it.
	The track is also stored in the global `tracks` variable, so it can be used to control it any time during playback.
	@param name The track name, used to store it in the global `tracks` table.
	@param cb A callback function receiving the track as the parameter.
	*/
	track(name: string, cb: TrackCallback): this

	/** Creates a looping track, which will play its notes and then repeat from the
	beginning until instructed to stop.
	@param name The track name, used to store it in the global `tracks` table.
	@param cb a callback function receiving the track as the parameter.
	*/
	loop_track(name: string, cb: TrackCallback): this

	/** Creates a ring of notes of a given scale, starting at the specified note.
	@param note The base note of the scale, e.g. 60 or Note.C4
	@param type An optional string with the name of the scale, either one of:
	- major (default value)
	- major_pentatonic
	- minor
	- minor_pentatonic
	- chromatic
	@param octaves An optional number indicating how mani octaves the scale should cover. It defaults to 1.
	*/
	scale(note: number, type?: string, octaves?: number): Ring<number>

	/** Prints all the arguments in the log panel. */
	log(...args: any[]): this

	/** Enables or disables logging of events such as notes being played.
	The `lc.log(...)` method always prints to the log panel, regardless of whether this is enabled or disabled.
	@param flag Optional, defaults to true. If true, event tracing is enabled,otherwise it is disabled.
	*/
	log_enable(flag?: boolean): this

	/** Clears the log panel. */
	log_clear(): this

	/** Queries or changes the global BPM (Beats Per Minute).
	@param value if specified, the BPM is changed, and new tracks will use it as its timing rule. Notice that this does not affect currently playing tracks. If not specified, it returns the current BPM value.
	*/
	bpm(value?: number): number | this

	/** Pauses all tracks at their current position. */
	pause(): this

	/** Continues playback of stopped or paused tracks. */
	continue(): this

	/** Stops all looping track at the end of their loop. */
	stop(): this

	/** Immediately stops and deletes all tracks. */
	reset(): this

	/** This is an advanced, very optional method to be used only in case some external resources must be manually initialized.
	In most cases, the LiveCoding API will handle this process behind the scenes.
	The passed function callback should be used to load or setup asynchronous resources such as sample downloading.
	The function should either be an `async` function or return a `Promise`.
	Tracks will not start playing until the function's promise has been fulfilled.
	@param initFunc The user's asynchronous function.
	*/
	init(initFunc: () => void): this

	/** The AudioContext used by the LiveCoding engine.
	In most cases, the user should not directly manipulate the AudioContext,
	because the API provides higher level functions to make music.
	*/
	// tslint:disable-next-line:member-ordering
	context: AudioContext
}


// -------------------- Instruments, effects and tracks -------------------------

/** The `instruments` global variable holds all instruments created by `lc.instrument()`. */
declare let instruments: {
	[instrName: string]: Instrument
}

/** Instruments are intended to be used by tracks in order to define how
its notes should sound. The **instrument** interface provides methods for
fine-tuning its parameters.
 */
interface Instrument {
	/** The instrument name is the name of the preset used to create
	the instrument, unless the user provided a different name when
	creating it.
	 */
	name: string
	/** Default note duration, in seconds. This determines how long
	the sound is held during note playback.
	 */
	duration: number
	/** Gets or sets the value of an instrument parameter.
	If no value is provided, then the current parameter value is returned.
	If a value is provided, the instrument parameter is modified, probably altering how the instrument will sound.
	@param pname Parameter name. The parameter names of an instrument can be obtained using the paramNames method.
	@param value Optional. If provided, the new parameter value to be set.
	@param rampTime Optional. If provided, the parameter will be modified gradually, progressing from its current value to the new one during the specified amount of time.
	@param exponential Optional. If specified, determines whether the ramp is linear (parameter set to false) or exponential (parameter set to true).
	The default ramp is exponential, so that the ramp takes longer at smaller values.
	 */
	param(pname: string, value?: number,
		rampTime?: number, exponential?): number | this
	/** Returns the list of parameter names available to be changed with the `param` method. */
	paramNames(): string[]
}

/** The `effects` global variable holds all effects created by `lc.effect()`. */
declare let effects: {
	[effectName: string]: Effect
}

/** Effects allow altering the sound output generated by a track.
The **Effect** interface provides methods for changing its parameters,
either at the start of a song or interactively during playback.
*/
interface Effect {
	/** The effect's name. */
	name: string
	/** Gets or sets the value of an effect parameter.
	If no value is provided, then the current parameter value is returned.
	If a value is provided, the effect parameter is modified, probably altering how the effect transforms the sound.
	@param pname Parameter name. The parameter names of an effect can be obtained using the paramNames method.
	@param value Optional. If provided, the new parameter value to be set.
	@param rampTime Optional. If provided, the parameter will be modified gradually, progressing from its current value to the new one during the specified amount of time.
	@param exponential Optional. If specified, determines whether the ramp is linear (parameter set to false) or exponential (parameter set to true).
	The default ramp is exponential, so that the ramp takes longer at smaller values.
	 */
	param(name: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this
	/** Returns the list of parameter names available to be changed with the `param` method. */
	paramNames(): string[]
}

/** The `tracks` global variable holds all tracks created by `lc.track()` or lc.loop_track() */
declare let tracks: {
	[trackName: string]: TrackControl
}

/** The **Track** interface provides access to time-based functions such as playing notes, waiting for a specified time, etc.
When `lc.track()` or `lc.loop_track()` is invoked, this is the callback parameter.
An example of the usage pattern is the following:
```javascript
	lc.loop_track('lead', t => t
		.instrument(instruments.piano)
		.play(Note.C4).sleep(1)
		.play(Note.E4).sleep(1)
		.play(Note.G4).sleep(1)
	)
```
  */
interface Track {
	/** For looping tracks, counts how many times the loop has executed. */
	loopCount: number
	/** Sets the instrument to be used by the notes played in the track. */
	instrument(inst: Instrument): this
	/** Adds an effect to the track. All sound played in the track will be immediately altered by the effect.
	Multiple effects can be added to a track, but once an effect has been added, it cannot be removed.
	@param e The effect to be added.
	*/
	effect(e: Effect): this
	/** Sets the volume to use in the track for playing the subsequent notes. */
	volume(v: number): this
	/** Plays a given note.
	@param note The note MIDI number. The Note enum can be used for convenience - for example, Note.A3 is easier to remember than 57.
	@param duration Optional. The time in seconds during which the note sound will be held.
	If not specified, the default instrument.duration value is used.
	This time should not be confused with the sleep time: a note can sound while other notes are being played. The duration determines how long a note sounds, while the sleep time (provided by the sleep method) determines when will the next note start.
	@param options Optional. A NoteOptions object specifying parameter names and values to be changed in a given instrument or effect.
	*/
	play(note: number, duration?: number, options?: NoteOptions): this
	/** Plays several notes in sequence or as a chord.
	@param notes the array of notes to be played.
	@param times Optional. If not specified, notes will be played as a chord, i.e., all at the same time.
	If specified, notes will be played one after the other after the specified time (if parameter is a number) or times (if the parameter is an array)
	@param durations Optional. If specified, the duration or durations to be used for each note.
	 */
	play_notes(notes: number[], times?: number | number[], durations?: number | number[]): this
	/** Transposes the notes to be played after this point in the specified amount of semitones. */
	transpose(notes: number): this
	/** Changes a parameter of the current instrument.
	@param pname The parameter name.
	@param value The new value to be set.
	 */
	param(pname: string, value: number): this
	/** Changes parameters of instrument or effect.
	@param options A NoteOptions object specifying parameter names and values to be changed in a given instrument or effect.
	 */
	params(options: NoteOptions): this
	/** Waits the specified **time** in seconds before playing the next note. */
	sleep(time: number): this
	/** Repeats the provided callback a given number of times. */
	repeat(times: number, cb: (i?: number) => void): this
}

/** The **TrackControl** interface provides access to a playing track in order
to control its general status, such as muting, pausing, adding an effect, etc. */
interface TrackControl {
	/** Adds an effect to the track. All sound played in the track will be
	altered by the effect. */
	effect(e: Effect): this
	/** Mutes the track audio. */
	mute(): this
	/** Unmutes the track. */
	unmute(): this
	/** Sets global gain (volume) for all notes. */
	gain(value: number, rampTime?: number): this
	/** Stops a looping track at the end of the loop. */
	stop(): this
	/** Pauses a track at its current position. */
	pause(): this
	/** Continues playback of a stopped or paused track. */
	continue(): this
	/** Stops and deletes the track from the tracks object. */
	delete(): void
}

/** A global area to store any data to be used across executions. */
declare let global: any


// -------------------- Rings -------------------------

/** A ring is an array extended with immutable operations and a convenient
tick() iterator. */
interface Ring<T> extends Array<T> {
	/** Returns the current element and increments the position counter.
	If the position counter goes past the end of the ring, it wraps to
	the start of the ring. */
	tick(): T
	/** Returns a random member of the ring. */
	choose(): T
	/** Creates a copy of the ring. */
	clone(): Ring<T>
	/** Returns a reversed copy of the ring. */
	reverse(): Ring<T>
	/** Returns a shuffled copy of the ring. */
	shuffle(): Ring<T>
	/** Returns a new ring containing only the first **n** elements. */
	take(n: number): Ring<T>
	/** Returns a new ring containing everything but the first **n** elements. */
	drop(n: number): Ring<T>
	/** Returns a new ring with the last element missing. */
	butlast(): Ring<T>
	/** Returns a new ring with the last **n** elements missing. */
	drop_last(n: number): Ring<T>
	/** Returns a new ring with only the last **n** elements. */
	take_last(n: number): Ring<T>
	/** Repeats each element in the ring **n** times. */
	stretch(n: number): Ring<T>
	/** Repeats the entire ring **n** times. */
	repeat(n: number): Ring<T>
	/** Adds the ring to a reversed version of itself . */
	mirror(): Ring<T>
	/** Adds the ring to a reversed version of itself,
	without duplicating the middle value . */
	reflect(): Ring<T>
	/** Returns a new ring with all elements multiplied by **n**
	(assumes ring contains numbers only). */
	scale(n: number): Ring<T>
	/** Returns a new ring with **n** added to all elements
	(assumes ring contains numbers only). */
	transpose(n: number): Ring<T>
}

/** The system Array prototype is extended to provide a `ring` method, to create a ring from any array.
 */
interface Array<T> {
	/** Creates a ring from an array. */
	ring: () => Ring<T>
}


// -------------------- Notes -------------------------

/** The global `Note` enum contains the MIDI number of all notes from octave 0 to 8.
 */
const enum Note {
	C0 = 12, Cs0 = 13, Db0 = 13, D0 = 14, Ds0 = 15, Eb0 = 15,
	E0 = 16, F0 = 17, Fs0 = 18, Gb0 = 18, G0 = 19, Gs0 = 20,
	Ab0 = 20, A0 = 21, As0 = 22, Bb0 = 22, B0 = 23,
	C1 = 24, Cs1 = 25, Db1 = 25, D1 = 26, Ds1 = 27, Eb1 = 27,
	E1 = 28, F1 = 29, Fs1 = 30, Gb1 = 30, G1 = 31, Gs1 = 32,
	Ab1 = 32, A1 = 33, As1 = 34, Bb1 = 34, B1 = 35,
	C2 = 36, Cs2 = 37, Db2 = 37, D2 = 38, Ds2 = 39, Eb2 = 39,
	E2 = 40, F2 = 41, Fs2 = 42, Gb2 = 42, G2 = 43, Gs2 = 44,
	Ab2 = 44, A2 = 45, As2 = 46, Bb2 = 46, B2 = 47,
	C3 = 48, Cs3 = 49, Db3 = 49, D3 = 50, Ds3 = 51, Eb3 = 51,
	E3 = 52, F3 = 53, Fs3 = 54, Gb3 = 54, G3 = 55, Gs3 = 56,
	Ab3 = 56, A3 = 57, As3 = 58, Bb3 = 58, B3 = 59,
	C4 = 60, Cs4 = 61, Db4 = 61, D4 = 62, Ds4 = 63, Eb4 = 63,
	E4 = 64, F4 = 65, Fs4 = 66, Gb4 = 66, G4 = 67, Gs4 = 68,
	Ab4 = 68, A4 = 69, As4 = 70, Bb4 = 70, B4 = 71,
	C5 = 72, Cs5 = 73, Db5 = 73, D5 = 74, Ds5 = 75, Eb5 = 75,
	E5 = 76, F5 = 77, Fs5 = 78, Gb5 = 78, G5 = 79, Gs5 = 80,
	Ab5 = 80, A5 = 81, As5 = 82, Bb5 = 82, B5 = 83,
	C6 = 84, Cs6 = 85, Db6 = 85, D6 = 86, Ds6 = 87, Eb6 = 87,
	E6 = 88, F6 = 89, Fs6 = 90, Gb6 = 90, G6 = 91, Gs6 = 92,
	Ab6 = 92, A6 = 93, As6 = 94, Bb6 = 94, B6 = 95,
	C7 = 96, Cs7 = 97, Db7 = 97, D7 = 98, Ds7 = 99, Eb7 = 99,
	E7 = 100, F7 = 101, Fs7 = 102, Gb7 = 102, G7 = 103, Gs7 = 104,
	Ab7 = 104, A7 = 105, As7 = 106, Bb7 = 106, B7 = 107,
	C8 = 108, Cs8 = 109, Db8 = 109, D8 = 110, Ds8 = 111, Eb8 = 111,
	E8 = 112, F8 = 113, Fs8 = 114, Gb8 = 114, G8 = 115, Gs8 = 116,
	Ab8 = 116, A8 = 117, As8 = 118, Bb8 = 118, B8 = 119
}


// -------------------- Predictable random -------------------------

/** A *predictable* random number generator which will always return
the same sequence of numbers from the start of the program. */
declare let random: Random

/** The **Random** interface defines the methods available in the predictable random number generator. */
interface Random {
	/** Initializes the random generator with a given seed. */
	seed(newSeed?: number): number
	/** Returns a floating-point number between **from** and **to**. */
	float(from: number, to?: number): number
	/** Returns an integer number between **from** and **to**. */
	integer(from: number, to: number): number
	/** Returns an integer number between 1 and **sides**. */
	dice(sides: number): number
	/** Returns **true** once every **times**, on average. */
	one_in(times: number): boolean
	/** Randomly chooses an element of the passed data. */
	choose(...args: any[]): any
}


// -------------------- Other structures -------------------------

/** The callback function type used by `lc.track()` and `lc.loop_track()`. */
type TrackCallback = (t: Track) => void

/** Options that can be passed to track.play() in order to change
instrument parameters. */
interface InstrumentOptions {
	instrument: Instrument
	[k: string]: number | Instrument
}

/** Options that can be passed to track.play() in order to change
effect parameters. */
interface EffectOptions {
	effect: Effect
	[k: string]: number | Effect
}

/** Options that can be passed to track.play() in order to change
effect or instrument parameters. */
type NoteOptions = InstrumentOptions | EffectOptions

/** Structure used by a preset JSON data saved from Modulator synth. */
interface PresetData {
	name: string
	nodes: any[]
	nodeData: any[]
	modulatorType: string
}

