#Graph
A graphical modular synthesizer, using the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

##Usage:
- Click any synth node from the palette at the right to add it to the canvas.
- Use regular drag & drop to move audio nodes around in the canvas
- To connect two nodes:
	- Place the mouse pointer over the source node
	- Press the shift key
	- Move the mouse pointer to the destination node
		(but don't press the mouse button or you will start dragging the node)
	- Release the shift key to make the connection
- To disconnect two nodes, simply make the same connection again,
	and this time it will be removed
- Use the keyboard to play notes: note C2 is in 'z', note C3 is in 'a'.

You can directly try it out [here](lcrespom.github.io/synth).

##Contributing
Contribution is welcome. Preferred language is TypeScript, but it is not mandatory.

##ToDo
- Bugs
	- **Fix logscale to accept parameter values between 0 and 1, both included**
	- ADSR needs more testing & refining
	- Popping sound at note on (probably needs custom oscillator with gain)
	- Refine rules to determine whether nodes can connect
	- Arrows are drawn in wrong position when window is vertically scrolled (low)
	- Review TODO items inside code

- Functionality
	- Add all possible AudioNodes available into the palette
		- Support sampled audio
		- StereoPanner
	- Custom nodes
		- Oscillator with gain
		- Sample buffer with gain
		- Full synth as a reusable module (long term)
	- Improve slider logscale:
		- Support parameter values < 1 (this is a bug)
		- Split slider logscale in two with middle value in the middle of the slider,
			then fine-tune all node definitions (e.g. gain)
	- Improve ADSR
		- Linear/exponential switch
		- Depth parameter to control how much the envelope controls the target parameter
	- Dislay osc/fft using AnalyserNode
	- Load/save instruments (using JSON)
	- Preset instruments & save to preset
	- Export to dependency-free JavaScript
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
	- Use 10x10 grid for placing nodes after drop (but not during drag: it is not smooth)
	- Proper Bootstrap popup for confirmation of node deletion
	- Help
		- General help button explaining how to connect etc.
		- Description of each node
		- Description of each node parameters
	- Find a better way to add nodes from the palette into the canvas
	- Remove hardcoded dimensions from canvas
	- Right-click & drag to connect nodes
	- Cool design
	- Branding
	- Naming
	- Logo
	- Update parameter box header with currently selected node

- Code
	- Separate graph.ts into an independent npm module

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
