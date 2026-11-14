"use client";

import { useRef, useState } from "react";

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean } & ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** Browser speech-to-text. `onText` receives each finalised phrase. */
export function useDictation(onText: (text: string) => void, { lang = "en-IN", continuous = false } = {}) {
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);

  function toggle() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = false;
    r.continuous = continuous;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim());
      }
    };
    r.onend = () => setListening(false);
    recognition.current = r;
    setListening(true);
    r.start();
  }

  return { listening, toggle };
}
