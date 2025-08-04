module.exports = {
  presets: ["module:@react-native/babel-preset", "nativewind/babel"],
  plugins: [
    "react-native-worklets/plugin",
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@": "./src",
          "ui": "./src/components/ui",
          "icons": "./src/assets/icons",
        },
      },
    ],
  ],
};
