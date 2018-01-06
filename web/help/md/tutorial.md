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

The calls to `play` and `sleep` track methods inside the user function are used to schedule notes to be played by the track at their appropriate times:
- The `play` method is used to specify the note number to be played. The method expects a note number, but the `Note` object stores the numbers of all notes from C0 to B8. Sharps and flats are also available. For example, `Note.Cs4` stands for C sharp, octave 4, and `Note.Bb3` stands for B flat, octave 3.
- The `sleep` method is used to specify the time, in seconds, to wait until the next note is played.

The live coding engine sets up a background process that is continuously checking what is the note to play at a given time.


## Keyboard shortcuts
To execute the code in our editor, we can click the play button on the top-left corner of the editor box. Alternatively, you can press the `Ctrl+Alt+Enter` keyboard combination (or `Cmd` instead of `Ctrl` if you are using a Mac).

This keyboard combination is very useful, but sometimes you will need to execute only a line of code, or a group of lines. For that, you can use the second button at the top right of the editor, or the more convenient `Ctrl+Enter` keyboard combination (`Cmd+Enter` for Mac users). If you have some lines of code selected, it will execute the selected code. Otherwise, it will execute the line of code where the cursor is located.

If at any moment you want to immediately stop all audio, you can press the stop button or press `Ctrl+.` (`Cmd+.` for the fancy Mac users).


## Looping

Let's now try the following code:

```javascript
let i = lc.instrument('TB-303', 'lead')
lc.loop_track('melody', t => t
	.instrument(instruments.lead)
	.play(Note.E4).sleep(0.25)
	.play(Note.C4).sleep(0.25)
	.play(Note.G3).sleep(0.25)
	.play(Note.C3).sleep(0.25)
)
```

When you run it, you will hear that it loops endlesly. You can click the stop button any time to end all sound playback. The `lc.loop_track` method is identical to `lc.track`, but creates a looping track that repeats itself over and over. Creating looping tracks and then interactively changing and manipulating them is the main technique for performing live musing, hence the ***Live Coding*** name.


## Updating a playing track

Because we have named our track `melody`, we have access to this looping melody track in the `tracks.melody` object at any time we want to use it. Every time a track is created, it is added to the global `tracks` object with the user-provided name.

Let's modify the volume of the looping track. Write the following code below the previous code:

```javascript
tracks.melody.gain(0, 5)
```

Now place the cursor in that line and press `Ctrl+Enter` (or `Cmd+Enter` if Mac). You should notice how the track volume gradually decreases to 0 during 5 seconds.

Let's now raise the volume to 0.5 in one second. Add the following line and run it:

```javascript
tracks.melody.gain(0.5, 1)
```

Finally, lets stop the track loop by running the following code:

```javascript
tracks.melody.stop()
```

You will notice that the track plays until the end of the loop, and then stops.

Tracks in the `tracks` object have a different set of methods than during the track creation step


## Replacing a looping track
Not let's start over: click the stop button and select and run the code that creates the loop:

```javascript
lc.loop_track('melody', t => t
	.instrument(instruments.lead)
	.play(Note.E4).sleep(0.25)
	.play(Note.C4).sleep(0.25)
	.play(Note.G3).sleep(0.25)
	.play(Note.C3).sleep(0.25)
)
```

Now let's edit the code and change the first note, E4, into D4. Select the code block, from `lc.loop_track(` to its matching `)` and hit `Ctrl+Enter` (or `Cmd+Enter`).
After the current loop ends, the track melody will change accordingly.

What we have just done is creating a new version of the track. The live coding engine schedules the new track to be played at the end of the current loop, and then that track keeps looping.

It is important that the track name is maintained. Otherwise, a new independent track will start playing immediately.


<!--

## Effects

## Scales

## Rings

## Randomness
-->