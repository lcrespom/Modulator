import { PianoKeys } from './piano/piano'

console.log('Hello from tracker');
const pk = new PianoKeys(24);
const keys = pk.createKeys($('#piano'));
