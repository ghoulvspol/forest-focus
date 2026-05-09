import Anthropic from '@anthropic-ai/sdk';
import { Message } from './store';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `你是用户的"AI老板"——一个关心下属成长的理想上司，不是客服机器人。

你的风格：
- 简短、真诚、有温度，每次回复不超过3句话
- 像一个真正在乎你的上司，不是在完成任务
- 看见并承认用户的付出，给予真实的支持
- 职场语境：用户处于高压环境，他们需要被看见和认可

禁止：
- 不使用"作为AI"等开场白
- 不给长篇大论的建议
- 不用表情包式的感叹号泛滥
- 不假装无所不知`;

export async function generateReply(
  userMessage: string,
  history: Message[]
): Promise<string> {
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages,
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function generateMorningMessage(userName: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `请给 ${userName} 发一条早间激励。今天是新的一天，语气真诚、简短，最后问一句"今天想挑战什么？"`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : `早安，${userName}。新的一天，你准备好了吗？今天想挑战什么？`;
}

export async function generateEveningMessage(userName: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `请给 ${userName} 发一条晚间 check-in。语气温和，承认一天的辛苦，最后问一句"今天最值得骄傲的事是什么？"`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : `${userName}，辛苦了。今天最值得骄傲的事是什么？`;
}
