#!/bin/bash

# Exit on error, undefined variables, and pipe failures
set -euo pipefail

# Set up logging
LOG_FILE="directory_rename.log"
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $1"
    exit 1
}

# Function to safely rename directories
rename_dir() {
    local src="$1"
    local dst="$2"
    
    if [ ! -d "$src" ]; then
        log "Warning: Source directory '$src' does not exist, skipping"
        return
    fi
    
    if [ -e "$dst" ]; then
        error "Destination '$dst' already exists"
    fi

    log "Renaming '$src' to '$dst'"
    if mv "$src" "$dst"; then
        log "Successfully renamed '$src' to '$dst'"
    else
        error "Failed to rename '$src' to '$dst'"
    fi
}

# Clear log file
> "$LOG_FILE"
log "Starting directory rename operations"

# Perform renames
rename_dir "2002 Milk, Self Portrait_collage" "2002 Milk A Self Portrait_collage"
rename_dir "2017 Working MOdel Collage" "2017 Working Model of the World_collage"
rename_dir "2021 Seeds of Resistence_collage" "2021 Seeds of Resistance_collage"
rename_dir "2024 Seeing Through Stone, San Jose_collage" "2024 Seeing Through Stone_collage"
rename_dir "2025 Freedom To Grow_collage" "2025 Freedom to Grow_collage"

log "Directory renaming completed successfully"
