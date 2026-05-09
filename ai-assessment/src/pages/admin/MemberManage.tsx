import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Typography, Popconfirm, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';

const { Title } = Typography;

const MemberManage: React.FC = () => {
  const { members, teams, addMember, updateMember, deleteMember } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (id: string) => {
    const m = members.find((m) => m.id === id);
    if (m) { setEditing(id); form.setFieldsValue(m); setModalOpen(true); }
  };

  const onOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        updateMember(editing, values);
        message.success('已更新');
      } else {
        addMember({ ...values, id: `m${Date.now()}`, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${values.name}` });
        message.success('已添加');
      }
      setModalOpen(false);
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '团队', key: 'team', render: (_: any, r: any) => teams.find((t) => t.id === r.teamId)?.name },
    { title: '入职日期', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: '操作', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r.id)} />
          <Popconfirm title="确定删除？" onConfirm={() => { deleteMember(r.id); message.success('已删除'); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>成员管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>添加成员</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={members} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editing ? '编辑成员' : '添加成员'} open={modalOpen} onOk={onOk} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="department" label="部门" rules={[{ required: true }]}>
            <Select options={['技术部', '产品部', '设计部', '测试部', '数据部'].map((d) => ({ value: d, label: d }))} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="teamId" label="团队" rules={[{ required: true }]}>
            <Select options={teams.map((t) => ({ value: t.id, label: t.name }))} />
          </Form.Item>
          <Form.Item name="joinDate" label="入职日期" rules={[{ required: true }]}><Input placeholder="YYYY-MM-DD" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberManage;
