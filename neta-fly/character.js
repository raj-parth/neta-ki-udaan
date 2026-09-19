// Netaji Fly - Original Fictional Satire Character ("Mantri Ji")
// Procedurally rendered vector animation with thruster flame & fluttering cape

// Polyfill for roundRect on older/varying canvas implementations
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
        if (r.length === 1) r = [r[0], r[0], r[0], r[0]];
        else if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
        const [tl, tr, br, bl] = r;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

class NetaCharacter {
    constructor() {
        this.frame = 0;
        this.mustacheWobble = 0;
        this.capeWave = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.flameScale = 1;
    }

    update(vy) {
        this.frame += 0.15;
        this.mustacheWobble = Math.sin(this.frame * 2) * 2;
        this.capeWave = Math.sin(this.frame * 2.5) * 4;

        // Thruster flame size responds to upward velocity
        if (vy < 0) {
            this.flameScale = Math.min(1.8, 1.2 + Math.abs(vy) * 0.1);
        } else {
            this.flameScale = Math.max(0.6, this.flameScale - 0.05);
        }

        // Random blinking
        this.blinkTimer++;
        if (this.blinkTimer > 180 && Math.random() < 0.05) {
            this.isBlinking = true;
            if (this.blinkTimer > 195) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }

    // Render character centered at (0,0) in local transformed coordinate space
    draw(ctx, vy = 0) {
        ctx.save();

        // 1. Strapped Rocket Booster (on back, left side)
        this.drawRocketBooster(ctx, vy);

        // 2. Fluttering Rally Sash / Cape
        this.drawCape(ctx);

        // 3. Body & Kurta
        this.drawBody(ctx);

        // 4. Head & Face (Original fictional caricature)
        this.drawHead(ctx);

        // 5. Waving Hand / Arm
        this.drawArm(ctx);

        ctx.restore();
    }

    drawRocketBooster(ctx, vy) {
        ctx.save();
        ctx.translate(-22, 2);

        // Booster tank (Golden brass / metallic canister with comic pressure gauge)
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.roundRect(-8, -12, 14, 24, 4);
        ctx.fill();
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Rocket nozzle
        ctx.fillStyle = '#4B5563';
        ctx.beginPath();
        ctx.moveTo(-6, 12);
        ctx.lineTo(4, 12);
        ctx.lineTo(6, 17);
        ctx.lineTo(-8, 17);
        ctx.closePath();
        ctx.fill();

        // Strapping ropes
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(8, -4);
        ctx.moveTo(-7, 6);
        ctx.lineTo(8, 6);
        ctx.stroke();

        // Thruster Flame & Steam
        const flameLength = 16 * this.flameScale;
        const grad = ctx.createLinearGradient(-1, 17, -1, 17 + flameLength);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, '#FBBF24');
        grad.addColorStop(0.6, '#F97316');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-6, 17);
        ctx.quadraticCurveTo(-1 + (Math.random() * 4 - 2), 17 + flameLength, 4, 17);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawCape(ctx) {
        ctx.save();
        ctx.translate(-16, -2);

        // Saffron/Orange election rally sash fluttering behind
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-14, -8 + this.capeWave, -26, 6 + this.capeWave);
        ctx.quadraticCurveTo(-14, 16 - this.capeWave, 0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#C2410C';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tricolor stripes on cape tip
        ctx.fillStyle = '#16A34A'; // Green stripe
        ctx.beginPath();
        ctx.arc(-22, 6 + this.capeWave, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBody(ctx) {
        // Classic White Kurta
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.roundRect(-10, -6, 26, 22, [6, 10, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Kurta collar & buttons
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(6, -6);
        ctx.lineTo(6, 6);
        ctx.stroke();

        // Gold chest badge ("#1")
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(1, 1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1;
        ctx.stroke();

        // White Churidar / Pajama legs tucked backwards
        ctx.fillStyle = '#F1F5F9';
        ctx.beginPath();
        ctx.roundRect(-20, 8, 14, 7, 3);
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.stroke();

        // Traditional Kolhapuri/Mojari shoe
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.roundRect(-24, 10, 8, 5, 2);
        ctx.fill();
    }

    drawHead(ctx) {
        ctx.save();
        ctx.translate(14, -10);

        // Round jovial face
        ctx.fillStyle = '#FED7AA';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FDBA74';
        ctx.lineWidth = 1;
        ctx.stroke();

        // White Khadi Topi (Signature political cap)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-13, -3);
        ctx.lineTo(-8, -17);
        ctx.quadraticCurveTo(2, -20, 12, -14);
        ctx.lineTo(13, -3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tricolor band on cap
        ctx.fillStyle = '#F97316';
        ctx.fillRect(-10, -5, 21, 2);
        ctx.fillStyle = '#16A34A';
        ctx.fillRect(-10, -3, 21, 2);

        // Round glasses (Gold wireframes)
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.8;
        // Right lens
        ctx.beginPath();
        ctx.arc(5, -2, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        // Left lens
        ctx.beginPath();
        ctx.arc(-4, -2, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        // Bridge
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(1, -2);
        ctx.stroke();

        // Eyes behind glasses
        if (this.isBlinking) {
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-6, -2);
            ctx.lineTo(-2, -2);
            ctx.moveTo(3, -2);
            ctx.lineTo(7, -2);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
            ctx.arc(5, -2, 1.8, 0, Math.PI * 2);
            ctx.fill();
            // Eye sparkles
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-3.5, -2.5, 0.7, 0, Math.PI * 2);
            ctx.arc(5.5, -2.5, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rosy cheeks
        ctx.fillStyle = 'rgba(248, 113, 113, 0.4)';
        ctx.beginPath();
        ctx.arc(-8, 3, 3, 0, Math.PI * 2);
        ctx.arc(8, 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Big Majestic Twirled Mustache (Signature feature!)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(0, 3);
        // Left mustache wing (twirled up)
        ctx.quadraticCurveTo(-7, 2, -14, 2 + this.mustacheWobble);
        ctx.quadraticCurveTo(-10, 7, 0, 5);
        // Right mustache wing (twirled up)
        ctx.quadraticCurveTo(7, 2, 14, 2 + this.mustacheWobble);
        ctx.quadraticCurveTo(10, 7, 0, 3);
        ctx.fill();

        // Cheerful mouth under mustache
        ctx.fillStyle = '#991B1B';
        ctx.beginPath();
        ctx.arc(0, 7, 3, 0, Math.PI);
        ctx.fill();

        ctx.restore();
    }

    drawArm(ctx) {
        ctx.save();
        ctx.translate(6, 4);

        // Forward waving rally hand
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.roundRect(0, -2, 14, 6, 3);
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Waving hand
        ctx.fillStyle = '#FED7AA';
        ctx.beginPath();
        ctx.arc(14, 1, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.NetaCharacter = NetaCharacter;
