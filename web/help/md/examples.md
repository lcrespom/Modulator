# Examples

## The Rip - Portishead

```javascript
// The Rip

lc.bpm(75)

let i = lc.instrument('TB-303', 'bass')
instruments.bass.param('Filter/frequency', 1000, 5)
instruments.bass.param('Gain/gain', 0.5)
let delay = lc.effect('tuna/PingPongDelay', 'delay')


function play_arp(track, notes) {
    track.repeat(4, _ => track
        .sleep(0.25)
        .play_notes(notes, 0.25, 0.1)
    )
}

lc.loop_track('right_hand',
    t => {
        t.instrument(i)
        .volume(0.2)
        play_arp(t, [Note.G4, Note.E4, Note.B3])
        play_arp(t,[Note.E4, Note.C4, Note.G3])
        play_arp(t,[Note.E4, Note.C4, Note.A3])
        play_arp(t,[Note.F4, Note.D4, Note.Bb3])
        play_arp(t,[Note.E4, Note.C4, Note.A3])
        play_arp(t,[Note.D4, Note.B3, Note.G3])
    }
)

lc.loop_track('left_hand', t => t
    .instrument(instruments.bass)
    .effect(delay)
    .volume(0.25)
    .repeat(4, _ => t.play(Note.E2).sleep(1))
    .repeat(3, _ => t.play(Note.C3).sleep(1))
    .play(Note.B2).sleep(1)
    .repeat(4, _ => t.play(Note.A2).sleep(1))
    .repeat(4, _ => t.play(Note.Bb2).sleep(1))
    .repeat(4, _ => t.play(Note.A2).sleep(1))
    .repeat(4, _ => t.play(Note.G2).sleep(1))
)
```

## Rhythm box

```javascript
lc.bpm(100)
lc.instrument('wavetable/12835_0_Chaos_sf2_file', 'drum')
lc.instrument('wavetable/12839_0_Chaos_sf2_file', 'clap')
lc.instrument('wavetable/12842_0_Chaos_sf2_file', 'chihat')
lc.instrument('wavetable/12846_0_Chaos_sf2_file', 'ohihat')
for (let i in instruments) instruments[i].duration = 1

function cleanup_patts(patts) {
    for (let i in patts) patts[i] = patts[i].replace(/ /g, '')
}

function isLowerCase(ch) {
    return ch >= 'a' && ch <= 'z'
}

function playPatterns(t, patts, notes) {
    let ct = 0
    cleanup_patts(patts)
    let played = true
    while (played) {
        played = false
        for (let iname in patts) {
            let patt = patts[iname]
            let ch = patt[ct]
            if (ch && ch != '-') t
                .instrument(instruments[iname])
                .volume(isLowerCase(ch) ? 0.5 : 1)
                .play(notes[iname])
            if (ch)
                played = true
        }
        if (played) t.sleep(0.25)
        ct += 1
    }
}

lc.loop_track('drums', t =>
    playPatterns(t, {
        drum:   'X--- x--- X--- x---',
        clap:   '---- X--- ---- X---',
        chihat: '-x-- -x-x -x-- xxxx',
        ohihat: '---x ---- ---x ----'
    }, {
        drum: 35, clap: 39, chihat: 42, ohihat: 46
    })
)
```


## Blade Runner - Vangelis

```javascript
// Blade Runner

lc.bpm(113)
lc.log_enable(true)
lc.log_clear()

let p_bass = {"nodes":[{"id":0,"x":560,"y":160,"name":"Out","inputs":[4],"classes":"node node-out"},{"id":1,"x":240,"y":160,"name":"Filter","inputs":[2,3],"classes":"node node-effect"},{"id":2,"x":60,"y":100,"name":"Osc 1","inputs":[],"classes":"node node-src"},{"id":3,"x":60,"y":220,"name":"Osc 2","inputs":[],"classes":"node node-src"},{"id":4,"x":400,"y":160,"name":"Gain","inputs":[1,5],"classes":"node node-effect"},{"id":5,"x":401,"y":302,"name":"ADSR","inputs":[],"classes":"node node-ctrl"}],"nodeData":[{"type":"out","params":{}},{"type":"Filter","params":{"frequency":3842.086673885002,"Q":9.284478953499399,"detune":0,"gain":0,"type":"lowpass"}},{"type":"Oscillator","params":{"frequency":140,"detune":0,"type":"sawtooth"}},{"type":"Oscillator","params":{"frequency":140,"detune":10,"type":"sawtooth"}},{"type":"Gain","params":{"gain":0.6800000071525574}},{"type":"ADSR","params":{"attack":0,"decay":0.2588491696637665,"sustain":0,"release":0,"depth":0.99},"controlParam":"gain","controlParams":["gain"]}],"name":"br-bass","modulatorType":"synth","keyboard":{"portamento":0,"octave":3,"arpeggio":{"bpm":60,"mode":0,"octave":1}}}
let i_bass = lc.instrument(p_bass)

let e = lc.effect('BiquadFilter', 'flt')
lc.loop_track('bass', t => t
    .effect(e)
    .instrument(i_bass)
    .volume(0.7)
    .play(44).sleep(0.25)
    .volume(0.5)
    .play(44).sleep(0.25)
    .play(46).sleep(0.25)
    .play(47).sleep(0.25)
)
effects.flt.param('frequency', 2000, 3)


let p_lead = {"nodes":[{"id":0,"x":600,"y":200,"name":"Out","inputs":[4],"classes":"node node-out"},{"id":1,"x":300,"y":200,"name":"Filter","inputs":[2,3,5,7],"classes":"node node-effect"},{"id":2,"x":140,"y":160,"name":"Osc 1","inputs":[],"classes":"node node-src"},{"id":3,"x":140,"y":260,"name":"Osc 2","inputs":[],"classes":"node node-src"},{"id":4,"x":460,"y":200,"name":"Gain","inputs":[1,5],"classes":"node node-effect"},{"id":5,"x":300,"y":300,"name":"ADSR","inputs":[],"classes":"node node-ctrl"},{"id":6,"x":460,"y":60,"name":"Delay","inputs":[4],"classes":"node node-effect"},{"id":7,"x":300,"y":60,"name":"Pan","inputs":[6,9],"classes":"node node-effect"},{"id":9,"x":140,"y":60,"name":"LFO","inputs":[],"classes":"node node-ctrl"}],"nodeData":[{"type":"out","params":{}},{"type":"Filter","params":{"frequency":3500,"Q":3,"detune":0,"gain":0,"type":"lowpass"}},{"type":"Oscillator","params":{"frequency":140,"detune":0,"type":"sawtooth"}},{"type":"Oscillator","params":{"frequency":140,"detune":10,"type":"sawtooth"}},{"type":"Gain","params":{"gain":0.32}},{"type":"ADSR","params":{"attack":0.4,"decay":0.5,"sustain":1,"release":2,"depth":0.999},"controlParam":"gain","controlParams":["gain"]},{"type":"Delay","params":{"delayTime":0.05}},{"type":"StereoPan","params":{"pan":0}},{"type":"LFO","params":{"frequency":0.4442202913671254,"detune":0,"type":"sine"},"controlParam":"pan","controlParams":["pan"]}],"name":"br-lead","modulatorType":"synth","keyboard":{"portamento":0,"octave":4,"arpeggio":{"bpm":60,"mode":0,"octave":1}}}
let i_lead = lc.instrument(p_lead)

lc.track('lead', t => t
    .instrument(i_lead)
    .volume(0.5)
    .transpose(18)
    .sleep(12)
    .play(64, 3).sleep(4)
    .play(62).sleep(2)
    .play(60).sleep(2)
    .play(59).sleep(2)
    .sleep(6)
    .play(62, 3).sleep(4)
    .play(61).sleep(2)
    .play(59).sleep(2)
    .play(57).sleep(2)
    .sleep(6)
    .play(60, 3).sleep(4)
    .play(59).sleep(2)
    .play(57).sleep(2)
    .play(52).sleep(4)
    .play(57).sleep(4)
    .play(52).sleep(4)
)


lc.instrument('wavetable/12836_28_JCLive_sf2_file', 'drums')
instruments.drums.duration = 2
lc.effect('tuna/Delay', 'delay')
effects.delay.param('delayTime', 50)
effects.delay.param('wetLevel', 0.5)
effects.delay.param('cutoff', 20000)
lc.track('drums', t => t
    .instrument(instruments.drums)
    .effect(effects.delay)
    .volume(0.7)
    .transpose(4)
    .sleep(8)
    .play(42).sleep(0.5)
    .play(36).sleep(0.5)
    .play(42).sleep(0.5)
    .play(36).sleep(0.5)
    .play(42).sleep(0.5)
    .play(36).sleep(0.5)
    .play(42).sleep(0.5)
    .play(36).sleep(0.5)
)```
