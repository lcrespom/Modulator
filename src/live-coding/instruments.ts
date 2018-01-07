import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { LiveCoding } from './live-coding'
import { WebAudioFontPlayer } from '../third-party/wavetable'


export interface LCInstrument {
	name: string
	duration: number
	param(pname: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this
	paramNames(): string[]
	noteOn(midi: number, velocity: number, when?: number): void
	noteOff(midi: number, velocity: number, when?: number): void
	connect(node: AudioNode): void
	initialize(): void
	shutdown(): void
}


// ---------- Providers ----------

type InstrumentProvider = (lc: LiveCoding,
	preset: string, name?: string, numVoices?: number) => LCInstrument

interface InstrProviderTable {
	[prefix: string]: InstrumentProvider
}

let providers: InstrProviderTable = {
	Modulator: modulatorInstrProvider,
	wavetable: wavetableInstrProvider
}

export function registerProvider(prefix: string, provider: InstrumentProvider) {
	providers[prefix] = provider
}

export function createInstrument(
	lc: LiveCoding,	// This is ugly and should be refactored
	preset: number | string | PresetData,
	name?: string,
	numVoices = 4) {
	if (typeof preset != 'string')
		return modulatorInstrProvider(lc, preset, name, numVoices)
	if (preset.indexOf('/') < 0) preset = 'Modulator/' + preset
	let [prefix, iname] = preset.split('/')
	let provider = providers[prefix]
	if (!provider) throw new Error(
		`Instrument "${preset}" not found: unknown prefix "${provider}"`)
	return provider(lc, iname, name, numVoices)
}

function modulatorInstrProvider(
	lc: LiveCoding,	// This is ugly and should be refactored
	preset: number | string | PresetData,
	name?: string,
	numVoices = 4) {
	let prst = getPreset(lc.presets, preset)
	let instr = new ModulatorInstrument(
		lc.context, prst, numVoices, lc.synthUI.outNode)
	instr.name = name || prst.name
	instr.duration = findNoteDuration(prst)
	return instr
}

function wavetableInstrProvider(
	lc: LiveCoding,
	preset: string,
	name?: string,
	numVoices = 4) {
	let instr = new WavetableInstrument(lc.context, preset, name)
	return instr
}


// ------------------------- Modulator instrument -------------------------

class ModulatorInstrument extends Instrument implements LCInstrument {
	name: string
	duration: number

	async initialize() {}
	shutdown() {}

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

	connect(node: AudioNode) {
		for (let v of this.voices) {
			v.synth.outGainNode.disconnect()
			v.synth.outGainNode.connect(node)
		}
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


// ---------- Helpers ----------

export interface PresetData {
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


// ------------------------- Wavetable instrument -------------------------

class WavetableInstrument implements LCInstrument {
	name: string
	duration: number
	preset: object
	destination: AudioNode
	envelopes: any[] = []

	constructor(public ctx: AudioContext, public presetName: string, name?: string) {
		this.duration = 0
		if (name === undefined) name = presetName
		this.name = name
	}

	async initialize() {
		this.preset = await this.loadInstrument(this.presetName)
	}

	shutdown() {
		wtPlayer.expireEnvelopes(this.ctx)
	}

	param(pname: string, value?: number, rampTime?: number, exponential = true) {
		// TODO maybe provide ADSR
		return this
	}

	paramNames() {
		// TODO implement
		let pnames: string[] = []
		return pnames
	}

	connect(node: AudioNode) {
		this.destination = node
	}

	noteOn(midi: number, velocity: number, when?: number): void {
		if (when === undefined) when = this.ctx.currentTime
		let envelope = wtPlayer.queueWaveTable(
			this.ctx, this.destination, this.preset, when, midi, 9999, velocity
		)
		this.envelopes[midi] = envelope
	}

	noteOff(midi: number, velocity: number, when?: number): void {
		let envelope = this.envelopes[midi]
		if (envelope) envelope.cancel(when)
	}

	private async adjustPreset(preset: object) {
		return new Promise(resolve =>
			wtPlayer.adjustPreset(this.ctx, preset, resolve)
		)
	}

	private async fetchPreset(name: string) {
		let response = await fetch(this.getURL(name, '_sf2_file'))
		if (!response.ok)
			response = await fetch(this.getURL(name, '_sf2'))
		let data = await response.json()
		return data
	}

	private async loadInstrument(name: string) {
		let preset = await this.fetchPreset(name)
		await this.adjustPreset(preset)
		return preset
	}

	private getURL(name: string, suffix: string) {
		// The following files have both _sf2 and _sf2_file ending:
		// 		0280_LesPaul, 0290_LesPaul, 0291_LesPaul, 0292_LesPaul
		// 		0300_LesPaul, 0301_LesPaul, 0310_LesPaul
		// Therefore it is better to load them using their full name
		if (!name.endsWith('_sf2_file') && !name.endsWith('_sf2'))
			name += suffix
		return `wavetables/${name}.json`
	}
}

let wtPlayer = new WebAudioFontPlayer()
