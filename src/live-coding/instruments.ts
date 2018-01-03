import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { LiveCoding } from './live-coding'

export interface LCInstrument {
	name: string
	duration: number
	param(pname: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this
	paramNames(): string[]
	noteOn(midi: number, velocity: number, when?: number): void
	noteOff(midi: number, velocity: number, when?: number): void
	connect(node: AudioNode): void
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
	let instr = new WavetableInstrument()
	instr.name = name || preset
	return instr
}


// ------------------------- Modulator instrument -------------------------

class ModulatorInstrument extends Instrument implements LCInstrument {
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

	param(pname: string, value?: number, rampTime?: number, exponential = true) {
		return this
	}

	paramNames() {
		let pnames: string[] = []
		return pnames
	}

	connect(node: AudioNode) {
	}

	noteOn(midi: number, velocity: number, when?: number): void {}

	noteOff(midi: number, velocity: number, when?: number): void {}
}

/* Next
async function adjustPreset(player, preset) {
    return new Promise(resolve => player.adjustPreset(ctx, preset, resolve))
}

async function fetchPreset(name) {
	let url = `wavetables/${name}_sf2_file.json`;
	let r = await fetch(url)
	let j = await r.json()
    return j
}

async function loadInstrument(name) {
    let preset = await fetchPreset(name)
    ctx = window.ctx || new AudioContext()
    window.ctx = ctx
    player = new WebAudioFontPlayer()
    await adjustPreset(player, preset)
    return preset
}

function playInstrument(preset, pitch) {
    player.queueWaveTable(ctx, ctx.destination, preset, ctx.currentTime + 0, pitch, 0.4);
    player.queueWaveTable(ctx, ctx.destination, preset, ctx.currentTime + 0.4, pitch, 0.2);
    player.queueWaveTable(ctx, ctx.destination, preset, ctx.currentTime + 0.6, pitch, 0.2);
    player.queueWaveTable(ctx, ctx.destination, preset, ctx.currentTime + 0.8, pitch, 4);
}

async function main() {
    let preset = await loadInstrument('0000_Aspirin')
    playInstrument(preset, 7 + 12 * 3)
}
*/
