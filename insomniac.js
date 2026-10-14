
document.querySelectorAll(".poem-box.dream-box").forEach(box => {
    const canvas = document.createElement("canvas");
    canvas.className = "dream-stars";
    box.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let stars = [];

    function resizeCanvas() {
        canvas.width = box.clientWidth;
        canvas.height = box.clientHeight;

        stars = Array.from({ length: Math.floor(
            (canvas.width * canvas.height) / 1800
        ) }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.4,
            alpha: Math.random() * 0.7 + 0.2,
            speed: Math.random() * 0.025 + 0.005,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() < 0.2
                ? "#C9D7FF"
                : Math.random() < 0.2
                    ? "#FFF0C2"
                    : "#FFFFFF"
        }));
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now();

        stars.forEach(star => {
            const flicker = Math.sin(
                time * star.speed + star.phase
            ) * 0.25;

            ctx.globalAlpha = Math.max(
                0.1,
                Math.min(1, star.alpha + flicker)
            );

            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(
                star.x,
                star.y,
                star.r,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    drawStars();

    new ResizeObserver(resizeCanvas).observe(box);
});