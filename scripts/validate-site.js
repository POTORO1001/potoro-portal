const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicPages = [
  'index.html',
  'news.html',
  'events.html',
  'goods.html',
  'games.html',
  'schedule.html',
  'price.html',
  'uniforms.html',
  '404.html',
  'recruit/index.html'
];

const sitemapPages = [
  'index.html',
  'news.html',
  'events.html',
  'goods.html',
  'games.html',
  'schedule.html',
  'price.html',
  'uniforms.html',
  'recruit/index.html'
];

const expectedNavLinks = 10;
const issues = [];

function readFile(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function addIssue(file, message) {
  issues.push(`${file}: ${message}`);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function hasLikelyEncodingDamage(value) {
  return /\?{3,}|\uFFFD/.test(value);
}

function normalizeLocalTarget(fromFile, href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('#')) return null;
  if (/^(https?:|mailto:|tel:|data:)/i.test(clean)) return null;
  if (clean.startsWith('/potoro-portal/')) return null;

  let target = path.normalize(path.join(path.dirname(fromFile), clean));
  const absolute = path.join(root, target);
  if ((clean.endsWith('/') || (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()))) {
    target = path.join(target, 'index.html');
  }
  return target.replace(/\\/g, '/');
}

function isLargeRaster(target) {
  if (!/\.(png|jpe?g)$/i.test(target)) return false;
  const absolute = path.join(root, target);
  return fs.existsSync(absolute) && fs.statSync(absolute).size > 250000;
}

function hasWebpSibling(target) {
  const absolute = path.join(root, target);
  const dir = path.dirname(absolute);
  const base = path.basename(absolute);
  const candidates = [
    `${absolute}.webp`,
    path.join(dir, base.replace(/\.(png|jpe?g)$/i, '.webp'))
  ];
  return candidates.some(candidate => fs.existsSync(candidate));
}

function hasWebpSourceBeforeImage(html, imgIndex) {
  const before = html.slice(0, imgIndex);
  const lastPicture = before.lastIndexOf('<picture');
  const lastPictureClose = before.lastIndexOf('</picture>');
  if (lastPicture === -1 || lastPictureClose > lastPicture) return false;
  return /<source\b[^>]*type="image\/webp"[^>]*>/i.test(before.slice(lastPicture));
}

function validateHtml(file) {
  const html = readFile(file);
  const is404 = file === '404.html';
  const isUniforms = file === 'uniforms.html';

  if (!/<title>.+<\/title>/s.test(html)) addIssue(file, 'missing title');
  if (!/<meta\s+name="description"/i.test(html)) addIssue(file, 'missing description');
  if (!/<link\s+rel="canonical"/i.test(html)) addIssue(file, 'missing canonical');
  if (!/property="og:image"/i.test(html)) addIssue(file, 'missing og:image');
  if (!/name="twitter:card"/i.test(html)) addIssue(file, 'missing twitter card');
  if (!is404 && !/type="application\/ld\+json"/i.test(html)) addIssue(file, 'missing JSON-LD');

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  const description = attr(html.match(/<meta\s+name="description"[^>]*>/i)?.[0] || '', 'content');
  if (hasLikelyEncodingDamage(title)) addIssue(file, `title appears to be encoding-damaged: ${title}`);
  if (hasLikelyEncodingDamage(description)) addIssue(file, `description appears to be encoding-damaged: ${description}`);

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      if (hasLikelyEncodingDamage(JSON.stringify(data))) {
        addIssue(file, 'JSON-LD appears to be encoding-damaged');
      }
    } catch (err) {
      addIssue(file, `invalid JSON-LD: ${err.message}`);
    }
  }

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) addIssue(file, `expected 1 h1, found ${h1Count}`);

  const navLinks = (html.match(/class="nav-links"/i) && html.match(/<div class="nav-links"[\s\S]*?<\/div>/i)?.[0].match(/<a\b/gi)) || [];
  if (!isUniforms && navLinks.length !== expectedNavLinks) {
    addIssue(file, `expected ${expectedNavLinks} header nav links, found ${navLinks.length}`);
  }

  const drawerLinks = (html.match(/class="drawer"/i) && html.match(/<div class="drawer"[\s\S]*?<\/div>\s*<\/header>/i)?.[0].match(/<a\b/gi)) || [];
  if (!isUniforms && drawerLinks.length !== expectedNavLinks) {
    addIssue(file, `expected ${expectedNavLinks} drawer links, found ${drawerLinks.length}`);
  }

  const drawerTag = html.match(/<div class="drawer"[^>]*>/i)?.[0] || '';
  if (!isUniforms) {
    if (!/role="dialog"/i.test(drawerTag)) addIssue(file, 'drawer missing role="dialog"');
    if (!/aria-modal="true"/i.test(drawerTag)) addIssue(file, 'drawer missing aria-modal="true"');
    if (!/tabindex="-1"/i.test(drawerTag)) addIssue(file, 'drawer missing tabindex="-1"');
  }

  for (const match of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
    const tag = match[0];
    const label = attr(tag, 'aria-label') || stripTags(match[1]);
    if (!label) addIssue(file, `button missing accessible name: ${tag}`);
    if (/class="[^"]*\bdrawer-close\b/i.test(tag) && stripTags(match[1]) === '?') {
      addIssue(file, `drawer close button appears to be mojibake: ${tag}`);
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    const tag = match[0];
    const rel = attr(tag, 'rel');
    if (!/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) {
      addIssue(file, `external link missing rel noopener noreferrer: ${tag}`);
    }
  }

  for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const tag = match[0];
    if (!attr(tag, 'title')) addIssue(file, `iframe missing title: ${tag}`);
  }

  for (const match of html.matchAll(/<div\b[^>]*role="dialog"[^>]*>/gi)) {
    const tag = match[0];
    if (!/aria-modal="true"/i.test(tag)) addIssue(file, `dialog missing aria-modal: ${tag}`);
    if (!attr(tag, 'aria-label') && !attr(tag, 'aria-labelledby')) {
      addIssue(file, `dialog missing accessible label: ${tag}`);
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const id = attr(tag, 'id');
    const src = attr(tag, 'src');
    const alt = attr(tag, 'alt');
    const isLightboxImage = id === 'lightboxImg' || id === 'uniformLightboxImg';
    if (!/\salt=/.test(tag)) addIssue(file, `image missing alt: ${tag}`);
    if (/\s(?:class|loading|width|height|src)=/i.test(alt)) {
      addIssue(file, `image alt appears to contain markup attributes: ${tag}`);
    }
    if (!/\sdecoding=/.test(tag)) addIssue(file, `image missing decoding: ${tag}`);
    if (!isLightboxImage && !/\s(?:loading|fetchpriority)=/.test(tag)) {
      addIssue(file, `image missing loading/fetchpriority: ${tag}`);
    }
    if (!isLightboxImage && (!/\swidth=/.test(tag) || !/\sheight=/.test(tag))) {
      addIssue(file, `image missing width/height: ${tag}`);
    }

    const target = src ? normalizeLocalTarget(file, src) : null;
    if (
      target &&
      isLargeRaster(target) &&
      hasWebpSibling(target) &&
      !hasWebpSourceBeforeImage(html, match.index)
    ) {
      addIssue(file, `large raster image should be paired with a WebP source: ${src}`);
    }
  }

  for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*(?:href|src|srcset)="([^"]+)"/gi)) {
    const target = normalizeLocalTarget(file, match[1]);
    if (!target) continue;
    if (!fs.existsSync(path.join(root, target))) {
      addIssue(file, `broken local reference ${match[1]} -> ${target}`);
    }
  }

  if (is404 && !/<meta\s+name="robots"\s+content="noindex"/i.test(html)) {
    addIssue(file, '404 page should be noindex');
  }
}

function validateDynamicImageMarkup() {
  const file = 'assets/js/events.js';
  const js = readFile(file);
  for (const match of js.matchAll(/<img\b[^>]*class="thumb"[^>]*>/gi)) {
    const tag = match[0];
    if (!/\sloading=/.test(tag)) addIssue(file, `generated event image missing loading: ${tag}`);
    if (!/\sdecoding=/.test(tag)) addIssue(file, `generated event image missing decoding: ${tag}`);
    if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) {
      addIssue(file, `generated event image missing width/height: ${tag}`);
    }
  }
}

function validateSitemap() {
  const sitemap = readFile('sitemap.xml');
  for (const page of sitemapPages) {
    const loc = page === 'index.html'
      ? 'https://potoro1001.github.io/potoro-portal/'
      : page === 'recruit/index.html'
        ? 'https://potoro1001.github.io/potoro-portal/recruit/'
        : `https://potoro1001.github.io/potoro-portal/${page}`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      addIssue('sitemap.xml', `missing ${loc}`);
    }
  }
  if (sitemap.includes('/404.html')) addIssue('sitemap.xml', '404 page should not be listed');

  for (const match of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1])) {
      addIssue('sitemap.xml', `invalid lastmod ${match[1]}`);
    }
  }
}

function validateIgnore() {
  const gitignore = readFile('.gitignore');
  if (!gitignore.split(/\r?\n/).includes('potoro-profile-public/')) {
    addIssue('.gitignore', 'missing potoro-profile-public/');
  }
}

for (const page of publicPages) validateHtml(page);
validateDynamicImageMarkup();
validateSitemap();
validateIgnore();

if (issues.length) {
  console.error(`Site validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Site validation passed for ${publicPages.length} page(s).`);
