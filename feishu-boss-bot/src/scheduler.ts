import cron from 'node-cron';
import { getUsers } from './store';
import { sendMessage } from './feishu';
import { generateMorningMessage, generateEveningMessage } from './ai';

async function sendMorningMessages(): Promise<void> {
  const users = getUsers();
  console.log(`[scheduler] morning: sending to ${users.length} users`);
  for (const user of users) {
    try {
      const text = await generateMorningMessage(user.name);
      await sendMessage(user.openId, text);
      console.log(`[scheduler] morning sent to ${user.name}`);
    } catch (err) {
      console.error(`[scheduler] morning failed for ${user.openId}:`, err);
    }
  }
}

async function sendEveningMessages(): Promise<void> {
  const users = getUsers();
  console.log(`[scheduler] evening: sending to ${users.length} users`);
  for (const user of users) {
    try {
      const text = await generateEveningMessage(user.name);
      await sendMessage(user.openId, text);
      console.log(`[scheduler] evening sent to ${user.name}`);
    } catch (err) {
      console.error(`[scheduler] evening failed for ${user.openId}:`, err);
    }
  }
}

export function startScheduler(): void {
  const morningCron = process.env.MORNING_CRON ?? '0 8 * * *';
  const eveningCron = process.env.EVENING_CRON ?? '0 21 * * *';

  cron.schedule(morningCron, () => {
    sendMorningMessages().catch(console.error);
  });

  cron.schedule(eveningCron, () => {
    sendEveningMessages().catch(console.error);
  });

  console.log(`[scheduler] morning cron: ${morningCron}`);
  console.log(`[scheduler] evening cron: ${eveningCron}`);
}

// Export for manual testing
export { sendMorningMessages, sendEveningMessages };
