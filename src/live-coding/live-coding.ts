import { Instrument } from '../synth/instrument'
import { Presets } from '../synthUI/presets'


export class LiveCoding {

	constructor(public ac: AudioContext, public presets: Presets) {}

	instrument(preset: string | number, numVoices = 4) {
		let prst = getPreset(this.presets, preset)
		return new Instrument(this.ac, prst, numVoices)
	}

}


// -------------------- Privates --------------------

function getPreset(presets: Presets, preset: string | number) {
	if (typeof preset == 'number') {
		let maxPrst = presets.presets.length
		if (preset < 1 || preset > maxPrst)
			throw new Error(`The preset number should be between 1 and ${maxPrst}`)
		return presets.presets[preset - 1]
	}
	for (let prs of presets.presets)
		if (prs.name == preset) return prs
	throw new Error(`Preset "${preset}" does not exist`)
}
