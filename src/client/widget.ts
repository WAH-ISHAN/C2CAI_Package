// src/client/widget.ts (Client-side for embed - Browser compatible)
// Interfaces now from @types/dom-speech-recognition – no inline declarations needed.

class VoiceWidget {
  private recognition: SpeechRecognition | null = null;
  private synthesis = window.speechSynthesis;
  private serverUrl = 'http://localhost:3000'; // Customize via opts

  constructor(private containerId: string = 'c2cai-widget') {
    this.initWidget();
  }

  private initWidget() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn(`Container with id "${this.containerId}" not found.`);
      return;
    }

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Voice Assistant';
    startBtn.onclick = () => this.startListening();
    container.appendChild(startBtn);

    // Lang detect (hardcoded defaults for client-side)
    const defaultLang = 'si-LK';
    const userLang = navigator.language || defaultLang;
    this.setupRecognition(userLang);
  }

  private setupRecognition(lang: string) {
    const SpeechRecognitionConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (SpeechRecognitionConstructor) {
      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = lang;
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Use last result for continuous mode
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];
        if (lastResult.isFinal) {
          const query = lastResult[0].transcript;
          this.handleQuery(query);
        }
      };
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Voice error:', event.error);
      };
    } else {
      console.warn('SpeechRecognition not supported in this browser.');
    }
  }

  private async handleQuery(query: string) {
    if (!query.trim()) return; // Skip empty queries
    try {
      // Proxy to server
      const res = await fetch(`${this.serverUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          lang: this.recognition?.lang || 'en-US' 
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const response = data.response || 'No response received.';
      this.speak(response, this.recognition?.lang || 'en-US');
    } catch (e) {
      console.error('Handle query error:', e);
      this.speak('Error occurred. Please try again.');
    }
  }

  private speak(text: string, lang: string) {
    if (!text) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); // Fixed: Standard constructor (1 arg)
    utterance.lang = lang;
    utterance.volume = 1;
    utterance.rate = 0.9;
    this.synthesis.speak(utterance);
  }

  startListening() {
    if (this.recognition) {
      const welcomeLang = this.recognition.lang || 'en-US';
      this.speak('ආයුබෝවන්! මට කතා කරන්න.', welcomeLang); // Sinhala welcome
      this.recognition.start();
    } else {
      alert('Voice recognition not supported in this browser. Please use Chrome or Edge.');
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    window.speechSynthesis.cancel();
  }
}

// Global init function
(window as any).initC2CAI = (opts?: { url?: string; serverUrl?: string; containerId?: string }) => {
  if (opts?.serverUrl) {
    console.warn('serverUrl option logged; implement instance setting if required.');
  }
  new VoiceWidget(opts?.containerId);
};