var tracker, synth;

export function setupRoutes() {
	loadPages();
	window.onhashchange = showPageFromHash;
	showPageFromHash();
}

function showPageFromHash() {
	$('#page > div').hide();
	$(location.hash).show();
}

function loadPages() {
	$.get('tracker.html', data => {
		$('#tracker').empty().append(data);
	});
}