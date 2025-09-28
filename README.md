  

---

# 📘 C2CAI – Voice Assistant Widget for Portfolio / Websites  

**C2CAI** 🧠🎙️ is a **frontend voice widget** built using the Web Speech API (SpeechRecognition + SpeechSynthesis).  
This allows you to talk to your portfolio/site and get spoken answers back.  

- ✅ Works out of the box on **Chrome / Edge** (with mic permissions)  
- 🌏 Sinhala + English language support (default Sinhala welcome: *ආයුබෝවන්! මට කතා කරන්න.*)  
- 🔉 Converts your speech → text → generates response → speaks back  
- 📦 Small, pluggable widget: Just drop into your React/Vite/Next or plain HTML site  

---

## 🚀 Features
- Speech Recognition using Web APIs  
- Text‑to‑Speech feedback  
- Sinhala/English support (auto detects userLang)  
- Simple `<div>` integration (like a chatbot button)  
- Can run in **two modes**:
  1. **Echo‑only (no backend)** → repeats back your words (for demos & portfolios)  
  2. **AI‑powered (with backend)** → connect to Node.js `/chat` API (LLM/RAG etc)  

---

## 📂 Project Structure
```
C2CAI_Package/
 ├── src/
 │    ├── client/widget.ts   # Browser widget
 │    ├── server.ts          # Node/Express backend (optional)
 │    ├── rag.ts             # RAG logic (optional advanced)
 │    └── ...                
 └── dist/                   # Build outputs (CJS/ESM/Widget bundle)
```

---

## 🔧 Installation & Build
```bash
# setup deps
npm install   

# build both client/server
npm run build
```

Build step generates:
- `dist/client/widget.js` → the widget you embed in your site  
- `dist/server.js` → backend server with `/chat` endpoint  

---

## 🖇️ How to Use C2CAI in a Portfolio  

### 1. Copy widget to your portfolio project
Take the `dist/client/widget.js` → copy into your Portfolio repo’s `public/` folder:

```
/portfolio-site
 └── public/
     └── c2cai-widget.js
```

---

### 2. Add container + init script

In **React/Vite App** (`App.jsx`):

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/c2cai-widget.js"; // public path
    s.onload = () => {
      window.initC2CAI?.({
        containerId: "c2cai-widget",
        // if backend: serverUrl: "https://your-backend.com"
      });
    };
    document.body.appendChild(s);

    return () => window.speechSynthesis?.cancel?.();
  }, []);

  return (
    <div>
      <h1>My Portfolio</h1>
      {/* assistant mounts here */}
      <div id="c2cai-widget"></div>
    </div>
  )
}
export default App;
```

---

### 3. Without a backend (Echo mode)
- If you don’t want to set up a server → widget can just **echo** your words back:  
  - In `handleQuery(query)` → remove fetch, instead do:  
    ```ts
    const response = `You said: ${query}`;
    this.speak(response, this.recognition?.lang || "en-US");
    ```
- Result: voice assistant repeats what you say. This is nice for a **Portfolio demo** with ZERO backend hosting. ✅

---

### 4. With backend (AI‑mode)
/chat endpoint → Node server (e.g. Express):

```ts
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ response: "Missing query" });

  // TODO: connect LLM or RAG here
  res.json({ response: "Echo: " + query });
});

app.listen(3000, () => console.log("C2CAI server on 3000"));
```

➡️ Deploy this server to **Render / Railway / Fly.io** and pass its URL into your widget init `serverUrl`.

---

### 5. Supported frameworks
- Plain HTML:
  ```html
  <div id="c2cai-widget"></div>
  <script src="/c2cai-widget.js"></script>
  <script>
    window.initC2CAI({
      serverUrl: "http://localhost:3000",
      containerId: "c2cai-widget"
    });
  </script>
  ```
- React (Vite, CRA) → useEffect as shown above.  
- Next.js (Vercel) → use `<div id="c2cai-widget"></div>` + load script from `public/`.

---

## 🧪 Demo Flow
1. Click **Start Voice Assistant** button.  
2. Browser asks mic permission.  
3. Speak → widget captures speech.  
4. If **mock mode**: Assistant repeats: “You said: …”.  
5. If **backend mode**: Widget sends query to `/chat`, gets AI response, speaks it out.  

---

## 🎨 Styling
Button can be customized in `App.css`:
```css
#c2cai-widget button {
  background: #111;
  color: #fff;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: bold;
  cursor: pointer;
}
#c2cai-widget button:hover {
  background: #333;
}
```

---

## 🌎 Browser Support
- Chrome / Edge ✅  
- Safari (macOS/iOS) ⚠️ (`webkitSpeechRecognition` only)  
- Firefox ❌ (no native recognition yet)

---

## 🛡️ Notes
- **HTTPS required** in production (to use mic)  
- **Backend needed** only if real AI answers are required  
- Without backend → safe echo demo (ideal for portfolio, no secrets exposed)  
- With backend → hide API keys in server only, never expose in frontend  

---

## 🏗️ Roadmap
- Streaming responses  
- Multi‑language voice selection  
- Plug‑and‑play OpenAI/Anthropic adapters  
- RAG support (document crawl & retrieval)  

---

## 📜 License
MIT – Free to use in your portfolio or projects.

---

👉 **Summary:**  
Add `c2cai-widget.js` in your **public/**, mount `<div id="c2cai-widget">`, init it.  
- No backend? → it echoes back what you say (fun interactive demo).  
- With backend? → it becomes a true **AI assistant** fetching answers from `/chat`.  

---
## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
----
