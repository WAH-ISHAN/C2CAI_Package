"use strict";

// src/client/widget.ts
var VoiceWidget = class {
  constructor(containerId = "c2cai-widget", opts) {
    this.containerId = containerId;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.serverUrl = opts?.serverUrl ?? "http://localhost:3000";
    this.initWidget();
  }
  initWidget() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    const startBtn = document.createElement("button");
    startBtn.textContent = "Start Voice Assistant";
    startBtn.onclick = () => this.startListening();
    container.appendChild(startBtn);
    const defaultLang = "si-LK";
    const userLang = navigator.language || defaultLang;
    this.setupRecognition(userLang);
  }
  setupRecognition(lang) {
    const SRClass = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SRClass) return;
    const recognition = new SRClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang;
    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const lastResult = event.results[lastResultIndex];
      if (lastResult?.isFinal) {
        const query = lastResult[0]?.transcript ?? "";
        if (query.trim()) this.handleQuery(query);
      }
    };
    recognition.onerror = (event) => {
      console.error("Voice error:", event.error);
    };
    this.recognition = recognition;
  }
  async handleQuery(query) {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${this.serverUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, lang: this.recognition?.lang || "en-US" })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const response = data.response || "No response received.";
      this.speak(response, this.recognition?.lang || "en-US");
    } catch (e) {
      console.error("Handle query error:", e);
      this.speak("Error occurred. Please try again.", this.recognition?.lang || "en-US");
    }
  }
  speak(text, lang) {
    if (!text) return;
    this.synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.volume = 1;
    utterance.rate = 0.9;
    this.synthesis.speak(utterance);
  }
  startListening() {
    if (this.recognition) {
      const welcomeLang = this.recognition.lang || "en-US";
      this.speak("\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA! \u0DB8\u0DA7 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.", welcomeLang);
      this.recognition.start();
    } else {
      alert("Voice recognition not supported in this browser. Please use Chrome or Edge.");
    }
  }
  stopListening() {
    if (this.recognition) this.recognition.stop();
    window.speechSynthesis.cancel();
  }
};
window.initC2CAI = (opts) => {
  new VoiceWidget(opts?.containerId ?? "c2cai-widget", { serverUrl: opts?.serverUrl });
};
//# sourceMappingURL=widget.cjs.map