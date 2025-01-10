#!/bin/bash
set -x  # Enable command tracing
set -e  # Exit on error

# Create a base directory for the output
OUTPUT_DIR=~/work_hub/jackie_sumell/jackie_sumell_web/jackie_collage_integration/data/new_vine_collages_raw
echo "Creating output directory: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR" || {
    echo "Error: Failed to create output directory" >&2
    exit 1
}

# Define source directory
SOURCE_DIR="/Users/jwgoedert_t2studio/work_hub/jackie_sumell/collages/dec31CollagesPlayground"

# Log files
FOUND_FILE="directories_found.txt"
PROCESSED_FILE="directories_processed.txt"

# Ensure log files exist
touch "$FOUND_FILE"
touch "$PROCESSED_FILE"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist: $SOURCE_DIR" >&2
    exit 1
fi

echo "Processing source directory: $SOURCE_DIR"

# Find all directories ending with "_collage" and log them
find "$SOURCE_DIR" -type d -name "*_collage" > "$FOUND_FILE"

# Iterate through directories
while IFS= read -r sub_dir; do
    # Skip directories already processed
    if grep -Fxq "$sub_dir" "$PROCESSED_FILE"; then
        echo "Skipping already processed directory: $sub_dir"
        continue
    fi

    echo "Processing subdirectory: $sub_dir"

    # Create corresponding directory in the destination
    dest_sub_dir="$OUTPUT_DIR/$(basename "$(dirname "$sub_dir")")/$(basename "$sub_dir")"
    echo "Creating destination subdirectory: $dest_sub_dir"
    mkdir -p "$dest_sub_dir" || {
        echo "Error: Failed to create destination subdirectory: $dest_sub_dir" >&2
        continue
    }

    # Find and convert PSD files, extracting only visible layers
    find "$sub_dir" -type f -name "*.psd" -print0 | while IFS= read -r -d '' psd; do
        base=$(basename "$psd" .psd)
        echo "Converting $psd to PNG format (visible layers only)"
        if ! magick "$psd" -dispose Background -define psd:ignore-hidden-layers=true -layers coalesce "$dest_sub_dir/${base}-%d.png"; then
            echo "Error: Failed to convert file: $psd" >&2
        fi
    done

    # Log the processed directory
    echo "$sub_dir" >> "$PROCESSED_FILE"
done < "$FOUND_FILE"

echo "Script completed. Processed directories are logged in $PROCESSED_FILE"