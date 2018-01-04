export let WebAudioFontPlayer: any = WebAudioFontPlayerConstructor


function WebAudioFontPlayerConstructor() {
	this.envelopes = []
	this.onCacheFinish = null
	this.onCacheProgress = null
	this.afterTime = 0.05
	this.nearZero = 0.000001

	this.queueWaveTable = function(
		audioContext: AudioContext,
		target: AudioNode,
		preset: any,
		when: number, pitch: number,
		duration: number, volume: number, slides: any[]) {
		if (volume) {
			volume = 1.0 * volume
		} else {
			volume = 1.0
		}
		let zone = this.findZone(audioContext, preset, pitch)
		if (!(zone.buffer))
			throw new Error('Preset is not ready: empty buffer')
		let baseDetune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune
		let playbackRate = 1.0 * Math.pow(2, (100.0 * pitch - baseDetune) / 1200.0)
		let sampleRatio = zone.sampleRate / audioContext.sampleRate
		let startWhen = when
		if (startWhen < audioContext.currentTime) {
			startWhen = audioContext.currentTime
		}
		let waveDuration = duration + this.afterTime
		let loop = true
		if (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) {
			loop = false
		}
		if (!loop) {
			if (waveDuration > zone.buffer.duration / playbackRate) {
				waveDuration = zone.buffer.duration / playbackRate
			}
		}
		let envelope = this.findEnvelope(audioContext, target, startWhen, waveDuration)
		this.setupEnvelope(audioContext, envelope, zone, volume, startWhen, waveDuration, duration)
		envelope.audioBufferSourceNode = audioContext.createBufferSource()
		envelope.audioBufferSourceNode.playbackRate.value = playbackRate
		if (slides) {
			if (slides.length > 0) {
				envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, when)
				for (let i = 0; i < slides.length; i++) {
					let newPlaybackRate = 1.0 * Math.pow(2, (100.0 * slides[i].pitch - baseDetune) / 1200.0)
					let newWhen = when + slides[i].when
					envelope.audioBufferSourceNode.playbackRate.linearRampToValueAtTime(newPlaybackRate, newWhen)
				}
			}
		}
		envelope.audioBufferSourceNode.buffer = zone.buffer
		if (loop) {
			envelope.audioBufferSourceNode.loop = true
			envelope.audioBufferSourceNode.loopStart = zone.loopStart / zone.sampleRate + zone.delay
			envelope.audioBufferSourceNode.loopEnd = zone.loopEnd / zone.sampleRate + zone.delay
		} else {
			envelope.audioBufferSourceNode.loop = false
		}
		envelope.audioBufferSourceNode.connect(envelope)
		envelope.audioBufferSourceNode.start(startWhen, zone.delay)
		envelope.audioBufferSourceNode.stop(startWhen + waveDuration)
		envelope.when = startWhen
		envelope.duration = waveDuration
		envelope.pitch = pitch
		envelope.preset = preset
		return envelope
	}

	this.noZeroVolume = function (n: number) {
		if (n > this.nearZero) {
			return n
		} else {
			return this.nearZero
		}
	}

	this.setupEnvelope = function(
		audioContext: AudioContext,
		envelope: any, zone: any,
		volume: number, when: number,
		sampleDuration: number, noteDuration: number) {
		envelope.gain.setValueAtTime(this.noZeroVolume(0), audioContext.currentTime)
		let lastTime = 0
		let lastVolume = 0
		let duration = noteDuration
		let ahdsr = zone.ahdsr
		if (sampleDuration < duration + this.afterTime) {
			duration = sampleDuration - this.afterTime
		}
		if (ahdsr) {
			if (!(ahdsr.length > 0)) {
				ahdsr = [{
						duration : 0,
						volume : 1
					}, {
						duration : 0.5,
						volume : 1
					}, {
						duration : 1.5,
						volume : 0.5
					}, {
						duration : 3,
						volume : 0
					}
				]
			}
		} else {
			ahdsr = [{
					duration : 0,
					volume : 1
				}, {
					duration : duration,
					volume : 1
				}
			]
		}
		envelope.gain.cancelScheduledValues(when)
		envelope.gain.setValueAtTime(this.noZeroVolume(ahdsr[0].volume * volume), when)
		for (let i = 0; i < ahdsr.length; i++) {
			if (ahdsr[i].duration > 0) {
				if (ahdsr[i].duration + lastTime > duration) {
					let r = 1 - (ahdsr[i].duration + lastTime - duration) / ahdsr[i].duration
					let n = lastVolume - r * (lastVolume - ahdsr[i].volume)
					envelope.gain.linearRampToValueAtTime(this.noZeroVolume(volume * n), when + duration)
					break
				}
				lastTime = lastTime + ahdsr[i].duration
				lastVolume = ahdsr[i].volume
				envelope.gain.linearRampToValueAtTime(this.noZeroVolume(volume * lastVolume), when + lastTime)
			}
		}
		envelope.gain.linearRampToValueAtTime(this.noZeroVolume(0), when + duration + this.afterTime)
	}

	this.numValue = function (aValue: any, defValue: any) {
		if (typeof aValue === 'number') {
			return aValue
		} else {
			return defValue
		}
	}

	this.findEnvelope = function(
		audioContext: AudioContext, target: AudioNode,
		when: number, duration: number) {
		let envelope: any = null
		for (let i = 0; i < this.envelopes.length; i++) {
			let e = this.envelopes[i]
			if (e.target == target && audioContext.currentTime > e.when + e.duration + 0.1) {
				try {
					e.audioBufferSourceNode.disconnect()
					e.audioBufferSourceNode.stop(0)
					e.audioBufferSourceNode = null
				} catch (x) {
					// audioBufferSourceNode is dead already
				}
				envelope = e
				break
			}
		}
		if (!(envelope)) {
			envelope = audioContext.createGain()
			envelope.target = target
			envelope.connect(target)
			envelope.cancel = function () {
				if (envelope.when + envelope.duration > audioContext.currentTime) {
					envelope.gain.cancelScheduledValues(0)
					envelope.gain.setTargetAtTime(0.00001, audioContext.currentTime, 0.1)
					envelope.when = audioContext.currentTime + 0.00001
					envelope.duration = 0
				}
			}
			this.envelopes.push(envelope)
		}
		return envelope
	}

	this.adjustPreset = function(
		audioContext: AudioContext, preset: any, cb?: () => void) {
		preset.bufferct = 0
		for (let i = 0; i < preset.zones.length; i++) {
			this.adjustZone(audioContext, preset.zones[i], preset, cb)
		}
	}

	this.adjustZone = function(
		audioContext: AudioContext, zone: any, preset: any, cb?: () => void) {
		if (zone.buffer) {
			//
		} else {
			zone.delay = 0
			if (zone.sample) {
				let decoded = atob(zone.sample)
				zone.buffer = audioContext.createBuffer(1, decoded.length / 2, zone.sampleRate)
				let float32Array = zone.buffer.getChannelData(0)
				let b1,
				b2,
				n
				for (let i = 0; i < decoded.length / 2; i++) {
					b1 = decoded.charCodeAt(i * 2)
					b2 = decoded.charCodeAt(i * 2 + 1)
					if (b1 < 0) {
						b1 = 256 + b1
					}
					if (b2 < 0) {
						b2 = 256 + b2
					}
					n = b2 * 256 + b1
					if (n >= 65536 / 2) {
						n = n - 65536
					}
					float32Array[i] = n / 65536.0
				}
			} else {
				if (zone.file) {
					let datalen = zone.file.length
					let arraybuffer = new ArrayBuffer(datalen)
					let view = new Uint8Array(arraybuffer)
					let decoded = atob(zone.file)
					let b
					for (let i = 0; i < decoded.length; i++) {
						b = decoded.charCodeAt(i)
						view[i] = b
					}
					audioContext.decodeAudioData(arraybuffer, function (audioBuffer) {
						zone.buffer = audioBuffer
						preset.bufferct++
						if (preset.bufferct >= preset.zones.length && cb) cb()
					})
				}
			}
			zone.loopStart = this.numValue(zone.loopStart, 0)
			zone.loopEnd = this.numValue(zone.loopEnd, 0)
			zone.coarseTune = this.numValue(zone.coarseTune, 0)
			zone.fineTune = this.numValue(zone.fineTune, 0)
			zone.originalPitch = this.numValue(zone.originalPitch, 6000)
			zone.sampleRate = this.numValue(zone.sampleRate, 44100)
			zone.sustain = this.numValue(zone.originalPitch, 0)
		}
	}

	this.findZone = function(
		audioContext: AudioContext, preset: any, pitch: number) {
		let zone = null
		for (let i = preset.zones.length - 1; i >= 0; i--) {
			zone = preset.zones[i]
			if (zone.keyRangeLow <= pitch && zone.keyRangeHigh + 1 >= pitch) {
				break
			}
		}
		try {
			this.adjustZone(audioContext, zone)
		} catch (ex) {
			console.log('adjustZone', ex)
		}
		return zone
	}

	this.cancelQueue = function(audioContext: AudioContext) {
		for (let i = 0; i < this.envelopes.length; i++) {
			let e = this.envelopes[i]
			e.gain.cancelScheduledValues(0)
			e.gain.setValueAtTime(this.nearZero, audioContext.currentTime)
			e.when = -1
			try {
				e.audioBufferSourceNode.disconnect()
			} catch (ex) {
				console.log(ex)
			}
		}
	}

	return this
}
