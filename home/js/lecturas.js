// Extensión de las imágenes de portada. Cambia esto si usas .png, .webp, etc.
const COVER_EXT = 'jpg';

// Ruta donde deben ir las imágenes de portada. El nombre de archivo debe ser
// exactamente el "id" del libro + la extensión definida arriba.
const COVERS_PATH = 'im/lecturas/';

// Datos de ejemplo — [AÑADIR CONTENIDO AQUÍ] reemplaza esto por tus lecturas reales.
const READINGS = [
  {
    id: '1',
    title: 'El arte de ser normal',
    author: 'Lisa Williamson',
    category: 'Novela juvenil',
    description: 'Novela juvenil sobre dos chicos que buscan ser fieles a sí mismos, mostrando que la identidad no depende de gustos o roles impuestos.',
    recommendation: 'Ofrece una mirada empática, honesta y sin filtros a la búsqueda de la propia identidad durante la adolescencia.',
    resourceUrl: 'https://cdn.bookey.app/files/pdf/book/es/el-arte-de-ser-normal.pdf',
    featured: true,
  },
  {
    id: '2',
    title: 'George',
    author: 'Alex Gino',
    category: 'Novela juvenil',
    description: 'Historia de una niña trans contada con ternura y sencillez, ideal para jóvenes. Refuerza que lo que te gusta o cómo te expresas no define tu valor.',
    recommendation: 'Una historia sencilla pero significativa que invita a reflexionar sobre la identidad, la aceptación y la importancia de ser fiel a quien realmente somos.',
    resourceUrl: 'https://www.studocu.com/cl/document/universidad-adolfo-ibanez/gestion-de-operaciones/alex-gino-george-simplemente-se-tu-mismo/60924663?sid=a4a934f8-e6e4-468c-8821-fc814c94d56b1788736432',
    featured: false,
  },
  {
    id: '3',
    title: 'Yo soy Simón',
    author: 'Becky Albertalli',
    category: 'Novela juvenil',
    description: 'Aunque se centra en la orientación sexual, transmite un mensaje clave: ser auténtico importa más que encajar en etiquetas de género o expectativas sociales.',
    recommendation: 'Una historia divertida y cercana que habla sobre el amor, la amistad, la identidad y el valor de mostrarnos tal como somos.',
    resourceUrl: 'https://www.scribd.com/document/458699162/Becky-Albertalli-Yo-Soy-Simon',
    featured: false,
  },
  {
    id: '4',
    title: 'Cinder',
    author: 'Marissa Meyer',
    category: 'Novela juvenil',
    description: 'Una protagonista que rompe moldes: mecánica, fuerte y sensible a la vez. Muestra que no hay actividades “de hombres” o “de mujeres”, solo pasiones personales.',
    recommendation: 'Una reinterpretación de Cenicienta llena de ciencia ficción, misterio y aventura, perfecta para descubrir cómo un cuento clásico puede convertirse en una historia completamente nueva.',
    resourceUrl: 'https://es.bookmate.com/reader/Oh7TFEXe?resource=book',
    featured: false,
  },
  {
    id: '5',
    title: 'El chico de las estrellas',
    author: 'Chris Pueyo',
    category: 'Novela juvenil',
    description: 'Relato autobiográfico poético sobre crecer distinto y aprender a aceptarse. Habla de autenticidad más allá de los estereotipos.',
    recommendation: 'Una historia poética y emocional que invita a reflexionar sobre el amor, la identidad, la aceptación y todas esas experiencias que nos ayudan a descubrir quiénes somos.',
    resourceUrl: 'https://online.fliphtml5.com/pmjwj/znhk/#p=1',
    featured: false,
  },
];

let activeCategory = null;
let searchTerm = '';

const searchInput = document.getElementById('reading-search');
const filtersEl = document.getElementById('reading-filters');
const resultsEl = document.getElementById('reading-results');
const featuredEl = document.getElementById('featured-reading');

// Genera el bloque de portada: intenta cargar la imagen real y, si falla
// (no existe el archivo), muestra el ícono de respaldo automáticamente.
function renderCover(reading, { size, iconSize, icon }) {
  return `
    <div style="margin:0 auto; width:${size}px; aspect-ratio:3/4; border-radius:${size >= 128 ? 16 : 12}px; background:rgba(255,255,255,0.7); box-shadow: var(--shadow-soft); position:relative; overflow:hidden;">
      <img
        src="${COVERS_PATH}${reading.id}.${COVER_EXT}"
        alt="Portada de ${reading.title}"
        style="width:100%; height:100%; object-fit:cover; display:block;"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
      />
      <div style="display:none; position:absolute; inset:0; place-items:center; font-size:${iconSize};">
        <span role="img" aria-label="Portada no disponible">${icon}</span>
      </div>
    </div>`;
}

function renderFeatured() {
  const featured = READINGS.find((r) => r.featured);
  if (!featured) {
    featuredEl.innerHTML = '';
    return;
  }
  featuredEl.innerHTML = `
    <div style="display:grid; gap:24px; align-items:center; border-radius:24px; padding:28px; box-shadow: var(--shadow-card); background: linear-gradient(135deg, var(--menta-50), var(--celeste-50));" class="featured-grid">
      ${renderCover(featured, { size: 128, iconSize: '2.5rem', icon: '📖' })}
      <div>
        <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.02em; color:var(--menta-400);">📖 Recomendación de la semana</span>
        <h2 style="margin-top:8px; font-size:1.4rem; font-weight:600;">${featured.title}</h2>
        <p style="font-size:0.9rem; font-weight:500; color:var(--ink-soft);">${featured.author}</p>
        <p class="text-soft" style="margin-top:8px; font-size:0.9rem;">${featured.recommendation}</p>
        ${
          featured.resourceUrl
            ? `<a href="${featured.resourceUrl}" target="_blank" rel="noreferrer" class="btn btn--dark" style="margin-top:16px; width:fit-content;">Leer más</a>`
            : `<p style="margin-top:16px; font-size:0.75rem; font-style:italic; color:var(--ink-soft);">[ENLACE EDITABLE]</p>`
        }
      </div>
    </div>
    <style>@media (min-width:768px){.featured-grid{grid-template-columns:160px 1fr;}}</style>
  `;
}

function renderFilters() {
  const categories = [...new Set(READINGS.map((r) => r.category))];
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
  return READINGS.filter((reading) => {
    const matchesCategory = !activeCategory || reading.category === activeCategory;
    const haystack = [reading.title, reading.author, reading.category].join(' ').toLowerCase();
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
        <p class="text-soft">No encontramos lecturas que coincidan con tu búsqueda.</p>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div class="grid grid--sm-2 grid--lg-3">
      ${filtered
        .map(
          (reading) => `
        <div class="card card--menta" style="display:flex; flex-direction:column;">
          ${renderCover(reading, { size: 96, iconSize: '1.5rem', icon: '📗' })}
          <h2 style="margin-top:16px; font-size:1.1rem; font-weight:600;">${reading.title}</h2>
          <p style="font-size:0.75rem; font-weight:500; color:var(--ink-soft);">${reading.author}</p>
          <p class="text-soft" style="margin-top:8px; font-size:0.9rem; flex:1;">${reading.description}</p>
          ${
            reading.resourceUrl
              ? `<a href="${reading.resourceUrl}" target="_blank" rel="noreferrer" class="btn" style="margin-top:16px; background:var(--menta-100); width:fit-content;">Ver más</a>`
              : `<p style="margin-top:16px; font-size:0.75rem; font-style:italic; color:var(--ink-soft);">[ENLACE — EDITABLE]</p>`
          }
        </div>`
        )
        .join('')}
    </div>`;
}

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderResults();
});

renderFeatured();
renderFilters();
renderResults();