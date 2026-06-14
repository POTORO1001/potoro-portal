// /assets/js/omikuji.js
document.addEventListener('DOMContentLoaded', () => {
  window.PortalCore?.setupReveal?.();
  window.PortalCore?.setupDrawer?.();
  window.PortalCore?.setupCommonFooterYear?.();

  const fortunes = [
    {
      rank: '大吉',
      message: '運気はとても良好です。迷っていたことは、前向きに一歩進めるとよい流れに乗れそうです。',
      overall: '前向きに動くほど運気上昇',
      love: '素直な言葉が好印象',
      money: '必要な出費がよい形に',
      work: '新しい提案が通りやすい日',
      action: '今日やりたいことをひとつ決める',
      linkText: '今日の予定',
      href: 'schedule.html'
    },
    {
      rank: '中吉',
      message: '穏やかな追い風があります。焦らず選べば、ちょうどよい答えにたどり着けそうです。',
      overall: '落ち着いた判断が幸運を呼ぶ',
      love: '聞き役に回ると距離が縮まる',
      money: '買う前の確認が吉',
      work: '順番を整えると進みます',
      action: '気になる情報を軽く確認する',
      linkText: '気になる情報',
      href: 'events.html'
    },
    {
      rank: '小吉',
      message: '小さな良いことを拾える日です。無理に広げず、身近なことを丁寧にすると吉。',
      overall: '身近な用事ほど丁寧に',
      love: '短い連絡に温かさを添えて',
      money: '少額の見直しが効果的',
      work: '基本作業が評価につながる',
      action: '今日の予定をシンプルに整える',
      linkText: '来店前の確認',
      href: 'price.html'
    },
    {
      rank: '吉',
      message: '安定した運勢です。いつも通りのことを大切にすると、自然と気分が整います。',
      overall: 'いつも通りが一番の近道',
      love: '自然体の会話が心地よい日',
      money: '無理のない範囲で楽しめます',
      work: '慣れた作業で力を発揮',
      action: '無理なくできることから始める',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '末吉',
      message: '今は準備が実を結ぶ前の段階です。急がず整えておくと、あとから良い流れが来ます。',
      overall: '準備を整えるほど安心',
      love: '焦らない姿勢が好印象',
      money: '支払い予定の確認を',
      work: '下準備が後で効いてきます',
      action: '先の予定をひとつ確認する',
      linkText: '予定を見る',
      href: 'schedule.html'
    },
    {
      rank: '半吉',
      message: '良い面と注意点が半分ずつの日です。勢いよりも、確認をひとつ増やすと安心です。',
      overall: '慎重さが味方になります',
      love: '言葉の選び方をやさしく',
      money: '衝動買いは一呼吸置いて',
      work: '確認を増やすと安定',
      action: '出かける前に場所と時間を確認する',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '末小吉',
      message: '控えめながら運は上向きです。今日は大きな決断より、気分を軽くする行動が吉。',
      overall: '小さな改善に運があります',
      love: '穏やかな返事がよい流れに',
      money: '使い道を絞ると安心',
      work: '短時間の集中が成果に',
      action: '短い気分転換を入れる',
      linkText: 'ゲーム/診断',
      href: 'games.html'
    },
    {
      rank: '平吉',
      message: '波は少なく、落ち着いて過ごせる日です。普段のペースを守るほど安定します。',
      overall: '平常心がいちばんの開運',
      love: '無理に飾らず自然体で',
      money: '定番の選択が無難',
      work: '予定通りに進めると吉',
      action: '予定を詰め込みすぎない',
      linkText: '料金詳細',
      href: 'price.html'
    },
    {
      rank: '向吉',
      message: 'これから良い方向へ向かう兆しがあります。小さなきっかけを見逃さないで。',
      overall: '良い方向へ動き始めます',
      love: '気になる人に一言を',
      money: '今後に役立つ出費は吉',
      work: '新しい相談が進展の鍵',
      action: '気になった予定をメモする',
      linkText: 'イベント',
      href: 'events.html'
    },
    {
      rank: '開運吉',
      message: '新しい流れを呼び込みやすい日です。いつもと少し違う選択が運気を開きます。',
      overall: '新しい選択に追い風',
      love: '初めての話題が盛り上がる',
      money: '価値ある買い物に出会うかも',
      work: '改善案を出すと好感触',
      action: '普段見ないページを開いてみる',
      linkText: 'グッズ',
      href: 'goods.html'
    },
    {
      rank: '勝負吉',
      message: 'ここぞという場面に強い日です。ただし勢いだけでなく、最後の確認が勝ちを呼びます。',
      overall: '決める場面で力を発揮',
      love: '率直な誘いが届きやすい',
      money: 'メリハリのある使い方を',
      work: '大事な連絡は早めに',
      action: '決める前に一度だけ見直す',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '縁吉',
      message: '人との縁がやわらかく広がりそうです。挨拶や短い会話を大切にすると吉。',
      overall: '人とのつながりが幸運に',
      love: '会話のきっかけが増えます',
      money: '人のおすすめに良縁あり',
      work: '相談すると道が開けます',
      action: '会いたい人や話したいことを思い出す',
      linkText: '予定を見る',
      href: 'schedule.html'
    },
    {
      rank: '健康吉',
      message: '体調を整えるほど運気も整う日です。休憩、水分、早めの移動が良い味方になります。',
      overall: '体を整えると運も整う',
      love: '無理のない予定が好印象',
      money: '健康に関する出費は吉',
      work: '休憩後に集中力が戻ります',
      action: '無理のない予定にする',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '金運吉',
      message: 'お金まわりは計画性が吉。使う前に上限を決めておくと、満足感が残りそうです。',
      overall: '計画的に動くほど安定',
      love: 'おごりすぎず自然な配慮を',
      money: '予算を決めると強い日',
      work: '数字の確認が成果に直結',
      action: '予算を確認してから楽しむ',
      linkText: '料金詳細',
      href: 'price.html'
    },
    {
      rank: '学び吉',
      message: '新しい知識が役に立つ日です。気になることを少し調べるだけでも収穫があります。',
      overall: '知ることが開運になります',
      love: '相手の好みを知ると前進',
      money: '比較して選ぶと満足',
      work: '学んだことをすぐ使えます',
      action: '初めて見る情報をひとつ読む',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '旅吉',
      message: '移動や寄り道に小さな発見がありそうです。時間に余裕を持つと運が味方します。',
      overall: '移動先に小さな発見',
      love: '一緒に出かける話が吉',
      money: '交通費や時間の確認を',
      work: '外の情報からヒントが',
      action: '行き方を先に確認する',
      linkText: 'アクセス',
      href: 'index.html#access'
    },
    {
      rank: '仕事吉',
      message: '集中力が出やすい日です。先に片づけたいことを一つ終えると、気持ちよく過ごせます。',
      overall: 'やるべきことが進みます',
      love: '忙しさの中にも一言を',
      money: '仕事道具の見直しが吉',
      work: '最重要タスクから着手',
      action: '用事をひとつ終えてから楽しむ',
      linkText: 'イベント',
      href: 'events.html'
    },
    {
      rank: '恋吉',
      message: '好意や感謝が伝わりやすい日です。言葉を少しやさしくすると、空気が明るくなります。',
      overall: 'やさしい雰囲気が広がる日',
      love: '感謝を伝えるほど良好',
      money: '相手への小さな気遣いが吉',
      work: '協力関係がなめらかに',
      action: 'ありがとうを一回多く伝える',
      linkText: 'お知らせ',
      href: 'news.html'
    },
    {
      rank: '休息吉',
      message: '休むことで運気が戻る日です。がんばりすぎず、心地よい時間を選ぶと吉。',
      overall: '休むほど運気が回復',
      love: '落ち着いた返事が安心感に',
      money: '今日は無理に使わず整える',
      work: '抱え込みすぎないこと',
      action: '短くても落ち着ける時間を作る',
      linkText: 'ゲーム/診断',
      href: 'games.html'
    },
    {
      rank: '慎重吉',
      message: '慎重さが運を守ってくれる日です。焦らず確認すれば、余計な不安を避けられます。',
      overall: '確認が幸運を守ります',
      love: '急がず丁寧に向き合って',
      money: '契約や購入は細部確認を',
      work: 'ダブルチェックが大切',
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
  const overall = document.getElementById('fortuneOverall');
  const love = document.getElementById('fortuneLove');
  const money = document.getElementById('fortuneMoney');
  const work = document.getElementById('fortuneWork');
  const action = document.getElementById('fortuneAction');
  const linkText = document.getElementById('fortuneLinkText');
  const link = document.getElementById('fortuneLink');

  if (!button || !card || !paper || !mark || !rank || !message || !overall || !love || !money || !work || !action || !linkText || !link) return;

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
    overall.textContent = fortune.overall;
    love.textContent = fortune.love;
    money.textContent = fortune.money;
    work.textContent = fortune.work;
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
    overall.textContent = '-';
    love.textContent = '-';
    money.textContent = '-';
    work.textContent = '-';
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
