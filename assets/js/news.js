// /assets/js/news.js
(function(){
  const { tryLoadCSV, csvToNewsObjects, escapeHtml } = window.PortalCore;

  function actionLinks(links){
    return `<div class="fallback-actions">${links.map(link =>
      `<a href="${escapeHtml(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label)}</a>`
    ).join('')}</div>`;
  }

  function newsFallback(title, text, links){
    return `
      <li class="data-fallback">
        <div class="data-fallback-title">${escapeHtml(title)}</div>
        <p class="data-fallback-text">${escapeHtml(text)}</p>
        ${actionLinks(links)}
      </li>
    `;
  }

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
      ul.innerHTML = newsFallback(
        'お知らせを取得できませんでした',
        '最新情報はXでも案内しています。時間をおいて再読み込みするか、下のリンクから確認してください。',
        [
          { href: 'https://x.com/po_toro', label: 'Xで最新情報を見る', external: true },
          { href: 'schedule.html', label: '週間お給仕表を見る' },
          { href: 'events.html', label: 'イベントを見る' }
        ]
      );
      return;
    }

    const safeItems = Array.isArray(items) ? items : [];
    const list = Number.isFinite(limit) ? safeItems.slice(0, limit) : safeItems;

    if(!list.length){
      ul.innerHTML = newsFallback(
        '現在表示できるお知らせはありません',
        '営業日やイベント情報は、ほかのページから確認できます。',
        [
          { href: 'schedule.html', label: '週間お給仕表を見る' },
          { href: 'events.html', label: 'イベントを見る' },
          { href: 'price.html', label: '料金詳細を見る' }
        ]
      );
      return;
    }

    ul.innerHTML = list.map(news=>{
      const date = escapeHtml(news.date || '-');
      const label = news.label ? `<span class="label">${escapeHtml(news.label)}</span>` : '';
      const text = escapeHtml(news.text || '');
      return `<li><span class="tag news-date">${date}</span>${label}<span class="news-text">${text}</span></li>`;
    }).join('');
  }

  window.PortalNews = { loadNews, renderNewsList };
})();
