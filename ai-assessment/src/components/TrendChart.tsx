import React from 'react';
import { Line } from '@ant-design/charts';
import type { MonthlyScore } from '../types';

const TrendChart: React.FC<{ scores: MonthlyScore[]; height?: number }> = ({ scores, height = 300 }) => {
  const data = scores
    .sort((a, b) => a.month.localeCompare(b.month))
    .flatMap((s) => [
      { month: s.month, type: '总分', value: s.totalScore },
      { month: s.month, type: '频率', value: s.dimensions.frequency },
      { month: s.month, type: '深度', value: s.dimensions.depth },
      { month: s.month, type: '产出', value: s.dimensions.output },
      { month: s.month, type: '贡献', value: s.dimensions.contribution },
    ]);

  return (
    <Line
      data={data}
      xField="month"
      yField="value"
      colorField="type"
      style={{ height }}
      point={{ shapeField: 'square', sizeField: 3 }}
      interaction={{ tooltip: { marker: true } }}
    />
  );
};

export default TrendChart;
