#!/usr/bin/env bash

# Helper script to serve up this directory using the Docker build...
# Assumes that you've already done the docker build stuffs, and called your image `docinator`

docker run -v "$(pwd):/data" -p 1313:1313 -ti docinator serve
