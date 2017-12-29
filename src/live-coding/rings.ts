class Ring<T> extends Array<T> {
	tick_ct = -1

	constructor(arr: T[]) {
		super()
		for (let x of arr) this.push(x)
	}

	tick(): T {
		this.tick_ct++
		if (this.tick_ct >= this.length) this.tick_ct = 0
		return this[this.tick_ct]
	}

	reverse(): Ring<T> {
		let result: Ring<T> = [].ring()
		for (let x of this) result.unshift(x)
		return result
	}
	/*
		.sort - creates a sorted version of the ring
		.shuffle - creates a shuffled version of the ring
		.pick(3) - returns a ring with the results of calling .choose 3 times
		.pick - similar to .pick(3) only the size defaults to the same as the original ring
		.take(5) - returns a new ring containing only the first 5 elements
		.drop(3) - returns a new ring with everything but the first 3 elements
		.butlast - returns a new ring with the last element missing
		.drop_last(3) - returns a new ring with the last 3 elements missing
		.take_last(6)- returns a new ring with only the last 6 elements
		.stretch(2) - repeats each element in the ring twice
		.repeat(3) - repeats the entire ring 3 times
		.mirror - adds the ring to a reversed version of itself
		.reflect - same as mirror but doesn’t duplicate middle value
		.scale(2) - returns a new ring with all elements multiplied by 2 (assumes ring contains numbers only)
	*/
}

declare global {
	interface Array<T> {
		ring: () => Ring<T>
	}
}

export function setupRing() {
	(<any>Array.prototype).ring = function() {
		return new Ring(this)
	}
}
