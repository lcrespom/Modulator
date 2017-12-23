export const LC_DEFINITIONS = `
interface Instrument {
	/** Name of the preset used to create the instrument */
	name: string
	/** Default note duration, in seconds */
	duration: number
	/** Gets or sets the value of a parameter */
	param(node: string, name: string, value?: number): number | this
}

interface Effect {
	/** Effect name */
	name: string
	/** Gets or sets the value of a parameter */
	param(name: string, value?: number): number | this
}

type TrackCallback = (t: Track) => void;

interface LiveCoding {
	/** Creates an instrument from a preset name or number */
	instrument(preset: string | number, numVoices?: number): Instrument
	/** Creates an effect */
	effect(name: string): Effect
	/** Creates a named track */
	track(name: string, cb?: TrackCallback): Track
	/** Creates a looping track */
	loop_track(name: string, cb?: TrackCallback): Track
	/** Enables or disables logging */
	use_log(enable = true): void
}

interface Track {
	/** Sets the instrument to play in the track */
	instrument(inst: Instrument): this
	/** Adds an effect to the track. All sound played in the track will be altered by the effect */
	effect(e: Effect): this
	/** Sets the volume to use in the track */
	volume(v: number): this
	/** Plays a given note */
	play(note: number, duration?: number, options?: any): this
	/** Waits the specified time in seconds before playing the next note */
	sleep(time: number): this
}


declare let lc: LiveCoding
`
