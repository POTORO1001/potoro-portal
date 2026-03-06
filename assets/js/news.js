// /assets/js/news.js
(function(){
  const { tryLoadCSV, csvToNewsObjects, escapeHtml } = window.PortalCore;

  function parseDateSortable(s){
    const t = String(s||'').trim().replace(/-/g,'/');
    const m = t.match(/(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})/);
    if(m){
      const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
      return new Date(y, mo-1, d).getTime();
    }
    return 0;
  }

  async function loadNews(){
    const cfg = window.PORTAL_CONFIG || {};
    try{
      const csv = await tryLoadCSV(cfg.newsCsvUrl, cfg.newsCsvUrlAlt);
      if(!csv){
        console.error('news CSV could not be loaded', {
          newsCsvUrl: cfg.newsCsvUrl,
          newsCsvUrlAlt: cfg.newsCsvUrlAlt
        });
        return [];
      }
      const items = csvToNewsObjects(csv) || [];
      items.sort((a,b)=> parseDateSortable(b.date) - parseDateSortable(a.date));
      return items;
    }catch(err){
      console.error('loadNews failed:', err);
      return [];
    }
  }

  function renderNewsList(ulId, items, limit){
    const ul = document.getElementById(ulId);
    if(!ul) return;

    const safeItems = Array.isArray(items) ? items : [];
    const list = Number.isFinite(limit) ? safeItems.slice(0, limit) : safeItems;

    if(!list.length){
      ul.innerHTML = '<li><span class="tag">—</span> 現在お知らせはありません。</li>';
      return;
    }

    ul.innerHTML = list.map(n=>{
      const date = escapeHtml(n.date || '—');
      const label = n.label ? `<span class="label">${escapeHtml(n.label)}</span>` : '';
      const text = escapeHtml(n.text || '');
      return `<li><span class="tag" style="min-width:8.2em;display:inline-block">${date}</span> ${label} ${text}</li>`;
    }).join('');
  }

  window.PortalNews = { loadNews, renderNewsList };
})();
