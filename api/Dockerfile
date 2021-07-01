FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm ci --only=production
COPY . .

ENTRYPOINT ["npm", "start"]