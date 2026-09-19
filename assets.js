// Visual Asset Generators and Renderers for Rahul Fly
// Generates crisp Canvas sprites and landmark illustrations

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

const GameAssets = {
    // Cache for pre-rendered offscreen canvases
    cache: {},
    images: {
        rahulFace: null,
        modiFace: null
    },

    init(onComplete) {
        // Pre-create initial canvases
        this.cache.samvidhan = this.createSamvidhanCanvas();
        this.cache.goldenAloo = this.createGoldenAlooCanvas();
        this.cache.heart = this.createHeartCanvas();
        this.cache.voteToken = this.createVoteTokenCanvas();
        this.cache.indiaGate = this.createIndiaGateCanvas();
        this.cache.parliament = this.createParliamentCanvas();
        this.cache.redFort = this.createRedFortCanvas();

        // Load real photo face cutouts
        const rImg = new Image();
        rImg.src = 'assets/rahul_face.png';
        const mImg = new Image();
        mImg.src = 'assets/modi_face.png';

        this.images.rahulFace = rImg;
        this.images.modiFace = mImg;

        let loadedCount = 0;
        const checkDone = () => {
            loadedCount++;
            this.cache.hero = this.createHeroCanvas();
            this.cache.modiObstacle = this.createModiObstacleCanvas();
            if (onComplete) onComplete();
        };

        rImg.onload = checkDone;
        mImg.onload = checkDone;

        // In case images are already cached
        if (rImg.complete) checkDone();
        if (mImg.complete) checkDone();

        this.cache.hero = this.createHeroCanvas();
        this.cache.modiObstacle = this.createModiObstacleCanvas();
    },

    // 1. Rahul Gandhi Flying Sprite
    createHeroCanvas() {
        const c = document.createElement('canvas');
        c.width = 80;
        c.height = 64;
        const ctx = c.getContext('2d');

        // Draw Hero facing right
        // Cape (fluttering red / saffron accent)
        ctx.save();
        ctx.translate(40, 32);

        // Fluttering Cape
        ctx.fillStyle = '#E63946';
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.bezierCurveTo(-34, -18, -38, 4, -32, 14);
        ctx.bezierCurveTo(-26, 8, -20, 4, -16, 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#9B111E';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // White Polo T-shirt / Body
        ctx.fillStyle = '#F8F9FA';
        ctx.beginPath();
        ctx.ellipse(-4, 4, 15, 11, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#CED4DA';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Collar
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.lineTo(-4, -6);
        ctx.lineTo(-1, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tricolor chest badge
        ctx.fillStyle = '#FF9933'; // Saffron
        ctx.fillRect(-6, 2, 8, 2);
        ctx.fillStyle = '#FFFFFF'; // White
        ctx.fillRect(-6, 4, 8, 2);
        ctx.fillStyle = '#138808'; // Green
        ctx.fillRect(-6, 6, 8, 2);

        // Legs / trousers (Navy blue/khaki sporty trackpants)
        ctx.fillStyle = '#2B2D42';
        ctx.beginPath();
        ctx.roundRect(-22, 5, 14, 7, 3);
        ctx.fill();

        // Sports shoes (White sneaker with orange stripe)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-25, 9, 10, 5, 2);
        ctx.fill();
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(-22, 11, 4, 2);

        // Head (Real Photo of Rahul Gandhi)
        if (this.images.rahulFace && this.images.rahulFace.complete) {
            ctx.drawImage(this.images.rahulFace, -2, -26, 36, 36);
        } else {
            ctx.fillStyle = '#FFD5B8';
            ctx.beginPath();
            ctx.ellipse(12, -7, 12, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#E0A98B';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Hair
            ctx.fillStyle = '#212529';
            ctx.beginPath();
            ctx.moveTo(4, -14);
            ctx.bezierCurveTo(9, -22, 22, -20, 24, -12);
            ctx.bezierCurveTo(25, -6, 20, -5, 17, -9);
            ctx.bezierCurveTo(12, -9, 8, -6, 4, -14);
            ctx.fill();

            // Light Beard
            ctx.fillStyle = '#5A5A5A';
            ctx.beginPath();
            ctx.ellipse(15, -2, 7, 5, 0.2, 0, Math.PI);
            ctx.fill();

            // Smiling Eyes
            ctx.fillStyle = '#1B1B1B';
            ctx.beginPath();
            ctx.arc(17, -8, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flying Forward Arm (pointing forward / waving)
        ctx.fillStyle = '#F8F9FA';
        ctx.beginPath();
        ctx.roundRect(4, 2, 16, 6, 3);
        ctx.fill();
        ctx.strokeStyle = '#CED4DA';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Fist / Hand forward
        ctx.fillStyle = '#FFD5B8';
        ctx.beginPath();
        ctx.arc(22, 5, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return c;
    },

    // 2. Modi Cutout Caricature Obstacle
    createModiObstacleCanvas() {
        const c = document.createElement('canvas');
        c.width = 90;
        c.height = 130;
        const ctx = c.getContext('2d');

        // Wooden / Acrylic Cutout Stand outline
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(45, 122, 35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cutout Border Card
        ctx.save();
        ctx.translate(45, 60);

        // Modi Kurta & Nehru Jacket (Vibrant Saffron / Orange Kurta + Golden/Blue Jacket)
        ctx.fillStyle = '#FF7700'; // Saffron Kurta
        ctx.beginPath();
        ctx.roundRect(-24, 5, 48, 48, 8);
        ctx.fill();

        // Modi Jacket
        ctx.fillStyle = '#1B4965'; // Elegant Blue Modi Jacket
        ctx.beginPath();
        ctx.roundRect(-18, 8, 36, 42, 6);
        ctx.fill();

        // Jacket pocket & pen
        ctx.fillStyle = '#F4A261';
        ctx.fillRect(-12, 18, 8, 3);
        ctx.fillStyle = '#E76F51';
        ctx.fillRect(-9, 14, 2, 4);

        // Signature Folded Hands / Wave
        ctx.fillStyle = '#FFD1A4';
        ctx.beginPath();
        ctx.arc(18, 16, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D4A373';
        ctx.stroke();

        // Head (Real Photo of Narendra Modi)
        if (this.images.modiFace && this.images.modiFace.complete) {
            ctx.drawImage(this.images.modiFace, -26, -46, 52, 52);
        } else {
            ctx.fillStyle = '#FFD1A4';
            ctx.beginPath();
            ctx.ellipse(0, -20, 20, 22, 0, 0, Math.PI * 2);
            ctx.fill();

            // White Hair
            ctx.fillStyle = '#EDEDED';
            ctx.beginPath();
            ctx.ellipse(0, -35, 18, 11, 0, Math.PI, 0);
            ctx.fill();

            // Full White Beard
            ctx.fillStyle = '#F8F9FA';
            ctx.beginPath();
            ctx.moveTo(-16, -18);
            ctx.bezierCurveTo(-20, -5, -16, 12, 0, 15);
            ctx.bezierCurveTo(16, 12, 20, -5, 16, -18);
            ctx.closePath();
            ctx.fill();

            // Spectacles
            ctx.strokeStyle = '#2B2D42';
            ctx.lineWidth = 2;
            ctx.strokeRect(-12, -26, 9, 7);
            ctx.strokeRect(3, -26, 9, 7);
        }
        ctx.stroke();

        // Smiling Eyes behind glasses
        ctx.fillStyle = '#1D3557';
        ctx.beginPath();
        ctx.arc(-7, -23, 2, 0, Math.PI * 2);
        ctx.arc(7, -23, 2, 0, Math.PI * 2);
        ctx.fill();

        // 56-inch chest label badge
        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.roundRect(-22, 45, 44, 12, 4);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('56-INCH', 0, 51);

        ctx.restore();
        return c;
    },

    // 3. Samvidhan (Constitution Book - Blue & Gold)
    createSamvidhanCanvas() {
        const c = document.createElement('canvas');
        c.width = 38;
        c.height = 42;
        const ctx = c.getContext('2d');

        // Book Cover (Iconic Blue Constitution)
        ctx.fillStyle = '#1A365D';
        ctx.beginPath();
        ctx.roundRect(4, 4, 30, 34, 4);
        ctx.fill();
        ctx.strokeStyle = '#D69E2E'; // Gold border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ashoka Chakra / Golden Emblem
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(19, 18, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B7791F';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Spokes
        ctx.strokeStyle = '#744210';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(19, 18);
            ctx.lineTo(19 + Math.cos(ang) * 6, 18 + Math.sin(ang) * 6);
            ctx.stroke();
        }

        // Text
        ctx.fillStyle = '#FEFCBF';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('संविधान', 19, 32);

        return c;
    },

    // 4. Golden Aloo (Aloo to Gold Meme Bonus)
    createGoldenAlooCanvas() {
        const c = document.createElement('canvas');
        c.width = 36;
        c.height = 36;
        const ctx = c.getContext('2d');

        // Glowing Golden Nugget / Potato
        const grad = ctx.createRadialGradient(18, 18, 2, 18, 18, 16);
        grad.addColorStop(0, '#FFF9C4');
        grad.addColorStop(0.4, '#FDD835');
        grad.addColorStop(0.8, '#F57F17');
        grad.addColorStop(1, '#B78103');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(18, 18, 14, 11, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 5x Badge
        ctx.fillStyle = '#D90429';
        ctx.beginPath();
        ctx.arc(26, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('5X', 26, 10);

        return c;
    },

    // 5. Mohabbat Ki Dukaan (Heart Extra Life)
    createHeartCanvas() {
        const c = document.createElement('canvas');
        c.width = 34;
        c.height = 34;
        const ctx = c.getContext('2d');

        // Red Heart
        ctx.fillStyle = '#E63946';
        ctx.beginPath();
        ctx.moveTo(17, 10);
        ctx.bezierCurveTo(17, 6, 10, 3, 6, 9);
        ctx.bezierCurveTo(2, 15, 6, 21, 17, 28);
        ctx.bezierCurveTo(28, 21, 32, 15, 28, 9);
        ctx.bezierCurveTo(24, 3, 17, 6, 17, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sparkle
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(10, 10, 2, 0, Math.PI * 2);
        ctx.fill();

        return c;
    },

    // 6. Vote / Hand Token
    createVoteTokenCanvas() {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext('2d');

        // Gold coin base
        const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
        grad.addColorStop(0, '#FFE082');
        grad.addColorStop(0.7, '#FFB300');
        grad.addColorStop(1, '#FF8F00');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hand Symbol / Tricolor stripe inside
        ctx.fillStyle = '#1D3557';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✋', 16, 16);

        return c;
    },

    // 7. India Gate Silhouette (Parallax background)
    createIndiaGateCanvas() {
        const c = document.createElement('canvas');
        c.width = 160;
        c.height = 140;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#4A5568';
        // Base
        ctx.fillRect(20, 125, 120, 15);
        ctx.fillRect(30, 115, 100, 10);
        // Left & Right Pillars
        ctx.fillRect(36, 35, 28, 80);
        ctx.fillRect(96, 35, 28, 80);
        // Arch top
        ctx.beginPath();
        ctx.arc(80, 50, 20, Math.PI, 0, false);
        ctx.fill();
        // Top lintel & tiers
        ctx.fillRect(30, 25, 100, 10);
        ctx.fillRect(45, 15, 70, 10);
        ctx.fillRect(60, 8, 40, 7);
        ctx.fillRect(72, 2, 16, 6);

        // Indian Tricolor atop
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(78, -3, 8, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(78, -1, 8, 2);
        ctx.fillStyle = '#138808';
        ctx.fillRect(78, 1, 8, 2);

        return c;
    },

    // 8. Parliament (Sansad Bhavan) Silhouette
    createParliamentCanvas() {
        const c = document.createElement('canvas');
        c.width = 180;
        c.height = 110;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#4A5568';
        // Base
        ctx.fillRect(10, 85, 160, 25);
        // Colonnade pillars
        for (let i = 20; i <= 150; i += 12) {
            ctx.fillRect(i, 40, 5, 45);
        }
        // Roof
        ctx.fillRect(14, 32, 152, 8);
        // Dome
        ctx.beginPath();
        ctx.arc(90, 32, 26, Math.PI, 0, false);
        ctx.fill();
        // Spire
        ctx.fillRect(88, 2, 4, 6);

        return c;
    },

    // 9. Red Fort (Lal Qila) Silhouette
    createRedFortCanvas() {
        const c = document.createElement('canvas');
        c.width = 170;
        c.height = 120;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#4A5568';
        // Main wall
        ctx.fillRect(15, 60, 140, 60);
        // Ramparts / battlements
        for (let i = 15; i < 155; i += 10) {
            ctx.fillRect(i, 52, 6, 8);
        }
        // Left & Right Domes
        ctx.beginPath();
        ctx.arc(35, 45, 15, Math.PI, 0, false);
        ctx.arc(135, 45, 15, Math.PI, 0, false);
        ctx.fill();
        // Center Grand Dome
        ctx.beginPath();
        ctx.arc(85, 35, 20, Math.PI, 0, false);
        ctx.fill();

        return c;
    }
};

window.GameAssets = GameAssets;
