FROM node:22-alpine

RUN apk add --no-cache bash ca-certificates chromium freetype nss mariadb-client mariadb-connector-c && \
    npm install -g npm@latest # Fix bug in Node 22 Docker image with pre-installed npm version 10.9.0 (see: https://github.com/npm/cli/issues/7814)

WORKDIR /app

RUN mkdir -p ./node_modules && chown -R node:node ./node_modules

USER node

ENV RUNNING_IN_DOCKER=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENTRYPOINT ["/app/start.sh"]
