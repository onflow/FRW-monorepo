/**
 * @format
 */

import { AppRegistry } from 'react-native';
import CodePush from '@revopush/react-native-code-push';
import App from './src/App';
import { name as appName } from './app.json';

// Wrap App component with CodePush
const CodePushApp = CodePush({
  checkFrequency: CodePush.CheckFrequency.ON_APP_START,
  updateDialog: true,
  installMode: CodePush.InstallMode.IMMEDIATE,
})(App);

AppRegistry.registerComponent(appName, () => CodePushApp);
