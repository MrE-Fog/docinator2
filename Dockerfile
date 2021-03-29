#
# Build the CLI

FROM node:latest as builder

WORKDIR /docinator

COPY *.json *.md ./
COPY src/ src
COPY lib/ lib
COPY docs/ docs

RUN set -e && \
    export NPM_CONFIG_PREFIX=~/.npm-global && \
    npm install --unsafe-perm 

# 
# Build the host container

FROM openjdk:15-jdk-alpine

COPY --from=builder /docinator /docinator

WORKDIR /docinator

RUN apk add --no-cache nodejs npm graphviz ttf-droid bash ttf-droid-nonlatin
RUN npm run build
RUN npm install -g .

WORKDIR /data

EXPOSE 1313:1313

ENTRYPOINT [ "docinator" ]
