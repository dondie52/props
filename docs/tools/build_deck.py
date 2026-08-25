# -*- coding: utf-8 -*-
"""Build the CSI 603 presentation deck (.pptx) without third-party libraries."""
import os, zipfile, html

E = 914400
def emu(v): return int(round(v * E))
SW, SH = 13.333, 7.5

NAVY="003857"; MID="1B4F72"; AMBER="FEA520"; SURF="F1F4F7"; PALE="FAFBFC"
INK="1A1C1E"; MUTED="5A6570"; WHITE="FFFFFF"; ICE="C8D8E4"; LINE="DCE3E9"
RED="B4472C"; GREEN="2C6E49"
F="Calibri"
M=0.62; CW=SW-2*M

def esc(t): return html.escape(str(t), quote=False)

class Slide:
    def __init__(self, bg=None):
        self.bg=bg; self.body=[]; self.ops=[]; self.n=1; self.notes=""
    def _id(self):
        self.n+=1; return self.n

    def _sp(self, prst, x, y, w, h, fill, line, adj=None, shadow=False, extra=""):
        geom = f'<a:prstGeom prst="{prst}"><a:avLst>{adj or ""}</a:avLst></a:prstGeom>'
        f_ = f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>' if fill else '<a:noFill/>'
        l_ = (f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>'
              if line else '<a:ln><a:noFill/></a:ln>')
        eff = ('<a:effectLst><a:outerShdw blurRad="95250" dist="22860" dir="5400000" rotWithShape="0">'
               f'<a:srgbClr val="8C9BA8"><a:alpha val="20000"/></a:srgbClr></a:outerShdw></a:effectLst>'
               if shadow else '')
        return (f'<p:sp><p:nvSpPr><p:cNvPr id="{self._id()}" name="s{self.n}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
                f'<p:spPr><a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>'
                f'{geom}{f_}{l_}{eff}</p:spPr>'
                f'<p:txBody><a:bodyPr lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"/><a:lstStyle/>'
                f'{extra or "<a:p/>"}</p:txBody></p:sp>')

    def rect(self,x,y,w,h,fill=None,line=None,shadow=False):
        self.ops.append(("shape",x,y,w,h,fill,line,0,shadow))
        self.body.append(self._sp("rect",x,y,w,h,fill,line,shadow=shadow)); return self
    def roundrect(self,x,y,w,h,fill=None,line=None,r=0.12,shadow=False):
        adj=f'<a:gd name="adj" fmla="val {int(min(50000, max(0, r/(min(w,h)/2)*50000)))}"/>'
        self.ops.append(("shape",x,y,w,h,fill,line,r,shadow))
        self.body.append(self._sp("roundRect",x,y,w,h,fill,line,adj=adj,shadow=shadow)); return self
    def ellipse(self,x,y,w,h,fill=None,line=None):
        self.ops.append(("shape",x,y,w,h,fill,line,min(w,h)/2,False))
        self.body.append(self._sp("ellipse",x,y,w,h,fill,line)); return self

    def text(self,x,y,w,h,runs,size=14,color=INK,bold=False,italic=False,align="l",
             valign="t",spc=None,line_sp=None,space_after=None,bullet=False,font=F):
        if isinstance(runs,str): runs=[runs]
        self.ops.append(("text",x,y,w,h,runs,dict(size=size,color=color,bold=bold,italic=italic,
                         align=align,valign=valign,spc=spc,line_sp=line_sp,
                         space_after=space_after,bullet=bullet,font=font)))
        paras=[]
        for item in runs:
            if isinstance(item,dict):
                t=item.get("t",""); o=item
            else:
                t=item; o={}
            sz=int(o.get("size",size)*100)
            col=o.get("color",color); b="1" if o.get("bold",bold) else "0"
            it="1" if o.get("italic",italic) else "0"
            al=o.get("align",align); bu=o.get("bullet",bullet)
            ppr='<a:pPr algn="%s"%s>' % (al, ' marL="185420" indent="-185420"' if bu else ' marL="0" indent="0"')
            if line_sp: ppr+=f'<a:lnSpc><a:spcPct val="{int(line_sp*1000)}"/></a:lnSpc>'
            sa=o.get("space_after",space_after)
            if sa: ppr+=f'<a:spcAft><a:spcPts val="{int(sa*100)}"/></a:spcAft>'
            ppr += ('<a:buFont typeface="Arial"/><a:buChar char="•"/>' if bu else '<a:buNone/>')
            ppr+='</a:pPr>'
            sp_attr=f' spc="{int(o.get("spc",spc or 0)*100)}"' if (o.get("spc",spc)) else ''
            rpr=(f'<a:rPr lang="en-GB" sz="{sz}" b="{b}" i="{it}"{sp_attr} dirty="0">'
                 f'<a:solidFill><a:srgbClr val="{col}"/></a:solidFill>'
                 f'<a:latin typeface="{font}"/><a:cs typeface="{font}"/></a:rPr>')
            segs=str(t).split("\n")
            body="".join((f'<a:r>{rpr}<a:t>{esc(s)}</a:t></a:r>' if i==0
                          else f'<a:br>{rpr}</a:br><a:r>{rpr}<a:t>{esc(s)}</a:t></a:r>')
                         for i,s in enumerate(segs))
            paras.append(f'<a:p>{ppr}{body}</a:p>')
        anchor={"t":"t","ctr":"ctr","b":"b"}[valign]
        self.body.append(
            f'<p:sp><p:nvSpPr><p:cNvPr id="{self._id()}" name="t{self.n}"/>'
            f'<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>'
            f'<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="{anchor}">'
            f'<a:normAutofit/></a:bodyPr><a:lstStyle/>{"".join(paras)}</p:txBody></p:sp>')
        return self

    def html(self):
        px=lambda v: f"{v*96:.2f}px"
        AL={"l":"left","ctr":"center","r":"right"}
        VA={"t":"flex-start","ctr":"center","b":"flex-end"}
        out=[f'<section class="sl" style="background:#{self.bg or "FFFFFF"}">']
        for op in self.ops:
            if op[0]=="shape":
                _,x,y,w,h,fill,line,r,shadow=op
                sty=(f"left:{px(x)};top:{px(y)};width:{px(w)};height:{px(h)};"
                     f"background:{'#'+fill if fill else 'transparent'};"
                     f"border:{'1px solid #'+line if line else 'none'};"
                     f"border-radius:{px(r)};"
                     f"box-shadow:{'0 2px 9px rgba(140,155,168,.30)' if shadow else 'none'}")
                out.append(f'<div class="sh" style="{sty}"></div>')
            else:
                _,x,y,w,h,runs,o=op
                blocks=[]
                for item in runs:
                    d=item if isinstance(item,dict) else {"t":item}
                    t=d.get("t",item if isinstance(item,str) else "")
                    fs=d.get("size",o["size"]); col=d.get("color",o["color"])
                    b="700" if d.get("bold",o["bold"]) else "400"
                    it="italic" if d.get("italic",o["italic"]) else "normal"
                    al=AL[d.get("align",o["align"])]
                    bul=d.get("bullet",o["bullet"])
                    sa=d.get("space_after",o["space_after"]) or 0
                    lh=(o["line_sp"]/100) if o["line_sp"] else 1.22
                    ls=f"letter-spacing:{o['spc']*0.75:.2f}px;" if o.get("spc") else ""
                    body=esc(t).replace("\n","<br>")
                    pad="padding-left:14px;text-indent:-14px;" if bul else ""
                    mark="• " if bul else ""
                    blocks.append(f'<p style="font-size:{fs*1.333:.2f}px;color:#{col};font-weight:{b};'
                        f'font-style:{it};text-align:{al};margin:0 0 {sa*1.333:.1f}px;line-height:{lh};'
                        f'{ls}{pad}">{mark}{body}</p>')
                sty=(f"left:{px(x)};top:{px(y)};width:{px(w)};height:{px(h)};"
                     f"display:flex;flex-direction:column;justify-content:{VA[o['valign']]}")
                out.append(f'<div class="tx" style="{sty}">{"".join(blocks)}</div>')
        out.append("</section>")
        return "".join(out)

    def xml(self):
        bg=(f'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="{self.bg}"/></a:solidFill>'
            f'<a:effectLst/></p:bgPr></p:bg>') if self.bg else ''
        return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            f'<p:cSld>{bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            + "".join(self.body) +
            '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>')

# ---------------------------------------------------------------- slide content
slides=[]
def head(s,kicker,title,dark=False):
    s.text(M,0.40,CW,0.32,kicker,size=12,bold=True,color=AMBER,spc=2)
    s.text(M,0.72,CW,0.76,title,size=32,bold=True,color=WHITE if dark else NAVY)

# 1 — title
s=Slide(NAVY)
s.rect(0,0,SW,0.09,fill=AMBER)
s.text(M,1.15,CW,0.34,"CSI 603  ·  INFORMATION SYSTEMS ENGINEERING",size=12.5,bold=True,color=AMBER,spc=2.4)
s.text(M,1.60,CW,1.95,"Software Requirements\nSpecification",size=46,bold=True,color=WHITE,line_sp=105)
s.text(M,3.66,CW,0.5,"PropManage BW — Property Management System",size=21,color=ICE)
for i,(n,l) in enumerate([("67","Functional requirements"),("46","Non-functional"),
                          ("18","Use cases"),("45","Pages")]):
    x=M+i*2.42
    s.roundrect(x,4.60,2.18,1.12,fill=MID,r=0.10)
    s.text(x,4.70,2.18,0.52,n,size=27,bold=True,color=AMBER,align="ctr")
    s.text(x,5.22,2.18,0.38,l,size=10.5,color=ICE,align="ctr")
s.text(M,6.45,CW,0.4,"Georgy Moni   ·   202100062   ·   Assignment 1   ·   August 2026",size=13,color=ICE)
s.notes=("Good morning. I'm Georgy Moni. This is the Software Requirements Specification for "
 "PropManage BW, a property management system for landlords in Botswana. In the next four minutes: "
 "what the system is for, the requirements that matter most, and how I kept them verifiable. [~20s]")
slides.append(s)

# 2 — why
s=Slide(); head(s,"THE PROBLEM","Why PropManage BW exists")
s.roundrect(M,1.70,5.5,4.35,fill=SURF,line=LINE)
s.text(M+0.34,1.98,4.8,0.4,"How landlords work today",size=17,bold=True,color=NAVY)
s.text(M+0.34,2.48,4.82,2.3,[
 {"t":"Rent tracked in spreadsheets and notebooks","bullet":True},
 {"t":"Arrears found at month end, not when they arise","bullet":True},
 {"t":"Repairs reported by phone, with no record","bullet":True},
 {"t":"Receipts written by hand, or not at all","bullet":True}],size=14.5,space_after=10)
s.text(M+0.34,5.05,4.8,0.85,"Small and medium landlords — the target market — have no system of record.",
       size=13.5,italic=True,color=MUTED)
for i,(n,t,d) in enumerate([("1","One accurate record","Properties, units, tenants and leases in a single place"),
    ("2","Rent raised automatically","No charge is forgotten, every month, without human effort"),
    ("3","Arrears visible immediately","Overdue rent surfaces the day it arises, not at month end")]):
    y=1.70+i*1.50
    s.roundrect(6.48,y,6.23,1.30,fill=WHITE,line=LINE,r=0.10,shadow=True)
    s.ellipse(6.76,y+0.33,0.62,0.62,fill=AMBER)
    s.text(6.76,y+0.33,0.62,0.62,n,size=19,bold=True,color=NAVY,align="ctr",valign="ctr")
    s.text(7.58,y+0.25,4.9,0.34,t,size=15.5,bold=True,color=NAVY)
    s.text(7.58,y+0.62,4.9,0.62,d,size=12,color=MUTED)
s.notes=("The system replaces manual practice, not another product. Landlords track rent in spreadsheets, "
 "find arrears at month end, and take repair reports by phone with no record. The SRS sets three objectives "
 "against that: one accurate record, rent raised automatically, arrears visible the day they arise. [~30s]")
slides.append(s)

# 3 — scope
s=Slide(); head(s,"SECTION 1.2","Scope — bounded in both directions")
cols=[(M,6.05,"In scope",NAVY,SURF,INK,
   ["Accounts and role-based access for three roles",
    "Guided onboarding: property, houses, units, tenants",
    "Portfolio: properties, units and photographs",
    "Tenants, leases and unit assignment",
    "Automatic rent cycle, payments and receipts",
    "Maintenance workflow and tenancy messaging",
    "Dashboards and spreadsheet exports"]),
  (7.28,5.43,"Out of scope",MUTED,PALE,MUTED,
   ["Online payment gateway or mobile money",
    "Automated SMS and e-mail reminders",
    "Subscription billing for the price plans",
    "Lease documents and e-signature",
    "Tenant credit screening",
    "A native mobile application"])]
for x,w,t,c,bgc,tc,items in cols:
    s.roundrect(x,1.70,w,4.42,fill=bgc,line=LINE)
    s.text(x+0.34,1.96,w-0.68,0.4,t,size=18,bold=True,color=c)
    s.text(x+0.34,2.48,w-0.68,3.5,[{"t":i,"bullet":True} for i in items],
           size=13.5,color=tc,space_after=9)
s.text(M,6.32,CW,0.4,"Everything excluded is either specified as future scope (FS-01…FS-09) or given a reason.",
       size=13,italic=True,color=MUTED)
s.notes=("Scope is stated in both directions. Seven capability groups in, six explicitly out, each with a "
 "reason. Anything excluded but intended appears as future scope with its own identifier, so the boundary "
 "is never ambiguous. [~25s]")
slides.append(s)

# 4 — users
s=Slide(); head(s,"SECTION 2.3","Four user classes, one system")
for i,(n,pop,dev,goal) in enumerate([
    ("Landlord","Up to 500","Laptop and mobile","Knows what rent is outstanding; records payments; resolves repairs"),
    ("Tenant","Up to 5,000","Mobile phone","Checks rent status, gets a receipt, reports a fault"),
    ("Administrator","1 – 3","Desktop","Monitors adoption and collections across all landlords"),
    ("Prospective\ncustomer","Unbounded","Mobile or desktop","Understands what the product does and what it costs")]):
    x=M+i*3.10; w=2.86
    s.roundrect(x,1.78,w,4.22,fill=WHITE,line=LINE,shadow=True)
    s.roundrect(x,1.78,w,1.02,fill=NAVY if i==0 else MID,r=0.10)
    s.text(x+0.16,1.84,w-0.32,0.90,n,size=16,bold=True,color=WHITE,align="ctr",valign="ctr")
    s.text(x+0.16,2.98,w-0.32,0.56,pop,size=23,bold=True,color=AMBER,align="ctr")
    s.text(x+0.16,3.52,w-0.32,0.3,"expected users",size=10,color=MUTED,align="ctr")
    s.text(x+0.16,3.92,w-0.32,0.32,dev,size=12,bold=True,color=NAVY,align="ctr")
    s.text(x+0.22,4.32,w-0.44,1.55,goal,size=11.5,color=MUTED,align="ctr")
s.text(M,6.22,CW,0.45,"The tenant class is the largest and mostly on a phone — which is why the mobile layout "
       "requirements are the strictest in the document.",size=13,italic=True,color=MUTED)
s.notes=("Four user classes. The landlord is the paying customer and gets the richest interface. The tenant "
 "class is the largest by population and predominantly on a phone, which is why the mobile layout "
 "requirements are the strictest in the document. [~25s]")
slides.append(s)

# 5 — numbers
s=Slide(); head(s,"SECTION 3","What the specification contains")
for i,(n,l,sub) in enumerate([("67","Functional\nrequirements","FR-01 … FR-67"),
    ("46","Non-functional\nrequirements","NFR-01 … NFR-46"),
    ("24","External interface\nrequirements","UI · HW · SW · CI"),
    ("18","Use cases","12 specified in full")]):
    x=M+i*3.10; w=2.86
    s.roundrect(x,1.84,w,2.62,fill=NAVY if i%2==0 else MID,r=0.10)
    s.text(x,2.02,w,1.05,n,size=56,bold=True,color=AMBER,align="ctr")
    s.text(x+0.16,3.10,w-0.32,0.74,l,size=13.5,bold=True,color=WHITE,align="ctr")
    s.text(x+0.16,3.88,w-0.32,0.34,sub,size=10.5,color=ICE,align="ctr")
for i,(t,d) in enumerate([("Seven quality attributes",
     "Performance · security · usability · reliability and availability · maintainability · scalability · compatibility"),
    ("Verified against the build",
     "Validation limits, enumerated values and scheduled behaviour taken from the implemented system")]):
    y=4.72+i*0.92
    s.roundrect(M,y,CW,0.78,fill=SURF,line=LINE,r=0.09)
    s.text(M+0.28,y,3.9,0.78,t,size=14,bold=True,color=NAVY,valign="ctr")
    s.text(M+4.30,y,CW-4.6,0.78,d,size=12,color=MUTED,valign="ctr")
s.notes=("The specification carries 67 functional requirements, 46 non-functional across seven quality "
 "attributes, 24 interface requirements and 18 use cases, 12 written out in full. Every limit and "
 "enumerated value was checked against the implemented system rather than invented. [~25s]")
slides.append(s)

# 6 — rent cycle
s=Slide(); head(s,"CRITICAL REQUIREMENT  ·  FR-27 … FR-30","The automated rent cycle")
s.text(M,1.50,CW,0.4,"The heart of the system: rent is raised without anyone doing anything.",size=14.5,color=MUTED)
for i,(fr,t,d) in enumerate([("FR-29","Scheduler fires","Once every day at 02:15 UTC, with no human involved"),
    ("FR-27","Obligation raised","One charge per active lease on an occupied unit with rent above zero"),
    ("FR-28","Duplicates refused","At most one system charge per tenant per due date"),
    ("FR-30","Arrears marked","Every pending payment past its due date becomes overdue")]):
    x=M+i*3.16; w=2.72
    s.roundrect(x,2.08,w,2.78,fill=WHITE,line=LINE,r=0.10,shadow=True)
    s.ellipse(x+w/2-0.34,2.30,0.68,0.68,fill=NAVY)
    s.text(x+w/2-0.34,2.30,0.68,0.68,str(i+1),size=21,bold=True,color=AMBER,align="ctr",valign="ctr")
    s.text(x+0.14,3.12,w-0.28,0.3,fr,size=10.5,bold=True,color=AMBER,align="ctr")
    s.text(x+0.14,3.42,w-0.28,0.36,t,size=14.5,bold=True,color=NAVY,align="ctr")
    s.text(x+0.18,3.84,w-0.36,0.95,d,size=11.5,color=MUTED,align="ctr")
    if i<3: s.text(x+w+0.02,3.16,0.42,0.5,"›",size=28,bold=True,color=AMBER,align="ctr")
s.roundrect(M,5.22,CW,1.18,fill=NAVY,r=0.10)
s.text(M+0.34,5.40,2.5,0.34,"Why it matters",size=14,bold=True,color=AMBER)
s.text(M+2.90,5.34,CW-3.24,0.94,"The cycle is idempotent (NFR-33) — running it any number of times in a month "
  "produces exactly one charge per tenant. A retry after a failure can never double-charge a tenant.",
  size=13,color=WHITE,valign="ctr")
s.notes=("This is the requirement the whole product rests on. A scheduled job runs daily at 02:15 UTC, raises "
 "one charge per active lease, refuses duplicates, and marks unpaid charges overdue. The important property "
 "is idempotence — running it repeatedly still produces exactly one charge, so a retry can never "
 "double-charge a tenant. [~35s]")
slides.append(s)

# 7 — payments
s=Slide(); head(s,"CRITICAL REQUIREMENT  ·  FR-31 … FR-37","Payments, arrears and receipts")
s.text(M,1.58,5.9,0.34,"Payment status",size=14.5,bold=True,color=NAVY)
for i,(t,c,note) in enumerate([("pending",MID,"due date passes"),("overdue",RED,"payment recorded"),
                               ("paid",GREEN,"terminal state")]):
    y=2.04+i*0.80
    s.roundrect(M,y,2.05,0.60,fill=c,r=0.30)
    s.text(M,y,2.05,0.60,t,size=14.5,bold=True,color=WHITE,align="ctr",valign="ctr")
    s.text(M+2.24,y,2.2,0.60,note,size=11,color=MUTED,valign="ctr")
s.roundrect(M,4.60,5.4,1.55,fill=SURF,line=LINE,r=0.10)
s.text(M+0.28,4.76,4.85,1.25,"Rent is received outside the system — bank transfer, cash or mobile money — and "
  "recorded afterwards. The system is a record of payment, not a means of payment (ASM-01).",size=12.5)
s.text(6.85,1.58,5.86,0.34,"Rules that protect the money",size=14.5,bold=True,color=NAVY)
for i,(fr,d) in enumerate([("FR-33","A payment already marked paid cannot be recorded again — a double entry cannot understate arrears"),
    ("FR-36","A receipt is issued only for a payment whose status is paid"),
    ("FR-37","Only the managing landlord or the tenant named on the payment may obtain it"),
    ("FR-32","A payment date that is not a valid date is rejected before anything is written")]):
    y=2.04+i*1.13
    s.roundrect(6.85,y,5.86,0.99,fill=WHITE,line=LINE,r=0.10,shadow=True)
    s.roundrect(7.04,y+0.28,0.86,0.43,fill=NAVY,r=0.07)
    s.text(7.04,y+0.28,0.86,0.43,fr,size=11,bold=True,color=AMBER,align="ctr",valign="ctr")
    s.text(8.04,y+0.10,4.52,0.79,d,size=12,valign="ctr")
s.notes=("Payments move through three states. Rent is received outside the system and recorded afterwards — "
 "the system is a record of payment, not a means of payment, and that assumption is stated explicitly. Four "
 "rules protect the money: no double recording, receipts only for settled payments, and only the landlord or "
 "the named tenant can obtain one. [~35s]")
slides.append(s)

# 8 — security
s=Slide(NAVY); head(s,"NON-FUNCTIONAL  ·  NFR-10 … NFR-13","Authorisation lives in the database",dark=True)
s.text(M,1.54,11.4,0.5,"Every table carries row-level rules. A defect in the interface cannot, on its own, "
  "expose one landlord's portfolio to another.",size=15,color=ICE)
for i,(n,t,d) in enumerate([("NFR-10","Deny by default",
    "Row-level security is enabled on every table holding landlord, tenant, payment, maintenance or message data. A row is readable only where a policy grants it."),
   ("NFR-11","Portfolio isolation",
    "A landlord reads and modifies only their own records. A request for another landlord's data returns nothing and changes nothing — even when it is well formed and the identifier is valid."),
   ("NFR-13","Decided on the server",
    "No authorisation decision depends on a value from the browser. Changing client-side state cannot widen what a user can reach.")]):
    x=M+i*4.13; w=3.85
    s.roundrect(x,2.32,w,3.32,fill=MID,r=0.12)
    s.text(x+0.28,2.56,w-0.56,0.32,n,size=11.5,bold=True,color=AMBER)
    s.text(x+0.28,2.90,w-0.56,0.44,t,size=17,bold=True,color=WHITE)
    s.text(x+0.28,3.44,w-0.56,2.05,d,size=12.5,color=ICE)
s.text(M,6.02,CW,0.45,"Tenant data is personal data. Botswana's Data Protection Act 2018 is recorded as a "
  "constraint (CON-10), not an afterthought.",size=13,italic=True,color=ICE)
s.notes=("The security requirements are the ones I'd defend hardest. Authorisation is enforced in the "
 "database, not just the interface — every table denies by default, a landlord can only ever reach their own "
 "portfolio, and no decision depends on anything the browser sends. Tenant data is personal data, so the "
 "Data Protection Act is a stated constraint. [~30s]")
slides.append(s)

# 9 — measurable
s=Slide(); head(s,"QUALITY OF THE REQUIREMENTS","Measurable, not vague")
s.text(M,1.48,CW,0.4,"Every non-functional requirement states a criterion that can be tested rather than "
  "argued about.",size=14.5,color=MUTED)
s.text(M+0.28,1.98,4.4,0.32,"AVOIDED",size=12,bold=True,color=MUTED,spc=1.5)
s.text(6.10,1.98,6.6,0.32,"SPECIFIED INSTEAD",size=12,bold=True,color=NAVY,spc=1.5)
for i,(bad,fr,good) in enumerate([
    ('"The system should be fast"',"NFR-01","The dashboard becomes interactive within 2.5 seconds at the 95th percentile, for up to 20 properties and 200 units"),
    ('"It should be user-friendly"',"NFR-23","A new landlord completes onboarding in 10 minutes without training — 4 of 5 test participants succeed"),
    ('"It should be reliable"',"NFR-29","99.5% availability each calendar month, outside announced maintenance"),
    ('"It should be accessible"',"NFR-24","Contrast of at least 4.5:1 for normal text, meeting WCAG 2.1 level AA")]):
    y=2.40+i*1.04
    s.roundrect(M,y,5.05,0.90,fill=PALE,line=LINE,r=0.09)
    s.text(M+0.26,y,4.55,0.90,bad,size=13,italic=True,color=MUTED,valign="ctr")
    s.text(5.72,y+0.16,0.32,0.56,"›",size=23,bold=True,color=AMBER,align="ctr")
    s.roundrect(6.10,y,6.61,0.90,fill=WHITE,line=LINE,r=0.09,shadow=True)
    s.roundrect(6.30,y+0.23,0.92,0.43,fill=NAVY,r=0.07)
    s.text(6.30,y+0.23,0.92,0.43,fr,size=10.5,bold=True,color=AMBER,align="ctr",valign="ctr")
    s.text(7.34,y+0.05,5.22,0.80,good,size=12,valign="ctr")
s.notes=("This is where I put most of the effort. Nothing in the document says fast, or user-friendly, or "
 "reliable. Each becomes a number with a method attached — 2.5 seconds at the 95th percentile, ten minutes "
 "with four of five participants, 99.5 percent a month, 4.5 to 1 contrast. If it can't be measured, it isn't "
 "a requirement. [~30s]")
slides.append(s)

# 10 — scope discipline
s=Slide(); head(s,"SECTION 3.5","What the SRS deliberately does not promise")
s.text(M,1.48,CW,0.44,"Nine capabilities are intended but excluded from this baseline. They carry their own "
  "identifiers so they are never mistaken for acceptance criteria.",size=14.5,color=MUTED)
for i,(fs,d) in enumerate([("FS-01","Online payment gateway and mobile money"),
    ("FS-02","Automated rent reminders by e-mail and SMS"),("FS-03","Subscription billing and plan limits"),
    ("FS-04","Password change and two-factor authentication"),("FS-05","Lease documents and renewal alerts"),
    ("FS-06","Filtering and search on the maintenance board")]):
    x=M+(i%3)*4.13; y=2.04+(i//3)*1.16; w=3.85
    s.roundrect(x,y,w,0.99,fill=WHITE,line=LINE,r=0.10,shadow=True)
    s.roundrect(x+0.20,y+0.28,0.84,0.43,fill=MID,r=0.07)
    s.text(x+0.20,y+0.28,0.84,0.43,fs,size=10.5,bold=True,color=AMBER,align="ctr",valign="ctr")
    s.text(x+1.14,y+0.08,w-1.34,0.83,d,size=12,valign="ctr")
s.roundrect(M,4.60,CW,1.55,fill=SURF,line=AMBER,r=0.12)
s.text(M+0.36,4.80,4.4,0.36,"An honest specification",size=16,bold=True,color=NAVY)
s.text(M+0.36,5.18,CW-0.72,0.92,"Three screens already show controls that are not connected to anything — the "
  "password fields, the notification preferences and the maintenance filters. The SRS records them as future "
  "scope rather than specifying them as delivered behaviour, so the document cannot overstate what the "
  "system does.",size=13)
s.notes=("Nine capabilities are intended but deliberately outside the baseline, each with its own identifier. "
 "One point I want to make: three screens already show controls that aren't wired up yet. Rather than specify "
 "them as delivered, I recorded them as future scope — the document doesn't overstate what the system does. [~30s]")
slides.append(s)

# 11 — close
s=Slide(NAVY)
s.rect(0,7.41,SW,0.09,fill=AMBER)
s.text(M,0.92,CW,0.32,"IN CLOSING",size=12,bold=True,color=AMBER,spc=2)
s.text(M,1.26,11.6,0.82,"Every requirement is traced and verifiable",size=34,bold=True,color=WHITE)
s.text(M,2.16,11.4,0.5,"The traceability matrix maps each requirement to the feature it realises, the use case "
  "that exercises it, and the method that will confirm it.",size=15,color=ICE)
for i,(t,d) in enumerate([("Test","Executed against a defined expected result"),
    ("Demonstration","Operated and observed"),("Inspection","Product or documentation examined"),
    ("Analysis","Reasoned from models and measurements")]):
    x=M+i*3.10; w=2.86
    s.roundrect(x,3.02,w,1.74,fill=MID,r=0.12)
    s.text(x+0.18,3.24,w-0.36,0.44,t,size=18,bold=True,color=AMBER,align="ctr")
    s.text(x+0.20,3.74,w-0.40,0.9,d,size=12,color=ICE,align="ctr")
s.text(M,5.10,11.6,0.85,"The specification is a foundation for design, not a wish list: it carries the data "
  "model, the process decomposition, the state models, and a verification method for all 137 numbered "
  "requirements.",size=14.5,color=WHITE)
s.text(M,6.18,8.0,0.5,"Thank you — questions welcome",size=19,bold=True,color=AMBER)
s.text(8.2,6.26,4.5,0.4,"Georgy Moni  ·  202100062",size=13,color=ICE,align="r")
s.notes=("To close: every one of the 137 numbered requirements traces to a feature, a use case, and a method "
 "that will confirm it — test, demonstration, inspection or analysis. That's what makes this a foundation for "
 "the design phase rather than a wish list. Thank you — happy to take questions. [~25s]")
slides.append(s)

# ------------------------------------------------------------------- packaging
A='xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
R='xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
P='xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'
HDR='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
N=len(slides)

def theme():
    dk=lambda n,v:f'<a:{n}><a:srgbClr val="{v}"/></a:{n}>'
    fill=('<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
          '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
          '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>')
    ln=('<a:lnStyleLst>'+('<a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill>'
        '<a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>')*3+'</a:lnStyleLst>')
    ef='<a:effectStyleLst>'+('<a:effectStyle><a:effectLst/></a:effectStyle>')*3+'</a:effectStyleLst>'
    bg=('<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
        '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
        '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>')
    return (HDR+f'<a:theme {A} name="PropManage"><a:themeElements><a:clrScheme name="PropManage">'
      f'<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>'
      f'<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>'
      +dk("dk2",NAVY)+dk("lt2",SURF)+dk("accent1",NAVY)+dk("accent2",MID)+dk("accent3",AMBER)
      +dk("accent4",MUTED)+dk("accent5",ICE)+dk("accent6",GREEN)+dk("hlink",MID)+dk("folHlink",MUTED)+
      '</a:clrScheme><a:fontScheme name="PropManage">'
      f'<a:majorFont><a:latin typeface="{F}"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
      f'<a:minorFont><a:latin typeface="{F}"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>'
      '</a:fontScheme><a:fmtScheme name="PropManage">'+fill+ln+ef+bg+
      '</a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>')

EMPTY_TREE=('<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
  '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/>'
  '<a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree>')
CLRMAP=('<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" '
  'accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>')

def master():
    return (HDR+f'<p:sldMaster {A} {R} {P}><p:cSld><p:bg><p:bgPr>'
      '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>'
      +EMPTY_TREE+'</p:cSld>'+CLRMAP+
      '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
      '<p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>')

def layout():
    return (HDR+f'<p:sldLayout {A} {R} {P} type="blank" preserve="1">'
      '<p:cSld name="Blank">'+EMPTY_TREE+'</p:cSld>'
      '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>')

def notes_master():
    return (HDR+f'<p:notesMaster {A} {R} {P}><p:cSld>'+EMPTY_TREE+'</p:cSld>'+CLRMAP+
      '<p:notesStyle/></p:notesMaster>')

def notes_slide(text):
    paras="".join(f'<a:p><a:r><a:rPr lang="en-GB" dirty="0"/><a:t>{esc(p)}</a:t></a:r></a:p>'
                  for p in [text])
    return (HDR+f'<p:notesSlide {A} {R} {P}><p:cSld><p:spTree>'
      '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
      '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/>'
      '<a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
      '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder"/>'
      '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>'
      '<p:spPr><a:xfrm><a:off x="685800" y="2971800"/><a:ext cx="5486400" cy="4114800"/></a:xfrm>'
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>'
      f'<p:txBody><a:bodyPr/><a:lstStyle/>{paras}</p:txBody></p:sp>'
      '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notesSlide>')

def presentation():
    sld="".join(f'<p:sldId id="{256+i}" r:id="rId{2+i}"/>' for i in range(N))
    return (HDR+f'<p:presentation {A} {R} {P} saveSubsetFonts="1">'
      '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
      f'<p:notesMasterIdLst><p:notesMasterId r:id="rId{2+N}"/></p:notesMasterIdLst>'
      f'<p:sldIdLst>{sld}</p:sldIdLst>'
      f'<p:sldSz cx="{emu(SW)}" cy="{emu(SH)}"/><p:notesSz cx="{emu(SH)}" cy="{emu(SW)}"/>'
      '</p:presentation>')

def rels(items):
    body="".join(f'<Relationship Id="{i}" Type="{t}" Target="{tg}"/>' for i,t,tg in items)
    return (HDR+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            +body+'</Relationships>')

RT="http://schemas.openxmlformats.org/officeDocument/2006/relationships/"
OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                 "CSI603-SRS-PropManage-BW-Presentation.pptx")

ct=[('<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'),
    ('<Default Extension="xml" ContentType="application/xml"/>'),
    ('<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'),
    ('<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'),
    ('<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'),
    ('<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>'),
    ('<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'),
    ('<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'),
    ('<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>')]
for i in range(1,N+1):
    ct.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
    ct.append(f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>')

z=zipfile.ZipFile(OUT,"w",zipfile.ZIP_DEFLATED)
z.writestr("[Content_Types].xml",HDR+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+"".join(ct)+'</Types>')
z.writestr("_rels/.rels",rels([("rId1",RT+"officeDocument","ppt/presentation.xml"),
    ("rId2","http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties","docProps/core.xml"),
    ("rId3",RT+"extended-properties","docProps/app.xml")]))
z.writestr("docProps/core.xml",HDR+'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    '<dc:title>Software Requirements Specification — PropManage BW</dc:title>'
    '<dc:creator>Georgy Moni</dc:creator><cp:lastModifiedBy>Georgy Moni</cp:lastModifiedBy>'
    '</cp:coreProperties>')
z.writestr("docProps/app.xml",HDR+'<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
    'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
    f'<Application>Microsoft Office PowerPoint</Application><Slides>{N}</Slides>'
    '<Company></Company></Properties>')
prels=[("rId1",RT+"slideMaster","slideMasters/slideMaster1.xml")]
prels+= [(f"rId{2+i}",RT+"slide",f"slides/slide{i+1}.xml") for i in range(N)]
prels+= [(f"rId{2+N}",RT+"notesMaster","notesMasters/notesMaster1.xml"),
         (f"rId{3+N}",RT+"theme","theme/theme1.xml")]
z.writestr("ppt/presentation.xml",presentation())
z.writestr("ppt/_rels/presentation.xml.rels",rels(prels))
z.writestr("ppt/theme/theme1.xml",theme())
z.writestr("ppt/slideMasters/slideMaster1.xml",master())
z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels",rels([
    ("rId1",RT+"slideLayout","../slideLayouts/slideLayout1.xml"),
    ("rId2",RT+"theme","../theme/theme1.xml")]))
z.writestr("ppt/slideLayouts/slideLayout1.xml",layout())
z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels",rels([
    ("rId1",RT+"slideMaster","../slideMasters/slideMaster1.xml")]))
z.writestr("ppt/notesMasters/notesMaster1.xml",notes_master())
z.writestr("ppt/notesMasters/_rels/notesMaster1.xml.rels",rels([
    ("rId1",RT+"theme","../theme/theme1.xml")]))
for i,sl in enumerate(slides,1):
    z.writestr(f"ppt/slides/slide{i}.xml",sl.xml())
    z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels",rels([
        ("rId1",RT+"slideLayout","../slideLayouts/slideLayout1.xml"),
        ("rId2",RT+"notesSlide",f"../notesSlides/notesSlide{i}.xml")]))
    z.writestr(f"ppt/notesSlides/notesSlide{i}.xml",notes_slide(sl.notes))
    z.writestr(f"ppt/notesSlides/_rels/notesSlide{i}.xml.rels",rels([
        ("rId1",RT+"slide",f"../slides/slide{i}.xml"),
        ("rId2",RT+"notesMaster","../notesMasters/notesMaster1.xml")]))
z.close()
print("written:",OUT,os.path.getsize(OUT),"bytes,",N,"slides")

# ---------------------------------------------------- PDF fallback of the deck
HTML_OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"deck.print.html")
PDF_OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                     "CSI603-SRS-PropManage-BW-Presentation.pdf")
css = """
*{box-sizing:border-box;margin:0;padding:0}
@page{size:%.3fin %.3fin;margin:0}
html,body{font-family:Calibri,"DejaVu Sans",Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sl{position:relative;width:%.3fin;height:%.3fin;overflow:hidden;page-break-after:always;break-after:page}
.sl:last-child{page-break-after:auto}
.sh,.tx{position:absolute}
""" % (SW,SH,SW,SH)
doc=('<!doctype html><html lang="en"><head><meta charset="utf-8">'
     '<title>SRS — PropManage BW</title><style>'+css+'</style></head><body>'
     + "".join(s.html() for s in slides) + '</body></html>')
open(HTML_OUT,"w").write(doc)
chrome=os.environ.get("CHROME_BIN","/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
if os.path.exists(chrome):
    import subprocess
    r=subprocess.run([chrome,"--headless","--no-sandbox","--disable-gpu","--no-pdf-header-footer",
        f"--print-to-pdf={PDF_OUT}","--print-to-pdf-no-header",f"file://{HTML_OUT}"],
        capture_output=True,text=True,timeout=180)
    print("pdf:",PDF_OUT,os.path.getsize(PDF_OUT) if os.path.exists(PDF_OUT) else "MISSING")
