/**
 * Forest Focus - 森林页面逻辑
 */
const ForestPage = {
  render() {
    const trees = Storage.getTrees();
    const stats = Storage.getStats();
    const grid = document.getElementById('forestGrid');
    const empty = document.getElementById('forestEmpty');

    // 更新统计
    document.getElementById('forestTotalTrees').textContent = stats.totalTrees;
    document.getElementById('forestTotalHours').textContent = (stats.totalMinutes / 60).toFixed(1);

    if (trees.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = trees.map((tree, i) => {
      const seed = Storage.getSeedById(tree.seedId);
      return `
        <div class="forest-tree" data-index="${i}">
          <canvas class="forest-tree-canvas" width="80" height="80"></canvas>
          <div class="forest-tree-time">${tree.duration}分钟</div>
          <div class="forest-tree-date">${tree.date.slice(5)}</div>
        </div>
      `;
    }).join('');

    // 绘制每棵小树
    grid.querySelectorAll('.forest-tree-canvas').forEach((canvas, i) => {
      const ctx = canvas.getContext('2d');
      const seed = Storage.getSeedById(trees[i].seedId);
      const treeSize = trees[i].duration >= 45 ? 'large' : trees[i].duration >= 20 ? 'medium' : 'small';
      TreeRenderer.drawMini(ctx, seed, 80, treeSize);
    });

    // 点击查看详情
    grid.querySelectorAll('.forest-tree').forEach((el) => {
      el.addEventListener('click', () => {
        const index = parseInt(el.dataset.index);
        this._showDetail(trees[index]);
      });
    });
  },

  _showDetail(tree) {
    const seed = Storage.getSeedById(tree.seedId);
    const overlay = document.createElement('div');
    overlay.className = 'tree-detail-overlay';
    overlay.innerHTML = `
      <div class="tree-detail-card">
        <h3>${seed.emoji} ${seed.name}</h3>
        <canvas id="detailCanvas" width="150" height="180"></canvas>
        <div class="tree-detail-info">
          <div>📅 ${tree.date} ${tree.time || ''}</div>
          <div>⏱️ 专注了 ${tree.duration} 分钟</div>
          ${tree.promise ? `<div>🎯 承诺：${tree.promise}</div>` : ''}
          ${tree.completed !== undefined ? `<div>${tree.completed ? '✅ 已完成' : '⏳ 未完成'}</div>` : ''}
        </div>
        <button class="tree-detail-close">关闭</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // 绘制详情树
    const canvas = document.getElementById('detailCanvas');
    const ctx = canvas.getContext('2d');
    const treeSize = tree.duration >= 45 ? 'large' : tree.duration >= 20 ? 'medium' : 'small';
    TreeRenderer.drawMini(ctx, seed, 150, treeSize);

    // 关闭
    overlay.querySelector('.tree-detail-close').addEventListener('click', () => {
      overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  },
};
