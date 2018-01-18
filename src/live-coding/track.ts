import { Timer } from '../synth/timer'

import { LCInstrument } from './instruments'
import { Effect } from './effects'
import {
	tracks, NoteInfo, NoteOptions, userTracks, instruments
} from './scheduler'
import { TrackCallback } from './live-coding'
import { TidalParser } from './tidal-parser'


class TrackControl {
	name: string
	_gain: GainNode
	lastGain: number
	startTime: number
	shouldStop = false
	stopped = false

	constructor(public ac: AudioContext,
		public out: AudioNode, public timer: Timer) {
		this._gain = ac.createGain()
		this._gain.connect(out)
		this.lastGain = this._gain.gain.value
	}

	mute() {
		this.lastGain = this._gain.gain.value
		this._gain.gain.value = 1e-5
		return this
	}

	unmute() {
		this._gain.gain.value = this.lastGain
		return this
	}

	gain(value: number, rampTime?: number) {
		if (value < 1e-5) value = 1e-5
		if (rampTime === undefined)
			this._gain.gain.value = value
		else
			this._gain.gain.exponentialRampToValueAtTime(
				value, this.ac.currentTime + rampTime
			)
		return this
	}

	stop() {
		this.shouldStop = true
		return this
	}

	pause() {
		this.stopped = true
		return this
	}

	continue() {
		this.shouldStop = false
		this.stopped = false
		return this
	}

	delete() {
		this.mute()
		delete tracks[this.name]
		delete userTracks[this.name]
	}
}


export class Track extends TrackControl {
	notect = 0
	notes: NoteInfo[] = []
	time = 0
	latency = 0.2
	loop = false
	loopCount = 0
	inst: LCInstrument
	velocity = 1
	_effect: Effect
	_transpose = 0
	callback: TrackCallback
	playing = false

	instrument(inst: LCInstrument) {
		if (!this.playing)
			inst.connect(this._gain)
		this.inst = inst
		return this
	}

	effect(e: Effect) {
		if (this.playing) return this
		let dst = this._effect ? this._effect.output : this._gain
		dst.disconnect()
		dst.connect(e.input)
		e.output.connect(this.out)
		this._effect = e
		return this
	}

	volume(v: number) {
		this.velocity = v
		return this
	}

	play(note = 64, duration?: number, options?: NoteOptions) {
		if (!this.inst) throw new Error(
			`Must call instrument before playing a note or setting parameters`)
		this.notes.push({
			track: this,
			instrument: this.inst,
			number: note + this._transpose,
			time: this.time + this.latency,
			velocity: this.velocity,
			duration,
			options
		})
		return this
	}

	play_notes(notes: number[],
		times?: number | number[], durations?: number | number[]) {
		if (times === undefined) times = [0]
		else if (typeof times == 'number') times = [times]
		let rtimes = times.ring()
		if (typeof durations == 'number') durations = [durations]
		let rdurs = durations ? durations.ring() : undefined
		let rnotes = notes.ring()
		this.repeat(notes.length, _ => this
			.play(rnotes.tick(), rdurs ? rdurs.tick() : undefined)
			.sleep(rtimes.tick())
		)
		return this
	}

	play_cycle(code: string, time = 1) {
		let parser = new TidalParser()
		let ntevs = parser.parse(code, time)
		if (!ntevs && parser.error) throw new Error(
			`Cycle parsing error in position ${parser.error.tk.pos}: ${parser.error.msg}`
		)
		if (!ntevs || ntevs.length == 0) return
		let oldt = 0
		for (let ev of ntevs) {
			let instr = instruments[ev.instr]
			this.sleep(ev.time - oldt)
			this.instrument(instr)
				.play(instr.baseNote)
			oldt = ev.time
		}
		this.sleep(time - oldt)
		return this
	}

	transpose(notes: number) {
		this._transpose = notes
		return this
	}

	params(options: NoteOptions) {
		return this.play(0, undefined, options)
	}

	param(pname: string, value: number) {
		return this.params({ instrument: this.inst, [pname]: value })
	}

	sleep(time: number) {
		this.time += time * 60 / this.timer.bpm
		return this
	}

	repeat(times: number, cb: (i: number) => void) {
		for (let i = 0; i < times; i++) cb(i)
		return this
	}

}
