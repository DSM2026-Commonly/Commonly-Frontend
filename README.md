# React + TypeScript + Vite

## 로컬 환경 변수

저장소 루트의 `.env.local`에 값을 넣으면 세 앱 빌드에 함께 주입됩니다.
`.env.local`은 커밋되지 않습니다.

```sh
VITE_API_BASE_URL=https://commonly-be.iswebj.kr
VITE_JUSO_CONFM_KEY=도로명주소_검색_API_승인키
```

`VITE_*` 값은 빌드 시점에 번들에 인라인되므로, 값을 바꾸면 dev 서버 재시작
또는 재빌드가 필요합니다. 도로명주소 승인키 발급 방법은
[`deploy/PORTAINER.md`](deploy/PORTAINER.md#도로명주소-검색-api-승인키)에
정리되어 있습니다.

## Deployment

세 웹 앱을 Portainer Stack으로 배포하는 방법은
[`deploy/PORTAINER.md`](deploy/PORTAINER.md)를 참고하세요.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
