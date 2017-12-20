import { Presets } from '../synthUI/presets'
import { LiveCoding } from './live-coding';

let sinkDiv = document.createElement('div')

function byId(id: string) {
	return document.getElementById(id) || sinkDiv
}

// -------------------- Editor setup --------------------

let monacoRequire = (<any>window).require
declare let monaco: any
let editor: any
let decorations: any[] = []
let currentError: any

function loadMonaco(cb: () => void) {
	monacoRequire.config({ paths: { 'vs': 'js/vendor/monaco/min/vs' }})
	monacoRequire(['vs/editor/editor.main'], cb)
}

export function createEditor(ac: AudioContext, presets: Presets) {
	(<any>window).lc = new LiveCoding(ac, presets)
	loadMonaco(function() {
		registerHoverHandler()
		let editorElem = byId('walc-code-editor')
		setupDefinitions()
		editor = monaco.editor.create(editorElem, {
			value: '',
			language: 'typescript',
			lineNumbers: false,
			renderLineHighlight: 'none',
			minimap: { enabled: false }
		})
		handleEditorResize(editorElem)
		registerActions()
		preventParentScroll(editorElem)
	})
}

function setupDefinitions() {
	monaco.languages.typescript.typescriptDefaults.addExtraLib(`
	interface Instrument {
		name: string
	}

	type TrackCallback = (t: Track) => void;

	interface LiveCoding {
		/** Creates an instrument from a preset name or number */
		instrument(preset: string | number, numVoices?: number): Instrument;
		/** Creates a named track to be used */
		track(name: string, cb?: TrackCallback): Track;
	}

	interface Track {
		/** Sets the instrument to play in the track */
		instrument(inst: Instrument): this;
		/** Sets the volume to use in the track */
		volume(v: number): void;
		/** Plays a given note */
		play(note: number, options?: any): this;
		/** Waits the specified time in seconds before playing the next note */
		sleep(time: number): this;
	}

	declare let lc: LiveCoding
	`)
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


// -------------------- Error handling --------------------

function registerHoverHandler() {
	monaco.languages.registerHoverProvider('javascript', {
		provideHover: function(model: any, position: any) {
			// TODO: make it dynamic
			// 		call editor.getLineDecorations to get current error position
			if (!currentError ||
				position.lineNumber != currentError.line ||
				position.column > currentError.column) return
			return {
				contents: [
					'**Runtime Error**',
					currentError.message
				]
			}
		}
	})
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
	if (col <= 1)
		col = getFirstWordEnd(editor.getModel().getLineContent(line))
	decorations = editor.deltaDecorations(decorations, [{
		range: new monaco.Range(line, 1, line, col),
		options: {
			isWholeLine: false,
			className: 'walc-error-line'
		}
	}])
}

function getFirstWordEnd(s: string): number {
	let m = s.match(/\s*\w+/)
	let pos = m && m.index !== undefined && m[0] ? m.index + m[0].length + 1 : 0
	if (pos <= 1) pos = s.length + 1
	return pos
}

// -------------------- Code execution --------------------

function doRunCode() {
	let code = editor.getModel().getValue()
	try {
		currentError = null
		decorations = editor.deltaDecorations(decorations, [])
		// tslint:disable-next-line:no-eval
		eval(code)
	} catch (e) {
		let location = getErrorLocation(e)
		if (location) {
			currentError = e
			currentError.line = location.line
			currentError.column = location.column > 1 ? location.column : 4
			showError(e.message, location.line, location.column)
		}
	}
}
