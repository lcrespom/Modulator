import { Instrument } from '../synth/instrument'

import { LCInstrument } from './instruments'
import { Effect } from './effects'
import { Track } from './track'
import { Timer } from '../synth/timer'
import { logNote, logToPanel, txt2html } from './log'


interface InstrumentOptions {
	instrument: LCInstrument
	[k: string]: number | LCInstrument
}

interface EffectOptions {
	effect: Effect
	[k: string]: number | Effect
}

export type NoteOptions = InstrumentOptions | EffectOptions

export interface NoteInfo {
	instrument: LCInstrument
	number: number
	time: number
	velocity: number
	duration?: number
	options?: NoteOptions
}

interface InstrumentTable {
	[instrName: string]: Instrument
}

interface EffectTable {
	[effectName: string]: Effect
}

interface TrackTable {
	[trackName: string]: Track
}

export let instruments: InstrumentTable = {}
export let effects: EffectTable = {}
export let tracks: TrackTable = {}
export let nextTracks: TrackTable = {}


export function timerTickHandler(timer: Timer, time: number) {
	eachTrack(t => playTrack(timer, t, time))
}

export function eachTrack(cb: (t: Track) => void) {
	let tnames = Object.getOwnPropertyNames(tracks)
	for (let tname of tnames)
		cb(tracks[tname])
}

function playTrack(timer: Timer, track: Track, time: number) {
	let played
	do {
		played = false
		if (shouldTrackEnd(track)) break
		track = tracks[track.name]
		let note = track.notes[track.notect]
		if (track.startTime + note.time <= time) {
			playNote(track, note, timer, track.startTime)
			played = true
			track.notect++
		}
	} while (played)
}

function playNote(track: Track, note: NoteInfo, timer: Timer, startTime: number) {
	if (note.options) setOptions(note.options)
	if (note.number < 1) return
	logNote(note, track)
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
		logToPanel(false, true, txt2html(
			`Track [log-track|${track.name}] has looped`))
		track.startTime += track.time
		track.loopCount++
		return false
	}
	else {
		logToPanel(false, true, txt2html(
			`Track [log-track|${track.name}] has ended`))
		delete tracks[track.name]
		return true
	}
}