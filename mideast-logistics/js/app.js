// Main application logic

let riskScrollInterval = null;
let alertIndex = 0;
let kpiAnimated = false;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  startRiskScroller();
  switchTab('overview');
});

// ─── Tab Routing ──────────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));

  if (tabId === 'overview') {
    setTimeout(() => {
      initCharts();
      if (!kpiAnimated) { animateKPIs(); kpiAnimated = true; }
    }, 80);
  } else if (tabId === 'logistics') {
    initLogisticsPage();
  } else if (tabId === 'insurance') {
    initInsurancePage();
  } else if (tabId === 'riskmap') {
    initRiskMap();
  }
}

// ─── KPI Counter Animation ────────────────────────────────────────────────────

function animateKPIs() {
  animateCounter('kpiMarket',   0, DATA.kpi.marketSize,   1200, v => v.toFixed(1) + ' B');
  animateCounter('kpiGrowth',   0, DATA.kpi.growthRate,   900,  v => '+' + v.toFixed(1) + '%');
  animateCounter('kpiClaim',    0, DATA.kpi.claimRatio,   1000, v => v.toFixed(1) + '%');
  animateCounter('kpiCoverage', 0, DATA.kpi.coverageRate, 1100, v => v.toFixed(1) + '%');
}

function animateCounter(id, from, to, duration, format) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Risk Alert Scroller ──────────────────────────────────────────────────────

function startRiskScroller() {
  renderNextAlert();
  riskScrollInterval = setInterval(renderNextAlert, 5000);
}

function renderNextAlert() {
  const container = document.getElementById('riskAlertText');
  if (!container) return;
  const alert = DATA.riskAlerts[alertIndex % DATA.riskAlerts.length];
  alertIndex++;

  container.classList.remove('fade-in');
  void container.offsetWidth; // reflow
  container.className = `risk-alert-text alert-${alert.level} fade-in`;
  container.innerHTML = `<span class="alert-icon">${alert.icon}</span> ${alert.text}`;
}

// ─── Risk Map ─────────────────────────────────────────────────────────────────

function initRiskMap() {
  renderChokepoints();
  renderCountryList();
  bindMapCountries();
}

function bindMapCountries() {
  document.querySelectorAll('.map-country[data-code]').forEach(el => {
    const code = el.dataset.code;
    const info = DATA.riskMap[code];
    if (!info) return;

    el.style.fill = info.color;
    el.style.cursor = 'pointer';

    el.onmouseenter = e => showMapTooltip(e, info);
    el.onmousemove  = e => moveMapTooltip(e);
    el.onmouseleave = hideMapTooltip;
    el.onclick      = () => showCountryDetail(code);
  });
}

function showMapTooltip(e, info) {
  const tip = document.getElementById('mapTooltip');
  if (!tip) return;
  const riskLabels = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
  const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
  tip.innerHTML = `
    <strong>${info.name}</strong>
    <span style="color:${riskColors[info.riskLevel] || '#f59e0b'}">${riskLabels[info.riskLevel] || ''}</span>
    <div>在途货量：${info.inTransit}</div>
    <div>保险覆盖率：${info.coverage}</div>`;
  tip.style.display = 'block';
  moveMapTooltip(e);
}

function moveMapTooltip(e) {
  const tip = document.getElementById('mapTooltip');
  if (!tip) return;
  tip.style.left = (e.clientX + 14) + 'px';
  tip.style.top  = (e.clientY - 10) + 'px';
}

function hideMapTooltip() {
  const tip = document.getElementById('mapTooltip');
  if (tip) tip.style.display = 'none';
}

function showCountryDetail(code) {
  const info = DATA.riskMap[code];
  if (!info) return;

  const riskLabels = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
  const riskClasses = { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger' };

  const eventsHTML = info.events.map(e => `<li><i class="fas fa-angle-right"></i> ${e}</li>`).join('');

  document.getElementById('countryDetailContent').innerHTML = `
    <div class="country-detail">
      <div class="country-detail-header">
        <h3>${info.name}</h3>
        <span class="badge ${riskClasses[info.riskLevel] || 'badge-warning'}">${riskLabels[info.riskLevel] || ''}</span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label><i class="fas fa-ship"></i> 在途货量</label>
          <value>${info.inTransit}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-shield-alt"></i> 保险覆盖率</label>
          <value>${info.coverage}</value>
        </div>
      </div>
      <div class="events-section">
        <h4><i class="fas fa-newspaper"></i> 近期事件</h4>
        <ul class="events-list">${eventsHTML}</ul>
      </div>
    </div>`;

  document.getElementById('countryDetailPanel').style.display = 'block';
}

function closeCountryDetail() {
  document.getElementById('countryDetailPanel').style.display = 'none';
}

function renderChokepoints() {
  const container = document.getElementById('chokepointList');
  if (!container) return;
  const statusMap = {
    operational: { cls: 'status-green',  label: '正常' },
    caution:     { cls: 'status-yellow', label: '注意' },
    dangerous:   { cls: 'status-red',    label: '危险' },
    normal:      { cls: 'status-green',  label: '正常' },
  };
  container.innerHTML = DATA.chokepoints.map(cp => {
    const s = statusMap[cp.status] || statusMap['normal'];
    return `
      <div class="chokepoint-item">
        <div class="cp-header">
          <span class="cp-name"><i class="fas fa-water"></i> ${cp.name}</span>
          <span class="status-dot ${s.cls}"></span>
          <span class="cp-status">${s.label}</span>
        </div>
        <div class="cp-desc">${cp.desc}</div>
      </div>`;
  }).join('');
}

function renderCountryList() {
  const container = document.getElementById('countryRiskList');
  if (!container) return;
  const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = Object.entries(DATA.riskMap).sort((a, b) => riskOrder[a[1].riskLevel] - riskOrder[b[1].riskLevel]);

  const riskClasses = { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger' };
  const riskLabels  = { low: '低', medium: '中', high: '高', critical: '极高' };

  container.innerHTML = sorted.map(([code, info]) => `
    <div class="country-row" onclick="showCountryDetail('${code}')">
      <div class="country-name">${info.name}</div>
      <div class="country-coverage">${info.coverage}</div>
      <span class="badge ${riskClasses[info.riskLevel]}">${riskLabels[info.riskLevel]}</span>
    </div>`).join('');
}
