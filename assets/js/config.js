// /assets/js/config.js
window.PORTAL_CONFIG = {
  // CSV（お知らせ・イベント・グッズ）
  newsCsvUrl:    "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/export?format=csv&gid=1650494358",
  newsCsvUrlAlt: "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&sheet=PORTAL_NEWS.csv",

  eventsCsvUrl:   "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/export?format=csv&gid=365949763",
  eventsCsvUrlAlt:"https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&sheet=PORTAL_EVENTS.csv",

  goodsCsvUrl:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=681304800&single=true&output=csv",
  goodsCsvUrlAlt: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=681304800&single=true&output=csv",

  // ★ 今日（営業時間/出勤）は Apps Script APIで一本化
  scheduleApiUrl: "https://script.google.com/macros/s/AKfycbzP4k-zy5b1nIratH5hTaM5vuT5urSIU3m1SAamfxntrsOVRmaLMyoB8Q599-uvBLJnFQ/exec",

  // 予約導線
  reserve: {
    mode: "x_dm",
    xProfileUrl: "https://x.com/po_toro",
    formUrl: ""
  }
};

// 麻雀募集バナー用 Firebase 設定（未設定ならバナー自動で無効）
window.MAHJONG_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAm1EIxmK_UWmRM7VMP7LREbMQhSYmylko",
  authDomain: "potoro-mahjong.firebaseapp.com",
  projectId: "potoro-mahjong"
};
