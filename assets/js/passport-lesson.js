// The full guide stays available when JavaScript is disabled.
(() => {
  'use strict';
  const slides = [
    { chapter: 'はじめに', student: '先輩、ポトロパスポートって何ですか？', teacher: 'ご主人様・お嬢様ご本人専用のデジタル会員証よ。スマホからサービスや特典を確認できるの。一緒に使い方を覚えましょう。' },
    { chapter: 'アカウント', student: 'どうやって作るんですか？お金はかかりますか？', teacher: '無料よ。公式XのDMか、お屋敷のメイドさんに声をかけてね。メールアドレスも電話番号も使わないの。発行された専用URLからマイページに入れるわ。' },
    { chapter: 'アカウント', student: '専用URLは、どうしておけばいいですか？', teacher: 'ブックマークやスマホのホーム画面に追加しておくと便利よ。ご本人様専用だから、他の人への共有やSNSへの掲載は控えてね。分からなくなったらメイドさんへ相談してね。' },
    { chapter: 'できること', student: 'パスポートを開くと、何が見られるんですか？', teacher: '会員証と本人確認用QRコード、チェキ券の残数・有効期限、デジタルチェキ帳、未受取グッズを確認できるわ。入店順抽選への参加・結果確認、バースデー特典の確認もできるの。' },
    { chapter: 'できること', student: '自分らしい見た目にもできますか？', teacher: 'もちろん。アイコン、テーマカラー、会員証フレーム、称号をカスタマイズできるわ。お気に入りの組み合わせを見つけてね。' },
    { chapter: 'お誕生日', student: '誕生日は必ず登録するんですか？', teacher: '登録は任意よ。年は不要で、月日だけを登録するの。ただし登録後は変更できないから、間違いがないかよく確認してね。' },
    { chapter: 'お誕生日', student: 'お誕生日の特典を教えてください！', teacher: 'お誕生月に、デジタルチェキ券を受け取れるわ。ただし、登録月とお誕生月が同じ場合は、その年の特典対象外なの。' },
    { chapter: '確認クイズ 1', student: '条件をちゃんと覚えられたかな？', teacher: 'お誕生日の特典について確認してみましょう。', question: '登録月とお誕生月が同じ場合、その年の特典は？', choices: ['その年も受け取れる', 'その年は対象外'], correct: 1, explanation: '登録月とお誕生月が同じ場合は、その年の特典対象外です。誕生日は登録後に変更できない点も覚えておきましょう。' },
    { chapter: 'チェキ券', student: 'デジタルチェキ券は、いつまで使えますか？', teacher: '付与日から1か月間よ。パスポート内で残数と有効期限を確認してね。' },
    { chapter: 'チェキ券', student: '撮影するときは、どう使うんですか？', teacher: '会員証QRコードを読み取り、支払い方法で「デジタルチェキ券」を選ぶと1枚使用されるわ。現金でのお支払いにも対応しているの。' },
    { chapter: 'チェキ帳', student: '撮影したデジタルチェキは、どこに保存されますか？', teacher: 'ご自身のパスポート内のデジタルチェキ帳よ。ダウンロードや共有機能は設けていないので、パスポートの中で楽しんでね。' },
    { chapter: '確認クイズ 2', student: 'チェキ券を使い忘れないようにしたいです！', teacher: 'では、有効期限を確認しましょう。', question: 'デジタルチェキ券を使える期間は？', choices: ['付与日から1か月間', '有効期限なし', '付与された当日だけ'], correct: 0, explanation: '有効期限は付与日から1か月間です。パスポートで期限を確認してご利用ください。' },
    { chapter: '入店順抽選', student: '入店順抽選は、いつ参加できるんですか？', teacher: '実施する日はパスポートに案内が表示されるわ。原則、OPENの90分前から受付開始、30分前に締切よ。締切後にパスポート上で入店順を確認してね。' },
    { chapter: '入店順抽選', student: '店頭のQRコードをスマホのカメラで読むんですね？', teacher: 'そこは注意！ご自身のパスポート内の「入店順抽選」から、店頭掲示のQRコードを読み取ってね。標準カメラアプリで読むだけでは参加できないの。' },
    { chapter: '入店順抽選', student: 'ご案内対象になったら、いつ行けばいいですか？', teacher: 'OPEN時間までにお屋敷へ来てね。OPEN時点で不在の場合は、その時点でお待ちの方から順にご案内するわ。ご案内対象外でも、通常どおりお並びいただけるの。' },
    { chapter: '確認クイズ 3', student: '抽選の参加方法、もう一度確認したいです！', teacher: 'どちらの方法で参加するか選んでね。', question: '店頭の抽選QRコードを読み取る場所は？', choices: ['スマホの標準カメラアプリ', 'パスポート内の「入店順抽選」'], correct: 1, explanation: 'ご自身のポトロパスポート内「入店順抽選」から読み取ります。標準カメラだけでは参加できません。' },
    { chapter: 'グッズ受取', student: 'まだ受け取っていないグッズも分かりますか？', teacher: 'パスポート内で確認できるわ。受け取りが済んだグッズは一覧から非表示になるの。' },
    { chapter: '困ったとき', student: '表示がおかしいときや、登録内容の相談はどうすれば？', teacher: 'メイドさんか公式XのDMへ連絡してね。専用URLが分からなくなったときも、メイドさんへ気軽に声をかけてね。' },
    { chapter: '今後の予定', student: 'これから機能が増える予定はありますか？', teacher: 'ポトロチケットや延長ポイントなどを予定しているわ。これらは今後の機能よ。導入時に使い方・有効期限・利用条件をあらためてご案内するね。' },
    { chapter: 'おつかれさまでした', student: '専用URLを大切にして、期限や抽選の案内を確認します！', teacher: 'その調子！分からなくなったら、下のご利用案内でいつでも振り返れるわ。パスポートと一緒に、ポトロでの時間を楽しんでね。', complete: true }
  ];
  const get = id => document.getElementById(id);
  const lesson = get('passportLesson');
  const answered = new Map();
  let index = 0;
  let speaker = 'student';
  let automatic = false;
  let timer;
  function stopAuto() {
    automatic = false;
    clearTimeout(timer);
    get('lessonAuto').textContent = '自動再生';
    get('lessonAuto').setAttribute('aria-pressed', 'false');
  }
  function schedule() {
    clearTimeout(timer);
    if (!automatic) return;
    const slide = slides[index];
    if (speaker === 'teacher' && (slide.question || slide.complete)) { stopAuto(); return; }
    timer = setTimeout(() => { advance(false); }, Math.max(4500, slide[speaker].length * 105));
  }
  function advance(focus) {
    if (speaker === 'student') speaker = 'teacher';
    else if (index < slides.length - 1) { index++; speaker = 'student'; }
    render(focus);
  }
  function render(focus) {
    const slide = slides[index];
    const isTeacher = speaker === 'teacher';
    const showQuiz = isTeacher && Boolean(slide.question);
    const complete = isTeacher && Boolean(slide.complete);
    get('lessonChapter').textContent = slide.chapter;
    get('lessonCount').textContent = `${index + 1} / ${slides.length}`;
    get('lessonProgress').max = slides.length;
    get('lessonProgress').value = index + 1;
    get('lessonScene').dataset.speaker = speaker;
    get('lessonScene').classList.remove('quiz-success');
    get('lessonSpeaker').textContent = isTeacher ? '先輩メイド' : '後輩メイド';
    get('lessonLine').textContent = slide[speaker];
    get('lessonQuiz').hidden = !showQuiz;
    get('lessonQuestion').textContent = slide.question || '';
    get('lessonChoices').replaceChildren();
    get('lessonFeedback').textContent = showQuiz && answered.has(index) ? `正解！ ${slide.explanation}` : '';
    get('lessonFeedback').className = answered.has(index) ? 'is-correct' : '';
    (slide.choices || []).forEach((choice, choiceIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice;
      button.disabled = answered.has(index);
      if (answered.has(index) && choiceIndex === slide.correct) button.className = 'correct-choice';
      button.addEventListener('click', () => {
        if (choiceIndex === slide.correct) {
          answered.set(index, true);
          render(false);
          get('lessonScene').classList.add('quiz-success');
          get('lessonNext').focus({ preventScroll: true });
        } else {
          get('lessonFeedback').textContent = `もう一度考えてみましょう。${slide.explanation}`;
          get('lessonFeedback').className = 'is-retry';
        }
      });
      get('lessonChoices').append(button);
    });
    get('lessonComplete').hidden = !complete;
    get('lessonPrev').disabled = index === 0 && !isTeacher;
    get('lessonNext').disabled = showQuiz && !answered.has(index);
    get('lessonNext').textContent = complete ? 'もう一度読む' : '次へ';
    get('lessonAuto').disabled = showQuiz || complete;
    get('lessonJump').value = String(index);
    if (focus) {
      get('lessonDialogue').focus({ preventScroll: true });
      lesson.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    schedule();
  }
  slides.forEach((slide, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${i + 1}. ${slide.chapter}`;
    get('lessonJump').append(option);
  });
  function restart() { stopAuto(); index = 0; speaker = 'student'; answered.clear(); render(true); }
  get('lessonPrev').addEventListener('click', () => {
    stopAuto();
    if (speaker === 'teacher') speaker = 'student';
    else if (index > 0) { index--; speaker = 'teacher'; }
    render(true);
  });
  get('lessonNext').addEventListener('click', () => {
    stopAuto();
    if (speaker === 'teacher' && index === slides.length - 1) { restart(); return; }
    if (speaker === 'teacher' && slides[index].question && !answered.has(index)) return;
    advance(true);
  });
  get('lessonRestart').addEventListener('click', restart);
  get('lessonJump').addEventListener('change', event => { stopAuto(); index = Number(event.target.value); speaker = 'student'; render(true); });
  get('lessonAuto').addEventListener('click', () => {
    if (automatic) { stopAuto(); return; }
    automatic = true;
    get('lessonAuto').textContent = '一時停止';
    get('lessonAuto').setAttribute('aria-pressed', 'true');
    schedule();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); });
  get('btnMenu').addEventListener('click', stopAuto);
  document.querySelector('a[href="#passportGuide"]').addEventListener('click', () => { stopAuto(); get('passportGuide').open = true; });
  // Honor deep links to the original guide while presenting the lesson by default.
  get('passportGuide').open = Boolean(location.hash);
  window.addEventListener('hashchange', () => { if (location.hash && location.hash !== '#main') get('passportGuide').open = true; });
  render(false);
  lesson.hidden = false;
})();
