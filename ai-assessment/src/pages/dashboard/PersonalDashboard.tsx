import React from 'react';
import { Row, Col, Card, Typography, Space, Table, Progress } from 'antd';
import { RocketOutlined, FireOutlined, StarOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';
import StatCard from '../../components/StatCard';
import ScoreBadge from '../../components/ScoreBadge';
import ScoreRadar from '../../components/ScoreRadar';
import TrendChart from '../../components/TrendChart';
import { aiTools } from '../../mock/teams';

const { Title, Text } = Typography;

const PersonalDashboard: React.FC = () => {
  const { currentUserId, members, monthlyScores } = useStore();
  const member = members.find((m) => m.id === currentUserId);
  const myScores = monthlyScores.filter((s) => s.memberId === currentUserId).sort((a, b) => b.month.localeCompare(a.month));
  const latest = myScores[0];

  if (!member || !latest) return <div>暂无数据</div>;

  const toolData = Object.entries(latest.toolUsage).map(([toolId, count]) => {
    const tool = aiTools.find((t) => t.id === toolId);
    return { tool: tool?.name ?? toolId, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div>
      <Title level={4}>个人看板 - {member.name}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ScoreBadge grade={latest.grade} size="large" />
              <Title level={2} style={{ margin: '8px 0 0' }}>{latest.totalScore}</Title>
              <Text type="secondary">{latest.month} 综合评分</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <StatCard title="使用频率" value={latest.dimensions.frequency} suffix="/100" icon={<FireOutlined />} />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard title="使用深度" value={latest.dimensions.depth} suffix="/100" icon={<RocketOutlined />} />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard title="工作产出" value={latest.dimensions.output} suffix="/100" icon={<StarOutlined />} />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard title="分享贡献" value={latest.dimensions.contribution} suffix="/100" icon={<ShareAltOutlined />} />
        </Col>
        <Col xs={24} sm={2}>
          <Card style={{ textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>#{latest.rank}</Title>
              <Text type="secondary">团队排名</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="四维评分雷达图">
            <ScoreRadar dimensions={latest.dimensions} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="月度趋势">
            <TrendChart scores={myScores} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="AI工具使用统计">
            <Space direction="vertical" style={{ width: '100%' }}>
              {toolData.map((t) => (
                <div key={t.tool} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text style={{ width: 120 }}>{t.tool}</Text>
                  <Progress percent={Math.min(100, t.count * 3)} format={() => `${t.count}次`} style={{ flex: 1 }} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalDashboard;
