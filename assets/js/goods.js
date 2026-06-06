// /assets/js/goods.js
(function(){
  const { tryLoadCSV, csvToGoodsObjects, escapeHtml, formatDateJPWithWeekday } = window.PortalCore;

  function actionLinks(links){
    return `<div class="fallback-actions">${links.map(link =>
      `<a href="${escapeHtml(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label)}</a>`
    ).join('')}</div>`;
  }

  function goodsFallback(title, text, links){
    return `
      <tr>
        <td colspan="4">
          <div class="data-fallback">
            <div class="data-fallback-title">${escapeHtml(title)}</div>
            <p class="data-fallback-text">${escapeHtml(text)}</p>
            ${actionLinks(links)}
          </div>
        </td>
      </tr>
    `;
  }

  async function loadGoods(){
    const cfg = window.PORTAL_CONFIG || {};
    try{
      const csv = await tryLoadCSV(cfg.goodsCsvUrl, cfg.goodsCsvUrlAlt);
      if(!csv){
        console.error('goods CSV could not be loaded', {
          goodsCsvUrl: cfg.goodsCsvUrl,
          goodsCsvUrlAlt: cfg.goodsCsvUrlAlt
        });
        return null;
      }
      return csvToGoodsObjects(csv) || [];
    }catch(err){
      console.error('loadGoods failed:', err);
      return null;
    }
  }

  function renderGoodsTable(tbodyId, items){
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;

    if(items === null){
      tbody.innerHTML = goodsFallback(
        'グッズ情報を取得できませんでした',
        '最新の配布状況はXやお知らせでも案内しています。時間をおいて再読み込みするか、下のリンクから確認してください。',
        [
          { href: 'https://x.com/po_toro', label: 'Xで最新情報を見る', external: true },
          { href: 'news.html', label: 'お知らせを見る' },
          { href: 'events.html', label: 'イベントを見る' }
        ]
      );
      return;
    }

    const safeItems = Array.isArray(items) ? items : [];

    if(!safeItems.length){
      tbody.innerHTML = goodsFallback(
        '現在表示できるグッズ情報はありません',
        'イベントやお知らせから、今後の配布・販売情報を確認できます。',
        [
          { href: 'events.html', label: 'イベントを見る' },
          { href: 'news.html', label: 'お知らせを見る' },
          { href: 'schedule.html', label: '週間お給仕表を見る' }
        ]
      );
      return;
    }

    tbody.innerHTML = safeItems.map(goods=>{
      const start = goods.start ? formatDateJPWithWeekday(goods.start) : '';
      const end = goods.end ? formatDateJPWithWeekday(goods.end) : '';
      const event = goods.event || '';
      const name = goods.name || '';
      const note = goods.note || '';

      return `
        <tr>
          <td class="date-text">${start ? `<span>${escapeHtml(start)}</span>` : ''}</td>
          <td>${event ? `<span class="event-name">${escapeHtml(event)}</span>` : ''}</td>
          <td>
            <div class="goods-name">${escapeHtml(name)}</div>
            ${note ? `<div class="note">${escapeHtml(note)}</div>` : ''}
          </td>
          <td class="date-text">${end ? `<span>${escapeHtml(end)}</span>` : ''}</td>
        </tr>
      `;
    }).join('');
  }

  window.PortalGoods = { loadGoods, renderGoodsTable };
})();
