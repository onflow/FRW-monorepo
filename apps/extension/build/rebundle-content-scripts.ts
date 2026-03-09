import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');

const common = {
  bundle: true,
  splitting: false,
  format: 'iife' as const,
  platform: 'browser' as const,
  target: 'es2020',
  sourcemap: true,
  logLevel: 'info' as const,
  absWorkingDir: projectRoot,
  tsconfig: path.resolve(projectRoot, 'tsconfig.json'),
  alias: {
    '@': path.resolve(projectRoot, 'src'),
    '@onflow/frw-analytics': path.resolve(projectRoot, '../../packages/analytics/src/index.ts'),
    '@onflow/frw-api': path.resolve(projectRoot, '../../packages/api/src/index.ts'),
    '@onflow/frw-cadence': path.resolve(projectRoot, '../../packages/cadence/src/index.ts'),
    '@onflow/frw-context': path.resolve(projectRoot, '../../packages/context/src/index.ts'),
    '@onflow/frw-icons': path.resolve(projectRoot, '../../packages/icons/src/web.ts'),
    '@onflow/frw-screens': path.resolve(projectRoot, '../../packages/screens/src/index.ts'),
    '@onflow/frw-services': path.resolve(projectRoot, '../../packages/services/src/index.ts'),
    '@onflow/frw-stores': path.resolve(projectRoot, '../../packages/stores/src/index.ts'),
    '@onflow/frw-types': path.resolve(projectRoot, '../../packages/types/src/index.ts'),
    '@onflow/frw-ui': path.resolve(projectRoot, '../../packages/ui/src/index.ts'),
    '@onflow/frw-utils': path.resolve(projectRoot, '../../packages/utils/src/index.ts'),
    '@onflow/frw-wallet': path.resolve(projectRoot, '../../packages/wallet/src/index.ts'),
    '@onflow/frw-workflow': path.resolve(projectRoot, '../../packages/workflow/src/index.ts'),
    'react-native': 'react-native-web',
    moment: 'dayjs',
  },
  define: {
    global: 'globalThis',
  },
  loader: {
    '.svg': 'dataurl' as const,
    '.png': 'dataurl' as const,
    '.jpg': 'dataurl' as const,
    '.jpeg': 'dataurl' as const,
    '.gif': 'dataurl' as const,
    '.webp': 'dataurl' as const,
    '.wasm': 'file' as const,
  },
};

async function main() {
  await build({
    ...common,
    entryPoints: [path.resolve(projectRoot, 'src/content-script/index.ts')],
    outfile: path.resolve(distDir, 'content-script.js'),
  });

  await build({
    ...common,
    entryPoints: [path.resolve(projectRoot, 'src/content-script/pageProvider/eth/index.ts')],
    outfile: path.resolve(distDir, 'pageProvider.js'),
  });

  await build({
    ...common,
    entryPoints: [path.resolve(projectRoot, 'src/content-script/script.js')],
    outfile: path.resolve(distDir, 'script.js'),
  });
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exit(1);
});
