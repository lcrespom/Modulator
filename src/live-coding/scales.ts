export let Note = {
	C0: 12, Cs0: 13, Db0: 13, D0: 14, Ds0: 15, Eb0: 15,
	E0: 16, F0: 17, Fs0: 18, Gb0: 18, G0: 19, Gs0: 20,
	Ab0: 20, A0: 21, As0: 22, Bb0: 22, B0: 23,
	C1: 24, Cs1: 25, Db1: 25, D1: 26, Ds1: 27, Eb1: 27,
	E1: 28, F1: 29, Fs1: 30, Gb1: 30, G1: 31, Gs1: 32,
	Ab1: 32, A1: 33, As1: 34, Bb1: 34, B1: 35,
	C2: 36, Cs2: 37, Db2: 37, D2: 38, Ds2: 39, Eb2: 39,
	E2: 40, F2: 41, Fs2: 42, Gb2: 42, G2: 43, Gs2: 44,
	Ab2: 44, A2: 45, As2: 46, Bb2: 46, B2: 47,
	C3: 48, Cs3: 49, Db3: 49, D3: 50, Ds3: 51, Eb3: 51,
	E3: 52, F3: 53, Fs3: 54, Gb3: 54, G3: 55, Gs3: 56,
	Ab3: 56, A3: 57, As3: 58, Bb3: 58, B3: 59,
	C4: 60, Cs4: 61, Db4: 61, D4: 62, Ds4: 63, Eb4: 63,
	E4: 64, F4: 65, Fs4: 66, Gb4: 66, G4: 67, Gs4: 68,
	Ab4: 68, A4: 69, As4: 70, Bb4: 70, B4: 71,
	C5: 72, Cs5: 73, Db5: 73, D5: 74, Ds5: 75, Eb5: 75,
	E5: 76, F5: 77, Fs5: 78, Gb5: 78, G5: 79, Gs5: 80,
	Ab5: 80, A5: 81, As5: 82, Bb5: 82, B5: 83,
	C6: 84, Cs6: 85, Db6: 85, D6: 86, Ds6: 87, Eb6: 87,
	E6: 88, F6: 89, Fs6: 90, Gb6: 90, G6: 91, Gs6: 92,
	Ab6: 92, A6: 93, As6: 94, Bb6: 94, B6: 95,
	C7: 96, Cs7: 97, Db7: 97, D7: 98, Ds7: 99, Eb7: 99,
	E7: 100, F7: 101, Fs7: 102, Gb7: 102, G7: 103, Gs7: 104,
	Ab7: 104, A7: 105, As7: 106, Bb7: 106, B7: 107,
	C8: 108, Cs8: 109, Db8: 109, D8: 110, Ds8: 111, Eb8: 111,
	E8: 112, F8: 113, Fs8: 114, Gb8: 114, G8: 115, Gs8: 116,
	Ab8: 116, A8: 117, As8: 118, Bb8: 118, B8: 119
}

const NoteDeltas: any = {
	major: [0, 2, 4, 5, 7, 9, 11, 12],
	major_pentatonic: [0, 2, 4, 7, 9, 12],
	minor: [0, 2, 3, 5, 7, 8, 10, 12],
	minor_pentatonic: [0, 3, 5, 7, 10, 12],
	chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
}

function invertEnum(enm: any) {
	for (let k of Object.getOwnPropertyNames(enm))
		enm[enm[k]] = k
}

invertEnum(Note)


function makeSingleScale(note: number, type: string) {
	let deltas: number[] = NoteDeltas[type]
	if (!deltas)
		throw new Error(`Scale type "${type}" does not exist`)
	let r = []
	for (let delta of deltas)
		r.push(note + delta)
	return r.ring()
}

export function makeScale(note: number, type = 'major', octaves = 1) {
	if (octaves <= 1)
		return makeSingleScale(note, type)
	let r = [].ring()
	for (let oct = 0; oct < octaves; oct++) {
		r = <any>r.concat(<any>makeSingleScale(note + oct * 12, type))
		if (oct < octaves - 1) r = r.butlast()
	}
	return r
}
