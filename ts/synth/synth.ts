import { NoteHandler, NoteHandlers } from './notes';
import { NodeDef, NodeParamDef, NodePalette, palette } from './palette';
import { ModernAudioContext, ModernAudioNode, removeArrayElement } from '../utils/modern';
import * as custom from './customNodes';
import * as file from '../utils/file';


const SEMITONE = Math.pow(2, 1/12);
const A4 = 57;

/**
 * Holds all data associated with an AudioNode
 */
export class NodeData {
	// Used by all nodes
	type: string;
	anode: ModernAudioNode;
	nodeDef: NodeDef;
	// Used by control nodes
	controlParam: string;
	controlParams: string[];
	controlTarget: ModernAudioNode;
	// Used by source audio nodes
	noteHandler: NoteHandler;
	// Flag to avoid deleting output node
	isOut: boolean = false;
	// Reference to owner synth
	synth: Synth;
	// To be implemented by user code
	getInputs(): NodeData[] {
		throw 'Error: getInputs() function should be implemented by user';
	}
}

/**
 * Global paramters that apply to the whole monophonic synthesizer.
 */
export class Portamento {
	time = 0;
	ratio = 0;
}

//TODO *** refactor & decouple from UI
interface ParamHandler {
	initialize(anode: AudioNode, def: NodeDef): void;
	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): JQuery;
	param2json(anode: AudioNode): any;
	json2param(anode: AudioNode, json: any);
}

/**
 * Performs global operations on all AudioNodes:
 * - Manages AudioNode creation, initialization and connection
 * - Distributes MIDI keyboard events to NoteHandlers
 */
export class Synth {
	ac: ModernAudioContext;
	customNodes: { [key: string]: Function } = {};
	paramHandlers: { [key: string]: ParamHandler } = {};
	palette: NodePalette;
	noteHandlers: NoteHandler[] = [];
	portamento = new Portamento();

	constructor(ac: ModernAudioContext) {
		this.ac = ac;
		this.palette = palette;
		this.registerCustomNode('createADSR', custom.ADSR);
		this.registerCustomNode('createNoise', custom.NoiseGenerator);
		this.registerCustomNode('createNoiseCtrl', custom.NoiseCtrlGenerator);
		this.registerCustomNode('createLineIn', custom.LineInNode);
		this.registerCustomNode('createDetuner', custom.Detuner);
		this.registerParamHandler('BufferData', new BufferData());
	}

	createAudioNode(type: string): AudioNode {
		const def: NodeDef = palette[type];
		if (!def) return null;
		const factory = def.custom ? this.customNodes : this.ac;
		if (!factory[def.constructor]) return null;
		const anode = factory[def.constructor]();
		if (!anode.context) anode.context = this.ac;
		this.initNodeParams(anode, def, type);
		return anode;
	}

	initNodeData(ndata: NodeData, type: string): void {
		ndata.synth = this;
		ndata.type = type;
		ndata.anode = this.createAudioNode(type);
		if (!ndata.anode)
			return console.error(`No AudioNode found for '${type}'`);
		ndata.nodeDef = this.palette[type];
		const nh = ndata.nodeDef.noteHandler;
		if (nh) {
			ndata.noteHandler = new NoteHandlers[nh](ndata);
			this.addNoteHandler(ndata.noteHandler);
		}
	}

	initOutputNodeData(ndata: NodeData, dst: AudioNode): void {
		ndata.synth = this;
		ndata.type = 'out';
		ndata.anode = this.ac.createGain();
		ndata.anode.connect(dst);
		ndata.nodeDef = this.palette['Speaker'];
		ndata.isOut = true;
	}

	removeNodeData(data: NodeData) {
		if (data.noteHandler)
			this.removeNoteHandler(data.noteHandler);
	}

	connectNodes(srcData: NodeData, dstData: NodeData): void {
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = Object.keys(dstData.nodeDef.params)
				.filter(pname => dstData.anode[pname] instanceof AudioParam);
			srcData.controlParam = srcData.controlParams[0];
			srcData.controlTarget = dstData.anode;
			srcData.anode.connect(dstData.anode[srcData.controlParam]);
		}
		else srcData.anode.connect(dstData.anode);
	}

	disconnectNodes(srcData: NodeData, dstData: NodeData): void {
		if (srcData.nodeDef.control && !dstData.nodeDef.control) {
			srcData.controlParams = null;
			srcData.anode.disconnect(dstData.anode[srcData.controlParam]);
		}
		else
			srcData.anode.disconnect(dstData.anode);
	}

	json2NodeData(json: any, data: NodeData): void {
		for (const pname of Object.keys(json.params)) {
			const pvalue = data.anode[pname];
			const jv = json.params[pname];
			if (data.nodeDef.params[pname].handler)
				this.paramHandlers[data.nodeDef.params[pname].handler]
					.json2param(data.anode, jv);
			else if (pvalue instanceof AudioParam) {
				pvalue.value = jv;
				pvalue['_value'] = jv;
			}
			else data.anode[pname] = jv;
		}
	}

	nodeData2json(data: NodeData): any {
		const params = {};
		for (const pname of Object.keys(data.nodeDef.params)) {
			const pvalue = data.anode[pname];
			if (data.nodeDef.params[pname].handler)
				params[pname] = this.paramHandlers[data.nodeDef.params[pname].handler]
					.param2json(data.anode);
			else if (pvalue instanceof AudioParam)
				if (pvalue['_value'] === undefined) params[pname] = pvalue.value;
				else params[pname] = pvalue['_value'];
			else params[pname] = pvalue;
		}
		return {
			type: data.type,
			params,
			controlParam: data.controlParam,
			controlParams: data.controlParams
		}
	}

	midi2freqRatio(midi: number): number {
		return Math.pow(SEMITONE, midi - A4);
	}

	noteOn(midi: number, gain: number, when?: number): void {
		if (!when) when = this.ac.currentTime;
		const ratio = this.midi2freqRatio(midi);
		this.setupNoteHandlers();
		for (const nh of this.noteHandlers)
			nh.noteOn(midi, gain, ratio, when);
		this.portamento.ratio = ratio;
	}

	noteOff(midi: number, gain: number, when?: number): void {
		if (!when) when = this.ac.currentTime;
		for (const nh of this.noteHandlers)
			nh.noteOff(midi, gain, when);
	}

	addNoteHandler(nh: NoteHandler): void {
		this.noteHandlers.push(nh);
	}

	removeNoteHandler(nh: NoteHandler): void {
		removeArrayElement(this.noteHandlers, nh)
	}

	setupNoteHandlers() {
		let maxRelease = 0;
		for (const nh of this.noteHandlers) {
			if (nh.kbTrigger && nh.releaseTime > maxRelease)
				maxRelease = nh.releaseTime;
		}
		for (const nh of this.noteHandlers) {
			if (!nh.kbTrigger)
				nh.releaseTime = maxRelease;
		}
	}

	initNodeParams(anode: AudioNode, def: NodeDef, type: string): void {
		for (const param of Object.keys(def.params || {}))
			if (anode[param] === undefined)
				console.warn(`Parameter '${param}' not found for node '${type}'`)
			else if (anode[param] instanceof AudioParam)
				anode[param].value = def.params[param].initial;
			else if (def.params[param].handler) {
				def.params[param].phandler = this.paramHandlers[def.params[param].handler];
				def.params[param].phandler.initialize(anode, def);
			}
			else
				anode[param] = def.params[param].initial;
	}

	registerCustomNode(constructorName: string, nodeClass: any): void {
		this.customNodes[constructorName] = () => new nodeClass(this.ac);
	}

	registerParamHandler(hname: string, handler: ParamHandler): void {
		this.paramHandlers[hname] = handler;
	}

}



//-------------------- Parameter handlers --------------------

class BufferData implements ParamHandler {

	initialize(anode: AudioNode, def: NodeDef): void {}

	renderParam(panel: JQuery, pdef: NodeParamDef,
		anode: AudioNode, param: string, label: string): JQuery {
		const box = $('<div class="choice-box">');
		const button = $(`
			<span class="btn btn-primary upload">
				<input type="file" id="load-file">
				Load&nbsp;
				<span class="glyphicon glyphicon-open" aria-hidden="true"></span>
			</span>`);
		box.append(button);
		button.after('<br/><br/>' + label);
		panel.append(box);
		button.find('input').change(evt => file.uploadArrayBuffer(evt, soundFile => {
			anode['_encoded'] = soundFile;
			anode.context.decodeAudioData(soundFile, buffer => anode['_buffer'] = buffer);
		}));
		return box;
	}

	param2json(anode: AudioNode): any {
		return file.arrayBufferToBase64(anode['_encoded']);
	}

	json2param(anode: AudioNode, json: any) {
		const encoded = file.base64ToArrayBuffer(json);
		anode['_encoded'] = encoded;
		anode.context.decodeAudioData(encoded, buffer => anode['_buffer'] = buffer);
	}

}
