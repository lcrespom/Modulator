class Ring<T> extends Array<T> {
	tick_ct = 0

	tick(): T {
		let result = this[this.tick_ct]
		this.tick_ct++
		if (this.tick_ct >= this.length) this.tick_ct = 0
		return result
	}

	fromArray(arr: T[]): Ring<T> {
		for (let x of arr) this.push(x)
		return this
	}

	toArray(): T[] {
		return new Array(...this)
	}

	clone(): Ring<T> {
		return this.toArray().ring()
	}

	reverse(): Ring<T> {
		return this.toArray().reverse().ring()
	}

	sort(compareFn?: (a: T, b: T) => number) {
		return <this>this.toArray().sort(compareFn).ring()
	}

	toString() {
		let arr: string[] = []
		for (let x of this) arr.push(x.toString())
		arr[this.tick_ct] = '>' + arr[this.tick_ct] + '<'
		return '(' + arr.join(', ') + ')'
	}
	/*
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
	if (!Array.prototype.ring) {
		Array.prototype.ring = function() {
			return new Ring().fromArray(this)
		}
	}
}
