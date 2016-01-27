import * as tracker from './tracker/song';
import { Pianola } from './tracker/pianola';


function rowWithNotes(...notes): tracker.NoteRow {
	const nr = new tracker.NoteRow();
	nr.notes = notes;
	return nr;
}

function createNotes(): tracker.NoteRow[] {
	const rows = [];
	let i = 0;
	rows[i] = rowWithNotes(tracker.Note.on(48));
	i += 4;
	rows[i] = rowWithNotes(tracker.Note.off(48), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	i += 4;
	rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(50));
	rows[i] = rowWithNotes(tracker.Note.off(50), tracker.Note.on(60));
	i += 4;
	rows[i] = rowWithNotes(tracker.Note.off(60), tracker.Note.on(55));
	i += 4;
	rows[i++] = rowWithNotes(tracker.Note.off(55), tracker.Note.on(53));
	rows[i++] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(52));
	rows[i++] = rowWithNotes(tracker.Note.off(52), tracker.Note.on(53));
	rows[i] = rowWithNotes(tracker.Note.off(53), tracker.Note.on(50));
	i += 4;
	rows[i] = rowWithNotes(tracker.Note.off(50));
	return rows;
}

function starWars(): tracker.Song {
	const p = new tracker.Part();
	p.instrument = null; //TODO
	p.voices = 1;
	p.name = 'Main theme';
	p.rows = createNotes();
	const t = new tracker.Track();
	t.parts.push(p);
	const s = new tracker.Song();
	s.title = 'Star Wars';
	s.bpm = 90;
	s.tracks.push(t);
	return s;
}


//--------------------------------------------------

const pianola = new Pianola($('#past-notes'), $('#piano'), $('#future-notes'));

const sw = starWars();
pianola.render(sw.tracks[0].parts[0], 0);
