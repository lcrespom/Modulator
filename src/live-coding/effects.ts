import { Tuna } from '../tuna/tuna'


export interface Effect {
	input: AudioNode
	output: AudioNode
	param(name: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this
}


export class BaseEffect implements Effect {
	input: AudioNode
	output: AudioNode

	constructor(public ac: AudioContext, public name: string) {}

	param(name: string, value?: number, rampTime?: number, exponential = true) {
		let prm = this.getAudioParam(name)
		if (value === undefined) {
			return prm.value
		}
		if (rampTime === undefined) {
			prm.value = value
		}
		else {
			if (exponential) {
				prm.exponentialRampToValueAtTime(value, this.ac.currentTime + rampTime)
			}
			else {
				prm.linearRampToValueAtTime(value, this.ac.currentTime + rampTime)
			}
		}
		return this
	}

	private getAudioParam(name: string) {
		let prm: AudioParam = (<any>this.input)[name]
		if (!prm || !(prm instanceof AudioParam))
			throw new Error(`Parameter "${name}" not found in effect "${this.name}"`)
		return prm
	}
}


class WebAudioEffect extends BaseEffect {
	constructor(ac: AudioContext, name: string) {
		super(ac, name)
		let methodName = 'create' + name
		let anyac: any = ac
		if (!anyac[methodName])
			throw new Error(`Effect "${name}" does not exist`)
		this.input = (<any>ac)[methodName]()
		this.output = this.input
	}
}


class TunaEffect extends BaseEffect {
	constructor(ac: AudioContext, name: string) {
		super(ac, name)
		let effClass = tuna[name]
		if (!effClass) throw new Error(
			`Effect "tuna/${name}" does not exist`)
		this.input = new effClass()
		this.output = this.input
	}
}


type EffectProvider = (ac: AudioContext, name: string) => Effect

interface ProviderTable {
	[prefix: string]: EffectProvider
}

let providers: ProviderTable = {
	WebAudio: (ac, name) => new WebAudioEffect(ac, name),
	tuna: tunaProvider
}

function tunaProvider(ac: AudioContext, name: string) {
	if (!tuna) tuna = Tuna(ac)
	return new TunaEffect(ac, name)
}

let tuna: any


export function registerProvider(prefix: string, provider: EffectProvider) {
	providers[prefix] = provider
}

export function createEffect(ac: AudioContext, name: string) {
	if (name.indexOf('/') < 0) name = 'WebAudio/' + name
	let [prefix, ename] = name.split('/')
	let provider = providers[prefix]
	if (!provider) throw new Error(
		`Effect "${name}" not found: unknown prefix "${provider}"`)
	return provider(ac, ename)
}
