import { Pianola } from './pianola';
import { Part } from './song';
import { Timer } from '../synth/timer';
import { ModernAudioContext } from '../utils/modern';

export class PartBox {
	playing = false;
	$play: JQuery;
	timer: Timer;
	ac: ModernAudioContext;
	_part: Part;
	pianola: Pianola;
	rowNum: number;

	set part(part: Part) {
		this._part = part;
		this.rowNum = 0;
		if (this.pianola)
			this.pianola.render(this._part, this.rowNum);
	}
	get part() { return this._part; }

	constructor(ac: ModernAudioContext, $elem: JQuery) {
		this.ac = ac;
		this.$play = $elem.find('.play');
		this.$play.click(_ => this.play());
	}

	play() {
		if (!this.part) return;
		this.playing = !this.playing;
		if (this.playing) {
			//TODO: change button icon to "pause"
			this.timer = new Timer(this.ac, 90);
			this.timer.start(when => {
				this.part.playRow(this.rowNum, when);
				this.pianola.render(this.part, this.rowNum++);
				if (this.rowNum > this.part.rows.length)
					this.stop();
			});
		}
		else {
			//TODO: change button icon to "play"
			this.pause();
		}
	}

	pause() {
		this.timer.stop();
		this.part.instrument.allNotesOff();
	}

	stop() {
		this.pause();
		this.playing = false;
		this.rowNum = 0;
	}

}