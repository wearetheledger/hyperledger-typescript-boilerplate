#!/bin/bash

echo "CLEANING CODE"

cd ./api-service/
yarn format
cd ..
cd ./authentication-service/
yarn format
cd ..
cd ./chain-service/
yarn format
cd ..
cd ./log-service/
yarn format


