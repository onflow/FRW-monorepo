module.exports = {
  dependencies: {
    '@outblock/react-native-code-push': {
      platforms: {
        ios: {
          // Override to remove invalid sharedLibraries configuration
          podspecPath: '../node_modules/@outblock/react-native-code-push/CodePush.podspec',
          configurations: [],
          scriptPhases: []
        },
      },
    },
  },
};