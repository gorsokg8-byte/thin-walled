"""Build the page for publishing as a claude.ai artifact (phone version).

The artifact host wraps the page in its own <!doctype>/<head>/<body>, so the page is the body
content of index.html plus <title> and stylesheet links. Prints the `files` map for the publish call.

Usage: python build_artifact.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / 'index.html').read_text(encoding='utf-8')

head = re.search(r'<head>(.*?)</head>', src, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', src, re.S).group(1)
links = re.findall(r'<link rel="stylesheet" href="[^"]+">', head)
title = re.search(r'<title>.*?</title>', head).group(0)

page = '\n'.join([title, '<meta name="claude:viewport-fit-sides" content="cover">', *links]) + '\n' + body.strip() + '\n'
out = ROOT / 'dist' / 'index.html'
out.parent.mkdir(exist_ok=True)
out.write_text(page, encoding='utf-8')

files = {}
for href in re.findall(r'(?:src|href)="([^"#:]+\.(?:js|css))"', src):
    files[href] = str(ROOT / href)
for font in sorted((ROOT / 'vendor' / 'katex' / 'fonts').glob('*.woff2')):
    files['vendor/katex/fonts/' + font.name] = str(font)
print(len(files), 'files')
(ROOT / 'dist' / 'files.json').write_text(json.dumps(files, ensure_ascii=False, indent=1), encoding='utf-8')
print(out)
