// /assets/js/core.js
(function(){
  function escapeHtml(str){
    return String(str ?? '').replace(/[&<>"]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
    }[s]));
  }

  function normalizeHeader(s){
    let t = String(s ?? '');
    if(t && t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
    return t.trim().toLowerCase();
  }

  async function fetchTextWithTimeout(url, ms=10000){
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), ms);
    try{
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now(), {
        cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return await res.text();
    } finally { clearTimeout(id); }
  }

  async function fetchJsonWithTimeout(url, ms=10000){
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), ms);
    try{
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now(), {
        cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally { clearTimeout(id); }
  }

  async function tryLoadCSV(primaryUrl, altUrl){
    try{
      return await fetchTextWithTimeout(primaryUrl, 10000);
    }catch(e){
      try{
        return await fetchTextWithTimeout(altUrl, 10000);
      }catch(e2){
        return '';
      }
    }
  }

  // シンプルCSVパーサ（あなたの既存に近い）
  function parseCSV(text){
    if(!text) return [];
    const trimmed = String(text).replace(/^\s+/, '');
    const firstLine = trimmed.split(/\r\n|\n|\r/, 1)[0] || '';
    const candidates = [',',';','\t'];
    let delim = ','; let maxHits = -1;
    for(const c of candidates){
      const hits = (firstLine.match(new RegExp("\\\\"+c, 'g'))||[]).length;
      if(hits > maxHits){ maxHits = hits; delim = c; }
    }

    const rows=[]; let i=0, field='', row=[], inQ=false;
    while(i < trimmed.length){
      const ch = trimmed[i];
      if(inQ){
        if(ch === '"'){
          if(trimmed[i+1] === '"'){ field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += ch; i++; continue;
      }
      if(ch === '"'){ inQ = true; i++; continue; }
      if(ch === delim){ row.push(field); field=''; i++; continue; }
      if(ch === '\n' || ch === '\r'){
        if(ch === '\r' && trimmed[i+1] === '\n') i++;
        const joined = row.concat(field).join('').trim();
        if(joined !== ''){
          const head = (row[0] ?? field).trim();
          if(!/^#/.test(head)) rows.push(row.concat(field));
        }
        row=[]; field=''; i++; continue;
      }
      field += ch; i++;
    }
    if(field !== '' || row.length){ rows.push(row.concat(field)); }
    return rows.filter(r => (r.join('').trim() !== ''));
  }

  function csvToNewsObjects(csv){
    const rows = parseCSV(csv);
    if(!rows.length) return [];
    const h = rows[0].map(normalizeHeader);
    const idx = (keys)=>{ for(const k of keys){ const i=h.indexOf(k); if(i!==-1) return i; } return -1; };
    const di = idx(['date','掲載日','更新日','published','publish_date','day']);
    const li = idx(['label','ラベル','タグ','category','type']);
    const ti = idx(['text','本文','お知らせ','内容','body','message','detail','詳細','content']);
    return rows.slice(1)
      .map(r => ({
        date: di>-1 ? String(r[di]||'').trim() : '',
        label: li>-1 ? String(r[li]||'').trim() : '',
        text: ti>-1 ? String(r[ti]||'').trim() : ''
      }))
      .filter(o => o.date || o.text);
  }

  function csvToEventObjects(csv){
    const rows=parseCSV(csv); if(!rows.length) return [];
    const h=rows[0].map(normalizeHeader);
    const idx=(keys)=>{for(const k of keys){const i=h.indexOf(k); if(i!==-1) return i;} return -1;};
    const ti=idx(['title','タイトル','件名','イベント名','name']);
    const di=idx(['datetext','date','日付','期間','date_text','dates']);
    const ii=idx(['image','画像','img','imageurl','image_url','thumbnail','thumb']);
    const ai=idx(['alt','代替','代替テキスト','alttext','alt_text']);
    const ci=idx(['chip','タグ','tag','ラベル','category']);
    const linki=idx(['link','url','リンク']);
    return rows.slice(1).map(r=>({
      title:ti>-1?r[ti]:'',
      datetext:di>-1?r[di]:'',
      image:ii>-1?r[ii]:'',
      alt:ai>-1?r[ai]:'',
      chip:ci>-1?r[ci]:'',
      link:linki>-1?r[linki]:''
    })).filter(o => (String(o.title||'').trim()!=='' || String(o.image||'').trim()!==''));
  }

  function csvToGoodsObjects(csv){
    const rows = parseCSV(csv);
    if(!rows.length) return [];

    const scoreHeader = (r)=>{
      const line = (r||[]).map(c=>normalizeHeader(c)).join(',');
      let s = 0;
      if(line.includes('配布')) s += 3;
      if(line.includes('グッズ')) s += 2;
      if(line.includes('イベント')) s += 2;
      if(line.includes('start')) s += 1;
      if(line.includes('end')) s += 1;
      return s;
    };

    let headerRow = rows[0];
    let headerIndex = 0;
    let bestScore = scoreHeader(headerRow);

    for(let i=1; i<Math.min(rows.length, 10); i++){
      const sc = scoreHeader(rows[i]);
      if(sc > bestScore){
        bestScore = sc;
        headerRow = rows[i];
        headerIndex = i;
      }
    }

    const h = headerRow.map(normalizeHeader);
    const idx = (keys)=>{
      for(const k of keys){
        const kk = normalizeHeader(k);
        const i = h.indexOf(kk);
        if(i !== -1) return i;
      }
      return -1;
    };

    let startIdx = idx(['配布開始日','開始日','配布開始','start','startdate','start_date','from','配布開始日付']);
    let eventIdx = idx(['イベント名','イベント','event','eventname','event_name','title','企画名']);
    let nameIdx  = idx(['グッズ名','グッズ','配布物','goods','goodsname','goods_name','name','item','品名']);
    let endIdx   = idx(['配布終了日','終了日','配布終了','end','enddate','end_date','to','配布終了日付']);
    let noteIdx  = idx(['備考','メモ','note','remarks','補足']);

    if(startIdx === -1) startIdx = 0;
    if(eventIdx === -1) eventIdx = 1;
    if(nameIdx  === -1) nameIdx  = 2;
    if(endIdx   === -1) endIdx   = 3;
    if(noteIdx  === -1) noteIdx  = 4;

    const startAt = headerIndex + 1;

    return rows.slice(startAt)
      .map(r=>({
        start: startIdx>-1 ? String(r[startIdx]||'').trim() : '',
        event: eventIdx>-1 ? String(r[eventIdx]||'').trim() : '',
        name:  nameIdx>-1  ? String(r[nameIdx] ||'').trim() : '',
        end:   endIdx>-1   ? String(r[endIdx]  ||'').trim() : '',
        note:  noteIdx>-1  ? String(r[noteIdx] ||'').trim() : ''
      }))
      .filter(o => o.start || o.event || o.name || o.end || o.note);
  }

  function parseSheetDateToJsDate(s){
    const raw = String(s ?? '').trim();
    if(!raw) return null;

    const maybeNum = Number(raw);
    if(!Number.isNaN(maybeNum) && maybeNum > 20000 && maybeNum < 60000){
      const base = new Date(Date.UTC(1899,11,30));
      return new Date(base.getTime() + maybeNum * 86400000);
    }

    const z2h = (t)=>t.replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0)-0xFEE0));
    let str = z2h(raw)
      .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
      .replace(/\u00A0|\u3000/g, ' ')
      .replace(/[（）\(\)]/g, ' ')
      .replace(/[月火水木金土日]曜?/g, ' ')
      .replace(/[年\.]/g, '/')
      .replace(/月/g, '/')
      .replace(/日/g, ' ')
      .replace(/-/g, '/')
      .replace(/\s+/g, ' ')
      .trim();

    const parts = str.includes('/') ? str.split('/') : str.split(' ');
    const nums = parts.map(p => p.trim()).filter(Boolean).flatMap(p => p.match(/\d{1,4}/g) || []);

    if(nums.length >= 3){
      const last = nums.length - 1;
      const d = Number(nums[last]);
      const m = Number(nums[last-1]);
      let y = Number(nums[last-2]);
      if(!(y >= 1000 && y <= 9999)) y = new Date().getFullYear();
      if(m>=1 && m<=12 && d>=1 && d<=31) return new Date(`${y}/${m}/${d}`);
    }
    if(nums.length === 2){
      const y = new Date().getFullYear();
      const m = Number(nums[0]);
      const d = Number(nums[1]);
      if(m>=1 && m<=12 && d>=1 && d<=31) return new Date(`${y}/${m}/${d}`);
    }
    const m2 = str.match(/(\d{1,4})[\/ ]?(\d{1,2})[\/ ]?(\d{1,2})/);
    if(m2){
      const y = m2[1].length===4 ? Number(m2[1]) : new Date().getFullYear();
      const m = Number(m2[2]); const d = Number(m2[3]);
      if(m>=1 && m<=12 && d>=1 && d<=31) return new Date(`${y}/${m}/${d}`);
    }
    return null;
  }

  function formatDateJPWithWeekday(rawDateStr){
    const d = parseSheetDateToJsDate(rawDateStr);
    if(!d) return String(rawDateStr ?? '');
    const wd = ['日','月','火','水','木','金','土'][d.getDay()];
    const y  = d.getFullYear();
    const m  = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${y}/${m}/${dd}(${wd})`;
  }

  function setupReveal(){
    const els = Array.from(document.querySelectorAll('.reveal'));
    if(!els.length) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    }, {threshold: 0.12});
    els.forEach(el=>io.observe(el));
  }

  function trapFocus(container, first){
    const focusables = container.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if(!focusables.length) return;
    const firstEl = first || focusables[0];
    const lastEl = focusables[focusables.length-1];

    function onKey(e){
      if(e.key === 'Tab'){
        if(e.shiftKey && document.activeElement === firstEl){
          e.preventDefault(); lastEl.focus();
        }else if(!e.shiftKey && document.activeElement === lastEl){
          e.preventDefault(); firstEl.focus();
        }
      }
      if(e.key === 'Escape'){
        if(container.classList.contains('open')){
          container.classList.remove('open');
          container.setAttribute('aria-hidden','true');
          document.body.style.overflow='';
        }
      }
    }
    container.addEventListener('keydown', onKey);
  }

  function setupDrawer(){
    const btnMenu = document.getElementById('btnMenu');
    const drawer  = document.getElementById('drawer');
    const btnClose= document.getElementById('btnClose');
    if(!btnMenu || !drawer || !btnClose) return;

    const toggleDrawer=(open)=>{
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      btnMenu.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if(open){
        drawer.querySelector('a')?.focus();
        trapFocus(drawer, drawer.querySelector('a'));
      }else{
        btnMenu.focus();
      }
    };

    btnMenu.addEventListener('click', ()=>toggleDrawer(true));
    btnClose.addEventListener('click', ()=>toggleDrawer(false));
    drawer.addEventListener('click', (e)=>{ if(e.target.tagName === 'A') toggleDrawer(false); });
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && drawer.classList.contains('open')) toggleDrawer(false); });
  }

  function toggleModal(el, open){
    if(!el) return;
    el.classList.toggle('open', open);
    el.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if(open) trapFocus(el, el.querySelector('.close'));
  }

  function setupCommonFooterYear(){
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  }

  window.PortalCore = {
    escapeHtml,
    normalizeHeader,
    fetchTextWithTimeout,
    fetchJsonWithTimeout,
    tryLoadCSV,
    parseCSV,
    csvToNewsObjects,
    csvToEventObjects,
    csvToGoodsObjects,
    parseSheetDateToJsDate,
    formatDateJPWithWeekday,
    setupReveal,
    setupDrawer,
    toggleModal,
    setupCommonFooterYear
  };
})();
