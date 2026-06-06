// /assets/js/event-schedule.js
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
  }[s]));
}

function fallbackEvents(message){
  const grid = document.getElementById('eventsGrid');
  if(!grid) return;
  grid.innerHTML = buildDataFallback(
    'イベント情報を取得できませんでした',
    `${message} 最新情報はXやお知らせから確認できます。`,
    [
      { href: 'https://x.com/po_toro', label: 'Xで最新情報を見る', external: true },
      { href: 'news.html', label: 'お知らせを見る' },
      { href: 'schedule.html', label: '週間お給仕表を見る' }
    ]
  );
}

function buildActionLinks(links){
  return `<div class="fallback-actions">${links.map(link =>
    `<a href="${escapeHtml(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label)}</a>`
  ).join('')}</div>`;
}

function buildDataFallback(title, text, links){
  return `
    <div class="data-fallback">
      <div class="data-fallback-title">${escapeHtml(title)}</div>
      <p class="data-fallback-text">${escapeHtml(text)}</p>
      ${buildActionLinks(links)}
    </div>
  `;
}

function buildScheduleFallback(title, text){
  return buildDataFallback(title, text, [
    { href: 'https://x.com/po_toro', label: 'Xで最新情報を見る', external: true },
    { href: 'schedule.html', label: '週間お給仕表を見る' },
    { href: 'price.html', label: '料金詳細を見る' }
  ]);
}

function normalizeHeader(s){
  let t = String(s ?? '');
  if(t && t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
  return t.trim().toLowerCase();
}

function parseCsvLine(line){
  const out = [];
  let cur = '';
  let inQuotes = false;

  for(let i=0;i<line.length;i++){
    const ch = line[i];
    const next = line[i+1];

    if(ch === '"'){
      if(inQuotes && next === '"'){
        cur += '"';
        i++;
      }else{
        inQuotes = !inQuotes;
      }
    }else if(ch === ',' && !inQuotes){
      out.push(cur);
      cur = '';
    }else{
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text){
  const lines = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(line => line.trim() !== '');

  if(!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map(line => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => row[h] = (cols[i] ?? '').trim());
    return row;
  });
}

function parseDateOnly(value){
  const s = String(value ?? '').trim();
  const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(!m) return null;
  const y = Number(m[1]);
  const mon = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mon, d);
  if(
    Number.isNaN(dt.getTime()) ||
    dt.getFullYear() !== y ||
    dt.getMonth() !== mon ||
    dt.getDate() !== d
  ) return null;
  return dt;
}

function formatJaDate(value){
  const dt = parseDateOnly(value);
  if(!dt) return String(value ?? '');
  return formatJaDateFromDate(dt);
}

function formatJaDateFromDate(dt){
  const w = ['日','月','火','水','木','金','土'][dt.getDay()];
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}（${w}）`;
}

function startOfDay(dt){
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function addDays(dt, days){
  const copy = new Date(dt);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isScheduleRow(row){
  const date = String(row.date ?? '').trim();
  const hours = String(row.hours ?? '').trim();
  const note = String(row.note ?? '').trim();
  return !!date && (!!hours || !!note);
}

function isClosedDay(row){
  const hours = String(row.hours ?? '').trim();
  const note = String(row.note ?? '').trim();
  return hours.includes('休館') || hours.includes('休み') || note.includes('休館') || note.includes('休み');
}

function hasEventNote(row){
  const note = String(row.note ?? '').trim();
  return !!note && !isClosedDay(row);
}

function isSameDate(a, b){
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getScheduleCsvUrl(){
  return (
    window.PORTAL_CONFIG?.scheduleCsvUrl ||
    window.PORTAL_CONFIG?.schedule?.csvUrl ||
    window.PORTAL_CONFIG?.SCHEDULE_CSV_URL ||
    ''
  );
}

async function fetchTextWithTimeout(url, ms=10000){
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try{
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now(), {
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally {
    clearTimeout(id);
  }
}

function buildScheduleTable(rows, today){
  if(!rows.length){
    return buildScheduleFallback(
      '直近7日間の営業予定はありません',
      '最新の営業情報はXや週間お給仕表でも確認できます。'
    );
  }

  const body = rows.map(row => {
    const dateText = formatJaDate(row.date);
    const hoursText = escapeHtml(row.hours || '-');
    const noteText = escapeHtml(row.note || '');

    const classes = [];
    if(row._date && isSameDate(row._date, today)) classes.push('is-today');
    if(hasEventNote(row)) classes.push('is-event');
    if(isClosedDay(row)) classes.push('is-closed');

    return `
      <tr class="${classes.join(' ')}">
        <td class="schedule-date">${escapeHtml(dateText)}</td>
        <td class="schedule-hours">${hoursText}</td>
        <td>${noteText}</td>
      </tr>
    `;
  }).join('');

  return `
    <table class="schedule-table" aria-label="直近7日間の営業スケジュール一覧">
      <thead>
        <tr>
          <th>日付</th>
          <th>営業時間</th>
          <th>備考</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

async function loadEventSchedule(){
  const area = document.getElementById('eventScheduleArea');
  const status = document.getElementById('eventScheduleStatus');
  if(!area) return;

  const csvUrl = getScheduleCsvUrl();

  if(!csvUrl){
    area.innerHTML = buildScheduleFallback(
      '営業スケジュールを表示できません',
      'スケジュールの設定を確認中です。最新情報はXや週間お給仕表をご確認ください。'
    );
    if(status) status.textContent = '';
    return;
  }

  try{
    const text = await fetchTextWithTimeout(csvUrl, 10000);
    const rows = parseCsv(text);

    const today = startOfDay(new Date());
    const limit = addDays(today, 6);

    const filtered = rows
      .map(row => ({
        date: String(row.date ?? '').trim(),
        hours: String(row.hours ?? '').trim(),
        note: String(row.note ?? '').trim()
      }))
      .filter(isScheduleRow)
      .map(row => ({ ...row, _date: parseDateOnly(row.date) }))
      .filter(row => row._date)
      .filter(row => row._date >= today && row._date <= limit)
      .sort((a, b) => a._date - b._date);

    area.innerHTML = buildScheduleTable(filtered, today);

    if(status){
      status.textContent = `表示期間：${formatJaDateFromDate(today)} 〜 ${formatJaDateFromDate(limit)}`;
    }
  }catch(err){
    console.error('schedule load failed:', err);
    area.innerHTML = buildScheduleFallback(
      '営業スケジュールを取得できませんでした',
      '時間をおいて再読み込みするか、Xや週間お給仕表から最新情報をご確認ください。'
    );
    if(status) status.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  if(!window.PortalCore){
    console.error('PortalCore is not defined');
    fallbackEvents('イベント情報の取得に失敗しました。');
    const area = document.getElementById('eventScheduleArea');
    if(area){
      area.innerHTML = buildScheduleFallback(
        '営業スケジュールを取得できませんでした',
        'ページの読み込み中に問題が発生しました。最新情報はXや週間お給仕表をご確認ください。'
      );
    }
    return;
  }

  PortalCore.setupReveal();
  PortalCore.setupDrawer();
  PortalCore.setupCommonFooterYear();

  try{
    if(window.PortalEvents?.loadEvents && window.PortalEvents?.renderEventsGrid){
      const items = await window.PortalEvents.loadEvents();
      window.PortalEvents.renderEventsGrid('eventsGrid', items);
      window.PortalEvents?.setupLightbox?.();
    }else{
      console.error('PortalEvents is not available');
      fallbackEvents('イベント情報の取得に失敗しました。');
    }
  }catch(err){
    console.error('events load failed:', err);
    fallbackEvents('イベント情報の取得に失敗しました。');
  }

  await loadEventSchedule();
});
