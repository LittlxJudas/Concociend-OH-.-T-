// Extensión de las imágenes de vista previa. Cambia esto si usas .png, .webp, etc.
const MEDIA_COVER_EXT = 'png';

// Ruta donde deben ir las imágenes de vista previa. El nombre de archivo debe ser
// exactamente el "id" del material + la extensión definida arriba.
// Ejemplo: id: '1' -> img/multimedia/1.jpg
const MEDIA_COVERS_PATH = 'im/multimedia/';

// Datos de ejemplo — [AÑADIR CONTENIDO AQUÍ] reemplaza esto por tu material multimedia real.
// TIP: en "embedUrl" puedes pegar el link normal de YouTube tal como lo copias
// del navegador o de "Compartir" (funciona con cualquiera de estos formatos):
//   https://www.youtube.com/watch?v=XXXXXXXXXXX
//   https://youtu.be/XXXXXXXXXXX
//   https://www.youtube.com/shorts/XXXXXXXXXXX
//   https://www.youtube.com/embed/XXXXXXXXXXX   (también funciona, ya viene listo)
// La página lo convierte automáticamente al formato que YouTube necesita para
// reproducirse embebido dentro de la app — no hace falta armar tú la URL de embed.
const MEDIA_ITEMS = [
  {
    id: '1',
    title: 'Michael Jackson - Remember the Time (Official Video - Upscaled)',
    type: 'Video',
    icon: '🎬',
    category: 'Musica',
    description: 'Michael Jackson songs',
    duration: '9.19 min',
    embedUrl: 'https://youtu.be/LeiFF0gvqcc?si=6Ljw4JulfCEEFv80',
    externalUrl: 'https://www.youtube.com/watch?v=vRBgZ4aMPio',
    featured: true,
  },
  {
    id: '2',
    title: '[TÍTULO DEL PODCAST EDITABLE]',
    type: 'Podcast',
    icon: '🎙️',
    category: 'Testimonios',
    description: '[DESCRIPCIÓN EDITABLE]',
    duration: '[DURACIÓN EDITABLE]',
    embedUrl: '',
    externalUrl: '',
    featured: false,
  },
  {
    id: '3',
    title: '[TÍTULO DE LA INFOGRAFÍA EDITABLE]',
    type: 'Infografía',
    icon: '🖼️',
    category: 'Recursos',
    description: '[DESCRIPCIÓN EDITABLE]',
    duration: '',
    embedUrl: '',
    externalUrl: '',
    featured: false,
  },
  {
    id: '4',
    title: '[TÍTULO DEL TALLER GRABADO EDITABLE]',
    type: 'Video',
    icon: '🎬',
    category: 'Talleres',
    description: '[DESCRIPCIÓN EDITABLE]',
    duration: '[DURACIÓN EDITABLE]',
    embedUrl: '',
    externalUrl: '',
    featured: false,
  },
];

let activeType = null;
let searchTerm = '';

const searchInput = document.getElementById('media-search');
const filtersEl = document.getElementById('media-filters');
const resultsEl = document.getElementById('media-results');
const featuredEl = document.getElementById('featured-media');
const modal = document.getElementById('media-modal');
const modalTitle = document.getElementById('media-modal-title');
const modalBody = document.getElementById('media-modal-body');

// Detecta si un link es de YouTube (en cualquiera de sus formatos comunes) y
// devuelve la URL de embed lista para usar en un <iframe>. Si no es un link
// de YouTube reconocible, devuelve la URL tal cual (por si usas otro proveedor
// que ya entregue un embed directo, como Vimeo o Spotify).
function toYouTubeEmbedUrl(rawUrl) {
  if (!rawUrl) return '';
  let url;
  try {
    url = new URL(rawUrl, window.location.href);
  } catch (e) {
    return rawUrl;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');
  let videoId = '';

  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1);
  } else if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v') || '';
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.split('/')[2] || '';
    } else if (url.pathname.startsWith('/embed/')) {
      return rawUrl; // ya viene en formato embed, se usa tal cual
    }
  } else {
    return rawUrl; // no es YouTube: se deja tal cual (otros proveedores de embed)
  }

  if (!videoId) return rawUrl;

  const start = url.searchParams.get('t') || url.searchParams.get('start');
  const startParam = start ? `&start=${parseInt(start, 10) || 0}` : '';
  return `https://www.youtube.com/embed/${videoId}?rel=0${startParam}`;
}

// Genera la vista previa / vista completa de un material:
// 1) Si tiene embedUrl, incrusta el reproductor (video/podcast externo). Si es
//    un link de YouTube en cualquier formato, se convierte automáticamente al
//    formato de embed. En la vista grande (modal) se agrega un botón "↗" para
//    abrir el contenido original en una pestaña nueva.
// 2) Si no, intenta cargar automáticamente img/multimedia/{id}.jpg.
// 3) Si esa imagen no existe, muestra el ícono de respaldo (no se rompe la página).
// En la vista grande (modal), la imagen se ve completa y sin recortes, y al
// hacer clic abre un visor con zoom libre (rueda del mouse, pellizco, arrastre).
function mediaEmbed(item, big) {
  const radius = big ? '16px' : '12px';
  const iconSize = big ? '3rem' : '2rem';

  if (item.embedUrl) {
    const embedSrc = toYouTubeEmbedUrl(item.embedUrl);
    const openUrl = item.externalUrl || item.embedUrl;
    const openNewTabBtn = big
      ? `<a href="${openUrl}" target="_blank" rel="noreferrer" title="Abrir en pestaña nueva" aria-label="Abrir en pestaña nueva" style="position:absolute; top:10px; right:10px; z-index:2; height:36px; width:36px; border-radius:999px; background:rgba(20,18,28,0.6); color:#fff; display:grid; place-items:center; font-size:16px; text-decoration:none;">↗</a>`
      : '';
    return `<div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:${radius}; overflow:hidden; background:var(--celeste-100);">
      <iframe
        src="${embedSrc}"
        title="${item.title}"
        style="position:absolute; inset:0; width:100%; height:100%; border:0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>
      ${openNewTabBtn}
    </div>`;
  }

  const imgSrc = `${MEDIA_COVERS_PATH}${item.id}.${MEDIA_COVER_EXT}`;
  // Miniatura (tarjetas): recorta para llenar el espacio (object-fit: cover).
  // Vista grande (modal): se ve completa, sin recortes (object-fit: contain).
  const objectFit = big ? 'contain' : 'cover';
  const safeTitle = item.title.replace(/'/g, "\\'");
  const clickAttrs = big
    ? `onclick="openImageZoomViewer('${imgSrc}', '${safeTitle}')" style="width:100%; height:100%; object-fit:${objectFit}; display:block; cursor:zoom-in;" title="Haz clic para ampliar y hacer zoom"`
    : `style="width:100%; height:100%; object-fit:${objectFit}; display:block;"`;
  const imgTag = `<img
      src="${imgSrc}"
      alt="Vista previa de ${item.title}"
      ${clickAttrs}
      onerror="const box=this.closest('[data-media-frame]'); this.style.display='none'; box.querySelector('.media-fallback').style.display='grid';"
    />`;

  return `<div data-media-frame style="position:relative; width:100%; aspect-ratio:16/9; border-radius:${radius}; background:var(--celeste-100); overflow:hidden;">
    ${imgTag}
    <div class="media-fallback" style="display:none; position:absolute; inset:0; place-items:center; font-size:${iconSize};">
      <span role="img" aria-label="Vista previa no disponible">${item.icon}</span>
    </div>
  </div>`;
}

// Visor de imagen con zoom libre: se crea una sola vez y se reutiliza.
// - Rueda del mouse: acerca/aleja centrado donde está el cursor.
// - Pellizco (dos dedos) en móvil: acerca/aleja.
// - Arrastrar (mouse o un dedo) cuando hay zoom: mueve la imagen.
// - Doble clic: alterna entre 100% y 2x.
// - Botones −, % y +: control manual, útil también en accesibilidad.
function openImageZoomViewer(src, alt) {
  let viewer = document.getElementById('media-zoom-viewer');

  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'media-zoom-viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.style.cssText =
      'position:fixed; inset:0; z-index:70; display:none; background:rgba(20,18,28,0.92); padding:0;';
    viewer.innerHTML = `
      <div id="media-zoom-stage" style="position:absolute; inset:0; overflow:hidden; display:flex; align-items:center; justify-content:center; touch-action:none;">
        <img id="media-zoom-img" alt="" draggable="false"
          style="max-width:100%; max-height:100%; object-fit:contain; transform-origin:center center; user-select:none; -webkit-user-drag:none; will-change:transform;" />
      </div>
      <button id="media-zoom-close" type="button" aria-label="Cerrar visor" style="position:absolute; top:16px; right:16px; z-index:2; height:40px; width:40px; border-radius:999px; background:rgba(255,255,255,0.15); color:#fff; font-size:18px; display:grid; place-items:center;">✕</button>
      <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); z-index:2; display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); padding:6px; border-radius:999px;">
        <button id="media-zoom-out" type="button" aria-label="Alejar" style="height:36px; width:36px; border-radius:999px; background:rgba(255,255,255,0.15); color:#fff; font-size:18px; font-weight:600; display:grid; place-items:center;">−</button>
        <button id="media-zoom-reset" type="button" aria-label="Restablecer zoom" style="min-width:52px; height:36px; padding:0 10px; border-radius:999px; background:rgba(255,255,255,0.15); color:#fff; font-size:0.8rem; font-weight:600;">100%</button>
        <button id="media-zoom-in" type="button" aria-label="Acercar" style="height:36px; width:36px; border-radius:999px; background:rgba(255,255,255,0.15); color:#fff; font-size:18px; font-weight:600; display:grid; place-items:center;">+</button>
      </div>
    `;
    document.body.appendChild(viewer);

    const stage = viewer.querySelector('#media-zoom-stage');
    const img = viewer.querySelector('#media-zoom-img');
    const zoomLabel = viewer.querySelector('#media-zoom-reset');
    const MIN_SCALE = 1;
    const MAX_SCALE = 8;

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let pinchStartDist = null;
    let pinchStartScale = 1;

    function apply() {
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      zoomLabel.textContent = Math.round(scale * 100) + '%';
      stage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    }

    function setScale(next, originX, originY) {
      const clamped = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
      if (clamped === 1) {
        tx = 0;
        ty = 0;
      } else if (typeof originX === 'number') {
        // Mantiene el punto bajo el cursor/dedos fijo al hacer zoom.
        const ratio = clamped / scale;
        tx = originX - ratio * (originX - tx);
        ty = originY - ratio * (originY - ty);
      }
      scale = clamped;
      apply();
    }

    function resetZoom() {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
    }

    function distance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function midpoint(touches, rect) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left - rect.width / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top - rect.height / 2,
      };
    }

    stage.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const rect = stage.getBoundingClientRect();
        const originX = e.clientX - rect.left - rect.width / 2;
        const originY = e.clientY - rect.top - rect.height / 2;
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setScale(scale + delta, originX, originY);
      },
      { passive: false }
    );

    stage.addEventListener('dblclick', (e) => {
      const rect = stage.getBoundingClientRect();
      const originX = e.clientX - rect.left - rect.width / 2;
      const originY = e.clientY - rect.top - rect.height / 2;
      setScale(scale > 1 ? 1 : 2.5, originX, originY);
    });

    stage.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      isDragging = true;
      dragStartX = e.clientX - tx;
      dragStartY = e.clientY - ty;
      stage.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      tx = e.clientX - dragStartX;
      ty = e.clientY - dragStartY;
      apply();
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        stage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
      }
    });

    stage.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) {
          pinchStartDist = distance(e.touches);
          pinchStartScale = scale;
        } else if (e.touches.length === 1 && scale > 1) {
          isDragging = true;
          dragStartX = e.touches[0].clientX - tx;
          dragStartY = e.touches[0].clientY - ty;
        }
      },
      { passive: true }
    );
    stage.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 2 && pinchStartDist) {
          e.preventDefault();
          const rect = stage.getBoundingClientRect();
          const mid = midpoint(e.touches, rect);
          const factor = distance(e.touches) / pinchStartDist;
          setScale(pinchStartScale * factor, mid.x, mid.y);
        } else if (e.touches.length === 1 && isDragging) {
          e.preventDefault();
          tx = e.touches[0].clientX - dragStartX;
          ty = e.touches[0].clientY - dragStartY;
          apply();
        }
      },
      { passive: false }
    );
    stage.addEventListener('touchend', () => {
      isDragging = false;
      pinchStartDist = null;
    });

    viewer.querySelector('#media-zoom-in').addEventListener('click', () => setScale(scale + 0.5));
    viewer.querySelector('#media-zoom-out').addEventListener('click', () => setScale(scale - 0.5));
    viewer.querySelector('#media-zoom-reset').addEventListener('click', resetZoom);

    function closeViewer() {
      viewer.style.display = 'none';
      resetZoom();
    }

    viewer.querySelector('#media-zoom-close').addEventListener('click', closeViewer);
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) closeViewer();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && viewer.style.display === 'flex') closeViewer();
    });

    viewer._reset = resetZoom;
  }

  const img = viewer.querySelector('#media-zoom-img');
  img.src = src;
  img.alt = alt;
  if (viewer._reset) viewer._reset();
  viewer.style.display = 'block';
}

function renderFeatured() {
  const featured = MEDIA_ITEMS.find((m) => m.featured);
  if (!featured) {
    featuredEl.innerHTML = '';
    return;
  }
  featuredEl.innerHTML = `
    <div style="display:grid; gap:24px; align-items:center; border-radius:24px; padding:28px; box-shadow: var(--shadow-card); background: linear-gradient(135deg, var(--celeste-50), var(--lila-50));" class="featured-grid-media">
      <div>${mediaEmbed(featured, true)}</div>
      <div>
        <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.02em; color:var(--lila-400);">${featured.icon} Destacado esta semana</span>
        <h2 style="margin-top:8px; font-size:1.4rem; font-weight:600;">${featured.title}</h2>
        <p style="font-size:0.9rem; font-weight:500; color:var(--ink-soft);">${featured.type}${featured.duration ? ' · ' + featured.duration : ''}</p>
        <p class="text-soft" style="margin-top:8px; font-size:0.9rem;">${featured.description}</p>
        <button type="button" class="btn btn--dark" style="margin-top:16px;" data-media-id="${featured.id}">Ver contenido</button>
      </div>
    </div>
    <style>@media (min-width:768px){.featured-grid-media{grid-template-columns:1fr 1fr;}}</style>
  `;
  featuredEl.querySelector('[data-media-id]').addEventListener('click', () => openMediaModal(featured));
}

function renderFilters() {
  const types = [...new Set(MEDIA_ITEMS.map((m) => m.type))];
  filtersEl.innerHTML = types
    .map(
      (type) => `<button type="button" class="filter-chip${type === activeType ? ' active' : ''}" data-type="${type}">${type}</button>`
    )
    .join('');

  filtersEl.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      activeType = activeType === type ? null : type;
      renderFilters();
      renderResults();
    });
  });
}

function getFiltered() {
  const term = searchTerm.trim().toLowerCase();
  return MEDIA_ITEMS.filter((item) => {
    const matchesType = !activeType || item.type === activeType;
    const haystack = [item.title, item.type, item.category].join(' ').toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    return matchesType && matchesSearch;
  });
}

function renderResults() {
  const filtered = getFiltered();

  if (filtered.length === 0) {
    resultsEl.innerHTML = `
      <div class="state-box state-box--empty">
        <span class="icon">🗂️</span>
        <p class="text-soft">No encontramos material que coincida con tu búsqueda.</p>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div class="grid grid--sm-2 grid--lg-3">
      ${filtered
        .map(
          (item) => `
        <div class="card card--lila" style="display:flex; flex-direction:column; cursor:pointer;" data-media-id="${item.id}">
          ${mediaEmbed(item, false)}
          <span class="tag tag--lila" style="margin-top:16px; width:fit-content;">${item.type}</span>
          <h2 style="margin-top:12px; font-size:1.1rem; font-weight:600;">${item.title}</h2>
          <p class="text-soft" style="margin-top:8px; font-size:0.9rem; flex:1;">${item.description}</p>
          <p style="margin-top:12px; font-size:0.75rem; color:var(--ink-soft);">${item.category}${item.duration ? ' · ' + item.duration : ''}</p>
        </div>`
        )
        .join('')}
    </div>`;

  resultsEl.querySelectorAll('[data-media-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const item = MEDIA_ITEMS.find((m) => m.id === card.getAttribute('data-media-id'));
      openMediaModal(item);
    });
  });
}

// Vista completa del material seleccionado: se abre en el modal con el
// reproductor o imagen en tamaño grande (mediaEmbed con big=true).
function openMediaModal(item) {
  modalTitle.textContent = item.title;
  modalBody.innerHTML = `
    ${mediaEmbed(item, true)}
    <p style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.02em; color:var(--lila-400); margin-top:16px;">${item.type}${item.duration ? ' · ' + item.duration : ''}</p>
    <p class="text-soft" style="font-size:0.9rem; margin-top:4px;">${item.description}</p>
    ${
      item.externalUrl
        ? `<a href="${item.externalUrl}" target="_blank" rel="noreferrer" class="btn btn--dark" style="width:fit-content; margin-top:16px;">Abrir enlace original</a>`
        : `<p style="font-size:0.75rem; font-style:italic; color:var(--ink-soft); margin-top:16px;">[ENLACE EXTERNO — EDITABLE]</p>`
    }
  `;
  openModal(modal);
}

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderResults();
});

renderFeatured();
renderFilters();
renderResults();