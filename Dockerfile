# --- Base Node ---
FROM node:boron AS base
RUN mkdir -p /var/www
RUN mkdir -p /var/log/portal-service
ADD package.json /var/www

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:

# --- Dependencies ---
FROM base AS dependencies
COPY . /tmp/
RUN cd /tmp && npm install --only=production
RUN cp -R /tmp/node_modules /tmp/prod_node_modules
RUN cd /tmp && npm install

# --- Build ---
FROM dependencies AS build
COPY ./src /tmp/src
RUN cd /tmp && npm run build
COPY ./src/config/creds /tmp/dist/config/creds

# --- Release ---
FROM base AS release
WORKDIR /var/www
# create empty .env file for dotenv lib
RUN touch .env
COPY --from=dependencies /tmp/prod_node_modules ./node_modules
COPY --from=build /tmp/dist ./dist

VOLUME /var/log/portal-service
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]





