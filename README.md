#Graph
A graphical editor, to be used for creating audio routing graphs,
to be used with the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

##ToDo
- Functionality
	- Control nodes
		- Add gain control node
		- ADSR
	- Add all possible AudioNodes available into the palette
		- Especially support sampled audio
		- Reverb, etc.
	- Split slider logscale in two with middle value in the middle of the slider,
		then fine-tune all module definitions (e.g. gain)
	- Node deletion (e.g. via a delete button in parameter box)
	- Keyboard trigger
	- Consider supporting fan-out by connecting and disconnecting to/from multiple modules
	- Display editable parameter values numerically under slider
	- Dislay osc/fft using AnalyserNode
	- Load/save instruments
	- When adding a node from the palette, place it on an empty
		spot and select it
	- Long term:
		- Tracker
		- Custom modules with WebWorker
		- Record & save audio

- UI
	- Update parameter box header with currently selected node
	- Help button explaining how to connect etc.
	- Remove hardcoded dimensions from canvas
	- Right-click & drag to connect nodes
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
	- Present in meetup
	- Invite contributors
	- Contact web audio developers such as @chrislowis & @mohayonao
