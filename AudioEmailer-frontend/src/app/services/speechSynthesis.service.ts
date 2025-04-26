import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpeechSynthesisService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  speaking = signal(false);
  selectedVoice = signal<SpeechSynthesisVoice | null>(null);

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
        // Set default voice when voices are loaded
        if (this.voices.length > 0 && !this.selectedVoice()) {
          this.selectVoice(this.voices[0]);
        }
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    // Set default voice if available and none is selected
    if (this.voices.length > 0 && !this.selectedVoice()) {
      this.selectVoice(this.voices[0]);
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  selectVoice(voice: SpeechSynthesisVoice): void {
    this.selectedVoice.set(voice);
  }

  speak(
    text: string,
    options?: {
      voice?: SpeechSynthesisVoice;
      rate?: number;
      pitch?: number;
      volume?: number;
    }
  ): void {
    if (!text) return;

    this.cancel();
    this.speaking.set(true);

    const utterance = new SpeechSynthesisUtterance(text);

    if (options) {
      utterance.voice = options.voice || this.selectedVoice() || null;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;
    } else if (this.selectedVoice()) {
      utterance.voice = this.selectedVoice();
    }

    this.synth.speak(utterance);
    utterance.onend = () => {
      this.speaking.set(false);
    };
  }

  pause(): void {
    this.synth.pause();
    this.speaking.set(false);
  }

  resume(): void {
    this.synth.resume();
    this.speaking.set(true);
  }

  cancel(): void {
    this.synth.cancel();
    this.speaking.set(false);
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}
