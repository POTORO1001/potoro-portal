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

function validateHtml(file) {
  const html = readFile(file);
  const is404 = file === '404.html';
  const isUniforms = file === 'uniforms.html';

  if (!/<title>.+<\/title>/s.test(html)) addIssue(file, 'missing title');
  if (!/<meta\s+name="description"/i.test(html)) addIssue(file, 'missing description');
  if (!/<link\s+rel="canonical"/i.test(html)) addIssue(file, 'missing canonical');
  if (!/property="og:image"/i.test(html)) addIssue(file, 'missing og:image');
  if (!/name="twitter:card"/i.test(html)) addIssue(file, 'missing twitter card');

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

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const id = attr(tag, 'id');
    const isLightboxImage = id === 'lightboxImg' || id === 'uniformLightboxImg';
    if (!/\salt=/.test(tag)) addIssue(file, `image missing alt: ${tag}`);
    if (!/\sdecoding=/.test(tag)) addIssue(file, `image missing decoding: ${tag}`);
    if (!isLightboxImage && (!/\swidth=/.test(tag) || !/\sheight=/.test(tag))) {
      addIssue(file, `image missing width/height: ${tag}`);
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
}

function validateIgnore() {
  const gitignore = readFile('.gitignore');
  if (!gitignore.split(/\r?\n/).includes('potoro-profile-public/')) {
    addIssue('.gitignore', 'missing potoro-profile-public/');
  }
}

for (const page of publicPages) validateHtml(page);
validateSitemap();
validateIgnore();

if (issues.length) {
  console.error(`Site validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Site validation passed for ${publicPages.length} page(s).`);
