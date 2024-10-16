#!/bin/bash

# Set the -e option
set -e

# Install node
curl -fsSL https://rpm.nodesource.com/setup_21.x | sudo bash -
sudo yum install -y nodejs
sudo yum install -g ts-node

# Check node version
node -v
npm -v

# install unzip
sudo yum install unzip -y

sudo apt-get update
sudo apt-get install -y nodejs npm postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql