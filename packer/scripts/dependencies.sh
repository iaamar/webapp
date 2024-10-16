#!/bin/bash
set -e

# Update and install prerequisites
sudo apt-get update -y
sudo apt-get install -y curl gnupg2

# Add NodeSource PPA for the latest stable version of Node.js (replace version as needed)
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
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