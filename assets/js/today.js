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

  function computeOpenClose(day){
    const times = (day.maids || [])
      .map(m => ({ start:String(m.start||'').trim(), end:String(m.end||'').trim() }))
      .filter(t => t.start && t.end);

    if(!times.length) return null;

    times.sort((a,b)=> a.start.localeCompare(b.start));
    const open = times[0].start;
    const close = times.reduce((mx,t)=> (t.end > mx ? t.end : mx), times[0].end);
    return { open, close };
  }

  function ensureChan(name){
    const base = String(name||'').trim();
    if(!base) return '';
    return base.endsWith('ちゃん') ? base : base + 'ちゃん';
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
      const data = await fetchJsonWithTimeout(`${apiBase}?mode=today`, 10000);
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
    const oc = computeOpenClose(day);
    if(!oc){
      el.textContent = `${dateText}（営業時間は店頭/DMでご確認ください）`;
      return;
    }
    el.textContent = `${dateText}  ${oc.open}–${oc.close}`;
  }

  function renderTodayMaids(day){
  const wrap = document.getElementById("todayMaidsWrap");
  if(!wrap) return;

  const maids = (day && Array.isArray(day.maids)) ? day.maids : [];

  // ① 休館日（0人）のとき
  if(maids.length === 0){
    wrap.innerHTML = '<div class="maids-fallback">本日はお屋敷休館日です</div>';
    return;
  }

  // ②（任意）休館日行が明示的に入っている場合も同じ表示にしたいなら
  // if(maids.length === 1 && maids[0].maid === 'お屋敷休館日'){
  //   wrap.innerHTML = '<div class="maids-fallback">本日はお屋敷休館日です</div>';
  //   return;
  // }

    // 休館日（ScheduleDBが "お屋敷休館日" 行を返してきた場合）
if (maids.length === 1 && String(maids[0].maid || '').trim() === 'お屋敷休館日') {
  wrap.innerHTML = '<div class="maids-fallback">本日はお屋敷休館日です</div>';
  return;
}

  wrap.innerHTML = maids.map(r=>{
    const safeName = ensureChan(r.maid);
    const s = String(r.start||'').trim();
    const e = String(r.end||'').trim();
    const isOff = (r.off === true) || (!s && !e);

    const time = isOff
      ? 'おやすみ'
      : ((r.note && String(r.note).trim())
          ? String(r.note).trim()
          : (s && e ? `${s}–${e}` : '時間未設定'));

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
