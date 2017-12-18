// -------------------- Encoding / decoding --------------------

export function arrayBufferToBase64(buffer: number[]) {
	let binary = ''
	let bytes = new Uint8Array(buffer)
	let len = bytes.byteLength
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return window.btoa(binary)
}

export function base64ToArrayBuffer(base64: string) {
	let binary_string = window.atob(base64)
	let len = binary_string.length
	let bytes = new Uint8Array(len)
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i)
	}
	return bytes.buffer
}


// -------------------- Downloading --------------------

export function browserSupportsDownload(): boolean {
	return !(<any>window).externalHost && 'download' in $('<a>')[0]
}

export function download(fileName: string, fileData: string) {
	const a = $('<a>')
	a.attr('download', fileName)
	a.attr('href',
		'data:application/octet-stream;base64,' + btoa(fileData))
	const clickEvent = new MouseEvent('click',
		{ view: window, bubbles: true, cancelable: false })
	a[0].dispatchEvent(clickEvent)
}


// -------------------- Uploading --------------------

export type UploadCallback = (buf: any, file: any) => void

export function uploadText(event: JQuery.Event, cb: UploadCallback) {
	upload(event, cb, 'readAsText')
}

export function uploadArrayBuffer(event: JQuery.Event, cb: UploadCallback) {
	upload(event, cb, 'readAsArrayBuffer')
}

function upload(event: JQuery.Event, cb: UploadCallback, readFunc: string) {
	let files = (<any>event.target).files
	if (!files || files.length <= 0) return cb('', '')
	const file = files[0]
	const reader = new FileReader()
	reader.onload = (loadEvt: any)  => cb(loadEvt.target.result, file);
	(<any>reader)[readFunc](file)
}
