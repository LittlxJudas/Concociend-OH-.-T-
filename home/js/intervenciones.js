// Datos de ejemplo — [AÑADIR CONTENIDO AQUÍ] reemplaza esto por tus intervenciones reales.
const INTERVENTION_TYPES = [
  {
    id: 'charla',
    icon: '🗣️',
    title: '[TIPO DE INTERVENCIÓN EDITABLE — Charla educativa]',
    duration: '[DURACIÓN EDITABLE — ej. 1 hora]',
    audience: '[PÚBLICO EDITABLE — ej. estudiantes de enseñanza media]',
    description: '[DESCRIPCIÓN EDITABLE — objetivo y contenido de esta intervención]',
  },
  {
    id: 'taller',
    icon: '🧩',
    title: '[TIPO DE INTERVENCIÓN EDITABLE — Taller práctico]',
    duration: '[DURACIÓN EDITABLE]',
    audience: '[PÚBLICO EDITABLE]',
    description: '[DESCRIPCIÓN EDITABLE]',
  },
  {
    id: 'acompanamiento',
    icon: '🤝',
    title: '[TIPO DE INTERVENCIÓN EDITABLE — Acompañamiento institucional]',
    duration: '[DURACIÓN EDITABLE]',
    audience: '[PÚBLICO EDITABLE]',
    description: '[DESCRIPCIÓN EDITABLE]',
  },
];

// Próximas intervenciones agendadas — [AÑADIR CONTENIDO AQUÍ] o dejar vacío si no aplica.
const UPCOMING_INTERVENTIONS = [
  {
    id: '1',
    title: '[NOMBRE DE LA ACTIVIDAD EDITABLE]',
    place: '[LUGAR / INSTITUCIÓN EDITABLE]',
    date: '[FECHA EDITABLE]',
  },
];

const catalogEl = document.getElementById('intervention-catalog');
const upcomingEl = document.getElementById('intervention-upcoming');
const modal = document.getElementById('intervention-modal');
const modalTitle = document.getElementById('intervention-modal-title');
const form = document.getElementById('intervention-form');
const successBox = document.getElementById('intervention-success');
const errorBox = document.getElementById('intervention-error');
const typeInput = document.getElementById('intervention-type-input');
const submitBtn = document.getElementById('intervention-submit-btn');

const iFields = {
  institution: { input: document.getElementById('i-institution'), wrapper: document.getElementById('field-i-institution'), error: document.getElementById('error-i-institution') },
  place: { input: document.getElementById('i-place'), wrapper: document.getElementById('field-i-place'), error: document.getElementById('error-i-place') },
  contact: { input: document.getElementById('i-contact'), wrapper: document.getElementById('field-i-contact'), error: document.getElementById('error-i-contact') },
  email: { input: document.getElementById('i-email'), wrapper: document.getElementById('field-i-email'), error: document.getElementById('error-i-email') },
};

function renderCatalog() {
  catalogEl.innerHTML = INTERVENTION_TYPES.map(
    (item) => `
    <div class="card card--rosa" style="display:flex; flex-direction:column;">
      <span style="font-size:1.8rem;">${item.icon}</span>
      <h2 style="margin-top:16px; font-size:1.1rem; font-weight:600;">${item.title}</h2>
      <p style="margin-top:4px; font-size:0.75rem; font-weight:600; color:var(--rosa-400);">${item.duration}${item.audience ? ' · ' + item.audience : ''}</p>
      <p class="text-soft" style="margin-top:8px; font-size:0.9rem; flex:1;">${item.description}</p>
      <button type="button" class="btn btn--dark" style="margin-top:20px; width:fit-content;" data-request-type="${item.id}" data-request-title="${item.title}">Solicitar esta intervención</button>
    </div>`
  ).join('');

  catalogEl.querySelectorAll('[data-request-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openRequestModal(btn.getAttribute('data-request-type'), btn.getAttribute('data-request-title'));
    });
  });
}

function renderUpcoming() {
  if (!UPCOMING_INTERVENTIONS.length) {
    upcomingEl.innerHTML = `
      <div class="state-box state-box--empty">
        <span class="icon">🗓️</span>
        <p class="text-soft">Aún no hay intervenciones agendadas públicamente.</p>
      </div>`;
    return;
  }
  upcomingEl.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${UPCOMING_INTERVENTIONS.map(
        (item) => `
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; padding:20px 24px;">
          <div>
            <p style="font-weight:600;">${item.title}</p>
            <p class="text-soft" style="font-size:0.85rem; margin-top:4px;">${item.place}</p>
          </div>
          <span class="tag tag--rosa">${item.date}</span>
        </div>`
      ).join('')}
    </div>`;
}

function setIError(field, message) {
  const f = iFields[field];
  if (message) {
    f.wrapper.classList.add('has-error');
    f.error.textContent = message;
    f.error.hidden = false;
  } else {
    f.wrapper.classList.remove('has-error');
    f.error.hidden = true;
  }
}

function validateIntervention() {
  let isValid = true;

  if (!iFields.institution.input.value.trim()) {
    setIError('institution', 'Ingresa el nombre de la institución u organización.');
    isValid = false;
  } else {
    setIError('institution', null);
  }

  if (!iFields.place.input.value.trim()) {
    setIError('place', 'Ingresa la comuna o lugar donde se realizaría.');
    isValid = false;
  } else {
    setIError('place', null);
  }

  if (!iFields.contact.input.value.trim()) {
    setIError('contact', 'Ingresa un nombre de contacto.');
    isValid = false;
  } else {
    setIError('contact', null);
  }

  const email = iFields.email.input.value.trim();
  if (!email) {
    setIError('email', 'Ingresa un correo de contacto.');
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    setIError('email', 'Ingresa un correo electrónico válido.');
    isValid = false;
  } else {
    setIError('email', null);
  }

  return isValid;
}

function openRequestModal(typeId, typeTitle) {
  form.hidden = false;
  successBox.hidden = true;
  errorBox.hidden = true;
  form.reset();
  Object.keys(iFields).forEach((key) => setIError(key, null));
  typeInput.value = typeId;
  modalTitle.textContent = `Solicitar: ${typeTitle}`;
  openModal(modal);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  if (!validateIntervention()) return;

  submitBtn.disabled = true;
  submitBtn.classList.add('btn--disabled');
  submitBtn.textContent = 'Enviando…';

  const requestData = {
    id: `int-${Date.now()}`,
    type: typeInput.value,
    institution: iFields.institution.input.value.trim(),
    place: iFields.place.input.value.trim(),
    date: document.getElementById('i-date').value,
    contact: iFields.contact.input.value.trim(),
    email: iFields.email.input.value.trim(),
    message: document.getElementById('i-message').value.trim(),
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  };

  // Guarda la solicitud localmente para que el panel administrador pueda revisarla.
  // [NOTA TÉCNICA] Esto es almacenamiento local del navegador, no un backend real.
  // Reemplaza esto por una llamada a tu servidor cuando conectes el backend.
  try {
    const existing = JSON.parse(localStorage.getItem('interventionRequests') || '[]');
    existing.unshift(requestData);
    localStorage.setItem('interventionRequests', JSON.stringify(existing));

    setTimeout(() => {
      form.hidden = true;
      successBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--disabled');
      submitBtn.textContent = 'Enviar solicitud';
    }, 500);
  } catch (err) {
    errorBox.hidden = false;
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn--disabled');
    submitBtn.textContent = 'Enviar solicitud';
  }
});

renderCatalog();
renderUpcoming();
