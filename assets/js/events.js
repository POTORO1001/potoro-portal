// /assets/js/events.js
(function(){
  const { tryLoadCSV, csvToEventObjects, escapeHtml } = window.PortalCore;

  function actionLinks(links){
    return `<div class="fallback-actions">${links.map(link =>
      `<a href="${escapeHtml(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(link.label)}</a>`
    ).join('')}</div>`;
  }

  function eventsFallback(title, text, links){
    return `
      <div class="data-fallback">
        <div class="data-fallback-title">${escapeHtml(title)}</div>
        <p class="data-fallback-text">${escapeHtml(text)}</p>
        ${actionLinks(links)}
      </div>
    `;
  }

  async function loadEvents(){
    const cfg = window.PORTAL_CONFIG || {};
    try{
      const csv = await tryLoadCSV(cfg.eventsCsvUrl, cfg.eventsCsvUrlAlt);
      if(!csv){
        console.error('events CSV could not be loaded', {
          eventsCsvUrl: cfg.eventsCsvUrl,
          eventsCsvUrlAlt: cfg.eventsCsvUrlAlt
        });
        return null;
      }
      return csvToEventObjects(csv) || [];
    }catch(err){
      console.error('loadEvents failed:', err);
      return null;
    }
  }

  function renderEventsGrid(containerId, items){
    const grid = document.getElementById(containerId);
    if(!grid) return;

    if(items === null){
      grid.innerHTML = eventsFallback(
        'イベント情報を取得できませんでした',
        '最新の開催情報はXやお知らせでも案内しています。時間をおいて再読み込みするか、下のリンクから確認してください。',
        [
          { href: 'https://x.com/po_toro', label: 'Xで最新情報を見る', external: true },
          { href: 'news.html', label: 'お知らせを見る' },
          { href: 'schedule.html', label: '週間お給仕表を見る' }
        ]
      );
      return;
    }

    const safeItems = Array.isArray(items) ? items : [];

    if(!safeItems.length){
      grid.innerHTML = eventsFallback(
        '現在表示できるイベントはありません',
        '営業日や最新のお知らせを確認して、次の来店予定を探せます。',
        [
          { href: 'schedule.html', label: '週間お給仕表を見る' },
          { href: 'news.html', label: 'お知らせを見る' },
          { href: 'price.html', label: '料金詳細を見る' }
        ]
      );
      return;
    }

    const encodeLocalImageUrl = (src)=>{
      const value = String(src || '').trim();
      return /^img\//i.test(value) ? encodeURI(value) : value;
    };

    const getEventWebpSrc = (src)=>{
      const value = String(src || '').trim();
      if(!/^img\/event.+\.(png|jpe?g)$/i.test(value)) return '';
      return value + '.webp';
    };

    grid.innerHTML = safeItems.map((event, index)=>{
      const rawImgSrc = event.image || 'img/ogp.jpg';
      const imgSrc = escapeHtml(encodeLocalImageUrl(rawImgSrc));
      const webpSrc = escapeHtml(encodeLocalImageUrl(getEventWebpSrc(rawImgSrc)));
      const title = escapeHtml(event.title || '');
      const date = escapeHtml(event.datetext || '');
      const chip = event.chip ? `<span class="pill">${escapeHtml(event.chip)}</span>` : '';
      const alt = escapeHtml(event.alt || event.title || 'イベント画像');
      const link = event.link ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer">詳細を見る</a>` : '';
      const featuredClass = index === 0 ? ' featured' : '';
      const imageMarkup = webpSrc
        ? `<button type="button" class="event-image-button" aria-label="${alt}を拡大">
            <picture>
              <source srcset="${webpSrc}" type="image/webp">
              <img src="${imgSrc}" alt="${alt}" class="thumb" data-full="${webpSrc}" loading="lazy" width="1200" height="750" decoding="async">
            </picture>
          </button>`
        : `<button type="button" class="event-image-button" aria-label="${alt}を拡大">
            <img src="${imgSrc}" alt="${alt}" class="thumb" data-full="${imgSrc}" loading="lazy" width="1200" height="750" decoding="async">
          </button>`;

      return `
        <article class="card event-card${featuredClass}">
          ${imageMarkup}
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
    let activeTrigger = null;

    const open = (src, alt, trigger)=>{
      if(!src) return;
      activeTrigger = trigger || document.activeElement;
      img.src = src;
      img.alt = alt || '拡大画像';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = ()=>{
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      img.removeAttribute('src');
      document.body.style.overflow = '';
      if(activeTrigger && typeof activeTrigger.focus === 'function'){
        activeTrigger.focus();
      }
      activeTrigger = null;
    };

    document.getElementById('eventsGrid')?.addEventListener('click', (event)=>{
      const button = event.target.closest('.event-image-button');
      if(!button) return;
      const target = button.querySelector('img');
      if(!target) return;
      open(target.currentSrc || target.getAttribute('data-full') || target.src, target.alt, button);
    });

    lightbox.addEventListener('click', (event)=>{ if(event.target === lightbox) close(); });
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('keydown', (event)=>{
      window.PortalCore?.keepFocusInside?.(lightbox, event);
    });
    window.addEventListener('keydown', (event)=>{
      if(event.key === 'Escape' && lightbox.classList.contains('open')) close();
    });
  }

  window.PortalEvents = { loadEvents, renderEventsGrid, setupLightbox };
})();
