import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { SynthUI } from '../synthUI/synthUI'

import { Track } from './track'
import { timerTickHandler, eachTrack,
	instruments, effects, tracks, nextTracks } from './scheduler'
import { Effect, createEffect } from './effects'
import { makeScale } from './scales'
import { logToPanel, enableLog, clearLog } from './log'
import { Ring } from './rings'
import { LCInstrument, PresetData, createInstrument } from './instruments'


export type TrackCallback = (t: Track) => void

export class LiveCoding {
	timer: Timer

	constructor(
		public context: AudioContext,
		public presets: Presets,
		public synthUI: SynthUI) {
		this.timer = new Timer(context, 60, 0.2)
		this.timer.start(time => timerTickHandler(this.timer, time))
	}

	instrument(preset: number | string | PresetData,
		name?: string, numVoices = 4) {
		let instr = createInstrument(this, preset, name, numVoices)
		if (name) instr.name = name
		instruments[instr.name] = instr
		return instr
	}

	effect(name: string, newName?: string) {
		let eff = createEffect(this.context, name)
		effects[newName || name] = eff
		return eff
	}

	track(name: string, cb: TrackCallback, loop = false) {
		onInitialized(() => {
			let t = new Track(this.context, this.synthUI.outNode, this.timer)
			t.loop = loop
			t.name = name
				if (tracks[name])
				nextTracks[name] = t
			else
				tracks[name] = t
			cb(t)
		})
		return this
	}

	loop_track(name: string, cb: TrackCallback) {
		return this.track(name, cb, true)
	}

	scale(note: number, type?: string, octaves?: number): Ring<number> {
		return makeScale(note, type, octaves)
	}

	log(...args: any[]) {
		logToPanel(true, false, ...args)
		return this
	}

	log_enable(flag = true) {
		enableLog(flag)
		return this
	}

	log_clear() {
		clearLog()
		return this
	}

	bpm(value?: number) {
		if (value === undefined)
			return this.timer.bpm
		this.timer.bpm = value
		return this
	}

	stop() {
		eachTrack(t => t.stop())
		return this
	}

	pause() {
		eachTrack(t => t.pause())
		return this
	}

	continue() {
		eachTrack(t => t.continue())
		return this
	}

	reset() {
		eachTrack(t => {
			if (t._effect) t._effect.input.disconnect()
			t.delete()
		})
		return this
	}

	async init(initFunc: () => void) {
		initializing = true
		await initFunc()
		let trackCB
		while (trackCB = initListeners.pop()) trackCB()
		initializing = false
		return this
	}
}


// ------------------------- Privates -------------------------

// ---------- Initialization ----------

type Callback = () => void

let initializing = false
let initListeners: Callback[] = []

function onInitialized(cb: Callback) {
	if (!initializing) cb()
	else initListeners.push(cb)
}
