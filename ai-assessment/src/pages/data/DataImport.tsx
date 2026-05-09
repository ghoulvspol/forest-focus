import React, { useState } from 'react';
import { Card, Upload, Button, Table, Typography, message, Alert, Space } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DataImport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) { message.error('文件格式不正确'); return; }
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map((line, i) => {
        const vals = line.split(',');
        const row: any = { key: i };
        headers.forEach((h, j) => { row[h.trim()] = vals[j]?.trim(); });
        return row;
      });
      setData(rows);
      message.success(`解析成功，共${rows.length}条记录`);
    };
    reader.readAsText(file);
    return false;
  };

  const columns = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== 'key').map((k) => ({ title: k, dataIndex: k, key: k }))
    : [];

  const downloadTemplate = () => {
    const csv = '工具名称,使用日期,使用场景,时长(分钟),产出描述,自评分\nChatGPT,2026-03-01,代码生成,30,完成API接口开发,4';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'import_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Title level={4}>
        <a onClick={() => navigate('/data')}>数据录入</a> / 批量导入
      </Title>

      <Card>
        <Alert message="请上传CSV格式文件，首行为表头。" type="info" showIcon style={{ marginBottom: 16 }} />
        <Space>
          <Upload beforeUpload={handleFile} accept=".csv" showUploadList={false}>
            <Button icon={<UploadOutlined />} type="primary">选择CSV文件</Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>下载模板</Button>
        </Space>

        {data.length > 0 && (
          <>
            <Table columns={columns} dataSource={data} size="small" style={{ marginTop: 16 }} pagination={{ pageSize: 10 }} />
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => {
              message.success(`已导入${data.length}条记录`);
              setData([]);
            }}>确认导入</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default DataImport;
