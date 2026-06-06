// /assets/js/goods-page.js
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
        <a href="news.html">お知らせを見る</a>
        <a href="events.html">イベントを見る</a>
      </div>
    `;
  }

  function fallbackGoods(message){
    const tbody = document.getElementById('goodsBody');
    if(!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="data-fallback">
            <div class="data-fallback-title">グッズ情報を取得できませんでした</div>
            <p class="data-fallback-text">${escapeHtml(message)} 最新情報はXでも確認できます。</p>
            ${actionLinks()}
          </div>
        </td>
      </tr>
    `;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if(!window.PortalCore){
      console.error('PortalCore is not defined');
      fallbackGoods('ページの読み込み中に問題が発生しました。');
      return;
    }

    PortalCore.setupReveal();
    PortalCore.setupDrawer();
    PortalCore.setupCommonFooterYear();

    try{
      if(window.PortalGoods?.loadGoods && window.PortalGoods?.renderGoodsTable){
        const items = await window.PortalGoods.loadGoods();
        window.PortalGoods.renderGoodsTable('goodsBody', items);
      }else{
        console.error('PortalGoods is not available');
        fallbackGoods('ページの読み込み中に問題が発生しました。');
      }
    }catch(err){
      console.error('goods load failed:', err);
      fallbackGoods('ページの読み込み中に問題が発生しました。');
    }
  });
})();
