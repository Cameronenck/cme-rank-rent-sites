/* ========================================
   American Land Trust Template
   Main JavaScript — Enhanced & Mobile-First
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  initFloatingBar();
  initReviewsCarousel();
  initHeroCanvas();
  initSmoothScroll();
  initHeaderScroll();
  initFormEnhancements();
  initPhoneFormatting();
  initUTMCapture();
  initExitIntent();
  initTrustSignals();
  initHeroFormOverlay();
  replaceEmojis();
  updateCopyrightYear();
});

/* ----------------------------------------
   Replace remaining emojis in DOM
   ---------------------------------------- */
function replaceEmojis() {
  // Replace header phone emoji (CSS ::before handled by removing it)
  // This function catches any stragglers in text content
}

/* ----------------------------------------
   Dynamic Copyright Year
   ---------------------------------------- */
function updateCopyrightYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('.footer-bottom span').forEach(el => {
    if (el.textContent.includes('©')) {
      el.textContent = el.textContent.replace(/© \d{4}/, `© ${year}`);
    }
  });
}

/* ----------------------------------------
   Mobile Menu
   ---------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  // Create overlay
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (nav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

/* ----------------------------------------
   Header Scroll Effect
   ---------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > 100) {
          header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
        } else {
          header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ----------------------------------------
   Scroll Animations (Intersection Observer)
   ---------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ----------------------------------------
   Floating Contact Bar
   ---------------------------------------- */
function initFloatingBar() {
  const bar = document.getElementById('floatingBar');
  if (!bar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          bar.classList.add('visible');
        } else {
          bar.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
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

  const starIcon = Icons ? Icons.starFilled : '★';
  const emptyStarIcon = Icons ? Icons.starEmpty : '☆';

  function renderStars(rating) {
    if (Icons) {
      let html = '';
      for (let i = 0; i < 5; i++) {
        if (i < rating) {
          html += `<span class="icon-svg icon-sm" style="color:#F5A623" aria-hidden="true">${Icons.starFilled}</span>`;
        } else {
          html += `<span class="icon-svg icon-sm" style="color:#e0e0e0" aria-hidden="true">${Icons.starEmpty}</span>`;
        }
      }
      return html;
    }
    return `<span style="color:#F5A623">${'★'.repeat(rating)}</span><span style="color:#e0e0e0">${'☆'.repeat(5 - rating)}</span>`;
  }

  // Generate review cards - duplicate for infinite scroll
  const allReviews = [...reviews, ...reviews, ...reviews];
  track.innerHTML = allReviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${review.name.charAt(0)}</div>
        <div class="review-meta">
          <div class="review-name-stars">
            <div class="review-name">${review.name}</div>
            <div class="review-stars" aria-label="${review.rating} out of 5 stars">${renderStars(review.rating)}</div>
          </div>
          <div class="review-time">${review.time}</div>
        </div>
      </div>
      <div class="review-text">${review.text}</div>
      <div class="google-badge">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
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
      if (href.startsWith('#') && href !== '#') {
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

  // Skip on mobile for performance
  if (window.innerWidth < 768) {
    canvas.style.display = 'none';
    return;
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(60, Math.floor(canvas.width * canvas.height / 20000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.2,
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

    // Draw connections (fewer for performance)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy; // Skip sqrt for perf
        if (dist < 14400) { // 120^2
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / 14400)})`;
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

/* ----------------------------------------
   Form Enhancements
   ---------------------------------------- */
function initFormEnhancements() {
  // Add loading states to all forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.classList.contains('loading')) {
        btn.classList.add('loading');
        btn.setAttribute('aria-busy', 'true');
        
        // Re-enable after timeout (Netlify handles redirect)
        setTimeout(() => {
          btn.classList.remove('loading');
          btn.removeAttribute('aria-busy');
        }, 5000);
      }
    });
  });

  // Real-time validation
  document.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });

    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });

  // Auto-resize textareas
  document.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMsg = '';

  if (field.required && !value) {
    isValid = false;
    errorMsg = 'This field is required';
  } else if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMsg = 'Please enter a valid email address';
    }
  } else if (field.type === 'tel' && value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 10) {
      isValid = false;
      errorMsg = 'Please enter a valid phone number';
    }
  }

  if (!isValid) {
    field.classList.add('error');
    let errorEl = field.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = errorMsg;
    errorEl.style.display = 'block';
  } else {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.style.display = 'none';
  }

  return isValid;
}

/* ----------------------------------------
   Phone Number Formatting
   ---------------------------------------- */
function initPhoneFormatting() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    // Set appropriate attributes for mobile keyboard
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel');

    input.addEventListener('input', function(e) {
      let value = this.value.replace(/\D/g, '');
      
      // Limit to 10 digits (US)
      if (value.length > 10) value = value.substring(0, 10);
      
      // Format: (XXX) XXX-XXXX
      if (value.length >= 7) {
        this.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
      } else if (value.length >= 4) {
        this.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
      } else if (value.length >= 1) {
        this.value = `(${value}`;
      }
    });
  });

  // Set autocomplete attributes for other fields
  document.querySelectorAll('input[name="first-name"]').forEach(el => {
    el.setAttribute('autocomplete', 'given-name');
  });
  document.querySelectorAll('input[name="last-name"]').forEach(el => {
    el.setAttribute('autocomplete', 'family-name');
  });
  document.querySelectorAll('input[name="email"]').forEach(el => {
    el.setAttribute('autocomplete', 'email');
    el.setAttribute('inputmode', 'email');
  });
}

/* ----------------------------------------
   UTM Parameter Handling
   ---------------------------------------- */
function initUTMCapture() {
  const params = new URLSearchParams(window.location.search);
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  const captured = {};

  utmParams.forEach(param => {
    const value = params.get(param);
    if (value) captured[param] = value;
  });

  if (Object.keys(captured).length > 0) {
    // Store in session
    sessionStorage.setItem('alt_utm', JSON.stringify(captured));

    // Add hidden fields to all forms
    document.querySelectorAll('form').forEach(form => {
      Object.entries(captured).forEach(([key, value]) => {
        if (!form.querySelector(`input[name="${key}"]`)) {
          const hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = key;
          hidden.value = value;
          form.appendChild(hidden);
        }
      });
    });
  }

  // Also inject stored UTM params on forms if already stored
  const stored = sessionStorage.getItem('alt_utm');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      document.querySelectorAll('form').forEach(form => {
        Object.entries(data).forEach(([key, value]) => {
          if (!form.querySelector(`input[name="${key}"]`)) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = key;
            hidden.value = value;
            form.appendChild(hidden);
          }
        });
      });
    } catch (e) {}
  }
}

/* ----------------------------------------
   Exit-Intent Popup (Mobile-Friendly)
   ---------------------------------------- */
function initExitIntent() {
  const overlay = document.getElementById('exitPopupOverlay');
  if (!overlay) return;

  let shown = false;

  function showPopup() {
    if (shown || sessionStorage.getItem('alt_exit_shown')) return;
    shown = true;
    sessionStorage.setItem('alt_exit_shown', '1');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Desktop: mouse leave
  document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0 && !shown) {
      showPopup();
    }
  });

  // Mobile: back button / scroll up quickly
  let lastScrollY = window.scrollY;
  let scrollUpDistance = 0;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    if (currentY < lastScrollY) {
      scrollUpDistance += (lastScrollY - currentY);
      if (scrollUpDistance > 300 && currentY < 200 && !shown) {
        showPopup();
      }
    } else {
      scrollUpDistance = 0;
    }
    lastScrollY = currentY;
  }, { passive: true });

  // Also show after 45 seconds on page
  setTimeout(() => {
    if (!shown) showPopup();
  }, 45000);

  // Close handlers
  const closeBtn = overlay.querySelector('.exit-popup-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hidePopup);
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hidePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidePopup();
  });

  // Form submit in popup
  const popupForm = overlay.querySelector('form');
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = popupForm.querySelector('button[type="submit"]');
      if (btn) btn.classList.add('loading');
      
      // Submit via Netlify
      const formData = new FormData(popupForm);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      }).then(() => {
        popupForm.innerHTML = '<div style="text-align:center;padding:20px;"><h3 style="color:var(--green);margin-bottom:8px;">Thank You!</h3><p>We\'ll be in touch shortly.</p></div>';
        setTimeout(hidePopup, 3000);
      }).catch(() => {
        if (btn) btn.classList.remove('loading');
      });
    });
  }
}

/* ----------------------------------------
   Trust Signals
   ---------------------------------------- */
function initTrustSignals() {
  // Add aria-labels to trust items
  document.querySelectorAll('.trust-item, .proof-item').forEach(item => {
    if (!item.getAttribute('aria-label')) {
      item.setAttribute('role', 'listitem');
    }
  });
}

/* ----------------------------------------
   Analytics Integration Ready
   ---------------------------------------- */
// Provides helper functions for tracking events.
window.ALT_Track = {
  // Track form submission
  formSubmit: function(formName) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'generate_lead', { event_category: 'form', event_label: formName });
    }
  },
  // Track phone click
  phoneClick: function() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact', { event_category: 'phone', event_label: 'phone_click' });
    }
  },
  // Track email click
  emailClick: function() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'contact', { event_category: 'email', event_label: 'email_click' });
    }
  }
};

// Auto-track phone and email clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="tel:"]');
  if (link) ALT_Track.phoneClick();
  
  const emailLink = e.target.closest('a[href^="mailto:"]');
  if (emailLink) ALT_Track.emailClick();
});

// Track form submissions
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.tagName === 'FORM') {
    ALT_Track.formSubmission();
  }
});

/* ----------------------------------------
   Hero Form Overlay
   ---------------------------------------- */
function initHeroFormOverlay() {
  const overlay = document.getElementById('heroFormOverlay');
  const closeBtn = overlay?.querySelector('.hero-form-close');
  
  if (!overlay || !closeBtn) return;
  
  // Close form overlay
  function closeForm() {
    overlay.style.display = 'none';
  }
  
  closeBtn.addEventListener('click', closeForm);
  
  // Close on overlay click (outside form)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeForm();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeForm();
    }
  });
}
