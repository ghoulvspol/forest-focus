// Logistics tracking query logic

function initLogisticsPage() {
  const input = document.getElementById('trackingInput');
  const btn = document.getElementById('trackingBtn');
  const result = document.getElementById('trackingResult');

  if (!input) return;

  // Clear previous result
  result.innerHTML = '';
  input.value = '';

  btn.onclick = queryLogistics;
  input.onkeydown = e => { if (e.key === 'Enter') queryLogistics(); };

  // Show quick-select example chips
  const examples = document.getElementById('trackingExamples');
  if (examples) {
    examples.innerHTML = '';
    ['ME20250001','ME20250003','ME20250005','ME20250007'].forEach(no => {
      const chip = document.createElement('span');
      chip.className = 'example-chip';
      chip.textContent = no;
      chip.onclick = () => { input.value = no; queryLogistics(); };
      examples.appendChild(chip);
    });
  }
}

function queryLogistics() {
  const input = document.getElementById('trackingInput');
  const result = document.getElementById('trackingResult');
  const no = input.value.trim().toUpperCase();

  if (!no) {
    showTrackingError('请输入运单号');
    return;
  }

  // Show loading
  result.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <span>正在查询运单 <strong>${no}</strong>…</span>
    </div>`;

  setTimeout(() => {
    const data = DATA.logistics[no];
    if (data) {
      renderTrackingResult(data);
    } else {
      showTrackingError(`未找到运单号 <strong>${no}</strong>，请检查输入是否正确。<br>示例：ME20250001 ~ ME20250010`);
    }
  }, 550);
}

function showTrackingError(msg) {
  document.getElementById('trackingResult').innerHTML = `
    <div class="query-error"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
}

function renderTrackingResult(d) {
  const riskBadge = riskBadgeHTML(d.riskLevel);
  const insuredBadge = d.insured
    ? `<span class="badge badge-success"><i class="fas fa-shield-alt"></i> 已投保 ${d.policyNo}</span>`
    : `<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> 未投保</span>`;

  const timelineHTML = d.timeline.map((t, i) => `
    <div class="timeline-item ${t.status}">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="tl-header">
          <span class="tl-location"><i class="fas fa-map-marker-alt"></i> ${t.location}</span>
          <span class="tl-time">${t.time}</span>
        </div>
        <div class="tl-event">${t.event}</div>
        ${t.detail ? `<div class="tl-detail">${t.detail}</div>` : ''}
      </div>
    </div>`).join('');

  document.getElementById('trackingResult').innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <h3><i class="fas fa-ship"></i> ${d.trackingNo}</h3>
          <p class="subtext">${d.carrier} &nbsp;|&nbsp; 航次 ${d.voyage}</p>
        </div>
        <div class="result-badges">
          ${riskBadge}
          ${insuredBadge}
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label><i class="fas fa-anchor"></i> 船名/航班</label>
          <value>${d.vessel}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-map-pin"></i> 当前位置</label>
          <value>${d.currentLocation}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-route"></i> 运输路线</label>
          <value>${d.origin} → ${d.destination}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-calendar-check"></i> 预计到达</label>
          <value>${d.eta}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-box"></i> 货物</label>
          <value>${d.cargo}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-weight-hanging"></i> 重量</label>
          <value>${d.weight}</value>
        </div>
      </div>

      <div class="timeline-section">
        <h4><i class="fas fa-history"></i> 货运轨迹</h4>
        <div class="timeline">
          ${timelineHTML}
        </div>
      </div>
    </div>`;
}

function riskBadgeHTML(level) {
  const map = {
    low:    { cls: 'badge-success', icon: 'fa-check-circle',       label: '低风险' },
    medium: { cls: 'badge-warning', icon: 'fa-exclamation-circle', label: '中风险' },
    high:   { cls: 'badge-danger',  icon: 'fa-times-circle',       label: '高风险' },
  };
  const m = map[level] || map['low'];
  return `<span class="badge ${m.cls}"><i class="fas ${m.icon}"></i> ${m.label}</span>`;
}
