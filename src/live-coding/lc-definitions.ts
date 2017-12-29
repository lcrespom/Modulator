export const LC_DEFINITIONS = `
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
	param(name: string, value?: number, rampTime?: number, exponential = true): number | this
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
	effect(name: string, newName?: string): Effect
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
	/** The AudioContext, for the daring ones */
	context: AudioContext
}

interface TrackControl {
	/** Adds an effect to the track. All sound played in the track will be altered by the effect */
	effect(e: Effect): this
	/** Mutes track audio */
	mute(): this
	/** Unmutes track */
	unmute(): this
	/** Sets global gain for all notes */
	gain(value: number, rampTime?: number): this
	/** Stops a looping track at the end of the loop */
	stop(): this
	/** Pauses a track at its current position */
	pause(): this
	/** Continues playback of a stopped or paused track */
	continue(): this
}

interface Track {
	/** Sets the instrument to play in the track */
	instrument(inst: Instrument): this
	/** Adds an effect to the track. All sound played in the track will be immediately
	altered by the effect */
	effect(e: Effect): this
	/** Sets the volume to use in the track */
	volume(v: number): this
	/** Plays a given note */
	play(note: number, duration?: number, options?: NoteOptions): this
	/** Transposes notes the specified amount */
	transpose(notes: number): this
	/** Changes a parameter of the current instrument */
	param(pname: string, value: number): this
	/** Changes parameters of instrument or effect */
	params(options: NoteOptions): this
	/** Waits the specified time in seconds before playing the next note */
	sleep(time: number): this
}

interface TrackTable {
	[trackName: string]: TrackControl
}

declare let tracks: TrackTable

interface EffectTable {
	[effectName: string]: Effect
}

declare let effects: EffectTable

declare let lc: LiveCoding
`
