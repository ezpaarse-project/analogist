FROM node:14.15.0
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

ENTRYPOINT ["npm", "start"]