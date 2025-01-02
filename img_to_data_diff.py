import os
import urllib.parse
from difflib import get_close_matches

# File paths
directories_file = "directories.txt"
not_found_file = "404_files_list.txt"

# Read files
with open(directories_file, "r") as f:
    directories = [line.strip() for line in f.readlines()]

with open(not_found_file, "r") as f:
    not_found = [line.strip() for line in f.readlines()]

# Normalize paths (decode URL encoding)
decoded_not_found = [urllib.parse.unquote(item).split("_collage")[0].strip() for item in not_found]
normalized_dirs = [os.path.basename(dir).replace("_collage", "").strip() for dir in directories]

# Match and suggest corrections
suggestions = {}
for item in decoded_not_found:
    matches = get_close_matches(item, normalized_dirs, n=1, cutoff=0.6)
    suggestions[item] = matches[0] if matches else "No match found"

# Output suggestions
with open("suggestions.txt", "w") as output:
    for key, value in suggestions.items():
        if value != "No match found":
            output.write(f"404 Item: '{key}' -> Suggested Directory: '{value}'\n")
        else:
            output.write(f"404 Item: '{key}' has no match in directories.\n")

# Generate renaming instructions for mismatched directories
rename_instructions = []
for key, value in suggestions.items():
    if value != "No match found" and key != value:
        rename_instructions.append(f"mv '{value}_collage' '{key}_collage'")

# Save rename script
with open("rename_directories.sh", "w") as script:
    script.write("#!/bin/bash\n")
    script.writelines("\n".join(rename_instructions) + "\n")

print("Suggestions saved in 'suggestions.txt'.")
print("Rename script 'rename_directories.sh' created. Review and run it to update directories.")