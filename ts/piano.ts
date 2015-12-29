const NUM_WHITES = 17;

export class PianoKeyboard {
	constructor(panel: JQuery) {
		var pw = panel.width();
		var ph = panel.height();
		var kw = pw / NUM_WHITES + 1;
		var bw = kw * 2 / 3;
		var bh = ph * 2 / 3;
		// Create white keys
		for (let i = 0; i < NUM_WHITES; i++) {
			const key = $('<div class="piano-key">').css({
				width: '' + kw + 'px',
				height: '' + ph + 'px'
			});
			panel.append(key);
		}
		// Create black keys
		let x = 10 - bw / 2;
		for (let i = 0; i < NUM_WHITES - 1; i++) {
			x += kw - 1;
			if (i % 7 == 2 || i % 7 == 6) continue;
			const key = $('<div class="piano-key piano-black">').css({
				width: '' + bw + 'px',
				height: '' + bh + 'px',
				left: '' + x + 'px',
				top: '10px'
			});
			panel.append(key);
		}
	}
}