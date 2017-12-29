import { Effect } from '../live-coding/effects'
import { Tuna } from './tuna'


class TunaEffect implements Effect {
	input: AudioNode
	output: AudioNode

	constructor(private ac: AudioContext, public name: string) {
		let effClass = tuna[name]
		if (!effClass) throw new Error(
			`Effect "tuna/${name}" does not exist`)
		this.input = new effClass()
		this.output = this.input
	}

	param(name: string, value?: number, rampTime?: number, exponential = true) {
		// TODO: pending
		return this
	}

	private getAudioParam(name: string) {
		// TODO: pending
	}
}

export function tunaProvider(ac: AudioContext, name: string) {
	if (!tuna) tuna = Tuna(ac)
	return new TunaEffect(ac, name)
}

let tuna: any
