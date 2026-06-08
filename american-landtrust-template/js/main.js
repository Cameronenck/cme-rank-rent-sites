/* ========================================
   American Land Trust Template
   Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  initFloatingBar();
  initReviewsCarousel();
  initHeroCanvas();
  initSmoothScroll();
  initHeaderScroll();
});

/* ----------------------------------------
   Mobile Menu
   ---------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ----------------------------------------
   Header Scroll Effect
   ---------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
    } else {
      header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ----------------------------------------
   Scroll Animations (Intersection Observer)
   ---------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ----------------------------------------
   Floating Contact Bar
   ---------------------------------------- */
function initFloatingBar() {
  const bar = document.getElementById('floatingBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
}

/* ----------------------------------------
   Reviews Carousel (Auto-scrolling)
   ---------------------------------------- */
function initReviewsCarousel() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  const reviews = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG.testimonials : [];
  if (!reviews.length) return;

  // Generate review cards - duplicate for infinite scroll
  const allReviews = [...reviews, ...reviews, ...reviews];
  track.innerHTML = allReviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${review.name.charAt(0)}</div>
        <div class="review-meta">
          <div class="review-name">${review.name}</div>
          <div class="review-time">${review.time}</div>
        </div>
      </div>
      <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      <div class="review-text">${review.text}</div>
      <div class="google-badge">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        <span>Google Review</span>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------
   Smooth Scroll for anchor links
   ---------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Handle same-page anchors
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
    });
  });
}

/* ----------------------------------------
   Hero Canvas - Particle Stars Effect
   ---------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // Pause when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  });
  observer.observe(canvas);
}
