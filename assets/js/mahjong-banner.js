import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm1EIxmK_UWmRM7VMP7LREbMQhSYmylko",
  authDomain: "potoro-mahjong.firebaseapp.com",
  projectId: "potoro-mahjong",
  storageBucket: "potoro-mahjong.firebasestorage.app",
  messagingSenderId: "467297785940",
  appId: "1:467297785940:web:b1a0ed4cfa5ecd29a575c1",
  measurementId: "G-KTFZDLG5TL"
};

const MAHJONG_URL = "https://potoro1001.github.io/potoro-mahjong/";

const topAlert = document.getElementById("mahjongTopAlert");
const topAlertLink = document.getElementById("mahjongTopAlertLink");
const topAlertMeta = document.getElementById("mahjongTopAlertMeta");

const banner = document.getElementById("mjBanner");
const countEl = document.getElementById("mjCount");
const listEl = document.getElementById("mjList");
const linkEl = document.getElementById("mjLink");

if (topAlertLink) topAlertLink.href = MAHJONG_URL;
if (linkEl) linkEl.href = MAHJONG_URL;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function toMs(ts) {
  try {
    return ts?.toDate?.().getTime?.() ?? 0;
  } catch {
    return 0;
  }
}

function remainingSlots(room) {
  return Math.max(0, (room.slotsTotal | 0) - (room.joinedCount | 0));
}

function isOpenRoom(room) {
  const now = Date.now();
  const deadline = toMs(room.deadlineAt);
  if (room.closed) return false;
  if (deadline && now > deadline) return false;
  if (remainingSlots(room) <= 0) return false;
  return true;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showEmpty() {
  if (topAlert) topAlert.hidden = true;
  if (banner) banner.style.display = "none";
}

function renderOpenRooms(rooms) {
  const openRooms = rooms.filter(isOpenRoom);

  if (openRooms.length === 0) {
    showEmpty();
    return;
  }

  const count = openRooms.length;
  const roomNames = openRooms
    .slice(0, 3)
    .map((room) => room.comment?.trim() || room.id || "募集中の部屋")
    .filter(Boolean);

  const joinedText = roomNames.join(" ／ ");
  const remainSummary = openRooms
    .slice(0, 3)
    .map((room) => `残り${remainingSlots(room)}名`)
    .join(" ／ ");

  if (topAlertMeta) {
    topAlertMeta.textContent =
      count === 1
        ? `現在1部屋募集中！ ${joinedText} ${remainSummary}`
        : `現在${count}部屋募集中！ ${joinedText} ${remainSummary}`;
  }

  if (countEl) {
    countEl.textContent = count === 1 ? "1部屋募集中" : `${count}部屋募集中`;
  }

  if (listEl) {
    listEl.innerHTML = openRooms
      .slice(0, 3)
      .map((room) => {
        const label = room.comment?.trim() || room.id || "募集中の部屋";
        const remain = remainingSlots(room);
        return `<span class="tag" style="margin-right:8px">${escapeHtml(label)} / 残り${remain}名</span>`;
      })
      .join("");
  }

  if (topAlert) topAlert.hidden = false;
  if (banner) banner.style.display = "block";
}

async function startMahjongFeed() {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error("Mahjong banner auth failed:", err);
    showEmpty();
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const qRooms = query(collection(db, "rooms"), orderBy("eventAt", "asc"));
    onSnapshot(
      qRooms,
      (snap) => {
        const rooms = snap.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id
        }));
        renderOpenRooms(rooms);
      },
      (err) => {
        console.error("Mahjong banner snapshot failed:", err);
        showEmpty();
      }
    );
  });
}

startMahjongFeed();
