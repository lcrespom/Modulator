import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { NodeData } from '../synth/synth';

export type TrackCallback = (t: Track) => void

interface LCInstrument extends Instrument {
	name: string
	duration: number
}


export class LiveCoding {
	constructor(public ac: AudioContext, public presets: Presets) {
		let timer = new Timer(ac, 60, 0.2)
		timer.start(time => timerCB(timer, time))
	}

	instrument(preset: string | number, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		let instr = <LCInstrument> new Instrument(this.ac, prst, numVoices)
		instr.name = prst.name
		instr.duration = findNoteDuration(prst)
		return instr
	}

	track(name: string, cb?: TrackCallback) {
		let t = new Track()
		t.time = this.ac.currentTime + 0.1
		t.name = name
		// if (tracks[name])
		// 	nextTracks[name] = t
		// else
		tracks[name] = t
		if (cb) cb(t)
		return t
	}

	loop_track(name: string, cb?: TrackCallback) {
		let t = this.track(name, cb)
		t.loop = true
		return t
	}
}


export interface NoteInfo {
	instrument: LCInstrument
	number: number
	time: number
	velocity: number
	duration?: number
	options?: any	// TODO proper options
}


export class Track {
	notect = 0
	notes: NoteInfo[] = []
	time = 0
	duration = 0
	loop = false
	name: string
	private inst: LCInstrument
	private velocity = 1

	instrument(inst: LCInstrument) {
		this.inst = inst
		return this
	}

	volume(v: number) {
		this.velocity = v
	}

	play(note = 64, duration?: number, options?: any) {
		if (!this.inst)
			throw new Error(`Must call instrument before playing a note`)
		this.notes.push({
			instrument: this.inst,
			number: note,
			time: this.time,
			velocity: this.velocity,
			duration
		})
		return this
	}

	sleep(time: number) {
		this.time += time
		this.duration += time
		return this
	}
}

// -------------------- Privates --------------------

interface TrackTable {
	[trackName: string]: Track
}

let tracks: TrackTable = {}
let nextTracks: TrackTable = {}


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

function findNoteDuration(preset: any) {
	let duration = 0
	for (let node of preset.nodeData) {
		if (node.type == 'ADSR') {
			let d = node.params.attack + node.params.decay
			if (d > duration)
				duration = d
		}
	}
	if (duration) duration += 0.01
	return duration
}

function timerCB(timer: Timer, time: number) {
	let deltaT = time - timer.ac.currentTime
	let tnames = Object.getOwnPropertyNames(tracks)
	for (let tname of tnames)
		playTrack(timer, tracks[tname], deltaT)
}

function playTrack(timer: Timer, track: Track, deltaT: number) {
	let played
	do {
		played = false
		if (shouldTrackEnd(track)) break
		let note = track.notes[track.notect]
		if (note.time < timer.nextNoteTime) {
			playNote(note, timer, deltaT)
			played = true
			track.notect++
		}
	} while (played)
}

function playNote(note: NoteInfo, timer: Timer, deltaT: number) {
	note.instrument.noteOn(
		note.number, note.velocity, note.time + deltaT)
	let duration = note.duration
		|| note.instrument.duration || timer.noteDuration
	note.instrument.noteOff(
		note.number, note.velocity, note.time + duration + deltaT)
}

function loopTrack(track: Track) {
	track.notect = 0
	for (let note of track.notes)
		note.time += track.duration
}

function shouldTrackEnd(track: Track) {
	if (track.notect < track.notes.length) return false
	if (track.loop) {
		loopTrack(track)
		return false
	}
	else {
		delete tracks[track.name]
		return true
	}
}
