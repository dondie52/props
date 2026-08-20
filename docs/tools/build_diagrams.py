# -*- coding: utf-8 -*-
"""Generate the four SRS diagrams as standalone SVG files."""
import os, html

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "diagrams")
PRIMARY, ACCENT = "#003857", "#fea520"
INK, MUTED, LINE = "#1a1c1e", "#52606d", "#9fb0bd"
SURF, STORE, BOUND = "#f4f6f8", "#eef3f7", "#c9d4dc"
FONT = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"

def esc(t): return html.escape(str(t), quote=False)

def head(w, h, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{esc(title)}" font-family="{FONT}">
<defs>
<marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="{LINE}"/></marker>
<marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
<path d="M0,0 L10,5 L0,10 z" fill="{PRIMARY}"/></marker>
</defs>
<rect width="{w}" height="{h}" fill="#ffffff"/>
'''

def txt(x, y, s, size=12, fill=INK, weight="400", anchor="middle", style=""):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}" {style}>{esc(s)}</text>\n'

def wrapped(x, y, lines, size=12, fill=INK, weight="400", lh=None, anchor="middle"):
    lh = lh or size + 3
    out = ""
    start = y - (len(lines) - 1) * lh / 2
    for i, ln in enumerate(lines):
        out += txt(x, start + i * lh + size * 0.35, ln, size, fill, weight, anchor)
    return out

def box(x, y, w, h, lines, fill="#ffffff", stroke=BOUND, size=12, weight="600",
        r=8, textfill=INK, sw=1.4):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>\n'
    return s + wrapped(x + w / 2, y + h / 2, lines, size, textfill, weight)

def store(x, y, w, h, lines):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{STORE}" stroke={chr(34)}{BOUND}{chr(34)} stroke-width="1.4"/>\n'
    s += f'<line x1="{x+34}" y1="{y}" x2="{x+34}" y2="{y+h}" stroke="{BOUND}" stroke-width="1.4"/>\n'
    s += txt(x + 17, y + h / 2 + 4, lines[0], 13, PRIMARY, "700")
    s += wrapped(x + 34 + (w - 34) / 2, y + h / 2, lines[1:], 12, INK, "500")
    return s

def ell(cx, cy, rx, ry, lines, size=12.5):
    s = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#ffffff" stroke="{PRIMARY}" stroke-width="1.4"/>\n'
    return s + wrapped(cx, cy, lines, size, INK, "500", lh=14)

def line(x1, y1, x2, y2, arrow="end", stroke=LINE, w=1.3, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    m = ""
    if arrow == "end":   m = ' marker-end="url(#a)"'
    elif arrow == "both": m = ' marker-end="url(#a)" marker-start="url(#a)"'
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{w}"{d}{m}/>\n'

def poly(pts, arrow=True, stroke=LINE, w=1.3):
    d = " ".join(f"{p[0]},{p[1]}" for p in pts)
    m = ' marker-end="url(#a)"' if arrow else ""
    return f'<polyline points="{d}" fill="none" stroke="{stroke}" stroke-width="{w}"{m}/>\n'

def stick(cx, cy, label, sub=None):
    s = f'<g stroke="{PRIMARY}" stroke-width="1.8" fill="none" stroke-linecap="round">'
    s += f'<circle cx="{cx}" cy="{cy-26}" r="9" fill="#ffffff"/>'
    s += f'<line x1="{cx}" y1="{cy-17}" x2="{cx}" y2="{cy+4}"/>'
    s += f'<line x1="{cx-13}" y1="{cy-9}" x2="{cx+13}" y2="{cy-9}"/>'
    s += f'<line x1="{cx}" y1="{cy+4}" x2="{cx-11}" y2="{cy+21}"/>'
    s += f'<line x1="{cx}" y1="{cy+4}" x2="{cx+11}" y2="{cy+21}"/></g>\n'
    s += txt(cx, cy + 38, label, 13, PRIMARY, "700")
    if sub: s += txt(cx, cy + 52, sub, 12, MUTED, "500")
    return s

def caption(x, y, s, size=11.5, anchor="middle"):
    return txt(x, y, s, size, MUTED, "600", anchor=anchor,
               style='paint-order="stroke" stroke="#ffffff" stroke-width="3.2" stroke-linejoin="round"')

# ---------------------------------------------------------------- C.1 context
def context():
    W, H = 900, 530
    s = head(W, H, "System context diagram")
    s += txt(W/2, 26, "C.1  System Context Diagram", 14, PRIMARY, "700")
    cx, cy, cw, ch = 350, 200, 210, 140
    left = [(60, "Landlord", "portfolio and payments in,"), (160, "Tenant", "requests and messages in,"),
            (260, "Administrator", "oversight requests in,"), (360, "Prospective|customer", "registration in,")]
    lab2 = ["indicators and reports out", "tenancy status out", "platform figures out", "product information out"]
    anchors = [212, 245, 285, 320]
    for i, (y, name, l1) in enumerate(left):
        s += box(20, y, 150, 56, name.split("|"), fill=SURF, stroke=PRIMARY, size=13, weight="700")
        s += line(170, y + 28, cx, anchors[i], arrow="both")
        mx, my = (170 + cx) / 2, (y + 28 + anchors[i]) / 2
        s += caption(mx, my - 12, l1)
        s += caption(mx, my - 1, lab2[i])
    right = [(60, "Identity service", "credentials, sessions", "both"),
             (160, "Managed database and object storage", "records and images", "both"),
             (260, "Scheduler", "daily rent-cycle trigger", "in"),
             (360, "Spreadsheet application", ".xlsx exports", "out")]
    ranch = [212, 245, 285, 320]
    for i, (y, name, lab, direction) in enumerate(right):
        lines = name.split(" and ") if len(name) > 22 else [name]
        if len(name) > 22 and len(lines) == 1: lines = [name]
        s += box(720, y, 160, 56, (["Managed database", "and object storage"] if i == 1
                 else ["Spreadsheet", "application"] if i == 3 else [name]),
                 fill="#ffffff", stroke=PRIMARY, size=12.5, weight="700")
        x1, y1, x2, y2 = cx + cw, ranch[i], 720, y + 28
        if direction == "in":    s += line(x2, y2, x1, y1)
        elif direction == "out": s += line(x1, y1, x2, y2)
        else:                    s += line(x1, y1, x2, y2, arrow="both")
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        s += caption(mx, my - 6, lab)
    s += box(cx, cy, cw, ch, ["PropManage BW", "Property Management", "System"],
             fill=PRIMARY, stroke=PRIMARY, size=15, weight="700", textfill="#ffffff", r=12, sw=2)
    s += caption(W/2, H - 22, "Human actors (left) and supporting services (right) exchange information with the system.")
    s += "</svg>\n"
    return s

# --------------------------------------------------------------- C.2 use case
def usecase():
    W, H = 1040, 800
    s = head(W, H, "Use case diagram")
    s += txt(W/2, 26, "C.2  Use Case Diagram", 14, PRIMARY, "700")
    bx, by, bw, bh = 250, 44, 640, 690
    s += f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="10" fill="{SURF}" stroke="{BOUND}" stroke-width="1.6"/>\n'
    s += txt(bx + bw / 2, by + 22, "PropManage BW  —  system boundary", 13, MUTED, "700")
    L, R, rx, ry = 400, 740, 108, 28
    rows = [110, 178, 246, 314, 382, 450, 518, 586, 654, 700]
    ucL = [("UC-18", "Browse public site", 0), ("UC-01", "Register an account", 1), ("UC-02", "Sign in", 2),
           ("UC-04", "Complete guided onboarding", 3), ("UC-06", "Assign a tenant to a unit", 4),
           ("UC-07", "View portfolio dashboard", 5), ("UC-09", "Record a rent payment", 6),
           ("UC-12", "Progress a maintenance request", 7)]
    ucR = [("UC-10", "Download a rent receipt", 0), ("UC-11", "Submit a maintenance request", 1),
           ("UC-13", "Exchange messages", 2), ("UC-16", "View tenancy summary", 3),
           ("UC-14", "Export a report", 4), ("UC-15", "Monitor the platform", 5), ("UC-08", "Generate monthly rent obligations", 7)]
    posL = {u[0]: (L, rows[u[2]]) for u in ucL}
    posR = {u[0]: (R, rows[u[2]]) for u in ucR}
    pos = {**posL, **posR}
    actors = {"PC": (120, 110), "LL": (120, 330), "TN": (120, 560), "AD": (960, 150), "SC": (960, 640)}
    links = [("PC", "UC-18"), ("PC", "UC-01"),
             ("LL", "UC-02"), ("LL", "UC-04"), ("LL", "UC-06"), ("LL", "UC-07"),
             ("LL", "UC-09"), ("LL", "UC-12"), ("LL", "UC-10"), ("LL", "UC-13"), ("LL", "UC-14"),
             ("TN", "UC-02"), ("TN", "UC-11"), ("TN", "UC-13"), ("TN", "UC-16"), ("TN", "UC-10"), ("TN", "UC-14"),
             ("AD", "UC-02"), ("AD", "UC-15"), ("AD", "UC-14"), ("SC", "UC-08")]
    for a, u in links:
        ax, ay = actors[a]
        ux, uy = pos[u]
        if ax < ux: x1, x2 = ax + 24, ux - rx
        else:       x1, x2 = ax - 24, ux + rx
        s += line(x1, ay - 6, x2, uy, arrow="none", stroke=LINE, w=1.0)
    for code, name, r in ucL:
        words = name.split()
        if len(name) > 24:
            mid = len(words) // 2
            body = [" ".join(words[:mid]), " ".join(words[mid:])]
        else: body = [name]
        s += ell(L, rows[r], rx, ry, [code] + body)
    for code, name, r in ucR:
        words = name.split()
        if len(name) > 24:
            mid = len(words) // 2
            body = [" ".join(words[:mid]), " ".join(words[mid:])]
        else: body = [name]
        s += ell(R, rows[r], rx, ry, [code] + body)
    s += stick(120, 110, "Prospective", "customer")
    s += stick(120, 330, "Landlord")
    s += stick(120, 560, "Tenant")
    s += stick(960, 150, "Administrator")
    s += stick(960, 640, "Scheduler", "(system actor)")
    s += caption(W/2, H - 20, "Lines show which actors take part in which use cases; see section 4.2 for the full list.")
    s += "</svg>\n"
    return s

# --------------------------------------------------------------------- C.3 DFD
def dfd():
    W, H = 1020, 700
    s = head(W, H, "Data flow diagram level 1")
    s += txt(W/2, 26, "C.3  Data Flow Diagram  —  Level 1", 14, PRIMARY, "700")
    ext = [(58, "Landlord"), (300, "Scheduler"), (420, "Tenant"), (540, "Administrator")]
    for y, n in ext:
        s += box(30, y, 140, 54, [n], fill=SURF, stroke=PRIMARY, size=13, weight="700")
    procs = [(58, "1.0", "Manage accounts", "and access"),
             (176, "2.0", "Manage portfolio", "and tenancies"),
             (294, "3.0", "Run rent cycle and", "record payments"),
             (412, "4.0", "Handle maintenance", "and messaging"),
             (530, "5.0", "Produce dashboards,", "reports and receipts")]
    px, pw, phh = 380, 220, 76
    for y, num, a, b in procs:
        s += box(px, y, pw, phh, [num, a, b], fill="#ffffff", stroke=PRIMARY, size=12.5, weight="600", r=38, sw=1.6)
    stores = [(58, "D1", "Profiles and landlords"), (152, "D2", "Properties, houses, units"),
              (246, "D3", "Tenants and leases"), (340, "D4", "Payments"),
              (434, "D5", "Maintenance requests"), (528, "D6", "Conversations and messages")]
    sx, sw_, sh = 760, 230, 60
    for y, code, name in stores:
        s += store(sx, y, sw_, sh, [code, name])
    def pc(i): return (px, procs[i][0], pw, phh)
    # external -> process
    s += line(170, 76, px, 84, arrow="both"); s += caption(276, 68, "credentials")
    s += line(170, 92, px, 200, arrow="both"); s += caption(272, 140, "portfolio and")
    s += caption(272, 151, "tenancy details")
    s += line(170, 100, px, 320, arrow="both"); s += caption(258, 232, "payments received")
    s += line(170, 108, px, 440, arrow="both"); s += caption(330, 380, "status changes")
    s += line(170, 116, px, 560, arrow="both"); s += caption(238, 430, "report requests,")
    s += caption(238, 441, "indicators returned")
    s += line(170, 327, px, 332); s += caption(276, 318, "daily trigger")
    s += line(170, 440, px, 100, arrow="both"); s += caption(300, 262, "credentials")
    s += line(170, 448, px, 455, arrow="both"); s += caption(276, 462, "requests, messages")
    s += line(170, 460, px, 575, arrow="both"); s += caption(268, 528, "tenancy views")
    s += line(170, 560, px, 112, arrow="both"); s += caption(316, 352, "credentials")
    s += line(170, 578, px, 590, arrow="both"); s += caption(272, 596, "oversight, exports")
    # process -> store
    pairs = [(0, 0), (1, 1), (1, 2), (2, 2), (2, 3), (3, 4), (3, 5), (4, 3)]
    for pi, si in pairs:
        py = procs[pi][0] + phh / 2
        sy = stores[si][0] + sh / 2
        s += line(px + pw, py, sx, sy, arrow="both", w=1.1)
    s += line(px + pw, procs[4][0] + 20, sx, stores[0][0] + sh / 2, arrow="none", w=1.0, dash="4 3")
    s += line(px + pw, procs[4][0] + 30, sx, stores[1][0] + sh / 2, arrow="none", w=1.0, dash="4 3")
    s += line(px + pw, procs[4][0] + 40, sx, stores[2][0] + sh / 2, arrow="none", w=1.0, dash="4 3")
    s += line(px + pw, procs[4][0] + 50, sx, stores[4][0] + sh / 2, arrow="none", w=1.0, dash="4 3")
    s += caption(660, 660, "Solid lines: read and write.   Dashed lines: read only, for reporting.")
    s += caption(W/2, H - 16, "Level 0 of this model is the system context diagram at C.1.")
    s += "</svg>\n"
    return s

# --------------------------------------------------------------------- C.4 ERD
def erd():
    W, H = 1060, 950
    s = head(W, H, "Entity relationship diagram")
    s += txt(W/2, 26, "C.4  Entity Relationship Diagram", 14, PRIMARY, "700")
    ents = {
        "PROFILES":     (70, 60, 230, ["id  PK", "auth_user_id  FK", "full_name, email  UK", "role  admin|landlord|tenant", "onboarding_state"]),
        "LANDLORDS":    (420, 60, 230, ["id  PK", "profile_id  FK", "full_name, email  UK"]),
        "PROPERTIES":   (420, 240, 230, ["id  PK", "landlord_id  FK", "name, address", "city, type"]),
        "HOUSES":       (70, 240, 230, ["id  PK", "property_id  FK", "house_number", "bedroom_count  1..20"]),
        "PROPERTY_PHOTOS": (780, 240, 240, ["id  PK", "property_id  FK", "storage_path", "is_primary  one per property"]),
        "UNITS":        (420, 420, 230, ["id  PK", "property_id  FK", "unit_number", "rent_amount", "status  vacant | occupied"]),
        "MAINTENANCE_REQUESTS": (780, 420, 240, ["id  PK", "unit_id  FK", "category, description", "urgency  low|medium|high", "status  open|in-progress|resolved"]),
        "TENANTS":      (420, 630, 230, ["id  PK", "unit_id  FK", "full_name, email", "lease_start, lease_end"]),
        "PAYMENTS":     (780, 630, 240, ["id  PK", "tenant_id  FK", "amount", "due_date, payment_date", "status  paid|pending|overdue", "method"]),
        "CONVERSATIONS": (70, 630, 230, ["id  PK", "tenant_id, unit_id  FK", "landlord_profile_id  FK", "tenant_profile_id  FK", "last_message_at"]),
        "MESSAGES":     (70, 795, 230, ["id  PK", "conversation_id  FK", "sender_profile_id  FK", "body, is_read"]),
    }
    def ent_h(rows): return 30 + len(rows) * 17 + 8
    def anchor(name, side):
        x, y, w, rows = ents[name]
        h = ent_h(rows)
        return {"left": (x, y + h / 2), "right": (x + w, y + h / 2),
                "top": (x + w / 2, y), "bottom": (x + w / 2, y + h)}[side]
    rels = [
        ("PROFILES", "right", "LANDLORDS", "left", "1", "0..1"),
        ("LANDLORDS", "bottom", "PROPERTIES", "top", "1", "0..*"),
        ("PROPERTIES", "left", "HOUSES", "right", "1", "0..*"),
        ("PROPERTIES", "right", "PROPERTY_PHOTOS", "left", "1", "0..*"),
        ("PROPERTIES", "bottom", "UNITS", "top", "1", "0..*"),
        ("UNITS", "right", "MAINTENANCE_REQUESTS", "left", "1", "0..*"),
        ("UNITS", "bottom", "TENANTS", "top", "1", "0..*"),
        ("TENANTS", "right", "PAYMENTS", "left", "1", "0..*"),
        ("TENANTS", "left", "CONVERSATIONS", "right", "1", "0..1"),
        ("CONVERSATIONS", "bottom", "MESSAGES", "top", "1", "0..*"),
    ]
    for a, sa, b, sb, ca, cb in rels:
        x1, y1 = anchor(a, sa); x2, y2 = anchor(b, sb)
        s += line(x1, y1, x2, y2, arrow="none", stroke=PRIMARY, w=1.3)
        vertical = abs(y2 - y1) > abs(x2 - x1)
        if vertical:
            side = 15
            s += caption(x1 + side, y1 + (20 if y2 > y1 else -12), ca, anchor="start")
            s += caption(x2 + side, y2 - (12 if y2 > y1 else -20), cb, anchor="start")
        else:
            s += caption(x1 + (22 if x2 > x1 else -22), y1 - 7, ca)
            s += caption(x2 - (22 if x2 > x1 else -22), y2 - 7, cb)
    # sender relationship, routed down the left margin
    px1, py1 = anchor("PROFILES", "left")
    px2, py2 = anchor("MESSAGES", "left")
    s += poly([(px1, py1), (30, py1), (30, py2), (px2, py2)], arrow=False, stroke=PRIMARY, w=1.3)
    s += caption(46, py1 + 18, "1", anchor="start")
    s += caption(46, py2 - 10, "0..*", anchor="start")
    s += caption(30, (py1 + py2) / 2 - 6, "writes", anchor="middle")
    for name, (x, y, w, rows) in ents.items():
        h = ent_h(rows)
        s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#ffffff" stroke="{PRIMARY}" stroke-width="1.5"/>\n'
        s += f'<path d="M{x},{y+30} h{w}" stroke="{PRIMARY}" stroke-width="1.2"/>\n'
        s += f'<path d="M{x+6},{y} h{w-12} a6,6 0 0 1 6,6 v24 h-{w} v-24 a6,6 0 0 1 6,-6 z" fill="{PRIMARY}"/>\n'
        s += txt(x + w / 2, y + 20, name, 12.5, "#ffffff", "700")
        for i, r in enumerate(rows):
            s += txt(x + 12, y + 49 + i * 17, r, 12, INK, "400", anchor="start")
    s += caption(W/2, H - 14, "PK primary key   FK foreign key   UK unique.   Cardinality shown as 1 to 0..* or 0..1.")
    s += "</svg>\n"
    return s

os.makedirs(OUT, exist_ok=True)
for fn, gen in [("c1-context.svg", context), ("c2-use-case.svg", usecase),
                ("c3-dfd-level1.svg", dfd), ("c4-erd.svg", erd)]:
    open(os.path.join(OUT, fn), "w").write(gen())
    print("wrote", fn)
