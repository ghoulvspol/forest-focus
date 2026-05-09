import React, { useState } from 'react';
import { Layout, Menu, Avatar, Select, Badge, theme } from 'antd';
import {
  DashboardOutlined, TeamOutlined, BarChartOutlined, FormOutlined,
  TrophyOutlined, BellOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '个人看板' },
  { key: '/team', icon: <TeamOutlined />, label: '团队看板' },
  { key: '/scoring', icon: <BarChartOutlined />, label: '评分总览' },
  { key: '/data', icon: <FormOutlined />, label: '数据录入' },
  { key: '/leaderboard', icon: <TrophyOutlined />, label: '排行榜' },
  { key: '/notifications', icon: <BellOutlined />, label: '通知中心' },
  {
    key: '/admin', icon: <SettingOutlined />, label: '管理后台',
    children: [
      { key: '/admin/members', label: '成员管理' },
      { key: '/admin/tools', label: '工具管理' },
      { key: '/admin/rules', label: '规则配置' },
      { key: '/admin/export', label: '数据导出' },
    ],
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { currentUserId, setCurrentUser, members, notifications } = useStore();
  const unreadCount = notifications.filter((n) => n.memberId === currentUserId && !n.read).length;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}>
        <div style={{ height: 48, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: collapsed ? 14 : 16, color: token.colorPrimary }}>
          {collapsed ? 'AI' : 'AI考核系统'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/admin']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: token.colorBgContainer, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>团队AI使用考核系统</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={unreadCount} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/notifications')} />
            </Badge>
            <Select
              value={currentUserId}
              onChange={setCurrentUser}
              style={{ width: 140 }}
              options={members.slice(0, 20).map((m) => ({ value: m.id, label: m.name }))}
              suffixIcon={<Avatar size="small" icon={<UserOutlined />} />}
            />
          </div>
        </Header>
        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
