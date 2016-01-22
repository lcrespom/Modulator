#ToDo

##Bugs
- ADSR needs more testing & refining
	- Probable memory leaks in Pew! instrument
- Popping sound at note on/off (improved after adding adsr depth parameter)
- Analyzer should detect when no sound is playing and clean osc and fft graphs
	- Only visible in synths without ADSR
- Review TODO items inside code
- In FireFox, when app window is scrolled down, node connection
	draws arrows incorrectly


##Functionality

- Update presets so keyboard params are inside the JSON (just load & save them again)
	- For demo purposes, enable arpeggio and portamento in some patches,
		or create new ones if required.

- Custom nodes
	- Keyboard control node
		- To control other parameters based on the note being pressed
		- With depth parameter
		- Similar to ADSR, but without ramps
	- Full synth as a reusable node (long term)
		- Node parameters:
			- Param 1: select synth from patch list
			- Param 2: output volume
		- Add new "Effect In" node in the palette, to allow pure effect patches
	- Soundbank: multiple samples, one sample per note, ideal for rythm tracks
		- Consider drag&drop of samples folder
		- Modify current buffer node to use local files from samples folder
	- A proper implementation of a pitch sihfter
		- See https://github.com/echo66/time-stretch-wac-article/blob/master/ts-ps-wac.pdf
- Review list of pending audio nodes
	- WaveShaper
	- Etc?
- Improve ADSR
	- Linear/exponential switch
	- Harder now with ramp rescheduling: requires knowing the exact formula
		used by Web Audio for exponential ramps

- Make analyzer work also in polyphonic mode

- Navigate selection of audio notes in the graph using the keyboard,
	e.g. page up / page down, or alt+left / alt+right

- Preset selector: update preset combo when navigating with keys or < and > buttons
- Load all & save all: support loading and saving the whole preset collection
- Provide more preset instruments
	- Accept contributions
	- Organize presets in groups according to their type

- Node comments
	- Double click on node to show popup to let the user edit node comments
	- Display node comments as simple tooltip (plain HTML or bootstrap)
- Use tooltips to describe nodes in palette
- Synth patch comments
	- Double click on a free spot in canvas to show popup to let the user edit
		synth comments
	- Display synth comments on bottom left corner of canvas

- Drag & drop files anywhere into synth to:
	- If file: detect format
		- If synth, load it as a preset
		- If list of patches, replace full list of presets
	- If folder:
		- Collect list of samples so user can later select one
			for a Buffer node (or future soundbank node).
- Modify Buffer node:
	- To use sample via drag & drop instead of URL
	- To save (and load) the audio file data as a base64 string

- Limitation: a control node can only control a single parameter name
	- Prevent from connecting a control node to more than one destination
	- Or else, modify the UI to support multiple destination nodes

- Use Web Midi API to gather events from external midi Keyboard
	- Currently already supporting keyboard
		- External keyboard keys are misaligned with the on-screen piano
	- Associate external kobs with selected node parameters
		- Knob distribution is non-standard
		- So knobs should be learned by turning them in order
	- Associate other kb controls to navigate through patches
	- See http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/
		for a guide on the MIDI Web API.
	- See https://www.midi.org/specifications/item/table-1-summary-of-midi-message
		for a reference on MIDI messages.
	- Make source nodes use the MIDI velocity parameter, which is currently ignored.
		This will require implementing custom nodes for most source nodes,
		so they are internally connected to a gain node.


##UI
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
- Cool design -> themes & theme selector
- Branding
- Naming

##Long term
- Tracker
	- Probably as an independent app that can load synth presets
	- Review [this article](http://www.html5rocks.com/en/tutorials/audio/scheduling/)
	- Apart from controlling Modulator instruments,
		also emit MIDI events to external devices
- Rethink control nodes:
	- It's not about control nodes, it's about control connections
	- Any node output can be connected either to another node input or
		another node parameter.
	- Thus, there are no control nodes (other than custom ones such as ADSR),
		but *control connections*, or simply, connections to parameters
	- A different way to create a connection is required, where the user
		can explicitly specify whether it is an audio or control connection
	- Pros:
		- More versatile: any node can be used for audio or parameter control
	- Cons:
		- Less intuitive: no way to know whether the main purpose of a given node
			is to be used for audio or controlling other node's parameters.
			But colors could still be used as a guideline, and there will still be some
			*pure* control nodes such as the ADSR.
- Review this:
	- https://en.wikipedia.org/wiki/Open_Sound_Control
	- http://opensoundcontrol.org/ (was not responding when last checked)
- Custom nodes with WebWorker... when available
- Record & save audio
- Server-side part, supporting:
	- Loading & saving of resources: synth patches, songs, samples, etc.
	- User area storing user's synths, current work, etc.
	- Public sample library
- 100% responsive & mobile / tablet friendly
- Mobile app
- Atom wrapper to allow a more natural integration with file system

##Code
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

