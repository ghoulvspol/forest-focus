#!/usr/bin/env python3
"""
Build a static HTML site for the Principality of Sealand Knowledge Graph.
Color scheme: Red and White theme
Authors: 知乔 & Claude Code
"""

import os, re, shutil, yaml, markdown
from pathlib import Path

VAULT = Path(__file__).parent / "vault" / "sealand"
OUT = Path(__file__).parent / "output"
SITE_TITLE = "西兰公国知识图谱"
SITE_LOGO = "S"

CATEGORY_DIRS = {
    "events": "events", "concepts": "concepts", "people": "people",
    "places": "places", "legal": "legal", "index-pages": "index-pages",
}
CATEGORY_LABELS = {
    "events": "大事件", "concepts": "概念", "people": "人物",
    "places": "地点", "legal": "法律", "index-pages": "索引",
}

def collect_files():
    files = []
    w = VAULT / "欢迎.md"
    if w.exists():
        fm, body = parse_md(w)
        files.append({"path": w, "stem": "欢迎", "category": "home", "fm": fm, "body": body})
    for cat, dn in CATEGORY_DIRS.items():
        d = VAULT / dn
        if not d.is_dir(): continue
        for f in sorted(d.glob("*.md")):
            fm, body = parse_md(f)
            files.append({"path": f, "stem": f.stem, "category": cat, "fm": fm, "body": body})
    return files

def parse_md(fp):
    t = fp.read_text(encoding="utf-8")
    fm, body = {}, t
    if t.startswith("---"):
        p = t.split("---", 2)
        if len(p) >= 3:
            try: fm = yaml.safe_load(p[1]) or {}
            except: pass
            body = p[2]
    return fm, body

def build_link_map(files):
    lm = {}
    for f in files:
        s, c = f["stem"], f["category"]
        lm[s] = "/index.html" if c == "home" else f"/{c}/{s}.html"
        for a in f["fm"].get("aliases", []):
            if a not in lm: lm[a] = lm[s]
    return lm

def convert_wikilinks(text, lm):
    def r(m):
        inner = m.group(1)
        t, d = inner.split("|", 1) if "|" in inner else (inner, inner)
        t, d = t.strip(), d.strip()
        url = lm.get(t)
        return f'<a href="{url}">{d}</a>' if url else d
    return re.sub(r'\[\[([^\]]+)\]\]', r, text)

def md_to_html(t):
    return markdown.markdown(t, extensions=['tables', 'fenced_code', 'toc', 'nl2br'])

def count_references(files):
    c = {}
    for f in files:
        for m in re.finditer(r'\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]', f["body"]):
            c[m.group(1).strip()] = c.get(m.group(1).strip(), 0) + 1
    return c

def build_backlinks(files, lm):
    a2s = {}
    for f in files:
        a2s[f["stem"]] = f["stem"]
        for a in f["fm"].get("aliases", []): a2s[a] = f["stem"]
    bl = {}
    for f in files:
        seen = set()
        for m in re.finditer(r'\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]', f["body"]):
            tgt = a2s.get(m.group(1).strip(), m.group(1).strip())
            if tgt == f["stem"] or tgt in seen: continue
            seen.add(tgt)
            s, e = max(0, m.start()-60), min(len(f["body"]), m.end()+60)
            ex = f["body"][s:e].replace("\n"," ").strip()
            ex = re.sub(r'\*\*([^*]+)\*\*', r'\1', ex)
            ex = re.sub(r'\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]', lambda x: x.group(2) or x.group(1), ex)
            if s > 0: ex = "\u2026" + ex
            if e < len(f["body"]): ex = ex + "\u2026"
            bl.setdefault(tgt, []).append({"stem": f["stem"], "category": f["category"], "title": f["fm"].get("title", f["stem"]), "excerpt": ex})
    return bl

CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#FFF8F8;--bg2:#FDE8E8;--text:#2C1A1A;--text2:#8B5E5E;
  --gold:#C41E3A;--gold-light:#E8475F;--gold-glow:rgba(196,30,58,.10);
  --navy:#7A1B2E;--navy-light:#9B2D43;--cream:#FFF0F0;
  --border:#F0C8C8;--card:#FFFFFF;--link:#B01030;
  --serif:'Noto Serif SC','Crimson Pro',Georgia,serif;
  --sans:'DM Sans',-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;
  --sidebar-w:260px;
}
html{font-size:15px;scroll-behavior:smooth}
body{font-family:var(--sans);color:var(--text);background:var(--bg);display:flex;min-height:100vh;line-height:1.8;-webkit-font-smoothing:antialiased}

.sidebar{width:var(--sidebar-w);background:var(--navy);position:fixed;top:0;left:0;bottom:0;overflow-y:auto;z-index:100;display:flex;flex-direction:column}
.sidebar-header{padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.logo{color:#fff;font-size:17px;font-weight:700;text-decoration:none;letter-spacing:.5px;font-family:var(--serif);display:block}
.logo:hover{color:var(--gold-light)}
.sidebar-nav{flex:1;padding:8px 0;overflow-y:auto;display:flex;flex-direction:column;height:100%}
.sidebar-nav::-webkit-scrollbar{width:4px}
.sidebar-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
.nav-link{display:block;padding:6px 16px;color:#cbd5e1;text-decoration:none;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-left:3px solid transparent;transition:all .15s}
.nav-link:hover{background:rgba(255,255,255,.06);color:#fff}
.nav-link.active{color:#fff;background:rgba(196,30,58,.2);border-left-color:var(--gold-light);font-weight:600}
.nav-home{font-size:14px;padding:10px 16px;font-weight:500;margin-bottom:4px}
.nav-group{margin-bottom:2px}
.nav-group-title{padding:8px 16px;color:#cbd5e1;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;cursor:pointer;display:flex;align-items:center;gap:6px;user-select:none;transition:color .15s}
.nav-group-title:hover{color:#fff}
.caret{display:inline-block;width:0;height:0;border-left:5px solid #cbd5e1;border-top:4px solid transparent;border-bottom:4px solid transparent;transition:transform .2s}
.nav-group.open .nav-group-title .caret{transform:rotate(90deg);border-left-color:#fff}
.nav-group-title .badge{margin-left:auto;background:rgba(255,255,255,.1);color:#cbd5e1;font-size:11px;padding:1px 6px;border-radius:8px;font-weight:400}
.nav-group-items{display:none;padding-left:8px}
.nav-group.open .nav-group-items{display:block}
.hamburger{display:none;position:fixed;top:12px;left:12px;z-index:200;background:var(--navy);color:#fff;border:none;font-size:20px;padding:6px 10px;border-radius:6px;cursor:pointer}

.main{margin-left:max(var(--sidebar-w),calc((100vw - 1160px)/2));flex:1;position:relative;max-width:1160px;padding:0}
.article{max-width:820px;padding:48px 48px 80px}
.meta{font-size:13px;color:var(--text2);margin-bottom:16px;display:flex;align-items:center;gap:8px}
.type-badge{font-size:11px;padding:2px 8px;border-radius:4px;color:#fff;font-weight:600}
.type-大事件{background:#C41E3A}.type-概念{background:#8B2F5E}.type-人物{background:#B85C1E}
.type-地点{background:#1A6B7C}.type-法律{background:#5E4A8B}.type-索引{background:#6B6560}

.article h1{font-family:var(--serif);font-size:28px;line-height:1.3;margin-bottom:24px;font-weight:900;color:var(--navy);letter-spacing:-.5px}
.article h2{font-family:var(--serif);font-size:21px;margin:36px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--border);font-weight:700;color:var(--navy)}
.article h3{font-family:var(--serif);font-size:17px;margin:24px 0 10px;font-weight:600;color:var(--navy-light)}
.article p{margin:10px 0}.article ul,.article ol{padding-left:24px;margin:10px 0}.article li{margin:4px 0}
.article a{color:var(--link);text-decoration:none;background:linear-gradient(to bottom,transparent 60%,var(--gold-glow) 60%);transition:background .2s}
.article a:hover{background:linear-gradient(to bottom,transparent 40%,rgba(196,30,58,.2) 40%)}
.article blockquote{background:var(--cream);border-left:4px solid var(--gold);padding:14px 20px;margin:16px 0;border-radius:0 8px 8px 0;font-style:italic;color:#5C1A2A;font-family:var(--serif)}
.article blockquote p{margin:0}.article blockquote a{background:none;color:var(--gold)}
.article table{border-collapse:collapse;width:100%;margin:16px 0;font-size:14px}
.article th,.article td{border:1px solid var(--border);padding:8px 12px;text-align:left}
.article th{background:var(--bg2);font-weight:600;color:var(--navy)}
.article strong{font-weight:700}.article hr{border:none;border-top:1px solid var(--border);margin:32px 0}
.article code{background:var(--bg2);padding:2px 6px;border-radius:3px;font-size:13px;font-family:'SF Mono',Menlo,Consolas,monospace;color:#5C1A2A}

.main.has-backlinks{display:grid;grid-template-columns:minmax(0,820px) 280px;gap:0 24px;max-width:1160px}
.main-content{min-width:0}
.backlinks-panel{grid-column:2;grid-row:1/-1;position:sticky;top:24px;max-height:calc(100vh - 48px);overflow-y:auto;padding:24px 0 24px 20px;border-left:1px solid var(--border);font-size:13px;align-self:start}
.backlinks-panel::-webkit-scrollbar{width:3px}.backlinks-panel::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.bl-panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bl-panel-title{font-family:var(--serif);font-size:14px;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:8px}
.bl-count{font-size:11px;background:var(--bg2);padding:1px 7px;border-radius:10px;color:var(--text2);font-weight:600}
.bl-panel-actions{display:flex;gap:4px}
.bl-action{background:none;border:1px solid var(--border);border-radius:4px;padding:2px 8px;font-size:11px;color:var(--text2);cursor:pointer;font-family:var(--sans);transition:all .15s}
.bl-action:hover{border-color:var(--gold);color:var(--gold)}
.bl-group{margin-bottom:4px}
.bl-group-header{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:5px 0;width:100%;text-align:left;font-size:13px;font-family:var(--sans)}
.bl-group-header:hover{background:rgba(0,0,0,.02);border-radius:4px}
.bl-caret{display:inline-block;width:0;height:0;border:4px solid transparent;border-left:5px solid var(--text2);transition:transform .15s;flex-shrink:0}
.bl-group.open .bl-caret{transform:rotate(90deg)}
.bl-source-name{color:var(--navy);font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-mention-cat{font-size:10px;color:var(--text2);background:var(--bg2);padding:0 5px;border-radius:8px;flex-shrink:0;margin-left:4px}
.bl-snippets{display:none;padding:4px 0 4px 14px}
.bl-group.open .bl-snippets{display:block}
.bl-snippet{padding:6px 0;border-bottom:1px solid var(--border);line-height:1.6;color:var(--text2);font-size:12px}
.bl-snippet:last-child{border-bottom:none}
.bl-go-link{display:inline-block;font-size:11px;color:var(--link);text-decoration:none;padding:4px 0 2px;font-weight:600;transition:color .15s}
.bl-go-link:hover{color:var(--gold);text-decoration:underline}

.hero-section{position:relative;padding:72px 48px 56px;max-width:900px;margin:0 auto}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:20px;opacity:0;animation:fadeUp .6s ease forwards}
.hero-eyebrow::before{content:'';width:24px;height:1px;background:var(--gold)}
.hero-title{font-family:var(--serif);font-size:clamp(32px,5vw,48px);font-weight:900;line-height:1.25;letter-spacing:-1px;color:var(--navy);margin-bottom:6px;opacity:0;animation:fadeUp .6s ease .1s forwards}
.hero-title .gold{color:var(--gold)}
.hero-sub{font-size:17px;color:var(--text2);line-height:1.8;margin-top:16px;max-width:640px;font-family:var(--serif);font-weight:400;opacity:0;animation:fadeUp .6s ease .2s forwards}
.hero-sub b{color:var(--navy);font-weight:700}

.stats-row{display:grid;grid-template-columns:repeat(5,1fr);gap:0;max-width:900px;margin:0 auto 48px;padding:0 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);opacity:0;animation:fadeUp .6s ease .3s forwards}
.stat-item{text-align:center;padding:28px 12px;position:relative;transition:background .3s;text-decoration:none;color:inherit}
.stat-item:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:var(--border)}
.stat-item:hover{background:var(--gold-glow)}
.stat-num{font-family:var(--serif);font-size:42px;font-weight:900;color:var(--navy);line-height:1;margin-bottom:6px;letter-spacing:-2px}
.stat-label{font-size:13px;color:var(--text2);font-weight:500;letter-spacing:.5px}

.main-inner{max-width:900px;padding:0 48px 80px;margin:0 auto}
.nav-cards{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:56px;opacity:0;animation:fadeUp .6s ease .4s forwards}
.nav-card{position:relative;padding:28px 20px 24px;background:var(--card);border:1px solid var(--border);border-radius:14px;text-decoration:none;transition:all .3s cubic-bezier(.4,0,.2,1);overflow:hidden;display:block;color:inherit}
.nav-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);opacity:0;transition:opacity .3s}
.nav-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.08);border-color:var(--gold-light)}
.nav-card:hover::before{opacity:1}
.nav-card-icon{font-size:32px;margin-bottom:14px;display:block;line-height:1}
.nav-card-title{font-family:var(--serif);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:4px}
.nav-card-sub{font-size:13px;color:var(--text2)}
.nav-card-arrow{position:absolute;bottom:20px;right:20px;font-size:18px;color:var(--border);transition:all .3s}
.nav-card:hover .nav-card-arrow{color:var(--gold);transform:translateX(4px)}

.section{margin-bottom:48px}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.section-line{flex:1;height:1px;background:var(--border)}
.section-title{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--navy);white-space:nowrap}
.section-count{font-size:12px;color:var(--gold);font-weight:600;background:var(--gold-glow);padding:3px 10px;border-radius:12px;white-space:nowrap}
.tag-cloud{display:flex;flex-wrap:wrap;gap:10px}
.tag{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:var(--card);border:1px solid var(--border);border-radius:24px;font-size:14px;color:var(--text);text-decoration:none;transition:all .25s cubic-bezier(.4,0,.2,1);font-weight:500}
.tag:hover{border-color:var(--gold);color:var(--navy);box-shadow:0 4px 16px var(--gold-glow);transform:translateY(-2px)}
.tag-n{font-size:11px;font-weight:700;color:#fff;background:var(--gold);padding:2px 8px;border-radius:10px;min-width:20px;text-align:center}
.tag.tier-1{font-size:16px;padding:10px 22px;font-weight:700;border-color:var(--gold-light);background:linear-gradient(135deg,#FFFFFF,#FFF8F8)}
.tag.tier-1 .tag-n{font-size:12px;padding:3px 10px;background:var(--gold)}
.tag.tier-2{font-size:15px;padding:9px 20px;font-weight:600}
.people-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
.person-card{display:flex;flex-direction:column;align-items:center;padding:24px 16px 20px;background:var(--card);border:1px solid var(--border);border-radius:14px;text-decoration:none;transition:all .3s;text-align:center;color:inherit}
.person-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.06);border-color:var(--gold-light)}
.person-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--navy-light));display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;color:#fff;font-family:var(--serif);font-weight:700;box-shadow:0 4px 12px rgba(122,27,46,.15)}
.person-name{font-family:var(--serif);font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px}
.person-refs{font-size:12px;color:var(--text2)}
.gold-divider{display:flex;align-items:center;gap:16px;margin:56px 0}
.gold-divider::before,.gold-divider::after{content:'';flex:1;height:1px;background:linear-gradient(to right,transparent,var(--border),transparent)}
.gold-divider-diamond{width:8px;height:8px;background:var(--gold);transform:rotate(45deg);flex-shrink:0}
.footer-promo{position:relative;overflow:hidden;padding:40px;background:var(--navy);border-radius:20px;color:#fff;display:flex;gap:40px;align-items:center}
.footer-promo::before{content:'';position:absolute;top:-50%;right:-20%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(196,30,58,.2),transparent 70%)}
.promo-story{flex:1;position:relative;z-index:1;min-width:0}
.promo-story h3{font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:12px;color:var(--gold-light)}
.promo-story p{font-size:14px;color:rgba(255,255,255,.75);line-height:1.8;margin:8px 0}
.promo-credit{margin-top:16px!important;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:13px!important}
.promo-credit strong{color:var(--gold-light);font-weight:700}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.section{opacity:0;animation:fadeUp .5s ease forwards}
.section:nth-child(1){animation-delay:.45s}.section:nth-child(2){animation-delay:.55s}
.section:nth-child(3){animation-delay:.65s}.section:nth-child(4){animation-delay:.75s}

@media(max-width:1024px){.main.has-backlinks{display:block}.backlinks-panel{position:static;max-height:none;overflow-y:visible;border-left:none;border-top:1px solid var(--border);padding:24px 16px;margin-top:24px;max-width:820px}}
@media(max-width:768px){.sidebar{transform:translateX(-100%);transition:transform .3s}.sidebar.open{transform:translateX(0)}.hamburger{display:block}.main{margin-left:0;max-width:100%}.main.has-backlinks{display:block}.article{padding:48px 16px 60px}.hero-section{padding:44px 20px 20px}.hero-title{font-size:26px}.hero-sub{font-size:14px;line-height:1.6;margin-top:10px}.stats-row{padding:0 16px;margin:0 0 20px}.stat-item{padding:16px 4px}.stat-num{font-size:28px}.stat-label{font-size:11px}.main-inner{padding:0 20px 60px}.nav-cards{grid-template-columns:1fr 1fr;gap:10px}.footer-promo{flex-direction:column;text-align:center;padding:28px 20px;gap:24px}.people-grid{grid-template-columns:repeat(2,1fr)}}
"""

JS = """
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.nav-group-title').forEach(function(el){el.addEventListener('click',function(){this.parentElement.classList.toggle('open')})});
  document.querySelectorAll('.bl-group-header').forEach(function(h){h.addEventListener('click',function(){this.closest('.bl-group').classList.toggle('open')})});
  document.querySelectorAll('.bl-expand-all').forEach(function(b){b.addEventListener('click',function(){this.closest('.backlinks-panel').querySelectorAll('.bl-group').forEach(function(g){g.classList.add('open')})})});
  document.querySelectorAll('.bl-collapse-all').forEach(function(b){b.addEventListener('click',function(){this.closest('.backlinks-panel').querySelectorAll('.bl-group').forEach(function(g){g.classList.remove('open')})})});
});
"""

def build_sidebar_html(files, cur=""):
    groups = {"index-pages":[],"events":[],"concepts":[],"people":[],"places":[],"legal":[]}
    for f in files:
        if f["category"] in groups: groups[f["category"]].append(f)
    for cat in ["events","places","legal"]: groups[cat].sort(key=lambda x: x["stem"])
    for cat in ["concepts","people","index-pages"]: groups[cat].sort(key=lambda x: x["stem"])
    ha = " active" if cur == "欢迎" else ""
    html = f'<a href="/index.html" class="nav-link nav-home{ha}">\u26F5 首页</a>\n'
    order = [("index-pages","索引"),("events","大事件"),("concepts","概念"),("people","人物"),("places","地点"),("legal","法律")]
    for cat, label in order:
        oc = any(i["stem"]==cur for i in groups[cat])
        io = " open" if cat=="index-pages" or oc else ""
        gi = [f for f in groups[cat]]
        html += f'<div class="nav-group{io}">\n  <div class="nav-group-title"><span class="caret"></span>{label}<span class="badge">{len(gi)}</span></div>\n  <div class="nav-group-items">\n'
        for f in gi:
            url = f"/{cat}/{f['stem']}.html"
            a = " active" if f["stem"]==cur else ""
            html += f'    <a href="{url}" class="nav-link{a}" title="{f["stem"]}">{f["stem"]}</a>\n'
        html += '  </div>\n</div>\n'
    return html

def wrap_page(title, body_html, files, cur="", rh="", wide=False):
    sidebar = build_sidebar_html(files, cur)
    if wide: mc, mi = "main", body_html
    elif rh: mc, mi = "main has-backlinks", f'<div class="main-content article">{body_html}</div>{rh}'
    else: mc, mi = "main", f'<div class="article">{body_html}</div>'
    return f"""<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} - 西兰公国知识图谱</title><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><button class="hamburger" aria-label="菜单" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button><aside class="sidebar"><div class="sidebar-header"><a href="/index.html" class="logo">西兰公国知识图谱</a></div><div class="sidebar-nav">{sidebar}</div></aside><main class="{mc}">{mi}</main><script>{JS}</script></body></html>"""

def build_backlinks_html(stem, blm, lm):
    bl = blm.get(stem, [])
    if not bl: return ""
    cl = {"events":"事件","concepts":"概念","people":"人物","places":"地点","legal":"法律"}
    ih = ""
    for i in bl:
        url = lm.get(i["stem"], "#")
        ex = i["excerpt"].replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
        ih += f'<div class="bl-group"><button class="bl-group-header"><span class="bl-caret"></span><span class="bl-source-name">{i["title"]}</span><span class="bl-mention-cat">{cl.get(i["category"],"")}</span></button><div class="bl-snippets"><div class="bl-snippet">{ex}</div><a href="{url}" class="bl-go-link">查看原文 \u2192</a></div></div>\n'
    return f'<aside class="backlinks-panel"><div class="bl-panel-header"><h3 class="bl-panel-title">链接到本页 <span class="bl-count">{len(bl)}</span></h3><div class="bl-panel-actions"><button class="bl-action bl-expand-all">展开</button><button class="bl-action bl-collapse-all">折叠</button></div></div>{ih}</aside>'

def build_homepage(files, lm, rc):
    ev = [f for f in files if f["category"]=="events"]
    co = [f for f in files if f["category"]=="concepts"]
    pe = [f for f in files if f["category"]=="people"]
    pl = [f for f in files if f["category"]=="places"]
    le = [f for f in files if f["category"]=="legal"]
    cr = sorted(co, key=lambda f: rc.get(f["stem"],0), reverse=True)[:8]
    pd = {"罗伊贝茨":("R","创始人，自封亲王"),"琼贝茨":("J","亲王妃"),"迈克尔贝茨":("M","现任摄政亲王"),"亚历山大巴赫":("A","政变策划者")}
    arrow = "\u2192"
    h = f'''<section class="hero-section"><div class="hero-eyebrow">Principality of Sealand · E Mare Libertas</div><h1 class="hero-title">西兰公国<span class="gold">知识图谱</span></h1><p class="hero-sub"><b>{len(ev)} 个</b>大事件，<b>{len(co)} 个</b>核心概念，<b>{len(pe)} 位</b>关键人物<br>从二战堡垒到海上微型国家——追踪世界上最具传奇色彩的主权实验</p></section>
<div class="stats-row"><div class="stat-item"><div class="stat-num">{len(ev)}</div><div class="stat-label">大事件</div></div><div class="stat-item"><div class="stat-num">{len(co)}</div><div class="stat-label">概念</div></div><div class="stat-item"><div class="stat-num">{len(pe)}</div><div class="stat-label">人物</div></div><div class="stat-item"><div class="stat-num">{len(pl)}</div><div class="stat-label">地点</div></div><div class="stat-item"><div class="stat-num">{len(le)}</div><div class="stat-label">法律</div></div></div>
<div class="main-inner"><div class="nav-cards">
<a href="/index-pages/事件索引.html" class="nav-card"><span class="nav-card-icon">📜</span><div class="nav-card-title">大事件</div><div class="nav-card-sub">从堡垒建造到数据避风港</div><span class="nav-card-arrow">{arrow}</span></a>
<a href="/index-pages/概念索引.html" class="nav-card"><span class="nav-card-icon">💡</span><div class="nav-card-title">核心概念</div><div class="nav-card-sub">主权、自决、微型国家</div><span class="nav-card-arrow">{arrow}</span></a>
<a href="/index-pages/人物索引.html" class="nav-card"><span class="nav-card-icon">👤</span><div class="nav-card-title">关键人物</div><div class="nav-card-sub">贝茨家族与政变者</div><span class="nav-card-arrow">{arrow}</span></a>
<a href="/index-pages/地点索引.html" class="nav-card"><span class="nav-card-icon">🏗️</span><div class="nav-card-title">地点</div><div class="nav-card-sub">拉夫斯堡与北海</div><span class="nav-card-arrow">{arrow}</span></a>
<a href="/index-pages/法律索引.html" class="nav-card"><span class="nav-card-icon">⚖️</span><div class="nav-card-title">法律</div><div class="nav-card-sub">主权主张与司法判决</div><span class="nav-card-arrow">{arrow}</span></a>
</div>'''
    h += '<div class="section"><div class="section-header"><h2 class="section-title">核心概念</h2><div class="section-line"></div><span class="section-count">TOP '+str(len(cr))+'</span></div><div class="tag-cloud">\n'
    for i,f in enumerate(cr):
        url = lm.get(f["stem"],"#")
        c = rc.get(f["stem"],0)
        t = " tier-1" if i<3 else (" tier-2" if i<6 else "")
        h += f'<a href="{url}" class="tag{t}">{f["stem"]}<span class="tag-n">{c}</span></a>\n'
    h += '</div></div>\n<div class="section"><div class="section-header"><h2 class="section-title">关键人物</h2><div class="section-line"></div><span class="section-count">'+str(len(pe))+' 位</span></div><div class="people-grid">\n'
    for f in pe:
        url = lm.get(f["stem"],"#")
        av, role = pd.get(f["stem"],("·",""))
        h += f'<a href="{url}" class="person-card"><div class="person-avatar">{av}</div><div class="person-name">{f["stem"]}</div><div class="person-refs">{role}</div></a>\n'
    h += '</div></div>\n<div class="gold-divider"><span class="gold-divider-diamond"></span></div>\n<div class="footer-promo"><div class="promo-story"><h3>关于本站</h3><p>西兰公国（Principality of Sealand）是位于英国萨福克海岸外12公里处的一座二战海上堡垒，自1967年起宣布独立。它是世界上最著名的微型国家之一。</p><p>本站整理了西兰公国的历史事件、核心概念、关键人物、地理位置和法律争议，构建了一张可以漫游的知识网络。</p><p class="promo-credit">本站由 <strong>知乔</strong> 与 <strong>Claude Code</strong> 共同完成。</p></div></div>\n</div>'
    return h

def main():
    if OUT.exists(): shutil.rmtree(OUT)
    asrc = Path(__file__).parent / "assets"
    if asrc.is_dir() and any(asrc.iterdir()):
        shutil.copytree(asrc, OUT / "assets")
        print(f"Copied assets/")
    files = collect_files()
    print(f"Found {len(files)} files")
    lm = build_link_map(files)
    rc = count_references(files)
    blm = build_backlinks(files, lm)
    print(f"Backlinks: {sum(len(v) for v in blm.values())} links across {len(blm)} pages")
    pc = 0
    tlm = {"events":"大事件","concepts":"概念","people":"人物","places":"地点","legal":"法律","index-pages":"索引"}
    for f in files:
        s, c = f["stem"], f["category"]
        if c == "home":
            html = wrap_page("首页", build_homepage(files, lm, rc), files, cur=s, wide=True)
            op = OUT / "index.html"
        else:
            bm = convert_wikilinks(f["body"], lm)
            bh = md_to_html(bm)
            tl = tlm.get(c, "")
            if tl: bh = f'<div class="meta"><span class="type-badge type-{tl}">{tl}</span></div>\n' + bh
            blh = build_backlinks_html(s, blm, lm) if c != "index-pages" else ""
            html = wrap_page(f["fm"].get("title", s), bh, files, cur=s, rh=blh)
            op = OUT / c / f"{s}.html"
        op.parent.mkdir(parents=True, exist_ok=True)
        op.write_text(html, encoding="utf-8")
        pc += 1
    print(f"Generated {pc} HTML pages in {OUT}")
    ts = sum(p.stat().st_size for p in OUT.rglob("*.html"))
    print(f"Total: {ts/1024:.0f} KB")

if __name__ == "__main__":
    main()
