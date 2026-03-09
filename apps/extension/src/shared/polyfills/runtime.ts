import { Buffer } from 'buffer';
import process from 'process/browser';

const globalScope = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
  process?: typeof process;
};

if (!globalScope.Buffer) {
  globalScope.Buffer = Buffer;
}

if (!globalScope.process) {
  globalScope.process = process;
}
