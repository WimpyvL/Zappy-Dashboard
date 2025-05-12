#!/bin/bash

# Script to update package.json with required dependencies for the messaging system

echo "Updating package.json with required dependencies..."

# Install @tanstack/react-query
npm install @tanstack/react-query

# Install date-fns for date formatting
npm install date-fns

# Install react-toastify for notifications
npm install react-toastify

echo "Dependencies installed successfully!"
echo "You may need to restart your development server for changes to take effect."
