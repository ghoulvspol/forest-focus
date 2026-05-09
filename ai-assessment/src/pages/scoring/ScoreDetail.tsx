import React from 'react';
import { Card, Row, Col, Typography, Descriptions, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import ScoreBadge from '../../components/ScoreBadge';
import ScoreRadar from '../../components/ScoreRadar';
import TrendChart from '../../components/TrendChart';
import { DIMENSION_LABELS } from '../../utils/scoring';
import type { DimensionScore } from '../../types';

const { Title, Text } = Typography;

const ScoreDetail: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { members, monthlyScores } = useStore();

  const member = members.find((m) => m.id === memberId);
  const scores = monthlyScores.filter((s) => s.memberId === memberId).sort((a, b) => b.month.localeCompare(a.month));
  const latest = scores[0];
  const previous = scores[1];

  if (!member || !latest) return <div>未找到数据</div>;

  const dimensionRows = (Object.keys(latest.dimensions) as (keyof DimensionScore)[]).map((key) => {
    const curr = latest.dimensions[key];
    const prev = previous?.dimensions[key] ?? curr;
    const diff = curr - prev;
    return {
      key,
      dimension: DIMENSION_LABELS[key],
      score: curr,
      prevScore: prev,
      diff,
    };
  });

  return (
    <div>
      <Title level={4}>
        <a onClick={() => navigate('/scoring')}>评分总览</a> / {member.name} 评分详情
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="姓名">{member.name}</Descriptions.Item>
              <Descriptions.Item label="部门">{member.department}</Descriptions.Item>
              <Descriptions.Item label="角色">{member.role}</Descriptions.Item>
              <Descriptions.Item label="当月评分">
                <Text strong style={{ fontSize: 20 }}>{latest.totalScore}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="评级"><ScoreBadge grade={latest.grade} size="large" /></Descriptions.Item>
              <Descriptions.Item label="排名">#{latest.rank}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="各维度得分明细">
            <Table dataSource={dimensionRows} pagination={false} size="small" columns={[
              { title: '维度', dataIndex: 'dimension', key: 'dimension' },
              { title: '当月得分', dataIndex: 'score', key: 'score' },
              { title: '上月得分', dataIndex: 'prevScore', key: 'prevScore' },
              {
                title: '变化', dataIndex: 'diff', key: 'diff',
                render: (d: number) => (
                  <span style={{ color: d > 0 ? '#52c41a' : d < 0 ? '#f5222d' : '#8c8c8c' }}>
                    {d > 0 ? <ArrowUpOutlined /> : d < 0 ? <ArrowDownOutlined /> : <MinusOutlined />}
                    {' '}{Math.abs(d)}
                  </span>
                ),
              },
            ]} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="四维雷达图">
            <ScoreRadar dimensions={latest.dimensions} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="历史趋势">
            <TrendChart scores={scores} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ScoreDetail;
