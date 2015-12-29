import { ModernAudioNode } from './modern';

export class AudioAnalyzer {
	input: ModernAudioNode;
	anode: AnalyserNode;
	canvasFFT: HTMLCanvasElement;
	gcFFT: CanvasRenderingContext2D;
	canvasOsc: HTMLCanvasElement;
	gcOsc: CanvasRenderingContext2D;
	oscData: Uint8Array;
	fftData: Uint8Array;

	constructor(jqfft: JQuery, jqosc: JQuery) {
		this.canvasFFT = this.createCanvas(jqfft);
		this.gcFFT = this.canvasFFT.getContext('2d');
		this.canvasOsc = this.createCanvas(jqosc);
		this.gcOsc = this.canvasOsc.getContext('2d');
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
		this.fftData = new Uint8Array(this.anode.fftSize);
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
		//this.drawGraph(this.gcFFT, this.canvasFFT);
		this.drawData(this.gcOsc, this.canvasOsc, this.oscData);
	}

	drawData(gc, canvas, data) {
		this.anode.getByteTimeDomainData(data);
		const w = canvas.width;
		const h = canvas.height;
		gc.clearRect(0, 0, w, h);
		gc.beginPath();
		gc.strokeStyle = '#FFFF00';
		gc.moveTo(0, h / 2);
		const dx = data.length / canvas.width;
		let x = 0;
		//TODO syncronize start when it crosses a 0
		for (let i = 0; i < w; i++) {
			let y = data[Math.floor(x)];
			x += dx;
			gc.lineTo(i, h * y/256);
		}
		gc.stroke();
		gc.closePath();
		this.requestAnimationFrame();
	}
}