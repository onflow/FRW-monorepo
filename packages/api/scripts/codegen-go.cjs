const { codegen } = require('swagger-axios-codegen')
const path = require('path');
const servicePath = path.resolve(__dirname, '../src/codgen');
codegen({
  methodNameMode: 'path',
  // remoteUrl: 'https://dev.lilico.app/swagger/doc.json', // go dev env
  // remoteUrl: 'https://lilico.app/swagger.json',
  source: require('../go_swagger.json'),
  outputDir: servicePath,
  fileName: 'goService.ts',
})
