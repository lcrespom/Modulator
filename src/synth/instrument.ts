import { Synth, NodeData, Portamento } from './synth'


/**
 * A polyphonic synth controlling an array of voices
 */
export class Instrument {
	voices: Voice[]
	pressed: number[]
	released: number[]
	portamento: Portamento

	constructor(ac: AudioContext, json: any, numVoices: number, dest?: AudioNode) {
		// Setup voices
		this.pressed = []
		this.released = []
		this.voices = []
		for (let i = 0; i < numVoices; i++) {
			this.voices.push(new Voice(ac, json, dest))
			this.released.push(i)
		}
		// Setup synth params by having a common instance for all voices
		this.portamento = this.voices[0].synth.portamento
		if (json.keyboard && json.keyboard.portamento)
			this.portamento.time = json.keyboard.portamento
		for (let i = 1; i < numVoices; i++)
			this.voices[i].synth.portamento = this.portamento
	}

	noteOn(midi: number, velocity = 1, when?: number): void {
		const vnum = this.findVoice()
		const voice = this.voices[vnum]
		this.pressed.push(vnum)
		voice.noteOn(midi, velocity, when)
	}

	noteOff(midi: number, velocity = 1, when?: number): void {
		for (let i = 0; i < this.voices.length; i++) {
			const voice = this.voices[i]
			if (voice.lastNote == midi) {
				voice.noteOff(midi, velocity, when)
				this.released.push(i)
				break
			}
		}
	}

	allNotesOff() {
		for (const voice of this.voices) {
			if (voice.lastNote) voice.noteOff(voice.lastNote)
		}
	}

	findVoice(): number {
		let voices: number[]
		if (this.released.length > 0) voices = this.released
		else if (this.pressed.length > 0) voices = this.pressed
		else throw 'This should never happen'
		return voices.splice(0, 1)[0]
	}

	close() {
		for (const voice of this.voices) voice.close()
	}
}


/**
 * An independent monophonic synth
 */
export class Voice {
	synth: Synth
	lastNote: number
	loader: SynthLoader
	nodes: NodeTable

	constructor(ac: AudioContext, json: any, dest?: AudioNode) {
		this.nodes = {}
		this.loader = new SynthLoader()
		this.synth = this.loader.load(ac, json, dest || ac.destination, this.nodes)
		this.lastNote = 0
	}

	noteOn(midi: number, velocity = 1, when?: number): void {
		this.synth.noteOn(midi, velocity, when)
		this.lastNote = midi
	}

	noteOff(midi: number, velocity = 1, when?: number): void {
		this.synth.noteOff(midi, velocity, when)
		this.lastNote = 0
	}

	getParameterNode(nname: string, pname: string): AudioParam {
		let n = this.nodes[nname]
		if (!n)
			throw new Error(`Node "${nname}" not found in synth`)
		return (<any>n)[pname]
	}

	close(): void {
		// This method must be called to avoid memory leaks at the Web Audio level
		if (this.lastNote) this.noteOff(this.lastNote, 1)
		this.loader.close()
	}
}


// -------------------- Private --------------------

class VoiceNodeData extends NodeData {
	inputs: NodeData[] = []
	constructor(public id: number) {
		super()
	}
	getInputs(): NodeData[] {
		return this.inputs
	}
}

interface NodeTable {
	[k: string]: AudioNode
}

class SynthLoader {
	nodes: VoiceNodeData[] = []
	synth: Synth

	load(ac: AudioContext, json: any, dest: AudioNode, nodes: NodeTable): Synth {
		const synth = new Synth(ac)
		// Add nodes into id-based table
		let j = 0
		for (const jn of json.nodes)
			this.nodes[j++] = new VoiceNodeData(jn.id)
		// Then set their list of inputs
		for (let i = 0; i < json.nodes.length; i++)
			for (const inum of json.nodes[i].inputs) {
				let input = this.nodeById(inum)
				if (input) this.nodes[i].inputs.push(input)
			}
		// Then set their data
		for (let i = 0; i < json.nodes.length; i++) {
			const type = json.nodeData[i].type
			let anode: AudioNode
			if (type == 'out')
				anode = synth.initOutputNodeData(this.nodes[i], dest)
			else
				anode = synth.initNodeData(this.nodes[i], type)
			synth.json2NodeData(json.nodeData[i], this.nodes[i])
			this.registerNode(anode, nodes, json.nodes[i].name)
		}
		// Then notify connections to handler
		for (const dst of this.nodes)
			for (const src of dst.inputs)
				synth.connectNodes(src, dst)
		// Finally, return the newly created synth
		this.synth = synth
		return synth
	}

	nodeById(id: number): VoiceNodeData | null {
		for (const node of this.nodes)
			if (node.id === id) return node
		return null
	}

	registerNode(anode: AudioNode, nodes: NodeTable, name: string) {
		nodes[name] = anode
	}

	close() {
		for (const node of this.nodes)
			for (const input of node.inputs)
				this.synth.disconnectNodes(input, node)
	}
}
