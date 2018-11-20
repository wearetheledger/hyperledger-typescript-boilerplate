#!/bin/bash

echo "CLEANING DEPENDENCIES"

cd ./api-service/
rm -rf node_modules
cd ..
cd ./authentication-service/
rm -rf node_modules
cd ..
cd ./chain-service/
rm -rf node_modules
cd ..
cd ./log-service/
rm -rf node_modules


