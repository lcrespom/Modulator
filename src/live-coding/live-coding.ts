import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { NodeData } from '../synth/synth'
import { SynthUI } from '../synthUI/synthUI'

import { Track } from './track'
import { Effect, createEffect } from './effects'

export type TrackCallback = (t: Track) => void

export class LCInstrument extends Instrument {
	name: string
	duration: number

	param(pname: string, value?: number) {
		let names = pname.split('/')
		if (names.length < 2) throw new Error(
			`Instrument parameters require "node/param" format`)
		let node = names[0]
		let name = names[1]
		if (value === undefined) {
			let prm = this.voices[0].getParameterNode(node, name)
			return prm ? prm.value : NaN
		}
		for (let v of this.voices) {
			let prm: any = v.getParameterNode(node, name)
			if (!prm) throw new Error(
				`Parameter "{name"} not found in node "${node}" of instrument "${this.name}"`)
			prm._value = value
		}
		return this
	}
}


export class LiveCoding {
	timer: Timer

	constructor(
		public context: AudioContext,
		public presets: Presets,
		public synthUI: SynthUI) {
		this.timer = new Timer(context, 60, 0.2)
		this.timer.start(time => timerCB(this.timer, time))
	}

	instrument(preset: number | string | PresetData, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		let instr = new LCInstrument(
			this.context, prst, numVoices, this.synthUI.outNode)
		instr.name = prst.name
		instr.duration = findNoteDuration(prst)
		return instr
	}

	effect(name: string, newName?: string) {
		let eff = createEffect(this.context, name)
		effects[newName || name] = eff
		return eff
	}

	track(name: string, cb?: TrackCallback) {
		let t = new Track(this.context, this.synthUI.outNode, this.timer)
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

	bpm(value?: number) {
		if (value === undefined)
			return this.timer.bpm
		this.timer.bpm = value
		return value
	}

	stop() {
		eachTrack(t => t.stop())
	}

	pause() {
		eachTrack(t => t.pause())
	}

	continue() {
		eachTrack(t => t.continue())
	}
}


interface InstrumentOptions {
	instrument: LCInstrument
	[k: string]: number | LCInstrument
}

interface EffectOptions {
	effect: Effect
	[k: string]: number | Effect
}

export type NoteOptions = InstrumentOptions | EffectOptions


// ------------------------- Privates -------------------------

// ---------- Helpers ----------

interface PresetData {
	name: string
	nodes: any[]
	nodeData: any[]
	modulatorType: string
}

function getPreset(presets: Presets, preset: number | string | PresetData) {
	if (typeof preset == 'number') {
		let maxPrst = presets.presets.length
		if (preset < 1 || preset > maxPrst)
			throw new Error(`The preset number should be between 1 and ${maxPrst}`)
		return presets.presets[preset - 1]
	}
	else if (typeof preset == 'string') {
		for (let prs of presets.presets)
		if (prs.name == preset) return prs
		throw new Error(`Preset "${preset}" does not exist`)
	}
	return preset
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

export interface NoteInfo {
	instrument: LCInstrument
	number: number
	time: number
	velocity: number
	duration?: number
	options?: NoteOptions
}

interface EffectTable {
	[effectName: string]: Effect
}

interface TrackTable {
	[trackName: string]: Track
}

export let effects: EffectTable = {}
export let tracks: TrackTable = {}
let nextTracks: TrackTable = {}
let logEnabled = false

function log(...args: any[]) {
	if (!logEnabled) return
	console.log(...args)
}

function eachTrack(cb: (t: Track) => void) {
	let tnames = Object.getOwnPropertyNames(tracks)
	for (let tname of tnames)
		cb(tracks[tname])
}

function timerCB(timer: Timer, time: number) {
	eachTrack(t => playTrack(timer, t, time))
}

function playTrack(timer: Timer, track: Track, time: number) {
	let played
	do {
		played = false
		if (shouldTrackEnd(track)) break
		track = tracks[track.name]
		let note = track.notes[track.notect]
		if (track.startTime + note.time <= time) {
			playNote(note, timer, track.startTime)
			played = true
			track.notect++
		}
	} while (played)
}

function playNote(note: NoteInfo, timer: Timer, startTime: number) {
	if (note.options) setOptions(note.options)
	if (note.number < 1) return
	log(`Note: ${note.number} - ${note.instrument.name}`)
	note.instrument.noteOn(
		note.number, note.velocity, startTime + note.time)
	let duration = note.duration
		|| note.instrument.duration || timer.noteDuration
	note.instrument.noteOff(
		note.number, note.velocity, startTime + note.time + duration)
}

function setOptions(opts: NoteOptions) {
	if (opts.effect) {
		let e = <Effect> opts.effect
		for (let pname of Object.getOwnPropertyNames(opts))
			if (pname != 'effect') e.param(pname, <number>opts[pname])
	}
	else if (opts.instrument) {
		let i = <LCInstrument> opts.instrument
		for (let pname of Object.getOwnPropertyNames(opts))
			if (pname != 'instrument') i.param(pname, <number>opts[pname])
	}
}

function shouldTrackEnd(track: Track) {
	if (track.stopped) return true
	if (track.notect < track.notes.length) return false
	track.notect = 0
	if (track.shouldStop) {
		track.stopped = true
		track.shouldStop = false
		return true
	}
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
