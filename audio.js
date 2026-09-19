// Web Audio API Synthesizer for Rahul Fly
// Zero external files required - 100% reliable synthesized arcade sounds

class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicPlaying = false;
        this.musicInterval = null;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
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
        if (this.muted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.muted;
    }

    // Jump / Flap sound
    playJump() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Collect Vote / Coin sound
    playCollect() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Aloo to Gold 5x Multiplier Power-up
    playGoldAloo() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.06;
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, start);
            
            gain.gain.setValueAtTime(0.15, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.1);
        });
    }

    // Samvidhan Shield Power-up
    playShield() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Heart extra life
    playHeart() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Collision / Hit sound
    playHit() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Speech Synthesis for viral Rahul Gandhi Hindi memes
    speakMeme(text, pitch = 1.15, rate = 1.1) {
        if (this.muted) return;
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop any pending speech
                const utter = new SpeechSynthesisUtterance(text);
                utter.rate = rate;
                utter.pitch = pitch;
                utter.volume = 0.95;
                // Try finding Hindi / Indian English voice
                const voices = window.speechSynthesis.getVoices();
                const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
                if (hiVoice) utter.voice = hiVoice;
                window.speechSynthesis.speak(utter);
            }
        } catch (e) {
            console.log("Speech synthesis unavailable", e);
        }
    }

    // Meme voice lines
    playMemeKhatam() {
        this.speakMeme("खत्म! टाटा! बाय बाय! Goodbye, गया!", 1.25, 1.15);
    }

    playMemeAloo() {
        this.speakMeme("इधर से आलू डालो, उधर से सोना निकालो!", 1.1, 1.05);
    }

    playMemeSamvidhan() {
        this.speakMeme("संविधान जिंदाबाद!", 1.1, 1.1);
    }

    // Game Over jingle + Khatam Tata Bye Bye
    playGameOver() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();
        this.playMemeKhatam();

        const now = this.ctx.currentTime;
        const notes = [440, 415.3, 392, 349.23, 293.66];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.15;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.25);
        });
    }

    // High Score fanfare
    playFanfare() {
        if (this.muted || !this.ctx) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.35);
        });
    }

    // High-Energy Viral Instagram Reel Phonk & Punjabi Meme Beat
    startBGM() {
        if (this.muted || !this.ctx || this.musicPlaying) return;
        this.ensureContext();
        this.musicPlaying = true;

        // Catchy viral reel meme melody (Phrygian / Bhangra dance hook)
        // [F4, G4, Ab4, G4, F4, Eb4, F4, C5, Ab4, G4, F4, G4, Eb4, F4...]
        const melody = [
            349.23, 392.00, 415.30, 392.00, 349.23, 311.13, 349.23, 523.25,
            415.30, 392.00, 349.23, 392.00, 311.13, 349.23, 392.00, 349.23
        ];
        // Punchy 808 Sub-bass frequencies
        const bassline = [
            87.31, 87.31, 103.83, 98.00, 87.31, 77.78, 87.31, 130.81,
            103.83, 98.00, 87.31, 98.00, 77.78, 87.31, 98.00, 87.31
        ];

        let step = 0;
        const tempoMs = 135; // ~112 BPM 16th-note bounce

        this.musicInterval = setInterval(() => {
            if (this.muted || !this.musicPlaying || !this.ctx) return;
            const now = this.ctx.currentTime;

            // 1. Kick Drum (on steps 0, 4, 8, 12, and syncopated 14)
            if (step % 4 === 0 || step === 14) {
                const kickOsc = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kickOsc.type = 'sine';
                kickOsc.frequency.setValueAtTime(150, now);
                kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.09);
                kickGain.gain.setValueAtTime(0.35, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                kickOsc.connect(kickGain);
                kickGain.connect(this.ctx.destination);
                kickOsc.start(now);
                kickOsc.stop(now + 0.1);
            }

            // 2. Snare / Clap (on steps 4, 12)
            if (step === 4 || step === 12) {
                const snareNoise = this.ctx.createBufferSource();
                const bufferSize = this.ctx.sampleRate * 0.08;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                snareNoise.buffer = buffer;
                const snareGain = this.ctx.createGain();
                snareGain.gain.setValueAtTime(0.18, now);
                snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                snareNoise.connect(snareGain);
                snareGain.connect(this.ctx.destination);
                snareNoise.start(now);
            }

            // 3. Hi-Hat (Every 2nd step)
            if (step % 2 === 0) {
                const hatOsc = this.ctx.createOscillator();
                const hatGain = this.ctx.createGain();
                hatOsc.type = 'highpass' in hatOsc ? 'triangle' : 'square';
                hatOsc.frequency.setValueAtTime(7000, now);
                hatGain.gain.setValueAtTime(0.04, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                hatOsc.connect(hatGain);
                hatGain.connect(this.ctx.destination);
                hatOsc.start(now);
                hatOsc.stop(now + 0.035);
            }

            // 4. Bassline (Deep 808 saw)
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sawtooth';
            bassOsc.frequency.setValueAtTime(bassline[step % bassline.length], now);
            bassGain.gain.setValueAtTime(0.09, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + 0.12);

            // 5. Catchy Viral Synth Lead Melody
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = 'triangle';
            leadOsc.frequency.setValueAtTime(melody[step % melody.length], now);
            leadGain.gain.setValueAtTime(0.08, now);
            leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(now);
            leadOsc.stop(now + 0.12);

            step = (step + 1) % 16;
        }, tempoMs);
    }

    stopBGM() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

window.soundFX = new SoundFX();
