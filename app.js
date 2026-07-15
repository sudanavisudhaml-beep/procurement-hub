/* ============================================================
   Astra Procurement Hub — app logic
   Router (Beranda / Pengamanan / Travel), renderers, and a
   graceful logo fallback so the site stays clean without PNGs.
   ============================================================ */
(function () {
  const { SECURITY_SEGMENTS, TRAVEL_VENDORS } = window.HubData;

  /* ----------------- LOGO FALLBACK ----------------- */
  /* Any <img data-fallback="astra"> that fails to load is replaced
     by a styled text wordmark, so a missing PNG never breaks layout. */
  function swapToFallback(img) {
    if (!img.parentNode) return; // already swapped
    const kind = img.getAttribute('data-fallback');
    const span = document.createElement('span');
    if (kind === 'astra') {
      span.className = 'logo-fallback astra';
      span.innerHTML = 'astra<small>&reg;</small>';
    } else {
      span.className = 'logo-fallback';
      span.textContent = img.getAttribute('alt') || '';
    }
    img.replaceWith(span);
  }
  function installLogoFallback() {
    document.querySelectorAll('img[data-fallback]').forEach(img => {
      img.addEventListener('error', () => swapToFallback(img), { once: true });
      // The 404 may fire BEFORE this listener attaches (fast local server),
      // so also catch images that already finished loading broken.
      if (!img.getAttribute('src') || (img.complete && img.naturalWidth === 0)) {
        swapToFallback(img);
      }
    });
  }

  /* ----------------- SECURITY SEGMENTS ----------------- */
  function specRow(k, v) {
    return `<div class="specrow"><div class="sk">${k}</div><div class="sv">${v}</div></div>`;
  }
  function segCard(s) {
    return `<div class="seg-card">
      <div class="seg-head">
        <div class="sico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${s.icon}</svg></div>
        <div><div class="stitle">${s.name}</div><div class="sdesc">${s.desc}</div></div>
        <div class="spill">2 model layanan</div>
      </div>
      <div class="models">
        <div class="model labour">
          <div class="mhead"><div class="mtag"><span class="md"></span>Labour Supply</div><div class="price">${s.labour.price} <small>${s.labour.unit}</small></div></div>
          ${specRow("Personel", `<b>${s.labour.people}</b>`)}${specRow("Sistem", s.labour.system)}${specRow("Perangkat", s.labour.device)}${specRow("Eksternal", s.labour.ext)}
        </div>
        <div class="model job">
          <div class="mhead"><div class="mtag"><span class="md"></span>Job Supply</div><div class="price">${s.job.price} <small>${s.job.unit}</small></div></div>
          ${specRow("Personel", `<b>${s.job.people}</b>`)}${specRow("Sistem", s.job.system)}${specRow("Perangkat", s.job.device)}${specRow("Eksternal", s.job.ext)}
        </div>
      </div>
      <div class="seg-foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/></svg>
        Treatment / renpam mengacu pada hasil Assessment · Indikasi harga sewa, minimal kontrak 3 tahun · Final mengikuti negosiasi BU
      </div>
    </div>`;
  }
  function renderSegments(f = "all") {
    const c = document.getElementById('seg-container');
    if (!c) return;
    c.innerHTML = SECURITY_SEGMENTS.filter(s => f === "all" || s.id === f).map(segCard).join('');
  }

  /* ----------------- TRAVEL VENDORS ----------------- */
  function qcdsmDots() { return '<span class="qd">' + Array(5).fill('<i></i>').join('') + '</span>'; }
  function travelRow(v) {
    const tc = v.term === 30 ? 'term-30' : 'term-14';
    const logoCell = v.mark
      ? `<div class="vlogo brand">${v.mark}</div>`
      : `<div class="vlogo" style="background:${v.color}">${v.logo}</div>`;
    return `<div class="vrow" data-name="${(v.name + ' ' + v.sub + ' ' + v.addr).toLowerCase()}">
      <div class="vname">${logoCell}<div><div class="vn1">${v.name}</div><div class="vn2">${v.sub}</div></div></div>
      <div class="vaddr">${v.addr}</div>
      <div class="vphone">${v.phone}</div>
      <div class="vterm"><span class="term-pill ${tc}">TOP ${v.term} hari</span></div>
      <div class="vqcdsm"><span class="qbadge">${qcdsmDots()} 4/5</span></div>
    </div>`;
  }
  function renderTravel() {
    const rows = document.getElementById('travel-rows');
    if (!rows) return;
    rows.innerHTML = TRAVEL_VENDORS.map(travelRow).join('');
    const ts = document.getElementById('travelSearch'), tEmpty = document.getElementById('travelEmpty');
    if (ts) {
      ts.addEventListener('input', () => {
        const q = ts.value.trim().toLowerCase();
        let shown = 0;
        document.querySelectorAll('.vrow').forEach(r => {
          const m = r.dataset.name.includes(q);
          r.style.display = m ? '' : 'none';
          if (m) shown++;
        });
        if (tEmpty) tEmpty.style.display = shown === 0 ? 'block' : 'none';
      });
    }
  }

  /* ----------------- ROUTER ----------------- */
  const views = {
    home: document.getElementById('view-home'),
    security: document.getElementById('view-security'),
    travel: document.getElementById('view-travel')
  };
  const secList = document.getElementById('sec-list');
  const secDetail = document.getElementById('sec-detail');

  function showSecLayer(layer) { // 'list' | 'detail'
    if (!secList || !secDetail) return;
    if (layer === 'detail') { secList.style.display = 'none'; secDetail.style.display = 'block'; }
    else { secList.style.display = 'block'; secDetail.style.display = 'none'; }
  }
  function go(name) {
    Object.values(views).forEach(v => v && v.classList.remove('active'));
    (views[name] || views.home).classList.add('active');
    document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.go === name));
    if (name === 'security') showSecLayer('list'); // always land on vendor list
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  window.go = go; // expose for inline handlers if needed

  /* ----------------- WIRE EVENTS ----------------- */
  function init() {
    installLogoFallback();
    renderSegments();
    renderTravel();

    // segment filter chips
    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      renderSegments(c.dataset.seg);
    }));

    // navigation
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-go]');
      if (t) go(t.dataset.go);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const t = e.target.closest('[data-go]');
        if (t && t.getAttribute('role') === 'button') go(t.dataset.go);
      }
    });

    // vendor selection within Pengamanan
    document.querySelectorAll('[data-vendor]').forEach(c => {
      c.addEventListener('click', () => { showSecLayer('detail'); window.scrollTo({ top: 0, behavior: 'auto' }); });
    });
    const back = document.getElementById('sec-back');
    if (back) back.addEventListener('click', () => { showSecLayer('list'); window.scrollTo({ top: 0, behavior: 'auto' }); });
  }

  /* ----------------- sendPrompt fallback ----------------- */
  /* In the Claude canvas, sendPrompt() exists. On a plain web host it
     doesn't — provide a no-op-ish fallback so the contribute buttons
     don't throw. (Wired to a real form/flow in a later step.) */
  if (typeof window.sendPrompt !== 'function') {
    window.sendPrompt = function (text) {
      console.log('[sendPrompt fallback]', text);
      alert('Fitur "Bagikan Referensi" akan diaktifkan setelah login & database tersambung.\n\n(' + text + ')');
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
