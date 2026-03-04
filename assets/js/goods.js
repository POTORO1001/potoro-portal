// /assets/js/goods.js
(function(){
  const { tryLoadCSV, csvToGoodsObjects, escapeHtml, formatDateJPWithWeekday } = window.PortalCore;

  async function loadGoods(){
    const cfg = window.PORTAL_CONFIG || {};
    const csv = await tryLoadCSV(cfg.goodsCsvUrl, cfg.goodsCsvUrlAlt);
    return csv ? csvToGoodsObjects(csv) : [];
  }

  function renderGoodsTable(tbodyId, items){
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;

    if(!items.length){
      tbody.innerHTML = '<tr><td colspan="4">現在表示できるグッズ情報はありません。</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(g=>{
      const start = g.start ? formatDateJPWithWeekday(g.start) : '';
      const end   = g.end   ? formatDateJPWithWeekday(g.end)   : '';
      const event = g.event || '';
      const name  = g.name  || '';
      const note  = g.note  || '';

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
