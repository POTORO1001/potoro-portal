// /assets/js/recruit-float.js
(function(){
  const recruitMessages = [
    'メイドさん大募集中☆<br>今すぐ応募はこちら！',
    '未経験でも大丈夫♡<br>一緒にお給仕しませんか？',
    'ノルマなしで安心♪<br>今すぐ応募できます！'
  ];

  const recruitLink = document.querySelector('.recruit-float a');
  if(recruitLink){
    const randomIndex = Math.floor(Math.random() * recruitMessages.length);
    recruitLink.innerHTML = recruitMessages[randomIndex];
  }
})();
