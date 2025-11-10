/**
 * @format
 */

// Polyfill Buffer for React Native (required by some crypto libraries)
import { Buffer } from 'buffer';
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer;
}
// Also set on window for compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Import array extensions FIRST before any other imports
import '@onflow/frw-utils';

// import CodePush from '@revopush/react-native-code-push';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

// Wrap App component with CodePush
// const CodePushApp = CodePush({
//   checkFrequency: CodePush.CheckFrequency.ON_APP_START,
//   installMode: CodePush.InstallMode.IMMEDIATE,
// })(App);

AppRegistry.registerComponent(appName, () => App);
