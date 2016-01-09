/**
 * Library that exports the Instrument and Voice classes
 */
import { Instrument, Voice } from './synth/instrument';
import { Timer } from './synth/timer';

const global: any = window;
global.Modulator = global.Modulator || {};

global.Modulator.Instrument = Instrument;
global.Modulator.Voice = Voice;
global.Modulator.Timer = Timer;
