FROM node:0.12-wheezy
MAINTAINER ezPAARSE Team <ezpaarse@couperin.org>

ENV ANALOGIST_DIR /opt/analogist
ENV DEBIAN_FRONTEND noninteractive

USER root

RUN groupadd -r analogist \
  && useradd -r -m -s /bin/bash -g analogist analogist \
  && mkdir -p $ANALOGIST_DIR \
  && chown -R analogist:analogist $ANALOGIST_DIR

USER analogist

WORKDIR $ANALOGIST_DIR

RUN git clone https://github.com/ezpaarse-project/analogist.git . \
  && npm install --production \
  && npm install bower \
  && ./node_modules/.bin/bower install --config.interactive=false \
  && npm uninstall bower \
  && npm cache clean

expose 3000
CMD ["npm", "start"]
