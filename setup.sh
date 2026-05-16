#!/bin/bash
# HMI Map Pipeline — Setup Script
# Ubuntu 22.04+ recommended, 8GB RAM minimum

set -e

echo "=========================================="
echo "  HMI Map Pipeline — Auto Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check OS
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${YELLOW}Warning: This script is designed for Linux Ubuntu${NC}"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Installing..."
    sudo apt-get install -y python3 python3-pip
fi

echo -e "${GREEN}[1/5]${NC} Updating packages..."
sudo apt-get update -qq

echo -e "${GREEN}[2/5]${NC} Installing Node.js dependencies..."
cd "$(dirname "$0")"
npm install

echo -e "${GREEN}[3/5]${NC} Installing Python dependencies..."
pip3 install --upgrade ezdxf Pillow numpy

echo -e "${GREEN}[4/5]${NC} Installing PM2..."
sudo npm install -g pm2

echo -e "${GREEN}[5/5]${NC} Starting application with PM2..."
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo -e "${GREEN}=========================================="
echo "  Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Access the application:"
echo "  Production: http://localhost:4003"
echo "  Dev:        http://localhost:5175"
echo ""
echo "Useful commands:"
echo "  pm2 status        — Check status"
echo "  pm2 logs          — View logs"
echo "  pm2 restart all   — Restart"
echo ""