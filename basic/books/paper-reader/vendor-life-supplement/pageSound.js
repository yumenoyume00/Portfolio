// Lightweight procedural Web Audio paper flip sound synthesizer (zero external audio files needed)
class PageSoundSynthesizer {
    ctx = null;
    enabled = true;
    constructor() { }
    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }
    }
    setEnabled(val) {
        this.enabled = val;
    }
    isEnabled() {
        return this.enabled;
    }
    playFlip() {
        if (!this.enabled)
            return;
        try {
            this.init();
            if (!this.ctx)
                return;
            const now = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.12; // 120ms
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            // Filtered white noise with exponential decay to mimic paper friction
            for (let i = 0; i < bufferSize; i++) {
                const decay = Math.exp(-i / (this.ctx.sampleRate * 0.035));
                data[i] = (Math.random() * 2 - 1) * decay * 0.35;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            filter.Q.value = 1.2;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
            noise.stop(now + 0.12);
        }
        catch { }
    }
}
export const pageSound = new PageSoundSynthesizer();
