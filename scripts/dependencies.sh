#!/bin/bash

set -e

echo 'Configuring dependencies'
# Update package list
sudo apt-get update
# Install curl
sudo apt install -y curl
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
sudo apt-get install -y nodejs
# Install npm
sudo npm install -g npm@latest
# Install TypeScript
sudo npm install -g typescript ts-node
# Install unzip
sudo apt-get install -y unzip

echo 'Dependencies configuration completed'