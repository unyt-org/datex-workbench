#!/bin/bash

OUTPUT="business_logic_review.txt"

> "$OUTPUT"

find src \
    -type f \
    \( -name "*.ts" \) \
    | grep -v -E "(components/|assets/|router/|main\.ts|auto-imports|components\.d\.ts)" \
    | sort \
    | while read -r file; do
        echo "========== $file ==========" >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo -e "\n" >> "$OUTPUT"
    done

for file in \
    "src/App.vue" \
    "src/views/HomeView.vue" \
    "src/views/WindowGeneralView.vue" \
    "src/components/Window.vue" \
    "src/components/HeaderProvider.vue"; do
    if [ -f "$file" ]; then
        echo "========== $file ==========" >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo -e "\n" >> "$OUTPUT"
    fi
done

echo "Created $OUTPUT with business logic only"
echo "Lines of code: $(wc -l < "$OUTPUT")"
