// /assets/js/omikuji.js
document.addEventListener('DOMContentLoaded', () => {
  window.PortalCore?.setupReveal?.();
  window.PortalCore?.setupDrawer?.();
  window.PortalCore?.setupCommonFooterYear?.();

  const fortunes = [
    {
      rank: '大吉',
      message: '運気はとても良好です。迷っていたことは、前向きに一歩進めるとよい流れに乗れそうです。',
      action: '今日やりたいことをひとつ決める',
      linkText: '今日の予定',
      href: 'schedule.html'
    },
    {
      rank: '中吉',
      message: '穏やかな追い風があります。焦らず選べば、ちょうどよい答えにたどり着けそうです。',
      action: '気になる情報を軽く確認する',
      linkText: '気になる情報',
      href: 'events.html'
    },
    {
      rank: '小吉',
      message: '小さな良いことを拾える日です。無理に広げず、身近なことを丁寧にすると吉。',
      action: '今日の予定をシンプルに整える',
      linkText: '来店前の確認',
      href: 'price.html'
    },
    {
      rank: '吉',
      message: '安定した運勢です。いつも通りのことを大切にすると、自然と気分が整います。',
      action: '無理なくできることから始める',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '末吉',
      message: '今は準備が実を結ぶ前の段階です。急がず整えておくと、あとから良い流れが来ます。',
      action: '先の予定をひとつ確認する',
      linkText: '予定を見る',
      href: 'schedule.html'
    },
    {
      rank: '半吉',
      message: '良い面と注意点が半分ずつの日です。勢いよりも、確認をひとつ増やすと安心です。',
      action: '出かける前に場所と時間を確認する',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '末小吉',
      message: '控えめながら運は上向きです。今日は大きな決断より、気分を軽くする行動が吉。',
      action: '短い気分転換を入れる',
      linkText: 'ゲーム/診断',
      href: 'games.html'
    },
    {
      rank: '平吉',
      message: '波は少なく、落ち着いて過ごせる日です。普段のペースを守るほど安定します。',
      action: '予定を詰め込みすぎない',
      linkText: '料金詳細',
      href: 'price.html'
    },
    {
      rank: '向吉',
      message: 'これから良い方向へ向かう兆しがあります。小さなきっかけを見逃さないで。',
      action: '気になった予定をメモする',
      linkText: 'イベント',
      href: 'events.html'
    },
    {
      rank: '開運吉',
      message: '新しい流れを呼び込みやすい日です。いつもと少し違う選択が運気を開きます。',
      action: '普段見ないページを開いてみる',
      linkText: 'グッズ',
      href: 'goods.html'
    },
    {
      rank: '勝負吉',
      message: 'ここぞという場面に強い日です。ただし勢いだけでなく、最後の確認が勝ちを呼びます。',
      action: '決める前に一度だけ見直す',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '縁吉',
      message: '人との縁がやわらかく広がりそうです。挨拶や短い会話を大切にすると吉。',
      action: '会いたい人や話したいことを思い出す',
      linkText: '予定を見る',
      href: 'schedule.html'
    },
    {
      rank: '健康吉',
      message: '体調を整えるほど運気も整う日です。休憩、水分、早めの移動が良い味方になります。',
      action: '無理のない予定にする',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '金運吉',
      message: 'お金まわりは計画性が吉。使う前に上限を決めておくと、満足感が残りそうです。',
      action: '予算を確認してから楽しむ',
      linkText: '料金詳細',
      href: 'price.html'
    },
    {
      rank: '学び吉',
      message: '新しい知識が役に立つ日です。気になることを少し調べるだけでも収穫があります。',
      action: '初めて見る情報をひとつ読む',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '旅吉',
      message: '移動や寄り道に小さな発見がありそうです。時間に余裕を持つと運が味方します。',
      action: '行き方を先に確認する',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '仕事吉',
      message: '集中力が出やすい日です。先に片づけたいことを一つ終えると、気持ちよく過ごせます。',
      action: '用事をひとつ終えてから楽しむ',
      linkText: 'イベント',
      href: 'events.html'
    },
    {
      rank: '恋吉',
      message: '好意や感謝が伝わりやすい日です。言葉を少しやさしくすると、空気が明るくなります。',
      action: 'ありがとうを一回多く伝える',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '休息吉',
      message: '休むことで運気が戻る日です。がんばりすぎず、心地よい時間を選ぶと吉。',
      action: '短くても落ち着ける時間を作る',
      linkText: 'ゲーム/診断',
      href: 'games.html'
    },
    {
      rank: '慎重吉',
      message: '慎重さが運を守ってくれる日です。焦らず確認すれば、余計な不安を避けられます。',
      action: '時間・場所・予算を確認する',
      linkText: '来店前の確認',
      href: 'price.html'
    }
  ];

  const button = document.getElementById('drawFortune');
  const card = document.getElementById('fortuneCard');
  const paper = document.querySelector('.fortune-paper');
  const mark = document.getElementById('fortuneMark');
  const rank = document.getElementById('fortuneRank');
  const message = document.getElementById('fortuneMessage');
  const action = document.getElementById('fortuneAction');
  const linkText = document.getElementById('fortuneLinkText');
  const link = document.getElementById('fortuneLink');

  if (!button || !card || !paper || !mark || !rank || !message || !action || !linkText || !link) return;

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
    mark.textContent = fortune.rank.slice(0, 1);
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
    card.classList.remove('is-revealed');
    card.classList.add('is-drawing');
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
      card.classList.remove('is-drawing');
      card.classList.add('is-revealed');
      paper.classList.remove('is-drawing');
      paper.classList.add('is-revealed');
      paper.removeAttribute('aria-busy');
      button.disabled = false;
      drawTimer = null;
      drawMessageTimer = null;
    }, 1180);
  });
});
