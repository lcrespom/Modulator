#SynthLib
SynthLib is a standalone, UI-independent library that can load and play instruments
created with [Modulator](https://github.com/lcrespom/Modulator).
Synthlib is small: it takes less than 18 kb minified and less than 5kb gzipped.

Synthlib exposes a global object called "Modulator", containing two classes that
can be instantiated and used by the application:

- Voice: a monophonic synthesizer
- Instrument: a polyphonic synthesizer that maintains an array of voices
	and delegates on them to play individual notes.

##Voice class
TODO document
###constructor(ac: ModernAudioContext, json: any, dest?: AudioNode)
###noteOn(midi: number, velocity: number = 1, when?: number): void
###noteOff(midi: number, velocity: number = 1, when?: number): void
###close(): void

##Instrument class
TODO document
###constructor(ac: ModernAudioContext, json: any, numVoices: number, dest?: AudioNode)
###noteOn(midi: number, velocity: number = 1, when?: number): void
###noteOff(midi: number, velocity: number = 1, when?: number): void
###close(): void


##Example
```
	TODO JavaScript example here
```