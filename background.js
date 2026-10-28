
const canvas = document.getElementById("memory-canvas");
const ctx = canvas.getContext("2d");
const background = document.querySelector(
    ".memory-background"
);

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let width = 0;
let height = 0;
let particles = [];
let mouse = { x: -1000, y: -1000 };
let animationId;

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
        100,
        Math.floor((width * height) / 12000)
    );

    particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.5,
        speed: Math.random() * 0.25 + 0.08,
        phase: Math.random() * Math.PI * 2
    }));
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
        if (!reducedMotion.matches) {
            p.y -= p.speed;

            if (p.y < -5) {
                p.y = height + 5;
                p.x = Math.random() * width;
            }
        }

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.hypot(dx, dy);

        let x = p.x;
        let y = p.y;

        // Subtle interaction with the cursor
        if (distance < 100 && distance > 0) {
            const force = (100 - distance) / 100;
            x += (dx / distance) * force * 12;
            y += (dy / distance) * force * 12;
        }

        const opacity =
            0.3 + 0.25 *
            (1 + Math.sin(p.phase + performance.now() / 1800)) / 2;

        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 211, 237, ${opacity})`;
        ctx.fill();
    }

    if (!reducedMotion.matches) {
        animationId = requestAnimationFrame(draw);
    }
}

window.addEventListener("resize", resize);

window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    background.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`
    );
    background.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`
    );
});

window.addEventListener("pointerleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

resize();
draw();


const wash = document.querySelector(".memory-wash");

const poemColors = {
    "poem-1": "blue-memory",
    "poem-2": "gold-memory",
    "poem-3": "orange-memory",
    "poem-4": "grey-memory",
    "poem-5": "gold-memory",
    "poem-6": "sunset-memory",
    "poem-7": "blue-memory",
    "poem-8": "blue-memory",
    "poem-9": "grey-memory"
};

document.querySelectorAll(".poem-box input[type='checkbox']")
    .forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            // Find the poem that was opened.
            if (!checkbox.checked) {
                wash.classList.remove("awake");
                return;
            }

            const poem = checkbox.closest(".poem-box");
            const rect = poem.getBoundingClientRect();

            // Start the spread at the centre of the poem card.
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            wash.style.setProperty("--origin-x", `${x}px`);
            wash.style.setProperty("--origin-y", `${y}px`);

            wash.classList.remove(
                "blue-memory",
                "orange-memory",
                "sunset-memory",
                "grey-memory",
                "gold-memory",
                "awake"
            );

            wash.classList.add(
                poemColors[checkbox.id] || "blue-memory"
            );

            // Restart the animation from the centre.
            void wash.offsetWidth;
            requestAnimationFrame(() => {
                wash.classList.add("awake");
            });
        });
    });
