export class Ring<T> extends Array<T> {
	tick_ct = 0

	tick(): T {
		let result = this[this.tick_ct]
		this.tick_ct++
		if (this.tick_ct >= this.length) this.tick_ct = 0
		return result
	}

	choose(): T {
		return this[randomInt(this.length)]
	}

	fromArray(arr: T[]): Ring<T> {
		for (let x of arr) this.push(x)
		return this
	}

	toArray(): T[] {
		return new Array(...this)
	}

	clone(): Ring<T> {
		return copytick(this, this.toArray().ring())
	}

	reverse(): Ring<T> {
		return copytick(this, this.toArray().reverse().ring())
	}

	sort(compareFn?: (a: T, b: T) => number): this {
		let r = this.toArray().sort(compareFn).ring()
		return <this>copytick(this, r)
	}

	shuffle(): Ring<T> {
		let r = this.clone()
		for (let i = r.length - 1; i > 0; i--) {
			let j = randomInt(i + 1)
			let temp = r[i]
			r[i] = r[j]
			r[j] = temp
		}
		return copytick(this, r)
	}

	take(n: number): Ring<T> {
		return copytick(this, <Ring<T>>this.slice(0, n))
	}

	drop(n: number): Ring<T> {
		return copytick(this, <Ring<T>>this.slice(n))
	}

	butlast(): Ring<T> {
		return this.take(this.length - 1)
	}

	drop_last(n: number): Ring<T> {
		return this.take(this.length - n)
	}

	take_last(n: number): Ring<T> {
		return this.drop(this.length - n)
	}

	stretch(n: number): Ring<T> {
		let r = new Ring<T>()
		for (let x of this)
			for (let i = 0; i < n; i++)
				r.push(x)
		return copytick(this, r)
	}

	repeat(n: number): Ring<T> {
		let r = new Ring<T>()
		for (let i = 0; i < n; i++)
			for (let x of this)
				r.push(x)
		return copytick(this, r)
	}

	mirror(): Ring<T> {
		let r = this.concat(this.reverse())
		return copytick(this, <Ring<T>>r)
	}

	reflect(): Ring<T> {
		let r = this.concat(this.reverse().drop(1))
		return copytick(this, <Ring<T>>r)
	}

	scale(n: number): Ring<T> {
		let r = <any>this.clone()
		for (let i = 0; i < r.length; i++) r[i] *= n
		return copytick(this, r)
	}

	transpose(n: number): Ring<T> {
		let r = <any>this.clone()
		for (let i = 0; i < r.length; i++) r[i] += n
		return copytick(this, r)
	}

	toString() {
		let arr: string[] = []
		for (let x of this) arr.push(x.toString())
		arr[this.tick_ct] = '>' + arr[this.tick_ct] + '<'
		return '(' + arr.join(', ') + ')'
	}
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

function copytick<T>(from: Ring<T>, to: Ring<T>): Ring<T> {
	to.tick_ct = from.tick_ct
	if (to.tick_ct >= to.length) to.tick_ct = to.length - 1
	return to
}

// TODO: use real random
function randomInt(max: number) {
	return Math.floor(Math.random() * max)
}
