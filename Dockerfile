FROM node:11-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
RUN apk update && apk upgrade && apk add git
RUN apk add python make g++

COPY . /usr/src/app/
COPY ./config.json.dist /usr/src/app/config.json
RUN npm install

EXPOSE 3000

# start command
CMD [ "npm", "start" ]
