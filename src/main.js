import "./style.css";

const channel = new BroadcastChannel("sila-mesh-room");
const nodeId = crypto.randomUUID().slice(0, 8);
const state = {
  transport: "mesh",
  activeRoom: "ساحة الحي",
  online: navigator.onLine,
  peers: new Map(),
  messages: [
    {
      author: "ليان",
      initials: "ل",
      time: "09:42",
      text: "صباح الخير. هل ما زال اللقاء عند المكتبة اليوم؟",
      mine: false,
      transport: "mesh",
    },
    {
      author: "أنت",
      initials: "أ",
      time: "09:44",
      text: "نعم، سأكون هناك بعد قليل.",
      mine: true,
      transport: "mesh",
    },
    {
      author: "سامر",
      initials: "س",
      time: "09:48",
      text: "أرسلت الموقع في المجموعة. الإشارة المحلية مستقرة.",
      mine: false,
      transport: "internet",
    },
  ],
};

const rooms = [
  { name: "ساحة الحي", count: 12, color: "lime" },
  { name: "فريق الرحلة", count: 8, color: "orange" },
  { name: "ملاحظات عامة", count: 21, color: "blue" },
];

function escapeHtml(value) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[char],
  );
}

function render() {
  const meshCount = Math.max(2, state.peers.size + 1);
  document.querySelector("#app").innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand-lockup"><span class="brand-mark">ص</span><div><strong>صلة</strong><small>تواصل بلا حدود</small></div></div>
        <div class="network-pill ${state.online ? "is-online" : "is-offline"}"><span></span>${state.online ? "متصل بالإنترنت" : "وضع عدم الاتصال"}</div>
        <div class="profile"><span class="avatar avatar-you">أ</span><div><strong>أنت</strong><small>متاح الآن</small></div><button class="icon-btn" aria-label="فتح القائمة">⋮</button></div>
      </header>

      <section class="workspace">
        <aside class="sidebar">
          <div class="side-heading"><div><small>مساحاتك</small><h2>المجتمعات</h2></div><button class="square-btn" id="new-room" aria-label="إنشاء مساحة">+</button></div>
          <nav class="room-list">${rooms.map((room) => `<button class="room-item ${room.name === state.activeRoom ? "active" : ""}" data-room="${room.name}"><span class="room-dot ${room.color}"></span><span>${room.name}</span><b>${room.count}</b></button>`).join("")}</nav>
          <div class="side-divider"></div>
          <div class="mesh-card"><div class="mesh-orbit"><span></span><i></i><b></b></div><div><strong>شبكة Mesh محلية</strong><p>${meshCount} عقدة قريبة نشطة</p></div><button id="refresh-peers" aria-label="تحديث العقد">↻</button></div>
          <div class="sidebar-footer"><span class="lock">⌁</span><span>مشفّر من الطرف إلى الطرف</span></div>
        </aside>

        <section class="chat-panel">
          <div class="chat-header"><div><div class="eyebrow">مساحة مشتركة / ${state.activeRoom}</div><h1>${state.activeRoom}</h1><p>محادثة متزامنة عبر الإنترنت والشبكة المحلية</p></div><div class="header-actions"><button class="action-btn" id="share-room">↗ <span>مشاركة</span></button><button class="action-btn muted" aria-label="المزيد">•••</button></div></div>
          <div class="transport-switch" role="tablist"><button class="${state.transport === "mesh" ? "selected" : ""}" data-transport="mesh"><span class="transport-icon">⌁</span> Mesh محلي</button><button class="${state.transport === "internet" ? "selected" : ""}" data-transport="internet"><span class="transport-icon">◎</span> الإنترنت</button><em>${state.transport === "mesh" ? "الأولوية للشبكة القريبة" : "مزامنة مع الخادم"}</em></div>
          <div class="messages" id="messages">${state.messages.map((message) => `<article class="message ${message.mine ? "mine" : ""}"><div class="avatar ${message.mine ? "avatar-you" : "avatar-other"}">${message.initials}</div><div class="message-body"><div class="message-meta"><strong>${message.author}</strong><time>${message.time}</time><span class="route ${message.transport}">${message.transport === "mesh" ? "Mesh" : "Net"}</span></div><p>${escapeHtml(message.text)}</p></div></article>`).join("")}</div>
          <form class="composer" id="composer"><button type="button" class="attach" aria-label="إرفاق ملف">＋</button><input id="message-input" autocomplete="off" placeholder="اكتب رسالة إلى ${state.activeRoom}..." /><button class="send" aria-label="إرسال الرسالة">↑</button><div class="composer-hint">Enter للإرسال · ${state.transport === "mesh" ? "ترسل للعقد القريبة" : "تزامن عبر الإنترنت"}</div></form>
        </section>

        <aside class="details"><div class="details-head"><small>حالة المساحة</small><span class="live-dot">● مباشر</span></div><div class="signal-card"><div class="signal-top"><span class="signal-icon">⌁</span><div><strong>صلة هجينة</strong><p>${state.online ? "الإنترنت متاح، وMesh يعمل" : "Mesh يعمل دون إنترنت"}</p></div></div><div class="signal-bars"><i></i><i></i><i></i><i></i><i></i></div><small>قوة الإشارة المحلية <b>ممتازة</b></small></div><div class="detail-section"><div class="detail-title"><strong>العقد القريبة</strong><span>${meshCount}</span></div><div class="peer-list"><div class="peer"><span class="avatar avatar-yellow">ل</span><div><strong>ليان</strong><small>متصل عبر Mesh</small></div><i></i></div><div class="peer"><span class="avatar avatar-pink">س</span><div><strong>سامر</strong><small>متصل عبر الإنترنت</small></div><i class="net-dot"></i></div><div class="peer"><span class="avatar avatar-purple">ن</span><div><strong>ندى</strong><small>آخر ظهور منذ 3 د</small></div><i class="away-dot"></i></div></div></div><div class="detail-section room-rules"><div class="detail-title"><strong>عن هذه المساحة</strong><button aria-label="تعديل">✎</button></div><p>مكان هادئ لتنسيق أخبار الحي ومشاركة التحديثات المهمة، حتى عند ضعف الإنترنت.</p><div class="tag-row"><span>#تنسيق</span><span>#محلي</span><span>#مجتمع</span></div></div><div class="privacy-note"><span>◈</span><div><strong>خصوصية أولاً</strong><p>الرسائل المحلية لا تغادر شبكتك.</p></div></div></aside>
      </section>
    </main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-transport]").forEach((button) =>
    button.addEventListener("click", () => {
      state.transport = button.dataset.transport;
      render();
    }),
  );
  document.querySelectorAll("[data-room]").forEach((button) =>
    button.addEventListener("click", () => {
      state.activeRoom = button.dataset.room;
      render();
    }),
  );
  document.querySelector("#composer").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });
  document
    .querySelector("#refresh-peers")
    .addEventListener("click", announcePresence);
  document
    .querySelector("#share-room")
    .addEventListener("click", () =>
      navigator.clipboard
        ?.writeText(`صلة / ${state.activeRoom}`)
        .then(() => alert("تم نسخ اسم المساحة")),
    );
  document
    .querySelector("#new-room")
    .addEventListener("click", () =>
      alert("إنشاء المساحات سيضاف في الإصدار التالي."),
    );
}

function sendMessage() {
  const input = document.querySelector("#message-input");
  const text = input.value.trim();
  if (!text) return;
  const message = {
    author: "أنت",
    initials: "أ",
    time: new Date().toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    text,
    mine: true,
    transport: state.transport,
  };
  state.messages.push(message);
  channel.postMessage({ type: "message", from: nodeId, message });
  render();
  document.querySelector("#message-input")?.focus();
}

function announcePresence() {
  channel.postMessage({ type: "presence", from: nodeId, at: Date.now() });
  render();
}
channel.onmessage = (event) => {
  if (event.data.from === nodeId) return;
  if (event.data.type === "presence") {
    state.peers.set(event.data.from, Date.now());
    render();
  }
  if (event.data.type === "message") {
    state.peers.set(event.data.from, Date.now());
    state.messages.push({ ...event.data.message, mine: false });
    render();
  }
};
window.addEventListener("online", () => {
  state.online = true;
  render();
});
window.addEventListener("offline", () => {
  state.online = false;
  render();
});
announcePresence();
render();
