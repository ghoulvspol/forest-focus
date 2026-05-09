/**
 * Forest Focus - 统计页面逻辑
 */
const StatsPage = {
  render() {
    const stats = Storage.getStats();

    // 卡片数据
    document.getElementById('statsTotalTrees').textContent = stats.totalTrees;
    document.getElementById('statsTotalHours').textContent = (stats.totalMinutes / 60).toFixed(1);
    document.getElementById('statsStreak').textContent = stats.streak;
    document.getElementById('statsLongest').textContent = stats.longestFocus;

    // 今日
    document.getElementById('statsTodayCount').textContent = stats.todayCount;
    document.getElementById('statsTodayMinutes').textContent = stats.todayMinutes;

    // 周图表
    this._renderWeekChart(stats.weekData);
  },

  _renderWeekChart(weekData) {
    const container = document.getElementById('weekChart');
    const maxMinutes = Math.max(...weekData.map(d => d.minutes), 1);

    container.innerHTML = weekData.map(day => {
      const heightPct = (day.minutes / maxMinutes) * 80;
      const isToday = day.isToday;
      return `
        <div class="week-bar-wrapper">
          <div class="week-bar-value">${day.minutes > 0 ? day.minutes : ''}</div>
          <div class="week-bar ${isToday ? 'today' : ''}" style="height: ${Math.max(2, heightPct)}%"></div>
          <div class="week-bar-label">${day.dayName}</div>
        </div>
      `;
    }).join('');
  },
};
