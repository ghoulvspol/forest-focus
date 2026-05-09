import React, { useState } from 'react';
import { Row, Col, Card, Table, Typography, Select, Tag } from 'antd';
import { Pie } from '@ant-design/charts';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/StatCard';
import ScoreBadge from '../../components/ScoreBadge';
import HeatMap from '../../components/HeatMap';
import { TeamOutlined, PercentageOutlined, FireOutlined } from '@ant-design/icons';
import { aiTools } from '../../mock/teams';

const { Title } = Typography;

const TeamDashboard: React.FC = () => {
  const { teams, members, monthlyScores } = useStore();
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');

  const team = teams.find((t) => t.id === selectedTeam);
  const teamMembers = members.filter((m) => m.teamId === selectedTeam);
  const teamScores = monthlyScores.filter(
    (s) => s.month === selectedMonth && teamMembers.some((m) => m.id === s.memberId)
  );

  const avgScore = teamScores.length ? Math.round(teamScores.reduce((s, c) => s + c.totalScore, 0) / teamScores.length * 10) / 10 : 0;
  const activeRate = teamScores.length ? Math.round(teamScores.filter((s) => s.totalScore >= 40).length / teamScores.length * 100) : 0;

  // tool distribution
  const toolCount: Record<string, number> = {};
  teamScores.forEach((s) => {
    Object.entries(s.toolUsage).forEach(([tid, cnt]) => {
      toolCount[tid] = (toolCount[tid] || 0) + cnt;
    });
  });
  const pieData = Object.entries(toolCount).map(([tid, count]) => ({
    tool: aiTools.find((t) => t.id === tid)?.name ?? tid,
    count,
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  // heatmap data
  const weeks = ['第1周', '第2周', '第3周', '第4周'];
  const heatData = teamMembers.slice(0, 10).flatMap((m) =>
    weeks.map((w, wi) => ({
      member: m.name,
      week: w,
      value: Math.floor(Math.random() * 20) + 1,
    }))
  );

  const columns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 70, sorter: (a: any, b: any) => a.rank - b.rank },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore', sorter: (a: any, b: any) => a.totalScore - b.totalScore },
    { title: '等级', dataIndex: 'grade', key: 'grade', render: (g: any) => <ScoreBadge grade={g} /> },
    { title: '频率', dataIndex: 'frequency', key: 'frequency', sorter: (a: any, b: any) => a.frequency - b.frequency },
    { title: '深度', dataIndex: 'depth', key: 'depth', sorter: (a: any, b: any) => a.depth - b.depth },
    { title: '产出', dataIndex: 'output', key: 'output', sorter: (a: any, b: any) => a.output - b.output },
    { title: '贡献', dataIndex: 'contribution', key: 'contribution', sorter: (a: any, b: any) => a.contribution - b.contribution },
  ];

  const tableData = teamScores.map((s) => {
    const m = members.find((m) => m.id === s.memberId);
    return {
      key: s.memberId,
      rank: s.rank,
      name: m?.name,
      role: m?.role,
      totalScore: s.totalScore,
      grade: s.grade,
      ...s.dimensions,
    };
  }).sort((a, b) => a.rank - b.rank);

  const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>团队看板 - {team?.name}</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Select value={selectedTeam} onChange={setSelectedTeam} style={{ width: 150 }}
            options={teams.map((t) => ({ value: t.id, label: t.name }))} />
          <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 130 }}
            options={months.map((m) => ({ value: m, label: m }))} />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={8}><StatCard title="团队人数" value={teamMembers.length} icon={<TeamOutlined />} suffix="人" /></Col>
        <Col xs={8}><StatCard title="平均分" value={avgScore} icon={<FireOutlined />} /></Col>
        <Col xs={8}><StatCard title="活跃率" value={activeRate} icon={<PercentageOutlined />} suffix="%" /></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card title="成员评分">
            <Table columns={columns} dataSource={tableData} size="small" pagination={false} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="工具使用分布">
            <Pie data={pieData} angleField="count" colorField="tool" innerRadius={0.5}
              label={{ text: 'tool', style: { fontSize: 11 } }} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="活跃度热力图" style={{ marginTop: 16 }}>
        <HeatMap data={heatData} height={250} />
      </Card>
    </div>
  );
};

export default TeamDashboard;
