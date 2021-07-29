FROM node:14.15.5-alpine3.13 AS front
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"
ARG API_URL
WORKDIR /front
COPY ./front/package*.json ./
RUN npm ci --only=production
COPY ./front/ ./
RUN npm run build

FROM nginx:1.20.1
COPY --from=front /front/dist /usr/share/nginx/html