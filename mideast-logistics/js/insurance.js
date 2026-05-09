// Insurance policy query logic

function initInsurancePage() {
  const input = document.getElementById('policyInput');
  const btn = document.getElementById('policyBtn');
  const result = document.getElementById('policyResult');

  if (!input) return;

  result.innerHTML = '';
  input.value = '';

  btn.onclick = queryInsurance;
  input.onkeydown = e => { if (e.key === 'Enter') queryInsurance(); };

  const examples = document.getElementById('policyExamples');
  if (examples) {
    examples.innerHTML = '';
    ['INS-ME-2025-0001','INS-ME-2025-0023','INS-ME-2025-0067','INS-ME-2025-0099'].forEach(no => {
      const chip = document.createElement('span');
      chip.className = 'example-chip';
      chip.textContent = no;
      chip.onclick = () => { input.value = no; queryInsurance(); };
      examples.appendChild(chip);
    });
  }
}

function queryInsurance() {
  const input = document.getElementById('policyInput');
  const result = document.getElementById('policyResult');
  const no = input.value.trim().toUpperCase();

  if (!no) {
    showPolicyError('请输入保单号');
    return;
  }

  result.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <span>正在查询保单 <strong>${no}</strong>…</span>
    </div>`;

  setTimeout(() => {
    const data = DATA.insurance[no];
    if (data) {
      renderPolicyResult(data);
    } else {
      showPolicyError(`未找到保单号 <strong>${no}</strong>，请检查输入是否正确。<br>示例：INS-ME-2025-0001`);
    }
  }, 550);
}

function showPolicyError(msg) {
  document.getElementById('policyResult').innerHTML = `
    <div class="query-error"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
}

function renderPolicyResult(d) {
  const riskMap = {
    low:    { cls: 'badge-success', icon: 'fa-shield-alt',         label: '低风险' },
    medium: { cls: 'badge-warning', icon: 'fa-exclamation-circle', label: '中风险' },
    high:   { cls: 'badge-danger',  icon: 'fa-radiation-alt',      label: '高风险' },
  };
  const rm = riskMap[d.riskLevel] || riskMap['low'];

  const statusMap = {
    active:   { cls: 'badge-success', label: '承保生效中' },
    expired:  { cls: 'badge-muted',   label: '已到期' },
    claimed:  { cls: 'badge-warning', label: '理赔处理中' },
    cancelled:{ cls: 'badge-danger',  label: '已注销' },
  };
  const sm = statusMap[d.status] || statusMap['active'];

  const coverageHTML = d.coverage.map(c => `<li><i class="fas fa-check text-success"></i> ${c}</li>`).join('');
  const exclusionHTML = d.exclusions.map(e => `<li><i class="fas fa-times text-danger"></i> ${e}</li>`).join('');

  const claimHTML = d.claimHistory.length === 0
    ? `<div class="no-claims"><i class="fas fa-check-circle"></i> 无历史理赔记录</div>`
    : d.claimHistory.map(c => `
        <div class="claim-item">
          <div class="claim-row">
            <span class="claim-date">${c.date}</span>
            <span class="badge ${c.status === '已赔付' ? 'badge-success' : 'badge-warning'}">${c.status}</span>
          </div>
          <div class="claim-type">${c.type} &nbsp;·&nbsp; <strong>${c.amount}</strong></div>
          <div class="claim-desc">${c.desc}</div>
        </div>`).join('');

  document.getElementById('policyResult').innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div>
          <h3><i class="fas fa-file-contract"></i> ${d.policyNo}</h3>
          <p class="subtext">${d.insured} &nbsp;·&nbsp; ${d.insurer}</p>
        </div>
        <div class="result-badges">
          <span class="badge ${rm.cls}"><i class="fas ${rm.icon}"></i> ${rm.label}</span>
          <span class="badge ${sm.cls}">${sm.label}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label><i class="fas fa-boxes"></i> 货物品类</label>
          <value>${d.cargoType}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-route"></i> 运输路线</label>
          <value>${d.route}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-dollar-sign"></i> 保险金额</label>
          <value class="highlight">${d.coverageAmount}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-percentage"></i> 保费 / 费率</label>
          <value>${d.premium} &nbsp;(${d.rate})</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-calendar-alt"></i> 保险期间</label>
          <value>${d.startDate} ~ ${d.endDate}</value>
        </div>
        <div class="info-item">
          <label><i class="fas fa-minus-circle"></i> 免赔额</label>
          <value>${d.deductible}</value>
        </div>
      </div>

      ${d.conditions ? `<div class="conditions-box"><i class="fas fa-info-circle"></i> ${d.conditions}</div>` : ''}

      <div class="coverage-grid">
        <div class="coverage-col">
          <h4><i class="fas fa-umbrella"></i> 承保范围</h4>
          <ul class="coverage-list">${coverageHTML}</ul>
        </div>
        <div class="coverage-col">
          <h4><i class="fas fa-ban"></i> 除外责任</h4>
          <ul class="coverage-list">${exclusionHTML}</ul>
        </div>
      </div>

      <div class="claims-section">
        <h4><i class="fas fa-hand-holding-usd"></i> 理赔历史</h4>
        ${claimHTML}
      </div>
    </div>`;
}
