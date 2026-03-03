'use strict';

// Stub for react-native/Libraries/Utilities/codegenNativeComponent
// react-native-svg's Fabric (new architecture) components import this path,
// but it doesn't exist in react-native-web. These native components are never
// rendered in the extension (SVG uses the web path at runtime), so a no-op
// stub is sufficient to satisfy webpack's module resolution.
function codegenNativeComponent(_name) {
  return 'div';
}

module.exports = codegenNativeComponent;
module.exports.default = codegenNativeComponent;
