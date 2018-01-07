import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { SynthUI } from '../synthUI/synthUI'

import { Track } from './track'
import { timerTickHandler, eachTrack, scheduleTrack,
	instruments, effects, userTracks } from './scheduler'
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
		if (typeof preset == 'string') {
			let oldInstr = instruments[name || preset]
			if (oldInstr) oldInstr.shutdown()
		}
		let instr = createInstrument(this, preset, name, numVoices)
		if (name) instr.name = name
		instruments[instr.name] = instr
		initInstrument(instr)
		return instr
	}

	effect(name: string, newName?: string) {
		let eff = createEffect(this.context, name)
		effects[newName || name] = eff
		return eff
	}

	track(name: string, cb: TrackCallback, loop = false) {
		let t = new Track(this.context, this.synthUI.outNode, this.timer)
		t.loop = loop
		t.name = name
		userTracks[name] = t
		t.callback = cb
		onInitialized(() => scheduleTrack(t))
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
		pushTask()
		await initFunc()
		popTask()
		return this
	}
}

// ---------- Instrument init ----------

async function initInstrument(instr: LCInstrument) {
	pushTask()
	await instr.initialize()
	popTask()
}



// ---------- Initialization ----------

type Callback = () => void

let taskCount = 0
let initListeners: Callback[] = []

function pushTask() {
	taskCount++
}

function popTask() {
	taskCount--
	if (taskCount <= 0) {
		for (let trackCB of initListeners) trackCB()
		initListeners = []
	}
}

function onInitialized(cb: Callback) {
	if (taskCount <= 0) cb()
	else initListeners.push(cb)
}
