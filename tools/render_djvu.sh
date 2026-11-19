#!/bin/sh
# Render every page of a DjVu file to PNG: render_djvu.sh <djvu> <out_dir>
D="/c/Program Files (x86)/DjVuLibre"
n=$("$D/djvused.exe" "$1" -e n)
mkdir -p "$2"
for i in $(seq 1 "$n"); do
  out=$(printf "%s/p%03d.png" "$2" "$i")
  [ -f "$out" ] && continue
  "$D/ddjvu.exe" -format=tiff -page="$i" -scale=150 "$1" "$2/tmp.tif" && python -c "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('L').save(sys.argv[2])" "$2/tmp.tif" "$out"
done
rm -f "$2/tmp.tif"
echo rendered "$n"
