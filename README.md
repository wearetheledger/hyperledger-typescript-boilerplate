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
- Example Authentication using [Auth0](https://auth0.com/)
- Automatic attribute based access crontrol using auth0



## Installation

In order for this application to run properly and handle invokes concurrently, you should have set up an account on AWS to be able to use the AWS SQS Service. 
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

- switch to nestjs microservices
- use of redis queue instead of SQS
- ci pipeline config for gitlab & kubernetes on google cloud
- graphql integration
- auth mock to circumvent Auth0 for rapid prototyping

## Contributing

1. Fork it! 🍴
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request 😁 🎉

## Credits

- Developer - Jonas ([@Superjo149](https://github.com/Superjo149))
- Developer - Jo ([@jestersimpps](https://github.com/jestersimpps))
- Company - TheLedger ([theledger.be](https://theledger.be))

## License
The MIT License (MIT)

Copyright (c) 2018 TheLedger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
