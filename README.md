#Graph
A graphical editor, to be used for creating audio routing graphs,
to be used with the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

##ToDo
- Functionality
	- Keyboard trigger
	- Control nodes
		- ADSR (requires keyboard trigger feature)
	- Add all possible AudioNodes available into the palette
		- Support sampled audio
	- Improve slider logscale:
		- Support parameter values < 1
		- Split slider logscale in two with middle value in the middle of the slider,
			then fine-tune all module definitions (e.g. gain)
	- Node deletion (e.g. via a delete button in parameter box)
	- Consider supporting fan-out by connecting and disconnecting to/from multiple modules
	- Dislay osc/fft using AnalyserNode
	- Load/save instruments
	- When adding a node from the palette, place it on an empty spot and select it
	- Long term:
		- Tracker
		- Custom modules with WebWorker
		- Composite modules, e.g. LFO+Gain
		- Record & save audio

- UI
	- Update parameter box header with currently selected node
	- Help button explaining how to connect etc.
	- Remove hardcoded dimensions from canvas
	- Right-click & drag to connect nodes
	- Cool design
	- Branding
	- Naming
	- Logo

- Code
	- Refactor main.ts
	- Replace SynthNode class extension with composition (how?)

- Support
	- Support FireFox (does not have AudioContext.suspend/resume)
	- Test in Safari

- Share
	- Document
	- Create proper website in github pages
	- Present in meetup
	- Invite contributors
	- Contact web audio developers such as @chrislowis & @mohayonao

##References
- Chris Lowis (@chrislowis)
	- His [blog](http://blog.chrislowis.co.uk/) and web audio weekly newsletter.
	- His talk about [synth history and web audio](http://blog.chrislowis.co.uk/2015/06/26/a-brief-history-of-synthesis.html)
	- His github [repo](https://github.com/chrislo)
-  Chris Wilson (@cwilso) from Google
	- His talk about [web audio](https://www.youtube.com/watch?v=wZrNI-86zYI&list=FLztHRYsgsJ4s2_qfg91iW1Q&index=1)
	- His github [repo](https://github.com/cwilso)
	- [Midi synth](https://webaudiodemos.appspot.com/midi-synth/index.html)
	- Web audio [playground](http://webaudioplayground.appspot.com/)
- Stuart memo (@stuartmemo)
	- His web audio [talk](https://www.youtube.com/watch?v=PN8Eg1K9xjE)
	- His fancy [website](http://stuartmemo.com/) with lots of small webaudio tools
- Steve Kinney
	- His [talk](https://www.youtube.com/watch?v=56spBAgOYfg) about web audio
	- Great idea on emulating restartable oscillator by setting gain to 0 to stop and 1 to
		play again
