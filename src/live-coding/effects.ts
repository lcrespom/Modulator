import { tunaProvider } from '../tuna/tuna-effects'

export interface Effect {
	input: AudioNode
	output: AudioNode
	param(name: string, value?: number,
		rampTime?: number, exponential?: boolean): number | this
}


class WebAudioEffect implements Effect {
	input: AudioNode
	output: AudioNode

	constructor(private ac: AudioContext, public name: string) {
		let methodName = 'create' + name
		let anyac: any = ac
		if (!anyac[methodName])
			throw new Error(`Effect "${name}" does not exist`)
		this.input = (<any>ac)[methodName]()
		this.output = this.input
	}

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
		if (!prm)
			throw new Error(`Parameter "${name}" not found in effect "${this.name}"`)
		return prm
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
