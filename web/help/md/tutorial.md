# Live Coding tutorial

## Playing some notes

Let's begin with a simple example that plays 3 notes:

```javascript
// Load an instrument from Modulator patches and change its default name
lc.instrument('Fat Bass', 'bass')
// Create a track and play 3 notes in sequence
lc.track('bass_line', t => t
	.instrument(instruments.bass)
	.play(Note.C3).sleep(1)
	.play(Note.E3).sleep(1)
	.play(Note.G3).sleep(1)
)
```
Go ahead, copy the code inside the editor and click the play button on the top left. You should hear three consecutive notes.

The `lc.instrument` line creates a new instrument from the patch called 'Fat Bass'
and sets its new name to 'bass'. The result is that a new instrument object is created and placed as a new member of the global `instruments` object. Now we can access the instrument in the `instruments.bass` property.

The `lc.track` method expects a track name as its first parameter and a function as its second parameter. When invoked, it creates a new track and immediately calls the provided function, passing the newly created track as a parameter. The user function can then use the provided track object to schedule notes.

Using the *traditional* JavaScript notation, the above `lc.track` call would look like this:

```javascript
lc.track('bass_line', function(track) {
	track.instrument(instruments.bass);
	track.play(Note.C3);
	track.sleep(1);
	track.play(Note.E3);
	track.sleep(1);
	track.play(Note.G3);
	track.sleep(1);
});
```

Using the "fat arrow" `=>` function shorthand, in combination with the fact that all track methods return the track itself, we can make the code much more readable and fluent:

```javascript
lc.track('bass_line', t => t
	.instrument(instruments.bass)
	.play(Note.C3).sleep(1)
	.play(Note.E3).sleep(1)
	.play(Note.G3).sleep(1)
)
```

Both versions of the code have the same effect; it is a user's choice which one to use.

The calls to `play` and `sleep` track methods inside the user function are used to schedule notes to be played by the track at their appropriate times. The live coding engine sets up a background process that is continuously checking what is the next note to play at a given time.


## Keyboard shortcuts
To execute the code in our editor, we can click the play button on the top-left corner of the editor box. Alternatively, you can press the `Ctrl+Alt+Enter` keyboard combination (or `Cmd` instead of `Ctrl` if you are using a Mac).

This keyboard combination is very useful, but sometimes you will need to execute only a line of code, or a group of lines. For that, you can use the second button at the top right of the editor, or the more convenient `Ctrl+Enter` keyboard combination (`Cmd+Enter` for Mac users). If you have some lines of code selected, it will execute the selected code. Otherwise, it will execute the line of code where the cursor is located.


## Looping


