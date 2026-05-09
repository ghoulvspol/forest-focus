#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputFile = process.argv[2] || 'xiaomi-credit-orange-paper-v2.md';
const outputPdf = process.argv[3] || 'xiaomi-credit-orange-paper.pdf';
const tmpHtml = path.join(__dirname, '_tmp_paper.html');

let md = fs.readFileSync(path.join(__dirname, inputFile), 'utf8');

// ── Custom blocks → HTML ──────────────────────────────────────────
// <callout emoji="..." background-color="...">...</callout>
const BG_MAP = {
  'light-orange': '#FFF3E0', 'orange': '#FF6D00',
  'light-yellow': '#FFFDE7', 'yellow': '#FFF176',
  'light-green':  '#E8F5E9', 'green': '#388E3C',
  'light-red':    '#FFEBEE', 'red': '#D32F2F',
  'light-blue':   '#E3F2FD', 'blue': '#1565C0',
  'light-purple': '#F3E5F5', 'purple': '#6A1B9A',
  'pale-gray':    '#F5F5F5', 'light-gray': '#EEEEEE', 'dark-gray': '#9E9E9E',
};
const BORDER_MAP = {
  'light-orange': '#FF9800', 'orange': '#FF6D00',
  'light-yellow': '#F9A825', 'yellow': '#F9A825',
  'light-green':  '#2E7D32', 'green': '#2E7D32',
  'light-red':    '#C62828', 'red': '#C62828',
  'light-blue':   '#1565C0', 'blue': '#1565C0',
  'pale-gray':    '#BDBDBD', 'light-gray': '#BDBDBD', 'dark-gray': '#757575',
};
const EMOJI_MAP = {
  balloon: '🎈', memo: '📝', fire: '🔥', bulb: '💡', warning: '⚠️',
  speech_balloon: '💬', zap: '⚡', red_circle: '🔴', x: '❌',
  white_check_mark: '✅', chart_increasing: '📈', palm_tree: '🌴',
  orange_heart: '🧡',
};

md = md.replace(
  /<callout emoji="([^"]*)" background-color="([^"]*)">([\s\S]*?)<\/callout>/g,
  (_, emoji, bg, inner) => {
    const bgColor = BG_MAP[bg] || '#FFF3E0';
    const borderColor = BORDER_MAP[bg] || '#FF9800';
    const emojiChar = EMOJI_MAP[emoji] || '📌';
    return `<div class="callout" style="background:${bgColor};border-left:4px solid ${borderColor}"><span class="callout-emoji">${emojiChar}</span><div class="callout-body">${inner.trim()}</div></div>`;
  }
);

// <grid cols="N">...</grid> with <column>...</column>
md = md.replace(/<grid cols="(\d+)">([\s\S]*?)<\/grid>/g, (_, cols, inner) => {
  const columns = inner.split(/<column[^>]*>/).slice(1).map(c =>
    `<div class="col">${c.replace(/<\/column>[\s\S]*$/, '').trim()}</div>`
  );
  return `<div class="grid grid-${cols}">${columns.join('')}</div>`;
});

// ── Standard Markdown → HTML ─────────────────────────────────────
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function inlineFormat(text) {
  // Bold+italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Strikethrough
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Underline
  text = text.replace(/<u>(.+?)<\/u>/g, '<u>$1</u>');
  // <text color="..."> tags
  text = text.replace(/<text[^>]*color="([^"]*)"[^>]*>(.+?)<\/text>/g, '<span style="color:$1">$2</span>');
  return text;
}

// Split into lines and process
const lines = md.split('\n');
let html = '';
let inTable = false;
let tableRows = [];
let inList = false;
let listItems = [];
let listOrdered = false;
let inBlockquote = false;
let bqLines = [];
let inCallout = false; // already handled above as HTML

function flushTable() {
  if (!tableRows.length) return;
  html += '<table>\n';
  tableRows.forEach((row, i) => {
    const tag = i === 0 ? 'th' : 'td';
    const cells = row.replace(/^\||\|$/g, '').split('|').map(c => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('');
    if (row.match(/^[\s|:-]+$/)) return; // separator row
    html += `<tr>${cells}</tr>\n`;
  });
  html += '</table>\n';
  tableRows = [];
  inTable = false;
}
function flushList() {
  if (!listItems.length) return;
  const tag = listOrdered ? 'ol' : 'ul';
  html += `<${tag}>\n${listItems.map(i => `<li>${inlineFormat(i || '')}</li>`).join('\n')}\n</${tag}>\n`;
  listItems = [];
  inList = false;
}
function flushBq() {
  if (!bqLines.length) return;
  html += `<blockquote>${inlineFormat(bqLines.join('<br>'))}</blockquote>\n`;
  bqLines = [];
  inBlockquote = false;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Pass-through already-converted HTML (callout divs, grid divs)
  if (line.startsWith('<div class="callout"') || line.startsWith('<div class="grid') ||
      line.startsWith('<span class=') || /^<\/div>/.test(line.trim())) {
    flushTable(); flushList(); flushBq();
    html += line + '\n';
    continue;
  }
  // Headings
  const hMatch = line.match(/^(#{1,6})\s+(.*)/);
  if (hMatch) {
    flushTable(); flushList(); flushBq();
    const level = hMatch[1].length;
    const text = inlineFormat(hMatch[2].replace(/\s*\{[^}]*\}/, ''));
    html += `<h${level}>${text}</h${level}>\n`;
    continue;
  }
  // HR
  if (/^---+$/.test(line.trim())) {
    flushTable(); flushList(); flushBq();
    html += '<hr>\n';
    continue;
  }
  // Table
  if (/^\|/.test(line)) {
    flushList(); flushBq();
    inTable = true;
    tableRows.push(line);
    continue;
  } else if (inTable) {
    flushTable();
  }
  // Ordered list
  const olMatch = line.match(/^(\d+)\.\s+(.*)/);
  if (olMatch) {
    flushBq();
    if (!inList || !listOrdered) { flushList(); inList = true; listOrdered = true; }
    listItems.push(olMatch[2]);
    continue;
  }
  // Unordered list
  const ulMatch = line.match(/^[-*]\s+(.*)/);
  if (ulMatch) {
    flushBq();
    if (!inList || listOrdered) { flushList(); inList = true; listOrdered = false; }
    listItems.push(ulMatch[2]);
    continue;
  }
  if (inList && line.trim() === '') {
    flushList();
    continue;
  }
  // Blockquote
  const bqMatch = line.match(/^>\s*(.*)/);
  if (bqMatch) {
    flushList();
    inBlockquote = true;
    bqLines.push(bqMatch[1]);
    continue;
  } else if (inBlockquote) {
    flushBq();
  }
  // Empty line
  if (line.trim() === '') {
    flushTable(); flushList(); flushBq();
    html += '<p class="spacer"></p>\n';
    continue;
  }
  // Normal paragraph
  flushTable(); flushList(); flushBq();
  html += `<p>${inlineFormat(line)}</p>\n`;
}
flushTable(); flushList(); flushBq();

// ── Build final HTML ──────────────────────────────────────────────
const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>小米信贷业务橙皮书</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

  :root {
    --orange: #F57C00;
    --orange-light: #FFF3E0;
    --orange-border: #FF9800;
    --text: #212121;
    --text-secondary: #616161;
    --divider: #E0E0E0;
    --page-width: 210mm;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 10pt;
    line-height: 1.75;
    color: var(--text);
    background: #fff;
    padding: 0;
  }

  /* ── Cover Page ── */
  .cover {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #FF6D00 0%, #FF9800 40%, #FFB74D 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60mm 20mm 40mm 20mm;
    page-break-after: always;
    color: white;
  }
  .cover-tag {
    font-size: 9pt;
    letter-spacing: 4px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 8mm;
    border: 1px solid rgba(255,255,255,0.5);
    padding: 3px 10px;
    border-radius: 2px;
  }
  .cover-title {
    font-size: 32pt;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 6mm;
    letter-spacing: -0.5px;
  }
  .cover-subtitle {
    font-size: 13pt;
    opacity: 0.85;
    margin-bottom: 20mm;
    font-weight: 400;
  }
  .cover-meta {
    font-size: 9pt;
    opacity: 0.75;
    line-height: 2;
    border-top: 1px solid rgba(255,255,255,0.3);
    padding-top: 6mm;
    width: 100%;
  }
  .cover-meta strong { opacity: 1; font-weight: 500; }

  /* ── Content ── */
  .content {
    padding: 15mm 18mm;
    max-width: 174mm;
    margin: 0 auto;
  }

  h1 {
    font-size: 18pt;
    font-weight: 700;
    color: var(--orange);
    margin: 14mm 0 4mm 0;
    padding-bottom: 2mm;
    border-bottom: 2px solid var(--orange);
    page-break-after: avoid;
  }
  h1:first-of-type { margin-top: 6mm; }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: var(--text);
    margin: 8mm 0 3mm 0;
    page-break-after: avoid;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #424242;
    margin: 5mm 0 2mm 0;
    page-break-after: avoid;
  }

  p { margin: 0 0 3mm 0; }
  p.spacer { margin: 1mm 0; }

  strong { font-weight: 700; }
  em { font-style: italic; }
  code {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 8.5pt;
    background: #F5F5F5;
    padding: 1px 4px;
    border-radius: 3px;
    color: #E64A19;
  }

  hr {
    border: none;
    border-top: 1px solid var(--divider);
    margin: 8mm 0;
  }

  blockquote {
    border-left: 3px solid var(--orange-border);
    padding: 2mm 4mm;
    margin: 3mm 0;
    color: var(--text-secondary);
    font-style: italic;
    background: var(--orange-light);
    border-radius: 0 4px 4px 0;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 4mm 0;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  th {
    background: var(--orange);
    color: white;
    padding: 2.5mm 3mm;
    text-align: left;
    font-weight: 600;
    font-size: 8.5pt;
  }
  td {
    padding: 2mm 3mm;
    border-bottom: 1px solid #EEEEEE;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #FAFAFA; }
  tr:hover td { background: var(--orange-light); }

  /* ── Lists ── */
  ul, ol {
    margin: 2mm 0 3mm 5mm;
    padding-left: 5mm;
  }
  li { margin-bottom: 1.5mm; }

  /* ── Callout ── */
  .callout {
    display: flex;
    align-items: flex-start;
    gap: 3mm;
    padding: 3mm 4mm;
    border-radius: 6px;
    margin: 3mm 0;
    page-break-inside: avoid;
  }
  .callout-emoji {
    font-size: 14pt;
    line-height: 1.5;
    flex-shrink: 0;
  }
  .callout-body {
    flex: 1;
    font-size: 9.5pt;
    line-height: 1.7;
  }
  .callout-body p { margin-bottom: 1.5mm; }
  .callout-body p:last-child { margin-bottom: 0; }
  .callout-body strong { font-weight: 700; }
  .callout-body table {
    margin: 2mm 0;
  }

  /* ── Grid ── */
  .grid {
    display: flex;
    gap: 4mm;
    margin: 3mm 0;
    page-break-inside: avoid;
  }
  .grid-2 .col { flex: 1; }
  .grid-3 .col { flex: 1; }
  .col {
    min-width: 0;
    font-size: 9pt;
  }
  .col p { margin-bottom: 2mm; }
  .col .callout { font-size: 8.5pt; }

  /* ── Page breaks ── */
  @media print {
    body { background: white; }
    h1 { page-break-before: always; }
    h1:first-of-type { page-break-before: avoid; }
    .cover { page-break-after: always; }
    table { page-break-inside: avoid; }
    .callout { page-break-inside: avoid; }
    .grid { page-break-inside: avoid; }

    @page {
      size: A4;
      margin: 15mm 18mm 18mm 18mm;
    }
    @page :first {
      margin: 0;
    }
  }
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
  <div class="cover-tag">Orange Paper · 橙皮书</div>
  <div class="cover-title">小米信贷业务<br>橙皮书</div>
  <div class="cover-subtitle">天星数科信贷业务全景指南</div>
  <div class="cover-meta">
    <strong>创建者</strong>：滔哥<br>
    <strong>为谁创建</strong>：新员工及想系统了解信贷业务的同学<br>
    <strong>基于</strong>：天星数科信贷业务 2026年版<br>
    <strong>最后更新</strong>：2026-04-21
  </div>
</div>

<!-- Main Content -->
<div class="content">
${html}
</div>

</body>
</html>`;

fs.writeFileSync(tmpHtml, fullHtml);
console.log(`✓ HTML generated: ${tmpHtml}`);

// ── Chrome headless → PDF ─────────────────────────────────────────
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pdfOut = path.join(__dirname, outputPdf);
const cmd = `"${chrome}" --headless --disable-gpu --no-sandbox \
  --print-to-pdf="${pdfOut}" \
  --print-to-pdf-no-header \
  --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw \
  "file://${tmpHtml}" 2>&1`;

try {
  execSync(cmd, { stdio: 'pipe', timeout: 60000 });
  const size = fs.statSync(pdfOut).size;
  console.log(`✓ PDF generated: ${pdfOut} (${(size/1024).toFixed(0)} KB)`);
  fs.unlinkSync(tmpHtml);
} catch (e) {
  console.error('Chrome error:', e.message);
  console.log(`HTML file kept at: ${tmpHtml}`);
  process.exit(1);
}
