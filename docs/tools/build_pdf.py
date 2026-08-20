# -*- coding: utf-8 -*-
"""Render the SRS markdown to a print-ready HTML document, then to PDF via Chromium."""
import html, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.dirname(HERE)
SRC = os.path.join(DOCS, "CSI603-SRS-PropManage-BW.md")
DIAG = os.path.join(DOCS, "diagrams")
OUT_HTML = os.path.join(HERE, "srs.print.html")
OUT_PDF = os.path.join(DOCS, "CSI603-SRS-PropManage-BW.pdf")
SVGS = ["c1-context.svg", "c2-use-case.svg", "c3-dfd-level1.svg", "c4-erd.svg"]

ID_RE = re.compile(r'^(FR|NFR|FS|UI|HW|SW|CI|DR|UC|PF|CON|ASM|DEP|S|X|R|A|E)-?\d+[a-z]?$')

def slug(t):
    t = re.sub(r'<[^>]+>', '', t).lower()
    t = re.sub(r'[^a-z0-9\s-]', '', t)
    return re.sub(r'\s+', '-', t.strip())

def inline(t):
    code = []
    def stash(m):
        code.append(m.group(1))
        return f"\x00{len(code)-1}\x00"
    t = re.sub(r'`([^`]+)`', stash, t)
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', t)
    t = re.sub(r'\x00(\d+)\x00', lambda m: f"<code>{html.escape(code[int(m.group(1))], quote=False)}</code>", t)
    return t

def cells(row):
    row = row.strip()
    if row.startswith('|'): row = row[1:]
    if row.endswith('|'): row = row[:-1]
    return [c.strip() for c in row.split('|')]

def table(block):
    head = cells(block[0])
    body = [cells(r) for r in block[2:]]
    plain = all(h == '' for h in head)
    out = [f'<table class="{"plain" if plain else ""}">']
    if not plain:
        out.append('<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead>')
    out.append('<tbody>')
    for r in body:
        tds = []
        for i, c in enumerate(r):
            cls = ' class="idc"' if i == 0 and ID_RE.match(re.sub(r'\*|`', '', c)) else ''
            tds.append(f'<td{cls}>{inline(c)}</td>')
        out.append('<tr>' + ''.join(tds) + '</tr>')
    out.append('</tbody></table>')
    return '\n'.join(out)

def convert(md):
    lines = md.split('\n')
    out, i, hr_count, svg_i = [], 0, 0, 0
    state = {"title_open": False, "toc_open": False}
    while i < len(lines):
        ln = lines[i]
        if ln.startswith('```'):
            fence = ln.strip('`').strip()
            j = i + 1
            body = []
            while j < len(lines) and not lines[j].startswith('```'):
                body.append(lines[j]); j += 1
            if fence == 'mermaid' and svg_i < len(SVGS):
                svg = open(os.path.join(DIAG, SVGS[svg_i])).read()
                svg = re.sub(r'\s(width|height)="\d+"', '', svg, count=2)
                out.append(f'<figure>{svg}</figure>')
                svg_i += 1
            else:
                out.append('<pre><code>' + html.escape('\n'.join(body)) + '</code></pre>')
            i = j + 1
            continue
        if re.match(r'^#{1,6} ', ln):
            level = len(ln) - len(ln.lstrip('#'))
            text = ln[level+1:].strip()
            sid = slug(text)
            if level == 1 and not state["title_open"] and not out:
                out.append('<div class="title-page">')
                state["title_open"] = True
            if sid == 'table-of-contents':
                if state["title_open"]:
                    out.append('</div>'); state["title_open"] = False
                out.append('<div class="toc-page">'); state["toc_open"] = True
            out.append(f'<h{level} id="{sid}">{inline(text)}</h{level}>')
            i += 1
            continue
        if re.match(r'^\s*\|.*\|\s*$', ln) and i + 1 < len(lines) and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i+1]):
            j = i
            block = []
            while j < len(lines) and re.match(r'^\s*\|', lines[j]):
                block.append(lines[j]); j += 1
            out.append(table(block))
            i = j
            continue
        if re.match(r'^(---|\*\*\*|___)\s*$', ln):
            hr_count += 1
            if hr_count == 1 and state["title_open"]:
                out.append('</div>'); state["title_open"] = False
            elif state["toc_open"]:
                out.append('</div>'); state["toc_open"] = False
            i += 1
            continue
        if re.match(r'^\s*[-*] ', ln):
            j, items = i, []
            while j < len(lines) and re.match(r'^\s*[-*] ', lines[j]):
                items.append(re.sub(r'^\s*[-*] ', '', lines[j])); j += 1
            out.append('<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ul>')
            i = j
            continue
        if re.match(r'^\s*\d+[.)] ', ln):
            j, items = i, []
            while j < len(lines) and re.match(r'^\s*\d+[.)] ', lines[j]):
                items.append(re.sub(r'^\s*\d+[.)] ', '', lines[j])); j += 1
            out.append('<ol>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ol>')
            i = j
            continue
        if ln.strip() == '':
            i += 1
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,6} |\s*\|.*\||```|\s*[-*] |\s*\d+[.)] |---\s*$)', lines[i]):
            para.append(lines[i]); i += 1
        out.append('<p>' + inline(' '.join(para)) + '</p>')
    if state["title_open"]: out.append('</div>')
    if state["toc_open"]: out.append('</div>')
    return '\n'.join(out)

CSS = """
@page { size: A4; margin: 18mm 15mm 16mm 15mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "DejaVu Sans", "FreeSans", Arial, sans-serif; font-size: 9.6pt; line-height: 1.52;
       color: #1a1c1e; margin: 0; }
h1, h2, h3, h4 { color: #003857; font-weight: 700; line-height: 1.25; }
h1 { font-size: 18pt; margin: 0 0 14px; padding-bottom: 7px; border-bottom: 2.5px solid #003857;
     page-break-before: always; page-break-after: avoid; letter-spacing: -.2px; }
h2 { font-size: 13pt; margin: 20px 0 8px; page-break-after: avoid; }
h3 { font-size: 11pt; margin: 16px 0 6px; page-break-after: avoid; }
h4 { font-size: 9.8pt; margin: 12px 0 5px; page-break-after: avoid; }
p { margin: 0 0 8px; text-align: justify; }
ul, ol { margin: 0 0 9px; padding-left: 19px; }
li { margin-bottom: 3px; text-align: justify; }
a { color: #1b4f72; text-decoration: none; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.4pt; background: #eef2f5;
       padding: 0.5px 3px; border-radius: 3px; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 8.5pt; line-height: 1.4; }
thead { display: table-header-group; }
th { background: #003857; color: #fff; text-align: left; font-weight: 700; padding: 5px 7px;
     border: 1px solid #003857; }
td { border: 1px solid #dde4e9; padding: 4.5px 7px; vertical-align: top; }
tbody tr:nth-child(even) td { background: #f6f9fb; }
tr, figure, table caption { page-break-inside: avoid; }
td.idc { white-space: nowrap; font-weight: 700; color: #003857; }
table.plain th { display: none; }
table.plain td:first-child { width: 26%; font-weight: 700; color: #003857; background: #f2f6f9; }
figure { margin: 14px 0 18px; text-align: center; page-break-inside: avoid; }
figure svg { max-width: 100%; height: auto; border: 1px solid #e3e9ee; border-radius: 6px; padding: 6px; }
pre { background: #f6f9fb; border: 1px solid #dde4e9; border-radius: 5px; padding: 8px 10px;
      font-size: 8pt; overflow-wrap: break-word; white-space: pre-wrap; page-break-inside: avoid; }
.title-page { page-break-after: always; padding-top: 42mm; }
.title-page h1 { page-break-before: avoid; font-size: 26pt; border: none; text-align: center;
                 margin-bottom: 4px; padding: 0; }
.title-page h2 { font-size: 15pt; text-align: center; color: #41474e; font-weight: 500;
                 margin: 0 0 34px; }
.title-page h3 { text-align: center; font-size: 11pt; margin: 30px 0 8px; }
.title-page table { font-size: 9pt; }
.title-page table.plain td:first-child { width: 38%; }
.toc-page { page-break-after: always; }
.toc-page h2 { font-size: 16pt; border-bottom: 2px solid #003857; padding-bottom: 6px; }
.toc-page ol { padding-left: 16px; }
.toc-page li { margin-bottom: 9px; text-align: left; }
"""

md = open(SRC).read()
body = convert(md)
doc = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Software Requirements Specification — PropManage BW</title><style>{CSS}</style></head>
<body>{body}</body></html>"""
open(OUT_HTML, "w").write(doc)
print("html:", OUT_HTML, len(doc), "bytes")

chrome = os.environ.get("CHROME_BIN", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
cmd = [chrome, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
       f"--print-to-pdf={OUT_PDF}", "--print-to-pdf-no-header", f"file://{OUT_HTML}"]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
print("chrome rc:", r.returncode)
if r.returncode != 0:
    print(r.stderr[-2000:])
print("pdf:", OUT_PDF, os.path.getsize(OUT_PDF) if os.path.exists(OUT_PDF) else "MISSING")
