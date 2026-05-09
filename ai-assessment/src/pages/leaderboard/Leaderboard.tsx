import React, { useState } from 'react';
import { Card, Table, Select, Typography, Row, Col, Tabs, Tag } from 'antd';
import { useStore } from '../../store/useStore';
import ScoreBadge from '../../components/ScoreBadge';
import RankCard from '../../components/RankCard';
import type { Grade } from '../../types';

const { Title } = Typography;

const Leaderboard: React.FC = () => {
  const { members, monthlyScores } = useStore();
  const [month, setMonth] = useState('2026-03');
  const [dimension, setDimension] = useState<'total' | 'frequency' | 'depth' | 'output' | 'contribution'>('total');
  const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

  const currentScores = monthlyScores.filter((s) => s.month === month);
  const prevMonth = months[months.indexOf(month) - 1];
  const prevScores = prevMonth ? monthlyScores.filter((s) => s.month === prevMonth) : [];

  const getSortValue = (s: typeof currentScores[0]) => {
    if (dimension === 'total') return s.totalScore;
    return s.dimensions[dimension];
  };

  const sorted = [...currentScores].sort((a, b) => getSortValue(b) - getSortValue(a));
  const top3 = sorted.slice(0, 3);

  // progress ranking
  const progressData = currentScores.map((s) => {
    const prev = prevScores.find((p) => p.memberId === s.memberId);
    return {
      ...s,
      progress: prev ? s.totalScore - prev.totalScore : 0,
    };
  }).sort((a, b) => b.progress - a.progress);

  const columns = [
    { title: '排名', key: 'rank', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: '姓名', key: 'name', render: (_: any, r: any) => members.find((m) => m.id === r.memberId)?.name },
    { title: '部门', key: 'dept', render: (_: any, r: any) => members.find((m) => m.id === r.memberId)?.department },
    { title: '得分', key: 'score', render: (_: any, r: any) => getSortValue(r) },
    { title: '等级', dataIndex: 'grade', key: 'grade', render: (g: Grade) => <ScoreBadge grade={g} /> },
  ];

  const progressColumns = [
    { title: '排名', key: 'rank', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: '姓名', key: 'name', render: (_: any, r: any) => members.find((m) => m.id === r.memberId)?.name },
    { title: '当月分', key: 'score', render: (_: any, r: any) => r.totalScore },
    {
      title: '进步', key: 'progress', render: (_: any, r: any) => (
        <Tag color={r.progress > 0 ? 'green' : r.progress < 0 ? 'red' : 'default'}>
          {r.progress > 0 ? '+' : ''}{r.progress.toFixed(1)}
        </Tag>
      ),
    },
  ];

  const dimOptions = [
    { value: 'total', label: '总分' },
    { value: 'frequency', label: '使用频率' },
    { value: 'depth', label: '使用深度' },
    { value: 'output', label: '工作产出' },
    { value: 'contribution', label: '分享贡献' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>排行榜</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Select value={dimension} onChange={setDimension} style={{ width: 130 }} options={dimOptions} />
          <Select value={month} onChange={setMonth} style={{ width: 130 }}
            options={months.map((m) => ({ value: m, label: m }))} />
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {top3.map((s, i) => {
          const m = members.find((m) => m.id === s.memberId);
          return (
            <Col xs={8} key={s.memberId}>
              <RankCard rank={i + 1} name={m?.name ?? ''} score={getSortValue(s)} avatar={m?.avatar} />
            </Col>
          );
        })}
      </Row>

      <Tabs items={[
        {
          key: 'rank',
          label: '排行榜',
          children: <Card><Table columns={columns} dataSource={sorted} rowKey="memberId" size="small" pagination={{ pageSize: 15 }} /></Card>,
        },
        {
          key: 'progress',
          label: '进步最快',
          children: <Card><Table columns={progressColumns} dataSource={progressData} rowKey="memberId" size="small" pagination={{ pageSize: 15 }} /></Card>,
        },
      ]} />
    </div>
  );
};

export default Leaderboard;
