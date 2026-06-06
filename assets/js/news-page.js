// /assets/js/news-page.js
(function(){
  function escapeHtml(str){
    return String(str ?? '').replace(/[&<>"]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
    }[s]));
  }

  function actionLinks(){
    return `
      <div class="fallback-actions">
        <a href="https://x.com/po_toro" target="_blank" rel="noopener noreferrer">Xで最新情報を見る</a>
        <a href="schedule.html">週間お給仕表を見る</a>
        <a href="events.html">イベントを見る</a>
      </div>
    `;
  }

  function fallbackNews(message){
    const ul = document.getElementById('newsList');
    if(!ul) return;
    ul.innerHTML = `
      <li class="data-fallback">
        <div class="data-fallback-title">お知らせを取得できませんでした</div>
        <p class="data-fallback-text">${escapeHtml(message)} 最新情報はXでも確認できます。</p>
        ${actionLinks()}
      </li>
    `;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if(!window.PortalCore){
      console.error('PortalCore is not defined');
      fallbackNews('ページの読み込み中に問題が発生しました。');
      return;
    }

    PortalCore.setupReveal();
    PortalCore.setupDrawer();
    PortalCore.setupCommonFooterYear();

    try{
      if(window.PortalNews?.loadNews && window.PortalNews?.renderNewsList){
        const items = await window.PortalNews.loadNews();
        window.PortalNews.renderNewsList('newsList', items);
      }else{
        console.error('PortalNews is not available');
        fallbackNews('ページの読み込み中に問題が発生しました。');
      }
    }catch(err){
      console.error('news load failed:', err);
      fallbackNews('ページの読み込み中に問題が発生しました。');
    }
  });
})();
