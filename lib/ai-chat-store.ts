export type AiMsg = { id: string; fromMe: boolean; text: string; ts: string };

const KEY = 'prokadry_ai_chat';
const EVENT = 'prokadry_ai_chat';

export const GREETING: AiMsg = {
  id: 'ai-0',
  fromMe: false,
  text: 'Здравствуйте! Я ИИ-ассистент ПРОкадры. Помогу найти специалистов по 44-ФЗ / 223-ФЗ или отвечу на вопросы о платформе.',
  ts: '2020-01-01T00:00:00.000Z',
};

export function loadAiMsgs(): AiMsg[] {
  if (typeof window === 'undefined') return [GREETING];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [GREETING];
    const parsed = JSON.parse(raw) as AiMsg[];
    return parsed.length > 0 ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

export function saveAiMsgs(msgs: AiMsg[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(msgs));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeAiMsgs(fn: () => void): () => void {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
