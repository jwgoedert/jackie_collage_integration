# Create a base directory for the output
mkdir -p ~/work_hub/jackie_sumell/jackie_sumell_web/jackie_collage_integration/data/converted_collages

# Loop through all directories in the source
for dir in /Users/jwgoedert_t2studio/work_hub/jackie_sumell/collages/dec31CollagesPlayground/*/; do
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "psd_tests" ]; then
        # Create corresponding directory in the destination
        dest_dir=~/work_hub/jackie_sumell/jackie_sumell_web/jackie_collage_integration/data/converted_collages/"$(basename "$dir")"
        mkdir -p "$dest_dir"
        
        # Find and convert PSD files
        find "$dir" -name "*.psd" -exec sh -c '
            for psd; do
                base=$(basename "$psd" .psd)
                dest_dir="'$dest_dir'"
                magick -dispose Background "$psd" -layers coalesce "$dest_dir/${base}-%d.png"
            done
        ' sh {} +
    fi
done
