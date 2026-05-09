import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Typography, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';

const { Title } = Typography;

const categories = ['对话', '编码', '设计', '写作', '数据', '其他'];

const ToolManage: React.FC = () => {
  const { aiTools, addAITool, updateAITool, deleteAITool } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ enabled: true }); setModalOpen(true); };
  const openEdit = (id: string) => {
    const t = aiTools.find((t) => t.id === id);
    if (t) { setEditing(id); form.setFieldsValue(t); setModalOpen(true); }
  };

  const onOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        updateAITool(editing, values);
        message.success('已更新');
      } else {
        addAITool({ ...values, id: `tool${Date.now()}` });
        message.success('已添加');
      }
      setModalOpen(false);
    });
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类别', dataIndex: 'category', key: 'category', render: (c: string) => <Tag>{c}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r.id)} />
          <Popconfirm title="确定删除？" onConfirm={() => { deleteAITool(r.id); message.success('已删除'); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>AI工具管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>添加工具</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={aiTools} rowKey="id" size="small" />
      </Card>

      <Modal title={editing ? '编辑工具' : '添加工具'} open={modalOpen} onOk={onOk} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="工具名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select options={categories.map((c) => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="description" label="描述"><Input /></Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ToolManage;
