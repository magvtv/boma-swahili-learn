export interface SpeechResult {
  supported: boolean;
}

export function speakSwahili(text: string): SpeechResult {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return { supported: false };
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sw-KE';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
    return { supported: true };
  } catch {
    return { supported: false };
  }
}
