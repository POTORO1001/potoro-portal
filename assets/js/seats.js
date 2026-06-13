(function(){
  const config = window.PORTAL_CONFIG || {};
  const core = window.PortalCore || {};

  const statusMap = {
    green: { className: 'seats-status--green', label: '空席あり', message: 'ただいまご案内可能です' },
    blue: { className: 'seats-status--blue', label: '満席・並びなし', message: '満席中・現在お待ちの列はありません' },
    red: { className: 'seats-status--red', label: '満席・待ちあり', message: '満席中・ご案内待ちがあります' },
    black: { className: 'seats-status--black', label: '受付終了', message: '本日の受付は終了しました' }
  };

  const statusAliases = {
    green: 'green',
    '緑': 'green',
    '空席': 'green',
    '空席あり': 'green',
    available: 'green',
    blue: 'blue',
    '青': 'blue',
    '満席': 'blue',
    '満席並びなし': 'blue',
    '満席・並びなし': 'blue',
    full: 'blue',
    red: 'red',
    '赤': 'red',
    '並びあり': 'red',
    '満席並びあり': 'red',
    '満席・並びあり': 'red',
    waiting: 'red',
    black: 'black',
    '黒': 'black',
    '受付終了': 'black',
    closed: 'black'
  };

  const statusKeys = ['status', 'color', '状態', '状況', '色'];
  const updatedKeys = ['updated', 'time', 'updated_at', '最終更新', '更新', '時刻'];
  let latestSeat = null;
  let latestDay = null;
  let hasTodayData = false;

  function normalize(value) {
    return core.normalizeHeader ? core.normalizeHeader(value) : String(value || '').trim().toLowerCase();
  }

  function normalizeStatus(value) {
    const raw = String(value || '').trim();
    const compact = raw.toLowerCase().replace(/\s+/g, '').replace(/[　・\/／-]/g, '');
    return statusAliases[raw] || statusAliases[compact] || statusAliases[raw.toLowerCase()] || '';
  }

  function hasHeader(row) {
    const headers = (row || []).map(normalize);
    return [...statusKeys, ...updatedKeys].some((key) => headers.includes(normalize(key)));
  }

  function firstByKeys(row, headers, keys) {
    for (const key of keys) {
      const index = headers.indexOf(normalize(key));
      if (index !== -1 && row[index]) return String(row[index]).trim();
    }
    return '';
  }

  function rowsToSeat(rows) {
    if (!rows.length) return null;

    if (!hasHeader(rows[0])) {
      const row = rows.find((candidate) => candidate && candidate.some((cell) => String(cell || '').trim()));
      if (!row) return null;
      return {
        status: normalizeStatus(row[0]),
        updated: String(row[1] || '').trim()
      };
    }

    const headers = rows[0].map(normalize);
    const row = rows.slice(1).find((candidate) => candidate && candidate.some((cell) => String(cell || '').trim()));
    if (!row) return null;
    return {
      status: normalizeStatus(firstByKeys(row, headers, statusKeys)),
      updated: firstByKeys(row, headers, updatedKeys)
    };
  }

  function parseCsv(csv) {
    const rows = core.parseCSV ? core.parseCSV(csv) : [];
    return rowsToSeat(rows);
  }

  function parseGvizTable(table) {
    const rows = ((table || {}).rows || []).map((row) => (
      ((row || {}).c || []).map((cell) => {
        const value = cell && (cell.f != null ? cell.f : cell.v);
        return value == null ? '' : String(value);
      })
    ));
    return rowsToSeat(rows);
  }

  function formatUpdatedText(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const jp = raw.match(/(\d{1,2})\s*時\s*(\d{1,2})\s*分?/);
    if (jp) return `${Number(jp[1])}時${String(Number(jp[2])).padStart(2, '0')}分時点の状況です`;

    const colon = raw.match(/(\d{1,2})[:：](\d{1,2})/);
    if (colon) return `${Number(colon[1])}時${String(Number(colon[2])).padStart(2, '0')}分時点の状況です`;

    return `${raw}時点の状況です`;
  }

  function parseTimeToMinutes(value) {
    const text = String(value || '').trim();
    const match = text.match(/(\d{1,2})[:：](\d{1,2})/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  }

  function getTokyoMinutes(date = new Date()) {
    const parts = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
    return hour * 60 + minute;
  }

  function getBusinessWindow(day) {
    const maids = Array.isArray(day?.maids) ? day.maids : [];
    const times = maids.map((maid) => ({
      start: parseTimeToMinutes(maid && maid.start),
      end: parseTimeToMinutes(maid && maid.end),
      off: maid && maid.off === true
    })).filter((time) => !time.off && time.start != null && time.end != null);

    if (!times.length) return null;
    return {
      open: Math.min(...times.map((time) => time.start)),
      close: Math.max(...times.map((time) => time.end))
    };
  }

  function isWithinBusinessHours(day, date = new Date()) {
    const window = getBusinessWindow(day);
    if (!window) return false;
    const now = getTokyoMinutes(date);
    if (window.close < window.open) return now >= window.open || now <= window.close;
    return now >= window.open && now <= window.close;
  }

  function renderIfAllowed() {
    if (!hasTodayData || !isWithinBusinessHours(latestDay)) {
      render(null);
      return;
    }
    render(latestSeat);
  }

  function render(seat) {
    const root = document.getElementById('seatsStatus');
    const dot = document.getElementById('seatsStatusDot');
    const label = document.getElementById('seatsStatusLabel');
    const message = document.getElementById('seatsStatusMessage');
    const updated = document.getElementById('seatsStatusUpdated');
    if (!root || !dot || !label || !message || !updated) return;

    const view = seat && statusMap[seat.status];
    if (!view) {
      root.hidden = true;
      return;
    }

    root.className = `seats-status ${view.className}`;
    dot.className = `seats-status__dot ${view.className}`;
    label.textContent = view.label;
    message.textContent = view.message;
    updated.textContent = formatUpdatedText(seat.updated) || '更新時点の状況です';
    root.hidden = false;
  }

  function loadGvizJsonp(url) {
    return new Promise((resolve, reject) => {
      const callbackName = `__portalSeats${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const script = document.createElement('script');
      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (response) => {
        cleanup();
        resolve(parseGvizTable(response && response.table));
      };

      try {
        const gvizUrl = new URL(url);
        gvizUrl.searchParams.set('tqx', `responseHandler:${callbackName}`);
        script.src = gvizUrl.toString();
      } catch (err) {
        cleanup();
        reject(err);
        return;
      }

      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('seats jsonp failed'));
      };
      document.head.appendChild(script);
    });
  }

  async function init() {
    const primaryUrl = config.seatsCsvUrl;
    const altUrl = config.seatsCsvUrlAlt || primaryUrl;
    if (!primaryUrl) return;

    try {
      latestSeat = await loadGvizJsonp(primaryUrl);
      renderIfAllowed();
    } catch (err) {
      try {
        const csv = await core.tryLoadCSV(primaryUrl, altUrl);
        latestSeat = parseCsv(csv);
        renderIfAllowed();
      } catch (fetchErr) {
        latestSeat = null;
        render(null);
      }
    }
  }

  window.addEventListener('portal:today-ready', (event) => {
    latestDay = event.detail && event.detail.day ? event.detail.day : null;
    hasTodayData = true;
    renderIfAllowed();
  });

  window.PortalSeats = {
    init,
    parseCsv,
    parseGvizTable,
    render,
    formatUpdatedText,
    getBusinessWindow,
    isWithinBusinessHours
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
