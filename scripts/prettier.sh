#!/bin/bash

echo "CLEANING CODE"

cd ./api-service/
yarn lint
yarn format
cd ..
cd ./authentication-service/
yarn lint
yarn format
cd ..
cd ./chain-service/
yarn lint
yarn format
cd ..
cd ./log-service/
yarn lint
yarn format


