!function(t){function e(s){if(n[s])return n[s].exports;var o=n[s]={i:s,l:!1,exports:{}};return t[s].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,s){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:s})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=21)}([function(t,e,n){"use strict";function s(t,e){return Math.log(e)/Math.log(t)}e.d=function(t,e){const n=t.indexOf(e);return!(n<0||(t.splice(n,1),0))},e.b=function(t,e,n){const a=s(o,n+1-e);return s(o,t+1-e)/a},e.c=function(t,e,n){const a=s(o,n+1-e);return e+Math.pow(o,t*a)-1},e.a=function(t){for(;null!=t&&t.tabIndex<0&&"body"!=t.nodeName.toLowerCase();)t=t.parentElement;return t};const o=2},function(t,e,n){"use strict";function s(t,e,n){let s=t.target.files;if(!s||s.length<=0)return e("","");const o=s[0],a=new FileReader;a.onload=(t=>e(t.target.result,o)),a[n](o)}e.a=function(t){for(var e="",n=new Uint8Array(t),s=n.byteLength,o=0;o<s;o++)e+=String.fromCharCode(n[o]);return window.btoa(e)},e.b=function(t){for(var e=window.atob(t),n=e.length,s=new Uint8Array(n),o=0;o<n;o++)s[o]=e.charCodeAt(o);return s.buffer},e.c=function(){return!window.externalHost&&"download"in $("<a>")[0]},e.d=function(t,e){const n=$("<a>");n.attr("download",t),n.attr("href","data:application/octet-stream;base64,"+btoa(e));const s=new MouseEvent("click",{view:window,bubbles:!0,cancelable:!1});n[0].dispatchEvent(s)},e.f=function(t,e){s(t,e,"readAsText")},e.e=function(t,e){s(t,e,"readAsArrayBuffer")}},function(t,e,n){"use strict";var s=n(4),o=n(5),a=n(0),i=n(6),r=n(1);const c=Math.pow(2,1/12),l=57;e.a=class{constructor(){this.isOut=!1}getInputs(){throw"Error: getInputs() function should be implemented by user"}};class u{constructor(){this.time=0,this.ratio=0}}e.b=class{constructor(t){this.customNodes={},this.paramHandlers={},this.noteHandlers=[],this.portamento=new u,this.ac=t,this.palette=o.a,this.registerCustomNode("createADSR",i.a),this.registerCustomNode("createNoise",i.e),this.registerCustomNode("createNoiseCtrl",i.d),this.registerCustomNode("createLineIn",i.c),this.registerCustomNode("createDetuner",i.b),this.registerParamHandler("BufferDataHandler",new class{constructor(){this.uiRender="renderBufferData"}initialize(t,e){}param2json(t){return r.a(t._encoded)}json2param(t,e){const n=r.b(e);t._encoded=n,t.context.decodeAudioData(n,e=>t._buffer=e)}}),this.registerParamHandler("SoundBankHandler",new class{constructor(){this.uiRender="renderSoundBank"}initialize(t,e){t._buffers=[],t._encodedBuffers=[],t._names=[]}param2json(t){const e=[],n=t._encodedBuffers,s=t._names;for(let t=0;t<s.length;t++)e.push({name:s[t],data:r.a(n[t])});return e}json2param(t,e){const n=t._buffers;n.length=0;const s=t._encodedBuffers;s.length=0;const o=t._names;o.length=0;for(let a=0;a<e.length;a++){const i=e[a];o.push(i.name);const c=r.b(i.data);s.push(c),this.decodeBuffer(t,c,n,a)}}decodeBuffer(t,e,n,s){t.context.decodeAudioData(e,t=>n[s]=t)}})}createAudioNode(t){const e=o.a[t];if(!e)return null;const n=e.custom?this.customNodes:this.ac;if(!n[e.constructor])return null;const s=n[e.constructor]();return s.context||(s.context=this.ac),this.initNodeParams(s,e,t),s}initNodeData(t,e){if(t.synth=this,t.type=e,t.anode=this.createAudioNode(e),!t.anode)return console.error(`No AudioNode found for '${e}'`);t.nodeDef=this.palette[e];const n=t.nodeDef.noteHandler;n&&(t.noteHandler=new s.a[n](t),this.addNoteHandler(t.noteHandler))}initOutputNodeData(t,e){t.synth=this,t.type="out",t.anode=this.ac.createGain(),t.anode.connect(e),t.nodeDef=this.palette.Speaker,t.isOut=!0}removeNodeData(t){t.noteHandler&&this.removeNoteHandler(t.noteHandler)}connectNodes(t,e){t.nodeDef.control&&!e.nodeDef.control?(t.controlParams=Object.keys(e.nodeDef.params).filter(t=>e.anode[t]instanceof AudioParam),t.controlParam=t.controlParams[0],t.controlTarget=e.anode,t.anode.connect(e.anode[t.controlParam])):t.anode.connect(e.anode)}disconnectNodes(t,e){t.nodeDef.control&&!e.nodeDef.control?(t.controlParams=null,t.anode.disconnect(e.anode[t.controlParam])):t.anode.disconnect(e.anode)}json2NodeData(t,e){for(const n of Object.keys(t.params)){const s=e.anode[n],o=t.params[n];e.nodeDef.params[n].handler?this.paramHandlers[e.nodeDef.params[n].handler].json2param(e.anode,o):s instanceof AudioParam?(s.value=o,s._value=o):e.anode[n]=o}}nodeData2json(t){const e={};for(const n of Object.keys(t.nodeDef.params)){const s=t.anode[n];t.nodeDef.params[n].handler?e[n]=this.paramHandlers[t.nodeDef.params[n].handler].param2json(t.anode):s instanceof AudioParam?void 0===s._value?e[n]=s.value:e[n]=s._value:e[n]=s}return{type:t.type,params:e,controlParam:t.controlParam,controlParams:t.controlParams}}midi2freqRatio(t){return Math.pow(c,t-l)}noteOn(t,e,n){n||(n=this.ac.currentTime);const s=this.midi2freqRatio(t);this.setupNoteHandlers();for(const o of this.noteHandlers)o.noteOn(t,e,s,n);this.portamento.ratio=s}noteOff(t,e,n){n||(n=this.ac.currentTime);for(const s of this.noteHandlers)s.noteOff(t,e,n)}addNoteHandler(t){this.noteHandlers.push(t)}removeNoteHandler(t){Object(a.d)(this.noteHandlers,t)}setupNoteHandlers(){let t=0;for(const e of this.noteHandlers)e.kbTrigger&&e.releaseTime>t&&(t=e.releaseTime);for(const e of this.noteHandlers)e.kbTrigger||(e.releaseTime=t)}initNodeParams(t,e,n){for(const s of Object.keys(e.params||{}))void 0===t[s]?console.warn(`Parameter '${s}' not found for node '${n}'`):t[s]instanceof AudioParam?t[s].value=e.params[s].initial:e.params[s].handler?(e.params[s].phandler=this.paramHandlers[e.params[s].handler],e.params[s].phandler.initialize(t,e)):t[s]=e.params[s].initial}registerCustomNode(t,e){this.customNodes[t]=(()=>new e(this.ac))}registerParamHandler(t,e){this.paramHandlers[t]=e}}},,function(t,e,n){"use strict";var s=n(0);class o{constructor(t){this.kbTrigger=!1,this.releaseTime=0,this.ndata=t,this.outTracker=new class{constructor(t){this.outputs=[],this.onBefore(t,"connect",this.connect,(t,e,n)=>{n[0].custom&&n[0].anode&&(n[0]=n[0].anode),t.apply(e,n)}),this.onBefore(t,"disconnect",this.disconnect)}connect(t){this.outputs.push(t)}disconnect(t){Object(s.d)(this.outputs,t)}onBefore(t,e,n,s){const o=t[e],a=this;t[e]=function(){n.apply(a,arguments),s?s(o,t,arguments):o.apply(t,arguments)}}}(t.anode)}noteOn(t,e,n,s){}noteOff(t,e,n){}clone(){const t=this.ndata.anode.context[this.ndata.nodeDef.constructor]();for(const e of Object.keys(this.ndata.nodeDef.params)){const n=this.ndata.anode[e];n instanceof AudioParam?t[e].value=n.value:null!==n&&void 0!==n&&(t[e]=n)}for(const e of this.outTracker.outputs){let n=e;n.custom&&n.anode&&(n=n.anode),t.connect(n)}for(const e of this.ndata.getInputs())e.anode.connect(t[e.controlParam]);return t}disconnect(t){for(const e of this.outTracker.outputs)t.disconnect(e);for(const e of this.ndata.getInputs())e.anode.disconnect(t[e.controlParam])}rampParam(t,e,n){const s=this.ndata.synth.portamento,o=t.value*e;if(t._value=o,s.time>0&&s.ratio>0){const e=t.value*s.ratio;t.cancelScheduledValues(n),t.linearRampToValueAtTime(e,n),t.exponentialRampToValueAtTime(o,n+s.time)}else t.setValueAtTime(o,n)}}class a extends o{noteOn(t,e,n,s){this.oscClone&&this.oscClone.stop(s),this.oscClone=this.clone(),this.rampParam(this.oscClone.frequency,n,s),this.oscClone.start(s),this.lastNote=t}noteOff(t,e,n){t==this.lastNote&&this.oscClone.stop(n+this.releaseTime)}}class i{constructor(t,e,n,s){this.v1=t,this.v2=e,this.t1=n,this.t2=s}inside(t){return this.t1<this.t2&&this.t1<=t&&t<=this.t2}cut(t){const e=this.v1+(this.v2-this.v1)*(t-this.t1)/(this.t2-this.t1);return new i(this.v1,e,this.t1,t)}run(t,e=!1){this.t2-this.t1<=0?t.setValueAtTime(this.v2,this.t2):(e||t.setValueAtTime(this.v1,this.t1),t.linearRampToValueAtTime(this.v2,this.t2))}}const r={osc:a,buffer:class extends o{noteOn(t,e,n,s){this.absn&&this.absn.stop(s);const o=this.ndata.anode._buffer;if(!o)return;this.absn=this.clone(),this.absn.buffer=o;const a=this.absn.playbackRate;a.value,this.rampParam(a,a.value*n,s),this.absn.start(s),this.lastNote=t}noteOff(t,e,n){t==this.lastNote&&this.absn.stop(n+this.releaseTime)}},ADSR:class extends o{constructor(t){super(t),this.kbTrigger=!0;const e=t.anode,n=e.disconnect;e.disconnect=(t=>{this.loopParams(n=>{n==t&&n.setValueAtTime(n._value,e.context.currentTime)}),n(t)})}get releaseTime(){return this.ndata.anode.release}noteOn(t,e,n,s){this.lastNote=t;const o=this.ndata.anode;this.loopParams(t=>{const e=this.getParamValue(t),n=(1-o.depth)*e,a=e*o.sustain+n*(1-o.sustain),r=o.context.currentTime;t.cancelScheduledValues(r),s>r&&this.rescheduleRamp(t,t._release,r),t._attack=new i(n,e,s,s+o.attack),t._decay=new i(e,a,s+o.attack,s+o.attack+o.decay),t._attack.run(t),t._decay.run(t,!0)})}noteOff(t,e,n){if(t!=this.lastNote)return;const s=this.ndata.anode;this.loopParams(t=>{let e=this.getRampValueAtTime(t,n);null===e&&(e=this.getParamValue(t)*s.sustain);const o=(1-s.depth)*e;t.cancelScheduledValues(n);const a=s.context.currentTime;n>a&&(this.rescheduleRamp(t,t._attack,a)||this.rescheduleRamp(t,t._decay,a)),t._release=new i(e,o,n,n+s.release),t._release.run(t)})}rescheduleRamp(t,e,n){return!(!e||!e.inside(n)||(e.cut(n).run(t),0))}getRampValueAtTime(t,e){return t._attack&&t._attack.inside(e)?t._attack.cut(e).v2:t._decay&&t._decay.inside(e)?t._decay.cut(e).v2:null}loopParams(t){for(const e of this.outTracker.outputs)e instanceof AudioParam&&t(e)}getParamValue(t){return void 0===t._value&&(t._value=t.value),t._value}},LFO:class extends a{rampParam(t,e,n){t.setValueAtTime(t.value,n)}},restartable:class extends o{constructor(){super(...arguments),this.playing=!1}noteOn(t,e,n,s){const o=this.ndata.anode;this.playing&&o.stop(s),this.playing=!0,o.start(s),this.lastNote=t}noteOff(t,e,n){t==this.lastNote&&(this.playing=!1,this.ndata.anode.stop(n+this.releaseTime))}},soundBank:class extends o{noteOn(t,e,n,s){const o=this.ndata.anode._buffers,a=this.clone();a.buffer=o[t%o.length],a.start(s)}noteOff(t,e,n){}}};e.a=r},function(t,e,n){"use strict";n.d(e,"a",function(){return o});const s={initial:0,min:-1200,max:1200,linear:!0};var o={Oscillator:{constructor:"createOscillator",noteHandler:"osc",params:{frequency:{initial:220,min:20,max:2e4},detune:s,type:{initial:"sawtooth",choices:["sine","square","sawtooth","triangle"]}}},Buffer:{constructor:"createBufferSource",noteHandler:"buffer",params:{playbackRate:{initial:1,min:0,max:8},detune:s,buffer:{initial:null,handler:"BufferDataHandler"},loop:{initial:!1},loopStart:{initial:0,min:0,max:10},loopEnd:{initial:3,min:0,max:10}}},Noise:{constructor:"createNoise",noteHandler:"restartable",custom:!0,params:{gain:{initial:1,min:0,max:10}}},LineIn:{constructor:"createLineIn",custom:!0,params:{}},SoundBank:{constructor:"createBufferSource",noteHandler:"soundBank",params:{buffer:{initial:null,handler:"SoundBankHandler"}}},Gain:{constructor:"createGain",params:{gain:{initial:1,min:0,max:10,linear:!0}}},Filter:{constructor:"createBiquadFilter",params:{frequency:{initial:440,min:20,max:2e4},Q:{initial:0,min:0,max:100},detune:s,gain:{initial:0,min:-40,max:40,linear:!0},type:{initial:"lowpass",choices:["lowpass","highpass","bandpass","lowshelf","highshelf","peaking","notch","allpass"]}}},Delay:{constructor:"createDelay",params:{delayTime:{initial:1,min:0,max:5}}},StereoPan:{constructor:"createStereoPanner",params:{pan:{initial:0,min:-1,max:1,linear:!0}}},Compressor:{constructor:"createDynamicsCompressor",params:{threshold:{initial:-24,min:-100,max:0,linear:!0},knee:{initial:30,min:0,max:40,linear:!0},ratio:{initial:12,min:1,max:20,linear:!0},reduction:{initial:0,min:-20,max:0,linear:!0},attack:{initial:.003,min:0,max:1},release:{initial:.25,min:0,max:1}}},Detuner:{constructor:"createDetuner",custom:!0,params:{octave:{initial:0,min:-2,max:2,linear:!0}}},LFO:{constructor:"createOscillator",noteHandler:"LFO",control:!0,params:{frequency:{initial:5,min:.01,max:200},detune:s,type:{initial:"sine",choices:["sine","square","sawtooth","triangle"]}}},GainCtrl:{constructor:"createGain",control:!0,params:{gain:{initial:10,min:0,max:100,linear:!0}}},ADSR:{constructor:"createADSR",noteHandler:"ADSR",control:!0,custom:!0,params:{attack:{initial:.2,min:0,max:10},decay:{initial:.5,min:0,max:10},sustain:{initial:.5,min:0,max:1,linear:!0},release:{initial:1,min:0,max:10},depth:{initial:1,min:0,max:1}}},NoiseCtrl:{constructor:"createNoiseCtrl",control:!0,custom:!0,params:{frequency:{initial:4,min:0,max:200},depth:{initial:20,min:0,max:200}}},Speaker:{constructor:null,params:{}}}},function(t,e,n){"use strict";class s{constructor(){this.custom=!0,this.channelCount=2,this.channelCountMode="max",this.channelInterpretation="speakers",this.numberOfInputs=0,this.numberOfOutputs=1}connect(t){}disconnect(t){}addEventListener(){}dispatchEvent(t){return!1}removeEventListener(){}}e.a=class extends s{constructor(){super(...arguments),this.attack=.2,this.decay=.5,this.sustain=.5,this.release=1,this.depth=1}};class o extends s{constructor(t){super(),this.gain=1,this.playing=!1,this.anode=t.createScriptProcessor(1024),this.anode.onaudioprocess=(t=>this.processAudio(t))}connect(t){this.anode.connect(t)}disconnect(){this.anode.disconnect()}start(){this.playing=!0}stop(){this.playing=!1}processAudio(t){}}e.e=class extends o{processAudio(t){for(let e=0;e<t.outputBuffer.numberOfChannels;e++){const n=t.outputBuffer.getChannelData(e);for(let t=0;t<n.length;t++)n[t]=this.playing?this.gain*(2*Math.random()-1):0}}};e.d=class extends o{constructor(t){super(t),this.ac=t,this.frequency=4,this.depth=20,this.sct=0,this.v=0}connect(t){this.anode.connect(t)}processAudio(t){const e=this.ac.sampleRate/this.frequency;for(let n=0;n<t.outputBuffer.numberOfChannels;n++){let s=t.outputBuffer.getChannelData(n);for(let t=0;t<s.length;t++)this.sct++,this.sct>e&&(this.v=this.depth*(2*Math.random()-1),this.sct=0),s[t]=this.v}}};e.b=class extends o{constructor(){super(...arguments),this.octave=0,this.numberOfInputs=1}processAudio(t){const e=Math.pow(2,this.octave);for(let n=0;n<t.outputBuffer.numberOfChannels;n++){let s=t.outputBuffer.getChannelData(n),o=t.inputBuffer.getChannelData(n),a=0;for(let t=0;t<s.length;t++)s[t]=o[Math.floor(a)],(a+=e)>=o.length&&(a=0)}}};e.c=class extends s{connect(t){if(this.srcNode)return this.srcNode.connect(t),void(this.dstNode=t);const e=window.navigator;e.getUserMedia=e.getUserMedia||e.webkitGetUserMedia||e.mozGetUserMedia||e.msGetUserMedia,e.getUserMedia({audio:!0},e=>{const n=t.context;this.srcNode=n.createMediaStreamSource(e);let s=t;s.custom&&s.anode&&(s=s.anode),this.srcNode.connect(s),this.dstNode=t,this.stream=e},t=>console.error(t))}disconnect(){this.srcNode.disconnect(this.dstNode)}}},function(t,e,n){"use strict";e.a=class{constructor(t,e=60,n=.1){this.running=!1,this.ac=t,this.noteDuration=0,this.nextNoteTime=0,this.bpm=e,this.ahead=n}get bpm(){return this._bpm}set bpm(t){this._bpm=t,this.nextNoteTime-=this.noteDuration,this.noteDuration=15/this._bpm,this.nextNoteTime+=this.noteDuration}start(t){this.running||(this.running=!0,t&&(this.cb=t),this.nextNoteTime=this.ac.currentTime,this.tick())}stop(){this.running=!1}tick(){if(this.running)for(requestAnimationFrame(this.tick.bind(this));this.nextNoteTime<this.ac.currentTime+this.ahead;)this.cb&&this.cb(this.nextNoteTime),this.nextNoteTime+=this.noteDuration}}},function(t,e,n){"use strict";var s=n(2);e.a=class{constructor(t,e,n,s){this.pressed=[],this.released=[],this.voices=[];for(let a=0;a<n;a++)this.voices.push(new o(t,e,s)),this.released.push(a);this.portamento=this.voices[0].synth.portamento,e.keyboard&&e.keyboard.portamento&&(this.portamento.time=e.keyboard.portamento);for(let t=1;t<n;t++)this.voices[t].synth.portamento=this.portamento}noteOn(t,e=1,n){const s=this.findVoice(),o=this.voices[s];this.pressed.push(s),o.noteOn(t,e,n)}noteOff(t,e=1,n){for(let s=0;s<this.voices.length;s++){const o=this.voices[s];if(o.lastNote==t){o.noteOff(t,e,n),this.released.push(s);break}}}allNotesOff(){for(const t of this.voices)t.lastNote&&t.noteOff(t.lastNote)}findVoice(){let t;if(this.released.length>0)t=this.released;else{if(!(this.pressed.length>0))throw"This should never happen";t=this.pressed}return t.splice(0,1)[0]}close(){for(const t of this.voices)t.close()}};class o{constructor(t,e,n){this.loader=new class{constructor(){this.nodes=[]}load(t,e,n){const o=new s.b(t);let i=0;for(const t of e.nodes)this.nodes[i++]=new a(t.id);for(let t=0;t<e.nodes.length;t++)for(const n of e.nodes[t].inputs)this.nodes[t].inputs.push(this.nodeById(n));for(let t=0;t<e.nodes.length;t++){const s=e.nodeData[t].type;"out"==s?o.initOutputNodeData(this.nodes[t],n):o.initNodeData(this.nodes[t],s),o.json2NodeData(e.nodeData[t],this.nodes[t])}for(const t of this.nodes)for(const e of t.inputs)o.connectNodes(e,t);return this.synth=o,o}nodeById(t){for(const e of this.nodes)if(e.id===t)return e;return null}close(){for(const t of this.nodes)for(const e of t.inputs)this.synth.disconnectNodes(e,t)}},this.synth=this.loader.load(t,e,n||t.destination),this.lastNote=0}noteOn(t,e=1,n){this.synth.noteOn(t,e,n),this.lastNote=t}noteOff(t,e=1,n){this.synth.noteOff(t,e,n),this.lastNote=0}close(){this.lastNote&&this.noteOff(this.lastNote,1),this.loader.close()}}e.b=o;class a extends s.a{constructor(t){super(),this.id=t,this.inputs=[]}getInputs(){return this.inputs}}},,,,,,,,,,,,,function(t,e,n){t.exports=n(22)},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var s=n(8),o=n(7);const a=window;a.Modulator=a.Modulator||{},a.Modulator.Instrument=s.a,a.Modulator.Voice=s.b,a.Modulator.Timer=o.a}]);