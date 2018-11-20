#!/bin/bash

echo "INSTALLING DEPENDENCIES"

cd ./api-service/
yarn
cd ..
cd ./authentication-service/
yarn
cd ..
cd ./chain-service/
yarn
cd ..
cd ./log-service/
yarn
