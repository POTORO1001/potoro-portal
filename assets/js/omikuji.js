// /assets/js/omikuji.js
document.addEventListener('DOMContentLoaded', () => {
  window.PortalCore?.setupReveal?.();
  window.PortalCore?.setupDrawer?.();
  window.PortalCore?.setupCommonFooterYear?.();

  const fortunes = [
    {
      mark: '大',
      rank: '大吉',
      message: '今日は思いきって楽しむ日。気になっていた予定をひとつ決めると、よい流れになりそうです。',
      action: '週間お給仕表を見て、行けそうな日を決める',
      linkText: '週間お給仕表',
      href: 'schedule.html'
    },
    {
      mark: '中',
      rank: '中吉',
      message: 'ちょうどよい出会いがありそうな日。イベント情報を見て、気になるきっかけを探してみてください。',
      action: '開催中・近日のイベントをチェックする',
      linkText: 'イベント',
      href: 'events.html'
    },
    {
      mark: '小',
      rank: '小吉',
      message: 'ゆっくり整えるほど運気が上がる日。初めての方は料金や流れを見ておくと安心です。',
      action: '料金と遊び方を確認する',
      linkText: '料金詳細',
      href: 'price.html'
    },
    {
      mark: '萌',
      rank: '萌吉',
      message: '世界観を楽しむほど気分が上がる日。歴代メイド服を眺めると、推しポイントが見つかるかも。',
      action: '歴代メイド服を見る',
      linkText: '歴代メイド服',
      href: 'uniforms.html'
    },
    {
      mark: '縁',
      rank: 'ご縁吉',
      message: '人との会話がよい方向へ転がりそうな日。最新のお知らせから話題を拾うのが吉です。',
      action: 'お知らせを見て話題を準備する',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      mark: '甘',
      rank: '甘やかされ吉',
      message: '今日は少し自分にやさしくしてよい日。予定が合えば、短い時間でも気分転換になりそうです。',
      action: 'アクセスを確認して行き方を決める',
      linkText: 'アクセス',
      href: 'index.html#access'
    }
  ];

  const button = document.getElementById('drawFortune');
  const paper = document.querySelector('.fortune-paper');
  const mark = document.getElementById('fortuneMark');
  const rank = document.getElementById('fortuneRank');
  const message = document.getElementById('fortuneMessage');
  const action = document.getElementById('fortuneAction');
  const linkText = document.getElementById('fortuneLinkText');
  const link = document.getElementById('fortuneLink');

  if (!button || !paper || !mark || !rank || !message || !action || !linkText || !link) return;

  const pickFortune = () => {
    const todayKey = new Date().toLocaleDateString('ja-JP');
    const seed = `${todayKey}:${Math.random()}:${performance.now()}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return fortunes[Math.abs(hash) % fortunes.length];
  };

  const render = (fortune) => {
    mark.textContent = fortune.mark;
    rank.textContent = fortune.rank;
    message.textContent = fortune.message;
    action.textContent = fortune.action;
    linkText.textContent = fortune.linkText;
    link.textContent = `${fortune.linkText}を見る`;
    link.href = fortune.href;
  };

  let drawTimer = null;
  let drawMessageTimer = null;

  button.addEventListener('click', () => {
    if (drawTimer) clearTimeout(drawTimer);
    if (drawMessageTimer) clearTimeout(drawMessageTimer);
    const fortune = pickFortune();

    button.disabled = true;
    paper.setAttribute('aria-busy', 'true');
    paper.classList.remove('is-drawing');
    paper.classList.remove('is-revealed');
    void paper.offsetWidth;
    paper.classList.add('is-drawing');

    mark.textContent = '...';
    rank.textContent = 'おみくじを振っています';
    message.textContent = '紙の向こうから、今日の運勢が近づいています。';
    action.textContent = '-';
    linkText.textContent = '-';

    drawMessageTimer = setTimeout(() => {
      mark.textContent = '!';
      rank.textContent = '運勢を開いています';
      message.textContent = 'もう少しで結果が出ます。';
    }, 620);

    drawTimer = setTimeout(() => {
      render(fortune);
      paper.classList.remove('is-drawing');
      paper.classList.add('is-revealed');
      paper.removeAttribute('aria-busy');
      button.disabled = false;
      drawTimer = null;
      drawMessageTimer = null;
    }, 1180);
  });
});
