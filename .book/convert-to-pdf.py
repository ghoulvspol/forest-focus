#!/usr/bin/env python3
"""Convert markdown to PDF with Chinese font support."""

import markdown
from weasyprint import HTML

# Read markdown file
with open("/Users/harden/workspace/.book/Claude-Code-橙皮书.md", "r", encoding="utf-8") as f:
    md_content = f.read()

# Convert markdown to HTML
html_body = markdown.markdown(
    md_content,
    extensions=["tables", "fenced_code", "codehilite", "toc"],
)

# Full HTML with CSS styling
html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
@page {{
    size: A4;
    margin: 2cm 2.5cm;
    @bottom-center {{
        content: counter(page);
        font-size: 10px;
        color: #666;
    }}
}}

body {{
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
    font-size: 11px;
    line-height: 1.8;
    color: #333;
}}

h1 {{
    font-size: 24px;
    color: #E65100;
    border-bottom: 3px solid #E65100;
    padding-bottom: 8px;
    margin-top: 40px;
    page-break-before: always;
}}

h1:first-of-type {{
    page-break-before: avoid;
    font-size: 32px;
    text-align: center;
    border-bottom: none;
    margin-top: 60px;
}}

h2 {{
    font-size: 18px;
    color: #BF360C;
    border-bottom: 1px solid #FFCCBC;
    padding-bottom: 4px;
    margin-top: 30px;
    page-break-before: always;
}}

h2:first-of-type {{
    page-break-before: avoid;
}}

h3 {{
    font-size: 14px;
    color: #D84315;
    margin-top: 20px;
}}

h4 {{
    font-size: 12px;
    color: #4E342E;
    margin-top: 15px;
}}

table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10px;
}}

th {{
    background-color: #E65100;
    color: white;
    padding: 8px 10px;
    text-align: left;
    font-weight: bold;
}}

td {{
    padding: 6px 10px;
    border-bottom: 1px solid #ddd;
}}

tr:nth-child(even) {{
    background-color: #FFF3E0;
}}

code {{
    background-color: #F5F5F5;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: "SF Mono", "Fira Code", "Menlo", monospace;
    font-size: 10px;
    color: #C62828;
}}

pre {{
    background-color: #263238;
    color: #EEFFFF;
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 10px;
    line-height: 1.5;
    margin: 10px 0;
}}

pre code {{
    background: none;
    color: #EEFFFF;
    padding: 0;
}}

blockquote {{
    border-left: 4px solid #E65100;
    margin: 12px 0;
    padding: 8px 16px;
    background-color: #FFF8E1;
    font-style: italic;
}}

blockquote strong {{
    color: #E65100;
    font-style: normal;
}}

ul, ol {{
    padding-left: 20px;
    margin: 8px 0;
}}

li {{
    margin: 4px 0;
}}

hr {{
    border: none;
    border-top: 2px solid #E65100;
    margin: 30px 0;
}}

a {{
    color: #E65100;
    text-decoration: none;
}}

strong {{
    color: #BF360C;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

# Write HTML for reference
with open("/Users/harden/workspace/.book/Claude-Code-橙皮书.html", "w", encoding="utf-8") as f:
    f.write(html_template)

# Generate PDF
HTML(string=html_template).write_pdf(
    "/Users/harden/workspace/.book/Claude-Code-橙皮书.pdf"
)

print("PDF generated successfully!")
