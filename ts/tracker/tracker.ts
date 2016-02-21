import * as tracker from './song';
import { Pianola } from './pianola';
import { PartBox } from './partBox';
import { PartList } from './partList';
import { TracksBox } from './tracksBox';
import { SongBox } from './songBox';

import { Instrument } from '../synth/instrument';

import { ModernAudioContext } from '../utils/modern';


function rowWithNotes(...notes): tracker.NoteRow {
	const nr = new tracker.NoteRow();
	nr.notes = notes;
	return nr;
}

function createNotes(rows: tracker.NoteRow[]): void {
	let i = 0;
	rows[i] = rowWithNotes(tracker.Note.on(48));
	i += 4;
	rows[i] = rowWithNotes(tracker.Note.off(48), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	i += 5;
	rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	i += 5;
	rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(53));
	rows[i] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(50));
	i += 5;
	rows[i] = rowWithNotes(tracker.Note.off(50));
}

function starWars(ac: ModernAudioContext, preset: any): tracker.Song {
	const p = new tracker.Part(64);
	p.preset = preset;
	p.instrument = new Instrument(ac, p.preset, 4);
	p.name = 'Main theme';
	createNotes(p.rows);
	const t = new tracker.Track();
	t.parts.push(p);
	const s = new tracker.Song(ac);
	s.title = 'Star Wars';
	s.bpm = 90;
	s.tracks.push(t);
	s.tracks.push(new tracker.Track());
	s.tracks.push(new tracker.Track());
	s.tracks.push(new tracker.Track());
	s.parts.push(p);
	return s;
}


//--------------------------------------------------

export function setupTracker(ac: ModernAudioContext, presets: any[]) {
	const song = starWars(ac, presets[5]);
	const part = song.tracks[0].parts[0];
	const pianola = new Pianola($('#past-notes'), $('#piano'), $('#future-notes'));
	const pbox = new PartBox(ac, $('#part-box'), part, pianola, presets);
	const tbox = new TracksBox($('#tracks'), song, pbox);
	new SongBox($('#song-box'), song);
	new PartList($('#part-list'), song, pbox);
	$(document).on('route:show', (e, page) => {
		if (page == '#tracker') {
			pbox.refresh();
			tbox.refresh();
		}
	});
}
