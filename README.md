# Hyperledger Typescript Boilerplate

This is a starter template that interacts between Hyperledger Fabric Peers and a front end.

- Express backend built with typescript using [Nest](https://github.com/kamilmysliwiec/nest) 
- Restful routing to connect a custom frontend
- Automatic OpenAPI (Swagger) generation
- Multifactor Authentication using [Auth0](https://auth0.com/) (WIP)
- Hyperledger Fabric Client request abstraction using the [CQRS](https://martinfowler.com/bliki/CQRS.html) (Command Query Responsibility Segregation) pattern
- An effort in solving Hyperledger [concurrency issues](https://medium.com/wearetheledger/hyperledger-fabric-concurrency-really-eccd901e4040) by using a FIFO AWS SQS queue.
- Frontend chain transaction notifications using [Pusher](https://pusher.com/?campaignid=916184871&adgroupid=48337812880&adid=217428038527&gclid=Cj0KCQiA-qDTBRD-ARIsAJ_10yLsdRDk9ENtvg0ZtTnxQzQxKD-jIQ5vpNFWAp2UgG2X7lDlc0y3yzgaAl2bEALw_wcB)
- Unit Testing with [Jest](https://facebook.github.io/jest/) and [Jasmine](https://jasmine.github.io/) (WIP)

