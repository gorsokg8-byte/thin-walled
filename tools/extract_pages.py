"""Extract scanned page images from a PDF into PNG files (one per page).

Usage: python -I extract_pages.py <pdf> <out_dir> [first_page_1based] [last_page_1based]
"""
import sys
from pathlib import Path

import pypdf


def main():
    pdf, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    reader = pypdf.PdfReader(pdf)
    first = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    last = int(sys.argv[4]) if len(sys.argv) > 4 else len(reader.pages)
    for n in range(first, last + 1):
        target = out / f"p{n:03d}.png"
        if target.exists():
            continue
        images = reader.pages[n - 1].images
        if not images:
            print("no image on page", n)
            continue
        # The largest embedded image is the page scan.
        img = max(images, key=lambda im: im.image.size[0] * im.image.size[1]).image
        img.save(target)
    print("done", first, last)


if __name__ == "__main__":
    main()
