const NUM_BUFFERS = 8
let currentBuffer = 1


// -------------------- Buffer navigation --------------------

export function handleBuffers(editor: any) {
	handleEditorStorage(editor)
	for (let i = 1; i <= NUM_BUFFERS; i++)
		registerButton(i, editor)
	selectSavedBuffer(editor)
}

export function prevBuffer(editor: any) {
	let num = currentBuffer - 1
	if (num < 1) num = NUM_BUFFERS
	bufferChanged(num, editor)
}

export function nextBuffer(editor: any) {
	let num = currentBuffer + 1
	if (num > NUM_BUFFERS) num = 1
	bufferChanged(num, editor)
}

function registerButton(id: number, editor: any) {
	getButton$(id).click(_ => bufferChanged(id, editor))
}

function getButton$(id: number) {
	return $('#walc-buffer-' + id)
}

function updateButtons(disableId: number, enableId: number) {
	getButton$(disableId)
		.removeClass('btn-info')
		.addClass('btn-primary')
	getButton$(enableId)
		.removeClass('btn-primary')
		.addClass('btn-info')
}

function bufferChanged(num: number, editor: any) {
	updateButtons(currentBuffer, num)
	storeBuffer(currentBuffer, editor)
	loadBuffer(num, editor)
	currentBuffer = num
	localStorage.setItem('code_buffer_selected', '' + currentBuffer)
	editor.focus()
}

function selectSavedBuffer(editor: any) {
	let snum = localStorage.getItem('code_buffer_selected') || '1'
	let num = parseInt(snum, 10)
	if (!isNaN(num))
		bufferChanged(num, editor)
}

// -------------------- Buffer storage management --------------------

function handleEditorStorage(editor: any) {
	loadBuffer(currentBuffer, editor)
	watchCodeAndStoreIt(editor)
}

function watchCodeAndStoreIt(editor: any) {
	let storedCode = getEditorText(editor)
	let storedPos = editor.getPosition()
	setInterval(() => {
		let code = getEditorText(editor)
		let pos = editor.getPosition()
		if (storedCode == code
			&& storedPos.lineNumber == pos.lineNumber
			&& storedPos.column == pos.column) return
		storeBuffer(currentBuffer, editor)
		storedCode = code
		storedPos = pos
	}, 1000)
}


// -------------------- Helpers --------------------

function storeBuffer(num: number, editor: any) {
	let txt = getEditorText(editor)
	localStorage.setItem('code_buffer_' + num, txt)
	let prefs = {
		fontSize: editor.getConfiguration().fontInfo.fontSize,
		position: editor.getPosition()
	}
	localStorage.setItem('code_buffer_prefs_' + num, JSON.stringify(prefs))
}

function loadBuffer(num: number, editor: any) {
	let code = localStorage.getItem('code_buffer_' + num) || ''
	setEditorText(editor, code)
	let sprefs = localStorage.getItem('code_buffer_prefs_' + num)
	if (sprefs) {
		let prefs = JSON.parse(sprefs)
		editor.setPosition(prefs.position)
		editor.revealPositionInCenterIfOutsideViewport(prefs.position)
		editor.updateOptions({ fontSize: prefs.fontSize })
	}
}

function setEditorText(editor: any, text: string) {
	editor.getModel().setValue(text)
}

function getEditorText(editor: any): string {
	return editor.getModel().getValue()
}
