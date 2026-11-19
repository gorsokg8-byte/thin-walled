"""OCR all PNG pages in a folder with Tesseract (rus+eng), one .txt per page.

Usage: python -I ocr_pages.py <png_dir> <txt_dir> <tessdata_dir> [workers]
"""
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

TESSERACT = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def ocr(png, txt_dir, tessdata):
    base = txt_dir / png.stem
    if base.with_suffix(".txt").exists():
        return
    subprocess.run(
        [TESSERACT, str(png), str(base), "--tessdata-dir", str(tessdata), "-l", "rus+eng", "--psm", "3"],
        capture_output=True,
    )


def main():
    png_dir, txt_dir, tessdata = map(Path, sys.argv[1:4])
    workers = int(sys.argv[4]) if len(sys.argv) > 4 else 6
    txt_dir.mkdir(parents=True, exist_ok=True)
    pngs = sorted(png_dir.glob("p*.png"))
    with ThreadPoolExecutor(workers) as pool:
        list(pool.map(lambda p: ocr(p, txt_dir, tessdata), pngs))
    print("done", len(pngs))


if __name__ == "__main__":
    main()
