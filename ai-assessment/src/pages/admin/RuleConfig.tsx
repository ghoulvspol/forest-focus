import React from 'react';
import { Card, Form, InputNumber, Typography, Button, Divider, message, Row, Col } from 'antd';
import { useStore } from '../../store/useStore';
import type { Grade } from '../../types';

const { Title, Text } = Typography;

const RuleConfig: React.FC = () => {
  const { scoringRule, updateScoringRule } = useStore();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const weights = {
      frequency: values.w_frequency / 100,
      depth: values.w_depth / 100,
      output: values.w_output / 100,
      contribution: values.w_contribution / 100,
    };
    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    if (Math.abs(total - 1) > 0.01) {
      message.error('权重之和必须为100%');
      return;
    }
    updateScoringRule({
      weights,
      gradeThresholds: {
        S: values.th_S,
        A: values.th_A,
        B: values.th_B,
        C: values.th_C,
        D: values.th_D,
      },
    });
    message.success('规则已更新');
  };

  return (
    <div>
      <Title level={4}>考核规则配置</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            w_frequency: scoringRule.weights.frequency * 100,
            w_depth: scoringRule.weights.depth * 100,
            w_output: scoringRule.weights.output * 100,
            w_contribution: scoringRule.weights.contribution * 100,
            th_S: scoringRule.gradeThresholds.S,
            th_A: scoringRule.gradeThresholds.A,
            th_B: scoringRule.gradeThresholds.B,
            th_C: scoringRule.gradeThresholds.C,
            th_D: scoringRule.gradeThresholds.D,
          }}
          style={{ maxWidth: 600 }}
        >
          <Title level={5}>维度权重 (总和=100%)</Title>
          <Row gutter={16}>
            <Col span={6}><Form.Item name="w_frequency" label="频率"><InputNumber min={0} max={100} suffix="%" /></Form.Item></Col>
            <Col span={6}><Form.Item name="w_depth" label="深度"><InputNumber min={0} max={100} suffix="%" /></Form.Item></Col>
            <Col span={6}><Form.Item name="w_output" label="产出"><InputNumber min={0} max={100} suffix="%" /></Form.Item></Col>
            <Col span={6}><Form.Item name="w_contribution" label="贡献"><InputNumber min={0} max={100} suffix="%" /></Form.Item></Col>
          </Row>

          <Divider />
          <Title level={5}>等级阈值 (分数线)</Title>
          <Row gutter={16}>
            {(['S', 'A', 'B', 'C', 'D'] as Grade[]).map((g) => (
              <Col span={4} key={g}>
                <Form.Item name={`th_${g}`} label={`${g}级`}>
                  <InputNumber min={0} max={100} />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit">保存配置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RuleConfig;
