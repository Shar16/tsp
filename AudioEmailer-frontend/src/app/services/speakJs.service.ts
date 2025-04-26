// speakjs.service.ts
import { Injectable } from '@angular/core';

declare global {
  interface Window { speak: any; }
}

@Injectable({ providedIn: 'root' })
export class SpeakJsService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    await this.loadScript('assets/speakjs/speakClient.js');
    this.initialized = true;
  }

  speak(text: string, options?: any) {
    window.speak(text, options);
  }

  private loadScript(src: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
