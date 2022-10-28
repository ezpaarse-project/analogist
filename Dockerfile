FROM node:18.12.0-alpine3.16 AS builder
LABEL maintainer="ezPAARSE Team <ezteam@couperin.org>"

WORKDIR /app

COPY package.json .

RUN npm install

COPY . /app

RUN npm run build
RUN rm -rf node_modules && npm ci --omit=dev

FROM node:18.12.0-alpine3.16
LABEL maintainer="ezPAARSE Team <ezteam@couperin.org>"

WORKDIR /usr/src/app
COPY --from=builder /app .

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "npm", "start" ]
