import { Timer } from '../synth/timer'

import { LCInstrument, NoteOptions } from './live-coding'
import { Effect } from './effects'
import { tracks, NoteInfo } from './scheduler';


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
		this.startTime = this.ac.currentTime
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
	}
}


export class Track extends TrackControl {
	notect = 0
	notes: NoteInfo[] = []
	time = 0
	loop = false
	loopCount = 0
	inst: LCInstrument
	velocity = 1
	_effect: Effect
	_transpose = 0

	instrument(inst: LCInstrument) {
		for (let v of inst.voices) {
			v.synth.outGainNode.disconnect()
			v.synth.outGainNode.connect(this._gain)
		}
		this.inst = inst
		return this
	}

	effect(e: Effect) {
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
			instrument: this.inst,
			number: note + this._transpose,
			time: this.time,
			velocity: this.velocity,
			duration,
			options
		})
		return this
	}

	play_notes(notes: number[],
		times: number | number[], durations?: number | number[]) {
		if (typeof times == 'number') times = [times]
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
