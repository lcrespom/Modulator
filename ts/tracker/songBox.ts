import { Song } from './song';
import { setButIcon } from '../utils/uiUtils';

export class SongBox {
	song: Song;
	$playBut: JQuery;
	$bpm: JQuery;
	playing: boolean;

	constructor($elem: JQuery, song: Song) {
		this.playing = false;
		this.song = song;
		this.$playBut = $elem.find('.but-play');
		this.registerButtons();
		this.$bpm = $elem.find('.song-bpm');
		this.$bpm.val(song.bpm);
		this.registerBPM();
	}

	play() {
		this.playing = !this.playing;
		if (this.playing) {
			setButIcon(this.$playBut, 'pause');
			this.song.play(() => {
				//TODO**** update UI:
				//	- Pianola shows current part of selected track
				//	- TrackBox shows horizontal line with current row
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

	//-------------------- Event handlers --------------------

	registerButtons() {
		this.$playBut.click(_ => this.play());
	}

	registerBPM() {
		this.$bpm.on('input', _ => {
			this.song.bpm = parseInt(this.$bpm.val());
		});
	}
}