let oldPage: string
let mainRoute: string

export function setupRoutes(initialRoute: string) {
	window.onhashchange = showPageFromHash
	mainRoute = initialRoute
	showPageFromHash()
	return loadPages()
}

function showPageFromHash() {
	const hash = location.hash || mainRoute
	$('#page > div').hide()
	$(hash).show().css('outline', 'none').focus()
	if (oldPage) $(document).trigger('route:hide', oldPage)
	$(document).trigger('route:show', hash)
	oldPage = hash
	window.scrollTo(0, 0)
}

function loadPages() {
	return Promise.all([
		loadPage('live-coding'),
		loadPage('synth')
	])
}

function loadPage(pname: string) {
	return new Promise<void>(resolve => {
		$.get(pname + '.html', data => {
			$('#' + pname).empty().append(data)
			resolve()
		})
	})
}
