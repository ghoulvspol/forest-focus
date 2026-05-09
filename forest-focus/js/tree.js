/**
 * Forest Focus - 树木生长动画（Canvas）
 * 核心体验：种子→幼苗→小树→大树的渐变生长
 */
const TreeRenderer = {
  /**
   * 绘制树木
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} progress 0-1 生长进度
   * @param {object} seed 种子配置
   * @param {number} canvasW
   * @param {number} canvasH
   */
  draw(ctx, progress, seed, canvasW, canvasH) {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // 地面
    this._drawGround(ctx, canvasW, canvasH);

    // 根据进度决定生长阶段
    const p = Math.min(1, Math.max(0, progress));

    if (p < 0.05) {
      this._drawSeed(ctx, canvasW, canvasH, seed);
    } else if (p < 0.3) {
      this._drawSprout(ctx, canvasW, canvasH, seed, p / 0.3);
    } else if (p < 0.7) {
      this._drawSmallTree(ctx, canvasW, canvasH, seed, (p - 0.3) / 0.4);
    } else {
      this._drawFullTree(ctx, canvasW, canvasH, seed, (p - 0.7) / 0.3);
    }
  },

  _drawGround(ctx, w, h) {
    const groundY = h * 0.85;
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.ellipse(w / 2, groundY + 10, w * 0.45, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a7c23';
    ctx.beginPath();
    ctx.ellipse(w / 2, groundY + 5, w * 0.4, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawSeed(ctx, w, h, seed) {
    const cx = w / 2;
    const cy = h * 0.82;
    ctx.fillStyle = seed.colors.trunk;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 小芽
    ctx.strokeStyle = '#4a7c23';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy - 14);
    ctx.stroke();

    ctx.fillStyle = '#6abf4b';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 14, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawSprout(ctx, w, h, seed, t) {
    const cx = w / 2;
    const baseY = h * 0.82;
    const trunkH = 30 + t * 50;

    // 树干
    ctx.fillStyle = seed.colors.trunk;
    ctx.beginPath();
    ctx.moveTo(cx - 4, baseY);
    ctx.lineTo(cx + 4, baseY);
    ctx.lineTo(cx + 3, baseY - trunkH);
    ctx.lineTo(cx - 3, baseY - trunkH);
    ctx.closePath();
    ctx.fill();

    // 叶子（小）
    const leafCount = Math.floor(2 + t * 4);
    for (let i = 0; i < leafCount; i++) {
      const ly = baseY - trunkH + i * 8;
      const angle = (i % 2 === 0 ? -1 : 1) * (0.4 + t * 0.3);
      const size = 6 + t * 6;
      ctx.fillStyle = i % 2 === 0 ? seed.colors.leaves : seed.colors.accent;
      ctx.beginPath();
      ctx.ellipse(cx + Math.sin(angle) * 10, ly, size, size * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // 顶部嫩芽
    ctx.fillStyle = '#6abf4b';
    ctx.beginPath();
    ctx.ellipse(cx, baseY - trunkH - 5, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawSmallTree(ctx, w, h, seed, t) {
    const cx = w / 2;
    const baseY = h * 0.82;
    const trunkH = 80 + t * 80;

    // 树干
    const trunkW = 5 + t * 4;
    ctx.fillStyle = seed.colors.trunk;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW, baseY);
    ctx.quadraticCurveTo(cx - trunkW + 2, baseY - trunkH / 2, cx - trunkW / 2, baseY - trunkH);
    ctx.lineTo(cx + trunkW / 2, baseY - trunkH);
    ctx.quadraticCurveTo(cx + trunkW - 2, baseY - trunkH / 2, cx + trunkW, baseY);
    ctx.closePath();
    ctx.fill();

    // 树枝
    const branchCount = 2 + Math.floor(t * 3);
    for (let i = 0; i < branchCount; i++) {
      const by = baseY - trunkH * (0.4 + i * 0.15);
      const dir = i % 2 === 0 ? -1 : 1;
      const bLen = 15 + t * 20;
      ctx.strokeStyle = seed.colors.trunk;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, by);
      ctx.quadraticCurveTo(cx + dir * bLen * 0.6, by - 10, cx + dir * bLen, by - 15);
      ctx.stroke();

      // 树叶团
      ctx.fillStyle = seed.colors.leaves;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(cx + dir * bLen, by - 18, 12 + t * 8, 10 + t * 6, dir * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 顶部树冠
    ctx.fillStyle = seed.colors.accent;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - trunkH - 10, 18 + t * 12, 14 + t * 10, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawFullTree(ctx, w, h, seed, t) {
    const cx = w / 2;
    const baseY = h * 0.82;
    const trunkH = 160 + t * 30;

    // 粗树干
    const trunkW = 9 + t * 3;
    ctx.fillStyle = seed.colors.trunk;
    ctx.beginPath();
    ctx.moveTo(cx - trunkW, baseY);
    ctx.bezierCurveTo(cx - trunkW - 2, baseY - trunkH * 0.3, cx - trunkW / 2, baseY - trunkH * 0.7, cx - 3, baseY - trunkH);
    ctx.lineTo(cx + 3, baseY - trunkH);
    ctx.bezierCurveTo(cx + trunkW / 2, baseY - trunkH * 0.7, cx + trunkW + 2, baseY - trunkH * 0.3, cx + trunkW, baseY);
    ctx.closePath();
    ctx.fill();

    // 大树冠（多层）
    const crownLayers = [
      { y: -20, rx: 50 + t * 15, ry: 35 + t * 10, color: seed.colors.leaves },
      { y: -40, rx: 40 + t * 12, ry: 30 + t * 8, color: seed.colors.accent },
      { y: -55, rx: 28 + t * 8, ry: 22 + t * 6, color: seed.colors.leaves },
    ];

    crownLayers.forEach(layer => {
      ctx.fillStyle = layer.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(cx, baseY - trunkH + layer.y, layer.rx, layer.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 额外的叶子团（根据种子类型）
    if (seed.id === 'cherry') {
      // 樱花：粉色花瓣飘落效果
      for (let i = 0; i < 5; i++) {
        const px = cx + (Math.random() - 0.5) * 80;
        const py = baseY - trunkH - 20 + Math.random() * 60;
        ctx.fillStyle = '#FFB7C5';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py, 3, 2, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (seed.id === 'sunflower') {
      // 向日葵：顶部大花盘
      const flowerY = baseY - trunkH - 55;
      // 花瓣
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const px = cx + Math.cos(angle) * 18;
        const py = flowerY + Math.sin(angle) * 18;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(px, py, 8, 4, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      // 花心
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(cx, flowerY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // 树枝
    for (let i = 0; i < 4; i++) {
      const by = baseY - trunkH * (0.3 + i * 0.15);
      const dir = i % 2 === 0 ? -1 : 1;
      const bLen = 25 + t * 15;
      ctx.strokeStyle = seed.colors.trunk;
      ctx.lineWidth = 3 - i * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, by);
      ctx.quadraticCurveTo(cx + dir * bLen * 0.5, by - 15, cx + dir * bLen, by - 25);
      ctx.stroke();
    }
  },

  /**
   * 绘制静态小树（用于森林页面和完成页）
   */
  drawMini(ctx, seed, size, treeSize) {
    const w = size;
    const h = size;
    ctx.clearRect(0, 0, w, h);

    // 简化的地面
    ctx.fillStyle = '#5d8a3c';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.9, w * 0.4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = w / 2;
    const baseY = h * 0.85;

    // 树大小: 'small' | 'medium' | 'large'
    const scale = treeSize === 'large' ? 1 : treeSize === 'medium' ? 0.7 : 0.45;
    const trunkH = 30 + scale * 50;
    const trunkW = 2 + scale * 4;

    // 树干
    ctx.fillStyle = seed.colors.trunk;
    ctx.fillRect(cx - trunkW, baseY - trunkH, trunkW * 2, trunkH);

    // 树冠
    const crownR = 10 + scale * 20;
    ctx.fillStyle = seed.colors.leaves;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - trunkH - crownR * 0.5, crownR, crownR * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = seed.colors.accent;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(cx - crownR * 0.3, baseY - trunkH - crownR * 0.3, crownR * 0.6, crownR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 向日葵特殊处理
    if (seed.id === 'sunflower' && scale > 0.5) {
      const fy = baseY - trunkH - crownR;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(angle) * 8, fy + Math.sin(angle) * 8, 5, 3, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(cx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
