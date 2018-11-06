for file in *.png; do
     convert "$file" "$(basename "$file" .png).pdf"
done
