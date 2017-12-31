declare function require(name: string): any
const seedrandom = require('seedrandom')


export let random = {

	seed(newSeed?: number): number {
		if (newSeed !== undefined)
			setSeedNumber(newSeed)
		return seedNumber
	},

	float(from: number, to?: number): number {
		if (to === undefined) return rng() * from
		return from + rng() * (to - from)
	},

	integer(from: number, to: number): number {
		return from + Math.floor(rng() * (to - from + 1))
	},

	dice(sides: number): number {
		return this.integer(1, sides)
	},

	one_in(times: number): boolean {
		return this.dice(times) === 1
	},

	choose(...args: any[]): any {
		let arr: any[] = []
		for (let a of args) arr = arr.concat(a)
		return arr[this.dice(arr.length) - 1]
	}

}

let seedNumber = 0

let rng: () => number

function setSeedNumber(newSeed: number) {
	let seed = (newSeed + 123456789).toString()
	rng = seedrandom(seed)
	seedNumber = newSeed
}

setSeedNumber(0)
