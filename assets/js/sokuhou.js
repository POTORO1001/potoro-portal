(function(){
  const config = window.PORTAL_CONFIG || {};
  const core = window.PortalCore || {};

  const falseValues = new Set(['false', '0', 'no', 'off', '非表示', '停止', 'なし']);
  const messageKeys = ['message', 'text', 'body', 'title', '速報', '本文', '内容', 'メッセージ'];
  const enabledKeys = ['enabled', 'active', 'show', 'visible', '表示', '公開'];
  const linkKeys = ['link', 'url', 'href', 'リンク'];

  function normalize(value) {
    return core.normalizeHeader ? core.normalizeHeader(value) : String(value || '').trim().toLowerCase();
  }

  function firstByKeys(row, headers, keys) {
    for (const key of keys) {
      const index = headers.indexOf(normalize(key));
      if (index !== -1 && row[index]) return String(row[index]).trim();
    }
    return '';
  }

  function hasHeader(row) {
    const headers = (row || []).map(normalize);
    return [...messageKeys, ...enabledKeys, ...linkKeys].some((key) => headers.includes(normalize(key)));
  }

  function parseRows(csv) {
    const rows = core.parseCSV ? core.parseCSV(csv) : [];
    if (!rows.length) return [];

    if (!hasHeader(rows[0])) {
      return rows
        .map((row) => ({
          message: String((row || []).find((cell) => String(cell || '').trim()) || '').trim(),
          link: ''
        }))
        .filter((item) => item.message);
    }

    const headers = rows[0].map(normalize);
    return rows.slice(1).map((row) => {
      const enabled = firstByKeys(row, headers, enabledKeys);
      if (enabled && falseValues.has(enabled.toLowerCase())) return null;
      return {
        message: firstByKeys(row, headers, messageKeys),
        link: firstByKeys(row, headers, linkKeys)
      };
    }).filter((item) => item && item.message);
  }

  function escapeHtml(value) {
    if (core.escapeHtml) return core.escapeHtml(value);
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function render(items) {
    const alert = document.getElementById('sokuhouAlert');
    const link = document.getElementById('sokuhouAlertLink');
    const track = document.getElementById('sokuhouAlertTrack');
    if (!alert || !link || !track) return;

    const messages = (items || []).map((item) => item.message).filter(Boolean);
    if (!messages.length) {
      alert.hidden = true;
      track.textContent = '';
      return;
    }

    const message = messages.join('　 / 　');
    const escaped = escapeHtml(message);
    track.innerHTML = `<span>${escaped}</span><span aria-hidden="true">${escaped}</span>`;

    const firstLink = (items.find((item) => item.link) || {}).link || 'news.html';
    link.setAttribute('href', firstLink);
    if (/^https?:\/\//.test(firstLink)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }

    alert.hidden = false;
  }

  async function init() {
    const primaryUrl = config.sokuhouCsvUrl;
    const altUrl = config.sokuhouCsvUrlAlt || primaryUrl;
    if (!primaryUrl || !core.tryLoadCSV) return;

    try {
      const csv = await core.tryLoadCSV(primaryUrl, altUrl);
      render(parseRows(csv));
    } catch (err) {
      render([]);
    }
  }

  window.PortalSokuhou = { init, parseRows, render };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
