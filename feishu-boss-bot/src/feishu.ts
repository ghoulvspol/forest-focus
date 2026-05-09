import * as lark from '@larksuiteoapi/node-sdk';
import * as crypto from 'crypto';

const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
  loggerLevel: lark.LoggerLevel.error,
});

export async function sendMessage(openId: string, text: string): Promise<void> {
  await client.im.message.create({
    params: { receive_id_type: 'open_id' },
    data: {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text }),
    },
  });
}

export async function replyMessage(messageId: string, text: string): Promise<void> {
  await client.im.message.reply({
    path: { message_id: messageId },
    data: {
      msg_type: 'text',
      content: JSON.stringify({ text }),
    },
  });
}

export function verifyChallenge(body: { challenge?: string }): string | null {
  return body.challenge ?? null;
}

/**
 * Verify that the request came from Feishu using the verify token.
 * Feishu sends X-Lark-Signature header: HMAC-SHA256(token + timestamp + nonce + body)
 */
export function verifySignature(
  token: string,
  timestamp: string,
  nonce: string,
  body: string,
  signature: string
): boolean {
  const content = token + timestamp + nonce + body;
  const computed = crypto.createHash('sha256').update(content).digest('hex');
  return computed === signature;
}
