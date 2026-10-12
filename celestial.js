
document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // ELEMENTS
    // ==========================================

    const celestialWheel = document.getElementById("celestial-wheel");
    const dayNightBackground = document.getElementById("dayNightBackground");

    const starCanvas = document.getElementById("starCanvas");
    const starTimeCanvas = document.getElementById("starTimeCanvas");
    const dayNightCanvas = document.getElementById("dayNightCanvas");

    const starCtx = starCanvas?.getContext("2d");
    const starTimeCtx = starTimeCanvas?.getContext("2d");

    // ==========================================
    // SCROLL-BASED CELESTIAL EFFECTS
    // ==========================================

    let scrollTicking = false;

    function updateCelestialRotation() {
        const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = maxScroll > 0
            ? Math.max(0, Math.min(1, window.scrollY / maxScroll))
            : 0;

        const rotation = progress * 360;

        if (celestialWheel) {
            celestialWheel.style.transform =
                `translate(-50%, -50%) rotate(${rotation}deg)`;
        }

        
if (dayNightBackground) {
    dayNightBackground.style.background = `
        conic-gradient(
            from ${rotation - 90}deg at 50% 50%,
            #F8E5AD 0deg,
            #E8C77B 80deg,
            #D9D4C3 90deg,
            #343B69 100deg,
            #202747 180deg,
            #11162E 270deg,
            #F8E5AD 360deg
        )
    `;
}

    }

    function requestCelestialUpdate() {
        if (scrollTicking) return;

        scrollTicking = true;

        requestAnimationFrame(() => {
            updateCelestialRotation();
            scrollTicking = false;
        });
    }

    window.addEventListener("scroll", requestCelestialUpdate, {
        passive: true
    });

    // ==========================================
    // CANVAS SIZING
    // ==========================================

    function resizeCanvas(canvas, ctx) {
        if (!canvas || !ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);

        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ==========================================
    // STAR FIELD
    // ==========================================

    let stars = [];

    function createStars() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const count = Math.min(
            180,
            Math.floor((width * height) / 7000)
        );

        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.65 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            phase: Math.random() * Math.PI * 2
        }));
    }

    function drawStarField(ctx, timestamp) {
        if (!ctx) return;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const star of stars) {
            const twinkle =
                Math.sin(timestamp * star.twinkleSpeed + star.phase) * 0.2;

            const opacity = Math.max(
                0.1,
                Math.min(1, star.opacity + twinkle)
            );

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 248, 220, ${opacity})`;
            ctx.fill();
        }
    }

    function drawStars(timestamp = 0) {
        if (document.hidden) return;

        drawStarField(starCtx, timestamp);

        // Also draw on the second canvas if it exists.
        // Remove this line if you want starTimeCanvas to
        // have a separate animation.
        if (starTimeCtx && starTimeCtx !== starCtx) {
            drawStarField(starTimeCtx, timestamp);
        }

        requestAnimationFrame(drawStars);
    }

    // ==========================================
    // INITIALIZATION AND RESIZING
    // ==========================================

    function resizeAll() {
        resizeCanvas(starCanvas, starCtx);
        resizeCanvas(starTimeCanvas, starTimeCtx);

        createStars();
        updateCelestialRotation();

        // The canvases are transparent overlays.
        // Clear the day/night canvas if it has a 2D context.
        if (dayNightCanvas) {
            const ctx = dayNightCanvas.getContext("2d");

            if (ctx) {
                ctx.clearRect(
                    0,
                    0,
                    dayNightCanvas.width,
                    dayNightCanvas.height
                );
            }
        }
    }

    window.addEventListener("resize", resizeAll);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            requestCelestialUpdate();
            requestAnimationFrame(drawStars);
        }
    });

    resizeAll();

    if (starCtx || starTimeCtx) {
        requestAnimationFrame(drawStars);
    }
});
