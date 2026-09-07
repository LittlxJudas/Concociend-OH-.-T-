// ============================================================================
// [NOTA TÉCNICA IMPORTANTE]
// - La pestaña "Opiniones" lee y escribe directamente en Firebase Realtime
//   Database (https://conociendoht-default-rtdb.firebaseio.com), en la ruta
//   "opiniones". Esto significa que SÍ se comparte entre dispositivos y
//   navegadores, a diferencia de las intervenciones (ver más abajo).
// - La pestaña "Intervenciones" sigue usando localStorage (solo este
//   navegador) porque las solicitudes de intervención aún no se conectaron
//   a una base de datos. Puedes migrarlas de la misma forma más adelante.
// - La clave de acceso de este panel es solo un candado visual, NO seguridad
//   real. Cualquier persona que revise el código fuente puede leerla. Antes
//   de usar esto en producción, protege la ruta "opiniones" con reglas de
//   seguridad de Firebase y/o autenticación real.
// ============================================================================

// [CLAVE DE ACCESO EDITABLE] — cámbiala por la que usará tu equipo.
const ADMIN_PASSWORD = 'marketingGenero2026';

const FIREBASE_DB_URL = 'https://conociendoht-default-rtdb.firebaseio.com';
const OPINIONS_PATH = 'opiniones';

const gateSection = document.getElementById('admin-gate');
const panelSection = document.getElementById('admin-panel');
const gateForm = document.getElementById('admin-gate-form');
const gateError = document.getElementById('admin-gate-error');
const logoutBtn = document.getElementById('admin-logout');

const tabButtons = document.querySelectorAll('[data-admin-tab]');
const statusFiltersEl = document.getElementById('admin-status-filters');
const searchInput = document.getElementById('admin-search');
const resultsEl = document.getElementById('admin-results');
const emptyGlobalEl = document.getElementById('admin-empty-global');
const exportBtn = document.getElementById('admin-export');
const clearBtn = document.getElementById('admin-clear');
const countBadge = document.getElementById('admin-count');

const modal = document.getElementById('admin-modal');
const modalTitle = document.getElementById('admin-modal-title');
const modalBody = document.getElementById('admin-modal-body');

let activeTab = 'formulario'; // 'formulario' (opiniones, en Firebase) | 'intervenciones' (localStorage)
let activeStatus = null;
let searchTerm = '';
let cachedItems = [];
let isLoading = false;

const STATUS_LABELS = {
  nuevo: 'Nuevo',
  pendiente: 'Pendiente',
  proceso: 'En proceso',
  resuelto: 'Resuelto',
};

function isOpinionsTab() {
  return activeTab === 'formulario';
}

// ============ Carga de datos ============
async function fetchOpinionsFromFirebase() {
  const response = await fetch(`${FIREBASE_DB_URL}/${OPINIONS_PATH}.json`);
  if (!response.ok) throw new Error('No se pudo leer Firebase.');
  const data = await response.json();
  if (!data) return [];
  return Object.entries(data)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function loadInterventionsFromLocal() {
  try {
    return JSON.parse(localStorage.getItem('interventionRequests') || '[]');
  } catch (err) {
    return [];
  }
}

function saveInterventionsToLocal(items) {
  localStorage.setItem('interventionRequests', JSON.stringify(items));
}

// ============ Acceso ============
function isUnlocked() {
  return sessionStorage.getItem('adminUnlocked') === 'true';
}

function showPanel() {
  gateSection.hidden = true;
  panelSection.hidden = false;
  refreshAndRender();
}

function showGate() {
  gateSection.hidden = false;
  panelSection.hidden = true;
}

gateForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = document.getElementById('admin-password').value;
  if (value === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminUnlocked', 'true');
    gateError.hidden = true;
    gateForm.reset();
    showPanel();
  } else {
    gateError.hidden = false;
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminUnlocked');
  showGate();
});

// ============ Tabs ============
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeTab = btn.getAttribute('data-admin-tab');
    activeStatus = null;
    searchTerm = '';
    searchInput.value = '';
    tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
    refreshAndRender();
  });
});

// ============ Filtros de estado ============
function renderStatusFilters(items) {
  const statuses = [...new Set(items.map((i) => i.status).filter(Boolean))];
  statusFiltersEl.innerHTML = statuses
    .map(
      (s) =>
        `<button type="button" class="filter-chip${s === activeStatus ? ' active' : ''}" data-status="${s}">${STATUS_LABELS[s] || s}</button>`
    )
    .join('');

  statusFiltersEl.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = btn.getAttribute('data-status');
      activeStatus = activeStatus === s ? null : s;
      renderResults();
    });
  });
}

function getFiltered() {
  const term = searchTerm.trim().toLowerCase();
  return cachedItems.filter((item) => {
    const matchesStatus = !activeStatus || item.status === activeStatus;
    const haystack = Object.values(item).join(' ').toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    return matchesStatus && matchesSearch;
  });
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (err) {
    return iso;
  }
}

function summaryLine(item) {
  if (isOpinionsTab()) {
    const stars = '★'.repeat(item.rating || 0) + '☆'.repeat(5 - (item.rating || 0));
    return `${stars} · ${item.topic || ''}`;
  }
  return `${item.institution || ''} · ${item.place || ''}`;
}

function titleLine(item) {
  if (isOpinionsTab()) {
    return item.name || 'Opinión anónima';
  }
  return item.contact || '[SIN CONTACTO]';
}

function renderResults() {
  if (isLoading) {
    resultsEl.innerHTML = `
      <div class="state-box state-box--empty">
        <span class="icon">⏳</span>
        <p class="text-soft">Cargando solicitudes…</p>
      </div>`;
    return;
  }

  const filtered = getFiltered();
  countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    resultsEl.innerHTML = `
      <div class="state-box state-box--empty">
        <span class="icon">🗂️</span>
        <p class="text-soft">No hay solicitudes que coincidan con este filtro.</p>
      </div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${filtered
        .map(
          (item) => `
        <div class="card" style="padding:20px 24px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
          <div style="cursor:pointer; flex:1; min-width:200px;" data-open-id="${item.id}">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <p style="font-weight:600;">${titleLine(item)}</p>
              <span class="tag ${item.status === 'resuelto' ? 'tag--menta' : item.status === 'proceso' ? 'tag--lila' : 'tag--rosa'}">${STATUS_LABELS[item.status] || item.status || '—'}</span>
            </div>
            <p class="text-soft" style="font-size:0.85rem; margin-top:4px;">${summaryLine(item)}</p>
            <p style="font-size:0.75rem; color:var(--ink-soft); margin-top:4px;">${formatDate(item.createdAt)}</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn--outline" data-open-id="${item.id}" style="padding:8px 16px; font-size:0.8rem;">Ver</button>
            <button type="button" class="btn" style="background:var(--menta-100); padding:8px 16px; font-size:0.8rem;" data-mark-resolved="${item.id}">✓ Resuelto</button>
            <button type="button" class="btn" style="background:var(--rosa-100); padding:8px 16px; font-size:0.8rem;" data-delete-id="${item.id}">Eliminar</button>
          </div>
        </div>`
        )
        .join('')}
    </div>`;

  resultsEl.querySelectorAll('[data-open-id]').forEach((el) => {
    el.addEventListener('click', () => openDetail(el.getAttribute('data-open-id')));
  });
  resultsEl.querySelectorAll('[data-mark-resolved]').forEach((btn) => {
    btn.addEventListener('click', () => updateStatus(btn.getAttribute('data-mark-resolved'), 'resuelto'));
  });
  resultsEl.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => deleteItem(btn.getAttribute('data-delete-id')));
  });
}

async function updateStatus(id, status) {
  if (isOpinionsTab()) {
    try {
      await fetch(`${FIREBASE_DB_URL}/${OPINIONS_PATH}/${id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      alert('No se pudo actualizar el estado en Firebase. Revisa la conexión o las reglas de la base de datos.');
      return;
    }
  } else {
    const items = loadInterventionsFromLocal();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    items[idx].status = status;
    saveInterventionsToLocal(items);
  }
  refreshAndRender();
}

async function deleteItem(id) {
  if (isOpinionsTab()) {
    try {
      await fetch(`${FIREBASE_DB_URL}/${OPINIONS_PATH}/${id}.json`, { method: 'DELETE' });
    } catch (err) {
      alert('No se pudo eliminar en Firebase. Revisa la conexión o las reglas de la base de datos.');
      return;
    }
  } else {
    saveInterventionsToLocal(loadInterventionsFromLocal().filter((i) => i.id !== id));
  }
  refreshAndRender();
}

function openDetail(id) {
  const item = cachedItems.find((i) => i.id === id);
  if (!item) return;

  modalTitle.textContent = titleLine(item);

  const rows = Object.entries(item)
    .filter(([key]) => key !== 'id')
    .map(([key, value]) => `<p style="font-size:0.85rem;"><strong style="color:var(--ink-soft); font-weight:600;">${key}:</strong> ${String(value)}</p>`)
    .join('');

  modalBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px;">${rows}</div>
    <div style="display:flex; gap:8px; margin-top:20px; flex-wrap:wrap;">
      <button type="button" class="btn" style="background:var(--lila-100);" data-set-status="proceso">En proceso</button>
      <button type="button" class="btn" style="background:var(--menta-100);" data-set-status="resuelto">Marcar resuelto</button>
      <button type="button" class="btn" style="background:var(--rosa-100);" data-modal-delete>Eliminar</button>
    </div>
  `;

  modalBody.querySelectorAll('[data-set-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await updateStatus(item.id, btn.getAttribute('data-set-status'));
      closeModal(modal);
    });
  });
  const delBtn = modalBody.querySelector('[data-modal-delete]');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      await deleteItem(item.id);
      closeModal(modal);
    });
  }

  openModal(modal);
}

function toCsv(items) {
  if (!items.length) return '';
  const headers = [...new Set(items.flatMap((i) => Object.keys(i)))];
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')].concat(items.map((item) => headers.map((h) => escape(item[h])).join(',')));
  return lines.join('\n');
}

exportBtn.addEventListener('click', () => {
  const items = getFiltered();
  const csv = toCsv(items);
  if (!csv) return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${isOpinionsTab() ? 'opiniones' : 'interventionRequests'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', async () => {
  const label = isOpinionsTab() ? 'las opiniones de Firebase' : 'las solicitudes de intervención guardadas en este navegador';
  if (!confirm(`Esto eliminará TODAS ${label} de esta sección. ¿Continuar?`)) return;

  if (isOpinionsTab()) {
    try {
      await fetch(`${FIREBASE_DB_URL}/${OPINIONS_PATH}.json`, { method: 'DELETE' });
    } catch (err) {
      alert('No se pudo vaciar la sección en Firebase. Revisa la conexión o las reglas de la base de datos.');
      return;
    }
  } else {
    saveInterventionsToLocal([]);
  }
  refreshAndRender();
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderResults();
});

async function refreshAndRender() {
  isLoading = isOpinionsTab();
  renderResults();

  try {
    cachedItems = isOpinionsTab() ? await fetchOpinionsFromFirebase() : loadInterventionsFromLocal();
  } catch (err) {
    console.error('Error al cargar datos:', err);
    resultsEl.innerHTML = `
      <div class="state-box state-box--error">
        <span class="icon">⚠️</span>
        <p class="text-soft">No se pudo conectar con Firebase. Revisa tu conexión o las reglas de seguridad de la base de datos.</p>
      </div>`;
    isLoading = false;
    countBadge.textContent = '0';
    emptyGlobalEl.hidden = true;
    return;
  }

  isLoading = false;
  renderStatusFilters(cachedItems);
  renderResults();
  emptyGlobalEl.hidden = cachedItems.length !== 0;
}

// ============ Inicio ============
if (isUnlocked()) {
  showPanel();
} else {
  showGate();
}
