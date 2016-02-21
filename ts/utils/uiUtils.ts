export function setButIcon($but: JQuery, icon: string) {
	const $glyph = $but.find('.glyphicon');
	const classes = $glyph.attr('class').split(/\s+/)
		.filter(c => !c.match(/glyphicon-/)).concat('glyphicon-' + icon);
	$glyph.attr('class', classes.join(' '));
}
