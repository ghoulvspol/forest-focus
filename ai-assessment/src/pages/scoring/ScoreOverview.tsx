import React, { useState } from 'react';
import { Card, Row, Col, Select, Table, Typography } from 'antd';
import { Column } from '@ant-design/charts';
import { useStore } from '../../store/useStore';
import ScoreBadge from '../../components/ScoreBadge';
import { useNavigate } from 'react-router-dom';
import type { Grade } from '../../types';

const { Title } = Typography;

const ScoreOverview: React.FC = () => {
  const { members, monthlyScores } = useStore();
  const [month, setMonth] = useState('2026-03');
  const navigate = useNavigate();
  const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

  const currentScores = monthlyScores.filter((s) => s.month === month);

  const gradeDistribution: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  currentScores.forEach((s) => { gradeDistribution[s.grade]++; });

  const barData = (['S', 'A', 'B', 'C', 'D'] as Grade[]).map((g) => ({
    grade: g,
    count: gradeDistribution[g],
  }));

  const columns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 70 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore', sorter: (a: any, b: any) => a.totalScore - b.totalScore },
    { title: '等级', dataIndex: 'grade', key: 'grade', render: (g: Grade) => <ScoreBadge grade={g} />,
      filters: (['S', 'A', 'B', 'C', 'D'] as Grade[]).map((g) => ({ text: g, value: g })),
      onFilter: (v: any, r: any) => r.grade === v,
    },
    { title: '频率', dataIndex: 'frequency', key: 'frequency' },
    { title: '深度', dataIndex: 'depth', key: 'depth' },
    { title: '产出', dataIndex: 'output', key: 'output' },
    { title: '贡献', dataIndex: 'contribution', key: 'contribution' },
    {
      title: '操作', key: 'action',
      render: (_: any, r: any) => <a onClick={() => navigate(`/scoring/${r.memberId}`)}>详情</a>,
    },
  ];

  const tableData = currentScores.map((s) => {
    const m = members.find((m) => m.id === s.memberId);
    return {
      key: s.memberId,
      memberId: s.memberId,
      rank: s.rank,
      name: m?.name,
      department: m?.department,
      totalScore: s.totalScore,
      grade: s.grade,
      ...s.dimensions,
    };
  }).sort((a, b) => a.rank - b.rank);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>评分总览</Title>
        <Select value={month} onChange={setMonth} style={{ width: 130 }}
          options={months.map((m) => ({ value: m, label: m }))} />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="等级分布">
            <Column data={barData} xField="grade" yField="count"
              color={({ grade }: any) => ({ S: '#f5222d', A: '#fa8c16', B: '#52c41a', C: '#1890ff', D: '#8c8c8c' }[grade as string] || '#8c8c8c')}
              label={{ text: 'count', position: 'inside' }}
              style={{ height: 250 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="全员评分">
            <Table columns={columns} dataSource={tableData} size="small" pagination={{ pageSize: 10 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ScoreOverview;
