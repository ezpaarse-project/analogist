FROM node:14.15.5-alpine3.13 AS front
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"
ARG API_URL
WORKDIR /front
COPY ./front/package*.json ./
RUN npm ci --only=production
COPY ./front/ ./
RUN npm run generate

FROM node:14.15.5-alpine3.13 AS docs
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"
WORKDIR /docs
COPY ./docs/package*.json ./
RUN npm ci --only=production
COPY ./docs/ ./
RUN npm run generate

FROM nginx:1.20.1
COPY --from=front /front/dist /usr/share/nginx/html
COPY --from=docs /docs/dist /usr/share/nginx/html/doc