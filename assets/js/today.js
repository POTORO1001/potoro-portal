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

    const times = maids
      .map(maid => ({
        start: normalizeText(maid?.start),
        end: normalizeText(maid?.end),
        off: isOffRow(maid)
      }))
      .filter(time => !time.off && time.start && time.end);

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
  }

  window.PortalToday = { initToday };
})();
