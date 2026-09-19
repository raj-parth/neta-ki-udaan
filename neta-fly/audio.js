// Netaji Fly - Audio Synthesizer (Web Audio API)
// 100% self-contained, zero external asset dependencies

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('neta_fly_muted') === 'true';
        this.musicPlaying = false;
        this.musicTimer = null;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio not supported", e);
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('neta_fly_muted', this.muted.toString());
        if (this.muted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.muted;
    }

    // 1. Flap / Rocket Booster Thruster Sound
    playFlap() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // 2. Score Pop Chime
    playScore() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.06); // G5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // 3. Milestone Fanfare (every 10 points)
    playMilestone() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.08;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.16);
        });
    }

    // 4. Collision / Crash & Comedic slide whistle down
    playCrash() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        
        // Thud impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        // Comedic descending tones
        [320, 280, 240, 180].forEach((freq, idx) => {
            const toneOsc = this.ctx.createOscillator();
            const toneGain = this.ctx.createGain();
            const tStart = now + 0.12 + idx * 0.09;
            toneOsc.type = 'sine';
            toneOsc.frequency.setValueAtTime(freq, tStart);
            toneGain.gain.setValueAtTime(0.18, tStart);
            toneGain.gain.exponentialRampToValueAtTime(0.01, tStart + 0.1);
            toneOsc.connect(toneGain);
            toneGain.connect(this.ctx.destination);
            toneOsc.start(tStart);
            toneOsc.stop(tStart + 0.1);
        });
    }

    // 5. Button Click Sound
    playClick() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // 6. Upbeat Catchy Arcade Carnival BGM Loop
    startBGM() {
        if (this.muted || !this.ctx || this.musicPlaying) return;
        this.ensureContext();
        this.musicPlaying = true;

        // Upbeat joyful 8-bit melody
        const melody = [
            261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
            440.00, 392.00, 349.23, 329.63, // A4, G4, F4, E4
            293.66, 349.23, 440.00, 392.00, // D4, F4, A4, G4
            329.63, 293.66, 261.63, 261.63  // E4, D4, C4, C4
        ];
        const bass = [
            130.81, 130.81, 196.00, 196.00,
            174.61, 174.61, 164.81, 164.81,
            146.83, 146.83, 196.00, 196.00,
            164.81, 146.83, 130.81, 130.81
        ];

        let step = 0;
        this.musicTimer = setInterval(() => {
            if (this.muted || !this.musicPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;

            // Lead
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = 'triangle';
            leadOsc.frequency.setValueAtTime(melody[step % melody.length], now);
            leadGain.gain.setValueAtTime(0.045, now);
            leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(now);
            leadOsc.stop(now + 0.17);

            // Bass
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'square';
            bassOsc.frequency.setValueAtTime(bass[step % bass.length], now);
            bassGain.gain.setValueAtTime(0.02, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + 0.17);

            step = (step + 1) % 16;
        }, 180);
    }

    stopBGM() {
        this.musicPlaying = false;
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }
}

window.soundManager = new SoundManager();
