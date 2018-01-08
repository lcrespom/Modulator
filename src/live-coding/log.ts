import { Track } from './track'
import { Note } from './scales'
import { NoteInfo } from './scheduler'

let logEnabled = true
let logCount = 0
const MAX_LOG_LINES = 1000


export function logToPanel(always: boolean, asHTML: boolean, ...args: any[]) {
	if (!always && !logEnabled) return
	ffTweak()
	if (logCount++ > MAX_LOG_LINES)
		$('#walc-log-content > *:first-child').remove()
	let txt = args.join(', ')
	let div = $('<div>')
	if (asHTML) div.html(txt)
	else div.text(txt)
	$('#walc-log-content').append(div)
	let logContainer = $('#walc-log-container')
	logContainer.scrollTop(MAX_LOG_LINES * 100)
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
	let time = formatTime(track, note)
	let noteName = (<any>Note)[note.number]
	if (noteName && noteName.length < 3) noteName += ' '
	let snote = noteName
		? `[log-bold|${noteName}] (${note.number})`
		: `[log-bold|${note.number}]`
	let sinstr = `[log-instr|${note.instrument.name}]`
	let strack = `[log-track|${track.name}]`
	logToPanel(false, true, txt2html(
		`${time} - Note: ${snote} ${sinstr} ${strack}`
	))
}

export function logEvent(track: Track, txt: string) {
	let time = formatTime(track)
	logToPanel(false, true, txt2html(`${time} - ${txt}`))
}

function formatTime(track: Track, note?: NoteInfo) {
	let ntime = note ? note.time : 0
	let t = ntime + track.time * track.loopCount - track.latency
	let millis = (t % 1)
	let smillis = millis.toLocaleString(undefined, {
		minimumFractionDigits: 3, maximumFractionDigits: 3
	}).substr(2)
	t = Math.floor(t)
	let secs = (t % 60)
	let ssecs = secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })
	let mins = Math.floor(t / 60)
	return `[log-time|${mins}:${ssecs}.${smillis}]`
}

function ffTweak() {
	if (tweaked) return
	tweaked = true
	if (navigator.userAgent.indexOf('Firefox') < 0) return
	let logContainer = $('#walc-log-container')
	let h = logContainer.height()
	logContainer.css('height', h + 'px')
}

let tweaked = false
