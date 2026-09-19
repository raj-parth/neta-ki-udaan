// Rahul Fly - Bharat Jodo Endless Tapper
// Core Game Engine & Interactive Loop

class RahulFlyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Virtual resolution for consistent gameplay across screens
        this.width = 400;
        this.height = 680;
        this.scale = 1;

        // Game state
        this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER
        this.mode = 'yatra'; // 'classic' or 'yatra'
        this.score = 0;
        this.kmTraveled = 0;
        this.highScore = parseInt(localStorage.getItem('rahul_fly_highscore') || '0', 10);
        this.lives = 3;
        this.maxLives = 3;

        // Power-ups
        this.activeMultiplier = 1;
        this.multiplierTimer = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;

        // Player (Rahul) - Made gentle, floaty, and easy to control
        this.player = {
            x: 90,
            y: 300,
            vy: 0,
            gravity: 0.20,      // Soft, floaty gravity (was 0.38)
            jumpStrength: -5.2, // Smooth, easily controllable flap (was -7.6)
            radius: 14,         // Forgiving player radius (was 18)
            rotation: 0,
            capeFrame: 0,
            invincibleBlink: 0
        };

        // Entities
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.clouds = [];
        this.landmarks = [];

        // Obstacle settings - Made easy and spacious
        this.obstacleTimer = 0;
        this.obstacleInterval = 180; // Plenty of spacing between obstacles (was 115)
        this.gameSpeed = 1.35;       // Relaxed, enjoyable speed (was 2.4)
        this.gapSize = 230;          // Super wide gap (was 160)

        // Background parallax offsets
        this.bgOffsetFar = 0;
        this.bgOffsetMid = 0;
        this.bgOffsetNear = 0;
        this.groundOffset = 0;
        this.dayCycle = 0; // 0 to 1 (Day to Sunset to Night)

        // Assets
        GameAssets.init();

        this.initDOM();
        this.resize();
        this.initBackgroundElements();
        this.bindEvents();

        // Main game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    initDOM() {
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('gameover-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.instructionsModal = document.getElementById('instructions-modal');
        this.hud = document.getElementById('hud');
        this.tapHint = document.getElementById('tap-hint');

        // Score display elements
        this.hudScore = document.getElementById('hud-score');
        this.hudKm = document.getElementById('hud-km');
        this.hudLives = document.getElementById('hud-lives');
        this.finalScore = document.getElementById('final-score');
        this.finalKm = document.getElementById('final-km');
        this.finalHighScore = document.getElementById('final-highscore');
        this.playerRank = document.getElementById('player-rank');
        this.newHighBadge = document.getElementById('new-high-badge');

        // Power-up meter
        this.powerupBar = document.getElementById('active-powerup-bar');
        this.powerupName = document.getElementById('powerup-name');
        this.powerupFill = document.getElementById('powerup-meter-fill');

        // High score preview on start
        const startHighEl = document.getElementById('start-highscore');
        if (startHighEl) startHighEl.textContent = this.highScore;

        // Populate avatar preview with Rahul real photo
        const previewEl = document.querySelector('.avatar-preview');
        if (previewEl) {
            previewEl.innerHTML = `
                <div style="position: relative; width: 92px; height: 92px; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/rahul_face.png" style="width: 88px; height: 88px; border-radius: 50%; border: 3px solid #FF9933; box-shadow: 0 0 20px rgba(255,153,51,0.8); object-fit: cover;" alt="Rahul Gandhi">
                    <span style="position: absolute; bottom: -2px; right: -2px; font-size: 22px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">🚀</span>
                </div>
            `;
        }
    }

    resize() {
        const wrapper = document.getElementById('game-wrapper');
        const rect = wrapper.getBoundingClientRect();
        
        // Canvas pixel density support (High-DPI / Retina)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.scale = (rect.width * dpr) / this.width;
        this.height = (rect.height * dpr) / this.scale;
    }

    initBackgroundElements() {
        // Generate initial clouds
        this.clouds = [
            { x: 50, y: 80, scale: 0.8, speed: 0.3 },
            { x: 220, y: 140, scale: 1.2, speed: 0.5 },
            { x: 360, y: 60, scale: 0.9, speed: 0.4 }
        ];

        // Background landmarks (India Gate, Sansad, Lal Qila)
        this.landmarks = [
            { type: 'indiaGate', x: 80, y: this.height - 180 },
            { type: 'parliament', x: 290, y: this.height - 170 },
            { type: 'redFort', x: 500, y: this.height - 175 }
        ];
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Tap / Click input
        const handleAction = (e) => {
            if (e) {
                // If clicked an interactive UI button, let it trigger its click handler
                if (e.target.closest('button') || e.target.closest('.mode-pill')) return;
            }
            this.handlePlayerAction();
        };

        const wrapper = document.getElementById('game-wrapper');
        wrapper.addEventListener('pointerdown', handleAction);

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                this.handlePlayerAction();
            } else if (e.code === 'KeyP') {
                this.togglePause();
            } else if (e.code === 'KeyM') {
                this.toggleAudio();
            }
        });

        // Mode toggles
        document.querySelectorAll('.mode-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.mode = e.currentTarget.dataset.mode;
                this.updateModeUI();
            });
        });

        // Start button
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startGame();
        });

        // Restart button
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startGame();
        });

        // Resume button
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.togglePause();
        });

        // How to play modal toggles
        document.getElementById('btn-guide').addEventListener('click', () => {
            this.instructionsModal.classList.remove('hidden');
        });
        document.getElementById('btn-close-guide').addEventListener('click', () => {
            this.instructionsModal.classList.add('hidden');
        });

        // Sound toggles
        const audioBtn = document.getElementById('btn-audio');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.toggleAudio());
        }

        // Share button
        const shareBtn = document.getElementById('btn-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareScore());
        }
    }

    updateModeUI() {
        if (this.mode === 'classic') {
            this.maxLives = 1;
            this.lives = 1;
            if (this.hudLives) this.hudLives.style.display = 'none';
        } else {
            this.maxLives = 3;
            this.lives = 3;
            if (this.hudLives) this.hudLives.style.display = 'flex';
        }
        this.renderLivesHUD();
    }

    renderLivesHUD() {
        if (!this.hudLives) return;
        let hearts = '';
        for (let i = 0; i < this.lives; i++) hearts += '❤️ ';
        for (let i = this.lives; i < this.maxLives; i++) hearts += '🖤 ';
        this.hudLives.textContent = hearts;
    }

    toggleAudio() {
        const isMuted = soundFX.toggleMute();
        const icon = document.getElementById('audio-icon');
        if (icon) {
            icon.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.pauseScreen.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.pauseScreen.classList.add('hidden');
        }
    }

    handlePlayerAction() {
        if (this.state === 'START') {
            this.startGame();
        } else if (this.state === 'PLAYING') {
            this.player.vy = this.player.jumpStrength;
            soundFX.playJump();
            this.createJumpParticles();
            if (this.tapHint) this.tapHint.style.display = 'none';
        } else if (this.state === 'GAMEOVER') {
            // Give 500ms delay to avoid accidental restart on death tap
            if (Date.now() - this.gameOverTime > 400) {
                this.startGame();
            }
        }
    }

    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.kmTraveled = 0;
        this.updateModeUI();

        this.player.x = 90;
        this.player.y = this.height / 2 - 40;
        this.player.vy = 0;
        this.player.rotation = 0;
        this.player.invincibleBlink = 0;

        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.obstacleTimer = 70; // spawn first obstacle quickly

        this.activeMultiplier = 1;
        this.multiplierTimer = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;

        // DOM state
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.instructionsModal.classList.add('hidden');
        this.hud.style.opacity = '1';
        if (this.tapHint) this.tapHint.style.display = 'block';

        this.updateHUD();
        soundFX.startBGM();
    }

    updateHUD() {
        if (this.hudScore) this.hudScore.textContent = this.score;
        if (this.hudKm) this.hudKm.textContent = `${Math.floor(this.kmTraveled)} KM`;
        this.renderLivesHUD();

        // Update active power-up meter
        if (this.shieldActive) {
            this.powerupBar.classList.add('visible');
            this.powerupName.textContent = '📜 SAMVIDHAN SHIELD!';
            this.powerupFill.style.width = `${(this.shieldTimer / 360) * 100}%`;
        } else if (this.multiplierTimer > 0) {
            this.powerupBar.classList.add('visible');
            this.powerupName.textContent = '🥔 ALOO TO GOLD 5X!';
            this.powerupFill.style.width = `${(this.multiplierTimer / 480) * 100}%`;
        } else {
            this.powerupBar.classList.remove('visible');
        }
    }

    createJumpParticles() {
        // Jetpack / wind dust particles
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: this.player.x - 16,
                y: this.player.y + 6 + (Math.random() * 8 - 4),
                vx: -(Math.random() * 2 + 1.5),
                vy: Math.random() * 2 - 1,
                radius: Math.random() * 3 + 2,
                color: Math.random() > 0.5 ? '#FF9933' : '#FFFFFF',
                alpha: 1,
                decay: 0.04
            });
        }
    }

    createCollectSparkles(x, y, color = '#FFD700') {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 1.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3.5 + 1.5,
                color: color,
                alpha: 1,
                decay: 0.03
            });
        }
    }

    createDebris(x, y) {
        // Explosion / smoke particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 4 + 2,
                color: ['#FF7700', '#1B4965', '#FFF', '#E63946'][Math.floor(Math.random() * 4)],
                alpha: 1,
                decay: 0.025
            });
        }
    }

    spawnObstacle() {
        const minHeight = 90;
        const groundY = this.height - 40;
        const availableHeight = groundY - this.gapSize - minHeight * 2;
        const topHeight = minHeight + Math.random() * Math.max(20, availableHeight);
        const bottomY = topHeight + this.gapSize;
        const bottomHeight = groundY - bottomY;

        const obsWidth = 64;
        const obstacle = {
            x: this.width + 10,
            width: obsWidth,
            topHeight: topHeight,
            bottomY: bottomY,
            bottomHeight: bottomHeight,
            passed: false,
            // Varied caricature / pillar types
            style: Math.random() > 0.4 ? 'modi' : 'evm'
        };

        this.obstacles.push(obstacle);

        // Chance to spawn collectible in the gap
        if (Math.random() < 0.65) {
            let itemType = 'vote';
            const roll = Math.random();
            if (roll < 0.2) {
                itemType = 'samvidhan'; // Shield
            } else if (roll < 0.4) {
                itemType = 'aloo'; // 5x multiplier
            } else if (roll < 0.52 && this.mode === 'yatra' && this.lives < this.maxLives) {
                itemType = 'heart'; // Extra life
            }

            this.collectibles.push({
                x: obstacle.x + obsWidth / 2,
                y: topHeight + this.gapSize / 2 + (Math.random() * 40 - 20),
                type: itemType,
                radius: 16,
                floatOffset: Math.random() * Math.PI * 2,
                collected: false
            });
        }
    }

    update() {
        if (this.state !== 'PLAYING') return;

        // Bharat Jodo distance counter
        this.kmTraveled += (this.gameSpeed * 0.18);
        this.dayCycle = (Math.sin(this.kmTraveled * 0.005) + 1) / 2;

        // Player physics
        this.player.vy += this.player.gravity;
        this.player.y += this.player.vy;

        // Tilt angle based on velocity
        this.player.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, this.player.vy * 0.07));
        this.player.capeFrame += 0.2;

        // Invincibility blink decay
        if (this.player.invincibleBlink > 0) {
            this.player.invincibleBlink--;
        }

        // Power-up timers
        if (this.shieldActive) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }

        if (this.multiplierTimer > 0) {
            this.multiplierTimer--;
            if (this.multiplierTimer <= 0) {
                this.activeMultiplier = 1;
            }
        }

        // Ground / Ceiling collision
        const groundY = this.height - 44;
        if (this.player.y + this.player.radius >= groundY) {
            this.player.y = groundY - this.player.radius;
            this.handleHit();
            return;
        }
        if (this.player.y - this.player.radius <= 0) {
            this.player.y = this.player.radius;
            this.player.vy = 0;
        }

        // Obstacle spawning
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.obstacleTimer = 0;
            this.spawnObstacle();
            // Keep speed steady and easy
            if (this.gameSpeed < 1.7) this.gameSpeed += 0.003;
            if (this.gapSize > 200) this.gapSize -= 0.05;
        }

        // Obstacles movement & collision
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Score point when safely passed
            if (!obs.passed && obs.x + obs.width < this.player.x) {
                obs.passed = true;
                this.score += (1 * this.activeMultiplier);
                soundFX.playCollect();
                this.createCollectSparkles(this.player.x, this.player.y, '#38BDF8');
                this.updateHUD();
            }

            // Check collision with top or bottom obstacle
            if (this.checkObstacleCollision(obs)) {
                if (this.shieldActive) {
                    // Shield destroys obstacle with funny smoke!
                    soundFX.playHit();
                    this.createDebris(obs.x + obs.width / 2, this.player.y);
                    this.obstacles.splice(i, 1);
                    continue;
                } else {
                    this.handleHit();
                    return;
                }
            }

            // Remove offscreen obstacles
            if (obs.x + obs.width < -50) {
                this.obstacles.splice(i, 1);
            }
        }

        // Collectibles update & pickup
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.x -= this.gameSpeed;
            item.floatOffset += 0.08;
            const currentY = item.y + Math.sin(item.floatOffset) * 4;

            // Check pickup with player
            const dx = this.player.x - item.x;
            const dy = this.player.y - currentY;
            const dist = Math.hypot(dx, dy);

            if (dist < this.player.radius + item.radius) {
                this.collectItem(item);
                this.collectibles.splice(i, 1);
                continue;
            }

            // Remove offscreen
            if (item.x < -40) {
                this.collectibles.splice(i, 1);
            }
        }

        // Particles update
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Background parallax scrolling
        this.bgOffsetFar = (this.bgOffsetFar + this.gameSpeed * 0.15) % this.width;
        this.bgOffsetMid = (this.bgOffsetMid + this.gameSpeed * 0.45) % this.width;
        this.bgOffsetNear = (this.bgOffsetNear + this.gameSpeed * 0.9) % this.width;
        this.groundOffset = (this.groundOffset + this.gameSpeed) % 40;

        // Clouds movement
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -100) cloud.x = this.width + 50;
        });

        this.updateHUD();
    }

    collectItem(item) {
        if (item.type === 'vote') {
            this.score += (2 * this.activeMultiplier);
            soundFX.playCollect();
            this.createCollectSparkles(item.x, item.y, '#FFD700');
        } else if (item.type === 'aloo') {
            // Aloo to Gold 5x Multiplier + Meme voice
            this.activeMultiplier = 5;
            this.multiplierTimer = 480; // ~8 seconds at 60fps
            soundFX.playGoldAloo();
            soundFX.playMemeAloo();
            this.createCollectSparkles(item.x, item.y, '#F59E0B');
        } else if (item.type === 'samvidhan') {
            // Invincibility Shield + Meme voice
            this.shieldActive = true;
            this.shieldTimer = 360; // ~6 seconds
            soundFX.playShield();
            soundFX.playMemeSamvidhan();
            this.createCollectSparkles(item.x, item.y, '#3B82F6');
        } else if (item.type === 'heart') {
            // Extra Life
            if (this.lives < this.maxLives) {
                this.lives++;
                soundFX.playHeart();
                this.createCollectSparkles(item.x, item.y, '#EF4444');
            }
        }
        this.updateHUD();
    }

    checkObstacleCollision(obs) {
        if (this.player.invincibleBlink > 0) return false;

        // Super forgiving, generous collision box (player won't die on accidental edge graze)
        const pLeft = this.player.x - this.player.radius + 8;
        const pRight = this.player.x + this.player.radius - 8;
        const pTop = this.player.y - this.player.radius + 8;
        const pBottom = this.player.y + this.player.radius - 8;

        const oLeft = obs.x;
        const oRight = obs.x + obs.width;

        // Check if player is horizontally aligned with obstacle
        if (pRight > oLeft && pLeft < oRight) {
            // Check top obstacle collision
            if (pTop < obs.topHeight) {
                return true;
            }
            // Check bottom obstacle collision
            if (pBottom > obs.bottomY) {
                return true;
            }
        }
        return false;
    }

    handleHit() {
        if (this.shieldActive) {
            this.shieldActive = false;
            this.shieldTimer = 0;
            this.player.invincibleBlink = 60;
            soundFX.playHit();
            this.createDebris(this.player.x, this.player.y);
            return;
        }

        this.lives--;
        this.renderLivesHUD();
        soundFX.playHit();
        this.createDebris(this.player.x, this.player.y);

        if (this.lives > 0) {
            // Respawn with brief invincibility
            this.player.invincibleBlink = 90;
            this.player.vy = -5;
        } else {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.state = 'GAMEOVER';
        this.gameOverTime = Date.now();
        soundFX.stopBGM();
        soundFX.playGameOver();

        const isNewHigh = this.score > this.highScore;
        if (isNewHigh) {
            this.highScore = this.score;
            localStorage.setItem('rahul_fly_highscore', this.highScore.toString());
            soundFX.playFanfare();
        }

        // Populate Game Over modal
        if (this.finalScore) this.finalScore.textContent = this.score;
        if (this.finalKm) this.finalKm.textContent = `${Math.floor(this.kmTraveled)} KM`;
        if (this.finalHighScore) this.finalHighScore.textContent = this.highScore;
        if (this.newHighBadge) {
            this.newHighBadge.style.display = isNewHigh ? 'inline-block' : 'none';
        }

        // Satirical Title calculation
        let title = "Trainee Yatri 🚶";
        if (this.score >= 60) title = "Prime Minister Contender 👑";
        else if (this.score >= 40) title = "Leader of Opposition 🏛️";
        else if (this.score >= 25) title = "Jan Nayak 🌟";
        else if (this.score >= 12) title = "Youth Leader 🚴";
        else if (this.score >= 5) title = "Nyay Yoddha ⚖️";

        if (this.playerRank) this.playerRank.textContent = title;

        this.gameOverScreen.classList.remove('hidden');
    }

    shareScore() {
        const text = `I scored ${this.score} pts (${Math.floor(this.kmTraveled)} KM) in 'Rahul Fly - Bharat Jodo Endless Tapper'! Can you beat my high score? 🚀🇮🇳`;
        if (navigator.share) {
            navigator.share({
                title: 'Rahul Fly Game',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text);
            alert("Score copied to clipboard! Share it with your friends! 🎮");
        }
    }

    // Rendering Pipeline
    draw() {
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        // 1. Sky & Day/Sunset/Night Gradient
        this.drawSky();

        // 2. Clouds
        this.drawClouds();

        // 3. Parallax Monuments & Skyline
        this.drawLandmarks();

        // 4. Obstacles
        this.drawObstacles();

        // 5. Collectibles
        this.drawCollectibles();

        // 6. Player (Rahul Gandhi)
        this.drawPlayer();

        // 7. Particles
        this.drawParticles();

        // 8. Ground & Rally Flags
        this.drawGround();

        this.ctx.restore();
    }

    drawSky() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        // Interpolate sky between daytime blue, sunset orange, and evening navy
        if (this.dayCycle < 0.5) {
            // Day to Sunset
            const t = this.dayCycle * 2;
            grad.addColorStop(0, '#38BDF8');
            grad.addColorStop(0.6, '#F97316');
            grad.addColorStop(1, '#FEF08A');
        } else {
            // Sunset to Night
            const t = (this.dayCycle - 0.5) * 2;
            grad.addColorStop(0, '#0F172A');
            grad.addColorStop(0.6, '#1E293B');
            grad.addColorStop(1, '#C2410C');
        }

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Distant Sun / Moon
        const sunY = 70 + Math.sin(this.kmTraveled * 0.005) * 30;
        this.ctx.fillStyle = this.dayCycle < 0.6 ? '#FFD54F' : '#F1F5F9';
        this.ctx.beginPath();
        this.ctx.arc(this.width - 70, sunY, 24, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        this.clouds.forEach(c => {
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, 16 * c.scale, 0, Math.PI * 2);
            this.ctx.arc(c.x + 14 * c.scale, c.y - 8 * c.scale, 20 * c.scale, 0, Math.PI * 2);
            this.ctx.arc(c.x + 32 * c.scale, c.y, 16 * c.scale, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawLandmarks() {
        // Distant Monuments (India Gate, Parliament, Red Fort)
        const groundY = this.height - 40;
        this.landmarks.forEach((lm, i) => {
            const x = (lm.x - this.bgOffsetMid + this.width * 2) % (this.width + 200) - 100;
            const img = GameAssets.cache[lm.type];
            if (img) {
                this.ctx.drawImage(img, x, groundY - img.height + 6);
            }
        });

        // City skyline silhouettes
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
        for (let i = 0; i < 6; i++) {
            const bx = (i * 90 - this.bgOffsetNear + this.width * 2) % (this.width + 100) - 60;
            const bh = 50 + (i % 3) * 35;
            this.ctx.fillRect(bx, groundY - bh, 65, bh);
        }
    }

    drawObstacles() {
        this.obstacles.forEach(obs => {
            // TOP OBSTACLE (Pillar / EVM Tower pointing downwards)
            const topGrad = this.ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
            topGrad.addColorStop(0, '#E67E22');
            topGrad.addColorStop(0.5, '#F39C12');
            topGrad.addColorStop(1, '#D35400');

            this.ctx.fillStyle = topGrad;
            this.ctx.beginPath();
            this.ctx.roundRect(obs.x, 0, obs.width, obs.topHeight, [0, 0, 10, 10]);
            this.ctx.fill();
            this.ctx.strokeStyle = '#873600';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Saffron/Lotus crest at bottom of top pillar
            this.ctx.fillStyle = '#FFEAA7';
            this.ctx.fillRect(obs.x + 4, obs.topHeight - 14, obs.width - 8, 10);
            this.ctx.fillStyle = '#1D3557';
            this.ctx.font = 'bold 9px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡ OBSTACLE', obs.x + obs.width / 2, obs.topHeight - 6);

            // BOTTOM OBSTACLE: Political Rival (Modi Cutout on Podium / 56-inch obstacle)
            const bottomH = obs.bottomHeight;
            const bottomY = obs.bottomY;

            // Stone / Podium Base
            const baseGrad = this.ctx.createLinearGradient(obs.x, bottomY + 48, obs.x + obs.width, bottomY + 48);
            baseGrad.addColorStop(0, '#4A5568');
            baseGrad.addColorStop(0.5, '#718096');
            baseGrad.addColorStop(1, '#2D3748');

            this.ctx.fillStyle = baseGrad;
            this.ctx.beginPath();
            this.ctx.roundRect(obs.x, bottomY + 48, obs.width, Math.max(10, bottomH - 48), [10, 10, 0, 0]);
            this.ctx.fill();
            this.ctx.strokeStyle = '#1A202C';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw Modi Cutout Sprite right at bottomY - 10 (perfect alignment, 100% open gap!)
            const modiImg = GameAssets.cache.modiObstacle;
            if (modiImg) {
                const cx = obs.x + (obs.width - 76) / 2;
                this.ctx.drawImage(modiImg, cx, bottomY - 8, 76, 115);
            }

            // Podium microphones
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(obs.x + 8, bottomY + 46, 3, 12);
            this.ctx.fillRect(obs.x + obs.width - 11, bottomY + 46, 3, 12);
            this.ctx.beginPath();
            this.ctx.arc(obs.x + 9.5, bottomY + 44, 3, 0, Math.PI * 2);
            this.ctx.arc(obs.x + obs.width - 9.5, bottomY + 44, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawCollectibles() {
        this.collectibles.forEach(item => {
            const currentY = item.y + Math.sin(item.floatOffset) * 4;
            let img = null;
            if (item.type === 'vote') img = GameAssets.cache.voteToken;
            else if (item.type === 'aloo') img = GameAssets.cache.goldenAloo;
            else if (item.type === 'samvidhan') img = GameAssets.cache.samvidhan;
            else if (item.type === 'heart') img = GameAssets.cache.heart;

            if (img) {
                // Draw slight glow ring
                this.ctx.save();
                this.ctx.shadowBlur = 12;
                this.ctx.shadowColor = item.type === 'samvidhan' ? '#60A5FA' : '#FBBF24';
                this.ctx.drawImage(img, item.x - img.width / 2, currentY - img.height / 2);
                this.ctx.restore();
            }
        });
    }

    drawPlayer() {
        // If blinking from hit
        if (this.player.invincibleBlink > 0 && Math.floor(this.player.invincibleBlink / 4) % 2 === 0) {
            return;
        }

        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.rotation);

        // Draw Samvidhan Invincible Shield Forcefield Bubble
        if (this.shieldActive) {
            this.ctx.strokeStyle = '#60A5FA';
            this.ctx.lineWidth = 3;
            this.ctx.fillStyle = 'rgba(96, 165, 250, 0.25)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Outer pulse
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 34 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw Hero Sprite
        const heroImg = GameAssets.cache.hero;
        if (heroImg) {
            this.ctx.drawImage(heroImg, -40, -32);
        }

        this.ctx.restore();
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawGround() {
        const groundY = this.height - 40;

        // Ground Grass / Asphalt
        this.ctx.fillStyle = '#1B4332'; // Lush Green Grass
        this.ctx.fillRect(0, groundY, this.width, 40);

        // Top grass strip
        this.ctx.fillStyle = '#2D6A4F';
        this.ctx.fillRect(0, groundY, this.width, 8);

        // Tricolor Rally Ribbons / Flags along the ground
        for (let x = -this.groundOffset; x < this.width + 40; x += 36) {
            // Flag pole
            this.ctx.fillStyle = '#718096';
            this.ctx.fillRect(x + 10, groundY - 14, 2, 14);

            // Tricolor flag
            this.ctx.fillStyle = '#FF9933';
            this.ctx.fillRect(x + 12, groundY - 14, 8, 3);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 12, groundY - 11, 8, 3);
            this.ctx.fillStyle = '#138808';
            this.ctx.fillRect(x + 12, groundY - 8, 8, 3);
        }
    }

    loop(timestamp) {
        this.update();
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }
}

// Boot game when window is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new RahulFlyGame();
});
