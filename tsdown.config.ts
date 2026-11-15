// Reproduces the official clientBundle preset (packages/client/tsdown.client.ts),
// which is not published. The browser half must register itself through
// window.__ModuleLoader__.load or the page never materializes it.
import type { UserConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-delegate'

// The frozen module table the running shell seeds (0.2.2-rc.2, read from the
// installed web bundle's staticModules). Anything else must be inlined.
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  'zod',
  '@tanstack/react-virtual',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
]

const requested = (id: string) => PLATFORM_MODULES.includes(id)

export default {
  entry: { client: 'client.js' },
  outDir: 'lib',
  format: 'cjs',
  // cjs ignores the top-level platform, so the browser target goes here.
  inputOptions: { platform: 'browser' },
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: requested,
    alwaysBundle: (id: string) => (requested(id) ? undefined : true),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  plugins: [{
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (requested(source)) return null
      throw new Error(
        `client bundle purity: "${source}" is not a platform module — ` +
        'cross-plugin value imports are forbidden; collaborate through cordis services ' +
        '(type-only imports are erased and never reach this gate)',
      )
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
} satisfies UserConfig
