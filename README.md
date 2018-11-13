<center>

![](https://cdn-images-1.medium.com/max/1200/1*2646BxDq2ICh_oNFPolAXQ.jpeg)

# [Hyperledger Typescript Boilerplate ](https://medium.com/wearetheledger/hyperledger-fabric-typescript-boilerplate-455004d0c6c8)

## Note: This boilerplate has been designed for quickstarting prototype applications. Some practices used in this boilerplate are not recommended for a production environment.

[![Build Status](https://travis-ci.org/wearetheledger/hyperledger-typescript-boilerplate.svg?branch=master)](https://travis-ci.org/wearetheledger/hyperledger-typescript-boilerplate) [![Greenkeeper badge](https://badges.greenkeeper.io/wearetheledger/hyperledger-typescript-boilerplate.svg)](https://greenkeeper.io/)

</center>

### This is a starter template that interacts between Hyperledger Fabric Peers and a front end. Currently, this boilerplate provides the following features:

- Connects out of the box with the [fabcar sample network](https://github.com/hyperledger/fabric-samples/tree/release/fabcar)
- Express backend built with typescript using [Nest](https://github.com/kamilmysliwiec/nest) 
- Restful routing to connect a custom frontend
- Automatic OpenAPI (Swagger) generation
- Fabric Client and Fabric Ca CLient abstraction
(https://martinfowler.com/bliki/CQRS.html)
- Frontend chain transaction notifications using [Pusher](https://pusher.com)
- Solves Hyperledger [concurrency issues](https://medium.com/wearetheledger/hyperledger-fabric-concurrency-really-eccd901e4040) by using a FIFO AWS SQS queue.
- Example Authentication using [Auth0](https://auth0.com/)
- Automatic attribute based access crontrol using auth0



## Installation

In order for this application to run properly and handle invokes concurrently, you should have set up an account on AWS to be able to use the AWS SQS Service. 
During development, the SQS Queue can be bypassed using an environment variable: BYPASS_QUEUE=1
A [Pusher](https://pusher.com) account is also required if you want to make use of transaction event handling in a frontend.
[Auth0](https://auth0.com/) will require Auth0 credentials.

Be sure to have an up to date node.js configuration:
```
    "engines": {
        "node": "^8.9",
        "npm": "^5.6"
    }
```

### Install dependencies

`npm i`

### Starting the app

`npm start`

### E2E Tests using Jest (wip)

`npm test`

## Work in progress and future plans:

- graphql integration
- auth mock to circumvent Auth0 for rapid prototyping

**Feel free to contribute or make suggestions.**

## Get in touch
Interested in starting your own blockchain project, but don’t know how? 
Do you need help starting your token sale or having one audited? Get in touch [https://theledger.be](https://theledger.be)
