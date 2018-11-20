FROM  node:8.9.4-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD ./package.json /usr/src/app/
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && yarn \
    && apk del .gyp
ADD . /usr/src/app

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]
