// /assets/js/news.js
(function(){
  const { tryLoadCSV, csvToNewsObjects, escapeHtml } = window.PortalCore;

  function parseDateSortable(s){
    // ざっくり：YYYY/MM/DD や YYYY-MM-DD を想定
    const t = String(s||'').trim().replace(/-/g,'/');
    const m = t.match(/(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})/);
    if(m){
      const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
      return new Date(y, mo-1, d).getTime();
    }
    // 失敗は0で最後尾
    return 0;
  }

  async function loadNews(){
    const cfg = window.PORTAL_CONFIG || {};
    const csv = await tryLoadCSV(cfg.newsCsvUrl, cfg.newsCsvUrlAlt);
    const items = csv ? csvToNewsObjects(csv) : [];
    // 新しい順（date解析できないものは最後）
    items.sort((a,b)=> parseDateSortable(b.date) - parseDateSortable(a.date));
    return items;
  }

  function renderNewsList(ulId, items, limit){
    const ul = document.getElementById(ulId);
    if(!ul) return;

    const list = Number.isFinite(limit) ? items.slice(0, limit) : items;

    if(!list.length){
      ul.innerHTML = '<li><span class="tag">—</span> 現在お知らせはありません。</li>';
      return;
    }

    ul.innerHTML = list.map(n=>{
      const date = escapeHtml(n.date || '—');
      const label = n.label ? `<span class="label">${escapeHtml(n.label)}</span>` : '';
      // textは既存運用に合わせてHTML許容したいなら escapeしない運用もあり得るが、
      // ここは安全優先でescapeします。必要なら「textはHTML可」に切替できます。
      const text = escapeHtml(n.text || '');
      return `<li><span class="tag" style="min-width:8.2em;display:inline-block">${date}</span> ${label} ${text}</li>`;
    }).join('');
  }

  window.PortalNews = { loadNews, renderNewsList };
})();
