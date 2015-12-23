export interface ModernWindow extends Window {
	AudioContext: AudioContext;
	webkitAudioContext: AudioContext;
}

export interface ModernAudioContext extends AudioContext {
	suspend: () => void;
	resume: () => void;
}

export interface ModernAudioNode extends AudioNode {
	disconnect(output?: number | AudioNode | AudioParam): void
}
