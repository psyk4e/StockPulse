import { FINNHUB } from '@/utils/constant.utils';

export type TradePayload = {
  s: string; // symbol
  p: number; // price
  t: number; // timestamp (ms)
  v: number; // volume
};

export type FinnhubMessage = { type: string; data?: TradePayload[] };

type PriceCallback = (symbol: string, price: number) => void;

let ws: WebSocket | null = null;
const subscribed = new Set<string>();
const listeners = new Set<PriceCallback>();
let reconnectAttempts = 0;
const MAX_RECONNECT = 3;

// Same URI as Postman: wss://ws.finnhub.io?token=...
const WS_BASE = 'wss://ws.finnhub.io';

function getWsUrl(): string {
  const token = FINNHUB.TOKEN ?? '';
  return `${WS_BASE}?token=${token}`;
}

function emit(symbol: string, price: number): void {
  listeners.forEach((cb) => {
    try {
      cb(symbol, price);
    } catch (e) {
      // ignore
    }
  });
}

function handleMessage(event: { data?: string }): void {
  try {
    const msg = JSON.parse(event.data ?? '{}') as FinnhubMessage;
    if (msg.type === 'ping') return;
    if (msg.type === 'trade' && Array.isArray(msg.data) && msg.data.length > 0) {
      const last = msg.data[msg.data.length - 1];
      emit(last.s, last.p);
    }
  } catch {
    // ignore parse errors
  }
}

function connect(): WebSocket | null {
  if (!FINNHUB.TOKEN) return null;
  const url = getWsUrl();
  if (!/^wss?:\/\//i.test(url)) return null;
  const socket = new WebSocket(url);
  socket.onopen = () => {
    reconnectAttempts = 0;
    subscribed.forEach((symbol) => {
      socket.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  };
  socket.onmessage = handleMessage;
  socket.onclose = () => {
    ws = null;
    if (reconnectAttempts < MAX_RECONNECT && subscribed.size > 0) {
      reconnectAttempts += 1;
      setTimeout(() => connect(), 2000);
    }
  };
  socket.onerror = () => { };
  ws = socket;
  return socket;
}

export function subscribe(symbol: string): void {
  const s = symbol.toUpperCase();
  if (subscribed.has(s)) return;
  subscribed.add(s);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'subscribe', symbol: s }));
  } else if (subscribed.size === 1) {
    connect();
  }
}

export function unsubscribe(symbol: string): void {
  const s = symbol.toUpperCase();
  if (!subscribed.has(s)) return;
  subscribed.delete(s);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'unsubscribe', symbol: s }));
  }
  if (subscribed.size === 0) {
    ws?.close();
    ws = null;
  }
}

export function onPriceUpdate(callback: PriceCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSubscribedSymbols(): string[] {
  return Array.from(subscribed);
}
