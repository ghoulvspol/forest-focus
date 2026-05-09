import React from 'react';
import { Tag } from 'antd';
import type { Grade } from '../types';
import { GRADE_COLORS } from '../utils/scoring';

const ScoreBadge: React.FC<{ grade: Grade; size?: 'small' | 'large' }> = ({ grade, size = 'small' }) => (
  <Tag
    color={GRADE_COLORS[grade]}
    style={{
      fontSize: size === 'large' ? 24 : 14,
      padding: size === 'large' ? '4px 16px' : '0 8px',
      fontWeight: 700,
      borderRadius: size === 'large' ? 8 : 4,
    }}
  >
    {grade}
  </Tag>
);

export default ScoreBadge;
