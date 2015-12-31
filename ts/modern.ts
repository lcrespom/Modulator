/**
 * Modernize browser interfaces so that TypeScript does not complain
 * when using new features.
 *
 * Also provides some basic utility funcitons which should be part of
 * the standard JavaScript library.
 */

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


export function removeArrayElement(a: any[], e: any): boolean {
	const pos = a.indexOf(e);
	if (pos < 0) return false;	// not found
	a.splice(pos, 1);
	return true;
}