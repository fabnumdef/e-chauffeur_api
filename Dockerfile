FROM node:11-stretch-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y git python make g++ locales

# Set timezone
RUN echo "Europe/Paris" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

# Uncomment fr_FR.UTF-8 for inclusion in generation
RUN sed -i 's/^# *\(fr_FR.UTF-8\)/\1/' /etc/locale.gen

# Generate locale
RUN locale-gen

COPY . /usr/src/app/
COPY ./config.json.dist /usr/src/app/config.json
RUN npm install --only=production

EXPOSE 3000

# start command
CMD [ "npm", "start" ]
