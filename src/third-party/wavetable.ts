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

	this.noZeroVolume = function(n: number) {
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

	this.numValue = function(aValue: any, defValue: any) {
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
			if (this.expireEnvelope(e, audioContext)) {
				envelope = e
				break
			}
		}
		if (!(envelope)) {
			envelope = audioContext.createGain()
			envelope.target = target
			envelope.connect(target)
			envelope.cancel = function(time?: number) {
				if (time === undefined) time = audioContext.currentTime
				if (envelope.when + envelope.duration > audioContext.currentTime) {
					envelope.gain.cancelScheduledValues(time)
					envelope.gain.setTargetAtTime(0.00001, time, 0.1)
					envelope.when = time + 0.00001
					envelope.duration = 0
				}
			}
			this.envelopes.push(envelope)
		}
		return envelope
	}

	this.expireEnvelope = function(e: any, ctx: AudioContext) {
		if (ctx.currentTime > e.when + e.duration + 0.1) {
			try {
				e.audioBufferSourceNode.disconnect()
				e.audioBufferSourceNode.stop(0)
				e.audioBufferSourceNode = null
			} catch (x) {
				// audioBufferSourceNode is dead already
			}
			return true
		}
		return false
	}

	this.expireEnvelopes = function(ctx: AudioContext) {
		this.envelopes = this.envelopes.filter(
			(e: any) => !this.expireEnvelope(e, ctx)
		)
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
				preset.bufferct++
				if (preset.bufferct >= preset.zones.length && cb) cb()
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
					audioContext.decodeAudioData(arraybuffer, function(audioBuffer) {
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

/*
Wavetable instrument list:

0: Piano - Acoustic Grand Piano
1: Piano - Bright Acoustic Piano
2: Piano - Electric Grand Piano
3: Piano - Honky-tonk Piano
4: Piano - Electric Piano 1
5: Piano - Electric Piano 2
6: Piano - Harpsichord
7: Piano - Clavinet
8: Chromatic Percussion - Celesta
9: Chromatic Percussion - Glockenspiel
10: Chromatic Percussion - Music Box
11: Chromatic Percussion - Vibraphone
12: Chromatic Percussion - Marimba
13: Chromatic Percussion - Xylophone
14: Chromatic Percussion - Tubular Bells
15: Chromatic Percussion - Dulcimer
16: Organ - Drawbar Organ
17: Organ - Percussive Organ
18: Organ - Rock Organ
19: Organ - Church Organ
20: Organ - Reed Organ
21: Organ - Accordion
22: Organ - Harmonica
23: Organ - Tango Accordion
24: Guitar - Acoustic Guitar (nylon)
25: Guitar - Acoustic Guitar (steel)
26: Guitar - Electric Guitar (jazz)
27: Guitar - Electric Guitar (clean)
28: Guitar - Electric Guitar (muted)
29: Guitar - Overdriven Guitar
30: Guitar - Distortion Guitar
31: Guitar - Guitar Harmonics
32: Bass - Acoustic Bass
33: Bass - Electric Bass (finger)
34: Bass - Electric Bass (pick)
35: Bass - Fretless Bass
36: Bass - Slap Bass 1
37: Bass - Slap Bass 2
38: Bass - Synth Bass 1
39: Bass - Synth Bass 2
40: Strings - Violin
41: Strings - Viola
42: Strings - Cello
43: Strings - Contrabass
44: Strings - Tremolo Strings
45: Strings - Pizzicato Strings
46: Strings - Orchestral Harp
47: Strings - Timpani
48: Ensemble - String Ensemble 1
49: Ensemble - String Ensemble 2
50: Ensemble - Synth Strings 1
51: Ensemble - Synth Strings 2
52: Ensemble - Choir Aahs
53: Ensemble - Voice Oohs
54: Ensemble - Synth Choir
55: Ensemble - Orchestra Hit
56: Brass - Trumpet
57: Brass - Trombone
58: Brass - Tuba
59: Brass - Muted Trumpet
60: Brass - French Horn
61: Brass - Brass Section
62: Brass - Synth Brass 1
63: Brass - Synth Brass 2
64: Reed - Soprano Sax
65: Reed - Alto Sax
66: Reed - Tenor Sax
67: Reed - Baritone Sax
68: Reed - Oboe
69: Reed - English Horn
70: Reed - Bassoon
71: Reed - Clarinet
72: Pipe - Piccolo
73: Pipe - Flute
74: Pipe - Recorder
75: Pipe - Pan Flute
76: Pipe - Blown bottle
77: Pipe - Shakuhachi
78: Pipe - Whistle
79: Pipe - Ocarina
80: Synth Lead - Lead 1 (square)
81: Synth Lead - Lead 2 (sawtooth)
82: Synth Lead - Lead 3 (calliope)
83: Synth Lead - Lead 4 (chiff)
84: Synth Lead - Lead 5 (charang)
85: Synth Lead - Lead 6 (voice)
86: Synth Lead - Lead 7 (fifths)
87: Synth Lead - Lead 8 (bass + lead)
88: Synth Pad - Pad 1 (new age)
89: Synth Pad - Pad 2 (warm)
90: Synth Pad - Pad 3 (polysynth)
91: Synth Pad - Pad 4 (choir)
92: Synth Pad - Pad 5 (bowed)
93: Synth Pad - Pad 6 (metallic)
94: Synth Pad - Pad 7 (halo)
95: Synth Pad - Pad 8 (sweep)
96: Synth Effects - FX 1 (rain)
97: Synth Effects - FX 2 (soundtrack)
98: Synth Effects - FX 3 (crystal)
99: Synth Effects - FX 4 (atmosphere)
100: Synth Effects - FX 5 (brightness)
101: Synth Effects - FX 6 (goblins)
102: Synth Effects - FX 7 (echoes)
103: Synth Effects - FX 8 (sci-fi)
104: Ethnic - Sitar
105: Ethnic - Banjo
106: Ethnic - Shamisen
107: Ethnic - Koto
108: Ethnic - Kalimba
109: Ethnic - Bagpipe
110: Ethnic - Fiddle
111: Ethnic - Shanai
112: Percussive - Tinkle Bell
113: Percussive - Agogo
114: Percussive - Steel Drums
115: Percussive - Woodblock
116: Percussive - Taiko Drum
117: Percussive - Melodic Tom
118: Percussive - Synth Drum
119: Percussive - Reverse Cymbal
120: Sound effects - Guitar Fret Noise
121: Sound effects - Breath Noise
122: Sound effects - Seashore
123: Sound effects - Bird Tweet
124: Sound effects - Telephone Ring
125: Sound effects - Helicopter
126: Sound effects - Applause
127: Sound effects - Gunshot

Drums:
Drum_Stan1_SC88P
Standard
Standard_part2
Standard
DRUM_SFX
Room_2
Standard_2_PART3
CM_64_32_MT_32
Room_3
Roomm_PART3
Room_4
Power_PART3
Room_5
Electronic_PART3
Room_6
zTR_808_PART3
Room_7
Dance_PART3
Power
Jazz_PART3
Power_1
Brush_PART3
Power_2
Orchestra_PART3
Power_3
SFX_PART3
Drum_Room
Standard_1
Roomm_PART2
Room
Electronic
Standard
TR_808
Roomm
Jazz
Power_SC_55
Jazz_1
Electronic_SC_55
Jazz_2
zTR_808
Jazz_3
Dance_SC_88
Jazz_4
Jazz
Brush
Brush_SC_55
Brush_1
Orchestra
Brush_2
SFX
Drum_Room_SC88P
Standard_2
Power_PART2
Power
Orchestra_Kit
Drum_Power
Standard_3
Electronic_PART2
Electronic
Drum_Elec_SC88P
Standard_4
zTR_808_PART2
TR_808
Drum_TR808_SC88P
Standard_5
Dance_PART2
Jazz
Drum_TR909_SC88P
Standard_6
Jazz_PART2
Brush
Drum_Jazz
Standard_7
Brush_PART2
Orchestra
Drum_Brush_SC88P
Room
Orchestra_PART2
SFX
Drum_Orch_SC88P
Room_1
SFX_PART2
*/
