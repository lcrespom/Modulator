import { Song, Track, Part } from './song';

export class TracksBox {
	song: Song;
	$box: JQuery;

	constructor($elem: JQuery, song: Song) {
		this.$box = $elem;
		this.song = song;	
		this.refresh();
	}

	refresh() {
		this.$box.empty();
		for (const track of this.song.tracks) {
			this.addTrack(track);
		}
	}

	addTrack(track: Track) {
		const $tbox = $('<div>');
		$tbox.addClass('track-column');
		for (const part of track.parts) {
			this.addPart($tbox, part);
		}
		this.$box.append($tbox);
	}

	addPart($tbox: JQuery, part: Part) {
		const $pbox = $('<div>');
		$pbox.addClass('track-box');
		$pbox.text(part.name);
		$tbox.append($pbox);
	}
}