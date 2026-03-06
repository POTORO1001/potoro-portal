// /assets/js/events.js
(function(){
  const { tryLoadCSV, csvToEventObjects, escapeHtml } = window.PortalCore;

  async function loadEvents(){
    const cfg = window.PORTAL_CONFIG || {};
    try{
      const csv = await tryLoadCSV(cfg.eventsCsvUrl, cfg.eventsCsvUrlAlt);
      if(!csv){
        console.error('events CSV could not be loaded', {
          eventsCsvUrl: cfg.eventsCsvUrl,
          eventsCsvUrlAlt: cfg.eventsCsvUrlAlt
        });
        return [];
      }
      return csvToEventObjects(csv) || [];
    }catch(err){
      console.error('loadEvents failed:', err);
      return [];
    }
  }

  function renderEventsGrid(containerId, items){
    const g = document.getElementById(containerId);
    if(!g) return;

    const safeItems = Array.isArray(items) ? items : [];

    if(!safeItems.length){
      g.innerHTML = `<div class="tag">イベントは準備中です。</div>`;
      return;
    }

    g.innerHTML = safeItems.map((e, idx)=>{
      const imgSrc = e.image || 'img/ogp.jpg';
      const title  = escapeHtml(e.title||'');
      const date   = escapeHtml(e.datetext||'');
      const chip   = e.chip ? `<span class="pill">${escapeHtml(e.chip)}</span>` : '';
      const alt    = escapeHtml(e.alt||e.title||'イベント画像');
      const link   = e.link ? `<a href="${e.link}" target="_blank" rel="noopener noreferrer">詳細を見る</a>` : '';
      const featuredClass = (idx===0) ? ' featured' : '';

      return `
        <article class="card event-card${featuredClass}">
          <img src="${imgSrc}" alt="${alt}" class="thumb" data-full="${imgSrc}" loading="lazy">
          <div class="event-overlay">
            <div class="meta">
              ${date ? `<span class="pill date">📅 ${date}</span>` : ''}
              ${chip}
            </div>
            <div class="event-title">${title}</div>
            ${link ? `<div class="tag">${link}</div>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function setupLightbox(){
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const closeBtn = lightbox?.querySelector('.close');
    if(!lightbox || !img || !closeBtn) return;

    const open = (src, alt)=>{
      if(!src) return;
      img.src = src;
      img.alt = alt || '拡大画像';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    };

    const close = ()=>{
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      img.removeAttribute('src');
      document.body.style.overflow = '';
    };

    document.getElementById('eventsGrid')?.addEventListener('click', (e)=>{
      const target = e.target.closest('img');
      if(!target) return;
      open(target.getAttribute('data-full') || target.src, target.alt);
    });

    lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) close(); });
    closeBtn.addEventListener('click', close);
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && lightbox.classList.contains('open')) close();
    });
  }

  window.PortalEvents = { loadEvents, renderEventsGrid, setupLightbox };
})();
