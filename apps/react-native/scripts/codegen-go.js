const { codegen } = require('swagger-axios-codegen');
codegen({
  methodNameMode: 'path',
  // remoteUrl: 'https://dev.lilico.app/swagger/doc.json', // dev env
  // remoteUrl: 'https://lilico.app/swagger.json',
  source: require('../go_swagger.json'),
  outputDir: 'src/network/codgen',
  fileName: 'goService.ts',
});
