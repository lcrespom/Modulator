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
			if (isCode) {
				$('body').addClass('lc-api')
				md = ts2md(md, true, true)
			} else {
				$('body').removeClass('lc-api')
			}
			$('#mdcontent').html(marked(md))
			for (var i = 0; i < langs.length; i++)
				highlightCode(langs[i])
			makeAbsoluteLinksOpenInSeparateTab()
			makeTOC($('#toc-list'))
		})
	}

	// Highlight code for a given language
	function highlightCode(lang) {
		$('code.lang-' + lang).each(function(i, block) {
			block.classList.add(lang)
			hljs.highlightBlock(block)
		})
	}

	// This function does exactly what its names says
	function makeAbsoluteLinksOpenInSeparateTab() {
		$('a').each((i, e) => {
			let $e = $(e)
			let href = $e.attr('href')
			if (href.indexOf('://') >= 0)
				$e.attr('target', '_blank')
		})
	}

	function makeTOC(toc) {
		toc.empty()
		$('h2').each((i, e) => {
			let $e = $(e)
			let item = $('<li>'	+ $e.text() + '</a></li>')
			toc.append(item)
			item.click(_ => e.scrollIntoView())
		})
		if ($('h2').length > 0)
			$('#in-this-page').show()
		else
			$('#in-this-page').hide()
	}

	//-------------------- TS Definitions parsing --------------------

	function ts2md(txt, showCode = false, codeFirst = false) {
		let out = ''
		let chunks = parseCode(txt)
		if (codeFirst) {
			for (let i = 1; i < chunks.length; i++) {
				let currChunk = chunks[i]
				let prevChunk = chunks[i - 1]
				if (currChunk.type != 'doc' && prevChunk.type == 'doc') {
					chunks[i] = prevChunk
					chunks[i - 1] = currChunk
					i++
				}
			}
		}
		chunks = addHeaders(chunks)
		for (let chunk of chunks) {
			if (chunk.type == 'doc')
				out += chunk.text + '\n\n'
			else if (showCode)
				out += '```' + chunk.type + chunk.text + '\n' + '```' + '\n\n'
		}
		return out
	}

	function hasCode(code) {
		return code && code.split('\n').map(l => l.trim()).join('').length > 0
	}

	function parseCode(code) {
		let a = code.split('/**')
		let chunks = []
		for (let t of a) {
			t = t.trim()
			if (t.length < 1) continue
			t = removeLineComments(t)
			let [comment, code] = t.split('*/')
			comment = convertParams(comment)
			chunks.push({ type: 'doc', text: comment })
			if (hasCode(code))
				chunks.push({ type: 'typescript', text: code })
		}
		return chunks
	}

	function removeLineComments(txt) {
		return txt
			.split('\n')
			.filter(l => !l.trim().startsWith('//'))
			.join('\n')
	}

	function convertParams(txt) {
		return txt
			.split('\n')
			.map(l => l.trim())
			.map(l => l.startsWith('- ') ? '    ' + l : l)
			.map(l => l.replace(/@param\s+(\w+)/, '- **$1**:'))
			.join('\n')
	}

	function addHeaders(oldChunks) {
		return oldChunks.reduce(
			(chunks, chunk) => {
				if (chunk.type != 'doc') {
					addHeader(chunks, chunk, 'interface', '## ') ||
					addHeader(chunks, chunk,
						'declare let', '## Global variable: ') ||
					addHeader(chunks, chunk, 'const enum', '## Enum: ')
					}
				chunks.push(chunk)
				return chunks
			}, []
		)
	}

	function addHeader(chunks, chunk, match, prefix) {
		let regex = '\\s*' + match + '\\s+(\\w+)'
		let m = chunk.text.match(regex)
		if (m && m[1]) {
			chunks.push({ type: 'doc', text: prefix + m[1] })
			return true
		}
		return false
	}

	//-------------------- Load initial content --------------------

	if (location.hash == '')
		location.hash = '#about'
	else
		loadMD(location.hash.substr(1))
})
