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

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist: $SOURCE_DIR" >&2
    exit 1
fi

echo "Processing source directory: $SOURCE_DIR"

# Process all NV* directories
find "$SOURCE_DIR" -type d -name "NV*" | while IFS= read -r dir; do
    echo "Checking directory: $dir"
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "psd_tests" ]; then
        # Loop through subdirectories
        for sub_dir in "$dir"/*/; do
            echo "Processing subdirectory: $sub_dir"
            if [ -d "$sub_dir" ]; then
                # Create corresponding directory in the destination
                dest_sub_dir="$OUTPUT_DIR/$(basename "$dir")/$(basename "$sub_dir")"
                echo "Creating destination subdirectory: $dest_sub_dir"
                mkdir -p "$dest_sub_dir" || {
                    echo "Error: Failed to create destination subdirectory: $dest_sub_dir" >&2
                    continue
                }

                # Find and convert PSD files
                find "$sub_dir" -type f -name "*.psd" -print0 | while IFS= read -r -d '' psd; do
                    base=$(basename "$psd" .psd)
                    echo "Converting $psd to PNG format"
                    if ! magick -dispose Background "$psd" -layers coalesce "$dest_sub_dir/${base}-%d.png"; then
                        echo "Error: Failed to convert file: $psd" >&2
                        continue
                    fi
                done
            fi
        done
    fi
done