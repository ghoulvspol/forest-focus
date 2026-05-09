import React from 'react';
import { Card, Statistic } from 'antd';
import type { StatisticProps } from 'antd';

interface StatCardProps extends StatisticProps {
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon, ...props }) => (
  <Card hoverable>
    <Statistic prefix={icon} {...props} />
  </Card>
);

export default StatCard;
