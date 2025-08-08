/**
 * Simple Metro transformer to replace import.meta references
 * This handles third-party packages that use import.meta.env which is not supported in React Native
 */
const upstreamTransformer = require('@react-native/metro-babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Replace import.meta references before babel transformation
  const transformedSrc = src
    .replace(/import\.meta\.env\.MODE/g, JSON.stringify(process.env.NODE_ENV || 'development'))
    .replace(
      /import\.meta\.env/g,
      JSON.stringify({
        MODE: process.env.NODE_ENV || 'development',
        NODE_ENV: process.env.NODE_ENV || 'development',
      })
    )
    .replace(
      /import\.meta/g,
      JSON.stringify({
        env: {
          MODE: process.env.NODE_ENV || 'development',
          NODE_ENV: process.env.NODE_ENV || 'development',
        },
      })
    );

  return upstreamTransformer.transform({
    src: transformedSrc,
    filename,
    options,
  });
};
