#!/usr/bin/env python3
"""
第一次世界大战知识图谱 — 静态网站构建脚本
作者：知乔 & Claude Code

用法：python3 build_site.py
输出：ww1-site/ 目录，可直接部署为静态网站
"""

import os
import re
import html
import shutil
from pathlib import Path
from datetime import datetime

# ============================================
# 配置
# ============================================
VAULT = Path(__file__).parent
OUT = VAULT / "ww1-site"
ASSETS = VAULT / "assets-ww1"

SITE_TITLE = "第一次世界大战知识图谱"
SITE_LOGO = "⚔"
SITE_SUBTITLE = "1914-1918 · 一场改变世界的战争"
AUTHORS = "知乔 & Claude Code"

# 内容目录配置
CATEGORY_DIRS = {
    "sources": "战争起因",
    "battles": "重大战役",
    "people": "关键人物",
    "countries": "参战国家",
    "treaties": "重要条约",
    "technology": "军事技术",
    "concepts": "核心概念",
    "index-pages": "索引",
}

CATEGORY_LABELS = {
    "sources": "战争起因",
    "battles": "重大战役",
    "people": "关键人物",
    "countries": "参战国家",
    "treaties": "重要条约",
    "technology": "军事技术",
    "concepts": "核心概念",
}

# 侧边栏排序（用带编号的文件名前缀）
SIDEBAR_ORDER = [
    ("战争起因", [
        "01-帝国主义与殖民竞争",
        "02-同盟体系",
        "03-军备竞赛",
        "04-巴尔干火药桶",
        "05-萨拉热窝事件",
        "06-七月危机",
        "07-民族主义",
    ]),
    ("重大战役", [
        "01-马恩河战役",
        "02-坦能堡战役",
        "03-加里波利战役",
        "04-凡尔登战役",
        "05-索姆河战役",
        "06-日德兰海战",
        "07-伊松佐河战役",
        "08-布鲁西洛夫攻势",
        "09-帕斯尚尔战役",
        "10-亚眠战役",
        "11-默兹-阿戈讷攻势",
    ]),
    ("关键人物", [
        "01-斐迪南大公",
        "02-威廉二世",
        "13-威尔逊",
        "04-霞飞",
        "05-福煦",
        "09-兴登堡",
        "10-鲁登道夫",
        "14-克里孟梭",
    ]),
    ("参战国家", [
        "01-德国",
        "02-奥匈帝国",
        "03-奥斯曼帝国",
        "05-法国",
        "06-英国",
        "07-俄罗斯帝国",
        "08-意大利",
        "09-美国",
    ]),
    ("重要条约", [
        "01-十四点计划",
        "02-布列斯特-立陶夫斯克条约",
        "03-凡尔赛条约",
        "04-圣日耳曼条约",
    ]),
    ("军事技术", [
        "01-堑壕战",
        "02-毒气战",
        "03-坦克",
        "04-飞机",
        "05-潜艇战",
        "06-机枪",
    ]),
]

# ============================================
# 工具函数
# ============================================

def parse_frontmatter(text):
    """解析 YAML frontmatter"""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return {}, text
    fm_text = m.group(1)
    rest = text[m.end():]
    meta = {}
    for line in fm_text.split('\n'):
        line = line.strip()
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key == 'tags':
                val = [t.strip() for t in val.strip('[]').split(',') if t.strip()]
            meta[key] = val
    return meta, rest


def md_to_html(md_text, page_map):
    """简易 Markdown 转 HTML（支持 wikilinks）"""
    lines = md_text.split('\n')
    html_parts = []
    in_code = False
    in_list = False
    list_type = None

    for line in lines:
        stripped = line.strip()

        # 代码块
        if stripped.startswith('```'):
            if in_code:
                html_parts.append('</code></pre>')
                in_code = False
            else:
                lang = stripped[3:].strip()
                html_parts.append(f'<pre><code class="language-{lang}">')
                in_code = True
            continue

        if in_code:
            html_parts.append(html.escape(line))
            continue

        # 空行
        if not stripped:
            if in_list:
                if list_type == 'ul':
                    html_parts.append('</ul>')
                else:
                    html_parts.append('</ol>')
                in_list = False
            html_parts.append('')
            continue

        # 标题
        if stripped.startswith('#'):
            m = re.match(r'^(#{1,6})\s+(.+)$', stripped)
            if m:
                level = len(m.group(1))
                text = m.group(2)
                text = process_inline(text, page_map)
                html_parts.append(f'<h{level}>{text}</h{level}>')
                continue

        # 无序列表
        if stripped.startswith('- ') or stripped.startswith('* '):
            if not in_list or list_type != 'ul':
                if in_list:
                    html_parts.append(f'</{list_type}>')
                html_parts.append('<ul>')
                in_list = True
                list_type = 'ul'
            item = stripped[2:]
            item = process_inline(item, page_map)
            html_parts.append(f'<li>{item}</li>')
            continue

        # 有序列表
        m_ol = re.match(r'^(\d+)\.\s+(.+)$', stripped)
        if m_ol:
            if not in_list or list_type != 'ol':
                if in_list:
                    html_parts.append(f'</{list_type}>')
                html_parts.append('<ol>')
                in_list = True
                list_type = 'ol'
            item = m_ol.group(2)
            item = process_inline(item, page_map)
            html_parts.append(f'<li>{item}</li>')
            continue

        # 水平线
        if stripped in ('---', '***', '___'):
            html_parts.append('<hr>')
            continue

        # 普通段落
        if in_list:
            html_parts.append(f'</{list_type}>')
            in_list = False
        text = process_inline(stripped, page_map)
        html_parts.append(f'<p>{text}</p>')

    if in_list:
        html_parts.append(f'</{list_type}>')

    return '\n'.join(html_parts)


def process_inline(text, page_map):
    """处理行内元素：wikilinks、加粗、斜体、行内代码"""
    # Wikilinks: [[target|display]] or [[target]]
    def wikilink_replace(m):
        target = m.group(1)
        display = m.group(2) if m.group(2) else target
        if target in page_map:
            return f'<a href="{page_map[target]}" class="wikilink">{display}</a>'
        else:
            return f'<span class="wikilink-broken" title="待创建：{target}">{display}</span>'

    text = re.sub(r'\[\[([^|\]]+?)(?:\|([^\]]+?))?\]\]', wikilink_replace, text)

    # 行内代码
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # 加粗
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # 斜体
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)

    return text


def get_type_badge(type_name):
    """获取类型标签 HTML"""
    colors = {
        "起因": ("var(--tag-cause)", "🏛"),
        "战役": ("var(--tag-battle)", "⚔"),
        "人物": ("var(--tag-person)", "👤"),
        "国家": ("var(--tag-country)", "🌍"),
        "条约": ("var(--tag-treaty)", "📜"),
        "技术": ("var(--tag-tech)", "🔧"),
        "核心概念": ("var(--primary)", "💡"),
    }
    color, icon = colors.get(type_name, ("var(--text2)", "📄"))
    return f'<span class="type-badge" style="background:{color}">{icon} {type_name}</span>'


def strip_number_prefix(name):
    """去掉文件名前面的数字前缀，如 '01-帝国主义' -> '帝国主义'"""
    return re.sub(r'^\d+-', '', name)


def scan_all_pages():
    """扫描所有 markdown 文件，建立页面映射"""
    pages = {}
    for dir_name, label in CATEGORY_DIRS.items():
        if dir_name == "index-pages":
            continue
        dir_path = VAULT / dir_name
        if not dir_path.exists():
            continue
        for f in sorted(dir_path.glob("*.md")):
            meta, _ = parse_frontmatter(f.read_text(encoding='utf-8'))
            title = meta.get('title', f.stem)
            slug = f.stem  # 带编号的文件名，如 "01-帝国主义与殖民竞争"
            clean_name = strip_number_prefix(slug)  # 去编号，如 "帝国主义与殖民竞争"
            # 用带编号的 slug 作为实际文件名
            pages[title] = f"{slug}.html"
            pages[slug] = f"{slug}.html"
            pages[clean_name] = f"{slug}.html"
    return pages


# ============================================
# 页面模板
# ============================================

def html_wrapper(title, content, body_class="", nav_html=""):
    """通用 HTML 模板"""
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)} — {SITE_TITLE}</title>
<link rel="stylesheet" href="variables.css">
<link rel="stylesheet" href="style.css">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
</head>
<body class="{body_class}">
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <a href="index.html" class="sidebar-logo">
        <span class="logo-icon">{SITE_LOGO}</span>
        <span class="logo-text">{SITE_TITLE}</span>
      </a>
      <p class="sidebar-subtitle">{SITE_SUBTITLE}</p>
    </div>
    <nav class="sidebar-nav">
      {nav_html}
    </nav>
    <div class="sidebar-footer">
      <p>作者：{AUTHORS}</p>
      <p class="sidebar-date">构建于 {datetime.now().strftime("%Y-%m-%d")}</p>
    </div>
  </aside>
  <main class="main-content">
    <div class="content-wrapper">
      {content}
    </div>
  </main>
</div>
<button class="sidebar-toggle" onclick="document.body.classList.toggle('sidebar-open')">☰</button>
<script>
// 移动端侧边栏切换
document.addEventListener('click', function(e) {{
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (document.body.classList.contains('sidebar-open') &&
      !sidebar.contains(e.target) && !toggle.contains(e.target)) {{
    document.body.classList.remove('sidebar-open');
  }}
}});
</script>
</body>
</html>'''


def build_nav_html(current_title=""):
    """构建侧边栏导航"""
    nav_parts = []

    # 首页链接
    active = ' active' if current_title == '首页' else ''
    nav_parts.append(f'<a href="index.html" class="nav-item nav-home{active}">🏠 首页</a>')

    for group_title, items in SIDEBAR_ORDER:
        nav_parts.append(f'<div class="nav-group">')
        nav_parts.append(f'<div class="nav-group-title">{group_title}</div>')
        for item_name in items:
            active = ' active' if item_name == current_title else ''
            display_name = strip_number_prefix(item_name)
            nav_parts.append(f'<a href="{item_name}.html" class="nav-item{active}">{display_name}</a>')
        nav_parts.append('</div>')

    # 索引页链接
    nav_parts.append('<div class="nav-group">')
    nav_parts.append('<div class="nav-group-title">索引</div>')
    nav_parts.append('<a href="素材总览.html" class="nav-item">📋 素材总览</a>')
    nav_parts.append('<a href="更新日志.html" class="nav-item">📝 更新日志</a>')
    nav_parts.append('</div>')

    return '\n'.join(nav_parts)


# ============================================
# 构建页面
# ============================================

def build_article_page(md_path, page_map):
    """构建单篇文章页"""
    text = md_path.read_text(encoding='utf-8')
    meta, body = parse_frontmatter(text)
    title = meta.get('title', md_path.stem)
    type_name = meta.get('type', '')
    date = meta.get('date', '')
    tags = meta.get('tags', [])

    content_html = md_to_html(body, page_map)

    # 标题区
    badge = get_type_badge(type_name) if type_name else ''
    date_html = f'<span class="article-date">{date}</span>' if date else ''
    tags_html = ''.join(f'<span class="tag">{t}</span>' for t in tags if t not in ['一战'])

    header = f'''
    <article class="article">
      <header class="article-header">
        {badge}
        <h1 class="article-title">{html.escape(title)}</h1>
        <div class="article-meta">
          {date_html}
          <div class="article-tags">{tags_html}</div>
        </div>
      </header>
      <div class="article-body">
        {content_html}
      </div>
    </article>'''

    nav = build_nav_html(title)
    return html_wrapper(title, header, "page-article", nav)


def build_index_page(page_map):
    """构建首页"""
    # 统计数据
    stats = {}
    total = 0
    for dir_name, label in CATEGORY_DIRS.items():
        if dir_name == "index-pages":
            continue
        dir_path = VAULT / dir_name
        if dir_path.exists():
            count = len(list(dir_path.glob("*.md")))
            stats[label] = count
            total += count

    stats_html = ''.join(
        f'<div class="stat-card"><span class="stat-num">{count}</span><span class="stat-label">{label}</span></div>'
        for label, count in stats.items()
    )

    # 导航卡片
    nav_cards = ''.join(f'''
    <a href="{first_item}.html" class="nav-card">
      <span class="nav-card-icon">{icon}</span>
      <span class="nav-card-title">{label}</span>
      <span class="nav-card-count">{count} 篇</span>
    </a>''' for (label, items), (dir_name, count), icon in zip(
        SIDEBAR_ORDER,
        [(d, len(list((VAULT / d).glob("*.md")))) for d in CATEGORY_DIRS if d != "index-pages" and (VAULT / d).exists()],
        ["🏛", "⚔", "👤", "🌍", "📜", "🔧"]
    ) if items for first_item in [items[0]])

    content = f'''
    <div class="homepage">
      <section class="hero">
        <div class="hero-icon">⚔</div>
        <h1 class="hero-title">第一次世界大战</h1>
        <p class="hero-subtitle">1914 — 1918</p>
        <p class="hero-desc">
          一场席卷全球的战争，改变了世界的政治格局。<br>
          从帝国主义的殖民竞争到萨拉热窝的枪声，<br>
          从堑壕中的血战到凡尔赛宫的和约，<br>
          这座知识图谱记录了那场改变世界的战争。
        </p>
      </section>

      <section class="stats-section">
        <h2 class="section-title">知识图谱概览</h2>
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <span class="stat-num">{total}</span>
            <span class="stat-label">知识节点</span>
          </div>
          {stats_html}
        </div>
      </section>

      <section class="nav-section">
        <h2 class="section-title">探索知识图谱</h2>
        <div class="nav-cards-grid">
          {nav_cards}
        </div>
      </section>

      <section class="about-section">
        <h2 class="section-title">关于本站</h2>
        <div class="about-content">
          <p>本站是一个关于第一次世界大战的中文知识图谱，收录了 {total} 个知识节点，
          涵盖战争起因、重大战役、关键人物、参战国家、重要条约和军事技术六大维度。</p>
          <p>所有知识节点之间通过 <span class="highlight">双向链接</span> 相互关联，
          形成一张立体的知识网络，帮助你从不同角度理解这场改变世界的战争。</p>
          <p class="about-authors">作者：{AUTHORS}</p>
        </div>
      </section>
    </div>'''

    nav = build_nav_html("首页")
    return html_wrapper("首页", content, "page-home", nav)


def build_stats_index(page_map):
    """构建素材总览页"""
    rows = []
    for dir_name, label in CATEGORY_DIRS.items():
        if dir_name == "index-pages":
            continue
        dir_path = VAULT / dir_name
        if not dir_path.exists():
            continue
        for f in sorted(dir_path.glob("*.md")):
            meta, _ = parse_frontmatter(f.read_text(encoding='utf-8'))
            title = meta.get('title', f.stem)
            date = meta.get('date', '')
            slug = f.stem
            badge = get_type_badge(label)
            rows.append(f'''
            <tr>
              <td>{badge}</td>
              <td><a href="{slug}.html">{html.escape(title)}</a></td>
              <td>{date}</td>
            </tr>''')

    content = f'''
    <div class="index-page">
      <h1>素材总览</h1>
      <p class="index-desc">共收录 {len(rows)} 个知识节点</p>
      <table class="index-table">
        <thead><tr><th>类型</th><th>标题</th><th>时间</th></tr></thead>
        <tbody>{''.join(rows)}</tbody>
      </table>
    </div>'''

    nav = build_nav_html("素材总览")
    return html_wrapper("素材总览", content, "page-index", nav)


def build_changelog():
    """构建更新日志页"""
    content = f'''
    <div class="index-page">
      <h1>更新日志</h1>
      <p class="index-desc">记录第一次世界大战知识图谱的每一次迭代。</p>

      <div class="changelog">
        <h2><span class="version">V 1.0</span> <span class="changelog-date">{datetime.now().strftime("%Y-%m-%d")}</span></h2>
        <ul class="change-list">
          <li><span class="change-type feat">上线</span><strong>知识图谱首发</strong>— 收录战争起因、重大战役、关键人物、参战国家、重要条约、军事技术六大板块</li>
          <li><span class="change-type feat">视觉</span><strong>军绿色主题</strong>— 采用军绿色为主色调，黄铜金为强调色</li>
          <li><span class="change-type feat">功能</span><strong>双向链接</strong>— 所有知识节点之间通过 wikilinks 相互关联</li>
        </ul>
      </div>
    </div>'''

    nav = build_nav_html("更新日志")
    return html_wrapper("更新日志", content, "page-index", nav)


# ============================================
# CSS 样式
# ============================================

def get_css():
    return '''
/* ============================================
   第一次世界大战知识图谱 — 军绿色主题
   作者：知乔 & Claude Code
   ============================================ */

:root {
  --primary: #4A5D23;
  --primary-dark: #2C3E14;
  --primary-light: #6B7F3A;
  --primary-lighter: #8FA64D;
  --accent: #C5A55A;
  --accent-light: #D4BC7E;
  --accent-dark: #A68B3C;
  --bg: #F5F3EE;
  --bg-warm: #EDE9E0;
  --bg-card: #FFFFFF;
  --text: #2C2C2C;
  --text2: #666666;
  --text3: #999999;
  --border: #E0DDD6;
  --border-light: #EDE9E0;
  --sidebar-bg: #2C3E14;
  --sidebar-text: #E8E4D9;
  --sidebar-hover: #3A5019;
  --sidebar-active: #4A5D23;
  --sidebar-divider: rgba(255,255,255,0.12);
  --tag-cause: #8B6914;
  --tag-battle: #8B0000;
  --tag-person: #2E5A88;
  --tag-country: #4A5D23;
  --tag-treaty: #6B3A7D;
  --tag-tech: #5A5A5A;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-serif: Georgia, 'Noto Serif SC', 'SimSun', serif;
  --font-mono: 'Menlo', 'Consolas', monospace;
  --font-display: Georgia, 'Noto Serif SC', serif;
  --sidebar-width: 280px;
  --content-max-width: 780px;
  --radius: 6px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --transition: 0.2s ease;
}

/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-sans);
  color: var(--text);
  background: var(--bg);
  line-height: 1.7;
}

a { color: var(--primary); text-decoration: none; transition: color var(--transition); }
a:hover { color: var(--primary-light); }

/* ============================================
   Layout
   ============================================ */

.layout {
  display: flex;
  min-height: 100vh;
}

/* ============================================
   Sidebar
   ============================================ */

.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 100;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid var(--sidebar-divider);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--sidebar-text);
  text-decoration: none;
}

.sidebar-logo:hover { color: #fff; }

.logo-icon {
  font-size: 28px;
  line-height: 1;
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.sidebar-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 6px;
  padding-left: 38px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 7px 20px 7px 24px;
  color: var(--sidebar-text);
  font-size: 13.5px;
  text-decoration: none;
  transition: all var(--transition);
  border-left: 3px solid transparent;
  opacity: 0.85;
}

.nav-item:hover {
  background: var(--sidebar-hover);
  color: #fff;
  opacity: 1;
}

.nav-item.active {
  background: var(--sidebar-active);
  color: #fff;
  border-left-color: var(--accent);
  opacity: 1;
  font-weight: 600;
}

.nav-home {
  font-weight: 600;
  padding: 10px 20px 10px 24px;
  margin-bottom: 4px;
}

.nav-group-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255,255,255,0.4);
  padding: 16px 20px 6px 24px;
  font-weight: 700;
}

.nav-group {
  margin-bottom: 4px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--sidebar-divider);
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}

.sidebar-date { margin-top: 4px; }

.sidebar-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  background: var(--primary-dark);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: 20px;
  cursor: pointer;
}

/* ============================================
   Main Content
   ============================================ */

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.content-wrapper {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 48px 40px 80px;
}

/* ============================================
   Article Pages
   ============================================ */

.article-header {
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border);
}

.type-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.article-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text);
  margin-bottom: 12px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-date {
  font-size: 14px;
  color: var(--text2);
}

.article-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  background: var(--bg-warm);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text2);
}

/* Article Body */
.article-body h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin: 36px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  color: var(--primary-dark);
}

.article-body h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 28px 0 12px;
  color: var(--primary);
}

.article-body h4 {
  font-size: 17px;
  font-weight: 600;
  margin: 24px 0 10px;
}

.article-body p {
  margin-bottom: 16px;
  font-size: 15.5px;
  line-height: 1.8;
}

.article-body ul, .article-body ol {
  margin: 12px 0 16px 24px;
}

.article-body li {
  margin-bottom: 6px;
  font-size: 15px;
  line-height: 1.7;
}

.article-body pre {
  background: #1a1a1a;
  color: #e8e8e8;
  padding: 16px 20px;
  border-radius: var(--radius);
  overflow-x: auto;
  margin: 16px 0;
  font-size: 13.5px;
  line-height: 1.6;
}

.article-body code {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.article-body p code {
  background: var(--bg-warm);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--primary-dark);
}

.article-body hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

.article-body blockquote {
  border-left: 4px solid var(--accent);
  padding: 12px 20px;
  margin: 16px 0;
  background: var(--bg-warm);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-style: italic;
  color: var(--text2);
}

/* Wikilinks */
.wikilink {
  color: var(--primary);
  text-decoration: none;
  border-bottom: 1px dashed var(--primary-light);
  transition: all var(--transition);
}

.wikilink:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: rgba(197, 165, 90, 0.08);
}

.wikilink-broken {
  color: var(--text3);
  border-bottom: 1px dashed var(--border);
  cursor: help;
}

/* ============================================
   Homepage
   ============================================ */

.hero {
  text-align: center;
  padding: 48px 0 40px;
  margin-bottom: 40px;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
  border-radius: var(--radius-lg);
  color: #fff;
}

.hero-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 24px;
  letter-spacing: 4px;
}

.hero-desc {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255,255,255,0.8);
  max-width: 520px;
  margin: 0 auto;
}

.section-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--accent);
}

/* Stats */
.stats-section {
  margin-bottom: 48px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: transform var(--transition), box-shadow var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card.stat-total {
  background: var(--primary-dark);
  color: #fff;
}

.stat-card.stat-total .stat-label { color: rgba(255,255,255,0.7); }

.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-total .stat-num { color: var(--accent); }

.stat-label {
  display: block;
  font-size: 13px;
  color: var(--text2);
  margin-top: 6px;
}

/* Nav Cards */
.nav-section {
  margin-bottom: 48px;
}

.nav-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: var(--text);
  transition: all var(--transition);
}

.nav-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
  color: var(--primary);
}

.nav-card-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.nav-card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.nav-card-count {
  font-size: 13px;
  color: var(--text3);
}

/* About */
.about-section {
  margin-bottom: 48px;
}

.about-content {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px 28px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.about-content p {
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--text2);
}

.about-content .highlight {
  color: var(--primary);
  font-weight: 600;
}

.about-authors {
  color: var(--accent-dark) !important;
  font-weight: 600;
  margin-top: 16px !important;
}

/* ============================================
   Index Pages
   ============================================ */

.index-page h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--primary-dark);
}

.index-desc {
  font-size: 15px;
  color: var(--text2);
  margin-bottom: 32px;
}

.index-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.index-table th {
  background: var(--primary-dark);
  color: #fff;
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.index-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
}

.index-table tr:hover td {
  background: rgba(74, 93, 35, 0.04);
}

.index-table a {
  color: var(--primary);
  font-weight: 500;
}

.index-table a:hover {
  color: var(--accent);
}

/* ============================================
   Changelog
   ============================================ */

.changelog h2 {
  font-size: 20px;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.version {
  background: var(--accent);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.changelog-date {
  font-size: 14px;
  color: var(--text3);
  font-weight: 400;
}

.change-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.change-list li {
  padding: 8px 0 8px 20px;
  position: relative;
  font-size: 14.5px;
  line-height: 1.6;
}

.change-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.change-type {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 8px;
  letter-spacing: 0.3px;
}

.change-type.feat { background: #d4edda; color: #155724; }
.change-type.fix { background: #f8d7da; color: #721c24; }
.change-type.plan { background: #d1ecf1; color: #0c5460; }

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }

  .main-content {
    margin-left: 0;
  }

  .content-wrapper {
    padding: 24px 20px 60px;
  }

  .hero-title {
    font-size: 28px;
  }

  .article-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .nav-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-cards-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   Scrollbar
   ============================================ */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.25);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
}

/* ============================================
   Print
   ============================================ */

@media print {
  .sidebar, .sidebar-toggle { display: none !important; }
  .main-content { margin-left: 0; }
}
'''


# ============================================
# Favicon SVG
# ============================================

def get_favicon_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#2C3E14"/>
  <text x="16" y="23" text-anchor="middle" font-size="20" font-family="serif" fill="#C5A55A">⚔</text>
</svg>'''


# ============================================
# 主函数
# ============================================

def main():
    # 清理输出目录
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    # 复制资源文件
    assets_dir = ASSETS
    if assets_dir.exists():
        for f in assets_dir.iterdir():
            if f.is_file():
                shutil.copy2(f, OUT / f.name)

    # 写入 CSS
    (OUT / "style.css").write_text(get_css(), encoding='utf-8')

    # 写入 favicon
    (OUT / "favicon.svg").write_text(get_favicon_svg(), encoding='utf-8')

    # 建立页面映射
    page_map = scan_all_pages()

    # 构建首页
    (OUT / "index.html").write_text(
        build_index_page(page_map), encoding='utf-8')

    # 构建素材总览
    (OUT / "素材总览.html").write_text(
        build_stats_index(page_map), encoding='utf-8')

    # 构建更新日志
    (OUT / "更新日志.html").write_text(
        build_changelog(), encoding='utf-8')

    # 构建所有文章页
    article_count = 0
    for dir_name in CATEGORY_DIRS:
        if dir_name == "index-pages":
            continue
        dir_path = VAULT / dir_name
        if not dir_path.exists():
            continue
        for md_file in sorted(dir_path.glob("*.md")):
            html_content = build_article_page(md_file, page_map)
            out_file = OUT / f"{md_file.stem}.html"
            out_file.write_text(html_content, encoding='utf-8')
            article_count += 1

    print(f"✅ 构建完成！")
    print(f"   输出目录：{OUT}")
    print(f"   文章页面：{article_count}")
    print(f"   首页：index.html")
    print(f"   总文件数：{len(list(OUT.iterdir()))}")


if __name__ == "__main__":
    main()
