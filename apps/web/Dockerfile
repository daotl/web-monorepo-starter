# Reference: https://github.com/vercel/turbo/blob/63aefc821838092e583caf1881426a0d28b12556/examples/with-docker/apps/web/Dockerfile

ARG NODEJS_VERSION=18
ARG NODEJS_BUILD_IMAGE=daotl/node-gyp:9.0.0-node-18-root-git-pnpm-turborepo-alpine

FROM ${NODEJS_BUILD_IMAGE} AS builder
# Set working directory
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:${NODEJS_VERSION}-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .npmrc .npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Fix `pnpm setup` in Docker: https://github.com/pnpm/pnpm/issues/4495#issuecomment-1297010385
RUN npm install -g pnpm && \
    SHELL=bash pnpm setup && \
    pnpm install
# Alpine's way to specify a file to source on shell startup: https://stackoverflow.com/a/73954544/4923728
ENV ENV=/root/.bashrc

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=web...

FROM node:${NODEJS_VERSION}-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer --chown=nodejs:nodejs /app/apps/web/package.json ./
# COPY --from=installer --chown=nodejs:nodejs /app/apps/web/dist ./dist

CMD node apps/web/dist/index.js
