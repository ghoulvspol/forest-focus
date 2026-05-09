import React from 'react';
import { Card, List, Tag, Button, Typography, Badge, Space } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useStore } from '../../store/useStore';

const { Title, Text } = Typography;

const typeColors: Record<string, string> = {
  score_result: 'blue',
  reminder: 'orange',
  achievement: 'gold',
  system: 'default',
};

const typeLabels: Record<string, string> = {
  score_result: '评分结果',
  reminder: '提醒',
  achievement: '表彰',
  system: '系统',
};

const NotificationCenter: React.FC = () => {
  const { currentUserId, notifications, markNotificationRead, markAllRead } = useStore();
  const myNotifs = notifications.filter((n) => n.memberId === currentUserId).sort((a, b) => b.date.localeCompare(a.date));
  const unread = myNotifs.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>通知中心 <Badge count={unread} /></Title>
        <Button icon={<CheckOutlined />} onClick={markAllRead}>全部已读</Button>
      </div>

      <Card>
        <List
          dataSource={myNotifs}
          renderItem={(item) => (
            <List.Item
              style={{ background: item.read ? 'transparent' : '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 8 }}
              actions={[
                !item.read && <Button size="small" type="link" onClick={() => markNotificationRead(item.id)}>标为已读</Button>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<BellOutlined style={{ fontSize: 20 }} />}
                title={
                  <Space>
                    <Tag color={typeColors[item.type]}>{typeLabels[item.type]}</Tag>
                    <Text strong={!item.read}>{item.title}</Text>
                  </Space>
                }
                description={
                  <div>
                    <div>{item.content}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.date}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationCenter;
