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

export function preventLogParentScroll() {
	$('#walc-log-container').bind('wheel', function(e) {
		let evt = <WheelEvent>e.originalEvent
		this.scrollTop += evt.deltaY
		e.preventDefault()
	})
}

export function txt2html(s: string) {
	return s.replace(/\{([^\{\|]+)\|([^\{\|]+)}/g,
		(x, y, z) => `<span class="${y}">${z}</span>`
	)
}

export function clearLog() {
	$('#walc-log-content').empty()
}
