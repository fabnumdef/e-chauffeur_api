FROM node:12-stretch-slim as base
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

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN npm install --only=production

FROM base

RUN GRPC_HEALTH_PROBE_VERSION=v0.2.0 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . /usr/src/app/
COPY ./config.json.dist ./config.json

EXPOSE 1337

CMD [ "npm", "run", "serve" ]
