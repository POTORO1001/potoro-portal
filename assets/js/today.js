// /assets/js/today.js
(function(){
  const { fetchJsonWithTimeout, parseSheetDateToJsDate } = window.PortalCore;

  function buildDateText(day){
    const dObj = parseSheetDateToJsDate(day.date) || new Date();
    const wd = day.dow || ['日','月','火','水','木','金','土'][dObj.getDay()];
    const y  = dObj.getFullYear();
    const m  = String(dObj.getMonth()+1).padStart(2,'0');
    const dd = String(dObj.getDate()).padStart(2,'0');
    return `${y}/${m}/${dd}(${wd})`;
  }

  function ensureChan(name){
    const base = String(name||'').trim();
    if(!base) return '';
    return base.endsWith('ちゃん') ? base : base + 'ちゃん';
  }

  function normalizeText(v){
    return String(v ?? '').trim();
  }

  function isClosedLabel(name){
    return normalizeText(name) === 'お屋敷休館日';
  }

  function isOffRow(row){
    const s = normalizeText(row?.start);
    const e = normalizeText(row?.end);
    const note = normalizeText(row?.note);
    return (row?.off === true) || note === 'おやすみ' || (!s && !e);
  }

  function setReserveButton(){
    const btn = document.getElementById('reserveBtn');
    if(!btn) return;
    const cfg = window.PORTAL_CONFIG?.reserve || {};
    if(cfg.mode === "form" && cfg.formUrl){
      btn.href = cfg.formUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.setAttribute('aria-label','予約フォームを開く');
      btn.textContent = "📝 予約フォーム";
    }else{
      btn.href = cfg.xProfileUrl || "https://x.com/po_toro";
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.setAttribute('aria-label','XのDMで予約する（PO・TORO公式Xへ）');
      btn.textContent = "💌 ご予約はDM";
    }
  }

  async function fetchTodayOnce(){
    const apiBase = window.PORTAL_CONFIG?.scheduleApiUrl;
    if(!apiBase) return null;
    try{
      // キャッシュ事故避け（GAS/ブラウザ両方に効く）
      const url = `${apiBase}?mode=today&ts=${Date.now()}`;
      const data = await fetchJsonWithTimeout(url, 10000);
      if(!data || data.ok !== true) return null;
      const day = (data.days && data.days[0]) ? data.days[0] : null;
      return day || null;
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

    // 休館日ラベル行は除外
    const maids = rawMaids.filter(m => !isClosedLabel(m?.maid));

    // 休館日（= お屋敷休館日しか無い、または0件）
    if(maids.length === 0){
      el.textContent = `${dateText}（休館日）`;
      return;
    }

    // 営業時間は「実際に start/end がある子」だけで計算
    const times = maids
      .map(m => ({
        start: normalizeText(m?.start),
        end: normalizeText(m?.end),
        off: isOffRow(m)
      }))
      .filter(t => !t.off && t.start && t.end);

    // 全員おやすみ / 全員時間未設定
    if(!times.length){
      el.textContent = `${dateText}（営業時間は店頭/DMでご確認ください）`;
      return;
    }

    times.sort((a,b)=> a.start.localeCompare(b.start));
    const open = times[0].start;
    const close = times.reduce((mx,t)=> (t.end > mx ? t.end : mx), times[0].end);

    el.textContent = `${dateText}  ${open}–${close}`;
  }

  function renderTodayMaids(day){
    const wrap = document.getElementById('todayMaidsWrap');
    if(!wrap) return;

    const rawMaids = (day && Array.isArray(day.maids)) ? day.maids : [];

    // 「お屋敷休館日」行は個人表示から除外
    const maids = rawMaids.filter(m => !isClosedLabel(m?.maid));

    // 休館日
    if(maids.length === 0){
      wrap.innerHTML = '<div class="maids-fallback">本日はお屋敷休館日です</div>';
      return;
    }

    wrap.innerHTML = maids.map(r=>{
      const safeName = ensureChan(r.maid);
      const s = normalizeText(r.start);
      const e = normalizeText(r.end);
      const note = normalizeText(r.note);
      const isOff = isOffRow(r);

      const time = isOff
        ? 'おやすみ'
        : (note || (s && e ? `${s}–${e}` : '時間未設定'));

      return `
        <div class="today-maid">
          <span class="maid-name">${safeName}</span>
          <span class="maid-time ${isOff ? 'is-off' : ''}">${time}</span>
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
