
(() => {
    const treeCanvas = document.getElementById("treeCanvas");
    const trailCanvas = document.getElementById("leafTrailCanvas");

    // Only run on pages containing both canvases
    if (!treeCanvas || !trailCanvas) return;

    const ctx = treeCanvas.getContext("2d");
    const trailCtx = trailCanvas.getContext("2d");

    const STEP_SIZE = 5;
    const MAX_TREE_HEIGHT = 700;
    const SEASON_DURATION = 12000;
    const SEASONS = ["spring", "summer", "autumn", "winter"];

    let branches = [];
    let leaves = [];
    let fallingLeaves = [];
    let seasonIndex = 0;
    let season = "spring";
    let seasonStart = performance.now();
    let lastFrame = seasonStart;
    let growing = true;

    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (const canvas of [treeCanvas, trailCanvas]) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            const context = canvas === treeCanvas ? ctx : trailCtx;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        drawTree();
    }

    function resetTree() {
        branches = [{
            x: window.innerWidth / 2,
            y: window.innerHeight,
            angle: -90,
            thickness: 32,
            life: 175,
            trunk: true,
            segments: []
        }];

        leaves = [];
        fallingLeaves = [];
        growing = true;
        seasonIndex = 0;
        season = "spring";
        seasonStart = performance.now();

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        trailCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function growBranch(b) {
        if (b.y < window.innerHeight - MAX_TREE_HEIGHT) {
    b.life = 0;
    return;
}
        if (b.life <= 0 || b.thickness < 0.8) return;

        const oldX = b.x;
        const oldY = b.y;

        b.x += Math.cos(b.angle * Math.PI / 180) * STEP_SIZE;
        b.y += Math.sin(b.angle * Math.PI / 180) * STEP_SIZE;
        b.angle += (Math.random() - 0.5) * 3;
        b.thickness *= 1.;
        b.life--;

        b.segments.push({
            x1: oldX,
            y1: oldY,
            x2: b.x,
            y2: b.y,
            thickness: b.thickness
        });

        if (!b.trunk && Math.random() < 0.1) {
            addLeaf(b.x, b.y);
        }

        if (
            branches.length < 1500 &&
            Math.random() < 0.035 &&
            b.thickness > 2.2 &&
            b.life > 10
        ) {
            for (const direction of [-1, 1]) {
                branches.push({
                    x: b.x,
                    y: b.y,
                    angle: b.angle + direction * (20 + Math.random() * 35),
                    thickness: b.thickness * 0.62,
                    life: Math.floor(b.life * 0.65),
                    trunk: false,
                    segments: []
                });
            }
        }
    }

    function addLeaf(x, y) {
        const palettes = {
            spring: ["#8BCF83", "#66BB6A", "#A5D98B"],
            summer: ["#2E7D32", "#388E3C", "#43A047"],
            autumn: ["#FFB74D", "#FB8C00", "#C62828"]
        };

        const palette = palettes[season] || palettes.spring;

        leaves.push({
            x,
            y,
            size: Math.random() * 3 + 2,
            color: palette[Math.floor(Math.random() * palette.length)],
            angle: Math.random() * Math.PI
        });
    }

    function drawLeaf(context, leaf, alpha = 1) {
        context.save();
        context.globalAlpha = alpha;
        context.translate(leaf.x, leaf.y);
        context.rotate(leaf.angle || 0);
        context.fillStyle = leaf.color;
        context.beginPath();
        context.ellipse(
            0, 0, leaf.size, leaf.size * 1.3,
            0, 0, Math.PI * 2
        );
        context.fill();
        context.restore();
    }

    function drawTree() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const b of branches) {
            ctx.strokeStyle = "#76502F";
            ctx.lineCap = "round";

            for (const s of b.segments) {
                ctx.beginPath();
                ctx.moveTo(s.x1, s.y1);
                ctx.lineTo(s.x2, s.y2);
                ctx.lineWidth = Math.max(0.6, s.thickness);
                ctx.stroke();
            }
        }

        if (season !== "winter") {
            for (const leaf of leaves) {
                drawLeaf(ctx, leaf);
            }
        }
    }

    function updateFallingLeaves(delta) {
        // Fade only the trail canvas, not the tree
        trailCtx.save();
        trailCtx.globalCompositeOperation = "destination-out";
        trailCtx.globalAlpha = 0.12;
        trailCtx.fillRect(
            0, 0, window.innerWidth, window.innerHeight
        );
        trailCtx.restore();

        if (season === "autumn" && leaves.length && Math.random() < 0.06) {
            const leaf = leaves.splice(
                Math.floor(Math.random() * leaves.length), 1
            )[0];

            fallingLeaves.push({
                ...leaf,
                vx: Math.random() * 0.7 - 0.35,
                vy: Math.random() * 1.1 + 0.6,
                sway: Math.random() * 6,
                trail: []
            });
        }

        const step = Math.min(delta / 16.67, 2.5);

        for (const leaf of fallingLeaves) {
            leaf.sway += 0.025 * delta;
            leaf.x += (leaf.vx + Math.sin(leaf.sway) * 0.45) * step;
            leaf.y += leaf.vy * step;

            leaf.trail.push({ x: leaf.x, y: leaf.y });
            if (leaf.trail.length > 8) leaf.trail.shift();

            if (leaf.trail.length > 1) {
                trailCtx.beginPath();
                trailCtx.moveTo(leaf.trail[0].x, leaf.trail[0].y);

                for (let i = 1; i < leaf.trail.length; i++) {
                    trailCtx.lineTo(
                        leaf.trail[i].x, leaf.trail[i].y
                    );
                }

                trailCtx.strokeStyle = leaf.color;
                trailCtx.lineWidth = 2;
                trailCtx.globalAlpha = 0.22;
                trailCtx.stroke();
                trailCtx.globalAlpha = 1;
            }

            drawLeaf(trailCtx, leaf);
        }

        fallingLeaves = fallingLeaves.filter(
            leaf => leaf.y < window.innerHeight + 30
        );
        trailCtx.globalAlpha = 1;
    }

    function changeSeason(now) {
        if (now - seasonStart < SEASON_DURATION) return;

        seasonIndex = (seasonIndex + 1) % SEASONS.length;
        season = SEASONS[seasonIndex];
        seasonStart = now;

        if (season === "summer") {
            const existing = leaves.slice();

            for (const leaf of existing) {
                if (Math.random() < 0.55) {
                    addLeaf(
                        leaf.x + (Math.random() - 0.5) * 18,
                        leaf.y + (Math.random() - 0.5) * 18
                    );
                }
            }
        }

        if (season === "autumn") {
            const colours = [
                "#FFB74D", "#FB8C00", "#E65100", "#C62828"
            ];

            for (const leaf of leaves) {
                leaf.color = colours[
                    Math.floor(Math.random() * colours.length)
                ];
            }
        }

        if (season === "winter") {
            leaves = [];
        }

        if (season === "spring") {
    resetTree();
}

        drawTree();
    }

    function animate(now) {
        const delta = now - lastFrame;
        lastFrame = now;

        changeSeason(now);

        if (season === "spring" && growing) {
            let active = false;
            const count = branches.length;

            for (let i = 0; i < count; i++) {
                const b = branches[i];

                if (b.life > 0 && b.thickness >= 0.8) {
                    growBranch(b);
                    active = true;
                }
            }

            if (!active) growing = false;
            drawTree();
        }

        updateFallingLeaves(delta);
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);

    resetTree();
    resizeCanvas();
    lastFrame = performance.now();
    requestAnimationFrame(animate);
})();