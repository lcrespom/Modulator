import * as tracker from './tracker/song';
import { Pianola } from './tracker/pianola';
import { PartBox } from './tracker/partUI';

import { Instrument } from './synth/instrument';

import { ModernAudioContext } from './utils/modern';


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
	return rows;
}

function starWars(ac: ModernAudioContext): tracker.Song {
	const p = new tracker.Part();
	p.voices = 4;
	const json = {
		nodes: [
			{id: 0, inputs: [1]},
			{id: 1, inputs: []}
		],
		nodeData: [
			{type: 'out', params: {}},
			{type: 'Oscillator', params: {frequency: 440, detune: 0, type: 'square'}}
		]
	};
	p.instrument = new Instrument(ac, json, p.voices);
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

const ac = <ModernAudioContext>new AudioContext();
const sw = starWars(ac);

const part = sw.tracks[0].parts[0];
const pianola = new Pianola($('#past-notes'), $('#piano'), $('#future-notes'));
const pbox = new PartBox(ac, $('#part-box'), part, pianola);
