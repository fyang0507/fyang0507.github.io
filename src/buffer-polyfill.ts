import { Buffer } from 'buffer';

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
} 