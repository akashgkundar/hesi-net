// Procedural ambient audio synthesizer using Web Audio API
// No external MP3 files or network requests needed!

class SoundscapeSynth {
  private ctx: AudioContext | null = null;
  private currentType: 'off' | 'rain' | 'ocean' | 'zen' | 'green' = 'off';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.currentType = 'off';
    this.cleanup();
  }

  private cleanup() {
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
  }

  public play(type: 'rain' | 'ocean' | 'zen' | 'green') {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.currentType === type) return;
    this.cleanup();
    this.currentType = type;

    if (type === 'rain') this.createRain();
    else if (type === 'ocean') this.createOcean();
    else if (type === 'zen') this.createZen();
    else if (type === 'green') this.createGreenNoise();
  }

  // 1. Soft Rainfall Generator (Brown/Pink noise with high cut)
  private createRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(300, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(filter2);
    filter2.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, filter2, rainGain);
  }

  // 2. Ocean Waves (Modulated swell noise)
  private createOcean() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.015 * white)) / 1.015;
      lastOut = output[i];
      output[i] *= 4.0;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.11, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    waveGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    lfo.start();
    noise.start();
    this.activeNodes.push(noise, filter, lfo, lfoGain, waveGain);
  }

  // 3. Zen Singing Bowl & Meditation Drone (432Hz Harmonic Resonance)
  private createZen() {
    if (!this.ctx || !this.masterGain) return;

    const frequencies = [108, 216, 324, 432];
    const zenGroup = this.ctx.createGain();
    zenGroup.gain.setValueAtTime(0.22, this.ctx.currentTime);
    zenGroup.connect(this.masterGain);

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.35 : -0.25), this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.02, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15 / (idx + 1), this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(zenGroup);

      osc.start();
      lfo.start();
      this.activeNodes.push(osc, lfo, lfoGain, gain);
    });

    this.activeNodes.push(zenGroup);
  }

  // 4. Pure Green Noise (500Hz Nature Frequency Spectrum)
  // Recreates the acoustic spectrum of wind flowing through trees & natural waterfalls
  private createGreenNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate balanced pink noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Green Noise filter: Center peaked around ~500Hz, rolloff below 150Hz and above 1500Hz
    const centerFilter = this.ctx.createBiquadFilter();
    centerFilter.type = 'peaking';
    centerFilter.frequency.setValueAtTime(500, this.ctx.currentTime);
    centerFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);
    centerFilter.gain.setValueAtTime(6.0, this.ctx.currentTime);

    const highCut = this.ctx.createBiquadFilter();
    highCut.type = 'lowpass';
    highCut.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const lowCut = this.ctx.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.setValueAtTime(180, this.ctx.currentTime);

    // Subtle natural organic breeze fluctuation (0.07Hz LFO)
    const breezeLfo = this.ctx.createOscillator();
    breezeLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);
    const breezeLfoGain = this.ctx.createGain();
    breezeLfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    const greenGain = this.ctx.createGain();
    greenGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    breezeLfo.connect(breezeLfoGain);
    breezeLfoGain.connect(greenGain.gain);

    noiseSource.connect(centerFilter);
    centerFilter.connect(highCut);
    highCut.connect(lowCut);
    lowCut.connect(greenGain);
    greenGain.connect(this.masterGain);

    noiseSource.start();
    breezeLfo.start();
    this.activeNodes.push(noiseSource, centerFilter, highCut, lowCut, breezeLfo, breezeLfoGain, greenGain);
  }
}

export const soundscape = typeof window !== 'undefined' ? new SoundscapeSynth() : (null as any);
