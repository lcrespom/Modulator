import { Song, Track, Part } from './song';
import { PartBox } from './partBox';

export class TracksBox {
	song: Song;
	pbox: PartBox;
	$box: JQuery;
	selTrack: number;

	constructor($elem: JQuery, song: Song, pbox: PartBox) {
		this.$box = $elem;
		this.song = song;
		this.pbox = pbox;
		this.selTrack = 0;
		this.registerButtons();
		this.registerPartNameChange();
		this.refresh();
	}

	refresh() {
		if (this.song.playing) {
			this.refreshPlaying();
		}
		else {
			//TODO refactor to hideSongPosition()
			$('#song-position').css('visibility', 'hidden');
			this.refreshEditing();
		}
	}

	refreshEditing() {
		this.$box.empty();
		for (let i = 0; i < this.song.tracks.length; i++) {
			const $tbox = this.addTrack(this.song.tracks[i]);
			this.registerTrackSel($tbox, i);
			if (i == this.selTrack)
				$tbox.addClass('track-selected');
			if (i == this.song.tracks.length - 1)
				$tbox.css('border-right', 'initial');
		}
	}

	addTrack(track: Track) {
		const $tbox = $('<div>');
		$tbox.addClass('track-column');
		for (const part of track.parts) {
			const $pbox = this.addPart($tbox, part);
			this.registerPartSel($pbox, part);
		}
		this.$box.append($tbox);
		return $tbox;
	}

	addPart($tbox: JQuery, part: Part) {
		const $pbox = $('<div>');
		$pbox.addClass('track-box');
		$pbox.css('height', part.rows.length);
		$pbox.text(part.name);
		$tbox.append($pbox);
	}

	refreshPlaying() {
		$('#song-position').css('visibility', 'visible');
		this.$box.find('.track-column').each((i, track) => {
			const yOfs = 122 - this.song.tracks[i].fullRowNum;
			$(track).css('top', '' + yOfs + 'px');
		});
		//TODO refresh pianola of current part of selected track
		//TODO also update part box
		/*
		Improvements:
		- Disable user scrolling during playing
		- Problem with scrollbars / horizontal scrollbar displayed after end of play
		*/
	}

	//-------------------- Event handlers --------------------

	registerTrackSel($tbox, i) {
		$tbox.click(_ => {
			$('.track-column').removeClass('track-selected');
			$tbox.addClass('track-selected');
			this.selTrack = i;
		});
	}

	registerPartSel($pbox, part) {
		//TODO******* implement
		//	Highlight selected part in track
		//	Consider also updating part in part box
	}

	registerButtons() {
		this.pbox.$addPartBut.click(_ => {
			const track = this.song.tracks[this.selTrack];
			track.parts.push(this.pbox.part);
			this.refresh();
		});
	}

	registerPartNameChange() {
		$(document).on('pbox:name-change', _ => this.refresh());
	}

}