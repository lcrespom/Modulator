interface TimerCallback {
	(time: number): void;
}

export class Timer {
	running: boolean;
	ac: AudioContext;
	cb: TimerCallback;
	bpm: number;
	interval: number;
	ahead: number;
	nextNoteTime: number;

	constructor(ac: AudioContext, bpm = 60, interval = 0.025, ahead = 0.1) {
		this.running = false;
		this.ac = ac;
		this.bpm = bpm;
		this.interval = interval;
		this.ahead = ahead;
	}

	start(cb?: TimerCallback): void {
		if (this.running) return;
		this.running = true;
		if (cb) this.cb = cb;
		this.nextNoteTime = this.ac.currentTime;
		this.tick();
	}

	stop(): void {
		this.running = false;
	}

	tick(): void {
		if (!this.running) return;
		setTimeout(this.tick.bind(this), this.interval * 1000);
		while (this.nextNoteTime < this.ac.currentTime + this.ahead) {
			if (this.cb) this.cb(this.nextNoteTime);
			this.nextNoteTime += (1/4) * 60 / this.bpm;
		}
	}
}