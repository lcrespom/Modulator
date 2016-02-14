import { PartBox } from './partBox';
import { Song } from './song';

export class PartList {
	$parts: JQuery;
	song: Song;
	pbox: PartBox;

	constructor($elem: JQuery, song: Song, pbox: PartBox) {
		this.song = song;
		this.$parts = $elem.find('select');
		this.pbox = pbox;
		this.initList();
	}

	initList() {
		this.$parts.empty();
		let i = 0;
		for (const part of this.song.parts) {
			const selected = this.pbox.part == part ? ' selected' : '';
			this.$parts.append(`<option${selected} value="${i}">${part.name}</option>`);
			i++;
		}
	}
}