import { Presets } from '../synthUI/presets'
import { SynthUI } from '../synthUI/synthUI'

import { LiveCoding, tracks } from './live-coding'
import { LC_DEFINITIONS } from './lc-definitions'

let sinkDiv = document.createElement('div')

function byId(id: string) {
	return document.getElementById(id) || sinkDiv
}

// -------------------- Editor setup --------------------

let global = <any>window
let monacoRequire = global.require
declare let monaco: any
let editor: any
let decorations: any[] = []

function loadMonaco(cb: () => void) {
	monacoRequire.config({ paths: { 'vs': 'js/vendor/monaco/min/vs' }})
	monacoRequire(['vs/editor/editor.main'], cb)
}

export function createEditor(
	ac: AudioContext, presets: Presets, synthUI: SynthUI) {
	global.lc = new LiveCoding(ac, presets, synthUI)
	global.tracks = tracks
	loadMonaco(function() {
		let editorElem = byId('walc-code-editor')
		setupDefinitions()
		editor = monaco.editor.create(editorElem, {
			value: '',
			language: 'typescript',
			lineNumbers: false,
			renderLineHighlight: 'none',
			minimap: { enabled: false }
			// fontSize: 15
		})
		handleEditorResize(editorElem)
		registerActions()
		preventParentScroll(editorElem)
		editor.focus()
		$(document).on('route:show', (e, h) => {
			if (h != '#live-coding') return
			editor.focus()
			window.scrollTo(0, 0)
		})
	})
}

function preventParentScroll(elem: HTMLElement) {
	$(elem).bind('mousewheel', e => e.preventDefault())
}

function setupDefinitions() {
	monaco.languages.typescript.
		typescriptDefaults.addExtraLib(LC_DEFINITIONS)
}

function registerActions() {
	editor.addAction({
		id: 'walc-run-all',
		label: 'Run all code',
		keybindings: [
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
		],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1,
		run: runAllCode
	})
	editor.addAction({
		id: 'walc-run-part',
		label: 'Run current line or selection',
		keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1,
		run: runSomeCode
	})
}

function handleEditorResize(elem: HTMLElement) {
	let edw = elem.clientWidth
	setInterval(_ => {
		let newW = elem.clientWidth
		if (edw != newW) {
			edw = newW
			editor.layout()
		}
	}, 1000)
}


// -------------------- Error handling --------------------

function getRuntimeErrorDecoration(lineNum: number) {
	let decs = editor.getLineDecorations(lineNum)
	if (!decs || decs.length <= 0) return null
	for (let dec of decs)
		if (dec.options.className == 'walc-error') return dec
	return null
}

function getErrorLocation(e: any) {
	// Safari
	if (e.line)
		return { line: e.line, column: e.column }
	// Chrome: <anonymous>
	// Firefox: > eval
	let match = e.stack.match(/(<anonymous>|> eval):(\d+):(\d+)/)
	if (match && match.length == 4) {
		return {
			line: parseInt(match[2], 10),
			column: parseInt(match[3], 10)
		}
	}
	return null
}

function showError(msg: string, line: number, col: number) {
	console.log(`Runtime error: "${msg}" at line ${line}, column ${col}`)
	editor.revealLineInCenter(line)
	let errorRange = getErrorRange(editor.getModel().getLineContent(line), col)
	decorations = editor.deltaDecorations(decorations, [{
		range: new monaco.Range(line, errorRange.from, line, errorRange.to),
		options: {
			isWholeLine: false,
			className: 'walc-error',
			hoverMessage: ['**Runtime Error**', msg ]
		}
	}])
	return errorRange
}

function getErrorRange(s: string, col: number) {
	s = s.substring(col - 1)
	let m = s.match(/\s*[\w_$]+/)
	if (m && m.index !== undefined && m[0]) {
		return { from: col + m.index, to: col + m.index + m[0].length }
	}
	return { from: 0, to: s.length + 1 }
}

// -------------------- Code execution --------------------

function flashRange(range: any) {
	let decs: any[] = []
	decs = editor.deltaDecorations(decs, [{
		range,
		options: {
			isWholeLine: false,
			className: 'walc-running'
		}
	}])
	setTimeout(_ => {
		$('.walc-running').css('background-color', 'inherit')
		setTimeout(() => {
			decs = editor.deltaDecorations(decs, [])
		}, 1000)
	}, 100)
}

function doRunCode(code: string) {
	try {
		decorations = editor.deltaDecorations(decorations, [])
		// tslint:disable-next-line:no-eval
		eval(code)
	} catch (e) {
		let location = getErrorLocation(e)
		if (location)
			showError(e.message, location.line, location.column)
	}
}

function runAllCode() {
	doRunCode(editor.getModel().getValue())
	let range = {
		startColumn: 1,
		endColumn: Number.MAX_SAFE_INTEGER,
		startLineNumber: 1,
		endLineNumber: Number.MAX_SAFE_INTEGER
	}
	flashRange(range)
}

function runSomeCode() {
	let range = editor.getSelection()
	let sel: string
	if (range.startLineNumber != range.endLineNumber
		|| range.startColumn != range.endColumn) {
		sel = editor.getModel().getValueInRange(range)
	}
	else {
		sel = editor.getModel().getLineContent(range.startLineNumber)
		range.startColumn = 1
		range.endColumn = sel.length + 1
	}
	sel = '\n'.repeat(range.startLineNumber - 1) + sel
	doRunCode(sel)
	flashRange(range)
}
