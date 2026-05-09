import React from 'react';
import { Cell } from '@ant-design/charts';

interface HeatMapProps {
  data: Array<{ member: string; week: string; value: number }>;
  height?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({ data, height = 300 }) => (
  <Cell
    data={data}
    xField="week"
    yField="member"
    colorField="value"
    style={{ inset: 1, height }}
    scale={{ color: { range: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] } }}
    interaction={{ tooltip: { marker: true } }}
  />
);

export default HeatMap;
