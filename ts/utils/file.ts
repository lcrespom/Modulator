//-------------------- Encoding / decoding --------------------

export function arrayBufferToBase64(buffer: number[]) {
	var binary = '';
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
	var binary_string = window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}


//-------------------- Downloading --------------------

export function browserSupportsDownload(): boolean {
	return !(<any>window).externalHost && 'download' in $('<a>')[0];
}

export function download(fileName: string, fileData: string) {
	const a = $('<a>');
	a.attr('download', fileName);
	a.attr('href',
		'data:application/octet-stream;base64,' + btoa(fileData));
	const clickEvent = new MouseEvent('click',
		{ view: window, bubbles: true, cancelable: false });
	a[0].dispatchEvent(clickEvent);
}


//-------------------- Uploading --------------------

type UploadCallback = (buf: any, file: string) => void

export function uploadText(event: Event, cb: UploadCallback) {
	upload(event, cb, 'readAsText');
}

export function uploadArrayBuffer(event: Event, cb: UploadCallback) {
	upload(event, cb, 'readAsArrayBuffer');
}

function upload(event: Event, cb: UploadCallback, readFunc: string) {
	let files = (<any>event.target).files
	if (!files || files.length <= 0) return cb('', '');
	const file = files[0];
	const reader = new FileReader();
	reader.onload = (loadEvt: any)  => cb(loadEvt.target.result, file);
	(<any>reader)[readFunc](file);
}