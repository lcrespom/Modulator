import { Pianola } from './pianola';
import { Part } from './song';
import { Timer } from '../synth/timer';
import { ModernAudioContext } from '../utils/modern';

export class PartBox {
	playing = false;
	$play: JQuery;
	timer: Timer;
	ac: ModernAudioContext;
	part: Part;
	pianola: Pianola;
	rowNum: number;

	constructor(ac: ModernAudioContext, $elem: JQuery, part: Part, pianola: Pianola) {
		this.rowNum = 0;
		this.ac = ac;
		this.$play = $elem.find('.play');
		this.$play.click(_ => this.play());
		this.part = part;
		this.pianola = pianola;
		this.pianola.render(this.part, this.rowNum);
		this.registerWheel();
	}

	play() {
		if (!this.part) return;
		this.playing = !this.playing;
		if (this.playing) {
			this.setButIcon(this.$play, 'pause');
			this.timer = new Timer(this.ac, 90);
			this.timer.start(when => {
				this.part.playRow(this.rowNum, when);
				this.pianola.render(this.part, this.rowNum++);
				if (this.rowNum > this.part.rows.length)
					this.stop();
			});
		}
		else {
			this.pause();
		}
	}

	pause() {
		this.setButIcon(this.$play, 'play');
		this.timer.stop();
		this.part.instrument.allNotesOff();
	}

	stop() {
		this.pause();
		this.playing = false;
		this.rowNum = 0;
	}

	setButIcon($but: JQuery, icon: string) {
		const $glyph = $but.find('.glyphicon');
		const classes = $glyph.attr('class').split(/\s+/)
			.filter(c => !c.match(/glyphicon-/)).concat('glyphicon-' + icon);
		$glyph.attr('class', classes.join(' '));
	}

	registerWheel() {
	}
}