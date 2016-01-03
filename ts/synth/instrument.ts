import { ModernAudioContext } from './modern';
import { Synth, NodeData } from './synth';


/**
 * A polyphonic synth controlling an array of voices
 */
export class Instrument {
	voices: Voice[];
	voiceNum: number;

	constructor(ac: ModernAudioContext, json: any, numVoices: number, dest?: AudioNode) {
		this.voices = [];
		for (let i = 0; i < numVoices; i++)
			this.voices.push(new Voice(ac, json, dest));
		this.voiceNum = 0;
	}

	close() {
		for (const voice of this.voices)
			voice.close();
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		const voice = this.voices[this.voiceNum];
		voice.noteOn(midi, velocity, ratio);
		this.voiceNum = (this.voiceNum + 1) % this.voices.length;
	}

	noteOff(midi: number, velocity: number): void {
		for (const voice of this.voices) {
			if (voice.lastNote == midi) {
				voice.noteOff(midi, velocity);
				break;
			}
		}
	}

}


/**
 * An independent monophonic synth
 */
export class Voice {
	synth: Synth;
	lastNote: number;
	loader: SynthLoader;

	constructor(ac: ModernAudioContext, json: any, dest?: AudioNode) {
		//TODO make an "invisible" voice, decoupled form SynthUI, canvas, and Graph editor
		const jqCanvas = $('<canvas width="100" height="100" style="display: none">');
		const dummyCanvas: HTMLCanvasElement = <HTMLCanvasElement>jqCanvas[0];
		this.loader = new SynthLoader();
		this.synth = this.loader.load(ac, json, dest || ac.destination);
		this.lastNote = 0;
	}

	noteOn(midi: number, velocity: number, ratio: number): void {
		this.synth.noteOn(midi, velocity, ratio);
		this.lastNote = midi;
	}

	close() {
		//TODO very important to avoid memory leaks
		if (this.lastNote) this.noteOff(this.lastNote, 1);
		this.loader.close();
	}

	noteOff(midi: number, velocity: number): void {
		this.synth.noteOff(midi, velocity);
		this.lastNote = 0;
	}
}


class VoiceNodeData extends NodeData {
	inputs: NodeData[] = [];
	getInputs(): NodeData[] {
		return this.inputs;
	}
}

class SynthLoader {
	nodes: VoiceNodeData[] = [];

	load(ac: ModernAudioContext, json: any, dest: AudioNode): Synth {
		const synth = new Synth(ac);
		// Add nodes into id-based table
		for (const jn of json.nodes)
			this.nodes[jn.id] = new VoiceNodeData();
		// Then set their list of inputs
		for (const jn of json.nodes)
			for (const inum of jn.inputs)
				this.nodes[jn.id].inputs.push(this.nodes[inum]);
		// Then set their data
		for (let i = 0; i < json.nodes.length; i++) {
			const type = json.nodeData[i].type;
			if (type == 'out')
				synth.initOutputNodeData(this.nodes[i], dest);
			else
				synth.initNodeData(this.nodes[i], type);
			synth.json2NodeData(json.nodeData[i], this.nodes[i]);
		}
		// Then notify connections to handler
		for (const dst of this.nodes)
			for (const src of dst.inputs)
				synth.connectNodes(src, dst);
		// Finally, return the newly created synth
		return synth;
	}

	close() {
		// const nodes: Node[] = this.synthUI.gr.nodes.slice();
		// for (const node of nodes)
		// 	this.synthUI.removeNode(node);
	}
}
