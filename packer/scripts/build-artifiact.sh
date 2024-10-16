#!/bin/bash

# Ensure the app dependencies are installed
npm install

# Build the app (if needed, depending on your build process)
npm run build

# Create a ZIP of the application files
zip -r webapp.zip . -x "*.git*" "node_modules/*" "packer/aws.auto.pkrvars.hcl"

# Check if the artifact was created successfully
if [ $? -ne 0 ]; then
  echo "Failed to create artifact."
  exit 1
else
  echo "Application artifact built successfully."
fi
