/// <reference types="jquery" />
declare module "utils/modern" {
    /**
     * Modernize browser interfaces so that TypeScript does not complain
     * when using new features.
     *
     * Also provides some basic utility funcitons
     */
    export interface ModernWindow extends Window {
        AudioContext: AudioContext;
        webkitAudioContext: AudioContext;
    }
    export interface ModernAudioNode extends AudioNode {
        disconnect(output?: number | AudioNode | AudioParam): void;
    }
    export function removeArrayElement(a: any[], e: any): boolean;
    export function linear2log(value: number, min: number, max: number): number;
    export function log2linear(value: number, min: number, max: number): number;
    export function focusable(elem: HTMLElement | null): HTMLElement;
}
declare module "synth/customNodes" {
    import { ModernAudioNode } from "utils/modern";
    /**
     * Base class to derive all custom nodes from it
     */
    export class CustomNodeBase implements ModernAudioNode {
        custom: boolean;
        channelCount: number;
        channelCountMode: ChannelCountMode;
        channelInterpretation: ChannelInterpretation;
        context: AudioContext;
        numberOfInputs: number;
        numberOfOutputs: number;
        connect(destination: AudioNode | AudioParam, output?: number, input?: number): AudioNode;
        disconnect(destination: AudioNode | AudioParam, output?: number, input?: number): void;
        addEventListener(): void;
        dispatchEvent(evt: Event): boolean;
        removeEventListener(): void;
    }
    /**
     * Envelope generator that controls the evolution over time of a destination
     * node's parameter. All parameter control is performed in the corresponding
     * ADSR note handler.
     */
    export class ADSR extends CustomNodeBase {
        attack: number;
        decay: number;
        sustain: number;
        release: number;
        depth: number;
    }
    /**
     * Base ScriptProcessor, to derive all custom audio processing nodes from it.
     */
    export class ScriptProcessor extends CustomNodeBase {
        gain: number;
        anode: ScriptProcessorNode;
        playing: boolean;
        constructor(ac: AudioContext);
        connect(node: AudioNode): AudioNode;
        disconnect(): void;
        start(): void;
        stop(): void;
        processAudio(evt: AudioProcessingEvent): void;
    }
    /**
     * Simple noise generator
     */
    export class NoiseGenerator extends ScriptProcessor {
        processAudio(evt: AudioProcessingEvent): void;
    }
    /**
     * Noise generator to be used as control node.
     * It uses sample & hold in order to implement the 'frequency' parameter.
     */
    export class NoiseCtrlGenerator extends ScriptProcessor {
        ac: AudioContext;
        frequency: number;
        depth: number;
        sct: number;
        v: number;
        constructor(ac: AudioContext);
        connect(param: any): AudioNode;
        processAudio(evt: AudioProcessingEvent): void;
    }
    /**
     * Simple Pitch Shifter implemented in a quick & dirty way
     */
    export class Detuner extends ScriptProcessor {
        octave: number;
        numberOfInputs: number;
        processAudio(evt: AudioProcessingEvent): void;
    }
    /**
     * Captures audio from the PC audio input.
     * Requires user's authorization to grab audio input.
     */
    export class LineInNode extends CustomNodeBase {
        srcNode: ModernAudioNode;
        dstNode: ModernAudioNode;
        stream: any;
        connect(anode: any): any;
        disconnect(): void;
    }
}
declare module "synth/notes" {
    import { NodeData } from "synth/synth";
    import { ADSR } from "synth/customNodes";
    import { ModernAudioNode } from "utils/modern";
    /**
     * A note handler handles MIDI keyboard events on behalf of a synth node,
     * updating the node status accordingly.
     */
    export interface NoteHandler {
        kbTrigger: boolean;
        releaseTime: number;
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
    }
    /**
     * Handles common AudioNode cloning, used by oscillator and buffered data nodes.
     */
    export class BaseNoteHandler implements NoteHandler {
        ndata: NodeData;
        outTracker: OutputTracker;
        kbTrigger: boolean;
        releaseTime: number;
        constructor(ndata: NodeData);
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
        clone(): AudioNode | null;
        disconnect(anode: ModernAudioNode): void;
        rampParam(param: MAudioParam, ratio: number, when: number): void;
    }
    /**
     * Handles note events for an OscillatorNode
     */
    export class OscNoteHandler extends BaseNoteHandler {
        oscClone: OscillatorNode;
        lastNote: number;
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
    }
    /**
     * Handles note events for an LFO node. This is identical to a regular
     * oscillator node, but the note does not affect the oscillator frequency
     */
    export class LFONoteHandler extends OscNoteHandler {
        rampParam(param: AudioParam, ratio: number, when: number): void;
    }
    /**
     * Handles note events for an AudioBufferSourceNode
     */
    export class BufferNoteHandler extends BaseNoteHandler {
        absn: AudioBufferSourceNode;
        lastNote: number;
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
    }
    /**
     * Performs computations about ramps so they can be easily rescheduled
     */
    export class Ramp {
        v1: number;
        v2: number;
        t1: number;
        t2: number;
        constructor(v1: number, v2: number, t1: number, t2: number);
        inside(t: number): boolean;
        cut(t: number): Ramp;
        run(p: AudioParam, follow?: boolean): void;
    }
    export interface MAudioParam extends AudioParam {
        _attack: Ramp;
        _decay: Ramp;
        _release: Ramp;
        _value: number;
    }
    /**
     * Handles note events for a custom ADSR node
     */
    export class ADSRNoteHandler extends BaseNoteHandler {
        lastNote: number;
        kbTrigger: boolean;
        constructor(ndata: NodeData);
        getADSR(): ADSR;
        releaseTime: number;
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
        rescheduleRamp(param: MAudioParam, ramp: Ramp, now: number): boolean;
        getRampValueAtTime(param: MAudioParam, t: number): number | null;
        loopParams(cb: (out: MAudioParam) => void): void;
        getParamValue(p: MAudioParam): number;
    }
    /**
     * Handles note events for any node that allows calling start() after stop(),
     * such as custom nodes.
     */
    export class RestartableNoteHandler extends BaseNoteHandler {
        lastNote: number;
        playing: boolean;
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
    }
    /**
     * Handles note events for the SoundBank source node
     */
    export class SoundBankNoteHandler extends BaseNoteHandler {
        noteOn(midi: number, gain: number, ratio: number, when: number): void;
        noteOff(midi: number, gain: number, when: number): void;
    }
    /**
     * Exports available note handlers so they are used by their respective
     * nodes from the palette.
     */
    export const NoteHandlers: {
        'osc': typeof OscNoteHandler;
        'buffer': typeof BufferNoteHandler;
        'ADSR': typeof ADSRNoteHandler;
        'LFO': typeof LFONoteHandler;
        'restartable': typeof RestartableNoteHandler;
        'soundBank': typeof SoundBankNoteHandler;
    };
    /**
     * Tracks a node output connections and disconnections, to be used
     * when cloning, removing or controlling nodes.
     */
    export class OutputTracker {
        outputs: (AudioNode | AudioParam)[];
        constructor(anode: AudioNode);
        connect(np: AudioParam): void;
        disconnect(np: AudioParam): void;
        onBefore(obj: any, fname: string, funcToCall: Function, cb?: (oldf: Function, obj: any, args: any) => void): void;
    }
}
declare module "synth/palette" {
    /** Configuration data for an AudioNode parameter */
    export interface NodeParamDef {
        initial: any;
        min?: number;
        max?: number;
        linear?: boolean;
        choices?: string[];
        handler?: string;
        phandler?: any;
    }
    /** Configuration data for an AudioNode */
    export interface NodeDef {
        constructor: string | null;
        custom?: boolean;
        noteHandler?: string;
        control?: boolean;
        params: {
            [key: string]: NodeParamDef;
        };
    }
    /** A set of AudioNode configuration elements */
    export interface NodePalette {
        [key: string]: NodeDef;
    }
    /**
     * The set of AudioNodes available to the application, along with
     * their configuration.
     */
    export let palette: NodePalette;
}
declare module "utils/file" {
    export function arrayBufferToBase64(buffer: number[]): string;
    export function base64ToArrayBuffer(base64: string): ArrayBuffer;
    export function browserSupportsDownload(): boolean;
    export function download(fileName: string, fileData: string): void;
    export type UploadCallback = (buf: any, file: any) => void;
    export function uploadText(event: JQuery.Event, cb: UploadCallback): void;
    export function uploadArrayBuffer(event: JQuery.Event, cb: UploadCallback): void;
}
declare module "synth/synth" {
    import { NoteHandler } from "synth/notes";
    import { NodeDef, NodePalette } from "synth/palette";
    import { ModernAudioNode } from "utils/modern";
    /**
     * Holds all data associated with an AudioNode
     */
    export class NodeData {
        type: string;
        anode: ModernAudioNode;
        nodeDef: NodeDef;
        controlParam: string;
        controlParams: string[] | null;
        controlTarget: ModernAudioNode;
        noteHandler: NoteHandler;
        isOut: boolean;
        synth: Synth;
        getInputs(): NodeData[];
    }
    /**
     * Global paramters that apply to the whole monophonic synthesizer.
     */
    export class Portamento {
        time: number;
        ratio: number;
    }
    export interface ParamHandler {
        uiRender: string;
        initialize(anode: AudioNode, def: NodeDef): void;
        param2json(anode: AudioNode): any;
        json2param(anode: AudioNode, json: any): any;
    }
    /**
     * Performs global operations on all AudioNodes:
     * - Manages AudioNode creation, initialization and connection
     * - Distributes MIDI keyboard events to NoteHandlers
     */
    export class Synth {
        ac: AudioContext;
        customNodes: {
            [key: string]: Function;
        };
        paramHandlers: {
            [key: string]: ParamHandler;
        };
        palette: NodePalette;
        noteHandlers: NoteHandler[];
        portamento: Portamento;
        constructor(ac: AudioContext);
        createAudioNode(type: string): AudioNode | null;
        initNodeData(ndata: NodeData, type: string): void;
        initOutputNodeData(ndata: NodeData, dst: AudioNode): void;
        removeNodeData(data: NodeData): void;
        connectNodes(srcData: NodeData, dstData: NodeData): void;
        disconnectNodes(srcData: NodeData, dstData: NodeData): void;
        json2NodeData(json: any, data: NodeData): void;
        nodeData2json(data: any): any;
        midi2freqRatio(midi: number): number;
        noteOn(midi: number, gain: number, when?: number): void;
        noteOff(midi: number, gain: number, when?: number): void;
        addNoteHandler(nh: NoteHandler): void;
        removeNoteHandler(nh: NoteHandler): void;
        setupNoteHandlers(): void;
        initNodeParams(anode: AudioNode, def: NodeDef, type: string): void;
        registerCustomNode(constructorName: string, nodeClass: any): void;
        registerParamHandler(hname: string, handler: ParamHandler): void;
    }
}
declare module "synth/instrument" {
    import { Synth, NodeData, Portamento } from "synth/synth";
    /**
     * A polyphonic synth controlling an array of voices
     */
    export class Instrument {
        voices: Voice[];
        pressed: number[];
        released: number[];
        portamento: Portamento;
        constructor(ac: AudioContext, json: any, numVoices: number, dest?: AudioNode);
        noteOn(midi: number, velocity?: number, when?: number): void;
        noteOff(midi: number, velocity?: number, when?: number): void;
        allNotesOff(): void;
        findVoice(): number;
        close(): void;
    }
    /**
     * An independent monophonic synth
     */
    export class Voice {
        synth: Synth;
        lastNote: number;
        loader: SynthLoader;
        constructor(ac: AudioContext, json: any, dest?: AudioNode);
        noteOn(midi: number, velocity?: number, when?: number): void;
        noteOff(midi: number, velocity?: number, when?: number): void;
        close(): void;
    }
    export class VoiceNodeData extends NodeData {
        id: number;
        inputs: NodeData[];
        constructor(id: number);
        getInputs(): NodeData[];
    }
    export class SynthLoader {
        nodes: VoiceNodeData[];
        synth: Synth;
        load(ac: AudioContext, json: any, dest: AudioNode): Synth;
        nodeById(id: number): VoiceNodeData | null;
        close(): void;
    }
}
declare module "synth/timer" {
    export interface TimerCallback {
        (time: number): void;
    }
    export class Timer {
        running: boolean;
        ac: AudioContext;
        cb: TimerCallback;
        _bpm: number;
        ahead: number;
        nextNoteTime: number;
        noteDuration: number;
        constructor(ac: AudioContext, bpm?: number, ahead?: number);
        bpm: number;
        start(cb?: TimerCallback): void;
        stop(): void;
        tick(): void;
    }
}
declare module "synthlib" {
}
