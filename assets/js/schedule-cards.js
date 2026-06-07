// /assets/js/schedule-cards.js
(function(){
  const { escapeHtml, parseCSV, fetchTextWithTimeout } = window.PortalCore || {};

  function startOfDay(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseDate(value){
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if(!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    if(date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return date;
  }

  function formatDate(date){
    const weekdays = ['日','月','火','水','木','金','土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日(${weekdays[date.getDay()]})`;
  }

  function normalizeHeader(value){
    let text = String(value || '');
    if(text && text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    return text.trim().toLowerCase();
  }

  function isClosed(row){
    const joined = `${row.hours} ${row.note}`;
    return /休館|休み|店休|お休み/.test(joined);
  }

  function rowClass(row){
    if(isClosed(row)) return ' is-closed';
    if(row.note) return ' is-event';
    return '';
  }

  function csvToScheduleRows(csv){
    const rows = parseCSV ? parseCSV(csv) : [];
    if(rows.length < 2) return [];

    const headers = rows[0].map(normalizeHeader);
    const indexOf = (keys)=>{
      for(const key of keys){
        const index = headers.indexOf(normalizeHeader(key));
        if(index !== -1) return index;
      }
      return -1;
    };

    const dateIndex = indexOf(['date','日付']);
    const hoursIndex = indexOf(['hours','営業時間','営業']);
    const noteIndex = indexOf(['note','備考','イベント','メモ']);

    return rows.slice(1).map(row => {
      const dateText = dateIndex > -1 ? String(row[dateIndex] || '').trim() : '';
      const date = parseDate(dateText);
      return {
        date,
        dateText,
        hours: hoursIndex > -1 ? String(row[hoursIndex] || '').trim() : '',
        note: noteIndex > -1 ? String(row[noteIndex] || '').trim() : ''
      };
    }).filter(row => row.date && (row.hours || row.note));
  }

  function pickRows(rows){
    const today = startOfDay(new Date());
    const upcoming = rows
      .filter(row => row.date >= today)
      .sort((a, b) => a.date - b.date)
      .slice(0, 7);

    if(upcoming.length) return upcoming;
    return rows.sort((a, b) => b.date - a.date).slice(0, 7).reverse();
  }

  function renderFallback(container, title, text){
    container.innerHTML = `
      <div class="schedule-card-fallback">
        <strong>${escapeHtml ? escapeHtml(title) : title}</strong>
        <p>${escapeHtml ? escapeHtml(text) : text}</p>
        <a href="https://x.com/po_toro" target="_blank" rel="noopener noreferrer">Xで最新情報を見る</a>
      </div>
    `;
  }

  function renderCards(container, rows){
    if(!rows.length){
      renderFallback(
        container,
        '表示できる営業予定がありません',
        '最新の営業情報はX、または下の詳細表からご確認ください。'
      );
      return;
    }

    container.innerHTML = rows.map(row => {
      const closed = isClosed(row);
      const shouldShowNote = row.note && row.note !== row.hours;
      const note = shouldShowNote ? `<p class="schedule-card-note">${escapeHtml(row.note)}</p>` : '';
      return `
        <article class="schedule-card${rowClass(row)}">
          <div class="schedule-card-date">${escapeHtml(formatDate(row.date))}</div>
          <div class="schedule-card-hours">${escapeHtml(row.hours || (closed ? '休館日' : '時間未定'))}</div>
          ${note}
        </article>
      `;
    }).join('');
  }

  async function initScheduleCards(){
    const container = document.getElementById('scheduleCardList');
    const csvUrl = window.PORTAL_CONFIG?.scheduleCsvUrl;
    if(!container) return;

    if(!window.PortalCore || !parseCSV || !fetchTextWithTimeout || !escapeHtml || !csvUrl){
      renderFallback(container, '営業予定を表示できませんでした', 'ページ設定を確認中です。最新情報はXをご確認ください。');
      return;
    }

    try{
      const csv = await fetchTextWithTimeout(csvUrl, 10000);
      renderCards(container, pickRows(csvToScheduleRows(csv)));
    }catch(err){
      console.error('schedule cards failed:', err);
      renderFallback(container, '営業予定を取得できませんでした', '時間をおいて再読み込みするか、Xで最新情報をご確認ください。');
    }
  }

  document.addEventListener('DOMContentLoaded', initScheduleCards);
})();
