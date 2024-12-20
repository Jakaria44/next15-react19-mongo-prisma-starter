#!/bin/bash

# Find all .ts and .tsx files recursively and display their content
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sh -c '
    for file do
        echo "// $file //"
        cat "$file"
        echo
    done
' sh {} +
