import { Song } from './song';
import { setButIcon } from '../utils/uiUtils';

export class SongBox {
	song: Song;
	$playBut: JQuery;
	playing: boolean;

	constructor($elem: JQuery, song: Song) {
		this.playing = false;
		this.song = song;
		this.$playBut = $elem.find('.but-play');
		this.registerButtons();
	}

	play() {
		this.playing = !this.playing;
		if (this.playing) {
			setButIcon(this.$playBut, 'pause');
			this.song.bpm = 90;		//TODO******** use BPM from input
			this.song.play(() => {
				//TODO**** update UI
				if (!this.song.playing)
					this.stop();
			});
		}
		else {
			this.pause();
		}
	}

	pause() {
		setButIcon(this.$playBut, 'play');
		this.song.pause();
	}

	stop() {
		this.pause();
		this.playing = false;

	}

	registerButtons() {
		this.$playBut.click(_ => {
			this.play();
		});
	}
}