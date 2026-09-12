// Speech Recognition & Synthesis utility for CalmChat

// Clean markdown syntax for natural speech synthesis
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*#_~`>]/g, '')           // Remove markdown markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert [text](link) to text
    .replace(/https?:\/\/\S+/g, '')     // Remove raw links
    .replace(/[-*]\s+/g, '')            // Remove bullet points
    .trim();
}

// ── Text-to-Speech (TTS) ─────────────────────────────────────────

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  currentUtterance = null;
}

export function speakText(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: any) => void;
  }
): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) return false;

  const utterance = new SpeechSynthesisUtterance(clean);
  currentUtterance = utterance;

  // Pick a calming, warm voice
  const voices = window.speechSynthesis.getVoices();
  const calmVoice = voices.find(v => 
    v.lang.startsWith('en') && (
      v.name.includes('Natural') ||
      v.name.includes('Samantha') ||
      v.name.includes('Google US English') ||
      v.name.includes('Karen') ||
      v.name.includes('Serena') ||
      v.name.includes('Daniel')
    )
  ) || voices.find(v => v.lang.startsWith('en'));

  if (calmVoice) {
    utterance.voice = calmVoice;
  }

  utterance.rate = 0.93;  // Slightly slower, gentle pacing
  utterance.pitch = 1.0;  // Warm and natural

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    callbacks?.onEnd?.();
  };

  utterance.onerror = (err) => {
    currentUtterance = null;
    callbacks?.onError?.(err);
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    callbacks?.onError?.(err);
    return false;
  }
}

// ── Speech-to-Text (STT) ─────────────────────────────────────────

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export class SpeechRecognizer {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  start(
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: any) => void
  ): boolean {
    if (!this.recognition) return false;
    if (this.isListening) return true;

    try {
      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const text = final || interim;
        onResult(text, Boolean(final));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error);
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      onError(e);
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  get listening(): boolean {
    return this.isListening;
  }
}
