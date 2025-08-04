const { codegen } = require('swagger-axios-codegen')
const path = require('path');
const servicePath = path.resolve(__dirname, '../src/codgen');

codegen({
  methodNameMode: 'path',
  // remoteUrl: 'https://test.lilico.app/swagger.json', // dev env
  // remoteUrl: 'https://lilico.app/swagger.json',
  source: require('../js_swagger.json'),
  outputDir: servicePath,
  fileName: 'service.ts',
})

