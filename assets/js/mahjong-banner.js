// /assets/js/mahjong-banner.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const cfg = window.MAHJONG_FIREBASE_CONFIG || {};
const banner = document.getElementById("mjBanner");
const listEl = document.getElementById("mjList");
const countEl = document.getElementById("mjCount");

if(!banner || !listEl || !countEl){
  // index以外で読んでも壊さない
}else if(!cfg.projectId || cfg.projectId === "YOUR_PROJECT_ID"){
  // 未設定なら何もしない（非表示のまま）
}else{
  try{
    const app = initializeApp(cfg, "mahjongPortalApp");
    const db = getFirestore(app);

    const q = query(
      collection(db, "rooms"),
      orderBy("eventAt", "asc"),
      limit(50)
    );

    const snap = await getDocs(q);
    const now = new Date();
    const openRooms = [];

    if(!snap.empty){
      snap.forEach(doc=>{
        const d = doc.data() || {};
        if(isRecruiting(d, now)) openRooms.push(d);
      });
    }

    if(openRooms.length){
      banner.style.display = "block";

      const showList = openRooms.slice(0, 3);
      countEl.textContent = `（${openRooms.length}件）`;

      const lines = showList.map(d=>{
        const when = buildWhen(d);
        const fmt  = detectFormat(d);
        const who  = detectCreator(d);
        return [when, fmt, who].filter(Boolean).join(" / ");
      }).filter(Boolean);

      listEl.innerHTML = lines.length
        ? lines.map(x=>`<div>・${escapeHtml(x)}</div>`).join("")
        : `<div>・募集中の部屋があります</div>`;
    }
  }catch(e){
    // silent（失敗してもindexを壊さない）
  }
}

function isRecruiting(d, now){
  if(d.closed === true) return false;

  const deadline = toDateSafe(d.deadlineAt);
  if(deadline && deadline.getTime() <= now.getTime()) return false;

  const endAt = toDateSafe(d.endAt);
  if(endAt && endAt.getTime() <= now.getTime()) return false;

  const slots = asNum(d.slotsTotal);
  const joined = asNum(d.joinedCount);
  if(Number.isFinite(slots) && Number.isFinite(joined)){
    if(joined >= slots) return false;
  }

  const closedFlags = [d.isClosed, d.deleted, d.isDeleted];
  if(closedFlags.some(v => v === true)) return false;
  if(d.closedAt || d.deletedAt || d.endedAt) return false;

  return true;
}

function asNum(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function buildWhen(d){
  const dt = toDateSafe(d.eventAt) || toDateSafe(d.startAt) || toDateSafe(d.createdAt);
  if(!dt) return "";

  const wd = ["日","月","火","水","木","金","土"][dt.getDay()];
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth()+1);
  const da = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mm = pad2(dt.getMinutes());
  return `${y}/${m}/${da}(${wd}) ${hh}:${mm}`;
}

function detectFormat(d){
  const p = d.players ?? d.playerCount ?? d.nPlayers ?? d.modePlayers;
  if(Number(p) === 3) return "三人";
  if(Number(p) === 4) return "四人";

  const raw = String(d.format ?? d.rule ?? d.gameType ?? d.mode ?? d.type ?? "").trim();
  if(!raw) return "";
  if(/[3３]/.test(raw) || raw.includes("三") || raw.toLowerCase().includes("3p")) return "三人";
  if(/[4４]/.test(raw) || raw.includes("四") || raw.toLowerCase().includes("4p")) return "四人";
  return "";
}

function detectCreator(d){
  const who = firstNonEmpty(
    d.creatorName, d.creator, d.ownerName, d.owner, d.hostName, d.host,
    d.createdByName, d.createdBy, d.makerName, d.maker, d.name
  );
  return who ? `作成：${String(who).trim()}` : "";
}

function firstNonEmpty(...vals){
  for(const v of vals){
    const s = String(v ?? "").trim();
    if(s) return s;
  }
  return "";
}

function toDateSafe(v){
  try{
    if(!v) return null;
    if(typeof v.toDate === "function") return v.toDate();
    if(typeof v.seconds === "number") return new Date(v.seconds * 1000);
    if(typeof v === "number"){
      if(v > 1e12) return new Date(v);
      if(v > 1e9)  return new Date(v * 1000);
    }
    if(typeof v === "string"){
      const d = new Date(v);
      if(!isNaN(d)) return d;
    }
  }catch(e){}
  return null;
}

function pad2(n){ return String(n).padStart(2,'0'); }
function escapeHtml(str){
  return String(str).replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
}
