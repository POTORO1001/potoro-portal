// /assets/js/goods.js
(function(){
  const { tryLoadCSV, csvToGoodsObjects, escapeHtml, formatDateJPWithWeekday } = window.PortalCore;

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
      tbody.innerHTML = '<tr><td colspan="4">グッズ情報の取得に失敗しました。時間をおいて再度ご確認ください。</td></tr>';
      return;
    }

    const safeItems = Array.isArray(items) ? items : [];

    if(!safeItems.length){
      tbody.innerHTML = '<tr><td colspan="4">現在表示できるグッズ情報はありません。</td></tr>';
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
