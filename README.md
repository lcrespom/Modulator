#Modulator
A graphical modular synthesizer, using the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

Requires a modern browser such as Chrome, FireFox or Safari.

##Usage
- Click any synth node from the palette at the right to add it to the canvas
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

You can directly try it out [here](//lcrespom.github.io/synth).

##Contributing
Contributions are welcome. Preferred language is TypeScript, but it is not mandatory.

##ToDo
- Bugs
	- ADSR needs more testing & refining
		- Release works only sometimes
	- Popping sound at note on (probably needs custom oscillator with gain)
	- Refine rules to determine whether nodes can connect
	- Arrows are drawn in wrong position when window is vertically scrolled (low)
	- Review TODO items inside code

- Functionality
	- Add all possible AudioNodes available into the palette
		- Support sampled audio (default sample URL to amen break from Wikipedia)
		- All pending nodes
			- AudioBufferSourceNode
			- ChannelMergerNode / ChannelSplitterNode (maybe not)
			- ConvolverNode
			- WaveShaperNode
	- Custom nodes
		- Oscillator with gain
		- LFO with gain
		- Sample buffer with gain
		- Full synth as a reusable module (long term)
		- Ring modulation using a gain node where the gain is controlled by an oscillator
	- Improve ADSR
		- Linear/exponential switch
		- Depth parameter to control how much the envelope controls the target parameter
	- Dislay osc/fft using AnalyserNode
	- Display piano keyboard / display PC keys on piano keys / gather mouse input
	- Provide 10 preset instruments
	- Limitation: a control node can only control a single node
		- Prevent from connecting a control node to more than one destination
		- Or else, modify the UI to support multiple destination nodes
	- Portamento
	- Polyphonic synth via a graph clone per voice
	- More testing on instrument load/save

- UI
	- Proper Bootstrap popups instead of crappy browser popups (alert/cofirm/prompt)
	- Parameters panel
		- Center parameters horizontally
		- Adapt space between parameters according to number of parameters.
			Then Compressor will be able to use its 6th parameter.
		- Use cool knobs for parameters instead of default browser sliders
	- Help
		- General help button explaining how to connect etc.
		- Description of each node
		- Description of each node parameters
	- Use a different CSS class for source, effect and destination nodes
	- Consider a better way to add nodes from the palette into the canvas
	- Consider a more user-friendly way to connect and disconnect nodes
	- Improve layout
		- Remove hardcoded dimensions from canvas
		- More flexible layout
	- Right-click & drag to connect nodes
	- Cool design
	- Branding
	- Naming
	- Logo: display logo/name in top-center header

- Long term:
	- Tracker
	- Custom nodes with WebWorker
	- Record & save audio
	- Server-side part, supporting:
		- Loading & saving of resources: synth modules, songs, samples, etc.
		- User area storing user's synths, current work, etc.

- Code
	- Separate graph.ts into an independent npm module
	- Better, cleaner implementation of HTML/CSS in index.html and main.css
	- API to load & play presets without displaying the node graph

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
