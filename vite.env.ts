import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

/**
 * 모노레포 루트의 .env* 와 앱 폴더의 .env* 를 함께 읽어 병합한다.
 * 우선순위: 셸/컨테이너 환경 변수 > apps/<app>/.env* > 루트 .env*
 * 결과는 Vite `define` 형태로 반환되며 import.meta.env.VITE_* 로 노출된다.
 */
export function loadMergedEnvDefine(mode: string, appDir: string) {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))
  const merged = {
    ...loadEnv(mode, rootDir, 'VITE_'),
    ...loadEnv(mode, appDir, 'VITE_'),
  }
  return Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ]),
  )
}
