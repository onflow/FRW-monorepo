/**
 * @format
 */

// Import polyfills FIRST before any other imports
import './src/utils/polyfills';

// Import array extensions
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
