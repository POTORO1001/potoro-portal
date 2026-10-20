const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const headerTemplate = fs.readFileSync(path.join(rootDir, '_includes/site-header.html'), 'utf8').trim();
const footerTemplate = fs.readFileSync(path.join(rootDir, '_includes/site-footer.html'), 'utf8').trim();
const checkOnly = process.argv.includes('--check');

const pages = [
  ['index.html', 'index', ''],
  ['news.html', 'news', ''],
  ['events.html', 'events', ''],
  ['goods.html', 'goods', ''],
  ['games.html', 'games', ''],
  ['omikuji.html', 'games', ''],
  ['passport.html', 'games', ''],
  ['menu.html', 'menu', ''],
  ['schedule.html', 'schedule', ''],
  ['price.html', 'price', ''],
  ['uniforms.html', 'uniforms', ''],
  ['404.html', '', ''],
  ['recruit/index.html', 'recruit', '../']
];

function render(template, current, root) {
  return template
    .replaceAll('{{ROOT}}', root)
    .replace(/\{\{CURRENT:([^}]+)\}\}/g, (_, page) => page === current ? ' aria-current="page"' : '');
}

function replaceRegion(html, name, markup, fallbackPattern) {
  const start = `<!-- shared-layout:${name}:start -->`;
  const end = `<!-- shared-layout:${name}:end -->`;
  const managedPattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  const managed = `${start}\n${markup}\n${end}`;
  return managedPattern.test(html) ? html.replace(managedPattern, managed) : html.replace(fallbackPattern, managed);
}

function addBodyClass(html) {
  return html.replace(/<body([^>]*)>/i, (tag, attrs) => {
    const classMatch = attrs.match(/\sclass="([^"]*)"/i);
    if (!classMatch) return `<body${attrs} class="theme-v2">`;
    const classes = new Set(classMatch[1].split(/\s+/).filter(Boolean));
    classes.add('theme-v2');
    return tag.replace(classMatch[0], ` class="${[...classes].join(' ')}"`);
  });
}

function ensureStylesheet(html, root) {
  if (/assets\/css\/design-system\.css/.test(html)) return html;
  const tag = `  <link rel="stylesheet" href="${root}assets/css/design-system.css?v=20261020">`;
  return html.replace('</head>', `${tag}\n</head>`);
}

function removeLegacyPrototypeStyle(html) {
  return html.replace(
    /\s*<style>\s*\/\* Renewal prototype: the header and full-screen menu remain scoped to this page\. \*\/[\s\S]*?<\/style>/,
    ''
  );
}

function ensureUniformScripts(html, root, file) {
  if (file !== 'uniforms.html' || /assets\/js\/core\.js/.test(html)) return html;
  const scripts = [
    `<script src="${root}assets/js/core.js?v=20261020"></script>`,
    `<script src="${root}assets/js/page-init.js?v=20261020"></script>`
  ].join('\n');
  return html.replace('</body>', `${scripts}\n</body>`);
}

const stale = [];
for (const [file, current, root] of pages) {
  const absolute = path.join(rootDir, file);
  const original = fs.readFileSync(absolute, 'utf8');
  let html = original;
  html = replaceRegion(html, 'header', render(headerTemplate, current, root), /<header\b[\s\S]*?<\/header>/i);
  html = replaceRegion(html, 'footer', render(footerTemplate, current, root), /<footer\b[\s\S]*?<\/footer>/i);
  html = removeLegacyPrototypeStyle(html);
  html = addBodyClass(html);
  html = ensureStylesheet(html, root);
  html = ensureUniformScripts(html, root, file);

  if (html === original) continue;
  if (checkOnly) stale.push(file);
  else fs.writeFileSync(absolute, html, 'utf8');
}

if (stale.length) {
  console.error(`Shared layout is out of date: ${stale.join(', ')}`);
  process.exit(1);
}

console.log(checkOnly ? 'Shared layout is in sync.' : 'Shared layout synchronized.');
