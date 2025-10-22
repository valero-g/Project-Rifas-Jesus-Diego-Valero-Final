#!/usr/bin/env bash
# exit on error
set -o errexit

#Añadimos el pip install pipenv
pip install pipenv

npm install
npm run build

pipenv install

pipenv run upgrade
