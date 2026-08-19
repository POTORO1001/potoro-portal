const fs = require('node:fs/promises');
const path = require('node:path');

const API_URL = 'https://script.google.com/macros/s/AKfycbyB63yP698G7XS3S0uclGM9jxdjr93xToi9KpTFZM4NSysNf2Y_H3RufKT5Nsz0X6IW/exec?mode=today';
const OUT_FILE = path.join(process.cwd(), 'data', 'today.json');

function tokyoDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('ja-JP-u-ca-gregory', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

async function fetchJson(url, timeoutMs = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${url}&ts=${Date.now()}`, {
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`API did not return JSON: ${text.slice(0, 80)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const data = await fetchJson(API_URL);
  if (!data || data.ok !== true || !Array.isArray(data.days) || !data.days[0]) {
    throw new Error('Invalid today schedule response');
  }

  const today = tokyoDateKey();
  const payload = {
    ok: true,
    source: 'github-actions',
    updatedAt: new Date().toISOString(),
    today,
    day: data.days[0]
  };

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

  let previous = '';
  let previousPayload = null;
  try {
    previous = await fs.readFile(OUT_FILE, 'utf8');
    previousPayload = JSON.parse(previous);
  } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
  }

  const next = `${JSON.stringify(payload, null, 2)}\n`;
  if (
    previousPayload &&
    previousPayload.today === payload.today &&
    JSON.stringify(previousPayload.day) === JSON.stringify(payload.day)
  ) {
    console.log('today cache unchanged');
    return;
  }

  await fs.writeFile(OUT_FILE, next, 'utf8');
  console.log(`updated ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
