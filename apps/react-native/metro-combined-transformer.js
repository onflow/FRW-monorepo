/**
 * Combined Metro transformer that handles both SVG transformation and import.meta references
 */
const svgTransformer = require('react-native-svg-transformer');
const upstreamTransformer = require('@react-native/metro-babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Handle SVG files
  if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options });
  }

  // Replace import.meta references for other files
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
