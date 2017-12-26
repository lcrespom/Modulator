import { Timer } from '../synth/timer'

import { LCInstrument, Effect, NoteInfo, NoteOptions } from 'live-coding'

export class Track {
	notect = 0
	notes: NoteInfo[] = []
	time = 0
	startTime: number
	loop = false
	name: string
	inst: LCInstrument
	velocity = 1
	_gain: GainNode
	_effect: Effect
	lastGain: number

	constructor(public ac: AudioContext,
		public out: AudioNode, public timer: Timer) {
		this._gain = ac.createGain()
		this._gain.connect(out)
		this.lastGain = this._gain.gain.value
		this.startTime = this.ac.currentTime
	}


	// ---------- Timed methods ----------

	instrument(inst: LCInstrument) {
		for (let v of inst.voices) {
			v.synth.outGainNode.disconnect()
			v.synth.outGainNode.connect(this._gain)
		}
		this.inst = inst
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
			number: note,
			time: this.time,
			velocity: this.velocity,
			duration,
			options
		})
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


	// ----------Instantaneoous methods ----------

	effect(e: Effect) {
		let dst = this._effect ? this._effect.out : this._gain
		dst.disconnect()
		dst.connect(e.in)
		e.out.connect(this.out)
		this._effect = e
		return this
	}

	mute() {
		this.lastGain = this._gain.gain.value
		this._gain.gain.value = 0
		return this
	}

	unmute() {
		this._gain.gain.value = this.lastGain
		return this
	}

	gain(value: number) {
		this._gain.gain.value = value
		return this
	}

}
