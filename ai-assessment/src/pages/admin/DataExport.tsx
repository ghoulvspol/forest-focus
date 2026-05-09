import React from 'react';
import { Card, Button, Typography, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';

const { Title, Text } = Typography;

const DataExport: React.FC = () => {
  const { members, monthlyScores, usageRecords, aiTools } = useStore();

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    message.success(`${filename} 已下载`);
  };

  const downloadCSV = (rows: string[][], filename: string) => {
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    message.success(`${filename} 已下载`);
  };

  const exportScoresCSV = () => {
    const header = ['成员ID', '姓名', '月份', '频率', '深度', '产出', '贡献', '总分', '等级', '排名'];
    const rows = monthlyScores.map((s) => {
      const m = members.find((m) => m.id === s.memberId);
      return [s.memberId, m?.name ?? '', s.month, s.dimensions.frequency, s.dimensions.depth, s.dimensions.output, s.dimensions.contribution, s.totalScore, s.grade, s.rank].map(String);
    });
    downloadCSV([header, ...rows], 'scores_export.csv');
  };

  const exportMembersCSV = () => {
    const header = ['ID', '姓名', '部门', '角色', '团队ID', '入职日期'];
    const rows = members.map((m) => [m.id, m.name, m.department, m.role, m.teamId, m.joinDate]);
    downloadCSV([header, ...rows], 'members_export.csv');
  };

  return (
    <div>
      <Title level={4}>数据导出</Title>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card title="评分数据">
          <Text>导出所有月度评分数据（{monthlyScores.length}条记录）</Text>
          <div style={{ marginTop: 12 }}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportScoresCSV}>导出CSV</Button>
              <Button icon={<DownloadOutlined />} onClick={() => downloadJSON(monthlyScores, 'scores_export.json')}>导出JSON</Button>
            </Space>
          </div>
        </Card>
        <Card title="成员数据">
          <Text>导出所有成员数据（{members.length}人）</Text>
          <div style={{ marginTop: 12 }}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportMembersCSV}>导出CSV</Button>
              <Button icon={<DownloadOutlined />} onClick={() => downloadJSON(members, 'members_export.json')}>导出JSON</Button>
            </Space>
          </div>
        </Card>
        <Card title="使用记录">
          <Text>导出所有AI工具使用记录（{usageRecords.length}条记录）</Text>
          <div style={{ marginTop: 12 }}>
            <Button icon={<DownloadOutlined />} onClick={() => downloadJSON(usageRecords, 'usage_records_export.json')}>导出JSON</Button>
          </div>
        </Card>
        <Card title="工具列表">
          <Text>导出AI工具配置（{aiTools.length}个工具）</Text>
          <div style={{ marginTop: 12 }}>
            <Button icon={<DownloadOutlined />} onClick={() => downloadJSON(aiTools, 'tools_export.json')}>导出JSON</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default DataExport;
