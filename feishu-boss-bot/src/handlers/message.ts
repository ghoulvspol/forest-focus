import * as fs from 'fs';
import * as path from 'path';
import { registerUser, getUser, appendHistory } from '../store';
import { replyMessage } from '../feishu';
import { generateReply } from '../ai';

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');

function updateUserName(openId: string, name: string): void {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  if (raw[openId]) {
    raw[openId].name = name;
    fs.writeFileSync(DATA_PATH, JSON.stringify(raw, null, 2));
  }
}

interface FeishuMessageEvent {
  message: {
    message_id: string;
    msg_type: string;
    content: string;
  };
  sender: {
    sender_id: {
      open_id: string;
    };
  };
}

export async function handleMessage(event: FeishuMessageEvent): Promise<void> {
  const openId = event.sender.sender_id.open_id;
  const messageId = event.message.message_id;

  if (event.message.msg_type !== 'text') {
    await replyMessage(messageId, '目前只支持文字消息，请发送文字内容。');
    return;
  }

  let userText: string;
  try {
    const parsed = JSON.parse(event.message.content) as { text: string };
    userText = parsed.text.trim();
  } catch {
    return;
  }

  if (!userText) return;

  const isNewUser = !getUser(openId);

  if (isNewUser) {
    registerUser(openId, openId); // temporary name = openId
    const welcome = `欢迎加入！我是你的AI老板，会在每天早上和晚上给你发消息。\n\n先来认识一下——你叫什么名字？`;
    await replyMessage(messageId, welcome);
    appendHistory(openId, { role: 'user', content: userText, timestamp: new Date().toISOString() });
    appendHistory(openId, { role: 'assistant', content: welcome, timestamp: new Date().toISOString() });
    return;
  }

  const user = getUser(openId)!;

  // Second message: user is telling us their name
  if (user.name === openId && user.history.length <= 2) {
    updateUserName(openId, userText);
    const reply = `很高兴认识你，${userText}！从今天起，我会在每天早上8点给你发早安激励，晚上9点做晚间回顾。有什么想聊的，随时来找我。`;
    await replyMessage(messageId, reply);
    appendHistory(openId, { role: 'user', content: userText, timestamp: new Date().toISOString() });
    appendHistory(openId, { role: 'assistant', content: reply, timestamp: new Date().toISOString() });
    return;
  }

  // Normal conversation
  appendHistory(openId, { role: 'user', content: userText, timestamp: new Date().toISOString() });

  try {
    const freshUser = getUser(openId)!;
    const reply = await generateReply(userText, freshUser.history.slice(0, -1)); // history before current msg
    await replyMessage(messageId, reply);
    appendHistory(openId, { role: 'assistant', content: reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[message] generateReply failed:', err);
    await replyMessage(messageId, '稍等一下，我需要想想……');
  }
}
