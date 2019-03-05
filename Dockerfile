FROM node:11-alpine

ENV MUSL_LOCPATH="/usr/share/i18n/locales/musl"

RUN apk --no-cache add libintl && \
	apk --no-cache --virtual .locale_build add cmake make musl-dev gcc gettext-dev git && \
	git clone https://gitlab.com/rilian-la-te/musl-locales && \
	cd musl-locales && cmake -DLOCALE_PROFILE=OFF -DCMAKE_INSTALL_PREFIX:PATH=/usr . && make && make install && \
	cd .. && rm -r musl-locales && \
  apk del .locale_build

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
RUN apk update && apk upgrade && apk add git
RUN apk add python make g++

COPY . /usr/src/app/
COPY ./config.json.dist /usr/src/app/config.json
RUN npm install --only=production

EXPOSE 3000

# start command
CMD [ "npm", "start" ]
