export function setButIcon($but: JQuery, icon: string) {
	const $glyph = $but.find('.glyphicon');
	let classAttr = $glyph.attr('class');
	if (!classAttr) return;
	const classes = classAttr.split(/\s+/)
		.filter(c => !c.match(/glyphicon-/)).concat('glyphicon-' + icon);
	$glyph.attr('class', classes.join(' '));
}
