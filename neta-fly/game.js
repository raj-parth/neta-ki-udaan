// Netaji Fly - Core Game Engine & State Management
// 60 FPS Canvas Arcade Engine with Procedural Obstacles, Parallax, and Particles

class NetaFlyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('game-container');

        // Virtual resolution
        this.baseWidth = 400;
        this.baseHeight = 650;
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.scale = 1;

        // State: 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
        this.state = 'START';
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('neta_fly_best') || '0', 10);
        this.isNewRecord = false;

        // Character
        this.character = new NetaCharacter();
        this.player = {
            x: 85,
            y: 280,
            vy: 0,
            gravity: 0.23,
            flapForce: -5.4,
            radius: 15,
            rotation: 0
        };

        // Procedural obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 160;
        this.gameSpeed = 1.6;
        this.gapSize = 205; // Generous, playable gap

        // Parallax environment
        this.skyCycle = 0;
        this.clouds = [
            { x: 40, y: 70, scale: 0.8, speed: 0.3 },
            { x: 190, y: 130, scale: 1.1, speed: 0.45 },
            { x: 340, y: 60, scale: 0.9, speed: 0.35 }
        ];
        this.bgOffsetFar = 0;
        this.bgOffsetMid = 0;
        this.groundOffset = 0;

        // Particle system
        this.particles = [];
        this.confetti = [];

        // DOM elements
        this.initDOM();
        this.resize();
        this.bindEvents();

        // Start render loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initDOM() {
        this.screenStart = document.getElementById('screen-start');
        this.screenGameOver = document.getElementById('screen-gameover');
        this.screenPause = document.getElementById('screen-pause');
        this.hud = document.getElementById('hud');
        this.hudScore = document.getElementById('hud-score');
        this.hudBest = document.getElementById('hud-best');
        this.tapPrompt = document.getElementById('tap-prompt');

        this.startBestScore = document.getElementById('start-best-score');
        this.finalScore = document.getElementById('final-score');
        this.finalBest = document.getElementById('final-best');
        this.recordBadge = document.getElementById('record-badge');
        this.audioIcon = document.getElementById('audio-icon');

        // Initial values
        this.startBestScore.textContent = this.bestScore;
        this.hudBest.textContent = `BEST ${this.bestScore}`;
        this.updateAudioIcon();

        // Render preview in character box
        this.renderStartPreview();
    }

    renderStartPreview() {
        const previewBox = document.querySelector('.char-preview-box');
        if (previewBox) {
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 90;
            previewCanvas.height = 90;
            const pCtx = previewCanvas.getContext('2d');
            pCtx.translate(45, 45);
            this.character.draw(pCtx, -2);
            previewBox.innerHTML = '';
            previewBox.appendChild(previewCanvas);
        }
    }

    updateAudioIcon() {
        if (this.audioIcon) {
            this.audioIcon.textContent = soundManager.muted ? '🔇' : '🔊';
        }
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.scale = (rect.width * dpr) / this.baseWidth;
        this.width = this.baseWidth;
        this.height = (rect.height * dpr) / this.scale;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Universal trigger (Mouse click / Touch)
        this.container.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            this.handleAction();
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleAction();
            } else if (e.code === 'Enter') {
                if (this.state === 'START' || this.state === 'GAMEOVER') {
                    this.startGame();
                }
            } else if (e.code === 'KeyP') {
                this.togglePause();
            } else if (e.code === 'KeyM') {
                this.toggleMute();
            }
        });

        // UI Buttons
        document.getElementById('btn-play').addEventListener('click', () => {
            soundManager.playClick();
            this.startGame();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            soundManager.playClick();
            this.startGame();
        });

        document.getElementById('btn-home').addEventListener('click', () => {
            soundManager.playClick();
            this.goHome();
        });

        document.getElementById('btn-pause').addEventListener('click', () => {
            soundManager.playClick();
            this.togglePause();
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            soundManager.playClick();
            this.togglePause();
        });

        document.getElementById('btn-mute').addEventListener('click', () => {
            this.toggleMute();
        });
    }

    toggleMute() {
        const isMuted = soundManager.toggleMute();
        this.updateAudioIcon();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.screenPause.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.screenPause.classList.add('hidden');
        }
    }

    handleAction() {
        if (this.state === 'START') {
            this.startGame();
        } else if (this.state === 'PLAYING') {
            this.flap();
        } else if (this.state === 'GAMEOVER') {
            // Prevent accidental instant restart
            if (Date.now() - this.gameOverTime > 350) {
                this.startGame();
            }
        }
    }

    flap() {
        this.player.vy = this.player.flapForce;
        soundManager.playFlap();

        // Spawn thruster smoke & spark particles
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.player.x - 22,
                y: this.player.y + 12 + (Math.random() * 6 - 3),
                vx: -(Math.random() * 2.5 + 1.2),
                vy: Math.random() * 2 - 1,
                radius: Math.random() * 3 + 2,
                color: Math.random() > 0.4 ? '#F97316' : '#FED7AA',
                alpha: 1,
                decay: 0.04
            });
        }

        if (this.tapPrompt) {
            this.tapPrompt.style.display = 'none';
        }
    }

    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.isNewRecord = false;

        this.player.x = 85;
        this.player.y = this.height / 2 - 30;
        this.player.vy = 0;
        this.player.rotation = 0;

        this.obstacles = [];
        this.particles = [];
        this.confetti = [];
        this.obstacleTimer = 110; // First obstacle arrives smoothly
        this.gameSpeed = 1.6;
        this.gapSize = 205;

        // UI screens
        this.screenStart.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.hudScore.textContent = '0';
        this.hudBest.textContent = `BEST ${this.bestScore}`;
        if (this.tapPrompt) this.tapPrompt.style.display = 'block';

        soundManager.startBGM();
    }

    goHome() {
        this.state = 'START';
        this.screenStart.classList.remove('hidden');
        this.screenGameOver.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.startBestScore.textContent = this.bestScore;
        soundManager.stopBGM();
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        this.gameOverTime = Date.now();
        soundManager.stopBGM();
        soundManager.playCrash();

        // Screen shake
        this.container.classList.add('shake');
        setTimeout(() => this.container.classList.remove('shake'), 280);

        // Best score check
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.isNewRecord = true;
            localStorage.setItem('neta_fly_best', this.bestScore.toString());
            soundManager.playMilestone();
            this.createConfettiShower();
        }

        this.finalScore.textContent = this.score;
        this.finalBest.textContent = this.bestScore;
        this.recordBadge.style.display = this.isNewRecord ? 'block' : 'none';

        this.screenGameOver.classList.remove('hidden');
    }

    createConfettiShower() {
        const colors = ['#F97316', '#10B981', '#3B82F6', '#FBBF24', '#EC4899'];
        for (let i = 0; i < 40; i++) {
            this.confetti.push({
                x: this.width / 2 + (Math.random() * 80 - 40),
                y: this.height / 2 - 60,
                vx: (Math.random() * 8 - 4),
                vy: -(Math.random() * 6 + 2),
                size: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: Math.random() * 0.2 - 0.1,
                alpha: 1
            });
        }
    }

    createScorePopParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1.5,
                color: '#FBBF24',
                alpha: 1,
                decay: 0.03
            });
        }
    }

    spawnObstacle() {
        const minHeight = 70;
        const groundY = this.height - 40;
        const maxTop = groundY - this.gapSize - minHeight;
        const topHeight = minHeight + Math.random() * Math.max(10, maxTop - minHeight);
        const bottomY = topHeight + this.gapSize;
        const bottomHeight = groundY - bottomY;

        const styles = ['news_mic', 'evm_box', 'pillar'];
        const chosenStyle = styles[Math.floor(Math.random() * styles.length)];

        this.obstacles.push({
            x: this.width + 10,
            width: 60,
            topHeight: topHeight,
            bottomY: bottomY,
            bottomHeight: bottomHeight,
            style: chosenStyle,
            passed: false
        });
    }

    update() {
        if (this.state !== 'PLAYING') return;

        // Player physics
        this.player.vy += this.player.gravity;
        this.player.y += this.player.vy;

        // Tilt angle based on vertical velocity
        this.player.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, this.player.vy * 0.07));
        this.character.update(this.player.vy);

        // Ground & Ceiling collision
        const groundY = this.height - 40;
        if (this.player.y + this.player.radius >= groundY) {
            this.player.y = groundY - this.player.radius;
            this.triggerGameOver();
            return;
        }
        if (this.player.y - this.player.radius <= 0) {
            this.player.y = this.player.radius;
            this.player.vy = 0;
        }

        // Obstacles generation
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.obstacleTimer = 0;
            this.spawnObstacle();

            // Progressive difficulty scaling (gradual & fair)
            if (this.gameSpeed < 2.2) this.gameSpeed += 0.005;
            if (this.gapSize > 175) this.gapSize -= 0.1;
        }

        // Move obstacles & detect collisions
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Scoring
            if (!obs.passed && obs.x + obs.width < this.player.x) {
                obs.passed = true;
                this.score++;
                soundManager.playScore();
                this.createScorePopParticles(this.player.x, this.player.y);

                // Score pop animation
                this.hudScore.textContent = this.score;
                this.hudScore.classList.add('pop');
                setTimeout(() => this.hudScore.classList.remove('pop'), 120);

                // Milestone fanfare every 10 points
                if (this.score > 0 && this.score % 10 === 0) {
                    soundManager.playMilestone();
                    this.createConfettiShower();
                }
            }

            // Check collision with generous, fair hitbox padding
            if (this.checkCollision(obs)) {
                this.triggerGameOver();
                return;
            }

            // Clean offscreen
            if (obs.x + obs.width < -40) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        // Update confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx;
            c.y += c.vy;
            c.vy += 0.15; // gravity
            c.rotation += c.rotSpeed;
            c.alpha -= 0.015;
            if (c.alpha <= 0) this.confetti.splice(i, 1);
        }

        // Parallax environment movement
        this.bgOffsetFar = (this.bgOffsetFar + this.gameSpeed * 0.2) % this.width;
        this.bgOffsetMid = (this.bgOffsetMid + this.gameSpeed * 0.5) % this.width;
        this.groundOffset = (this.groundOffset + this.gameSpeed) % 40;

        // Move clouds
        this.clouds.forEach(c => {
            c.x -= c.speed;
            if (c.x < -60) c.x = this.width + 40;
        });

        // Day/night dynamic gradient
        this.skyCycle = (Math.sin(this.score * 0.05) + 1) / 2;
    }

    checkCollision(obs) {
        // Fair hitbox (3px inset)
        const pLeft = this.player.x - this.player.radius + 3;
        const pRight = this.player.x + this.player.radius - 3;
        const pTop = this.player.y - this.player.radius + 3;
        const pBottom = this.player.y + this.player.radius - 3;

        if (pRight > obs.x && pLeft < obs.x + obs.width) {
            if (pTop < obs.topHeight) return true;
            if (pBottom > obs.bottomY) return true;
        }
        return false;
    }

    draw() {
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        // 1. Dynamic Sky
        this.drawSky();

        // 2. Clouds
        this.drawClouds();

        // 3. Parallax Skyline & Assembly Monuments
        this.drawCitySkyline();

        // 4. Obstacles (News mic towers / EVM boxes / Assembly pillars)
        this.drawObstacles();

        // 5. Particles & Confetti
        this.drawParticles();

        // 6. Player Character
        this.drawPlayer();

        // 7. Foreground Ground with rally flags
        this.drawGround();

        this.ctx.restore();
    }

    drawSky() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        if (this.skyCycle < 0.5) {
            // Day to Sunset
            grad.addColorStop(0, '#38BDF8');
            grad.addColorStop(0.65, '#F97316');
            grad.addColorStop(1, '#FEF08A');
        } else {
            // Sunset to Night
            grad.addColorStop(0, '#0F172A');
            grad.addColorStop(0.65, '#1E293B');
            grad.addColorStop(1, '#7C2D12');
        }
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Sun / Moon
        this.ctx.fillStyle = this.skyCycle < 0.6 ? '#FDE047' : '#E2E8F0';
        this.ctx.beginPath();
        this.ctx.arc(this.width - 60, 80, 22, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.clouds.forEach(c => {
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, 14 * c.scale, 0, Math.PI * 2);
            this.ctx.arc(c.x + 12 * c.scale, c.y - 7 * c.scale, 18 * c.scale, 0, Math.PI * 2);
            this.ctx.arc(c.x + 28 * c.scale, c.y, 14 * c.scale, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawCitySkyline() {
        const groundY = this.height - 40;

        // Distant hills
        this.ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
        for (let i = 0; i < 3; i++) {
            const hx = (i * 180 - this.bgOffsetFar + this.width * 2) % (this.width + 180) - 90;
            this.ctx.beginPath();
            this.ctx.arc(hx + 90, groundY + 40, 110, Math.PI, 0);
            this.ctx.fill();
        }

        // City & Monument silhouettes
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        for (let i = 0; i < 6; i++) {
            const bx = (i * 85 - this.bgOffsetMid + this.width * 2) % (this.width + 100) - 50;
            const bh = 55 + (i % 3) * 35;
            this.ctx.fillRect(bx, groundY - bh, 60, bh);

            // Assembly dome roof on middle building
            if (i % 2 === 0) {
                this.ctx.beginPath();
                this.ctx.arc(bx + 30, groundY - bh, 20, Math.PI, 0);
                this.ctx.fill();
            }
        }
    }

    drawObstacles() {
        this.obstacles.forEach(obs => {
            // TOP OBSTACLE (Downward facing column)
            this.drawObstacleColumn(obs.x, 0, obs.width, obs.topHeight, true, obs.style);

            // BOTTOM OBSTACLE (Upward facing column)
            this.drawObstacleColumn(obs.x, obs.bottomY, obs.width, obs.bottomHeight, false, obs.style);
        });
    }

    drawObstacleColumn(x, y, w, h, isTop, style) {
        this.ctx.save();

        // Pillar Gradient based on style
        const grad = this.ctx.createLinearGradient(x, y, x + w, y);
        if (style === 'news_mic') {
            // Vibrant TV News Broadcast style
            grad.addColorStop(0, '#DC2626');
            grad.addColorStop(0.5, '#EF4444');
            grad.addColorStop(1, '#991B1B');
        } else if (style === 'evm_box') {
            // Electronic Voting Machine booth style
            grad.addColorStop(0, '#2563EB');
            grad.addColorStop(0.5, '#3B82F6');
            grad.addColorStop(1, '#1D4ED8');
        } else {
            // Assembly Stone Pillar style
            grad.addColorStop(0, '#D97706');
            grad.addColorStop(0.5, '#F59E0B');
            grad.addColorStop(1, '#B45309');
        }

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        if (isTop) {
            this.ctx.roundRect(x, y, w, h, [0, 0, 10, 10]);
        } else {
            this.ctx.roundRect(x, y, w, h, [10, 10, 0, 0]);
        }
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Pillar Caps & Badges
        const capY = isTop ? y + h - 18 : y;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 3, capY, w - 6, 18);
        this.ctx.strokeStyle = '#CBD5E1';
        this.ctx.strokeRect(x + 3, capY, w - 6, 18);

        // Satirical Label
        this.ctx.fillStyle = '#0F172A';
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        let label = 'VOTE';
        if (style === 'news_mic') label = 'LIVE TV';
        else if (style === 'evm_box') label = 'EVM';
        this.ctx.fillText(label, x + w / 2, capY + 9);

        // LED / Mic bulb decoration
        this.ctx.fillStyle = isTop ? '#EF4444' : '#10B981';
        this.ctx.beginPath();
        this.ctx.arc(x + 8, capY + 9, 3, 0, Math.PI * 2);
        this.ctx.arc(x + w - 8, capY + 9, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.rotation);

        // Render animated original character
        this.character.draw(this.ctx, this.player.vy);

        this.ctx.restore();
    }

    drawParticles() {
        // Smoke & sparks
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Milestone Confetti
        this.confetti.forEach(c => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, c.alpha);
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate(c.rotation);
            this.ctx.fillStyle = c.color;
            this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
            this.ctx.restore();
        });
    }

    drawGround() {
        const groundY = this.height - 40;

        // Ground base
        this.ctx.fillStyle = '#064E3B';
        this.ctx.fillRect(0, groundY, this.width, 40);

        // Top grass rim
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, groundY, this.width, 8);

        // Rally pennants & mini flags
        for (let x = -this.groundOffset; x < this.width + 40; x += 32) {
            // Pole
            this.ctx.fillStyle = '#94A3B8';
            this.ctx.fillRect(x + 6, groundY - 14, 2, 14);

            // Saffron/White/Green bunting
            this.ctx.fillStyle = '#F97316';
            this.ctx.fillRect(x + 8, groundY - 14, 7, 3);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 8, groundY - 11, 7, 3);
            this.ctx.fillStyle = '#10B981';
            this.ctx.fillRect(x + 8, groundY - 8, 7, 3);
        }
    }

    loop(timestamp) {
        this.update();
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new NetaFlyGame();
});
