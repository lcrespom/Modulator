import { Presets } from '../synthUI/presets'
import { LiveCoding } from './live-coding'
import { SynthUI } from '../synthUI/synthUI'
import { LC_DEFINITIONS } from './lc-definitions'

let sinkDiv = document.createElement('div')

function byId(id: string) {
	return document.getElementById(id) || sinkDiv
}

// -------------------- Editor setup --------------------

let monacoRequire = (<any>window).require
declare let monaco: any
let editor: any
let decorations: any[] = []

function loadMonaco(cb: () => void) {
	monacoRequire.config({ paths: { 'vs': 'js/vendor/monaco/min/vs' }})
	monacoRequire(['vs/editor/editor.main'], cb)
}

export function createEditor(
	ac: AudioContext, presets: Presets, synthUI: SynthUI) {
	(<any>window).lc = new LiveCoding(ac, presets, synthUI)
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
		handleEditorFocus(editorElem)
		registerActions()
		preventParentScroll(editorElem)
	})
}

function setupDefinitions() {
	monaco.languages.typescript.
		typescriptDefaults.addExtraLib(LC_DEFINITIONS)
}

function preventParentScroll(elem: HTMLElement) {
	$(elem).bind('mousewheel', e => e.preventDefault())
}

function registerActions() {
	editor.addAction({
		id: 'walc-run',
		label: 'Run code',
		keybindings: [ monaco.KeyMod.Alt | monaco.KeyCode.Enter ],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1,
		run: doRunCode
	})
}

function handleEditorResize(elem: HTMLElement) {
	let edh = elem.clientHeight
	let edw = elem.clientWidth
	setInterval(_ => {
		let newH = elem.clientHeight
		let newW = elem.clientWidth
		if (edh != newH || edw != newW) {
			edh = newH
			edw = newW
			editor.layout()
		}
	}, 1000)
}

function handleEditorFocus(elem: HTMLElement) {
	editor.onDidFocusEditor(() => {
		if (elem.parentElement)
			elem.parentElement.scrollIntoView()
	})
}


// -------------------- Error handling --------------------

function getRuntimeErrorDecoration(lineNum: number) {
	let decs = editor.getLineDecorations(lineNum)
	if (!decs || decs.length <= 0) return null
	for (let dec of decs)
		if (dec.options.className == 'walc-error-line') return dec
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
			className: 'walc-error-line',
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

function doRunCode() {
	let code = editor.getModel().getValue()
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
