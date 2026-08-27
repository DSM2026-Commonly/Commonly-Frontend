import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { loadMergedEnvDefine } from '../../vite.env.ts'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
// 모노레포 루트 .env* 와 이 앱 폴더의 .env* 를 병합해 주입한다(앱 폴더 값이 우선).
export default defineConfig(({ mode }) => ({
  define: loadMergedEnvDefine(mode, fileURLToPath(new URL('.', import.meta.url))),
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
}))
