/* global $:false, marked:false, hljs:false */

$(function() {
	// Hash change event handler
	window.onhashchange = function() {
		loadMD(location.hash.substr(1))
		.then(function() {
			window.scrollTo(0, 0);
		});
	};

	// Refresh key event handler
	document.body.onkeyup = function(evt) {
		if (evt.key == 'r')
			loadMD(location.hash.substr(1));
	};

	// List of languages to be highlighted
	let langs = ['javascript', 'html', 'css', 'bash'];

	// Load markdown document via AJAX and highlight code
	function loadMD(name) {
		return $.get('md/' + name + '.md')
		.then(function(md) {
			$('#mdcontent').html(marked(md));
			for (var i = 0; i < langs.length; i++)
				highlightCode(langs[i]);
		});
	}

	// Highlight code for a given language
	function highlightCode(lang) {
		$('code.lang-' + lang).each(function(i, block) {
			block.classList.add(lang);
			hljs.highlightBlock(block);
		});
	}

	// Load initial content
	if (location.hash == '')
		location.hash = '#synthlib';
	else
		loadMD(location.hash.substr(1));
});
