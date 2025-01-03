#!/bin/bash
# Rename files in directories after directory parent folder name
# Base directory containing converted_collages
base_dir=~/work_hub/jackie_sumell/jackie_sumell_web/jackie_collage_integration/data/converted_collages

# Loop through all directories in the base directory
for dir in "$base_dir"/*/; do
    # Get the folder name
    folder_name=$(basename "$dir")
    
    # Initialize an image counter
    counter=0
    
    # Loop through all numbered PNG files in the directory
    for file in "$dir"/*.png; do
        if [ -f "$file" ]; then
            # Create a new file name based on the folder name and image counter
            new_name="${folder_name}-${counter}.png"

            # Rename the file
            mv "$file" "$dir/$new_name"
            echo "Renamed $file to $new_name"

            # Increment the counter
            ((counter++))
        fi
    done
done

echo "Renaming complete!"