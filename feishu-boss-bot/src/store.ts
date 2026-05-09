import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'data', 'users.json');

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserRecord {
  openId: string;
  name: string;
  registeredAt: string;
  history: Message[];
}

type Store = Record<string, UserRecord>;

function readStore(): Store {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function registerUser(openId: string, name: string): UserRecord {
  const store = readStore();
  if (!store[openId]) {
    store[openId] = {
      openId,
      name,
      registeredAt: new Date().toISOString(),
      history: [],
    };
    writeStore(store);
  }
  return store[openId];
}

export function getUser(openId: string): UserRecord | undefined {
  return readStore()[openId];
}

export function getUsers(): UserRecord[] {
  return Object.values(readStore());
}

export function appendHistory(openId: string, message: Message): void {
  const store = readStore();
  if (!store[openId]) return;
  // Keep last 20 messages to avoid unbounded growth
  store[openId].history.push(message);
  if (store[openId].history.length > 20) {
    store[openId].history = store[openId].history.slice(-20);
  }
  writeStore(store);
}
