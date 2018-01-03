import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { Timer } from '../synth/timer'
import { SynthUI } from '../synthUI/synthUI'

import { Track } from './track'
import { instruments, timerTickHandler, effects, tracks, nextTracks, eachTrack } from './scheduler'
import { Effect, createEffect } from './effects'
import { makeScale } from './scales'
import { logToPanel, enableLog, clearLog } from './log'
import { Ring } from './rings'


export type TrackCallback = (t: Track) => void

export class LCInstrument extends Instrument {
	name: string
	duration: number

	param(pname: string, value?: number, rampTime?: number, exponential = true) {
		let names = pname.split('/')
		if (names.length < 2) throw new Error(
			`Instrument parameters require "node/param" format`)
		let node = names[0]
		let name = names[1]
		if (value === undefined) {
			let prm = this.voices[0].getParameterNode(node, name)
			return prm.value
		}
		for (let v of this.voices) {
			let prm: any = v.getParameterNode(node, name)
			this.updateValue(prm, value, rampTime, exponential)
		}
		return this
	}

	paramNames() {
		let pnames = []
		let v = this.voices[0]
		for (let nname of Object.getOwnPropertyNames(v.nodes))
			for (let pname in v.nodes[nname])
				if ((<any>v.nodes[nname])[pname] instanceof AudioParam)
					pnames.push(nname + '/' + pname)
		return pnames
	}

	private updateValue(prm: AudioParam, value: number, rampTime?: number, exponential = true) {
		if (rampTime === undefined) {
			(<any>prm)._value = value
			prm.value = value
			}
		else {
			let ctx = this.voices[0].synth.ac
			if (exponential) {
				prm.exponentialRampToValueAtTime(value, ctx.currentTime + rampTime)
			}
			else {
				prm.linearRampToValueAtTime(value, ctx.currentTime + rampTime)
			}
		}
	}
}


export class LiveCoding {
	timer: Timer

	constructor(
		public context: AudioContext,
		public presets: Presets,
		public synthUI: SynthUI) {
		this.timer = new Timer(context, 60, 0.2)
		this.timer.start(time => timerTickHandler(this.timer, time))
	}

	instrument(preset: number | string | PresetData, name?: string, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		let instr = new LCInstrument(
			this.context, prst, numVoices, this.synthUI.outNode)
		instr.name = prst.name
		instr.duration = findNoteDuration(prst)
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

// ---------- Initialization ----------

type Callback = () => void

let initializing = false
let initListeners: Callback[] = []

function onInitialized(cb: Callback) {
	if (!initializing) cb()
	else initListeners.push(cb)
}

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
