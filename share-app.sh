#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Zappy Health App Sharing Tool ===${NC}"
echo -e "${YELLOW}This script will start your React app and create a public URL to share it.${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}ngrok is not installed. Installing it now...${NC}"
    npm install -g ngrok
    
    # Check if installation was successful
    if ! command -v ngrok &> /dev/null; then
        echo -e "${RED}Failed to install ngrok. Please install it manually:${NC}"
        echo "npm install -g ngrok"
        exit 1
    fi
fi

# Start the React app in the background
echo -e "${BLUE}Starting React development server...${NC}"
npm start &
REACT_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for the React app to start (this may take a moment)...${NC}"
sleep 15

# Start ngrok
echo -e "${BLUE}Creating public URL with ngrok...${NC}"
echo -e "${YELLOW}Your app will be available at the URL shown below:${NC}"
echo ""
ngrok http 3000

# When ngrok is closed, also stop the React app
kill $REACT_PID
