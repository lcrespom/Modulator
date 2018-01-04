import { Track } from './track'
import { Note } from './scales'
import { NoteInfo } from './scheduler'

let logEnabled = true
let logCount = 0
const MAX_LOG_LINES = 1000


export function logToPanel(always: boolean, asHTML: boolean, ...args: any[]) {
	if (!always && !logEnabled) return
	if (logCount++ > MAX_LOG_LINES)
		$('#walc-log-content > *:first-child').remove()
	let txt = args.join(', ')
	let div = $('<div>')
	if (asHTML) div.html(txt)
	else div.text(txt)
	$('#walc-log-content').append(div)
	$('#walc-log-container').scrollTop(Number.MAX_SAFE_INTEGER)
}

export function enableLog(flag: boolean) {
	logEnabled = flag
}

export function txt2html(s: string) {
	return s.replace(/\[([^\]\|]+)\|([^\]\|]+)\]/g,
		(x, y, z) => `<span class="${y}">${z}</span>`
	)
}

export function clearLog() {
	logCount = 0
	$('#walc-log-content').empty()
}

export function logNote(note: NoteInfo, track: Track) {
	let noteName = (<any>Note)[note.number]
	if (noteName && noteName.length < 3) noteName += ' '
	let snote = noteName
		? `[log-bold|${noteName}] (${note.number})`
		: `[log-bold|${note.number}]`
	let sinstr = `[log-instr|${note.instrument.name}]`
	let strack = `[log-track|${track.name}]`
	logToPanel(false, true, txt2html(
		`Note: ${snote} ${sinstr} ${strack}`
	))
}
