// /assets/js/goods-page.js
(function(){
  function fallbackGoods(message){
    const tbody = document.getElementById('goodsBody');
    if(!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    if(!window.PortalCore){
      console.error('PortalCore is not defined');
      fallbackGoods('グッズ情報の取得に失敗しました。');
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
        fallbackGoods('グッズ情報の取得に失敗しました。');
      }
    }catch(err){
      console.error('goods load failed:', err);
      fallbackGoods('グッズ情報の取得に失敗しました。');
    }
  });
})();
