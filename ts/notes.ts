export interface NoteHandler {
	noteOn(midi: number, gain: number, ratio: number):void;
	noteOff(midi: number, gain: number): void;
	noteEnd(midi: number): void;
}

class OscNoteHandler implements NoteHandler {
	osc: OscillatorNode;
	outTracker: OutputTracker;

	constructor(osc: OscillatorNode) {
		this.osc = osc;
		this.outTracker = new OutputTracker(osc);
	}

	noteOn(midi: number, gain: number, ratio: number):void {
		//TODO clone, connect and start
		console.log(">>> note on:", midi);
	}

	noteOff(midi: number, gain: number): void {
		//TODO temporarily call noteEnd
		console.log("<<< note off:", midi);
	}

	noteEnd(midi: number): void {
		//TODO stop and disconnect
	}
}

export const NoteHandlers = {
	'osc': OscNoteHandler	
};



class OutputTracker {
	outputs: AudioNode[] = [];

	constructor(anode: AudioNode) {
		this.onBefore(anode, 'connect', this.connect);
		this.onBefore(anode, 'disconnect', this.disconnect);
	}

	connect(anode: AudioNode) {
		if (!(anode instanceof AudioNode)) return;
		this.outputs.push(anode);
	}

	disconnect(anode) {
		if (!(anode instanceof AudioNode)) return;
		removeArrayElement(this.outputs, anode);
	}

	onBefore(obj: any, fname: string, funcToCall: Function) {
		const oldf = obj[fname];
		const self = this;
		obj[fname] = function() {
			funcToCall.apply(self, arguments);
			oldf.apply(obj, arguments);
		}
	}
}


export function removeArrayElement(a: any[], e: any): boolean {
	const pos = a.indexOf(e);
	if (pos < 0) return false;	// not found
	a.splice(pos, 1);
	return true;
}