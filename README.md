#Graph
A graphical editor, to be used for creating audio routing graphs,
to be used with the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

##ToDo
High priority items are in **bold**
- Bugs
	- **Fix logscale to accept parameter values between 0 and 1, both included**
	- Review TODO items inside code
	- Fix slider numeric value rendering: rounding fails and displays too many digits
	- Refine rules to determine whether nodes can connect
	- Arrows are drawn in wrong position when window is vertically scrolled (low)

- Functionality
	- Control nodes
		- **ADSR**
	- Add all possible AudioNodes available into the palette
		- Support sampled audio
		- StereoPanner
	- Custom nodes
		- Restartable Oscillator with gain
		- Restartable sample buffer with gain
		- ADSR
		- Full synth as a reusable module (long term)
	- Improve slider logscale:
		- Support parameter values < 1 (this is a bug)
		- Split slider logscale in two with middle value in the middle of the slider,
			then fine-tune all node definitions (e.g. gain)
	- Node removal (e.g. via a delete button in parameter box)
	- Dislay osc/fft using AnalyserNode
	- Load/save instruments
	- When adding a node from the palette, place it on an empty spot and select it
	- Limitation: a control node can only control a single node
		- Prevent from connecting a control node to more than one destination
		- Or else, modify the UI to support multiple destination nodes
	- Portamento
	- Polyphonic synth via a graph clone per voice
	- Long term:
		- Tracker
		- Custom nodes with WebWorker
		- Composite nodes, e.g. LFO+Gain
		- Record & save audio
		- Server-side part, supporting:
			- Loading & saving of resources: synth modules, songs, samples, etc.
			- User area storing user's synths, current work, etc.

- UI
	- Help button explaining how to connect etc.
	- Remove hardcoded dimensions from canvas
	- Right-click & drag to connect nodes
	- Cool design
	- Branding
	- Naming
	- Logo
	- Update parameter box header with currently selected node

- Code
	- Separate graph.ts into an independent npm module
	- Provide some in-code documentation describing each module & class

- Support
	- Support FireFox (does not have AudioContext.suspend/resume)
	- Test in Safari

- Share
	- Document
	- Create proper website in github pages
	- Present in meetup
	- Invite contributors

##References
- Chris Lowis (@chrislowis)
	- His [blog](http://blog.chrislowis.co.uk/) and web audio weekly newsletter.
	- His talk about [synth history and web audio](http://blog.chrislowis.co.uk/2015/06/26/a-brief-history-of-synthesis.html)
	- His github [repo](https://github.com/chrislo)
	- [Synthesising Drum Sounds with the Web Audio API](https://dev.opera.com/articles/drum-sounds-webaudio/)
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
- Soledad Penades
	- [Hands On Web Audio](http://soledadpenades.com/files/t/2015_howa/#0) presentation
