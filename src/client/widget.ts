// src/client/widget.ts
import type {
  SpeechRecognition as WebSpeechRecognition,
  SpeechRecognitionEvent as WebSpeechRecognitionEvent,
  SpeechRecognitionErrorEvent as WebSpeechRecognitionErrorEvent,
} from '../types/speech';

class VoiceWidget {
  private recognition: WebSpeechRecognition | null = null;
  private synthesis = window.speechSynthesis;
  private serverUrl: string;

  constructor(private containerId: string = 'c2cai-widget', opts?: { serverUrl?: string }) {
    this.serverUrl = opts?.serverUrl ?? 'http://localhost:3000';
    this.initWidget();
  }

  private initWidget() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Voice Assistant';
    startBtn.onclick = () => this.startListening();
    container.appendChild(startBtn);

    const defaultLang = 'si-LK';
    const userLang = navigator.language || defaultLang;
    this.setupRecognition(userLang);
  }

  private setupRecognition(lang: string) {
    type SRConstructor = new () => WebSpeechRecognition;
    const SRClass = ((window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition) as SRConstructor | undefined;

    if (!SRClass) return;

    const recognition = new SRClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      const lastResultIndex = event.results.length - 1;
      const lastResult = event.results[lastResultIndex];
      if (lastResult?.isFinal) {
        const query = lastResult[0]?.transcript ?? '';
        if (query.trim()) this.handleQuery(query);
      }
    };

    recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      console.error('Voice error:', event.error);
    };

    this.recognition = recognition;
  }

  private async handleQuery(query: string) {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${this.serverUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, lang: this.recognition?.lang || 'en-US' }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const response = data.response || 'No response received.';
      this.speak(response, this.recognition?.lang || 'en-US');
    } catch (e) {
      console.error('Handle query error:', e);
      this.speak('Error occurred. Please try again.', this.recognition?.lang || 'en-US');
    }
  }

  private speak(text: string, lang: string) {
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
      const welcomeLang = this.recognition.lang || 'en-US';
      this.speak('ආයුබෝවන්! මට කතා කරන්න.', welcomeLang);
      this.recognition.start();
    } else {
      alert('Voice recognition not supported in this browser. Please use Chrome or Edge.');
    }
  }

  stopListening() {
    if (this.recognition) this.recognition.stop();
    window.speechSynthesis.cancel();
  }
}

(window as any).initC2CAI = (opts?: { url?: string; serverUrl?: string; containerId?: string }) => {
  new VoiceWidget(opts?.containerId ?? 'c2cai-widget', { serverUrl: opts?.serverUrl });
};
