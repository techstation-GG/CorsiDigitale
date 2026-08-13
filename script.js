<script>
const API_URL = 'https://script.google.com/macros/s/AKfycbwp2gclUaxy7XMocDWCJzTSHb3NGiqJeA01-ZryoRZNLQNqtwNSNFgC58dZhWL0e0rWzw/exec';
let allData = [], headers = [];

async function fetchData() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div>Caricamento corsi…</div>';
  document.getElementById('resultCount').textContent = '';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Errore HTTP: ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    headers = data.headers;
    allData = data.rows;
    displayData(headers, allData);
    document.getElementById('lastUpdate').textContent = 'Aggiornato: ' + data.lastUpdate;
  } catch (error) {
    contentDiv.innerHTML = `<div class="loading-state" style="color:#f87171;">❌ ${error.message}</div>`;
  }
}

function displayData(headers, rows) {
  const contentDiv = document.getElementById('content');
  const countDiv = document.getElementById('resultCount');

  if (rows.length === 0) {
    contentDiv.innerHTML = '<div class="empty-state">Nessun corso trovato.</div>';
    countDiv.textContent = '';
    return;
  }

  countDiv.textContent = rows.length + ' cors' + (rows.length !== 1 ? 'i' : 'o') + ' trovat' + (rows.length !== 1 ? 'i' : 'o');

  let html = '<table><thead><tr>';
  headers.forEach(h => { html += `<th>${escapeHtml(h)}</th>`; });
  html += '</tr></thead><tbody>';

  rows.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      const cell = row[h];
      if (cell && typeof cell === 'object' && cell.type === 'image') {
        html += `<td><img src="${cell.url}" alt="" style="max-width:120px;max-height:80px;border-radius:6px;object-fit:cover;"></td>`;
      } else if (cell && typeof cell === 'object' && cell.type === 'link') {
        html += `<td><a href="${cell.url}" target="_blank">${escapeHtml(cell.text)}</a></td>`;
      } else if (typeof cell === 'string' && cell.match(/^https?:\/\//)) {
        if (cell.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          html += `<td><img src="${cell}" alt="" style="max-width:120px;max-height:80px;border-radius:6px;object-fit:cover;"></td>`;
        } else {
          html += `<td><a href="${cell}" target="_blank">${escapeHtml(cell)}</a></td>`;
        }
      } else {
        html += `<td>${escapeHtml(cell !== null && cell !== undefined ? cell : '')}</td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  contentDiv.innerHTML = html;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const d = document.createElement('div');
  d.textContent = String(text);
  return d.innerHTML;
}

document.getElementById('searchInput').addEventListener('input', function(e) {
  const term = e.target.value.toLowerCase().trim();
  if (!term) { displayData(headers, allData); return; }
  const filtered = allData.filter(row =>
    Object.values(row).some(v => {
      if (v && typeof v === 'object' && v.type === 'link')
        return v.text.toLowerCase().includes(term) || v.url.toLowerCase().includes(term);
      return String(v).toLowerCase().includes(term);
    })
  );
  displayData(headers, filtered);
});

fetchData();

// Back to Top button behavior
const backToTopBtn = document.createElement('button');
backToTopBtn.id = 'back-to-top';
backToTopBtn.type = 'button';
backToTopBtn.ariaLabel = 'Torna su';
backToTopBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V8M12 8l-4 4M12 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.body.appendChild(backToTopBtn);

function updateBackToTopVisibility() {
  const show = window.scrollY > 240;
  backToTopBtn.classList.toggle('show', show);
}
window.addEventListener('scroll', updateBackToTopVisibility);
window.addEventListener('resize', updateBackToTopVisibility);
updateBackToTopVisibility();
</script>
