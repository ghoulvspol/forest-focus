import React from 'react';
import { Card, Form, Select, DatePicker, Input, InputNumber, Switch, Button, message, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const scenarios = ['代码生成', '代码审查', '文档撰写', '数据分析', 'UI设计', '测试用例生成', '需求分析', '方案设计', '问题排查', '知识学习'];

const DataEntry: React.FC = () => {
  const [form] = Form.useForm();
  const { aiTools, currentUserId, addUsageRecord } = useStore();
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    addUsageRecord({
      id: `r${Date.now()}`,
      memberId: currentUserId,
      toolId: values.toolId,
      date: values.date.format('YYYY-MM-DD'),
      scenario: values.scenario,
      duration: values.duration,
      output: values.output,
      selfRating: values.selfRating,
      shared: values.shared ?? false,
    });
    message.success('使用记录已提交');
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>数据录入</Title>
        <Button icon={<UploadOutlined />} onClick={() => navigate('/data/import')}>批量导入</Button>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
          <Form.Item name="toolId" label="使用工具" rules={[{ required: true, message: '请选择工具' }]}>
            <Select placeholder="选择AI工具"
              options={aiTools.filter((t) => t.enabled).map((t) => ({ value: t.id, label: t.name }))} />
          </Form.Item>
          <Form.Item name="date" label="使用日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="scenario" label="使用场景" rules={[{ required: true, message: '请选择场景' }]}>
            <Select placeholder="选择使用场景"
              options={scenarios.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="duration" label="使用时长(分钟)" rules={[{ required: true, message: '请输入时长' }]}>
            <InputNumber min={1} max={480} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="output" label="产出描述" rules={[{ required: true, message: '请输入产出描述' }]}>
            <TextArea rows={3} placeholder="描述使用AI的产出成果" />
          </Form.Item>
          <Form.Item name="selfRating" label="效果自评 (1-5分)" rules={[{ required: true, message: '请评分' }]}>
            <InputNumber min={1} max={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shared" label="是否已分享经验" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">提交记录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DataEntry;
