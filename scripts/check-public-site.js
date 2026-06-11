const baseUrl = process.env.PUBLIC_SITE_URL || 'https://potoro1001.github.io/potoro-portal/';
const timeoutMs = Number(process.env.PUBLIC_SITE_TIMEOUT_MS || 15000);

const pages = [
  { path: '', title: 'PO・TORO', text: ['PO・TORO', '料金', 'メイドさん募集'] },
  { path: 'news.html', title: 'お知らせ', text: ['お知らせ', '最新情報'] },
  { path: 'events.html', title: 'イベント', text: ['イベント', '開催'] },
  { path: 'goods.html', title: 'グッズ', text: ['グッズ', '配布'] },
  { path: 'games.html', title: 'ゲーム・診断', text: ['ゲーム', '診断'] },
  { path: 'schedule.html', title: '週間お給仕表', text: ['週間お給仕表'] },
  { path: 'price.html', title: '料金', text: ['料金', '飲み放題'] },
  { path: 'uniforms.html', title: '歴代メイド服', text: ['歴代メイド服', '七代目'] },
  { path: 'recruit/', title: 'メイドさん募集', text: ['メイドさん募集', '応募'] }
];

const issues = [];
const fetchedAssets = new Set();

function addIssue(target, message) {
  issues.push(`${target}: ${message}`);
}

function toUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function hasEncodingDamage(value) {
  return /\?{3,}|\uFFFD/.test(value);
}

function isSameSiteAsset(url) {
  const parsed = new URL(url);
  const base = new URL(baseUrl);
  return parsed.origin === base.origin && parsed.pathname.startsWith(base.pathname);
}

function collectCriticalAssets(html, pageUrl) {
  const assets = [];

  for (const match of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)) {
    assets.push(new URL(match[1], pageUrl).toString());
  }

  for (const match of html.matchAll(/<script\b[^>]*src="([^"]+)"/gi)) {
    assets.push(new URL(match[1], pageUrl).toString());
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = attr(tag, 'src');
    if (src && /(?:ogp|hero|uniform|recruit|moeselect|diagnosis|quest)/i.test(src)) {
      assets.push(new URL(src, pageUrl).toString());
    }
  }

  return assets.filter(isSameSiteAsset);
}

async function validateAsset(url) {
  if (fetchedAssets.has(url)) return;
  fetchedAssets.add(url);

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) addIssue(url, `asset returned HTTP ${response.status}`);
  } catch (err) {
    addIssue(url, `asset fetch failed: ${err.message}`);
  }
}

async function validatePage(page) {
  const url = toUrl(page.path);

  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    addIssue(url, `page fetch failed: ${err.message}`);
    return;
  }

  if (response.status !== 200) {
    addIssue(url, `expected HTTP 200, got ${response.status}`);
    return;
  }

  const html = await response.text();
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  const description = attr(html.match(/<meta\s+name="description"[^>]*>/i)?.[0] || '', 'content');

  if (!title.trim()) addIssue(url, 'missing title');
  if (!title.includes(page.title)) addIssue(url, `title does not include "${page.title}"`);
  if (!description.trim()) addIssue(url, 'missing description');
  if (hasEncodingDamage(title) || hasEncodingDamage(description)) {
    addIssue(url, 'title or description appears to be encoding-damaged');
  }

  for (const text of page.text) {
    if (!html.includes(text)) addIssue(url, `missing expected text "${text}"`);
  }

  if (!/<link\s+rel="stylesheet"/i.test(html)) addIssue(url, 'missing stylesheet link');
  if (!/<script\b[^>]*src=/i.test(html)) addIssue(url, 'missing script reference');

  const assets = collectCriticalAssets(html, url);
  for (const asset of assets) await validateAsset(asset);
}

(async () => {
  for (const page of pages) await validatePage(page);

  if (issues.length) {
    console.error(`Public site check failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`Public site check passed for ${pages.length} page(s) and ${fetchedAssets.size} asset(s).`);
})();
