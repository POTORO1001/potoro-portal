// /assets/js/news-page.js
(function(){
  function fallbackNews(message){
    const ul = document.getElementById('newsList');
    if(!ul) return;
    ul.innerHTML = `<li><span class="tag">-</span> ${message}</li>`;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if(!window.PortalCore){
      console.error('PortalCore is not defined');
      fallbackNews('お知らせの取得に失敗しました。');
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
        fallbackNews('お知らせの取得に失敗しました。');
      }
    }catch(err){
      console.error('news load failed:', err);
      fallbackNews('お知らせの取得に失敗しました。');
    }
  });
})();
