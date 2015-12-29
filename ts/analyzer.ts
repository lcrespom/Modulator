import { ModernAudioNode } from './modern';

export class AudioAnalyzer {
	input: ModernAudioNode;
	anode: AnalyserNode;
	canvas: HTMLCanvasElement;
	gc: CanvasRenderingContext2D;
	oscData: Uint8Array;

	constructor(jqfft: JQuery, jqosc: JQuery) {
		this.canvas = this.createCanvas(jqosc);
		this.gc = this.canvas.getContext('2d');
	}

	createCanvas(panel: JQuery): HTMLCanvasElement {
		const jqCanvas = $(`<canvas width="${panel.width()}" height="${panel.height()}">`);
		panel.append(jqCanvas);
		const canvas = <HTMLCanvasElement>jqCanvas[0];
		return canvas;
	}

	createAnalyzerNode(ac: AudioContext) {
		if (this.anode) return;
		this.anode = ac.createAnalyser();
		this.oscData = new Uint8Array(this.anode.fftSize);
	}

	analyze(input: AudioNode) {
		this.disconnect();
		this.createAnalyzerNode(input.context);
		this.input = input;
		this.input.connect(this.anode);
		this.requestAnimationFrame();
	}

	disconnect() {
		if (!this.input) return;
		this.input.disconnect(this.anode);
		this.input = null;
	}

	requestAnimationFrame() {
		window.requestAnimationFrame(_ => this.updateCanvas());
	}
	updateCanvas() {
		if (!this.input) return;
		this.anode.getByteTimeDomainData(this.oscData);
		this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.gc.strokeStyle = '#FFFF00';
		this.gc.beginPath();
		this.gc.moveTo(0, 0);
		this.gc.lineTo(this.canvas.width, this.canvas.height);
		this.gc.closePath();
		this.gc.stroke();
		this.requestAnimationFrame();
	}
}