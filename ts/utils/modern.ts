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

const LOG_BASE = 2;

function logarithm(base: number, x: number): number {
	return Math.log(x) / Math.log(base);
}

export function linear2log(value: number, min: number, max: number): number {
	const logRange = logarithm(LOG_BASE, max + 1 - min);
	return logarithm(LOG_BASE, value + 1 - min) / logRange;
}

export function log2linear(value: number, min: number, max: number): number {
	const logRange = logarithm(LOG_BASE, max + 1 - min);
	return min + Math.pow(LOG_BASE, value * logRange) - 1;
}

export function focusable(elem) {
	while (elem.tabIndex < 0 && elem.nodeName.toLowerCase() != 'body')
		elem = elem.parentElement;
	return elem;
}