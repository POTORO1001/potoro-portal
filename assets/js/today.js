// /assets/js/today.js
(function(){
  const { fetchJsonWithTimeout, parseSheetDateToJsDate } = window.PortalCore;

  function buildDateText(day){
    const dateObj = parseSheetDateToJsDate(day.date) || new Date();
    const weekday = day.dow || ['日','月','火','水','木','金','土'][dateObj.getDay()];
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2,'0');
    const date = String(dateObj.getDate()).padStart(2,'0');
    return `${year}/${month}/${date}(${weekday})`;
  }

  function ensureChan(name){
    const base = String(name || '').trim();
    if(!base) return '';
    return base.endsWith('ちゃん') ? base : base + 'ちゃん';
  }

  function normalizeText(value){
    return String(value ?? '').trim();
  }

  function isClosedLabel(name){
    return normalizeText(name) === 'お屋敷休館日';
  }

  function isOffRow(row){
    const start = normalizeText(row?.start);
    const end = normalizeText(row?.end);
    const note = normalizeText(row?.note);
    return (row?.off === true) || note === 'おやすみ' || (!start && !end);
  }

  function parseTimeToMinutes(value){
    const text = normalizeText(value).replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));
    const match = text.match(/^(\d{1,2}):(\d{2})/);
    if(!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if(!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
    if(hours === 24 && minutes !== 0) return null;
    return (hours * 60) + minutes;
  }

  function getWorkingMaidTimes(day){
    const rawMaids = Array.isArray(day?.maids) ? day.maids : [];
    return rawMaids
      .filter(maid => !isClosedLabel(maid?.maid))
      .map(maid => ({
        start: normalizeText(maid?.start),
        end: normalizeText(maid?.end),
        startMinutes: parseTimeToMinutes(maid?.start),
        endMinutes: parseTimeToMinutes(maid?.end),
        off: isOffRow(maid)
      }))
      .filter(time => !time.off && time.start && time.end && time.startMinutes !== null && time.endMinutes !== null);
  }

  function isSameLocalDate(a, b){
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  function isAfterBusinessEndBeforeMidnight(day, now = new Date()){
    const dateObj = parseSheetDateToJsDate(day?.date);
    if(!dateObj || !isSameLocalDate(dateObj, now)) return false;
    const times = getWorkingMaidTimes(day);
    if(!times.length) return false;
    const closeMinutes = Math.max(...times.map(time => time.endMinutes));
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    return nowMinutes >= closeMinutes && nowMinutes < 24 * 60;
  }

  function setReserveButton(){
    const btn = document.getElementById('reserveBtn');
    if(!btn) return;
    const cfg = window.PORTAL_CONFIG?.reserve || {};
    if(cfg.mode === 'form' && cfg.formUrl){
      btn.href = cfg.formUrl;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.setAttribute('aria-label','予約フォームを開く');
      btn.textContent = '予約フォーム';
    }else{
      btn.href = cfg.xProfileUrl || 'https://x.com/po_toro';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.setAttribute('aria-label','XのDMで予約する（PO・TORO公式へ）');
      btn.textContent = '💌 ご予約はDM';
    }
  }

  async function fetchTodayOnce(){
    const apiBase = window.PORTAL_CONFIG?.scheduleApiUrl;
    if(!apiBase) return null;
    try{
      const url = `${apiBase}?mode=today&ts=${Date.now()}`;
      const data = await fetchJsonWithTimeout(url, 10000);
      if(!data || data.ok !== true) return null;
      return (data.days && data.days[0]) ? data.days[0] : null;
    }catch(e){
      return null;
    }
  }

  function renderTodayHours(day){
    const el = document.getElementById('todayHours');
    if(!el) return;

    if(!day){
      el.textContent = '本日の営業情報は未登録です（DMでご確認ください）';
      return;
    }

    const dateText = buildDateText(day);
    const rawMaids = Array.isArray(day.maids) ? day.maids : [];
    const maids = rawMaids.filter(maid => !isClosedLabel(maid?.maid));

    if(maids.length === 0){
      el.textContent = `${dateText}（休館日）`;
      return;
    }

    const times = getWorkingMaidTimes(day);

    if(!times.length){
      el.textContent = `${dateText}（営業時間は店頭/DMでご確認ください）`;
      return;
    }

    times.sort((a,b)=> a.start.localeCompare(b.start));
    const open = times[0].start;
    const close = times.reduce((max,time)=> (time.end > max ? time.end : max), times[0].end);

    el.textContent = `${dateText}  ${open}〜${close}`;
  }

  function renderTodayMaids(day){
    const wrap = document.getElementById('todayMaidsWrap');
    if(!wrap) return;

    const rawMaids = (day && Array.isArray(day.maids)) ? day.maids : [];
    const maids = rawMaids.filter(maid => !isClosedLabel(maid?.maid));

    if(maids.length === 0){
      wrap.innerHTML = '<div class="maids-fallback">本日はお屋敷休館日です</div>';
      return;
    }

    if(isAfterBusinessEndBeforeMidnight(day)){
      wrap.innerHTML = `
        <div class="maids-closed">
          <strong>本日の営業は終了しました</strong>
          <span>本日のお給仕メイドちゃんの表示は終了しています。0時以降に本日の予定へ切り替わります。</span>
        </div>
      `;
      return;
    }

    wrap.innerHTML = maids.map(row=>{
      const safeName = ensureChan(row.maid);
      const start = normalizeText(row.start);
      const end = normalizeText(row.end);
      const note = normalizeText(row.note);
      const off = isOffRow(row);

      const time = off
        ? 'おやすみ'
        : (note || (start && end ? `${start}〜${end}` : '時間未設定'));

      return `
        <div class="today-maid">
          <span class="maid-name">${safeName}</span>
          <span class="maid-time ${off ? 'is-off' : ''}">${time}</span>
        </div>
      `;
    }).join('');
  }

  async function initToday(){
    setReserveButton();
    const day = await fetchTodayOnce();
    renderTodayHours(day);
    renderTodayMaids(day);
    window.PortalTodayDay = day;
    window.dispatchEvent(new CustomEvent('portal:today-ready', { detail: { day } }));
    return day;
  }

  window.PortalToday = { initToday };
})();
