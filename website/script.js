// ==========================================================================
// HelaKey PRO - $5,000 Masterpiece Interactive Engine v4.0
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. 3D BACKGROUND PARTICLE CANVAS ENGINE
    // ----------------------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.id = 'bg3dCanvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Star3D {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = Math.random() * width;
            this.size = Math.random() * 2 + 0.8;
            this.color = Math.random() > 0.5 ? '#00F0FF' : '#8B5CF6';
        }
        update(scrollSpeed) {
            this.z -= 1.2 + scrollSpeed * 0.05;
            if (this.z <= 0) this.reset();
        }
        draw() {
            const k = 400 / this.z;
            const px = this.x * k + width / 2;
            const py = this.y * k + height / 2;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                const alpha = Math.min(Math.max(1 - this.z / width, 0), 1);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha * 0.75;
                ctx.beginPath();
                ctx.arc(px, py, this.size * k * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    const stars = Array.from({ length: 180 }, () => new Star3D());
    let lastScrollY = window.scrollY;
    let scrollSpeed = 0;

    window.addEventListener('scroll', () => {
        scrollSpeed = Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;
    });

    function render3DBackground() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => {
            star.update(scrollSpeed);
            star.draw();
        });
        scrollSpeed *= 0.92;
        requestAnimationFrame(render3DBackground);
    }
    render3DBackground();

    // ----------------------------------------------------------------------
    // 2. SCROLL-DRIVEN 3D REVEAL OBSERVER
    // ----------------------------------------------------------------------
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-3d').forEach(el => observer.observe(el));

    // ----------------------------------------------------------------------
    // 3. INTERACTIVE 3D MOUSE TILT & SPOTLIGHT OVERLAY
    // ----------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.tilt-card, .stat-item, .hero-banner-wrap, .showcase-img-wrap img');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -12;
            const rotateY = ((x - centerX) / centerX) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // ----------------------------------------------------------------------
    // 4. FAQ ACCORDION EXPANSION
    // ----------------------------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });

    // ----------------------------------------------------------------------
    // 5. INTERACTIVE KEYBOARD SIMULATOR LOGIC
    // ----------------------------------------------------------------------
    const display = document.getElementById('simDisplay');
    const keys = document.querySelectorAll('.sim-key');
    let text = "mama heta enawa ";

    const convertSinglish = (input) => {
        let s = input;
        s = s.replace(/mama/g, "මම");
        s = s.replace(/heta/g, "හෙට");
        s = s.replace(/enawa/g, "එනවා");
        s = s.replace(/karann/g, "කරන්");
        s = s.replace(/obata/g, "ඔබට");
        s = s.replace(/subha/g, "සුභ");
        s = s.replace(/dhasak/g, "දවසක්");
        return s;
    };

    const updateDisplay = () => {
        if (display) {
            display.textContent = convertSinglish(text) || "|";
        }
    };

    keys.forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.getAttribute('data-key');
            if (keyValue === 'backspace') {
                text = text.slice(0, -1);
            } else if (keyValue === 'space') {
                text += " ";
            } else {
                text += keyValue;
            }
            
            key.classList.add('active');
            setTimeout(() => key.classList.remove('active'), 150);
            updateDisplay();
        });
    });

    document.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        const matchingKey = document.querySelector(`.sim-key[data-key="${k}"]`);
        if (matchingKey) {
            matchingKey.classList.add('active');
            setTimeout(() => matchingKey.classList.remove('active'), 150);
        }

        if (k === 'backspace') {
            text = text.slice(0, -1);
            updateDisplay();
        } else if (k === ' ') {
            text += " ";
            updateDisplay();
        } else if (k.length === 1 && k >= 'a' && k <= 'z') {
            text += k;
            updateDisplay();
        }
    });

    updateDisplay();
});
