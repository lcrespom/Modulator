# Contributing

## Reporting Bugs / Requesting Features
You can [open an issue](https://github.com/lcrespom/Modulator/issues)
to report bugs and also to request new features.

But **before opening any new issue**, please review the
[ToDo list](https://github.com/lcrespom/Modulator/blob/master/TODO.md),
as it may already be there.

If you are reporting a bug, please be as detailed as possible with the description
about how to reproduce it. If necessary, attach the JSON of the insturment that
generates the problem, unless it is one of the existing presets.

## Pull Requests

If you would like to add functionality, please submit
[an issue](https://github.com/lcrespom/Modulator/issues) first,
to make sure it is a feature that makes sense for the app. Then after the
issue is accepted, you can work on the contribution and submit a PR.

When submitting code, please follow the existing source code styles.
The source code is in TypeScript, but that is compatible with ES6 and ES5,
so plain JavaScript can be used. However if you are developing a new class,
it will be much better if you follow the standard ES6 class style. Yes,
JS `class` keyword has lots of detractors, so the current code avoids abusing
subclasses, as that is the major risk of using classes.

Classes fit pretty well in TypeScript, that is why it makes sense to use them...
with the proper caution.

## Development environment

1. Run `npm install` to install all development dependencies
2. Run `npm run build` to build the *.ts files into the runtime JS bundle file,
	or `npm run watch` to setup a continuous build that updates the JS bundle
	file in synch with any changes to *.ts files.
3. Run `npm run serve` to launch a small & convenient local server in order to
	test the app.


## Help wanted

Other than the specific features described in the ToDo list, it would be great
to have a mobile version of Modulator. If anyone is interested, please
open an issue and let's discuss it in the comments.

