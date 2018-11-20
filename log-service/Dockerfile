FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD ./package.json /usr/src/app/
RUN yarn

ADD . /usr/src/app

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]