const BUSINESS_WHATSAPP = '5353734528';

/* ===== THEME MANAGEMENT ===== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  function setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }

  // Initial load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDark.matches) {
    setTheme('dark');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  // Listen for system changes
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ===== CAROUSEL ===== */
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const btnPrev = document.querySelector('.carousel-prev');
  const btnNext = document.querySelector('.carousel-next');
  let current = 0;
  let autoTimer;

  function updateDots() {
    const index = Math.round(track.scrollLeft / track.offsetWidth);
    current = index;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    track.scrollTo({
      left: slides[index].offsetLeft,
      behavior: 'smooth'
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      let next = current + 1;
      if (next >= slides.length) next = 0;
      goTo(next);
    }, 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  track.addEventListener('scroll', () => {
    updateDots();
  }, { passive: true });

  // Stop auto on manual scroll/touch
  track.addEventListener('touchstart', stopAuto, { passive: true });
  track.addEventListener('mousedown', stopAuto);

  startAuto();
}

/* ===== MOBILE MENU ===== */
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const overlay = document.querySelector('.menu-overlay');
  if (!toggle) return;

  function close() { nav.classList.remove('open'); overlay.classList.remove('open'); }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  if (overlay) overlay.addEventListener('click', close);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ===== BOOKING FORM ===== */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const fields = { name: '', phone: '', service: 'Gel semipermanente', date: '', time: '', details: '' };
  const preview = document.getElementById('msg-preview');

  function formatTime12h(t) {
    if (!t) return '';
    // Manejar HH:mm o HH:mm:ss
    let parts = t.split(':');
    let h = parseInt(parts[0], 10);
    let m = parts[1];
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${suffix}`;
  }

  function updatePreview() {
    const formattedTime = formatTime12h(fields.time);
    const lines = [
      '💅 Hola Dani Rizos, quiero confirmar una cita.',
      '',
      `👤 Nombre: ${fields.name || ''}`,
      `📱 Teléfono: ${fields.phone || ''}`,
      `✨ Servicio: ${fields.service || ''}`,
      `📅 Fecha: ${fields.date || ''}`,
      `🕐 Hora: ${formattedTime}`,
      `📝 Detalles: ${fields.details || 'Sin detalles adicionales'}`,
      '',
      '🙏 Quedo pendiente de la confirmación. ¡Gracias!'
    ];
    if (preview) preview.textContent = lines.join('\n');
  }

  form.querySelectorAll('[data-field]').forEach(el => {
    // Escuchar múltiples eventos para máxima compatibilidad
    ['input', 'change'].forEach(evt => {
      el.addEventListener(evt, () => {
        fields[el.dataset.field] = el.value;
        updatePreview();
      });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!fields.name || !fields.phone || !fields.date || !fields.time) {
      showToast('Completa nombre, teléfono, fecha y hora antes de continuar.', 'error');
      return;
    }
    // Enviamos a Google Calendar (en segundo plano)
    sendToGoogleCalendar({
      name: fields.name,
      phone: fields.phone,
      service: fields.service,
      date: fields.date,
      time: fields.time,
      details: fields.details
    });

    const msg = preview.textContent;
    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Se abrió WhatsApp con tu mensaje listo para enviar.', 'success');
  });

  updatePreview();
}

/* ===== SELECT SERVICE FROM CAROUSEL ===== */
function selectService(serviceName, detail) {
  const serviceSelect = document.querySelector('[data-field="service"]');
  const detailsField = document.querySelector('[data-field="details"]');
  if (serviceSelect) {
    serviceSelect.value = serviceName;
    serviceSelect.dispatchEvent(new Event('change'));
  }
  if (detailsField && detail) {
    detailsField.value = detail;
    detailsField.dispatchEvent(new Event('input'));
  }
  const booking = document.getElementById('reserva');
  if (booking) booking.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== TOAST ===== */
function showToast(message, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Toast styles injected dynamically
(function injectToastCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .toast{position:fixed;top:1.5rem;left:50%;transform:translateX(-50%) translateY(-20px);padding:1rem 2rem;border-radius:1rem;font-size:.9rem;font-weight:600;z-index:10000;opacity:0;transition:all .35s ease;pointer-events:none;max-width:90vw;text-align:center}
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    .toast-error{background:#5f373f;color:#f8e5e5}
    .toast-success{background:#1a5c32;color:#d4f5e0}
  `;
  document.head.appendChild(style);
})();

/* ===== FADE-UP ON SCROLL ===== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ===== ACTIVE NAV (SCROLL SPY) ===== */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav a:not(.nav-cta)');
  const sections = [];

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Only spy on hash links pointing to sections on the current page
    if (href && href.startsWith('#')) {
      const section = document.querySelector(href);
      if (section) sections.push({ el: section, link });
    }
  });

  if (sections.length === 0) return;

  function update() {
    const scrollY = window.scrollY + 120; // offset for sticky header
    let currentSection = null;

    sections.forEach(({ el, link }) => {
      if (el.offsetTop <= scrollY) {
        currentSection = link;
      }
    });

    navLinks.forEach(l => l.classList.remove('active'));
    if (currentSection) currentSection.classList.add('active');
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ===== COUNTER API ===== */
async function initCounter() {
  const workspace = 'joan-valerio-noa-hernandezs-team-3793';
  const name = 'first-counter-3793';
  const counterEl = document.getElementById('visit-counter');

  try {
    const response = await fetch(`https://api.counterapi.dev/v2/${workspace}/${name}/up`);
    const result = await response.json();

    // En V2 el valor está en result.data.up_count
    const count = result.data ? result.data.up_count : (result.count || result.value);

    if (count !== undefined) {
      if (counterEl) {
        counterEl.textContent = `${count} visitas`;
        counterEl.style.opacity = '1';
      }
    }
  } catch (err) {
    console.error('Error con CounterAPI:', err);
    if (counterEl) counterEl.style.display = 'none';
  }
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== LIGHTBOX ===== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lightboxImg || !closeBtn) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Imagen ampliada';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300); // Clear after transition
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) open(img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initMenu();
  initBookingForm();
  initScrollAnimations();
  initScrollSpy();
  initCounter();
  initBackToTop();
  initTheme();
  initLightbox();
});

/**
 * ENVÍO A GOOGLE CALENDAR
 * Reemplaza 'TU_URL_DE_APPS_SCRIPT' con la URL que obtengas al implementar en Google Apps Script
 */
async function sendToGoogleCalendar(data) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQhlvC3i2RW9nf6Yfpnw-6ohpCSd9sl_w2CRjtfeMBQ45yufwBduVBM0LFhU-sjhOacw/exec'; // <--- PEGA AQUÍ TU URL

  if (!SCRIPT_URL || SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbyQhlvC3i2RW9nf6Yfpnw-6ohpCSd9sl_w2CRjtfeMBQ45yufwBduVBM0LFhU-sjhOacw/exec') {
    console.log('Google Calendar: URL no configurada.');
    return;
  }

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('Cita enviada a Google Calendar');
  } catch (error) {
    console.error('Error enviando a Google Calendar:', error);
  }
}
