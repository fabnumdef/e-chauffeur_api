FROM node:13-stretch-slim as base
FROM base as builder

RUN apt update && apt upgrade -y
RUN apt install -y \
    python \
    make \
    g++ \
    locales

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --unsafe-perm -g full-icu > /dev/null 2>&1
ENV NODE_ICU_DATA="/usr/local/lib/node_modules/full-icu"

RUN npm install --only=production

FROM base

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . /usr/src/app/
COPY ./config.json.dist ./config.json

EXPOSE 1337

CMD [ "npm", "run", "serve" ]
