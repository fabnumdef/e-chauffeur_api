FROM node:11-stretch-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y git python make g++ locales

# Add full-icu
RUN npm install --unsafe-perm -g full-icu > /dev/null 2>&1
ENV NODE_ICU_DATA="/usr/local/lib/node_modules/full-icu"

# Set timezone
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

COPY . /usr/src/app/
COPY ./config.json.dist /usr/src/app/config.json
RUN npm install --only=production

EXPOSE 3000

# start command
CMD [ "npm", "start" ]
