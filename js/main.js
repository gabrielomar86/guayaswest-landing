document.getElementById("year").textContent = new Date().getFullYear();

const navToggle = document.getElementById("nav-toggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));

const embers = document.querySelector(".scene-embers");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (embers && !prefersReducedMotion) {
  const ctx = embers.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = embers.clientWidth;
    height = embers.clientHeight;
    embers.width = width * dpr;
    embers.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed(p, initial) {
    p.x = width / 2 + (Math.random() - 0.5) * width * 0.72;
    p.y = height * (0.55 + Math.random() * 0.06);
    p.drift = (Math.random() - 0.5) * 0.16;
    p.speed = 0.25 + Math.random() * 0.7;
    p.radius = 0.7 + Math.random() * 1.8;
    p.wobble = 0.012 + Math.random() * 0.022;
    p.phase = Math.random() * Math.PI * 2;
    p.ttl = 280 + Math.random() * 340;
    p.life = initial ? Math.random() * p.ttl : 0;
    p.warm = Math.random() < 0.35;
    return p;
  }

  for (let i = 0; i < 52; i++) {
    particles.push(seed({}, true));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.life += 1;
      if (p.life > p.ttl || p.y < -20) {
        seed(p, false);
        continue;
      }

      p.phase += p.wobble;
      p.x += p.drift + Math.sin(p.phase) * 0.25;
      p.y -= p.speed;

      const alpha = Math.sin((p.life / p.ttl) * Math.PI) * 0.8;
      const tint = p.warm ? "205, 243, 255" : "90, 190, 255";

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tint}, ${alpha * 0.14})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tint}, ${alpha})`;
      ctx.fill();
    }

    frame = requestAnimationFrame(draw);
  }

  function start() {
    if (frame === null) frame = requestAnimationFrame(draw);
  }

  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  resize();
  start();

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}
