// /assets/js/news.js
(function(){
  const { tryLoadCSV, csvToNewsObjects, escapeHtml } = window.PortalCore;

  function parseDateSortable(value){
    const text = String(value || '').trim().replace(/-/g,'/');
    const match = text.match(/(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})/);
    if(match){
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day).getTime();
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
        return null;
      }
      const items = csvToNewsObjects(csv) || [];
      items.sort((a,b)=> parseDateSortable(b.date) - parseDateSortable(a.date));
      return items;
    }catch(err){
      console.error('loadNews failed:', err);
      return null;
    }
  }

  function renderNewsList(ulId, items, limit){
    const ul = document.getElementById(ulId);
    if(!ul) return;

    if(items === null){
      ul.innerHTML = '<li><span class="tag">-</span> お知らせの取得に失敗しました。時間をおいて再度ご確認ください。</li>';
      return;
    }

    const safeItems = Array.isArray(items) ? items : [];
    const list = Number.isFinite(limit) ? safeItems.slice(0, limit) : safeItems;

    if(!list.length){
      ul.innerHTML = '<li><span class="tag">-</span> 現在お知らせはありません。</li>';
      return;
    }

    ul.innerHTML = list.map(news=>{
      const date = escapeHtml(news.date || '-');
      const label = news.label ? `<span class="label">${escapeHtml(news.label)}</span>` : '';
      const text = escapeHtml(news.text || '');
      return `<li><span class="tag news-date">${date}</span> ${label} ${text}</li>`;
    }).join('');
  }

  window.PortalNews = { loadNews, renderNewsList };
})();
