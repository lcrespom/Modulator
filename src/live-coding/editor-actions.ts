import { doRunCode, flashRange } from './editor'


export function registerActions(editor: any, monaco: any) {
	let editorActions = new EditorActions(editor)
	registerButtons(editorActions)
	editor.addAction({
		id: 'walc-run-all',
		label: 'Run all code',
		keybindings: [
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
		],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1,
		run: () => editorActions.runAllCode()
	})
	editor.addAction({
		id: 'walc-run-part',
		label: 'Run current line or selection',
		keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 1,
		run: () => editorActions.runSomeCode()
	})
	editor.addAction({
		id: 'walc-font-sm',
		label: 'Reduce code font',
		keybindings: [
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA,
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_MINUS
		],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 2,
		run: () => editorActions.reduceFont()
	})
	editor.addAction({
		id: 'walc-font-lg',
		label: 'Enlarge code font',
		keybindings: [
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_DOT,
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_EQUAL
		],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 2,
		run: () => editorActions.enlargeFont()
	})
}

function registerButtons(editorActions: EditorActions) {
	$('#walc-font-sm').click(_ => editorActions.reduceFont())
	$('#walc-font-lg').click(_ => editorActions.enlargeFont())
	$('#walc-run-all').click(_ => editorActions.runAllCode())
	$('#walc-run-sel').click(_ => editorActions.runSomeCode())
}


class EditorActions {
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

	reduceFont() {
		let fs = this.getFontSize()
		if (fs <= 1) return
		this.editor.updateOptions({ fontSize: fs - 1 })
	}

	enlargeFont() {
		this.editor.updateOptions({ fontSize: this.getFontSize() + 1 })
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
