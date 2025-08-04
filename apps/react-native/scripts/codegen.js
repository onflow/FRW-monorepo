const { codegen } = require('swagger-axios-codegen');
codegen({
  methodNameMode: 'path',
  // remoteUrl: 'https://test.lilico.app/swagger.json', // dev env
  // remoteUrl: 'https://lilico.app/swagger.json',
  source: require('../js_swagger.json'),
  outputDir: 'src/network/codgen',
  fileName: 'service.ts',
});

// async function generateCode() {
//   // Dynamically import the ESM module
//   const { codegen } = await import('swagger-axios-codegen');
//   codegen({
//     methodNameMode: 'path',
//     remoteUrl: 'https://test.lilico.app/swagger.json', // test
//     // remoteUrl: 'https://lilico.app/swagger.json',
//     outputDir: '../src/network'
//   })
// }

// generateCode().catch(console.error);
