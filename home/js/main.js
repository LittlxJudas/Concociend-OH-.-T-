// ============ Navbar: sombra al hacer scroll + menú móvil ============
(function () {
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('[data-navbar-toggle]');
  const mobile = document.querySelector('[data-navbar-mobile]');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const isOpen = mobile.classList.toggle('open');
      toggle.textContent = isOpen ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobile.classList.remove('open');
        toggle.textContent = '☰';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Resalta el enlace activo según la página actual
  const currentPage = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    if (link.getAttribute('data-nav-link') === currentPage) {
      link.classList.add('active');
    }
  });
})();

// ============ Botón flotante de frases motivacionales ============
(function () {
  const QUOTES = [
    ' Cada paso cuenta, incluso el más pequeño.',
    ' Informarse es la primera forma de cuidarse.',
    ' No estás solo/a: siempre hay una red dispuesta a ayudar.',
    ' Conocer tus derechos es el primer paso para ejercerlos.',
    ' Tú puedes avanzar a tu propio ritmo.',
    ' Lo que sientes también merece ser escuchado.',
    ' Pedir ayuda también es una muestra de valentía.',
    ' Tu bienestar merece un espacio en tu día.',
    ' Nunca es tarde para comenzar de nuevo.',
    ' Tu voz tiene valor, incluso cuando tiembla.',
    ' Está bien detenerse para tomar aire y continuar.',
    ' Cuidarte no es egoísmo, es reconocerte importante.',
    ' Tus emociones son parte de ti, pero no definen todo lo que eres.',
    ' Mereces sentirte seguro/a y respetado/a.',
    ' Los momentos difíciles no duran para siempre.',
    ' Hablar de lo que te preocupa puede hacer el camino más ligero.',
    ' Tu historia todavía tiene muchos capítulos por escribir.',
    ' No tienes que tener todas las respuestas hoy.',
    ' A veces avanzar significa simplemente no rendirse.',
    ' Tu esfuerzo tiene valor, aunque nadie más lo vea.',
    ' Escuchar a los demás también puede ayudarte a escucharte.',
    ' Mereces darte otra oportunidad.',
    ' Equivocarte no borra todo lo que has aprendido.',
    ' Tu futuro no está definido por un mal día.',
    ' Respira, piensa y recuerda todo lo que ya has superado.',
    ' Ser fuerte también significa reconocer cuándo necesitas apoyo.',
    ' Tu bienestar emocional importa.',
    ' No necesitas compararte para reconocer tu propio progreso.',
    ' Cada día puede ser una nueva oportunidad para aprender.',
    ' Tus límites también merecen respeto.',
    ' Lo que haces por ti hoy puede ayudarte mañana.',
    ' Hay personas que quieren verte salir adelante.',
    ' Tener miedo no significa que no puedas continuar.',
    ' Tu opinión merece ser tomada en cuenta.',
    ' Date permiso para aprender de tus experiencias.',
    ' Incluso los días difíciles pueden enseñarte algo sobre ti.',
    ' Tu tranquilidad también es una prioridad.',
    ' Nunca tienes que enfrentar una preocupación completamente en silencio.',
    ' Reconocer lo que necesitas es un acto de honestidad contigo mismo/a.',
    ' Tu crecimiento no tiene que parecerse al de nadie más.',
    ' Confía en el proceso, incluso cuando todavía no veas el resultado.',
    ' Mereces espacios donde puedas ser tú mismo/a.',
    ' Hablar también puede ser el comienzo de un cambio.',
    ' No minimices aquello que te hace sentir incómodo/a.',
    ' Tu bienestar vale más que aparentar que todo está bien.',
    ' Aprende a reconocer tus logros, incluso los que parecen pequeños.',
    ' Siempre puedes buscar una nueva manera de afrontar las cosas.',
    ' Tu voz puede abrir puertas que el silencio mantiene cerradas.',
    ' Recuerda que cuidarte también es parte de crecer.',
    ' Sigue construyendo la versión de ti que quieres conocer.'
  ];

  const wrapper = document.querySelector('[data-motivational]');
  if (!wrapper) return;

  const toggleBtn = wrapper.querySelector('[data-motivational-toggle]');
  const panel = wrapper.querySelector('[data-motivational-panel]');
  const textEl = wrapper.querySelector('[data-motivational-text]');
  const nextBtn = wrapper.querySelector('[data-motivational-next]');

  let current = QUOTES[0];

  function renderQuote() {
    textEl.textContent = current;
  }

  function pickNext() {
    if (QUOTES.length < 2) return;
    let next = current;
    while (next === current) {
      next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }
    current = next;
    renderQuote();
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    toggleBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  nextBtn.addEventListener('click', pickNext);

  document.addEventListener('mousedown', (e) => {
    if (!wrapper.contains(e.target)) {
      panel.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  renderQuote();
})();

// ============ Utilidad genérica para modales ============
function openModal(overlayEl) {
  overlayEl.classList.add('open');
}
function closeModal(overlayEl) {
  overlayEl.classList.remove('open');
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
  }
});
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
  const closeBtn = overlay.querySelector('[data-modal-close]');
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(overlay));
});
