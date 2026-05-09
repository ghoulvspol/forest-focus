import 'dotenv/config';
import express, { Request, Response } from 'express';
import { verifyChallenge } from './feishu';
import { handleMessage } from './handlers/message';
import { startScheduler } from './scheduler';

const app = express();
app.use(express.json());

// Feishu webhook endpoint
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  // 1. URL verification challenge
  const challenge = verifyChallenge(body as { challenge?: string });
  if (challenge) {
    res.json({ challenge });
    return;
  }

  // 2. Event dispatch
  const header = body.header as { event_type?: string } | undefined;
  const eventType = header?.event_type;

  if (eventType === 'im.message.receive_v1') {
    const event = body.event as Parameters<typeof handleMessage>[0];
    // Respond 200 immediately to avoid timeout
    res.status(200).json({ code: 0 });
    handleMessage(event).catch((err) => {
      console.error('[webhook] handleMessage error:', err);
    });
    return;
  }

  res.status(200).json({ code: 0 });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Manual trigger endpoints for testing
app.post('/debug/morning', async (_req: Request, res: Response) => {
  const { sendMorningMessages } = await import('./scheduler');
  sendMorningMessages().catch(console.error);
  res.json({ triggered: 'morning' });
});

app.post('/debug/evening', async (_req: Request, res: Response) => {
  const { sendEveningMessages } = await import('./scheduler');
  sendEveningMessages().catch(console.error);
  res.json({ triggered: 'evening' });
});

const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  startScheduler();
});
