#Graph
A graphical editor, to be used for creating audio routing graphs,
to be used with the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

##ToDo
- Functionality
	- Node deletion (e.g. via a delete button in parameter box)
	- Keyboard trigger
	- Control nodes
	- Support fan-out by connecting and disconnecting to/from multiple modules
	- Test multiple outputs from an audio node
	- More audio nodes (reverb, etc.)
	- Display editable parameter values numerically under slider
	- Dislay osc/fft using AnalyserNode
	- Load/save instruments
	- When adding a node from the palette, place it on an empty
		spot and select it
- UI
	- Descriptive headers in graph, palette & parameters boxes
	- Help button explaining how to connect etc.
	- Remove hardcoded dimensions from canvas
	- Right-click & drag to connect nodes
	- Branding
	- Naming
	- Logo
- Code
	- Refactor main.ts
	- Replace SynthNode extension with composition (how?)
- Support
	- Support FireFox (does not have AudioContext.suspend/resume)
	- Test in Safari
- Share
	- Document
	- Present in meetup
	- Invite contributors
	- Contact web audio developers such as @chrislowis & @mohayonao
