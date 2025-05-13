#!/bin/bash

# Set the project directory path (use absolute path)
PROJECT_DIR="/Users/hieuho/agent-twitter-client"
# Log file location
LOG_FILE="$PROJECT_DIR/logs/scraper-$(date +\%Y-\%m-\%d).log"
# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

# Navigate to project directory
cd "$PROJECT_DIR" || { echo "Failed to navigate to project directory"; exit 1; }

# Log start time
echo "=======================================" >> "$LOG_FILE"
echo "Starting Twitter feed scrape at $(date)" >> "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"

# Run the scraper with Node.js
/usr/local/bin/node scrape-latest.js >> "$LOG_FILE" 2>&1

# Log completion
echo "=======================================" >> "$LOG_FILE"
echo "Completed Twitter feed scrape at $(date)" >> "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"

# Optional: Keep only the last 30 days of logs
find "$PROJECT_DIR/logs" -name "scraper-*.log" -type f -mtime +30 -delete 