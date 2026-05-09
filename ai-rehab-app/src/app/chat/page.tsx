'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '您好！我是您的AI康复助手 🤖\n\n我可以帮助您：\n• 解答康复训练相关问题\n• 提供中医穴位按摩指导\n• 分析您的康复数据\n• 推荐个性化的训练建议\n\n有什么我可以帮您的吗？',
    timestamp: new Date().toISOString(),
  },
];

const quickQuestions = [
  '如何缓解训练后的肌肉酸痛？',
  '推荐适合膝关节术后的中医穴位',
  '我的康复进度正常吗？',
  '如何提高训练依从性？',
];

const aiResponses: Record<string, string> = {
  '如何缓解训练后的肌肉酸痛？': `训练后肌肉酸痛是正常现象，以下方法可以帮助缓解：

**即时缓解**
1. 🧊 冷敷：训练后立即冷敷15-20分钟
2. 💧 补充水分：保持充足的水分摄入
3. 🧘 轻度拉伸：进行5-10分钟的放松拉伸

**中医调理**
• 按揉足三里穴：位于膝盖外侧下方四指处
• 按揉委中穴：膝盖后方凹陷处
• 热敷患处：使用艾叶或生姜水热敷

**注意事项**
- 如果疼痛持续超过48小时，请减少训练强度
- 严重疼痛应及时咨询康复医师`,

  '推荐适合膝关节术后的中医穴位': `膝关节术后，以下是推荐的穴位按摩方案：

**核心穴位**
1. 📍 **足三里** - 强健下肢，促进血液循环
   位置：膝盖外侧下方四指宽处
   方法：拇指按揉，每次3-5分钟

2. 📍 **血海穴** - 活血化瘀，消肿止痛
   位置：膝盖内侧上方三指处
   方法：轻柔按揉，每次2-3分钟

3. 📍 **阳陵泉** - 舒筋活络，强健筋骨
   位置：小腿外侧，腓骨小头前下方
   方法：按揉配合屈伸膝关节

**按摩建议**
- 每日2次，早晚各一次
- 力度适中，有酸胀感为宜
- 配合深呼吸，放松身心`,

  '我的康复进度正常吗？': `根据您的最新评估数据，我来分析一下：

**当前状态** ✅
• 综合评分：69分（良好）
• 疼痛等级：3/10（轻度）
• 连续训练：7天
• 本周训练：5次

**进度评估**
您的康复进度处于**正常偏上**水平，表现良好！

**优势项目**
✅ 训练依从性高（70%+）
✅ 疼痛控制良好
✅ 心理状态积极

**改进建议**
📈 建议增加柔韧性训练
💡 可适当加入中医辅助康复

继续保持当前训练节奏，预计4-6周可达到康复目标！`,

  '如何提高训练依从性？': `训练依从性是康复成功的关键！以下是一些实用建议：

**游戏化激励** 🎮
• 设定每日小目标，获得成就奖励
• 参与排行榜，与康复伙伴良性竞争
• 完成连续训练天数挑战

**时间管理** ⏰
• 固定训练时间，形成习惯
• 设置训练提醒
• 将训练融入日常routine

**社交支持** 👥
• 邀请家人监督
• 加入康复社群
• 分享康复进展

**心理调适** 🧠
• 记录每次进步，增强信心
• 设立阶段性奖励
• 保持积极心态

我们的游戏化系统设计正是为了帮助您提高依从性，您可以查看成就页面解锁更多奖励！`,
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[content.trim()] ||
        `感谢您的提问！关于"${content.trim()}"这个问题，我建议您：

1. 咨询您的康复治疗师获取专业建议
2. 参考训练计划中的相关说明
3. 保持规律训练，注意身体反馈

如有更多问题，随时可以问我！`;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI康复助手</h1>
        <p className="text-gray-500 mt-1">智能问答，专业康复指导</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>⚡</span> 快捷提问
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🤖</span> 助手能力
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>✅</span> 康复训练指导
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span> 中医穴位推荐
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span> 数据分析解读
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span> 疼痛管理建议
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span> 营养运动建议
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col min-h-0">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white flex-shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] p-4 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white">
                  🤖
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}>
                发送
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI助手提供的建议仅供参考，具体康复方案请咨询专业医师
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
