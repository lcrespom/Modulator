var oldPage = null;

export function setupRoutes(mainRoute): Promise<void> {
	window.onhashchange = showPageFromHash;
	showPageFromHash(mainRoute);
	return loadPages();
}

function showPageFromHash(mainRoute) {
	const hash = location.hash || mainRoute;
	$('#page > div').hide();
	$(hash).show().css('outline','none').focus();
	if (oldPage) $(document).trigger('route:hide', oldPage);
	$(document).trigger('route:show', hash);
	oldPage = hash;
}

function loadPages(): Promise<void> {
	return new Promise<void>(resolve => {
		$.get('tracker.html', data => {
			$('#tracker').empty().append(data);
			resolve();
		});
	});
}