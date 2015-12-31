import { ModernAudioNode } from './modern';

/**
 * Displays FFT and Oscilloscope graphs from the output of a given AudioNode
 */
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
		this.drawFFT(this.gcFFT, this.canvasFFT, this.fftData, '#00FF00');
		this.drawOsc(this.gcOsc, this.canvasOsc, this.oscData, '#FFFF00');
		this.requestAnimationFrame();
	}

	drawFFT(gc, canvas, data, color) {
		const [w, h] = this.setupDraw(gc, canvas, data, color);
		this.anode.getByteFrequencyData(data);
		const dx = (data.length / 2) / canvas.width;
		let x = 0;
		//TODO calculate average of all samples from x to x + dx - 1
		for (let i = 0; i < w; i++) {
			let y = data[Math.floor(x)];
			x += dx;
			gc.moveTo(i, h - 1);
			gc.lineTo(i, h - 1 - h * y/256);
		}
		gc.stroke();
		gc.closePath();
	}

	drawOsc(gc, canvas, data, color) {
		const [w, h] = this.setupDraw(gc, canvas, data, color);
		this.anode.getByteTimeDomainData(data);
		gc.moveTo(0, h / 2);
		let x = 0;
		while (data[x] > 128 && x < data.length/4) x++;
		while (data[x] < 128 && x < data.length/4) x++;
		const dx = (data.length * 0.75) / canvas.width;
		for (let i = 0; i < w; i++) {
			let y = data[Math.floor(x)];
			x += dx;
			gc.lineTo(i, h * y/256);
		}
		gc.stroke();
		gc.closePath();
	}

	setupDraw(gc, canvas, data, color) {
		const w = canvas.width;
		const h = canvas.height;
		gc.clearRect(0, 0, w, h);
		gc.beginPath();
		gc.strokeStyle = color;
		return [w, h];
	}
}