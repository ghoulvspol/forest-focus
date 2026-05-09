import React from 'react';
import { Radar } from '@ant-design/charts';
import type { DimensionScore } from '../types';
import { DIMENSION_LABELS } from '../utils/scoring';

const ScoreRadar: React.FC<{ dimensions: DimensionScore; height?: number }> = ({ dimensions, height = 300 }) => {
  const data = (Object.keys(dimensions) as (keyof DimensionScore)[]).map((key) => ({
    dimension: DIMENSION_LABELS[key],
    score: dimensions[key],
  }));

  return (
    <Radar
      data={data}
      xField="dimension"
      yField="score"
      area={{ style: { fillOpacity: 0.3 } }}
      scale={{ y: { domainMax: 100 } }}
      style={{ height }}
    />
  );
};

export default ScoreRadar;
