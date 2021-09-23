FROM node:12.18.1
LABEL maintainer="ezPAARSE Team <ezpaarse@couperin.org>"

ARG ANG_EZPAARSE_URL
ARG ANG_TRELLO_BOARDID
ARG ANG_BADGES_ENABLED

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
