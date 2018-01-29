FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
COPY .env.prod /usr/src/app/.env

EXPOSE 3000
CMD ["npm", "run", "start:prod"]