// Browser polyfills for Node.js modules
import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

// Make Buffer available globally for browser compatibility
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).EventEmitter = EventEmitter;
}

// Export polyfills
export { Buffer, EventEmitter };
export default { Buffer, EventEmitter };
