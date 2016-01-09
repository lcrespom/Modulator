#ToDo

##Bugs
- ADSR needs more testing & refining
	- Incorrect behavior when key is released before reaching the sustain level
- Polyphonic instrument loading fails when "holes" are present in synth
- Popping sound at note on/off (improved after adding adsr depth parameter)
- Analyzer should detect when no sound is playing and clean osc and fft graphs
- Review TODO items inside code
- In FireFox, when app window is scrolled down, node connection
	draws arrows incorrectly

##Functionality
- Polyphonic mode: in instrument.ts, implement a better algorithm for
	finding an empty voice instead of the blind round-robin.
	- Current criterion is "least recently pressed"
	- A better one should be "least recently released", and if no released key found,
		then fall back to least recently pressed.
- Update presets so keyboard params are inside the JSON (just load & save them again)
	- For demo purposes, enable arpeggio and portamento in some patches,
		or create new ones if required.
- Use a logarithmic scale for portamento and arpeggio sliders
- Custom nodes
	- Keyboard control node
		- To control other parameters based on the note being pressed
		- With depth parameter
		- Based on ScriptProcessor... no other way to generically control parameters
	- Full synth as a reusable module (long term)
	- Soundbank: multiple samples, one sample per note, ideal for rythm tracks
- Review list of pending audio nodes
	- WaveShaper
	- Etc?
- Improve ADSR
	- Linear/exponential switch
- Provide more preset instruments
- Improve presets panel
	- When clicking on preset number, let user directly navigate to preset,
		e.g. by showing a drop down list
- Limitation: a control node can only control a single parameter name
	- Prevent from connecting a control node to more than one destination
	- Or else, modify the UI to support multiple destination nodes
- Use Web Midi API to gather events from external midi Keyboard
	- Currently already supporting keyboard
		- External keyboard keys are misaligned with the on-screen piano
	- Associate external kobs with selected node parameters
		- Knob distribution seems to be very erratic
	- See http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/
		for a guide on the MIDI Web API.
	- Make source nodes use the MIDI velocity parameter, which is currently ignored.
		This will require implementing custom nodes for most source nodes,
		so they are internally connected to a gain node.

##UI
- Polish logo
- Review the following audio front-end libraries, especially for the
	node parameters area:
	- http://nexusosc.com/
	- https://github.com/g200kg/webaudio-controls
- Help
	- Provide description of each node and each of its parameters.
- Usability / UX
	- Consider a better way to add nodes from the palette into the canvas
	- Consider a more user-friendly way to connect and disconnect nodes
- Improve layout
	- More flexible layout
	- Remove hardcoded dimensions from canvas
- Option to enable/disable snap to grid - automatically align misaligned nodes
- Cool design
- Branding
- Naming
- Logo: svg

##Long term
- Tracker
	- Probably as an independent app that can load synth presets
	- Review [this article](http://www.html5rocks.com/en/tutorials/audio/scheduling/)
	- Apart from controlling Modulator instruments,
		also emit MIDI events to external devices
- Review this:
	- https://en.wikipedia.org/wiki/Open_Sound_Control
	- http://opensoundcontrol.org/ (was not responding when last checked)
- Custom nodes with WebWorker... when available
- Record & save audio
- Server-side part, supporting:
	- Loading & saving of resources: synth modules, songs, samples, etc.
	- User area storing user's synths, current work, etc.
	- Public sample library
- 100% responsive & mobile / tablet friendly
- Mobile app

##Code
- Document synthlib in synthlib.md & provide code examples.
- Provide an interface that predefines the very common noteOn / noteOff methods
- Decoupling
	- synth.ts contains BufferURL ParamHandler,
		which has UI code that should be moved elsewhere
	- The *piano* module group should not contain UI code. Therefore,
		module piano.ts should be moved out of it, and the dependency
		should be reversed so that the *piano* module group is
		fully decoupled from any UI.
	- Also, noteinputs.ts has a dependency with synthUI that should be
		removed
- Avoid hardcoded DOM id's in code, e.g. $('#my-button'), except
	for specifying containers at top level.
	Just do a global search for `$('#` and review all matches not in main.ts.
- Review jQuery event registration to check that no event gets registered
	more than once
- Move all generic code to modern.ts
	- Review for very common code to be placed in there
- Extract the following independent npm modules:
	- graph.ts
	- An npm module with all code in the synth folder
- Improve code to clean hack that checks for custom nodes when connecting.
- Consider compile target to ES6, see https://kangax.github.io/compat-table/es6/

##Share
- Document
- Create proper website in github pages
- Present in meetups
- Invite contributors
