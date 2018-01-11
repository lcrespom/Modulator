/**
 * Main entry point: setup synth editor and keyboard listener.
 */
import { SynthUI } from './synthUI/synthUI'
import { NoteInputs } from './piano/noteInputs'
import { Presets } from './synthUI/presets'
import { ModernWindow } from './utils/modern'
import { createEditor } from './live-coding/editor'
import { setupRoutes } from './utils/routes'


let graphCanvas: HTMLCanvasElement
let ac: AudioContext
let synthUI: SynthUI

setupRoutes('#synth').then(_ => {
	graphCanvas = <HTMLCanvasElement>$('#graph-canvas')[0]
	ac = createAudioContext()
	synthUI = new SynthUI(ac, graphCanvas,
		$('#node-params'), $('#audio-graph-fft'), $('#audio-graph-osc'))
	setupPanels()
})

function createAudioContext(): AudioContext {
	const CtxClass: any = window.AudioContext || window.webkitAudioContext
	return new CtxClass()
}

function setupPanels() {
	setupPalette()
	const inputs = new NoteInputs(synthUI)
	const prsts = new Presets(synthUI)
	prsts.beforeSave = (json) => $.extend(json, { keyboard: inputs.piano.toJSON() })
	prsts.afterLoad = (json) => inputs.piano.fromJSON(json.keyboard)
	$(function() {
		$('#synth').focus()
	})
	createEditor(ac, prsts, synthUI)
	$(document).on('route:show', (e, h) => {
		if (h == '#synth') prsts.selectBestNode()
	})
}

function setupPalette() {
	$(function() {
		let nano: any = $('.nano')
		nano.nanoScroller({ preventPageScrolling: true })
	})
}

declare var window: ModernWindow
