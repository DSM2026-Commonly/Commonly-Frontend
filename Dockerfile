# syntax=docker/dockerfile:1

ARG BUN_VERSION=1.3.14

FROM oven/bun:${BUN_VERSION}-alpine AS builder

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps/admin-web/package.json apps/admin-web/package.json
COPY apps/civil-web/package.json apps/civil-web/package.json
COPY apps/user-web/package.json apps/user-web/package.json
COPY packages/hooks/package.json packages/hooks/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json

RUN bun install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages

ARG APP_NAME
RUN case "${APP_NAME}" in \
      admin-web|civil-web|user-web) ;; \
      *) echo "Unsupported APP_NAME: ${APP_NAME}" >&2; exit 1 ;; \
    esac \
    && bun run --cwd "apps/${APP_NAME}" build

FROM nginx:alpine AS runtime

ARG APP_NAME

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
