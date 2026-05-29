// ============================================================
//  ULTIMATE 8D EFFECTS ENGINE
//  Created with full creative freedom
// ============================================================

// ===== SIMPLEX NOISE =====
class SimplexNoise {
    constructor() {
        this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        this.perm = [];
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }
    noise2D(x, y) {
        const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
        let s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s);
        let t = (i + j) * G2, x0 = x - (i - t), y0 = y - (j - t);
        let i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
        let x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        i &= 255; j &= 255;
        let gi0 = this.perm[i + this.perm[j]] % 12;
        let gi1 = this.perm[i + i1 + this.perm[j + j1]] % 12;
        let gi2 = this.perm[i + 1 + this.perm[j + 1]] % 12;
        let n0 = 0, n1 = 0, n2 = 0;
        let t0 = 0.5 - x0*x0 - y0*y0;
        if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (this.grad3[gi0][0]*x0 + this.grad3[gi0][1]*y0); }
        let t1 = 0.5 - x1*x1 - y1*y1;
        if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (this.grad3[gi1][0]*x1 + this.grad3[gi1][1]*y1); }
        let t2 = 0.5 - x2*x2 - y2*y2;
        if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (this.grad3[gi2][0]*x2 + this.grad3[gi2][1]*y2); }
        return 70 * (n0 + n1 + n2);
    }
}
const simplex = new SimplexNoise();

// ===== SPRING PHYSICS =====
class Spring {
    constructor(stiffness = 0.08, damping = 0.7) {
        this.stiffness = stiffness;
        this.damping = damping;
        this.value = 0;
        this.target = 0;
        this.velocity = 0;
    }
    update() {
        this.velocity += (this.target - this.value) * this.stiffness;
        this.velocity *= this.damping;
        this.value += this.velocity;
        return this.value;
    }
}

// ===== EASING FUNCTIONS =====
const ease = {
    inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    out: t => 1 - Math.pow(1 - t, 3),
    elastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
    bounce: t => { const n = 7.5625, d = 2.75; if (t < 1/d) return n*t*t; if (t < 2/d) return n*(t-=1.5/d)*t+0.75; if (t < 2.5/d) return n*(t-=2.25/d)*t+0.9375; return n*(t-=2.625/d)*t+0.984375; }
};

// ===== GLOBAL STATE =====
let mouseX = 0, mouseY = 0;
let scrollY = 0;
let time = 0;
const isMobile = 'ontouchstart' in window;

// ===== PRELOADER =====
const preloaderBar = document.getElementById('preloaderBar');
let loadProgress = 0;
const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 12 + 3;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(loadInterval);
        setTimeout(() => {
            document.getElementById('preloader').classList.add('hidden');
            // Trigger hero animations after preloader
            setTimeout(initHeroAnimations, 300);
        }, 400);
    }
    if (preloaderBar) preloaderBar.style.width = loadProgress + '%';
}, 100);

// ===== HERO ENTRANCE ANIMATIONS =====
function initHeroAnimations() {
    const elements = document.querySelectorAll('.hero .anim-fade-up, .hero .anim-scale, .hero .anim-scale-rotate, .hero .anim-pop');
    elements.forEach(el => {
        const delay = parseInt(el.getAttribute('data-delay') || 0);
        setTimeout(() => el.classList.add('in-view'), delay);
    });
}

// ===== SCROLL PROGRESS =====
const scrollProgressEl = document.getElementById('scrollProgress');

// ===== 8D CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorGlow = document.getElementById('cursorGlow');
const cursorSpringX = new Spring(0.15, 0.7);
const cursorSpringY = new Spring(0.15, 0.7);
const glowSpringX = new Spring(0.06, 0.8);
const glowSpringY = new Spring(0.06, 0.8);

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorSpringX.target = mouseX;
        cursorSpringY.target = mouseY;
        glowSpringX.target = mouseX;
        glowSpringY.target = mouseY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
        cursorRing.style.left = cursorSpringX.update() + 'px';
        cursorRing.style.top = cursorSpringY.update() + 'px';
        cursorGlow.style.left = glowSpringX.update() + 'px';
        cursorGlow.style.top = glowSpringY.update() + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover
    document.querySelectorAll('a, button, .tilt-card, .magnetic, .tech-tag').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('hover');
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('hover');
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
} else {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    if (cursorGlow) cursorGlow.style.display = 'none';
}

// ===== CURSOR TRAIL =====
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 12;
        this.lastX = 0;
        this.lastY = 0;
    }
    update(x, y) {
        const dx = x - this.lastX;
        const dy = y - this.lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        this.lastX = x;
        this.lastY = y;
        if (speed > 3 && !isMobile) {
            this.trails.push({ x, y, life: 1, size: Math.min(speed * 0.3, 6) });
            if (this.trails.length > this.maxTrails) this.trails.shift();
        }
        this.trails.forEach(t => {
            t.life -= 0.04;
            t.size *= 0.97;
        });
        this.trails = this.trails.filter(t => t.life > 0);
    }
    draw(ctx) {
        this.trails.forEach(t => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 124, 255, ${t.life * 0.3})`;
            ctx.fill();
        });
    }
}
const cursorTrail = new CursorTrail();

// ===== PARTICLE SYSTEM WITH 8D DEPTH =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 5;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() * 40 + 210;
        this.noiseOffset = Math.random() * 1000;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }
    update(t) {
        const nx = simplex.noise2D(this.noiseOffset + t * 0.0003, 0) * 0.2;
        const ny = simplex.noise2D(0, this.noiseOffset + t * 0.0003) * 0.2;
        this.x += this.speedX + nx;
        this.y += this.speedY + ny;
        if (mouseX && mouseY) {
            const dx = mouseX - this.x, dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 * (1 + this.z * 0.2)) {
                this.x += dx * 0.001 / (1 + this.z * 0.2);
                this.y += dy * 0.001 / (1 + this.z * 0.2);
            }
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
    }
    draw(t) {
        const depthScale = 1 + this.z * 0.15;
        const pulse = Math.sin(t * 0.001 + this.pulsePhase) * 0.3 + 0.7;
        const size = this.size * depthScale * pulse;
        const opacity = this.opacity * (0.5 + this.z * 0.1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 65%, ${opacity})`;
        ctx.fill();
    }
}

const particles = [];
const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
for (let i = 0; i < particleCount; i++) particles.push(new Particle());

function drawConnections(t) {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dz = (particles[i].z - particles[j].z) * 30;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 150) {
                const opacity = 0.08 * (1 - dist / 150) * (1 + (particles[i].z + particles[j].z) * 0.1);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(79, 124, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
        if (mouseX && mouseY) {
            const dx = mouseX - particles[i].x, dy = mouseY - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouseX, mouseY);
                ctx.strokeStyle = `rgba(79, 124, 255, ${0.15 * (1 - dist / 200)})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    time = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(time); p.draw(time); });
    drawConnections(time);
    cursorTrail.update(mouseX, mouseY);
    cursorTrail.draw(ctx);
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== 8D DEPTH LAYERS =====
const depthLayers = [
    document.getElementById('depthLayer1'),
    document.getElementById('depthLayer2'),
    document.getElementById('depthLayer3')
];
const layerSprings = depthLayers.map(() => ({ x: new Spring(0.03, 0.85), y: new Spring(0.03, 0.85) }));

function animateDepthLayers() {
    depthLayers.forEach((layer, i) => {
        if (!layer) return;
        const factor = (i + 1) * 0.02;
        layerSprings[i].x.target = mouseX * factor;
        layerSprings[i].y.target = mouseY * factor;
        layer.style.transform = `translate(${layerSprings[i].x.update()}px, ${layerSprings[i].y.update()}px)`;
    });
    requestAnimationFrame(animateDepthLayers);
}
animateDepthLayers();

// ===== FLOATING TECH ICONS (RANDOM PAGE-WIDE) =====
class FloatingIcon {
    constructor(el) {
        this.el = el;
        this.speed = parseFloat(el.getAttribute('data-speed')) || 1;
        this.noiseOffsetX = Math.random() * 1000;
        this.noiseOffsetY = Math.random() * 1000;
        this.noiseOffsetR = Math.random() * 1000;
        this.springX = new Spring(0.005 * this.speed, 0.95);
        this.springY = new Spring(0.005 * this.speed, 0.95);
        this.springR = new Spring(0.01, 0.92);
        this.x = Math.random() * (window.innerWidth - 60);
        this.y = Math.random() * (window.innerHeight - 60);
        this.springX.value = this.x;
        this.springY.value = this.y;
        this.springX.target = this.x;
        this.springY.target = this.y;
        this.baseSize = 40 + Math.random() * 20;
        this.phase = Math.random() * Math.PI * 2;
    }

    update(t) {
        const w = window.innerWidth - 60;
        const h = window.innerHeight - 60;

        // Noise-based random target movement (slow)
        const nx = simplex.noise2D(this.noiseOffsetX + t * 0.00004 * this.speed, 0);
        const ny = simplex.noise2D(0, this.noiseOffsetY + t * 0.00004 * this.speed);
        const nr = simplex.noise2D(this.noiseOffsetR + t * 0.00006, 0);

        this.springX.target = (nx * 0.5 + 0.5) * w;
        this.springY.target = (ny * 0.5 + 0.5) * h;
        this.springR.target = nr * 25;

        this.x = this.springX.update();
        this.y = this.springY.update();
        const rotation = this.springR.update();

        // Breathing scale (slow)
        const breathe = Math.sin(t * 0.0003 * this.speed + this.phase) * 0.06 + 1;

        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
        this.el.style.transform = `rotate(${rotation}deg) scale(${breathe})`;
    }
}

function initFloatingIcons() {
    const items = document.querySelectorAll('.fti-item');
    if (!items.length || isMobile) return;

    const icons = [];
    items.forEach((el, i) => {
        const icon = new FloatingIcon(el);
        icons.push(icon);
        // Stagger visibility
        setTimeout(() => el.classList.add('visible'), i * 200);
    });

    function animate() {
        const t = performance.now();
        icons.forEach(icon => icon.update(t));
        requestAnimationFrame(animate);
    }
    animate();
}

// Run after preloader
setTimeout(initFloatingIcons, 2000);

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    if (scrollProgressEl) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgressEl.style.width = (scrollY / docHeight * 100) + '%';
    }
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Active nav
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    sections.forEach(section => {
        const activeLink = document.querySelector(`.nav-links a[href="#${section.getAttribute('id')}"]`);
        if (activeLink) {
            activeLink.classList.toggle('active',
                scrollY > section.offsetTop - 100 && scrollY <= section.offsetTop + section.offsetHeight
            );
        }
    });
}, { passive: true });

// ===== TYPEWRITER WITH SCRAMBLE =====
const typewriterEl = document.getElementById('typewriter');
const titles = ['Software Engineer', 'UI/UX Designer', 'IoT Developer', 'Web Developer', 'Problem Solver'];
const scrambleChars = '!@#$%&*<>[]{}|/\\~';
let titleIdx = 0, charIdx = 0, isDeleting = false, typeSpeed = 80;

function scrambleReveal(text, el, callback) {
    let frame = 0;
    const maxFrames = text.length;
    function step() {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            if (i < frame) {
                result += text[i];
            } else {
                result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
        }
        el.textContent = result;
        frame++;
        if (frame <= maxFrames) {
            setTimeout(step, 30 + Math.random() * 20);
        } else {
            el.textContent = text;
            if (callback) callback();
        }
    }
    step();
}

function typewrite() {
    const current = titles[titleIdx];
    if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        typeSpeed = 40;
    } else {
        typewriterEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        typeSpeed = 80;
    }
    if (!isDeleting && charIdx === current.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        typeSpeed = 300;
        // Scramble reveal on new word
        scrambleReveal(titles[titleIdx], typewriterEl, () => {
            charIdx = titles[titleIdx].length;
        });
        return;
    }
    setTimeout(typewrite, typeSpeed);
}
setTimeout(typewrite, 1500);

// ===== COUNTER ANIMATION =====
document.querySelectorAll('.stat-number[data-count]').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    let current = 0;
    const step = target / (2000 / 16);
    function update() {
        current += step;
        if (current < target) { counter.textContent = Math.floor(current); requestAnimationFrame(update); }
        else counter.textContent = target;
    }
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { update(); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(counter);
});

// ===== 8D TILT WITH SPRING PHYSICS =====
function initTilt() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        const springX = new Spring(0.12, 0.65);
        const springY = new Spring(0.12, 0.65);
        const springZ = new Spring(0.1, 0.7);
        const springLift = new Spring(0.1, 0.7);
        let hovering = false;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            springX.target = y * -15;
            springY.target = x * 15;
            springZ.target = 15;
            springLift.target = -8;

            const shine = card.querySelector('.card-shine');
            if (shine) {
                shine.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(255,255,255,0.2) 0%, transparent 50%)`;
                shine.style.opacity = '1';
            }
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(79, 124, 255, 0.3) 0%, transparent 50%)`;
                glow.style.opacity = '0.3';
            }
        });

        card.addEventListener('mouseenter', () => { hovering = true; springLift.target = -8; });
        card.addEventListener('mouseleave', () => {
            hovering = false;
            springX.target = springY.target = springZ.target = springLift.target = 0;
            const shine = card.querySelector('.card-shine');
            if (shine) shine.style.opacity = '0';
            const glow = card.querySelector('.card-glow');
            if (glow) glow.style.opacity = '0';
        });

        function animate() {
            const rx = springX.update(), ry = springY.update();
            const rz = springZ.update(), lift = springLift.update();
            if (hovering || Math.abs(rx) > 0.01 || Math.abs(ry) > 0.01 || Math.abs(lift) > 0.01) {
                card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${rz}px) translateY(${lift}px)`;
            }
            requestAnimationFrame(animate);
        }
        animate();
    });
}
initTilt();

// ===== MAGNETIC BUTTONS =====
function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
        const sx = new Spring(0.15, 0.6), sy = new Spring(0.15, 0.6);
        let hovering = false;
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            sx.target = (e.clientX - rect.left - rect.width / 2) * 0.3;
            sy.target = (e.clientY - rect.top - rect.height / 2) * 0.3;
        });
        el.addEventListener('mouseenter', () => hovering = true);
        el.addEventListener('mouseleave', () => { hovering = false; sx.target = sy.target = 0; });
        function animate() {
            const x = sx.update(), y = sy.update();
            if (hovering || Math.abs(x) > 0.01 || Math.abs(y) > 0.01) {
                el.style.transform = `translate(${x}px, ${y}px)`;
            }
            requestAnimationFrame(animate);
        }
        animate();
    });
}
initMagnetic();

// ===== UNIVERSAL 8D ANIMATION OBSERVER =====
function init8DAnimations() {
    const animElements = document.querySelectorAll(
        '.anim-fade-up, .anim-fade-down, .anim-scale, .anim-scale-rotate, ' +
        '.anim-pop, .anim-card, .anim-text-reveal, .anim-img, .anim-tag, ' +
        '.anim-icon-spin, .anim-icon-bounce, .anim-icon-pulse, .anim-count'
    );
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.getAttribute('data-delay') || 0);
                setTimeout(() => entry.target.classList.add('in-view'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    animElements.forEach(el => observer.observe(el));
}

function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('revealed'), parseInt(entry.target.getAttribute('data-delay') || 0));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

init8DAnimations();
initReveal();

// ===== STAGGER TECH TAGS =====
(function() {
    const tags = document.querySelectorAll('.anim-tag');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tags.forEach((tag, i) => setTimeout(() => tag.classList.add('in-view'), i * 60));
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });
    if (tags.length) observer.observe(tags[0]);
})();

// ===== HERO IMAGE 8D PARALLAX =====
const heroImageWrapper = document.getElementById('heroImageWrapper');
if (heroImageWrapper) {
    const imgRX = new Spring(0.06, 0.8), imgRY = new Spring(0.06, 0.8);
    const imgTX = new Spring(0.06, 0.8), imgTY = new Spring(0.06, 0.8);

    document.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            imgRY.target = (e.clientX / window.innerWidth - 0.5) * 20;
            imgRX.target = -(e.clientY / window.innerHeight - 0.5) * 20;
            imgTX.target = (e.clientX / window.innerWidth - 0.5) * 10;
            imgTY.target = (e.clientY / window.innerHeight - 0.5) * 10;
        }
    });

    function animateHeroImage() {
        const rx = imgRX.update(), ry = imgRY.update();
        const tx = imgTX.update(), ty = imgTY.update();
        const scale = 1 - Math.min(scrollY / 2000, 0.15);
        heroImageWrapper.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
        const d1 = heroImageWrapper.querySelector('.image-depth-1');
        const d2 = heroImageWrapper.querySelector('.image-depth-2');
        if (d1) d1.style.transform = `translateZ(-20px) translate(${-tx * 0.5}px, ${-ty * 0.5}px)`;
        if (d2) d2.style.transform = `translateZ(-40px) translate(${-tx}px, ${-ty}px)`;
        requestAnimationFrame(animateHeroImage);
    }
    animateHeroImage();
}

// ===== FLOATING BADGES 8D =====
document.querySelectorAll('.floating-badge').forEach((badge, i) => {
    const sx = new Spring(0.02, 0.9), sy = new Spring(0.02, 0.9);
    let t = i * 2;
    function animate() {
        t += 0.015;
        const bx = Math.sin(t * 0.7 + i) * 12;
        const by = Math.cos(t * 0.5 + i) * 15;
        const rot = Math.sin(t * 0.3 + i) * 8;
        if (mouseX && mouseY) {
            const rect = badge.getBoundingClientRect();
            const dx = mouseX - (rect.left + rect.width / 2);
            const dy = mouseY - (rect.top + rect.height / 2);
            if (Math.sqrt(dx * dx + dy * dy) < 300) {
                sx.target = bx + dx * 0.05;
                sy.target = by + dy * 0.05;
            } else { sx.target = bx; sy.target = by; }
        } else { sx.target = bx; sy.target = by; }
        badge.style.transform = `translate3d(${sx.update()}px, ${sy.update()}px, ${Math.sin(t) * 20}px) rotate(${rot}deg)`;
        requestAnimationFrame(animate);
    }
    animate();
});

// ===== SMOOTH SECTION TRANSITIONS =====
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });
})();

// ===== SCROLL PARALLAX =====
(function() {
    const bgImage = document.querySelector('.hero-bg-image');
    const shapes = document.querySelectorAll('.shape');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');

    window.addEventListener('scroll', () => {
        if (scrollY < window.innerHeight) {
            const progress = scrollY / window.innerHeight;
            const opacity = Math.max(0, 1 - progress * 1.5);
            const scale = 1 - progress * 0.1;
            const translateY = scrollY * 0.3;
            if (heroContent) {
                heroContent.style.opacity = opacity;
                heroContent.style.transform = `translateY(${translateY}px) scale(${scale})`;
            }
            if (heroImage) {
                heroImage.style.opacity = opacity;
                heroImage.style.transform = `translateY(${translateY * 0.5}px) scale(${scale})`;
            }
        }
        if (bgImage) bgImage.style.transform = `translateY(${scrollY * 0.15}px) scale(${1 + scrollY * 0.0001})`;
        shapes.forEach((shape, i) => shape.style.transform = `translateY(${scrollY * (0.1 + i * 0.05)}px)`);
    }, { passive: true });
})();

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        setTimeout(() => {
            formStatus.textContent = 'Message Sent Successfully!';
            formStatus.className = 'form-status success';
            btn.innerHTML = orig;
            btn.disabled = false;
            contactForm.reset();
            setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status'; }, 5000);
        }, 1500);
    });
}

// ===== CLICK PARTICLE BURST =====
let lastClick = 0;
document.addEventListener('click', (e) => {
    if (Date.now() - lastClick < 300 || isMobile) return;
    lastClick = Date.now();
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        const hue = 220 + Math.random() * 40;
        const size = 3 + Math.random() * 4;
        p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;background:hsl(${hue},70%,65%);border-radius:50%;pointer-events:none;z-index:99999;transition:all 0.7s cubic-bezier(0.23,1,0.32,1)`;
        document.body.appendChild(p);
        const angle = (i / 10) * Math.PI * 2;
        const dist = 30 + Math.random() * 50;
        requestAnimationFrame(() => {
            p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 700);
    }
});

// ===== RIPPLE EFFECT =====
document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(79,124,255,0.3);transform:scale(0);animation:ripple-effect 0.6s ease-out;pointer-events:none`;
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== SMOOTH SCROLL MOMENTUM =====
(function() {
    let current = 0, target = 0, ease = 0.07;
    const scrollSpring = new Spring(0.08, 0.8);
    // Keep native scroll but add smooth parallax
})();

// ===== DARK/LIGHT MODE =====
(function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateIcon(next);
        });
    }

    function updateIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
})();

// ===== IMAGE LIGHTBOX =====
(function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const triggers = document.querySelectorAll('.lightbox-trigger');
    let currentIdx = 0;
    const images = [];

    triggers.forEach((trigger, i) => {
        const img = trigger.querySelector('img') || trigger;
        images.push(img.src);
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            currentIdx = i;
            openLightbox(i);
        });
    });

    function openLightbox(idx) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = images[idx];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIdx];
    });

    if (lightboxNext) lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIdx = (currentIdx + 1) % images.length;
        lightboxImg.src = images[currentIdx];
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + images.length) % images.length; lightboxImg.src = images[currentIdx]; }
        if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % images.length; lightboxImg.src = images[currentIdx]; }
    });
})();

// ===== PROJECT MODAL =====
(function() {
    const projects = [
        {
            icon: '<i class="fas fa-shopping-cart"></i>',
            title: 'Web Based Shop Management & Billing System',
            desc: 'A complete business management solution for retail shops. Handles inventory tracking, sales management, invoicing, payment processing, and customer relationship management in one unified platform.',
            tech: ['Laravel', 'Vue.js', 'MySQL', 'Bootstrap', 'REST API'],
            features: ['Real-time inventory tracking', 'Automated invoice generation', 'Sales analytics dashboard', 'Customer management system', 'Multi-payment support']
        },
        {
            icon: '<i class="fas fa-couch"></i>',
            title: 'Furniture Manufacturing System',
            desc: 'Production-management platform designed specifically for furniture businesses. Streamlines manufacturing workflows, material planning, and order tracking from design to delivery.',
            tech: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
            features: ['Production workflow management', 'Material inventory tracking', 'Order lifecycle management', 'Cost estimation tools', 'Delivery scheduling']
        },
        {
            icon: '<i class="fas fa-hotel"></i>',
            title: 'Hotel Reservation System',
            desc: 'Comprehensive reservation and guest-management software for hospitality teams. Handles bookings, room management, guest profiles, and billing in one intuitive interface.',
            tech: ['Laravel', 'Vue.js', 'MySQL', 'REST API'],
            features: ['Room availability calendar', 'Online booking portal', 'Guest profile management', 'Automated billing', 'Housekeeping integration']
        },
        {
            icon: '<i class="fas fa-cash-register"></i>',
            title: 'Billing System',
            desc: 'Point-of-sale and billing system for retail environments. Fast checkout, inventory sync, daily sales reports, and customer record management.',
            tech: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
            features: ['Quick checkout process', 'Barcode scanning support', 'Daily sales reports', 'Discount & promotion engine', 'Receipt printing']
        },
        {
            icon: '<i class="fas fa-qrcode"></i>',
            title: 'QR Attendance System',
            desc: 'Modern attendance tracking with QR code scanning and temperature capture. Designed for workplace safety compliance and automated reporting.',
            tech: ['Python', 'IoT', 'Laravel', 'REST API'],
            features: ['QR code scanning', 'Temperature capture', 'Automated attendance reports', 'Real-time monitoring', 'Safety compliance alerts']
        },
        {
            icon: '<i class="fas fa-file-signature"></i>',
            title: 'Document Signing System',
            desc: 'Digital approval workflow for teams that need document upload, tracking, and role-based signing. Streamlines document approval processes with security and audit trails.',
            tech: ['Laravel', 'Vue.js', 'MySQL', 'PDF.js'],
            features: ['Role-based signing', 'Document upload & tracking', 'Digital signatures', 'Approval workflow', 'Audit trail logging']
        },
        {
            icon: '<i class="fas fa-exchange-alt"></i>',
            title: 'Face Swap & Face Editing',
            desc: 'Professional face swap and face editing services with natural-looking results. Perfect for creative projects, social media content, and fun photo manipulations.',
            tech: ['Adobe Photoshop', 'AI Tools', 'Manual Editing'],
            features: ['Natural face swapping', 'Face morphing & blending', 'Facial feature adjustment', 'Expression editing', 'Lighting & skin tone matching']
        },
        {
            icon: '<i class="fas fa-heart"></i>',
            title: 'Wedding Photo Editing',
            desc: 'Manual wedding photo editing with attention to every detail. Making your special moments look perfect with professional retouching and romantic effects.',
            tech: ['Adobe Photoshop', 'Lightroom', 'Manual Retouching'],
            features: ['Skin smoothing & blemish removal', 'Color correction & grading', 'Romantic glow effects', 'Background enhancement', 'Batch editing for full albums']
        },
        {
            icon: '<i class="fas fa-magic"></i>',
            title: 'Photo Retouching & Enhancement',
            desc: 'Professional photo retouching services for portraits, products, and creative photography. Making every photo look its absolute best.',
            tech: ['Adobe Photoshop', 'Lightroom', 'AI Enhancement'],
            features: ['Portrait retouching', 'Product photo enhancement', 'Teeth whitening & eye brightening', 'Exposure & contrast correction', 'Noise reduction & sharpening']
        },
        {
            icon: '<i class="fas fa-cut"></i>',
            title: 'Background Removal & Compositing',
            desc: 'Precise background removal and replacement for product photos, portraits, and creative composites. Clean cutouts with natural edges.',
            tech: ['Adobe Photoshop', 'Pen Tool', 'AI Cutout'],
            features: ['Product background removal', 'Portrait cutout', 'Scene compositing', 'Shadow creation', 'Transparent background export']
        },
        {
            icon: '<i class="fas fa-palette"></i>',
            title: 'Color Grading & Cinematic Editing',
            desc: 'Professional color grading and cinematic color effects for photos and video stills. Creating mood and atmosphere through color.',
            tech: ['Adobe Photoshop', 'Lightroom', 'Color Theory'],
            features: ['Cinematic color grading', 'Vintage & film effects', 'Black & white conversion', 'Split toning', 'Custom color presets']
        },
        {
            icon: '<i class="fas fa-layer-group"></i>',
            title: 'Photo Manipulation & Creative Edits',
            desc: 'Advanced photo manipulation, double exposure, surreal compositions, and creative digital art. Turning imagination into visual reality.',
            tech: ['Adobe Photoshop', 'Compositing', 'Digital Art'],
            features: ['Surreal photo manipulation', 'Double exposure effects', 'Fantasy scene creation', 'Poster & banner design', 'Social media creative content']
        }
    ];

    const modal = document.getElementById('projectModal');
    const modalOverlay = document.getElementById('projectModalOverlay');
    const modalClose = document.getElementById('projectModalClose');

    document.querySelectorAll('[data-project]').forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.getAttribute('data-project'));
            const p = projects[idx];
            if (!p || !modal) return;

            document.getElementById('projectModalIcon').innerHTML = p.icon;
            document.getElementById('projectModalTitle').textContent = p.title;
            document.getElementById('projectModalDesc').textContent = p.desc;
            document.getElementById('projectModalTech').innerHTML = p.tech.map(t => `<span>${t}</span>`).join('');
            document.getElementById('projectModalFeatures').innerHTML = `<h4>Key Features</h4><ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>`;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
    });
})();

// ===== BACK TO TOP =====
(function() {
    const btn = document.getElementById('backToTop');
    const circle = document.getElementById('bttCircle');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTop / docHeight;

        btn.classList.toggle('visible', scrollTop > 400);

        if (circle) {
            const dashOffset = 100 - (progress * 100);
            circle.style.strokeDashoffset = dashOffset;
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ===== TESTIMONIALS CAROUSEL =====
(function() {
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    let current = 0;
    const total = cards.length;

    // Create dots
    if (dotsContainer) {
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goTo(idx) {
        current = idx;
        track.style.transform = `translateX(-${current * 100}%)`;
        updateDots();
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo((current - 1 + total) % total));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo((current + 1) % total));

    // Auto-advance
    setInterval(() => goTo((current + 1) % total), 5000);
})();

// ===== TIMELINE ANIMATION =====
(function() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.1}s`;
        observer.observe(item);
    });
})();

// ===== IMAGE LAZY LOAD OBSERVER =====
(function() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (!lazyImages.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s';
                img.onload = () => { img.style.opacity = '1'; };
                if (img.complete) img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => observer.observe(img));
})();

console.log('%c DTR.lk 8D Engine Loaded ', 'background: linear-gradient(135deg, #4f7cff, #6c5ce7); color: white; font-size: 14px; padding: 8px 16px; border-radius: 4px;');
