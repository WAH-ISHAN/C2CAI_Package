// src/client/widget.ts
function C2CAIWidget(opts) {
  const state = { open: false, sessionId: crypto.randomUUID() };
  const btn = document.createElement("button");
  btn.textContent = "\u{1F4AC} Chat";
  Object.assign(btn.style, { position: "fixed", bottom: "20px", right: "20px", zIndex: "9999", padding: "10px 14px", borderRadius: "999px", background: "#111", color: "#fff" });
  document.body.appendChild(btn);
  const panel = document.createElement("div");
  panel.innerHTML = `<div style="width:320px;height:420px;background:#fff;position:fixed;bottom:70px;right:20px;border:1px solid #ddd;border-radius:12px;display:none;flex-direction:column;overflow:hidden;font-family:system-ui">
    <div style="padding:10px;border-bottom:1px solid #eee;font-weight:600">C2CAI Assistant</div>
    <div id="c2cai-log" style="flex:1;padding:10px;overflow:auto;font-size:14px"></div>
    <div style="display:flex;border-top:1px solid #eee">
      <input id="c2cai-in" style="flex:1;padding:10px;border:0;outline:none" placeholder="Ask me anything..." />
      <button id="c2cai-send" style="padding:10px 12px;border:0;background:#111;color:#fff">Send</button>
    </div>
  </div>`;
  Object.assign(panel.style, { zIndex: "9999" });
  document.body.appendChild(panel);
  const box = panel.firstElementChild;
  const log = panel.querySelector("#c2cai-log");
  const input = panel.querySelector("#c2cai-in");
  const send = panel.querySelector("#c2cai-send");
  function pageContext() {
    const main = document.querySelector("main") || document.body;
    const txt = ((main == null ? void 0 : main.textContent) || "").replace(/\s+/g, " ").trim().slice(0, 4e3);
    return { url: location.href, title: document.title, text: txt };
  }
  function add(role, text) {
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.innerHTML = `<div style="font-weight:600">${role}</div><div>${text}</div>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  btn.onclick = () => {
    state.open = !state.open;
    box.style.display = state.open ? "flex" : "none";
  };
  send.onclick = async () => {
    const msg = input.value.trim();
    if (!msg) return;
    add("You", msg);
    input.value = "";
    const res = await fetch(opts.endpoint + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, page: pageContext(), sessionId: state.sessionId })
    }).then((r) => r.json());
    add("C2CAI", `${res.answer}

Sources:
${(res.sources || []).join("\n")}`);
  };
  ["popstate", "hashchange"].forEach((ev) => window.addEventListener(ev, () => {
  }));
}
export {
  C2CAIWidget
};
