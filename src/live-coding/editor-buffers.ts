const NUM_BUFFERS = 8
let currentBuffer = 1


// -------------------- Buffer navigation --------------------

export function handleBuffers(editor: any) {
	handleEditorStorage(editor)
	for (let i = 1; i <= NUM_BUFFERS; i++)
		registerButton(i, editor)
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
	storeBuffer(currentBuffer, getEditorText(editor))
	setEditorText(editor, loadBuffer(num))
	currentBuffer = num
	editor.focus()
	editor.revealLine(1) // TODO store cursor positions
}


// -------------------- Buffer storage management --------------------

function handleEditorStorage(editor: any) {
	recoverStoredCode(editor)
	watchCodeAndStoreIt(editor)
}

function recoverStoredCode(editor: any) {
	let code = loadBuffer(currentBuffer)
	if (code)
		setEditorText(editor, code)
}

function watchCodeAndStoreIt(editor: any) {
	let storedCode = getEditorText(editor)
	setInterval(() => {
		let code = getEditorText(editor)
		if (storedCode == code) return
		storeBuffer(currentBuffer, code)
		storedCode = code
	}, 1000)
}


// -------------------- Helpers --------------------

function storeBuffer(num: number, txt: string) {
	localStorage.setItem('code_buffer_' + num, txt)
}

function loadBuffer(num: number): string {
	return localStorage.getItem('code_buffer_' + num) || ''
}

function setEditorText(editor: any, text: string) {
	editor.getModel().setValue(text)
}

function getEditorText(editor: any): string {
	return editor.getModel().getValue()
}
