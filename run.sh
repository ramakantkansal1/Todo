#!/bin/bash
# Run script for the Todo Application
# This script activates the virtual environment and starts the Flask server
# Shows all accessible URLs (localhost + LAN IP) for any network

echo "========================================="
echo "Starting Todo Application..."
echo "========================================="

# Activate virtual environment (from project root)
source venv/bin/activate

# Install dependencies if not already installed
echo "Checking dependencies..."
pip3 install -r backend/requirements.txt 2>/dev/null | tail -1

# Get the local IP address for LAN access
get_local_ip() {
    # Try multiple methods to get the local IP
    local ip=""
    
    # Method 1: route get (macOS)
    if command -v route >/dev/null 2>&1; then
        ip=$(route get 1.1.1.1 2>/dev/null | grep interface | awk '{print $2}' | xargs -I{} ifconfig {} 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    fi
    
    # Method 2: ifconfig (fallback)
    if [ -z "$ip" ]; then
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    fi
    
    # Method 3: ipconfig getifaddr (macOS specific)
    if [ -z "$ip" ] && command -v ipconfig >/dev/null 2>&1; then
        for iface in $(networksetup -listallhardwareports 2>/dev/null | grep -A1 "Wi-Fi\|WiFi" | grep "Device:" | awk '{print $2}'); do
            ip=$(ipconfig getifaddr "$iface" 2>/dev/null)
            [ -n "$ip" ] && break
        done
    fi
    
    echo "$ip"
}

LOCAL_IP=$(get_local_ip)

echo ""
echo "🌐 Access URLs:"
echo "   Local:    http://localhost:5000"
if [ -n "$LOCAL_IP" ]; then
    echo "   Network:  http://$LOCAL_IP:5000"
    echo ""
    echo "📱 For mobile/other devices on same WiFi, use the Network URL"
else
    echo "   Network:  (could not detect - check ifconfig manually)"
fi
echo ""

# Start the Flask application
echo "Starting Flask server on http://0.0.0.0:5000"
echo "Press Ctrl+C to stop"
echo "========================================="
python3 backend/app.py