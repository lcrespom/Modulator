import { doRunCode, flashRange } from './editor'
import { LiveCoding } from './live-coding'
import { prevBuffer, nextBuffer } from './editor-buffers'


export function registerActions(editor: any) {
	const CTRL_ALT = monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd
	const CTRL_SHIFT = monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift
	let editorActions = new EditorActions(editor)
	registerButtons(editorActions)
	setColorTheme(editorActions)
	registerDnD()
	// -------------------- Run code actions --------------------
	editor.addAction({
		id: 'walc-run-all',
		label: 'Run all code',
		keybindings: [CTRL_ALT | monaco.KeyCode.Enter],
		contextMenuGroupId: 'modulator',
		contextMenuOrder: 1,
		run: () => editorActions.runAllCode()
	})
	editor.addAction({
		id: 'walc-run-part',
		label: 'Run current line or selection',
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
		contextMenuGroupId: 'modulator',
		contextMenuOrder: 2,
		run: () => editorActions.runSomeCode()
	})
	editor.addAction({
		id: 'walc-stop-all',
		label: 'Stop all tracks',
		keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_DOT],
		contextMenuGroupId: 'modulator',
		contextMenuOrder: 3,
		run: () => editorActions.stopAllTracks()
	})
	// -------------------- Font size actions --------------------
	editor.addAction({
		id: 'walc-font-sm',
		label: 'Reduce code font',
		keybindings: [CTRL_ALT | monaco.KeyCode.US_COMMA],
		contextMenuGroupId: 'modulator',
		contextMenuOrder: 4,
		run: () => editorActions.reduceFont()
	})
	editor.addAction({
		id: 'walc-font-lg',
		label: 'Enlarge code font',
		keybindings: [CTRL_ALT | monaco.KeyCode.US_DOT],
		contextMenuGroupId: 'modulator',
		contextMenuOrder: 5,
		run: () => editorActions.enlargeFont()
	})
	// -------------------- Buffer actions --------------------
	editor.addAction({
		id: 'walc-buffer-prev',
		label: 'Previous code buffer',
		keybindings: [CTRL_SHIFT | monaco.KeyCode.US_COMMA],
		run: () => editorActions.showPrevBuffer()
	})
	editor.addAction({
		id: 'walc-buffer-next',
		label: 'Next code buffer',
		keybindings: [CTRL_SHIFT | monaco.KeyCode.US_DOT],
		run: () => editorActions.showNextBuffer()
	})
}

function registerButtons(editorActions: EditorActions) {
	let refocus = (x: any) => editorActions.editor.focus()
	// ----- Left buttons ----
	$('#walc-run-all').click(_ => refocus(editorActions.runAllCode()))
	$('#walc-run-sel').click(_ => refocus(editorActions.runSomeCode()))
	$('#walc-stop').click(_ => refocus(editorActions.stopAllTracks()))
	// ----- Right buttons -----
	$('#walc-toggle-theme').click(_ => refocus(editorActions.toggleTheme()))
	$('#walc-font-sm').click(_ => refocus(editorActions.reduceFont()))
	$('#walc-font-lg').click(_ => refocus(editorActions.enlargeFont()))
}

function setColorTheme(editorActions: EditorActions) {
	let theme = localStorage.walc_prefs_theme
	if (theme == 'dark') editorActions.toggleTheme()
}

function registerDnD() {
	$('body').on('drag dragstart dragend dragover dragenter dragleave drop', e => {
		e.preventDefault()
		e.stopPropagation()
	})
	.on('drop', e => console.log(
		// TODO: gather sample data and prepare buffers
		(<DragEvent>e.originalEvent).dataTransfer.files
	))
}


declare let lc: LiveCoding
declare let monaco: any


class EditorActions {
	lightTheme = true

	constructor(public editor: any) {}

	runAllCode() {
		let model = this.editor.getModel()
		doRunCode(model.getValue())
		flashRange(model.getFullModelRange())
	}

	runSomeCode() {
		let range = this.editor.getSelection()
		let sel = this.getRange(range)
		doRunCode(sel)
		flashRange(range)
	}

	stopAllTracks() {
		lc.reset()
	}

	toggleTheme() {
		this.lightTheme = !this.lightTheme
		if (this.lightTheme) {
			$('body').removeClass('dark')
			monaco.editor.setTheme('vs')
			$('.logo > img').attr('src', 'img/logo.svg')
		}
		else {
			$('body').addClass('dark')
			monaco.editor.setTheme('vs-dark')
			$('.logo > img').attr('src', 'img/logo-white.svg')
		}
		localStorage.walc_prefs_theme = this.lightTheme ? 'light' : 'dark'
	}

	reduceFont() {
		let fs = this.getFontSize()
		if (fs <= 1) return
		this.editor.updateOptions({ fontSize: fs - 1 })
	}

	enlargeFont() {
		this.editor.updateOptions({ fontSize: this.getFontSize() + 1 })
	}

	showPrevBuffer() {
		prevBuffer(this.editor)
	}
	showNextBuffer() {
		nextBuffer(this.editor)
	}

	private getRange(range: any) {
		let sel: string
		if (range.startLineNumber != range.endLineNumber
			|| range.startColumn != range.endColumn) {
			sel = this.editor.getModel().getValueInRange(range)
		}
		else {
			sel = this.editor.getModel().getLineContent(range.startLineNumber)
			range.startColumn = 1
			range.endColumn = sel.length + 1
		}
		return '\n'.repeat(range.startLineNumber - 1) + sel
	}

	private getFontSize() {
		return this.editor.getConfiguration().fontInfo.fontSize
	}
}
