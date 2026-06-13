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

  function rowsToItems(rows) {
    if (!rows.length) return [];

    if (!hasHeader(rows[0])) {
      return rows
        .map((row) => {
          const enabled = String(row[1] || '').trim().toLowerCase();
          if (enabled && falseValues.has(enabled)) return null;
          return {
            message: String((row || []).find((cell) => String(cell || '').trim()) || '').trim(),
            link: String(row[2] || '').trim()
          };
        })
        .filter(Boolean)
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

  function parseRows(csv) {
    const rows = core.parseCSV ? core.parseCSV(csv) : [];
    return rowsToItems(rows);
  }

  function parseGvizTable(table) {
    const rows = ((table || {}).rows || []).map((row) => (
      ((row || {}).c || []).map((cell) => {
        const value = cell && (cell.f != null ? cell.f : cell.v);
        return value == null ? '' : String(value);
      })
    ));
    return rowsToItems(rows);
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
    if (!primaryUrl) return;

    try {
      const csv = await core.tryLoadCSV(primaryUrl, altUrl);
      render(parseRows(csv));
    } catch (err) {
      try {
        render(await loadGvizJsonp(primaryUrl));
      } catch (jsonpErr) {
        render([]);
      }
    }
  }

  function loadGvizJsonp(url) {
    return new Promise((resolve, reject) => {
      const callbackName = `__portalSokuhou${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const script = document.createElement('script');
      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (response) => {
        cleanup();
        resolve(parseGvizTable(response && response.table));
      };

      try {
        const gvizUrl = new URL(url);
        gvizUrl.searchParams.set('tqx', `responseHandler:${callbackName}`);
        script.src = gvizUrl.toString();
      } catch (err) {
        cleanup();
        reject(err);
        return;
      }

      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('sokuhou jsonp failed'));
      };
      document.head.appendChild(script);
    });
  }

  window.PortalSokuhou = { init, parseRows, parseGvizTable, render };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
