// /assets/js/schedule-cards.js
(function(){
  const { escapeHtml, fetchJsonWithTimeout, parseSheetDateToJsDate } = window.PortalCore || {};

  const WEEKDAYS = ['日','月','火','水','木','金','土'];

  function safe(value){
    const text = String(value ?? '').trim();
    return escapeHtml ? escapeHtml(text) : text;
  }

  function normalizeText(value){
    return String(value ?? '').trim();
  }

  function ensureChan(name){
    const base = normalizeText(name);
    if(!base) return '';
    return base.endsWith('ちゃん') ? base : `${base}ちゃん`;
  }

  function isClosedLabel(name){
    return normalizeText(name) === 'お屋敷休館日';
  }

  function isOffRow(row){
    const start = normalizeText(row?.start);
    const end = normalizeText(row?.end);
    const note = normalizeText(row?.note);
    return row?.off === true || note === 'おやすみ' || isClosedLabel(row?.maid) || (!start && !end);
  }

  function parseTimeToMinutes(value){
    const text = normalizeText(value).replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));
    const match = text.match(/^(\d{1,2}):(\d{2})/);
    if(!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if(!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return (hours * 60) + minutes;
  }

  function formatDate(day){
    const date = parseSheetDateToJsDate ? parseSheetDateToJsDate(day.date) : new Date(day.date);
    if(!date || Number.isNaN(date.getTime())) return safe(day.date || '');
    const weekday = day.dow || WEEKDAYS[date.getDay()];
    return `${date.getMonth() + 1}月${date.getDate()}日(${weekday})`;
  }

  function dateKey(date){
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function dayState(day){
    const date = parseSheetDateToJsDate ? parseSheetDateToJsDate(day.date) : new Date(day.date);
    if(!date || Number.isNaN(date.getTime())) return { className: '', label: '' };
    const today = new Date();
    const todayKey = dateKey(today);
    const targetKey = dateKey(date);
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowKey = dateKey(tomorrow);
    if(targetKey === todayKey) return { className: ' is-today', label: '本日' };
    if(targetKey === tomorrowKey) return { className: ' is-tomorrow', label: '明日' };
    if(date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return { className: ' is-past', label: '終了' };
    return { className: '', label: '' };
  }

  function getWorkingRows(day){
    const maids = Array.isArray(day?.maids) ? day.maids : [];
    return maids
      .filter(row => !isOffRow(row))
      .map(row => ({
        maid: normalizeText(row.maid),
        start: normalizeText(row.start),
        end: normalizeText(row.end),
        note: normalizeText(row.note),
        startMinutes: parseTimeToMinutes(row.start),
        endMinutes: parseTimeToMinutes(row.end)
      }))
      .filter(row => row.maid);
  }

  function getOffRows(day){
    const maids = Array.isArray(day?.maids) ? day.maids : [];
    return maids
      .filter(row => isOffRow(row) && !isClosedLabel(row?.maid))
      .map(row => ({
        maid: normalizeText(row.maid),
        note: normalizeText(row.note) || 'おやすみ'
      }))
      .filter(row => row.maid);
  }

  function getHoursText(workingRows){
    const valid = workingRows.filter(row => row.start && row.end && row.startMinutes !== null && row.endMinutes !== null);
    if(!valid.length) return '営業時間未定';
    const open = valid.reduce((min, row) => row.startMinutes < min.startMinutes ? row : min, valid[0]).start;
    const close = valid.reduce((max, row) => row.endMinutes > max.endMinutes ? row : max, valid[0]).end;
    return `${open}〜${close}`;
  }

  function renderMaidRows(rows){
    if(!rows.length) return '';
    return `
      <div class="schedule-maid-list">
        ${rows.map(row => `
          <div class="schedule-maid-row">
            <span class="schedule-maid-name">${safe(ensureChan(row.maid))}</span>
            <span class="schedule-maid-time">${safe(row.note || (row.start && row.end ? `${row.start}〜${row.end}` : '時間未定'))}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderOffRows(rows){
    if(!rows.length) return '';
    return `
      <div class="schedule-off-list" aria-label="おやすみ">
        ${rows.map(row => `
          <span>${safe(ensureChan(row.maid))} ${safe(row.note)}</span>
        `).join('')}
      </div>
    `;
  }

  function renderFallback(container, title, text){
    container.innerHTML = `
      <div class="schedule-card-fallback">
        <strong>${safe(title)}</strong>
        <p>${safe(text)}</p>
        <a href="https://x.com/po_toro" target="_blank" rel="noopener noreferrer">Xで最新情報を見る</a>
      </div>
    `;
  }

  function renderCards(container, days){
    if(!Array.isArray(days) || !days.length){
      renderFallback(container, '表示できるお給仕予定がありません', '最新の営業情報はX、または下の元の表からご確認ください。');
      return;
    }

    container.innerHTML = days.map(day => {
      const state = dayState(day);
      const workingRows = getWorkingRows(day);
      const offRows = getOffRows(day);
      const closed = !workingRows.length;
      const label = state.label ? `<span class="schedule-day-label">${safe(state.label)}</span>` : '';
      const hours = closed ? '休館日' : getHoursText(workingRows);
      const body = closed
        ? '<div class="schedule-closed-text">この日はお屋敷休館日です</div>'
        : renderMaidRows(workingRows);

      return `
        <article class="schedule-card${state.className}${closed ? ' is-closed' : ''}">
          <div class="schedule-card-top">
            <div>
              <div class="schedule-card-date">${safe(formatDate(day))}</div>
              <div class="schedule-card-hours">${safe(hours)}</div>
            </div>
            ${label}
          </div>
          ${body}
          ${renderOffRows(offRows)}
        </article>
      `;
    }).join('');
  }

  async function initScheduleCards(){
    const container = document.getElementById('scheduleCardList');
    const apiBase = window.PORTAL_CONFIG?.scheduleApiUrl;
    if(!container) return;

    if(!window.PortalCore || !fetchJsonWithTimeout || !apiBase){
      renderFallback(container, 'お給仕予定を表示できませんでした', 'ページ設定を確認中です。最新情報はXをご確認ください。');
      return;
    }

    try{
      const data = await fetchJsonWithTimeout(`${apiBase}?mode=week`, 10000);
      if(!data || data.ok !== true || !Array.isArray(data.days)){
        throw new Error(data?.error || 'invalid schedule response');
      }
      renderCards(container, data.days);
    }catch(err){
      console.error('schedule cards failed:', err);
      renderFallback(container, 'お給仕予定を取得できませんでした', '時間をおいて再読み込みするか、Xで最新情報をご確認ください。');
    }
  }

  document.addEventListener('DOMContentLoaded', initScheduleCards);
})();
