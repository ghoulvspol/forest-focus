/**
 * Forest Focus - 数据存储层
 * 使用 localStorage 持久化所有数据
 */
const Storage = {
  KEYS: {
    TREES: 'forest_trees',
    STATS: 'forest_stats',
    SETTINGS: 'forest_settings',
    DAILY_USAGE: 'forest_daily_usage',
  },

  // ========== 树木数据 ==========
  getTrees() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.TREES)) || [];
    } catch { return []; }
  },

  addTree(tree) {
    const trees = this.getTrees();
    trees.unshift(tree); // 最新的在前
    localStorage.setItem(this.KEYS.TREES, JSON.stringify(trees));
    return tree;
  },

  // ========== 每日使用次数 ==========
  getDailyUsage() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEYS.DAILY_USAGE));
      const today = new Date().toISOString().slice(0, 10);
      if (!data || data.date !== today) {
        return { date: today, count: 0 };
      }
      return data;
    } catch {
      return { date: new Date().toISOString().slice(0, 10), count: 0 };
    }
  },

  incrementDailyUsage() {
    const usage = this.getDailyUsage();
    usage.count += 1;
    localStorage.setItem(this.KEYS.DAILY_USAGE, JSON.stringify(usage));
    return usage;
  },

  getRemainingFree() {
    const usage = this.getDailyUsage();
    return Math.max(0, 3 - usage.count);
  },

  // ========== 统计数据 ==========
  getStats() {
    const trees = this.getTrees();
    const today = new Date().toISOString().slice(0, 10);
    const todayTrees = trees.filter(t => t.date === today);
    const todayMinutes = todayTrees.reduce((sum, t) => sum + t.duration, 0);

    // 本周数据
    const weekData = this._getWeekData(trees);

    // 连续天数
    const streak = this._calcStreak(trees);

    return {
      totalTrees: trees.length,
      totalMinutes: trees.reduce((sum, t) => sum + t.duration, 0),
      todayCount: todayTrees.length,
      todayMinutes,
      weekData,
      streak,
      longestFocus: trees.length > 0 ? Math.max(...trees.map(t => t.duration)) : 0,
    };
  },

  _getWeekData(trees) {
    const result = [];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayTrees = trees.filter(t => t.date === dateStr);
      const minutes = dayTrees.reduce((sum, t) => sum + t.duration, 0);
      result.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        minutes,
        count: dayTrees.length,
        isToday: i === 0,
      });
    }
    return result;
  },

  _calcStreak(trees) {
    if (trees.length === 0) return 0;
    const dates = [...new Set(trees.map(t => t.date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  // ========== 种子定义 ==========
  SEEDS: [
    {
      id: 'cherry',
      name: '樱花树',
      emoji: '🌸',
      colors: { trunk: '#8B6914', leaves: '#FFB7C5', accent: '#FF69B4' },
      description: '温柔的粉色樱花',
      free: true,
    },
    {
      id: 'pine',
      name: '松树',
      emoji: '🌲',
      colors: { trunk: '#6B4226', leaves: '#228B22', accent: '#006400' },
      description: '坚韧的常青松树',
      free: true,
    },
    {
      id: 'sunflower',
      name: '向日葵',
      emoji: '🌻',
      colors: { trunk: '#228B22', leaves: '#FFD700', accent: '#FF8C00' },
      description: '阳光的向日葵',
      free: true,
    },
  ],

  getSeedById(id) {
    return this.SEEDS.find(s => s.id === id) || this.SEEDS[0];
  },

  // ========== 清除所有数据（调试用）==========
  clearAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
  },
};
