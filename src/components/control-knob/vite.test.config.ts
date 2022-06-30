/// <reference types="vitest" />
import * as path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import istanbul from 'vite-plugin-istanbul'

process.env.VITE_APP_VERSION = pkg.version
if (process.env.NODE_ENV === 'production') {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString()
}

export default defineConfig({
  plugins: [
    vue({
      script: {
        refSugar: true,
      },
    }),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: false,
      cypress: true,
      forceBuildInstrument: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    include: ['tests/unit/**/*.{test,spec}.ts'],
  },
})
