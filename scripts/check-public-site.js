const baseUrl = process.env.PUBLIC_SITE_URL || 'https://potoro1001.github.io/potoro-portal/';
const timeoutMs = Number(process.env.PUBLIC_SITE_TIMEOUT_MS || 15000);

const pages = [
  { path: '', title: 'PO・TORO', text: ['PO・TORO', '料金', 'メイドさん募集'] },
  { path: 'news.html', title: 'お知らせ', text: ['お知らせ', '最新情報'] },
  { path: 'events.html', title: 'イベント', text: ['イベント', '開催'] },
  { path: 'goods.html', title: 'グッズ', text: ['グッズ', '配布'] },
  { path: 'games.html', title: 'ゲーム・講義', text: ['ゲーム', '講義'] },
  { path: 'passport.html', title: 'ポトロパスポート講義', text: ['ポトロパスポート講義', 'BGMオン'] },
  { path: 'menu.html', title: 'ドリンク・フードメニュー', text: ['ドリンク・フードメニュー', '2026年5月'] },
  { path: 'omikuji.html', title: '今日のおみくじ', text: ['今日のおみくじ', '本日の運勢'] },
  { path: 'schedule.html', title: '週間お給仕表', text: ['週間お給仕表'] },
  { path: 'price.html', title: '料金', text: ['料金', '飲み放題'] },
  { path: 'uniforms.html', title: '歴代メイド服', text: ['歴代メイド服', '七代目'] },
  { path: 'recruit/', title: 'メイドさん募集', text: ['メイドさん募集', '応募'] }
];

const issues = [];
const fetchedAssets = new Set();
const expectedGameCards = ['ポ・トロクエスト', '萌えセレクト講義', 'ポトロパスポート講義', 'ご主人様タイプ診断', '今日のおみくじ'];
const expectedOmikujiDetails = ['今日の総合運', '恋愛運', '金運', '仕事運', 'ラッキー行動', 'ラッキーリンク'];
const expectedAssetText = [
  { path: 'assets/js/today.js', text: '萌えセレクトのご予約はDM' }
];

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

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
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
    if (src && /(?:ogp|hero|uniform|recruit|moeselect|diagnosis|quest|omikuji|passport|menu)/i.test(src)) {
      assets.push(new URL(src, pageUrl).toString());
    }
  }

  for (const match of html.matchAll(/<(?:source|video)\b[^>]*>/gi)) {
    const tag = match[0];
    for (const name of ['src', 'poster']) {
      const src = attr(tag, name);
      if (src) assets.push(new URL(src, pageUrl).toString());
    }
  }

  return assets.filter(isSameSiteAsset);
}

async function validateAsset(url) {
  if (fetchedAssets.has(url)) return;
  fetchedAssets.add(url);

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      addIssue(url, `asset returned HTTP ${response.status}`);
      return;
    }

    const pathname = new URL(url).pathname;
    const check = expectedAssetText.find(item => pathname.endsWith(`/${item.path}`));
    if (check) {
      const content = await response.text();
      if (!content.includes(check.text)) addIssue(url, `missing expected asset text "${check.text}"`);
    }
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

  const menuLinkCount = [...html.matchAll(/href="(?:\.\.\/)?menu\.html"/g)].length;
  if (menuLinkCount < 2) addIssue(url, 'menu page is missing from shared navigation or footer');

  if (!/<link\s+rel="stylesheet"/i.test(html)) addIssue(url, 'missing stylesheet link');
  if (!/<script\b[^>]*src=/i.test(html)) addIssue(url, 'missing script reference');

  const assets = collectCriticalAssets(html, url);
  for (const asset of assets) await validateAsset(asset);

  validatePageSpecificContent(page, html, url);
}

function validateTextOrder(target, actual, expected) {
  const compactActual = actual.join(' > ');
  const compactExpected = expected.join(' > ');
  if (compactActual !== compactExpected) {
    addIssue(target, `unexpected order "${compactActual}", expected "${compactExpected}"`);
  }
}

function validatePageSpecificContent(page, html, url) {
  if (page.path === '') {
    for (const id of ['sokuhouAlert', 'sokuhouAlertTrack', 'seatsStatus', 'seatsStatusLabel', 'seatsStatusUpdated', 'todayHours', 'todayMaidsWrap']) {
      if (!html.includes(`id="${id}"`)) addIssue(url, `missing top UI id "${id}"`);
    }
    if (!html.includes('ゲーム・講義・診断をまとめて確認')) {
      addIssue(url, 'missing clear games/lecture card description');
    }
    if (!html.includes('assets/js/sokuhou.js')) addIssue(url, 'missing breaking news script');
    if (!html.includes('assets/js/seats.js')) addIssue(url, 'missing seat status script');
    if (!html.includes('assets/js/today.js')) addIssue(url, 'missing today schedule script');
    for (const text of ['ドリンクとフードを見る', '萌えセレクトのご予約はDM', 'video/first-visit-guide-web.mp4']) {
      if (!html.includes(text)) addIssue(url, `missing top content "${text}"`);
    }
  }

  if (page.path === 'games.html') {
    const cards = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>/gi)]
      .map(match => stripTags(match[1]))
      .filter(text => expectedGameCards.includes(text));
    validateTextOrder(url, cards, expectedGameCards);
  }

  if (page.path === 'omikuji.html') {
    for (const detail of expectedOmikujiDetails) {
      if (!html.includes(detail)) addIssue(url, `missing omikuji detail "${detail}"`);
    }
    for (const id of ['fortuneOverall', 'fortuneLove', 'fortuneMoney', 'fortuneWork']) {
      if (!html.includes(`id="${id}"`)) addIssue(url, `missing omikuji result id "${id}"`);
    }
  }

  if (page.path === 'schedule.html') {
    for (const text of ['週間お給仕カード', '元のスプレッドシート表を確認する']) {
      if (!html.includes(text)) addIssue(url, `missing schedule UI text "${text}"`);
    }
    if (!html.includes('id="scheduleCardList"')) addIssue(url, 'missing schedule card list');
    if (!html.includes('assets/js/schedule-cards.js')) addIssue(url, 'missing schedule cards script');
    if (!html.includes('<details class="sheet-details')) addIssue(url, 'missing collapsible sheet details');
    if (!html.includes('萌えセレクトのご予約はDM')) addIssue(url, 'missing Moe Select reservation wording');
  }

  if (page.path === 'menu.html') {
    for (const text of ['menu-updated', '飲み放題付き', 'メイドさんの手料理']) {
      if (!html.includes(text)) addIssue(url, `missing menu content "${text}"`);
    }
  }

  if (page.path === 'passport.html') {
    for (const asset of ['assets/js/passport-lesson.js', 'assets/js/passport-bgm.js', 'img/passport-maids.webp']) {
      if (!html.includes(asset)) addIssue(url, `missing passport asset "${asset}"`);
    }
  }

  if (page.path === 'recruit/') {
    for (const text of ['漫画でわかる、ポトロのお給仕', '応募条件を見る', '応募フォームへ']) {
      if (!html.includes(text)) addIssue(url, `missing recruitment content "${text}"`);
    }
  }
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
