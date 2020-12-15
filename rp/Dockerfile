FROM nginx
LABEL maintainer="ezTEAM <ezpaarse@couperin.org>"

ARG ANALOGIST_DOMAIN

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./sites-available/${ANALOGIST_DOMAIN}.conf /etc/nginx/sites-available/${ANALOGIST_DOMAIN}.conf