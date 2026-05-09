// Chart.js initialization and rendering

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function initCharts() {
  initPremiumChart();
  initPenetrationChart();
  initTypeChart();
}

function initPremiumChart() {
  destroyChart('premiumChart');
  const ctx = document.getElementById('premiumChart');
  if (!ctx) return;

  chartInstances['premiumChart'] = new Chart(ctx, {
    type: 'line',
    data: DATA.premiumTrend,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: { color: '#c8d8f0', font: { family: "'Noto Sans SC', sans-serif", size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 20, 45, 0.95)',
          titleColor: '#d4a017',
          bodyColor: '#c8d8f0',
          borderColor: '#d4a017',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` 保费规模: ${ctx.raw} 亿美元`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(200, 216, 240, 0.1)' },
          ticks: { color: '#8ca8c8', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(200, 216, 240, 0.1)' },
          ticks: {
            color: '#8ca8c8',
            font: { size: 11 },
            callback: v => v + ' 亿'
          }
        }
      }
    }
  });
}

function initPenetrationChart() {
  destroyChart('penetrationChart');
  const ctx = document.getElementById('penetrationChart');
  if (!ctx) return;

  chartInstances['penetrationChart'] = new Chart(ctx, {
    type: 'bar',
    data: DATA.penetrationByCountry,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10, 20, 45, 0.95)',
          titleColor: '#d4a017',
          bodyColor: '#c8d8f0',
          borderColor: '#d4a017',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` 保险渗透率: ${ctx.raw}%`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#8ca8c8', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(200, 216, 240, 0.1)' },
          ticks: {
            color: '#8ca8c8',
            font: { size: 11 },
            callback: v => v + '%'
          },
          max: 100,
        }
      }
    }
  });
}

function initTypeChart() {
  destroyChart('typeChart');
  const ctx = document.getElementById('typeChart');
  if (!ctx) return;

  chartInstances['typeChart'] = new Chart(ctx, {
    type: 'doughnut',
    data: DATA.insuranceTypes,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#c8d8f0',
            font: { family: "'Noto Sans SC', sans-serif", size: 11 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 20, 45, 0.95)',
          titleColor: '#d4a017',
          bodyColor: '#c8d8f0',
          borderColor: '#d4a017',
          borderWidth: 1,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw}%`
          }
        }
      }
    }
  });
}
