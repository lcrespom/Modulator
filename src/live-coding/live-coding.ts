import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { NodeData } from '../synth/synth'
import { SynthUI } from '../synthUI/synthUI'

export type TrackCallback = (t: Track) => void

interface LCInstrument extends Instrument {
	name: string
	duration: number
}


export class LiveCoding {
	constructor(
		public ac: AudioContext,
		public presets: Presets,
		public synthUI: SynthUI) {
		let timer = new Timer(ac, 60, 0.2)
		timer.start(time => timerCB(timer, time))
	}

	instrument(preset: string | number, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		let instr = <LCInstrument> new Instrument(
			this.ac, prst, numVoices, this.synthUI.outNode)
		instr.name = prst.name
		instr.duration = findNoteDuration(prst)
		return instr
	}

	effect(name: string, options: any) {
		return new Effect(this.ac, name, options)
	}

	track(name: string, cb?: TrackCallback) {
		let t = new Track(this.ac, this.synthUI.outNode)
		t.startTime = this.ac.currentTime + 0.1
		t.name = name
		if (tracks[name])
			nextTracks[name] = t
		else
			tracks[name] = t
		if (cb) cb(t)
		return t
	}

	loop_track(name: string, cb?: TrackCallback) {
		let t = this.track(name, cb)
		t.loop = true
		return t
	}

	use_log(flag = true) {
		logEnabled = flag
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
	startTime = 0
	loop = false
	name: string
	inst: LCInstrument
	velocity = 1
	gain: GainNode
	eff: Effect

	constructor(public ac: AudioContext, public out: AudioNode) {
		this.gain = ac.createGain()
		this.gain.connect(out)
	}

	instrument(inst: LCInstrument) {
		for (let v of inst.voices) {
			v.synth.outGainNode.disconnect()
			v.synth.outGainNode.connect(this.gain)
		}
		this.inst = inst
		return this
	}

	volume(v: number) {
		this.velocity = v
		return this
	}

	effect(e: Effect) {
		this.gain.disconnect()
		this.gain.connect(e.node)
		e.node.connect(this.out)
		return this
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
		return this
	}
}

export class Effect {
	name: string
	node: AudioNode

	constructor(ac: AudioContext, name: string, options: any) {
		this.name = name
		let methodName = 'create' + name
		this.node = (<any>ac)[methodName]()
	}

	param(name: string, value: number) {
		let prm: AudioParam = (<any>this.node)[name];
		if (!prm) throw new Error(
			`Parameter ${name} not found in effect ${this.name}`)
		prm.value = value
	}

}


// ------------------------- Privates -------------------------

// ---------- Helpers -----

interface TrackTable {
	[trackName: string]: Track
}

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


// ---------- Track playback ----------

let tracks: TrackTable = {}
let nextTracks: TrackTable = {}
let logEnabled = false

function log(...args: any[]) {
	if (!logEnabled) return
	console.log(...args)
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
		track = tracks[track.name]
		let note = track.notes[track.notect]
		if (track.startTime + note.time < timer.nextNoteTime) {
			playNote(note, timer, track.startTime + deltaT)
			played = true
			track.notect++
		}
	} while (played)
}

function playNote(note: NoteInfo, timer: Timer, deltaT: number) {
	log(`Note: ${note.number} - ${note.instrument.name}`)
	note.instrument.noteOn(
		note.number, note.velocity, note.time + deltaT)
	let duration = note.duration
		|| note.instrument.duration || timer.noteDuration
	note.instrument.noteOff(
		note.number, note.velocity, note.time + duration + deltaT)
}

function shouldTrackEnd(track: Track) {
	if (track.notect < track.notes.length) return false
	track.notect = 0
	if (nextTracks[track.name]) {
		let nextTrack = nextTracks[track.name]
		nextTrack.startTime = track.startTime + track.time
		tracks[track.name] = nextTrack
		delete nextTracks[track.name]
		return false
	}
	if (track.loop) {
		track.startTime += track.time
		return false
	}
	else {
		delete tracks[track.name]
		return true
	}
}
