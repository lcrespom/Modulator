import { Presets } from '../synthUI/presets'
import { SynthUI } from '../synthUI/synthUI'

import { LiveCoding } from './live-coding'
import { registerActions } from './editor-actions'
import { setupRing } from './rings'
import { Note } from './scales'
import { random } from './random'
import { handleBuffers } from './editor-buffers'
import { AudioAnalyzer } from '../synthUI/analyzer'
import { logToPanel, txt2html } from './log'
import { instruments, effects, tracks } from './scheduler'


let sinkDiv = document.createElement('div')

function byId(id: string) {
	return document.getElementById(id) || sinkDiv
}

// -------------------- Editor setup --------------------

let global = <any>window
let monacoRequire = global.require
declare let monaco: any
let editor: any
let _synthUI: SynthUI
let analyzer: AudioAnalyzer
let decorations: any[] = []

function loadMonaco(cb: () => void) {
	monacoRequire.config({ paths: { 'vs': 'js/vendor/monaco/min/vs' }})
	monacoRequire(['vs/editor/editor.main'], cb)
}

export function createEditor(
	ac: AudioContext, presets: Presets, synthUI: SynthUI) {
	setupGlobals(new LiveCoding(ac, presets, synthUI))
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
		registerActions(editor, monaco)
		editor.focus()
		handleBuffers(editor)
		$(document).on('route:show', (e, h) => {
			if (h != '#live-coding') return
			editor.focus()
			window.scrollTo(0, 0)
		})
		_synthUI = synthUI
		analyzer = new AudioAnalyzer($('#walc-graph-fft'), $('#walc-graph-osc'))
	})
}

function setupGlobals(lc: LiveCoding) {
	global.lc = lc
	global.instruments = instruments
	global.effects = effects
	global.tracks = tracks
	global.Note = Note
	global.random = random
	global.global = {}
	setupRing()
}

function addTypeScriptDefinitions(defs: string) {
	monaco.languages.typescript.typescriptDefaults.addExtraLib(defs)
}

function setupDefinitions() {
	fetch('js/lc-definitions.ts')
	.then(response => response.text())
	.then(addTypeScriptDefinitions)
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

function setupAnalyzers() {
	analyzer.analyze(_synthUI.outNode)
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
	if (!e.stack) return null
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
	logToPanel(true, true, txt2html(
		`[log-bold|Runtime error]: "${msg}" at line ${line}, column ${col}`
	))
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

export function flashRange(range: any) {
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

export function doRunCode(code: string) {
	setupAnalyzers()
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
