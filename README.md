#Modulator
A graphical modular synthesizer, using the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

Modulator is a totally static HTML/JS app. It requires a modern browser such as Chrome,
FireFox or Safari, but has no server-side code.

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
- Use the keyboard to play notes: note C3 is in 'z', note C4 is in 'a'.

You can directly try it out [here](//lcrespom.github.io/synth).

##Contributing
Contributions are welcome. You can reach me via [@lcrespom](https://twitter.com/lcrespom)
on Twitter, or directly within GitHub.

- **Instruments**: please share your synth designs if you want them to be featured
	in the presets section. Just open an issue with the synth's JSON and I will
	evaluate it for inclusion.
- **Themes**: feel free to modify the `main.css` file to change the look & feel as
	much as you like. The app is especially in need of a dark theme. I will
	eventually add a theme selector option so the user can switch among a set of
	available themes.
- **Code**: There are plenty of ways to improve and expand this application,
	just check out the ToDo list below. The code is in TypeScript, but ES6/ES2015 and
	plain old JavaScript are compatible with it.

##ToDo
- Bugs
	- ADSR needs more testing & refining
	- Popping sound at note on/off (improved after adding adsr depth parameter)
	- Refine rules to determine whether nodes can connect
	- Analyzer should detect when no sound is playing and clean osc and fft graphs
	- Review TODO items inside code
	- In FireFox, when app window is scrolled down, node connection
		draws arrows incorrectly

- Functionality
	- Custom nodes
		- Keyboard control node
			- To control other parameters based on the note being pressed, centered
				on A4
			- With depth parameter
			- Based on ScriptProcessor... no other way to generically control parameters
		- Full synth as a reusable module (long term)
		- Soundbank: multiple samples, one sample per note, ideal for rythm tracks
	- Navbar with:
		- Left: "Code" button linking to GitHub
		- Center: Logo
		- Right: Help button, linking to documentation (help.md in GitHub)
	- Improve ADSR
		- Linear/exponential switch
	- Review list of pending audio nodes
		- WaveShaper
		- Etc?
	- Provide 10 preset instruments
	- Limitation: a control node can only control a single node
		- Prevent from connecting a control node to more than one destination
		- Or else, modify the UI to support multiple destination nodes
	- Keyboard Portamento in polyphonic mode
	- Use Web Midi API to gather events from external midi Keyboard
		- Play notes
		- Associate external controls with selected node parameters
	- Use the HTML5 file API to load instruments
		- See http://www.html5rocks.com/en/tutorials/file/dndfiles/
		- To save instruments, check this Stack Overflow reply:
			http://stackoverflow.com/questions/4309958/can-i-write-files-with-html5-js/14544910#14544910
		- Get rid of JSON copy+paste when this is fully implemented
		- Use it also to load audio buffers
	- Improve presets panel
		- When clicking on preset number, let user directly navigate to preset,
			e.g. by showing a drop down list

- UI
	- Parameters panel
		- Use cool knobs for parameters instead of default browser sliders
	- Help
		- General help button explaining how to connect etc.
		- Description of each node
		- Description of each node parameters
	- Consider a better way to add nodes from the palette into the canvas
	- Consider a more user-friendly way to connect and disconnect nodes
	- Improve layout
		- Remove hardcoded dimensions from canvas
		- More flexible layout
	- Cool design
	- Branding
	- Naming
	- Logo: svg

- Long term:
	- Tracker
		- Review [this article](http://www.html5rocks.com/en/tutorials/audio/scheduling/)
	- Custom nodes with WebWorker... when available
	- Record & save audio
	- Server-side part, supporting:
		- Loading & saving of resources: synth modules, songs, samples, etc.
		- User area storing user's synths, current work, etc.
		- Public sample library
	- 100% responsive & mobile / tablet friendly
	- Mobile app

- Code
	- synth.ts contains BufferURL ParamHandler,
		which has UI code that should be moved elsewhere
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
	- Reusable API to load & play presets without displaying the node graph,
		eventually to become an independent npm module (long term)
	- Improve code to clean hack that checks for custom nodes.
	- Consider compile target to ES6, see https://kangax.github.io/compat-table/es6/

- Share
	- Document
	- Create proper website in github pages
	- Present in meetup
	- Invite contributors
	- Add "Fork me on GitHub" ribbon


##Browser limitations
1. Modulator has been tested to work in Chrome, FireFox and Safari.
	Although Web Audio is available in most mobile platforms, only the desktop
	version has been tested. Node drag & drop and connection will probably not work
	in the mobile browsers.

2. The **Line In** node is not supported in Safari. Chrome should work, but if
	fails, try with FireFox.

3. FireFox consumes a huge amount of CPU when Modulator is running. It is probably
a consequence of how Web Audio is implemented in FF.


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
