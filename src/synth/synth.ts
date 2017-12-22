import { NoteHandler, NoteHandlers } from './notes'
import { NodeDef, NodeParamDef, NodePalette, palette } from './palette'
import { ModernAudioNode, removeArrayElement } from '../utils/modern'
import * as custom from './customNodes'
import * as file from '../utils/file'


const SEMITONE = Math.pow(2, 1 / 12)
const A4 = 57

/**
 * Holds all data associated with an AudioNode
 */
export class NodeData {
	// Used by all nodes
	type: string
	anode: ModernAudioNode
	nodeDef: NodeDef
	// Used by control nodes
	controlParam: string
	controlParams: string[] | null
	controlTarget: ModernAudioNode
	// Used by source audio nodes
	noteHandler: NoteHandler
	// Flag to avoid deleting output node
	isOut = false
	// Reference to owner synth
	synth: Synth
	// To be implemented by user code
	getInputs(): NodeData[] {
		throw 'Error: getInputs() function should be implemented by user'
	}
}

/**
 * Global paramters that apply to the whole monophonic synthesizer.
 */
export class Portamento {
	time = 0
	ratio = 0
}

// TODO *** refactor & decouple from UI
export interface ParamHandler {
	uiRender: string
	initialize(anode: AudioNode, def: NodeDef): void
	param2json(anode: AudioNode): any
	json2param(anode: AudioNode, json: any): any
}

/**
 * Performs global operations on all AudioNodes:
 * - Manages AudioNode creation, initialization and connection
 * - Distributes MIDI keyboard events to NoteHandlers
 */
export class Synth {
	ac: AudioContext
	customNodes: { [key: string]: Function } = {}
	paramHandlers: { [key: string]: ParamHandler } = {}
	palette: NodePalette
	noteHandlers: NoteHandler[] = []
	portamento = new Portamento()
	outGainNode: GainNode

	constructor(ac: AudioContext) {
		this.ac = ac
		this.palette = palette
		this.registerCustomNode('createADSR', custom.ADSR)
		this.registerCustomNode('createNoise', custom.NoiseGenerator)
		this.registerCustomNode('createNoiseCtrl', custom.NoiseCtrlGenerator)
		this.registerCustomNode('createLineIn', custom.LineInNode)
		this.registerCustomNode('createDetuner', custom.Detuner)
		this.registerParamHandler('BufferDataHandler', new BufferDataHandler())
		this.registerParamHandler('SoundBankHandler', new SoundBankHandler())
	}

	createAudioNode(type: string): AudioNode | null {
		const def: NodeDef = palette[type]
		if (!def) return null
		const factory: any = def.custom ? this.customNodes : this.ac
		if (!def.constructor || !factory[def.constructor]) return null
		const anode = factory[def.constructor]()
		if (!anode.context) anode.context = this.ac
		this.initNodeParams(anode, def, type)
		return anode
	}

	initNodeData(ndata: NodeData, type: string): void {
		ndata.synth = this
		ndata.type = type
		let anode = this.createAudioNode(type)
		if (!anode)
			return console.error(`No AudioNode found for '${type}'`)
		ndata.anode = anode
		ndata.nodeDef = this.palette[type]
		const nh = ndata.nodeDef.noteHandler
		if (nh) {
			ndata.noteHandler = new (<any>NoteHandlers)[nh](ndata)
			this.addNoteHandler(ndata.noteHandler)
		}
	}

	initOutputNodeData(ndata: NodeData, dst: AudioNode): void {
		ndata.synth = this
		ndata.type = 'out'
		this.outGainNode = this.ac.createGain()
		ndata.anode = this.outGainNode
		ndata.anode.connect(dst)
		ndata.nodeDef = this.palette['Speaker']
		ndata.isOut = true
	}

	removeNodeData(data: NodeData) {
		if (data.noteHandler)
			this.removeNoteHandler(data.noteHandler)
	}

	connectNodes(srcData: NodeData, dstData: NodeData): void {
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			let anode: any = dstData.anode
			srcData.controlParams = Object.keys(dstData.nodeDef.params)
				.filter(pname => anode[pname] instanceof AudioParam)
			srcData.controlParam = srcData.controlParams[0]
			srcData.controlTarget = dstData.anode
			srcData.anode.connect(anode[srcData.controlParam])
		}
		else srcData.anode.connect(dstData.anode)
	}

	disconnectNodes(srcData: NodeData, dstData: NodeData): void {
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = null
			srcData.anode.disconnect((<any>dstData.anode)[srcData.controlParam])
		}
		else
			srcData.anode.disconnect(dstData.anode)
	}

	json2NodeData(json: any, data: NodeData): void {
		let anydata: any = data
		for (const pname of Object.keys(json.params)) {
			const pvalue = anydata.anode[pname]
			const jv = json.params[pname]
			if (anydata.nodeDef.params[pname].handler)
				this.paramHandlers[anydata.nodeDef.params[pname].handler]
					.json2param(anydata.anode, jv)
			else if (pvalue instanceof AudioParam) {
				pvalue.value = jv;
				(<any>pvalue)['_value'] = jv
			}
			else anydata.anode[pname] = jv
		}
	}

	nodeData2json(data: any): any {
		const params: any = {}
		for (const pname of Object.keys(data.nodeDef.params)) {
			const pvalue = data.anode[pname]
			if (data.nodeDef.params[pname].handler)
				params[pname] = this.paramHandlers[data.nodeDef.params[pname].handler]
					.param2json(data.anode)
			else if (pvalue instanceof AudioParam)
				if ((<any>pvalue)['_value'] === undefined) params[pname] = pvalue.value
				else params[pname] = (<any>pvalue)['_value']
			else params[pname] = pvalue
		}
		return {
			type: data.type,
			params,
			controlParam: data.controlParam,
			controlParams: data.controlParams
		}
	}

	midi2freqRatio(midi: number): number {
		return Math.pow(SEMITONE, midi - A4)
	}

	noteOn(midi: number, gain: number, when?: number): void {
		if (!when) when = this.ac.currentTime
		this.outGainNode.gain.value = gain
		const ratio = this.midi2freqRatio(midi)
		this.setupNoteHandlers()
		for (const nh of this.noteHandlers)
			nh.noteOn(midi, gain, ratio, when)
		this.portamento.ratio = ratio
	}

	noteOff(midi: number, gain: number, when?: number): void {
		if (!when) when = this.ac.currentTime
		for (const nh of this.noteHandlers)
			nh.noteOff(midi, gain, when)
	}

	addNoteHandler(nh: NoteHandler): void {
		this.noteHandlers.push(nh)
	}

	removeNoteHandler(nh: NoteHandler): void {
		removeArrayElement(this.noteHandlers, nh)
	}

	setupNoteHandlers() {
		let maxRelease = 0
		for (const nh of this.noteHandlers) {
			if (nh.kbTrigger && nh.releaseTime > maxRelease)
				maxRelease = nh.releaseTime
		}
		for (const nh of this.noteHandlers) {
			if (!nh.kbTrigger)
				nh.releaseTime = maxRelease
		}
	}

	initNodeParams(anode: AudioNode, def: NodeDef, type: string): void {
		let anynode: any = anode
		for (const param of Object.keys(def.params || {}))
			if (anynode[param] === undefined)
				console.warn(`Parameter '${param}' not found for node '${type}'`)
			else if (anynode[param] instanceof AudioParam)
				anynode[param].value = def.params[param].initial
			else if (def.params[param].handler) {
				def.params[param].phandler = this.paramHandlers[def.params[param].handler || '']
				def.params[param].phandler.initialize(anynode, def)
			}
			else
				anynode[param] = def.params[param].initial
	}

	registerCustomNode(constructorName: string, nodeClass: any): void {
		this.customNodes[constructorName] = () => new nodeClass(this.ac)
	}

	registerParamHandler(hname: string, handler: ParamHandler): void {
		this.paramHandlers[hname] = handler
	}

}



// -------------------- Parameter handlers --------------------

interface BufferAudioNode extends AudioNode {
	_encoded: any
	_buffer: AudioBuffer
	_buffers: AudioBuffer[]
	_encodedBuffers: any[]
	_names: string[]
}

class BufferDataHandler implements ParamHandler {
	uiRender = 'renderBufferData'
	initialize(anode: AudioNode, def: NodeDef): void {}

	param2json(anode: BufferAudioNode): any {
		return file.arrayBufferToBase64(anode._encoded)
	}

	json2param(anode: BufferAudioNode, json: any) {
		const encoded = file.base64ToArrayBuffer(json)
		anode._encoded = encoded
		anode.context.decodeAudioData(encoded, buffer => anode._buffer = buffer)
	}
}

class SoundBankHandler implements ParamHandler {
	uiRender = 'renderSoundBank'
	initialize(anode: BufferAudioNode, def: NodeDef): void {
		anode._buffers = []
		anode._encodedBuffers = []
		anode._names = []
	}

	param2json(anode: BufferAudioNode): any {
		const files = []
		const encs = anode._encodedBuffers
		const names = anode._names
		for (let i = 0; i < names.length; i++)
			files.push({
				name: names[i],
				data: file.arrayBufferToBase64(encs[i])
			})
		return files
	}

	json2param(anode: BufferAudioNode, json: any) {
		const bufs = anode._buffers
		bufs.length = 0
		const encs = anode._encodedBuffers
		encs.length = 0
		const names = anode._names
		names.length = 0
		for (let i = 0; i < json.length; i++) {
			const item = json[i]
			names.push(item.name)
			const encoded = file.base64ToArrayBuffer(item.data)
			encs.push(encoded)
			this.decodeBuffer(anode, encoded, bufs, i)
		}
	}

	decodeBuffer(anode: AudioNode, data: ArrayBuffer,
		bufs: any[], i: number) {
		anode.context.decodeAudioData(data, buffer => bufs[i] = buffer)
	}

}
