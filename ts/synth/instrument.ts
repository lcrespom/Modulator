import { ModernAudioContext } from './modern';
import { Synth, NodeData, Portamento } from './synth';


/**
 * A polyphonic synth controlling an array of voices
 */
export class Instrument {
	voices: Voice[];
	voiceNum: number;
	portamento: Portamento;

	constructor(ac: ModernAudioContext, json: any, numVoices: number, dest?: AudioNode) {
		// Setup voices
		this.voices = [];
		for (let i = 0; i < numVoices; i++)
			this.voices.push(new Voice(ac, json, dest));
		this.voiceNum = 0;
		// Setup synth params by having a common instance for all voices
		this.portamento = this.voices[0].synth.portamento;
		if (json.keyboard && json.keyboard.portamento)
			this.portamento.time = json.keyboard.portamento;
		for (let i = 1; i < numVoices; i++)
			this.voices[i].synth.portamento = this.portamento;
	}

	noteOn(midi: number, velocity: number = 1, when?: number): void {
		const voice = this.voices[this.voiceNum];
		voice.noteOn(midi, velocity, when);
		this.voiceNum = (this.voiceNum + 1) % this.voices.length;
	}

	noteOff(midi: number, velocity: number = 1, when?: number): void {
		for (const voice of this.voices) {
			if (voice.lastNote == midi) {
				voice.noteOff(midi, velocity, when);
				break;
			}
		}
	}

	close() {
		for (const voice of this.voices) voice.close();
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
		this.loader = new SynthLoader();
		this.synth = this.loader.load(ac, json, dest || ac.destination);
		this.lastNote = 0;
	}

	noteOn(midi: number, velocity: number = 1, when?: number): void {
		this.synth.noteOn(midi, velocity, when);
		this.lastNote = midi;
	}

	noteOff(midi: number, velocity: number = 1, when?: number): void {
		this.synth.noteOff(midi, velocity, when);
		this.lastNote = 0;
	}

	close(): void {
		// This method must be called to avoid memory leaks at the Web Audio level
		if (this.lastNote) this.noteOff(this.lastNote, 1);
		this.loader.close();
	}
}


//-------------------- Private --------------------

class VoiceNodeData extends NodeData {
	inputs: NodeData[] = [];
	getInputs(): NodeData[] {
		return this.inputs;
	}
}

class SynthLoader {
	nodes: VoiceNodeData[] = [];
	synth: Synth;

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
		this.synth = synth;
		return synth;
	}

	close() {
		for (const node of this.nodes)
			for (const input of node.inputs)
				this.synth.disconnectNodes(input, node);
	}
}
