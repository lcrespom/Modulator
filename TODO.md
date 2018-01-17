# ToDo

## Testing
- [ ] Test in Safari
- [x] Test in FireFox
- [x] Engage betatesters
- [x] Review documentation in spellchecker
- [ ] Upgrade jQuery to v3 and re-test (thoroughly)

## Bugs
- [ ] Node deletion only works once
- [ ] Loading a synth with two ADSR nodes generates horrible sounds
- [ ] Buffered audio nodes fail after switching back&forth from empty preset
	- Uncaught (in promise) DOMException: Unable to decode audio data
	- See lines 260 and 302 in synth.ts
- [ ] ADSR needs more testing & refining
	- Probable memory leaks in Pew! instrument
	- Also see http://www.soundonsound.com/sos/nov99/articles/synthsecrets.htm
		for explanations on how to improve quality, especially the paragraph
		about instruments swallowing its tongue.
- [ ] Popping sound at note on/off (improved after adding adsr depth parameter)
- [ ] Analyzer should detect when no sound is playing and clean osc and fft graphs
	- Only visible in synths without ADSR
- [x] Piano notes get stuck
- [x] When app window is scrolled down, node connection draws arrows incorrectly

## Relaunch plan
- [x] Tracker branch
- [x] Remove tracker (too big)
- [x] Upgrade development dependencies (typescript, webpack, etc.)
- [x] Reorganize paths to more conventional src/, web/, etc.
- [x] Upgrade .gitignore
- [x] Apply tslint, update code when required
- [ ] Upgrade runtime dependencies (...if required?)
- [x] Live coding branch
- [ ] Fix deprecation warnings

## Live Coding
- Document and publish
	- [x] Merge with master
	- [ ] Publish in GitHub pages
	- [x] Tutorial
	- [x] Examples
	- [x] Document API
- Synth API / runtime
	- [ ] TidalCycles simplified rhythm parser
		- [x] Implement
		- [ ] Document
	- [ ] Improve note event accuracy in the listen function
	- [ ] Do not require an instrument for track playing
		- Use the first instrument in the instruments table
		- If instrument table is empty, use some default preset
	- [ ] Track synchronization via cue/sync methods
		- Cue to post message
		- Synch to wait for message
	- [ ] Track solo / unsolo
	- [x] Copy from Sonic Pi
		- [x] Notes
		- [x] Rings
		- [x] Scales
		- [x] Random helpers (shuffle, etc => use deterministic seed)
	- [x] Sample loading + playing API
		- Load samples via `lc.instrument(sample/name)`
		- Samples must have been uploaded via drag/drop
			- Check https://css-tricks.com/drag-and-drop-file-uploading/
		- [x] Trace "Loading instrument *name*..." and "Instrument *name* ready" in sample and wavetable instruments
		- [x] Trace "Instrument *name* ready" for Modulator instruments
	- [x] LiveCoding startup/shutdown
		- [x] lc.init(async function() { ... }) to perform sample initialization
		- [x] Start playing only after await lc.init has returned
		- Probably not required for sample loading if provided by lc instance
	- [x] Add many more instruments
		- See https://github.com/surikov/webaudiofont
	- [x] Custom effect support: predefined and user-defined
	- [x] Ramps in track gain and effects
	- [x] Global pause / stop / continue
	- [x] Track stop / pause / continue
	- [x] Control global track gain node: gain, mute/unmute
	- [x] Set effect and instrument parameters according to track time
	- [x] Effects API
	- [x] Set instrument parameters
	- [x] Tracks with loops & loop update after end of current
	- [x] Make synth use the velocity parameter in noteOn
	- [x] BPM API
	- [x] Smarter code completion for parameters, effect names, etc.
	- [ ] Prevent instrument and effect instances to be shared across tracks
- Editor
	- [ ] Add more panels
		- [ ] Info
			- [ ] Tracks: name + status: timeline, mute/solo, stopped
			- [ ] Effects: name + params
			- [ ] Instruments: name + params
			- [ ] Samples
			- [ ] Click on effect/instrument to display params in params panel
		- [ ] instruments and parameters => click to edit parameters in separate panel
		- [x] osc & fft
		- [x] log
			- [x] Colors in logs, e.g. note data
			- [x] Trace event time information in 00:00.000 format
			- [x] Log more events: instr/track/effect creation, etc
			- [x] Stop event tracing after error, restore it after next run
			- [ ] Make log_enable receive two parameters: `log_notes` and `log_events`
	- [x] Button row
		- [ ] FFW / RWD
		- [x] Stop / pause / continue
		- [x] Help / live coding API / tutorial
		- [x] Run code / Run line|selection
		- [x] Increase / decrease font
	- [x] Dark theme
		- [ ] configure code colors with monokai
	- [x] Code sharing
		- [x] Grab code from any URL and paste it in the editor. If there
			is existing code in the buffer, comment it out.
			Users can publish code anywhere as long as the server accepts CORS.
	- [x] Store more data in localStorage
		- [x] Color theme
		- [x] Selected buffer
		- [x] Font size and cursor location for each buffer
	- [x] Multiple editor buffers
	- [x] Preserve editor code across page refreshes
	- [x] Partial run
		- [x] Run current line
		- [x] Run selection
	- [x] Flash code to be run
	- [x] Show sound in graphs (osc and fft)

- [x] Get note duration by searching for attack/decay times
- [x] Detect errors in code:
	- [x] Let Monaco editor detect syntax errors
	- [x] Fine tune error marker colors
	- [x] Fine tune error marker location (start and end columns)
	- [x] Add hover message to error marker
	- [x] Capture runtime errors and highlight line number
	- [x] Display error message on line hover
- [x] Do as with tracker
	- [x] Use separate route and independent pages
	- [x] Make page layout take 100% of height
- [ ] Background canvas
	- Canvas API
	- WebGL / 3D Canvas
- [ ] Quick fix errors (upon enter or alt+enter, look only at current line)
	- [ ] Add function `()` and `,`
	- [ ] Add array and object `,`
	- [ ] Avoid lines inside comments or strings


## Functionality

- Review TODO items inside code

- Allow parameter changes in poly mode => start in poly mode

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
	- A proper implementation of a pitch sihfter
		- See https://github.com/echo66/time-stretch-wac-article/blob/master/ts-ps-wac.pdf
- Review list of pending audio nodes
	- WaveShaper
	- Etc?
- Improve ADSR
	- Linear/exponential switch
	- For calculating exponential ramp cut, the
		[spec](https://webaudio.github.io/web-audio-api/#widl-AudioParam-exponentialRampToValueAtTime-AudioParam-float-value-double-endTime)
		has the formula.
- Improve soundbank: multi-file upload

- Navigate selection of audio nodes in the graph using the keyboard,
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


## UI
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


## Tracker
- Tracks
	- display track rows and content
	- add / remove track
- Parts
	- Code cleanup for parts with empty notes: create always default empty note array
	- Record button - start with first note
	- Start select / end select / cut / copy / paste
	- Delete row / insert row
	- New part / Delete part / Add to track / move up / move down
- Apart from controlling Modulator instruments,
	also emit MIDI events to external devices


## Long term
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

## Code
- Provide an interface that predefines the very common noteOn / noteOff methods
- Decoupling
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
- Extract the following independent npm modules:
	- graph.ts
	- An npm module with all code in the synth folder
- Improve code to clean hack that checks for custom nodes when connecting.