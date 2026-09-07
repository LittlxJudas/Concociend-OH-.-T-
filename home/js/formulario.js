// ============================================================================
// [NOTA TÉCNICA] Este formulario envía las opiniones directamente a Firebase
// Realtime Database usando su API REST (no se necesita el SDK de Firebase).
// Para que esto funcione, las reglas de seguridad de la base de datos deben
// permitir escritura en la ruta "opiniones" (por ejemplo, modo de prueba:
// { "rules": { "opiniones": { ".read": true, ".write": true } } }).
// Si el envío falla, revisa las reglas de la base de datos en la consola de
// Firebase: https://console.firebase.google.com
// ============================================================================

// [URL EDITABLE] — Cambia esto si en algún momento migras a otra base de datos.
const FIREBASE_DB_URL = 'https://conociendoht-default-rtdb.firebaseio.com';
const OPINIONS_PATH = 'opiniones';

const form = document.getElementById('request-form');
const formSection = document.getElementById('form-section');
const successSection = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');
const errorSubmit = document.getElementById('error-submit');
const resetBtn = document.getElementById('reset-btn');

const ratingStarsEl = document.getElementById('rating-stars');
const ratingInput = document.getElementById('rating');
const ratingError = document.getElementById('error-rating');

const fields = {
  email: { input: document.getElementById('email'), wrapper: document.getElementById('field-email'), error: document.getElementById('error-email') },
  comment: { input: document.getElementById('comment'), wrapper: document.getElementById('field-comment'), error: document.getElementById('error-comment') },
};

// ============ Widget de calificación por estrellas ============
function renderStars() {
  const current = Number(ratingInput.value) || 0;
  ratingStarsEl.innerHTML = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<button type="button" class="star-btn${n <= current ? ' active' : ''}" data-star="${n}" role="radio" aria-checked="${n === current}" aria-label="${n} de 5 estrellas">★</button>`
    )
    .join('');

  ratingStarsEl.querySelectorAll('[data-star]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ratingInput.value = btn.getAttribute('data-star');
      setRatingError(null);
      renderStars();
    });
  });
}

function setRatingError(message) {
  if (message) {
    ratingError.textContent = message;
    ratingError.hidden = false;
  } else {
    ratingError.hidden = true;
  }
}

function setError(field, message) {
  const f = fields[field];
  if (message) {
    f.wrapper.classList.add('has-error');
    f.error.textContent = message;
    f.error.hidden = false;
  } else {
    f.wrapper.classList.remove('has-error');
    f.error.hidden = true;
  }
}

function validate() {
  let isValid = true;

  if (!ratingInput.value) {
    setRatingError('Selecciona una calificación de 1 a 5 estrellas.');
    isValid = false;
  } else {
    setRatingError(null);
  }

  if (!fields.comment.input.value.trim()) {
    setError('comment', 'Cuéntanos tu opinión antes de enviar.');
    isValid = false;
  } else {
    setError('comment', null);
  }

  const email = fields.email.input.value.trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    setError('email', 'Ingresa un correo electrónico válido, o deja el campo vacío.');
    isValid = false;
  } else {
    setError('email', null);
  }

  return isValid;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorSubmit.hidden = true;

  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.classList.add('btn--disabled');
  submitBtn.textContent = 'Enviando…';

  const opinion = {
    rating: Number(ratingInput.value),
    topic: document.getElementById('topic').value,
    comment: fields.comment.input.value.trim(),
    name: document.getElementById('name').value.trim() || null,
    email: fields.email.input.value.trim() || null,
    status: 'nuevo',
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${FIREBASE_DB_URL}/${OPINIONS_PATH}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opinion),
    });

    if (!response.ok) throw new Error('Firebase respondió con un error.');

    formSection.hidden = true;
    successSection.hidden = false;
    form.reset();
    ratingInput.value = '';
    renderStars();
  } catch (err) {
    console.error('Error al enviar la opinión a Firebase:', err);
    errorSubmit.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn--disabled');
    submitBtn.textContent = 'Enviar opinión';
  }
});

resetBtn.addEventListener('click', () => {
  successSection.hidden = true;
  formSection.hidden = false;
});

renderStars();
