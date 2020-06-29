FROM node:12.18.1
MAINTAINER ezPAARSE Team <ezpaarse@couperin.org>

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
