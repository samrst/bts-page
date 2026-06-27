// ══════════════════════════════
// STATE
// ══════════════════════════════
let songs = JSON.parse(localStorage.getItem('bts_songs') || '[]');
let sortCol = 'titulo';
let sortDir = 1;
let searchQ = '';

// ════════════════════════════════
// NAV & MOBILE MENU
// ════════════════════════════════
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (navMobile && navMobile.classList.contains('open') && !navMobile.contains(e.target) && e.target !== navToggle) {
    navMobile.classList.remove('open');
  }
});

// ════════════════════════════════
// SAVE
// ════════════════════════════════
function save() { 
  localStorage.setItem('bts_songs', JSON.stringify(songs)); 
}

// ════════════════════════════════
// TOAST
// ════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ════════════════════════════════
// ESCAPE HTML
// ════════════════════════════════
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ════════════════════════════════
// RENDER TABLE (cadastro page)
// ════════════════════════════════
function renderTable() {
  const tbody = document.getElementById('songs-tbody');
  if (!tbody) return;

  const q = searchQ.toLowerCase();
  let data = songs.filter(s =>
    s.titulo.toLowerCase().includes(q) ||
    (s.album || '').toLowerCase().includes(q) ||
    (s.membro || '').toLowerCase().includes(q)
  );
  
  data.sort((a, b) => {
    const av = (a[sortCol] || '').toString().toLowerCase();
    const bv = (b[sortCol] || '').toString().toLowerCase();
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });

  const badge = document.getElementById('badge-count');
  if (badge) {
    badge.textContent = songs.length + (songs.length === 1 ? ' música' : ' músicas');
  }

  document.querySelectorAll('.songs-table thead th[data-col]').forEach(th => {
    th.classList.remove('sorted-asc','sorted-desc');
    if (th.dataset.col === sortCol)
      th.classList.add(sortDir === 1 ? 'sorted-asc' : 'sorted-desc');
  });

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="empty-icon">🎵</div>
        <p>${songs.length === 0 ? 'Nenhuma música cadastrada ainda. Adicione a primeira acima!' : 'Nenhum resultado para "' + searchQ + '".'}</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(s => `
    <tr>
      <td style="text-align:center">
        ${s.img
          ? `<img class="song-thumb" src="${s.img}" alt="${esc(s.titulo)}">`
          : `<div class="song-thumb-empty">🎵</div>`}
      </td>
      <td class="td-title">${esc(s.titulo)}</td>
      <td class="td-album">${esc(s.album || '—')}</td>
      <td class="td-member">${esc(s.membro || '—')}</td>
      <td class="td-year"><span>${s.ano || '—'}</span></td>
      <td class="td-album">${esc(s.genero || '—')}</td>
      <td class="td-fav" title="Favoritar" onclick="toggleFav('${s.id}')">
        ${s.fav ? '💜' : '🤍'}
      </td>
      <td class="td-actions">
        <button class="btn-del" onclick="deleteSong('${s.id}')">✕ Remover</button>
      </td>
    </tr>
  `).join('');
}

// ════════════════════════════════
// RENDER HOME PREVIEW
// ════════════════════════════════
function renderHomeSongs() {
  const el = document.getElementById('home-songs-container');
  if (!el) return;

  if (songs.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🎵</div>
      <p>Você ainda não cadastrou nenhuma música. <a href="cadastro.html" style="background:none;border:none;color:var(--purple-l);cursor:pointer;text-decoration:underline">Adicionar agora →</a></p>
    </div>`;
    return;
  }

  const favs = songs.filter(s => s.fav);
  const recent = [...songs].slice(-6).reverse();

  let html = '';

  if (favs.length > 0) {
    html += `<div style="margin-bottom:2rem">
      <p class="sec-label" style="margin-bottom:.5rem">Favoritas</p>
      <div class="row g-2 g-md-3">
        ${favs.map(s => homeSongCard(s, true)).join('')}
      </div>
    </div>`;
  }

  html += `<p class="sec-label" style="margin-bottom:.5rem">Recentes</p>
  <div class="songs-table-wrap">
    <table class="songs-table">
      <thead><tr>
        <th>Título</th><th>Álbum</th><th>Membro</th><th>Ano</th><th>Gênero</th><th>♡</th>
      </tr></thead>
      <tbody>
        ${recent.map(s => `<tr>
          <td class="td-title">${esc(s.titulo)}</td>
          <td class="td-album">${esc(s.album||'—')}</td>
          <td class="td-member">${esc(s.membro||'—')}</td>
          <td class="td-year"><span>${s.ano||'—'}</span></td>
          <td class="td-album">${esc(s.genero||'—')}</td>
          <td class="td-fav">${s.fav?'💜':'🤍'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div style="margin-top:1rem;text-align:right">
    <a href="cadastro.html" style="background:none;border:none;color:var(--purple-l);cursor:pointer;font-size:.8rem;letter-spacing:.05em;text-decoration:none">
      Ver todas as músicas →
    </a>
  </div>`;

  el.innerHTML = html;
}

function homeSongCard(s, isFav) {
  return `<div class="col-6 col-sm-4 col-md-4 col-lg-3">
    <div class="member-card" style="text-align:left;padding:1rem">
      ${s.img ? `<img src="${s.img}" style="width:100%;height:80px;object-fit:cover;border-radius:3px;margin-bottom:.6rem;border:1px solid var(--border)">` : ''}
      <div style="font-size:.7rem;color:var(--gold);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3rem">${esc(s.membro||'BTS')} ${isFav?'💜':''}</div>
      <div style="font-weight:600;font-size:.88rem;color:var(--white);margin-bottom:.2rem">${esc(s.titulo)}</div>
      <div style="font-size:.75rem;color:var(--muted)">${esc(s.album||'')}${s.ano?' · '+s.ano:''}</div>
    </div>
  </div>`;
}

// ════════════════════════════════
// IMAGE UPLOAD PREVIEW
// ════════════════════════════════
let pendingImg = null;
const inpImagem = document.getElementById('inp-imagem');
const imgPreview = document.getElementById('img-preview');
const imgPreviewName = document.getElementById('img-preview-name');
const imgPreviewWrap = document.getElementById('img-preview-wrap');
const btnRmImg = document.getElementById('btn-rm-img');

if (inpImagem) {
  inpImagem.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImg = e.target.result;
      if (imgPreview) imgPreview.src = pendingImg;
      if (imgPreviewName) imgPreviewName.textContent = file.name;
      if (imgPreviewWrap) imgPreviewWrap.classList.add('show');
    };
    reader.readAsDataURL(file);
  });
}

if (btnRmImg) {
  btnRmImg.addEventListener('click', () => {
    pendingImg = null;
    if (inpImagem) inpImagem.value = '';
    if (imgPreviewWrap) imgPreviewWrap.classList.remove('show');
  });
}

// ════════════════════════════════
// CADASTRAR
// ════════════════════════════════
const btnCadastrar = document.getElementById('btn-cadastrar');
if (btnCadastrar) {
  btnCadastrar.addEventListener('click', () => {
    const titulo = document.getElementById('inp-titulo').value.trim();
    if (!titulo) {
      document.getElementById('inp-titulo').focus();
      showToast('⚠ Informe o título da música.');
      return;
    }
    const song = {
      id: Date.now().toString(),
      titulo,
      album:  document.getElementById('inp-album').value.trim(),
      membro: document.getElementById('inp-membro').value,
      ano:    document.getElementById('inp-ano').value,
      genero: document.getElementById('inp-genero').value,
      obs:    document.getElementById('inp-obs').value.trim(),
      img:    pendingImg || null,
      fav: false,
    };
    songs.push(song);
    save();
    renderTable();
    showToast('💜 "' + titulo + '" cadastrada!');
    
    // Clear form
    ['inp-titulo','inp-album','inp-ano','inp-obs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const membroEl = document.getElementById('inp-membro');
    if (membroEl) membroEl.value = '';
    const generoEl = document.getElementById('inp-genero');
    if (generoEl) generoEl.value = '';
    
    pendingImg = null;
    if (inpImagem) inpImagem.value = '';
    if (imgPreviewWrap) imgPreviewWrap.classList.remove('show');
  });
}

// ════════════════════════════════
// DELETE / FAV
// ════════════════════════════════
window.deleteSong = function(id) {
  const s = songs.find(s => s.id === id);
  if (!s) return;
  if (!confirm('Remover "' + s.titulo + '"?')) return;
  songs = songs.filter(s => s.id !== id);
  save(); 
  renderTable(); 
  if (document.getElementById('home-songs-container')) renderHomeSongs();
  showToast('✕ Música removida.');
}

window.toggleFav = function(id) {
  const s = songs.find(s => s.id === id);
  if (!s) return;
  s.fav = !s.fav;
  save(); 
  renderTable(); 
  if (document.getElementById('home-songs-container')) renderHomeSongs();
}

// ════════════════════════════════
// SORT
// ════════════════════════════════
document.querySelectorAll('.songs-table thead th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    if (sortCol === th.dataset.col) sortDir *= -1;
    else { sortCol = th.dataset.col; sortDir = 1; }
    renderTable();
  });
});

// ════════════════════════════════
// SEARCH
// ════════════════════════════════
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', e => {
    searchQ = e.target.value;
    renderTable();
  });
}

// ════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 70);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ════════════════════════════════
// ERA FILTERS
// ════════════════════════════════
document.querySelectorAll('.era-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.era-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const f = pill.dataset.filter;
    document.querySelectorAll('.era-item').forEach(item => {
      const matchType = f === 'all' || item.dataset.type === f;
      const matchYear = f === 'all' || item.dataset.year === f || matchType;
      const show = f === 'all'
        || item.dataset.type === f
        || item.dataset.year === f;
      item.classList.toggle('hidden', !show);
    });
  });
});

// ════════════════════════════════
// INIT
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('songs-tbody')) renderTable();
  if (document.getElementById('home-songs-container')) renderHomeSongs();
});

//som do banner
const video = document.getElementById("videoBanner");
const btnSom = document.getElementById("btnSom");

btnSom.addEventListener("click", () => {
    video.muted = !video.muted;

    if (video.muted) {
        btnSom.textContent = "🔇 Ativar Som";
    } else {
        btnSom.textContent = "🔊 Desativar Som";
    }
});
  // Script para o envio das mensagens
  const form = document.getElementById("form-contato");
  const status = document.getElementById("status-msg");

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    
    // Mostra estado de envio
    const btn = document.getElementById('btn-enviar');
    btn.innerText = 'ENVIANDO...';
    btn.disabled = true;

    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        status.innerHTML = "✓ Mensagem enviada com sucesso!";
        status.style.color = "#10B981";
        status.style.display = "block";
        form.reset();
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
          } else {
            status.innerHTML = "Oops! Ocorreu um erro ao enviar.";
          }
          status.style.color = "#ef4444";
          status.style.display = "block";
        })
      }
    }).catch(error => {
      status.innerHTML = "Oops! Ocorreu um erro de conexão.";
      status.style.color = "#ef4444";
      status.style.display = "block";
    }).finally(() => {
      btn.innerText = '＋ Enviar Mensagem';
      btn.disabled = false;
    });
  }
  
  form.addEventListener("submit", handleSubmit);
