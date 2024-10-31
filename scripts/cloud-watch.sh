#!/bin/bash

# Update the package list
sudo apt update

# Install prerequisites
sudo apt install -y curl

# Download the CloudWatch Agent DEB package for Ubuntu (x86_64)
curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Install the CloudWatch Agent package
sudo dpkg -i amazon-cloudwatch-agent.deb
