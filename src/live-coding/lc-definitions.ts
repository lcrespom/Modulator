export const LC_DEFINITIONS = `
interface Instrument {
	/** Name of the preset used to create the instrument */
	name: string
	/** Default note duration, in seconds */
	duration: number
}

type TrackCallback = (t: Track) => void;

interface LiveCoding {
	/** Creates an instrument from a preset name or number */
	instrument(preset: string | number, numVoices?: number): Instrument;
	/** Creates a named track */
	track(name: string, cb?: TrackCallback): Track;
	/** Creates a looping track */
	loop_track(name: string, cb?: TrackCallback): Track;

interface Track {
	/** Sets the instrument to play in the track */
	instrument(inst: Instrument): this;
	/** Sets the volume to use in the track */
	volume(v: number): void;
	/** Plays a given note */
	play(note: number, duration?: number, options?: any): this;
	/** Waits the specified time in seconds before playing the next note */
	sleep(time: number): this;
}

declare let lc: LiveCoding
`
