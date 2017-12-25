let oldPage: string
let mainRoute: string

export function setupRoutes(initialRoute: string): Promise<void> {
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

function loadPages(): Promise<void> {
	return new Promise<void>(resolve => {
		$.get('live-coding.html', data => {
			$('#live-coding').empty().append(data)
			resolve()
		})
	})
}
