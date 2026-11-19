"""Render PDF pages to PNG (works for scans and for vector handwriting).

Usage: python -I render_pages.py <pdf> <out_dir> <first_1based> <last_1based> [dpi]
"""
import sys
from pathlib import Path

import pymupdf


def main():
    pdf, out = Path(sys.argv[1]), Path(sys.argv[2])
    first, last = int(sys.argv[3]), int(sys.argv[4])
    dpi = int(sys.argv[5]) if len(sys.argv) > 5 else 110
    out.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf)
    last = min(last, doc.page_count)
    for n in range(first, last + 1):
        target = out / f"p{n:03d}.png"
        if not target.exists():
            doc[n - 1].get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY).save(target)
    print("pages", doc.page_count, "rendered", first, last)


if __name__ == "__main__":
    main()
