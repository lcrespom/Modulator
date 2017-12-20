import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'

type TrackCallback = (t: Track) => void


export class LiveCoding {
	constructor(public ac: AudioContext, public presets: Presets) {
		let timer = new Timer(ac)
		timer.start(time => timerCB(timer, time))
	}

	instrument(preset: string | number, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		return new Instrument(this.ac, prst, numVoices)
	}

	track(name: string, cb: TrackCallback) {
		let t = new Track()
		t.time = this.ac.currentTime
		tracks[name] = t
		cb(t)
	}
}

interface NoteInfo {
	instrument: Instrument
	number: number
	time: number
	velocity: number
	options?: any	// TODO proper options
}

export class Track {
	notect = 0
	notes: NoteInfo[] = []
	inst: Instrument
	velocity = 1
	time = 0

	instrument(inst: Instrument) {
		this.inst = inst
		return this
	}

	volume(v: number) {
		this.velocity = v
	}

	play(note = 64, options: any) {
		if (!this.inst)
			throw new Error(`Must call instrument before playing a note`)
		this.notes.push({
			instrument: this.inst,
			number: note,
			time: this.time,
			velocity: this.velocity
		})
		return this
	}

	sleep(time: number) {
		this.time += time
		return this
	}
}

// -------------------- Privates --------------------

interface TrackTable {
	[trackName: string]: Track
}

let tracks: TrackTable = {}

function getPreset(presets: Presets, preset: string | number) {
	if (typeof preset == 'number') {
		let maxPrst = presets.presets.length
		if (preset < 1 || preset > maxPrst)
			throw new Error(`The preset number should be between 1 and ${maxPrst}`)
		return presets.presets[preset - 1]
	}
	for (let prs of presets.presets)
		if (prs.name == preset) return prs
	throw new Error(`Preset "${preset}" does not exist`)
}

function timerCB(timer: Timer, time: number) {
	let tnames = Object.getOwnPropertyNames(tracks)
	for (let tname of tnames) playTrack(timer, tracks[tname], time)
}

function playTrack(timer: Timer, track: Track, time: number) {
	let played
	do {
		played = false
		if (track.notect >= track.notes.length) break
		let note = track.notes[track.notect]
		if (note.time < timer.nextNoteTime) {
			note.instrument.noteOn(
				note.number, note.velocity, note.time)
			note.instrument.noteOff(
				note.number, note.velocity, note.time + timer.noteDuration)
			played = true
			track.notect++
		}
	} while (played)
}
