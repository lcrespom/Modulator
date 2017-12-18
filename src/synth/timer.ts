export interface TimerCallback {
	(time: number): void
}

export class Timer {
	running: boolean
	ac: AudioContext
	cb: TimerCallback
	_bpm: number
	ahead: number
	nextNoteTime: number
	noteDuration: number

	constructor(ac: AudioContext, bpm = 60, ahead = 0.1) {
		this.running = false
		this.ac = ac
		this.noteDuration = 0
		this.nextNoteTime = 0
		this.bpm = bpm
		this.ahead = ahead
	}

	get bpm() { return this._bpm }

	set bpm(v) {
		this._bpm = v
		this.nextNoteTime -= this.noteDuration
		this.noteDuration = (1 / 4) * 60 / this._bpm
		this.nextNoteTime += this.noteDuration
	}

	start(cb?: TimerCallback): void {
		if (this.running) return
		this.running = true
		if (cb) this.cb = cb
		this.nextNoteTime = this.ac.currentTime
		this.tick()
	}

	stop(): void {
		this.running = false
	}

	tick(): void {
		if (!this.running) return
		requestAnimationFrame(this.tick.bind(this))
		while (this.nextNoteTime < this.ac.currentTime + this.ahead) {
			if (this.cb) this.cb(this.nextNoteTime)
			this.nextNoteTime += this.noteDuration
		}
	}
}
