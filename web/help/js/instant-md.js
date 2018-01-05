/* global $:false, marked:false, hljs:false */

$(function() {
	// Hash change event handler
	window.onhashchange = function() {
		loadMD(location.hash.substr(1))
		.then(function() {
			window.scrollTo(0, 0)
		});
	};

	// Refresh key event handler
	document.body.onkeyup = function(evt) {
		if (evt.key == 'r')
			loadMD(location.hash.substr(1))
	};

	// List of languages to be highlighted
	let langs = ['typescript', 'javascript', 'html', 'css', 'bash']

	// Load markdown document via AJAX and highlight code
	function loadMD(name) {
		let isCode = name.endsWith('.ts')
		let url = isCode
			? '../js/' + name
			: 'md/' + name + '.md'
		return $.get(url)
		.then(function(md) {
			if (isCode) md = ts2md(md)
			$('#mdcontent').html(marked(md))
			for (var i = 0; i < langs.length; i++)
				highlightCode(langs[i])
		})
	}

	// Highlight code for a given language
	function highlightCode(lang) {
		$('code.lang-' + lang).each(function(i, block) {
			block.classList.add(lang)
			hljs.highlightBlock(block)
		})
	}

	function ts2md(txt) {
		let out = ''
		let a = txt.split('/**')
		for (let t of a) {
			t = t.trim()
			if (t.length < 1) continue
			let [comment, code] = t.split('*/')
			if (!code) continue
			code = code.split('\n')
				.filter(l => !l.trim().startsWith('//'))
				.join('\n')
			let block = comment + '\n\n'
			if (hasCode(code))
				block += '```typescript' + code + '\n' + '```' + '\n\n'
			out += block
		}
		return out
	}

	function hasCode(code) {
		return code.split('\n').map(l => l.trim()).join('').length > 0
	}

	// Load initial content
	if (location.hash == '')
		location.hash = '#synthlib'
	else
		loadMD(location.hash.substr(1))
})
