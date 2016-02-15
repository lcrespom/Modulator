import { PartBox } from './partBox';
import { Song, Part } from './song';

import * as popups from '../utils/popups';


export class PartList {
	$parts: JQuery;
	song: Song;
	pbox: PartBox;
	partNum: number;

	constructor($elem: JQuery, song: Song, pbox: PartBox) {
		this.song = song;
		this.$parts = $elem.find('select');
		this.pbox = pbox;
		this.registerButtons();
		this.registerList();
		this.refresh();
	}

	initList() {
		this.$parts.empty();
		let i = 0;
		for (const part of this.song.parts) {
			const selected = this.pbox.part == part ? ' selected' : '';
			if (selected) this.partNum = i;
			this.$parts.append(`<option${selected} value="${i}">${part.name}</option>`);
			i++;
		}
	}

	refresh() {
		this.initList();
		this.pbox.$delBut.prop('disabled', this.song.parts.length <= 1);
	}

	registerList() {
		this.$parts.change(_ => {
			this.pbox.stop();
			this.partNum = this.$parts.val();
			this.pbox.part = this.song.parts[this.partNum];
			this.pbox.refresh();
		});
	}

	registerButtons() {
		this.pbox.$delBut.click(_ => {
			popups.confirm('Delete current part?', 'Confirmation request', ok => {
				if (!ok) return;
				this.pbox.stop();
				this.song.parts = this.song.parts.filter(part => part != this.pbox.part);
				if (this.partNum >= this.song.parts.length) this.partNum--;
				this.pbox.part = this.song.parts[this.partNum];
				//TODO search part in tracks and remove it
				this.refresh();
				this.pbox.refresh();
			});
		});
		this.pbox.$newBut.click(_ => {
			this.pbox.stop();
			const oldPart = this.pbox.part;
			const part = new Part(oldPart.rows.length);
			part.preset = oldPart.preset;
			part.instrument = oldPart.instrument;
			part.name = 'Part ' + (this.song.parts.length + 1);
			this.song.parts.push(part);
			this.pbox.part = part;
			this.refresh();
			this.pbox.refresh();
		});
	}
}