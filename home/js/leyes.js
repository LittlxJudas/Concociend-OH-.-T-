// Datos de ejemplo — [AÑADIR CONTENIDO AQUÍ] reemplaza esto por tus leyes reales.
const LAWS = [
  {
    id: '1',
    name: '[NOMBRE DE LA LEY EDITABLE]',
    number: 'Ley N° 00.000',
    description: '[DESCRIPCIÓN EDITABLE — resumen breve del alcance y objetivo de la ley]',
    category: 'Derechos y protección',
    icon: '⚖️',
    documentUrl: '',
    keywords: ['derechos', 'protección'],
  },
  {
    id: '2',
    name: '[NOMBRE DE LA LEY EDITABLE]',
    number: 'Ley N° 00.000',
    description: '[DESCRIPCIÓN EDITABLE — resumen breve del alcance y objetivo de la ley]',
    category: 'Educación',
    icon: '📘',
    documentUrl: '',
    keywords: ['educación'],
  },
  {
    id: '3',
    name: '[NOMBRE DE LA LEY EDITABLE]',
    number: 'Ley N° 00.000',
    description: '[DESCRIPCIÓN EDITABLE — resumen breve del alcance y objetivo de la ley]',
    category: 'Denuncia y acompañamiento',
    icon: '🤝',
    documentUrl: '',
    keywords: ['denuncia', 'acompañamiento'],
  },
];

let activeCategory = null;
let searchTerm = '';

const searchInput = document.getElementById('law-search');
const filtersEl = document.getElementById('law-filters');
const resultsEl = document.getElementById('law-results');
const modal = document.getElementById('law-modal');
const modalTitle = document.getElementById('law-modal-title');
const modalBody = document.getElementById('law-modal-body');

function renderFilters() {
  const categories = [...new Set(LAWS.map((l) => l.category))];
  filtersEl.innerHTML = categories
    .map(
      (cat) => `<button type="button" class="filter-chip${cat === activeCategory ? ' active' : ''}" data-category="${cat}">${cat}</button>`
    )
    .join('');

  filtersEl.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      activeCategory = activeCategory === cat ? null : cat;
      renderFilters();
      renderResults();
    });
  });
}

function getFiltered() {
  const term = searchTerm.trim().toLowerCase();
  return LAWS.filter((law) => {
    const matchesCategory = !activeCategory || law.category === activeCategory;
    const haystack = [law.name, law.number, law.category, ...(law.keywords || [])].join(' ').toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    return matchesCategory && matchesSearch;
  });
}

function renderResults() {
  const filtered = getFiltered();

  if (filtered.length === 0) {
    resultsEl.innerHTML = `
      <div class="state-box state-box--empty">
        <span class="icon">🗂️</span>
        <p class="text-soft">No encontramos resultados para tu búsqueda. Intenta con otro término.</p>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div class="grid grid--sm-2 grid--lg-3">
      ${filtered
        .map(
          (law) => `
        <div class="card card--lila" style="display:flex; flex-direction:column;">
          <span style="font-size:1.8rem;">${law.icon}</span>
          <h2 style="margin-top:16px; font-size:1.1rem; font-weight:600;">${law.name}</h2>
          <p style="margin-top:4px; font-size:0.75rem; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; color:var(--lila-400);">${law.number}</p>
          <p class="text-soft" style="margin-top:8px; font-size:0.9rem; flex:1;">${law.description}</p>
          <button type="button" class="btn" style="margin-top:20px; background:var(--lila-50); width:fit-content;" data-law-id="${law.id}">Ver detalle</button>
        </div>`
        )
        .join('')}
    </div>`;

  resultsEl.querySelectorAll('[data-law-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const law = LAWS.find((l) => l.id === btn.getAttribute('data-law-id'));
      openLawModal(law);
    });
  });
}

function openLawModal(law) {
  modalTitle.textContent = law.name;
  modalBody.innerHTML = `
    <p style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.02em; color:var(--lila-400);">${law.number}</p>
    <p class="text-soft" style="font-size:0.9rem;">${law.description}</p>
    <p style="font-size:0.8rem; color:var(--ink-soft);">Categoría: <strong style="color:var(--ink);">${law.category}</strong></p>
    ${
      law.documentUrl
        ? `<a href="${law.documentUrl}" target="_blank" rel="noreferrer" class="btn btn--dark" style="width:fit-content;">Descargar documento</a>`
        : `<p style="font-size:0.75rem; font-style:italic; color:var(--ink-soft);">[ENLACE AL DOCUMENTO — EDITABLE]</p>`
    }
  `;
  openModal(modal);
}

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderResults();
});

renderFilters();
renderResults();
