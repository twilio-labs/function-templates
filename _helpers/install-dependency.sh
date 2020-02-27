#!/bin/bash

echo "Installing dependency in template"
npm install $2 --no-package-lock --prefix $1
echo "Installing dependency locally"
npm install --save-dev $2