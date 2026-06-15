// /assets/js/config.js
window.PORTAL_CONFIG = {
  // 公開CSV（お知らせ・イベント・グッズ）
  newsCsvUrl:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=1650494358&single=true&output=csv",
  newsCsvUrlAlt: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=1650494358&single=true&output=csv",

  eventsCsvUrl:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=365949763&single=true&output=csv",
  eventsCsvUrlAlt:"https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=365949763&single=true&output=csv",

  goodsCsvUrl:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=681304800&single=true&output=csv",
  goodsCsvUrlAlt: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=681304800&single=true&output=csv",

  // 速報とお席状況（PO・TORO Portal API スプレッドシート）
  sokuhouCsvUrl:    "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&sheet=sokuhou",
  sokuhouCsvUrlAlt: "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&sheet=sokuhou",

  seatsCsvUrl:    "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&gid=472162255",
  seatsCsvUrlAlt: "https://docs.google.com/spreadsheets/d/1rqajpwmrRffVgtfBS7fgvgyrCS7YgfkW5RyedstpDnw/gviz/tq?tqx=out:csv&gid=472162255",

  scheduleCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSYdEeN7_fBl7AL-VjQYNh107h7QqsUaJ1oRY7KrvwwjkpQw5xM-Qn54P9QsLuLs8lrTLqzrsIZ59i/pub?gid=1276825118&single=true&output=csv",

  // 今日の営業情報・出勤情報は Apps Script API で取得
  scheduleApiUrl: "https://script.google.com/macros/s/AKfycbyB63yP698G7XS3S0uclGM9jxdjr93xToi9KpTFZM4NSysNf2Y_H3RufKT5Nsz0X6IW/exec",

  // 予約・問い合わせ導線
  reserve: {
    mode: "x_dm",
    xProfileUrl: "https://x.com/po_toro",
    formUrl: ""
  }
};
