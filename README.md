<center>

![](https://cdn-images-1.medium.com/max/1200/1*2646BxDq2ICh_oNFPolAXQ.jpeg)

# Hyperledger Typescript Boilerplate 

[![Build Status](https://travis-ci.org/wearetheledger/hyperledger-typescript-boilerplate.svg?branch=master)](https://travis-ci.org/wearetheledger/hyperledger-typescript-boilerplate)

</center>

### This is a starter template that interacts between Hyperledger Fabric Peers and a front end. Currently, this boilerplate provides the following features:

- Express backend built with typescript using [Nest](https://github.com/kamilmysliwiec/nest) 
- Restful routing to connect a custom frontend
- Automatic OpenAPI (Swagger) generation
- Hyperledger Fabric Client request abstraction inspired by [CQRS]
(https://martinfowler.com/bliki/CQRS.html)
- Frontend chain transaction notifications using [Pusher](https://pusher.com)
- Solves Hyperledger [concurrency issues](https://medium.com/wearetheledger/hyperledger-fabric-concurrency-really-eccd901e4040) by using a FIFO AWS SQS queue.


## Installation

In order for this application to run, you should have set up an account on AWS to be able to use the AWS SQS Service. A [Pusher](https://pusher.com) account is also required if you want to make use of transaction event handling in a frontend.
[Auth0](https://auth0.com/) is currently under development (`authentication` branch) and will require Auth0 credentials.

Be sure to have an up to date node.js configuration:
```
    "engines": {
        "node": "^8",
        "npm": "^5.6"
    }
```
Install dependencies

`npm i`

## Starting the app


`npm start`

## E2E Tests using Jest (wip)

`npm test`


### Work in progress and future plans:

- Further Refactoring of the Hyperledger Fabric SDK abstraction layer using Typescript (WIP)
- Multifactor Authentication using [Auth0](https://auth0.com/) (WIP)
- Proper E2E Testing using [Jest](https://facebook.github.io/jest/), supertest and [Jasmine](https://jasmine.github.io/) (WIP)
- Proper Error Handling and integration of 3rd party logging service
- Websocket integration to replace pusher
- Proper CQ resposibility separation
- Static page generator using [pug](https://pugjs.org/api/getting-started.html)
- Makefile generator to choose between static pages or headless api.

** Feel free to contribute or make suggestions. **





