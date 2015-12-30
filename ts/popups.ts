export function alert(msg: string, title?: string): void {
	popup.find('.popup-message').html(msg);
	popup.find('.modal-title').text(title || 'Alert');
	popup.find('.popup-ok').hide();
	popup.find('.popup-close').html('Close');
	popup.find('.popup-prompt > input').hide();
	popup.modal();
}

export function confirm(msg: string, title: string,
	cbClose: (boolean) => void, cbOpen?: () => void) {
	let result = false;
	popup.find('.popup-message').html(msg);
	popup.find('.modal-title').text(title || 'Please confirm');
	const okButton = popup.find('.popup-ok');
	okButton.show().click(_ => result = true);
	popup.find('.popup-prompt > input').hide();
	popup.find('.popup-close').text('Cancel');
	popup.one('shown.bs.modal', _ => {
		okButton.focus();
		if (cbOpen) cbOpen();
	});
	popup.find('form').one('submit', _ => {
		result = true;
		okButton.click();
		return false;
	});
	popup.one('hide.bs.modal', _ => {
		okButton.off('click');
		cbClose(result);
	});
	popup.modal();
}

export function prompt(msg: string, title: string,
	initialValue: string, cb: (string) => void): void {
	const input = popup.find('.popup-prompt > input');
	confirm(msg, title, confirmed => {
		if (!cb) return;
		if (!confirmed) cb(null);
		else cb(input.val());
	}, () => {
		input.show();
		input.focus();
		if (initialValue) {
			input.val(initialValue);
			const hinput: HTMLInputElement = <HTMLInputElement>input[0];
			hinput.select();
		}
		else input.val('');
	});
}


const popup = $(`
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
`);

$('body').append(popup);

