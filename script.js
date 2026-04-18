/* ===== CONSTANTS ===== */
const BUSINESS_WHATSAPP = '5353734528';

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

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  if (btnPrev) btnPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (btnNext) btnNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    startAuto();
  });

  goTo(0);
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
    let [h, m] = t.split(':');
    h = parseInt(h);
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
    el.addEventListener('input', () => {
      fields[el.dataset.field] = el.value;
      updatePreview();
    });
    if (el.dataset.field === 'service') {
      el.addEventListener('change', () => {
        fields.service = el.value;
        updatePreview();
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!fields.name || !fields.phone || !fields.date || !fields.time) {
      showToast('Completa nombre, teléfono, fecha y hora antes de continuar.', 'error');
      return;
    }
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

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initMenu();
  initBookingForm();
  initScrollAnimations();
  initScrollSpy();
});
