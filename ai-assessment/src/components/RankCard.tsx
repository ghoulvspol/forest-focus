import React from 'react';
import { Card, Typography, Avatar } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

const RankCard: React.FC<{ rank: number; name: string; score: number; avatar?: string }> = ({ rank, name, score, avatar }) => (
  <Card size="small" style={{ textAlign: 'center' }}>
    {rank <= 3 ? (
      <TrophyOutlined style={{ fontSize: 24, color: medalColors[rank - 1] }} />
    ) : (
      <Text type="secondary">#{rank}</Text>
    )}
    <div style={{ margin: '8px 0' }}>
      <Avatar src={avatar} size={40}>{name[0]}</Avatar>
    </div>
    <Title level={5} style={{ margin: 0 }}>{name}</Title>
    <Text type="secondary">{score}分</Text>
  </Card>
);

export default RankCard;
