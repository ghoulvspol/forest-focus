// ════════════════════════════════════════════════════
//  Admin Panel — Main Logic
// ════════════════════════════════════════════════════

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const STORAGE_KEY = 'mideast_admin_data';

// ── State ─────────────────────────────────────────────
let adminState = {
  logistics: {},
  insurance: {},
  riskMap: {},
};

let currentPage = 'dashboard';
let searchQueries = { logistics: '', insurance: '', riskmap: '' };

// ── Bootstrap ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateSidebarCounts();

  // Login form
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_authed', '1');
      showApp();
    } else {
      document.getElementById('loginError').textContent = '用户名或密码错误，请重试';
    }
  });

  if (sessionStorage.getItem('admin_authed')) showApp();

  // Search listeners
  document.getElementById('logisticsSearch').addEventListener('input', e => {
    searchQueries.logistics = e.target.value.toLowerCase();
    renderLogisticsTable();
  });
  document.getElementById('insuranceSearch').addEventListener('input', e => {
    searchQueries.insurance = e.target.value.toLowerCase();
    renderInsuranceTable();
  });
  document.getElementById('riskmapSearch').addEventListener('input', e => {
    searchQueries.riskmap = e.target.value.toLowerCase();
    renderRiskmapTable();
  });
});

function loadState() {
  // Load from localStorage, fall back to DATA defaults
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      adminState.logistics = saved.logistics || deepClone(DATA.logistics);
      adminState.insurance = saved.insurance || deepClone(DATA.insurance);
      adminState.riskMap   = saved.riskMap   || deepClone(DATA.riskMap);
      return;
    }
  } catch (e) {}
  adminState.logistics = deepClone(DATA.logistics);
  adminState.insurance = deepClone(DATA.insurance);
  adminState.riskMap   = deepClone(DATA.riskMap);
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    logistics: adminState.logistics,
    insurance: adminState.insurance,
    riskMap:   adminState.riskMap,
  }));
}

// ── Auth ──────────────────────────────────────────────
function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  const app = document.getElementById('adminApp');
  app.style.display = 'flex';
  app.classList.add('visible');
  navigate('dashboard');
}

function logout() {
  sessionStorage.removeItem('admin_authed');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminApp').classList.remove('visible');
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = '';
}

// ── Navigation ────────────────────────────────────────
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + page);
  });
  if (page === 'dashboard')  renderDashboard();
  if (page === 'logistics')  renderLogisticsTable();
  if (page === 'insurance')  renderInsuranceTable();
  if (page === 'riskmap')    renderRiskmapTable();
}

// ── Dashboard ─────────────────────────────────────────
function renderDashboard() {
  const lKeys = Object.keys(adminState.logistics);
  const iKeys = Object.keys(adminState.insurance);
  const highRisk = lKeys.filter(k => adminState.logistics[k].riskLevel === 'high').length;
  const uninsured = lKeys.filter(k => !adminState.logistics[k].insured).length;

  document.getElementById('statLogistics').textContent = lKeys.length;
  document.getElementById('statInsurance').textContent = iKeys.length;
  document.getElementById('statHighRisk').textContent  = highRisk;
  document.getElementById('statUninsured').textContent = uninsured;

  // Recent activity feed
  const feed = document.getElementById('activityFeed');
  const inProgress = lKeys
    .map(k => adminState.logistics[k])
    .filter(l => l.timeline.some(t => t.status === 'in-progress'));

  if (inProgress.length === 0) {
    feed.innerHTML = '<div class="table-empty"><i class="fas fa-check-circle"></i>暂无进行中的运单</div>';
    return;
  }

  feed.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>运单号</th><th>承运人</th><th>当前位置</th><th>预计到达</th><th>风险</th>
      </tr></thead>
      <tbody>
        ${inProgress.map(l => `
          <tr>
            <td class="td-mono">${l.trackingNo}</td>
            <td>${l.carrier}</td>
            <td style="color:var(--text2)">${l.currentLocation}</td>
            <td>${l.eta}</td>
            <td>${riskBadge(l.riskLevel)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── Logistics Table ───────────────────────────────────
function renderLogisticsTable() {
  const q = searchQueries.logistics;
  const rows = Object.values(adminState.logistics).filter(l =>
    !q ||
    l.trackingNo.toLowerCase().includes(q) ||
    l.carrier.toLowerCase().includes(q) ||
    l.origin.toLowerCase().includes(q) ||
    l.destination.toLowerCase().includes(q) ||
    l.currentLocation.toLowerCase().includes(q)
  );

  const tbody = document.getElementById('logisticsTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty"><i class="fas fa-inbox"></i>暂无数据</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(l => `
    <tr>
      <td class="td-mono">${l.trackingNo}</td>
      <td>${l.carrier}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.origin} → ${l.destination}</td>
      <td>${l.eta}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);">${l.currentLocation}</td>
      <td>${riskBadge(l.riskLevel)}</td>
      <td>${l.insured ? `<span class="badge badge-success"><i class="fas fa-shield-alt"></i> 已投保</span>` : `<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> 未投保</span>`}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openLogisticsEdit('${l.trackingNo}')" title="编辑">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="confirmDelete('logistics','${l.trackingNo}')" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Insurance Table ───────────────────────────────────
function renderInsuranceTable() {
  const q = searchQueries.insurance;
  const rows = Object.values(adminState.insurance).filter(p =>
    !q ||
    p.policyNo.toLowerCase().includes(q) ||
    p.insured.toLowerCase().includes(q) ||
    p.insurer.toLowerCase().includes(q) ||
    p.cargoType.toLowerCase().includes(q)
  );

  const tbody = document.getElementById('insuranceTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty"><i class="fas fa-inbox"></i>暂无数据</td></tr>`;
    return;
  }

  const statusLabels = { active: '生效中', expired: '已到期', claimed: '理赔中', cancelled: '已注销' };

  tbody.innerHTML = rows.map(p => `
    <tr>
      <td class="td-mono">${p.policyNo}</td>
      <td>${p.insured}</td>
      <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.cargoType}</td>
      <td style="color:var(--accent);font-weight:600;">${p.coverageAmount}</td>
      <td style="color:var(--text2);font-size:11px;">${p.startDate}<br>${p.endDate}</td>
      <td>${statusBadge(p.status, statusLabels[p.status] || p.status)}</td>
      <td>${riskBadge(p.riskLevel)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openInsuranceEdit('${p.policyNo}')" title="编辑">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="confirmDelete('insurance','${p.policyNo}')" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Risk Map Table ────────────────────────────────────
function renderRiskmapTable() {
  const q = searchQueries.riskmap;
  const rows = Object.entries(adminState.riskMap).filter(([code, c]) =>
    !q || code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  );

  const tbody = document.getElementById('riskmapTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty"><i class="fas fa-inbox"></i>暂无数据</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(([code, c]) => `
    <tr>
      <td class="td-mono">${code}</td>
      <td>${c.name}</td>
      <td>${riskBadge(c.riskLevel)}</td>
      <td>${c.inTransit}</td>
      <td>
        <span class="color-preview" style="background:${c.color};"></span>
        ${c.coverage}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openRiskmapEdit('${code}')" title="编辑">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-icon" onclick="confirmDelete('riskmap','${code}')" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════
//  LOGISTICS MODAL
// ═══════════════════════════════════════════════

function openLogisticsAdd() {
  showModal({
    title: '<i class="fas fa-plus-circle"></i> 新增运单',
    body: buildLogisticsForm(null),
    onSave: () => saveLogistics(null),
  });
  initTagInputs();
}

function openLogisticsEdit(key) {
  const data = adminState.logistics[key];
  showModal({
    title: '<i class="fas fa-pen"></i> 编辑运单 — ' + key,
    body: buildLogisticsForm(data),
    onSave: () => saveLogistics(key),
  });
  initTagInputs();
}

function buildLogisticsForm(d) {
  const isNew = !d;
  const v = d || {
    trackingNo: '', carrier: '', vessel: '', voyage: '',
    origin: '', destination: '', eta: '', currentLocation: '',
    riskLevel: 'low', cargo: '', weight: '',
    insured: false, policyNo: '', timeline: []
  };

  return `
  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-info-circle"></i> 基本信息</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">运单号 *</label>
        <input id="f_trackingNo" class="form-input" value="${v.trackingNo}"
          ${isNew ? '' : 'readonly style="opacity:0.6"'} placeholder="ME20250001">
      </div>
      <div class="form-group">
        <label class="form-label">承运人</label>
        <input id="f_carrier" class="form-input" value="${esc(v.carrier)}" placeholder="例：中远海运（COSCO）">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">船名/航班</label>
        <input id="f_vessel" class="form-input" value="${esc(v.vessel)}" placeholder="COSCO DUBAI">
      </div>
      <div class="form-group">
        <label class="form-label">航次</label>
        <input id="f_voyage" class="form-input" value="${esc(v.voyage)}" placeholder="CS2503E">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">起运港/机场</label>
        <input id="f_origin" class="form-input" value="${esc(v.origin)}" placeholder="上海洋山港">
      </div>
      <div class="form-group">
        <label class="form-label">目的港/机场</label>
        <input id="f_destination" class="form-input" value="${esc(v.destination)}" placeholder="迪拜杰贝阿里港">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">预计到达日期</label>
        <input id="f_eta" class="form-input" type="date" value="${v.eta}">
      </div>
      <div class="form-group">
        <label class="form-label">风险等级</label>
        <select id="f_riskLevel" class="form-select">
          <option value="low"    ${v.riskLevel==='low'    ?'selected':''}>低风险</option>
          <option value="medium" ${v.riskLevel==='medium' ?'selected':''}>中风险</option>
          <option value="high"   ${v.riskLevel==='high'   ?'selected':''}>高风险</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">当前位置</label>
      <input id="f_currentLocation" class="form-input" value="${esc(v.currentLocation)}" placeholder="印度洋（N12°38', E68°14'）">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">货物描述</label>
        <input id="f_cargo" class="form-input" value="${esc(v.cargo)}" placeholder="电子产品（3×40HQ）">
      </div>
      <div class="form-group">
        <label class="form-label">重量</label>
        <input id="f_weight" class="form-input" value="${esc(v.weight)}" placeholder="62.4 吨">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="display:flex;align-items:center;gap:10px;padding-top:22px;">
        <input id="f_insured" type="checkbox" ${v.insured ? 'checked' : ''}
          style="width:16px;height:16px;accent-color:var(--accent);cursor:pointer;">
        <label for="f_insured" class="form-label" style="margin:0;cursor:pointer;">已投保</label>
      </div>
      <div class="form-group">
        <label class="form-label">关联保单号</label>
        <input id="f_policyNo" class="form-input" value="${esc(v.policyNo||'')}" placeholder="INS-ME-2025-0001">
      </div>
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title">
      <i class="fas fa-history"></i> 货运轨迹节点
      <button type="button" class="tl-add-btn" onclick="addTimelineRow()" style="margin-left:auto;padding:3px 8px;">
        <i class="fas fa-plus"></i> 添加节点
      </button>
    </div>
    <div style="overflow-x:auto;">
      <table class="timeline-table" id="timelineTable">
        <thead><tr>
          <th>时间</th><th>地点</th><th>状态</th><th>事件</th><th>详情</th><th style="width:36px;"></th>
        </tr></thead>
        <tbody id="timelineTbody">
          ${v.timeline.map((t, i) => buildTimelineRow(t, i)).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function buildTimelineRow(t, i) {
  const statuses = [
    { v:'completed',  l:'已完成' },
    { v:'in-progress',l:'进行中' },
    { v:'pending',    l:'待执行' },
  ];
  const opts = statuses.map(s => `<option value="${s.v}" ${t.status===s.v?'selected':''}>${s.l}</option>`).join('');
  return `
    <tr id="tlrow-${i}">
      <td><input class="tl-input" placeholder="2025-03-18 09:00" value="${esc(t.time)}"></td>
      <td><input class="tl-input" placeholder="上海洋山港" value="${esc(t.location)}"></td>
      <td><select class="tl-select">${opts}</select></td>
      <td><input class="tl-input" placeholder="货物装船完成" value="${esc(t.event)}"></td>
      <td><input class="tl-input" placeholder="详情备注" value="${esc(t.detail)}"></td>
      <td><button type="button" class="btn btn-danger btn-sm btn-icon" onclick="removeTimelineRow(this)" title="删除">
        <i class="fas fa-minus"></i>
      </button></td>
    </tr>`;
}

let tlRowCounter = 1000;

function addTimelineRow() {
  const tbody = document.getElementById('timelineTbody');
  if (!tbody) return;
  const i = tlRowCounter++;
  const row = buildTimelineRow({ time:'', location:'', status:'pending', event:'', detail:'' }, i);
  tbody.insertAdjacentHTML('beforeend', row);
}

function removeTimelineRow(btn) {
  btn.closest('tr').remove();
}

function readTimelineRows() {
  const rows = document.querySelectorAll('#timelineTbody tr');
  return Array.from(rows).map(row => {
    const inputs  = row.querySelectorAll('input');
    const select  = row.querySelector('select');
    return {
      time:     inputs[0]?.value.trim() || '',
      location: inputs[1]?.value.trim() || '',
      status:   select?.value || 'pending',
      event:    inputs[2]?.value.trim() || '',
      detail:   inputs[3]?.value.trim() || '',
    };
  }).filter(r => r.event || r.location);
}

function saveLogistics(existingKey) {
  const key  = existingKey || document.getElementById('f_trackingNo').value.trim().toUpperCase();
  if (!key) { toast('运单号不能为空', 'error'); return false; }

  const entry = {
    trackingNo:      key,
    carrier:         document.getElementById('f_carrier').value.trim(),
    vessel:          document.getElementById('f_vessel').value.trim(),
    voyage:          document.getElementById('f_voyage').value.trim(),
    origin:          document.getElementById('f_origin').value.trim(),
    destination:     document.getElementById('f_destination').value.trim(),
    eta:             document.getElementById('f_eta').value.trim(),
    currentLocation: document.getElementById('f_currentLocation').value.trim(),
    riskLevel:       document.getElementById('f_riskLevel').value,
    cargo:           document.getElementById('f_cargo').value.trim(),
    weight:          document.getElementById('f_weight').value.trim(),
    insured:         document.getElementById('f_insured').checked,
    policyNo:        document.getElementById('f_policyNo').value.trim() || null,
    timeline:        readTimelineRows(),
  };

  adminState.logistics[key] = entry;
  persistState();
  updateSidebarCounts();
  toast(existingKey ? '运单已更新' : '运单已创建', 'success');
  renderLogisticsTable();
  return true;
}

// ═══════════════════════════════════════════════
//  INSURANCE MODAL
// ═══════════════════════════════════════════════

function openInsuranceAdd() {
  showModal({
    title: '<i class="fas fa-plus-circle"></i> 新增保单',
    body: buildInsuranceForm(null),
    onSave: () => saveInsurance(null),
  });
  initTagInputs();
}

function openInsuranceEdit(key) {
  const data = adminState.insurance[key];
  showModal({
    title: '<i class="fas fa-pen"></i> 编辑保单 — ' + key,
    body: buildInsuranceForm(data),
    onSave: () => saveInsurance(key),
  });
  initTagInputs();
}

function buildInsuranceForm(d) {
  const isNew = !d;
  const v = d || {
    policyNo: '', insured: '', insurer: '', cargoType: '',
    coverageAmount: '', premium: '', rate: '',
    startDate: '', endDate: '',
    status: 'active', riskLevel: 'low',
    trackingNo: '', route: '', transport: '海运',
    deductible: '', coverage: [], exclusions: [],
    conditions: '', claimHistory: [],
  };

  const covTags  = (v.coverage || []).join('，');
  const exclTags = (v.exclusions || []).join('，');

  const statusOptions = ['active','expired','claimed','cancelled'].map(s => {
    const labels = { active:'生效中', expired:'已到期', claimed:'理赔中', cancelled:'已注销' };
    return `<option value="${s}" ${v.status===s?'selected':''}>${labels[s]}</option>`;
  }).join('');

  const claimsHTML = (v.claimHistory || []).map((c, i) => buildClaimRow(c, i)).join('');

  return `
  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-file-contract"></i> 保单基本信息</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">保单号 *</label>
        <input id="pi_policyNo" class="form-input" value="${esc(v.policyNo)}"
          ${isNew ? '' : 'readonly style="opacity:0.6"'} placeholder="INS-ME-2025-0001">
      </div>
      <div class="form-group">
        <label class="form-label">关联运单号</label>
        <input id="pi_trackingNo" class="form-input" value="${esc(v.trackingNo||'')}" placeholder="ME20250001">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">被保险人</label>
        <input id="pi_insured" class="form-input" value="${esc(v.insured)}" placeholder="公司名称">
      </div>
      <div class="form-group">
        <label class="form-label">承保公司</label>
        <input id="pi_insurer" class="form-input" value="${esc(v.insurer)}" placeholder="中国太平洋财险">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">货物品类</label>
      <input id="pi_cargoType" class="form-input" value="${esc(v.cargoType)}" placeholder="电子产品（消费电子/零部件）">
    </div>
    <div class="form-row-3">
      <div class="form-group">
        <label class="form-label">保险金额</label>
        <input id="pi_coverageAmount" class="form-input" value="${esc(v.coverageAmount)}" placeholder="USD 1,850,000">
      </div>
      <div class="form-group">
        <label class="form-label">保费</label>
        <input id="pi_premium" class="form-input" value="${esc(v.premium)}" placeholder="USD 5,550">
      </div>
      <div class="form-group">
        <label class="form-label">费率</label>
        <input id="pi_rate" class="form-input" value="${esc(v.rate)}" placeholder="0.30%">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">保险起期</label>
        <input id="pi_startDate" class="form-input" type="date" value="${v.startDate}">
      </div>
      <div class="form-group">
        <label class="form-label">保险止期</label>
        <input id="pi_endDate" class="form-input" type="date" value="${v.endDate}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">状态</label>
        <select id="pi_status" class="form-select">${statusOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">风险等级</label>
        <select id="pi_riskLevel" class="form-select">
          <option value="low"    ${v.riskLevel==='low'   ?'selected':''}>低风险</option>
          <option value="medium" ${v.riskLevel==='medium'?'selected':''}>中风险</option>
          <option value="high"   ${v.riskLevel==='high'  ?'selected':''}>高风险</option>
        </select>
      </div>
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-route"></i> 运输信息</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">运输路线</label>
        <input id="pi_route" class="form-input" value="${esc(v.route)}" placeholder="上海 → 迪拜（杰贝阿里港）">
      </div>
      <div class="form-group">
        <label class="form-label">运输方式</label>
        <select id="pi_transport" class="form-select">
          <option value="海运" ${v.transport==='海运'?'selected':''}>海运</option>
          <option value="航空" ${v.transport==='航空'?'selected':''}>航空</option>
          <option value="陆运" ${v.transport==='陆运'?'selected':''}>陆运</option>
          <option value="多式联运" ${v.transport==='多式联运'?'selected':''}>多式联运</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">免赔额</label>
      <input id="pi_deductible" class="form-input" value="${esc(v.deductible)}" placeholder="USD 5,000">
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-umbrella"></i> 承保范围（每项回车确认）</div>
    <div id="covTagWrap" class="tag-input-wrap" data-target="coverage">
      ${(v.coverage||[]).map(t => buildTag(t, 'coverage')).join('')}
      <input class="tag-real-input" placeholder="输入后按 Enter 添加…">
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-ban"></i> 除外责任（每项回车确认）</div>
    <div id="exclTagWrap" class="tag-input-wrap" data-target="exclusions">
      ${(v.exclusions||[]).map(t => buildTag(t, 'exclusions')).join('')}
      <input class="tag-real-input" placeholder="输入后按 Enter 添加…">
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-info-circle"></i> 保险条件备注</div>
    <textarea id="pi_conditions" class="form-textarea" placeholder="特别条款、备注说明…">${esc(v.conditions||'')}</textarea>
  </div>

  <div class="form-section">
    <div class="form-section-title">
      <i class="fas fa-hand-holding-usd"></i> 理赔历史
      <button type="button" class="tl-add-btn" onclick="addClaimRow()" style="margin-left:auto;padding:3px 8px;">
        <i class="fas fa-plus"></i> 添加记录
      </button>
    </div>
    <div id="claimsList">
      ${claimsHTML}
    </div>
  </div>`;
}

let claimCounter = 2000;

function buildClaimRow(c, i) {
  return `
    <div class="claim-edit-item" id="claimrow-${i}">
      <button type="button" class="claim-delete-btn" onclick="removeClaimRow(this)" title="删除">
        <i class="fas fa-times"></i>
      </button>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">日期</label>
          <input class="form-input" name="cl_date"   value="${esc(c.date||'')}"   placeholder="2024-11-15" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">类型</label>
          <input class="form-input" name="cl_type"   value="${esc(c.type||'')}"   placeholder="部分损失">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">金额</label>
          <input class="form-input" name="cl_amount" value="${esc(c.amount||'')}" placeholder="USD 35,000">
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <select class="form-select" name="cl_status">
            <option ${c.status==='已赔付'?'selected':''}>已赔付</option>
            <option ${c.status==='处理中'?'selected':''}>处理中</option>
            <option ${c.status==='已拒绝'?'selected':''}>已拒绝</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">描述</label>
        <input class="form-input" name="cl_desc" value="${esc(c.desc||'')}" placeholder="损失原因及说明">
      </div>
    </div>`;
}

function addClaimRow() {
  const list = document.getElementById('claimsList');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', buildClaimRow({ date:'', type:'', amount:'', status:'处理中', desc:'' }, claimCounter++));
}

function removeClaimRow(btn) { btn.closest('.claim-edit-item').remove(); }

function readClaimRows() {
  return Array.from(document.querySelectorAll('#claimsList .claim-edit-item')).map(el => ({
    date:   el.querySelector('[name="cl_date"]')?.value.trim()   || '',
    type:   el.querySelector('[name="cl_type"]')?.value.trim()   || '',
    amount: el.querySelector('[name="cl_amount"]')?.value.trim() || '',
    status: el.querySelector('[name="cl_status"]')?.value        || '',
    desc:   el.querySelector('[name="cl_desc"]')?.value.trim()   || '',
  })).filter(c => c.type || c.amount);
}

function saveInsurance(existingKey) {
  const key = existingKey || document.getElementById('pi_policyNo').value.trim().toUpperCase();
  if (!key) { toast('保单号不能为空', 'error'); return false; }

  const entry = {
    policyNo:       key,
    insured:        document.getElementById('pi_insured').value.trim(),
    insurer:        document.getElementById('pi_insurer').value.trim(),
    cargoType:      document.getElementById('pi_cargoType').value.trim(),
    coverageAmount: document.getElementById('pi_coverageAmount').value.trim(),
    premium:        document.getElementById('pi_premium').value.trim(),
    rate:           document.getElementById('pi_rate').value.trim(),
    startDate:      document.getElementById('pi_startDate').value.trim(),
    endDate:        document.getElementById('pi_endDate').value.trim(),
    status:         document.getElementById('pi_status').value,
    riskLevel:      document.getElementById('pi_riskLevel').value,
    trackingNo:     document.getElementById('pi_trackingNo').value.trim(),
    route:          document.getElementById('pi_route').value.trim(),
    transport:      document.getElementById('pi_transport').value,
    deductible:     document.getElementById('pi_deductible').value.trim(),
    coverage:       readTags('covTagWrap'),
    exclusions:     readTags('exclTagWrap'),
    conditions:     document.getElementById('pi_conditions').value.trim(),
    claimHistory:   readClaimRows(),
  };

  adminState.insurance[key] = entry;
  persistState();
  updateSidebarCounts();
  toast(existingKey ? '保单已更新' : '保单已创建', 'success');
  renderInsuranceTable();
  return true;
}

// ═══════════════════════════════════════════════
//  RISKMAP MODAL
// ═══════════════════════════════════════════════

function openRiskmapAdd() {
  showModal({
    title: '<i class="fas fa-plus-circle"></i> 新增国家/地区',
    body: buildRiskmapForm(null),
    onSave: () => saveRiskmap(null),
  });
  initTagInputs();
}

function openRiskmapEdit(code) {
  const data = adminState.riskMap[code];
  showModal({
    title: '<i class="fas fa-pen"></i> 编辑 — ' + data.name,
    body: buildRiskmapForm(data, code),
    onSave: () => saveRiskmap(code),
  });
  initTagInputs();
}

function buildRiskmapForm(d, code) {
  const isNew = !d;
  const v = d || { name:'', riskLevel:'low', inTransit:'', coverage:'', events:[], color:'#22c55e' };

  return `
  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-flag"></i> 基本信息</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">国家代码（ISO A2）*</label>
        <input id="rm_code" class="form-input" value="${esc(code||'')}"
          ${isNew ? '' : 'readonly style="opacity:0.6"'} placeholder="SA" maxlength="4" style="text-transform:uppercase;">
      </div>
      <div class="form-group">
        <label class="form-label">国家/地区名称</label>
        <input id="rm_name" class="form-input" value="${esc(v.name)}" placeholder="沙特阿拉伯">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">风险等级</label>
        <select id="rm_riskLevel" class="form-select">
          <option value="low"      ${v.riskLevel==='low'     ?'selected':''}>低风险</option>
          <option value="medium"   ${v.riskLevel==='medium'  ?'selected':''}>中风险</option>
          <option value="high"     ${v.riskLevel==='high'    ?'selected':''}>高风险</option>
          <option value="critical" ${v.riskLevel==='critical'?'selected':''}>极高风险</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">地图显示颜色</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="rm_color" class="form-input" type="color" value="${v.color||'#22c55e'}" style="width:50px;padding:3px;">
          <input id="rm_colorHex" class="form-input" value="${v.color||'#22c55e'}" style="flex:1;" placeholder="#22c55e">
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">在途货量</label>
        <input id="rm_inTransit" class="form-input" value="${esc(v.inTransit)}" placeholder="12,450 TEU">
      </div>
      <div class="form-group">
        <label class="form-label">保险覆盖率</label>
        <input id="rm_coverage" class="form-input" value="${esc(v.coverage)}" placeholder="72.4%">
      </div>
    </div>
  </div>

  <div class="form-section">
    <div class="form-section-title"><i class="fas fa-newspaper"></i> 近期事件（每项回车确认）</div>
    <div id="eventsTagWrap" class="tag-input-wrap" data-target="events">
      ${(v.events||[]).map(t => buildTag(t, 'events')).join('')}
      <input class="tag-real-input" placeholder="输入事件描述后按 Enter…">
    </div>
  </div>`;
}

function saveRiskmap(existingCode) {
  const rawCode = (existingCode || document.getElementById('rm_code').value.trim()).toUpperCase();
  if (!rawCode) { toast('国家代码不能为空', 'error'); return false; }

  // Sync color hex fields
  const colorPicker = document.getElementById('rm_color');
  const colorHex    = document.getElementById('rm_colorHex');
  const color = colorPicker?.value || colorHex?.value || '#22c55e';

  const entry = {
    name:      document.getElementById('rm_name').value.trim(),
    riskLevel: document.getElementById('rm_riskLevel').value,
    inTransit: document.getElementById('rm_inTransit').value.trim(),
    coverage:  document.getElementById('rm_coverage').value.trim(),
    color,
    events:    readTags('eventsTagWrap'),
  };

  adminState.riskMap[rawCode] = entry;
  persistState();
  toast(existingCode ? '地区信息已更新' : '地区已添加', 'success');
  renderRiskmapTable();
  return true;
}

// ═══════════════════════════════════════════════
//  TAG INPUT
// ═══════════════════════════════════════════════

function buildTag(text, group) {
  return `<span class="tag" data-group="${group}">${esc(text)}<span class="tag-del" onclick="removeTag(this)">×</span></span>`;
}

function removeTag(btn) { btn.parentElement.remove(); }

function readTags(wrapId) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return [];
  return Array.from(wrap.querySelectorAll('.tag')).map(t => t.childNodes[0].textContent.trim()).filter(Boolean);
}

function initTagInputs() {
  // Wait for next tick so modal DOM is rendered
  setTimeout(() => {
    document.querySelectorAll('.tag-input-wrap').forEach(wrap => {
      const input = wrap.querySelector('.tag-real-input');
      if (!input || input._tagInit) return;
      input._tagInit = true;
      const group = wrap.dataset.target || 'tag';

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === '，' || e.key === ',') {
          e.preventDefault();
          const val = input.value.trim().replace(/，|,/g, '');
          if (!val) return;
          input.insertAdjacentHTML('beforebegin', buildTag(val, group));
          input.value = '';
        } else if (e.key === 'Backspace' && input.value === '') {
          const tags = wrap.querySelectorAll('.tag');
          if (tags.length > 0) tags[tags.length - 1].remove();
        }
      });

      wrap.addEventListener('click', () => input.focus());
    });

    // Sync color picker ↔ hex input
    const cp = document.getElementById('rm_color');
    const ch = document.getElementById('rm_colorHex');
    if (cp && ch) {
      cp.addEventListener('input', () => { ch.value = cp.value; });
      ch.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(ch.value)) cp.value = ch.value;
      });
    }
  }, 0);
}

// ═══════════════════════════════════════════════
//  DELETE / CONFIRM
// ═══════════════════════════════════════════════

let pendingDelete = null;

function confirmDelete(type, key) {
  const names = {
    logistics: '运单',
    insurance: '保单',
    riskmap:   '国家/地区',
  };
  pendingDelete = { type, key };

  showModal({
    title: '<i class="fas fa-exclamation-triangle" style="color:var(--danger)"></i> 确认删除',
    body: `
      <div class="confirm-dialog" style="padding:10px 0;">
        <div class="confirm-icon">🗑️</div>
        <h3>确认删除此${names[type]}？</h3>
        <p>即将删除：<strong style="color:var(--info)">${key}</strong><br>此操作不可撤销。</p>
      </div>`,
    saveLabel: '确认删除',
    saveCls: 'btn-danger',
    onSave: () => { execDelete(); return true; },
  });
}

function execDelete() {
  if (!pendingDelete) return;
  const { type, key } = pendingDelete;
  if (type === 'logistics') delete adminState.logistics[key];
  if (type === 'insurance') delete adminState.insurance[key];
  if (type === 'riskmap')   delete adminState.riskMap[key];
  persistState();
  updateSidebarCounts();
  toast('已删除', 'info');
  if (type === 'logistics') renderLogisticsTable();
  if (type === 'insurance') renderInsuranceTable();
  if (type === 'riskmap')   renderRiskmapTable();
  pendingDelete = null;
}

// ═══════════════════════════════════════════════
//  RESET DATA
// ═══════════════════════════════════════════════

function confirmResetData() {
  showModal({
    title: '<i class="fas fa-rotate-left"></i> 重置数据',
    body: `
      <div class="confirm-dialog" style="padding:10px 0;">
        <div class="confirm-icon">⚠️</div>
        <h3>确认重置所有数据？</h3>
        <p>将清除所有管理员编辑记录，恢复到初始 Mock 数据。</p>
      </div>`,
    saveLabel: '确认重置',
    saveCls: 'btn-danger',
    onSave: () => {
      localStorage.removeItem(STORAGE_KEY);
      adminState.logistics = deepClone(DATA.logistics);
      adminState.insurance = deepClone(DATA.insurance);
      adminState.riskMap   = deepClone(DATA.riskMap);
      updateSidebarCounts();
      toast('数据已重置为初始状态', 'info');
      navigate(currentPage);
      return true;
    },
  });
}

// ═══════════════════════════════════════════════
//  MODAL ENGINE
// ═══════════════════════════════════════════════

let onModalSave = null;

function showModal({ title, body, onSave, saveLabel = '保存', saveCls = 'btn-primary' }) {
  onModalSave = onSave;
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalSaveBtn').className = `btn ${saveCls}`;
  document.getElementById('modalSaveBtn').innerHTML = `<i class="fas fa-check"></i> ${saveLabel}`;
  document.getElementById('modalOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.body.style.overflow = '';
  onModalSave = null;
}

function handleModalSave() {
  if (!onModalSave) { closeModal(); return; }
  const result = onModalSave();
  if (result !== false) closeModal();
}

// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// ═══════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════

function updateSidebarCounts() {
  const lCount = Object.keys(adminState.logistics).length;
  const iCount = Object.keys(adminState.insurance).length;
  const rCount = Object.keys(adminState.riskMap).length;
  const el = id => document.getElementById(id);
  if (el('countLogistics')) el('countLogistics').textContent = lCount;
  if (el('countInsurance')) el('countInsurance').textContent = iCount;
  if (el('countRiskmap'))   el('countRiskmap').textContent   = rCount;
}

function riskBadge(level) {
  const map = {
    low:      ['badge-success', '低风险'],
    medium:   ['badge-warning', '中风险'],
    high:     ['badge-danger',  '高风险'],
    critical: ['badge-danger',  '极高风险'],
  };
  const [cls, label] = map[level] || map.low;
  return `<span class="badge ${cls}">${label}</span>`;
}

function statusBadge(status, label) {
  const map = {
    active: 'badge-success', expired: 'badge-muted', claimed: 'badge-warning', cancelled: 'badge-danger'
  };
  return `<span class="badge ${map[status] || 'badge-muted'}">${label}</span>`;
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Toast notification
function toast(msg, type = 'success') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}
