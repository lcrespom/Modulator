interface JQueryWithModal extends JQuery {
	modal(options?: any): void
}

/** Informs whether a popup is open or not */
export let isOpen = false
export function setOpen(open: boolean) {
	isOpen = open
}

/** Bootstrap-based equivalent of standard alert function */
export function alert(msg: string, title?: string, hideClose?: boolean, options?: any): void {
	popup.find('.popup-message').html(msg)
	popup.find('.modal-title').text(title || 'Alert')
	popup.find('.popup-ok').hide()
	if (hideClose)
		popup.find('.popup-close').hide()
	else
		popup.find('.popup-close').html('Close')
	popup.find('.popup-prompt > input').hide()
	isOpen = true
	popup.one('hidden.bs.modal', _ => isOpen = false)
	popup.modal(options)
}

/** Like an alert, but without a close button */
export function progress(msg: string, title?: string): void {
	alert(msg, title, true, { keyboard: false })
}

/** Closes a popup in case it is open */
export function close() {
	if (!isOpen) return
	popup.find('.popup-ok').click()
}

/** Bootstrap-based equivalent of standard confirm function */
export function confirm(msg: string, title: string,
	cbClose: (b: boolean) => void, cbOpen?: () => void) {
	let result = false
	popup.find('.popup-message').html(msg)
	popup.find('.modal-title').text(title || 'Please confirm')
	const okButton = popup.find('.popup-ok')
	okButton.show().click(_ => result = true)
	popup.find('.popup-prompt > input').hide()
	popup.find('.popup-close').text('Cancel')
	popup.one('shown.bs.modal', _ => {
		okButton.focus()
		if (cbOpen) cbOpen()
	})
	popup.find('form').one('submit', _ => {
		result = true
		okButton.click()
		return false
	})
	popup.one('hide.bs.modal', _ => {
		okButton.off('click')
		isOpen = false
		cbClose(result)
	})
	isOpen = true
	popup.modal()
}

/** Bootstrap-based equivalent of standard prompt function */
export function prompt(msg: string, title: string,
	initialValue: string, cb: ((s: any) => void) | null): void {
	const input = popup.find('.popup-prompt > input')
	confirm(msg, title, confirmed => {
		if (!cb) return
		if (!confirmed) cb(null)
		else cb(input.val())
	}, () => {
		input.show()
		input.focus()
		if (initialValue) {
			input.val(initialValue)
			const hinput: HTMLInputElement = <HTMLInputElement>input[0]
			hinput.select()
		}
		else input.val('')
	})
}


const popup = <JQueryWithModal> $(`
	<div class="normal-font modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<h4 class="modal-title" id="myModalLabel"></h4>
		</div>
		<div class="modal-body">
			<div class="popup-message"></div>
			<form class="popup-prompt">
				<input type="text" style="width: 100%">
			</form>
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-default popup-close" data-dismiss="modal"></button>
			<button type="button" class="btn btn-primary popup-ok" data-dismiss="modal">OK</button>
		</div>
		</div>
	</div>
	</div>
`)

$('body').append(popup)

