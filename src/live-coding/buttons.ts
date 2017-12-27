export function registerButtons(editor: any) {
	$('#walc-font-sm').click(_ => reduceFont(editor))
	$('#walc-font-lg').click(_ => enlargeFont(editor))
	registerShortcuts(editor)
}

function reduceFont(editor: any) {
	let fs = getFontSize(editor)
	if (fs <= 1) return
	editor.updateOptions({ fontSize: fs - 1 })
}

function enlargeFont(editor: any) {
	editor.updateOptions({ fontSize: getFontSize(editor) + 1 })
}

function getFontSize(editor: any) {
	return editor.getConfiguration().fontInfo.fontSize
}


declare let monaco: any

function registerShortcuts(editor: any) {
	editor.addAction({
		id: 'walc-font-sm',
		label: 'Reduce code font',
		keybindings: [
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_COMMA,
			monaco.KeyMod.Alt | monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_MINUS
		],
		contextMenuGroupId: 'navigation',
		contextMenuOrder: 2,
		run: () => reduceFont(editor)
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
		run: () => enlargeFont(editor)
	})
}