import { Song } from './song';

export class SongBox {
	song: Song;
	$playBut: JQuery;

	constructor($elem: JQuery, song: Song) {
		this.song = song;
		this.$playBut = $elem.find('.but-play');
		this.registerButtons();
	}

	registerButtons() {
		this.$playBut.click(_ => {
			//TODO******
		});
	}
}