import { Component, model, signal } from '@angular/core';
import { SpeakJsService } from '../../services/speakJs.service';

@Component({
  selector: 'app-demo',
  template: `
    <div class="mx-auto p-4 max-w-[600px]">
      <h1 class="text-4xl font-bold">AudioEmailer - TTS Demo</h1>
      <textarea
        name="text"
        id="text"
        class="border w-full my-4 p-2"
        [value]="text()"
        (input)="text.set($any($event.target).value)"
      ></textarea>
      <div>
        <label for="amplitude">
          Amplitude: {{ amplitude() }}
          <input
            type="range"
            id="amplitude"
            min="0"
            max="200"
            [value]="amplitude()"
            (input)="amplitude.set($any($event.target).value)"
          />
        </label>
      </div>
      <div>
        <label for="pitch">
          Pitch: {{ pitch() }}
          <input
            type="range"
            id="pitch"
            min="0"
            max="100"
            [value]="pitch()"
            (input)="pitch.set($any($event.target).value)"
          />
        </label>
      </div>
      <div>
        <label for="speed">
          Speed: {{ speed() }}
          <input
            type="range"
            id="speed"
            min="100"
            max="300"
            [value]="speed()"
            (input)="speed.set($any($event.target).value)"
          />
        </label>
      </div>
      <div>
        <label for="wordgap">
          Word Gap: {{ wordGap() }}
          <input
            type="range"
            id="wordgap"
            min="0"
            max="50"
            [value]="wordGap()"
            (input)="wordGap.set($any($event.target).value)"
          />
        </label>
      </div>
      <div class="flex justify-end">

        
        <button class="bg-black text-white py-2 px-6" (click)="speak()">Speak</button>
      </div>
        <div id="audio"></div>
    </div>
  `,
})
export class DemoPage {
  text = model('This is a demo for the audioemailer project.');
  amplitude = model(100);
  pitch = model(50);
  speed = model(125);
  wordGap = model(0);

  constructor(private speakService: SpeakJsService) {}

  async ngOnInit() {
    await this.speakService.init();
  }

  speak() {
    this.speakService.speak(this.text(), {
      amplitude: this.amplitude(),
      pitch: this.pitch(),
      speed: this.speed(),
      wordgap: this.wordGap(),
    });
    console.log('Speaking...');
  }
}
