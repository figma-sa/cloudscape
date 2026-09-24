// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const themes = require('../build-tools/utils/themes');
const workspace = require('../build-tools/utils/workspace');

const dirName = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirName, '..');
const react18 = process.env.REACT_VERSION === '18';
const theme = process.env.THEME || 'default';
const themeDefinition = themes.find(t => t.name === theme);
const componentsPath = path.resolve(repoRoot, themeDefinition.outputPath);
const designTokensPath = path.resolve(
  repoRoot,
  workspace.targetPath,
  themeDefinition.designTokensDir,
  themeDefinition.designTokensOutput
);
const outputPath = path.resolve(dirName, `lib/static-${theme}`);

function pagesRequireContext() {
  return {
    name: 'pages-require-context',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.split('?')[0].replace(/\\/g, '/');
      if (!normalized.endsWith('/pages/app/pages-context.ts')) {
        return;
      }
      return `
const modules = import.meta.glob('../**/*.page.tsx');

function pagesContext(pagePath) {
  const key = pagePath.replace(/^\\.\\//, '../');
  const load = modules[key];
  if (!load) {
    return Promise.reject(new Error('Unknown page: ' + pagePath));
  }
  return load();
}

pagesContext.keys = () => Object.keys(modules).map(key => key.replace(/^\\.\\.\\//, './'));

export default pagesContext;
`;
    },
  };
}

function scssAsCssModules() {
  return {
    name: 'scss-as-css-modules',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !source.split('?')[0].endsWith('.scss') || source.includes('.module.scss')) {
        return;
      }
      if (!/\.(tsx?|jsx?)$/.test(importer.split('?')[0])) {
        return;
      }
      const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
      if (!resolved || resolved.external) {
        return;
      }
      const [filepath, query] = resolved.id.split('?');
      return filepath.replace(/\.scss$/, '.module.scss') + (query ? `?${query}` : '');
    },
    load(id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.module.scss')) {
        return;
      }
      const real = file.replace(/\.module\.scss$/, '.scss');
      if (existsSync(real) && real !== file) {
        return readFileSync(real, 'utf8');
      }
    },
  };
}

function rawCodeSamples() {
  const samplesDir = path.resolve(dirName, 'code-editor/samples') + path.sep;
  return {
    name: 'raw-code-samples',
    enforce: 'pre',
    load(id) {
      const file = id.split('?')[0];
      if (!file.startsWith(samplesDir) || !existsSync(file)) {
        return;
      }
      return `export default ${JSON.stringify(readFileSync(file, 'utf8'))};`;
    },
  };
}

function copyAce() {
  return {
    name: 'copy-ace',
    closeBundle() {
      const aceDir = path.dirname(require.resolve('ace-builds/src-min-noconflict/ace'));
      cpSync(aceDir, path.resolve(outputPath, 'ace'), { recursive: true });
    },
  };
}

export default defineConfig({
  root: dirName,
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: [
      { find: /^~components/, replacement: componentsPath },
      { find: /^~design-tokens/, replacement: designTokensPath },
      {
        find: '~mount',
        replacement: path.resolve(dirName, react18 ? 'app/mount/react18.ts' : 'app/mount/react16.ts'),
      },
      ...(react18
        ? [
            { find: /^react-dom\/client$/, replacement: path.resolve(repoRoot, 'node_modules/react-dom18/client') },
            { find: /^react-dom$/, replacement: path.resolve(repoRoot, 'node_modules/react-dom18') },
            { find: /^react$/, replacement: path.resolve(repoRoot, 'node_modules/react18') },
          ]
        : []),
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        importers: [
          {
            findFileUrl(url) {
              if (url === '~design-tokens' || url.startsWith('~design-tokens/')) {
                return pathToFileURL(designTokensPath);
              }
              return null;
            },
          },
        ],
      },
    },
  },
  plugins: [pagesRequireContext(), scssAsCssModules(), rawCodeSamples(), react({ jsxRuntime: 'classic' }), copyAce()],
  server: {
    port: 8080,
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: outputPath,
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 5000,
  },
});
