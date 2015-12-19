import { SynthUI } from './synthUI';

const graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0];
const synthUI = new SynthUI(graphCanvas, $('#node-params'));
registerPlayHandler();


function registerPlayHandler() {
	let playing = false;

	const $playBut = $('#play-stop');
	$playBut.click(togglePlayStop);
	$('body').keypress(evt => {
		if (evt.keyCode == 32)
			togglePlayStop();
	});

	function togglePlayStop() {
		if (playing) {
			synthUI.synth.stop();
			$playBut.text('Play');
		}
		else {
			synthUI.synth.play();
			$playBut.text('Stop');
		}
		playing = !playing;
	}

}
