import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'
import { LiveCoding } from './live-coding'
import { WebAudioFontPlayer } from '../third-party/wavetable'
import { logToPanel, txt2html } from './log'


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
	wavetable: wavetableInstrProvider,
	sample: sampleInstrProvider
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
		`Instrument '${preset}' not found: unknown prefix '${provider}'`)
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

function sampleInstrProvider(
	lc: LiveCoding,
	preset: string,
	name?: string,
	numVoices = 4) {
	let instr = new SampleInstrument(lc.context, preset, name)
	return instr
}


// ------------------------- Modulator instrument -------------------------

class ModulatorInstrument extends Instrument implements LCInstrument {
	name: string
	duration: number

	async initialize() {
		logInstrReady(this.name)
	}

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
		log(`Loading instrument [log-instr|${this.name}]...`)
		this.preset = await this.loadInstrument(this.presetName)
		logInstrReady(this.name)
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
		if (!response.ok) {
			let msg = `wavetable preset '${name}' not found`
			log('[log-bold|Error]: ' + msg)
			throw new Error(msg)
		}
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


// ------------------------- Samples -------------------------

type SampleTable = { [name: string]: AudioBuffer }

let samples: SampleTable = {}
let context = new AudioContext()

export function loadSamples(files: FileList) {
	for (let i = 0; i < files.length; i++)
		loadSample(files[i])
}

async function loadSample(file: File) {
	if (!file.type.startsWith('audio/'))
		return log(`[log-bold|Error]: file ${file.name} is not an audio file`)
	let fname = removeExtension(file.name)
	log(`Loading sample [log-instr|${fname}]...`)
	let data = await readSampleFile(file)
	let buffer = await decodeSample(data)
	samples[fname] = buffer
	log(`Sample [log-instr|${fname}] ready`)
}

async function readSampleFile(file: File) {
	return new Promise<ArrayBuffer>(resolve => {
		let reader = new FileReader()
		reader.onload = (loadEvt: any) => resolve(loadEvt.target.result)
		reader.readAsArrayBuffer(file)
	})
}

async function decodeSample(data: ArrayBuffer) {
	return new Promise<AudioBuffer>(resolve => {
		context.decodeAudioData(data, resolve)
	})
}

function removeExtension(fname: string) {
	let pos = fname.lastIndexOf('.')
	if (pos <= 0) return fname
	return fname.substr(0, pos)
}


class SampleInstrument implements LCInstrument {
	name: string
	duration: number
	src: AudioBufferSourceNode
	buffer: AudioBuffer
	destination: AudioNode
	baseNote = 69
	ignoreNote = true
	loops = 1
	loopStart = 0
	loopEnd = 1000

	constructor(public ctx: AudioContext, preset: string, name?: string) {
		this.buffer = samples[preset]
		if (!this.buffer) throw new Error(`Sample '${preset}' not found`)
		this.name = name || preset
		this.duration = this.buffer.duration
		this.loopEnd = this.duration
	}

	async initialize() {
		logInstrReady(this.name)
	}

	shutdown() {}

	param(pname: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this {
		if (this.paramNames().indexOf(pname) < 0)
			throw new Error(
				`Parameter '${pname}' not found in instrument '${this.name}'`)
		let that: any = this
		if (value === undefined) return that[pname]
		that[pname] = value
		return this
	}

	paramNames() {
		// TODO 'attack' and 'release'
		return ['baseNote', 'ignoreNote', 'loops', 'loopStart', 'loopEnd']
	}

	noteOn(midi: number, velocity: number, when?: number) {
		let bufferNode = this.ctx.createBufferSource()
		this.src = bufferNode
		bufferNode.buffer = this.buffer
		let dst = this.connectGain(velocity)
		bufferNode.connect(dst)
		let ratio = this.ignoreNote ? 1 : this.midi2Ratio(midi)
		bufferNode.playbackRate.value = ratio
		this.duration = this.buffer.duration / ratio
		this.setupLooping(ratio)
		bufferNode.start(when)
	}

	noteOff(midi: number, velocity: number, when?: number) {
		this.src.stop(when)
	}

	connect(node: AudioNode) {
		this.destination = node
	}

	private midi2Ratio(midi: number): number {
		const semitone = Math.pow(2, 1 / 12)
		return Math.pow(semitone, midi - this.baseNote)
	}

	private connectGain(velocity: number) {
		let dst = this.destination
		if (velocity == 1) return dst
		let gain = this.ctx.createGain()
		gain.gain.value = velocity
		gain.connect(dst)
		return gain
	}

	private setupLooping(ratio: number) {
		if (this.loops == 1) return
		this.src.loop = true
		this.src.loopStart = this.loopStart
		this.src.loopEnd = this.loopEnd
		this.duration = this.loopEnd + (this.loopEnd - this.loopStart) * (this.loops - 1)
		this.duration = this.duration / ratio
	}


}


// ------------------------- Log helper -------------------------

function log(txt: string) {
	return logToPanel(true, true, txt2html(txt))
}

function logInstrReady(name: string) {
	log(`Instrument [log-instr|${name}] ready`)
}
