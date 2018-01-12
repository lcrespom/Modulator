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
	.then(editor => checkSearch(editor))
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
	$(document).on('route:show', (e, h) => {
		if (h == '#synth') prsts.selectBestNode()
	})
	return createEditor(ac, prsts, synthUI)
}

function setupPalette() {
	$(function() {
		let nano: any = $('.nano')
		nano.nanoScroller({ preventPageScrolling: true })
	})
}

function checkSearch(editor: any) {
	if (!location.search || location.search.length <= 0
		|| ! location.search.startsWith('?')) return
	let sdata = location.search.substr(1).split('&')
	let result: any = {}
	for (let param of sdata) {
		let [k, v] = param.split('=')
		result[k] = v
	}
	applySearch(result, editor)
}

function applySearch(search: any, editor: any) {
	if (search.codeURL) fetchCode(search.codeURL, editor)
}

async function fetchCode(url: string, editor: any) {
	let r = await fetch(url)
	if (!r.ok) return
	let code = await r.text()
	location.hash = '#live-coding'
	let edtxt = editor.getModel().getValue() || ''
	if (edtxt.trim().length > 0 && !edtxt.trim().startsWith('/*'))
		edtxt = '\n/*\n' + edtxt + '\n*/\n'
	editor.getModel().setValue(code + edtxt)
}

declare var window: ModernWindow
