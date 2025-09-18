export function C2CAIWidget(opts: { endpoint: string }) {
  const state = { sessionId: crypto.randomUUID() };

  // Floating mic button 🎤
  const btn = document.createElement("button");
  btn.textContent = "🎤 Talk to Assistant";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    padding: "14px 18px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    fontSize: "16px"
  });
  document.body.appendChild(btn);

  async function sendMessage(msg: string) {
    // Call backend
    const res = await fetch(opts.endpoint + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: msg,
        page: { url: location.href, title: document.title },
        sessionId: state.sessionId
      })
    }).then(r => r.json());

    // 🔊 Speak answer aloud
    const utter = new SpeechSynthesisUtterance(res.answer);
    speechSynthesis.speak(utter);
  }

  // 🎤 Mic recording
  btn.onclick = () => {
    const Recog = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Recog) {
      alert("Your browser does not support voice recognition. Use Chrome.");
      return;
    }
    const recog = new Recog();
    recog.lang = "en-US"; // try "si-LK" for Sinhala or "ta-IN" for Tamil
    recog.start();
    recog.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      sendMessage(transcript);
    };
  };
}