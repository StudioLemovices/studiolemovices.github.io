/* Studio Lemovices — tout le contenu vient de contenu.json */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = $('#header');
  const home = $('#home');
  const pieceView = $('#piece');
  const footer = $('#footer');

  let C = null;            // contenu.json
  let lang = 'fr';
  let current = null;      // slug de la fiche affichée, ou null pour l'accueil
  let view = 'home';       // vue demandée (mise à jour tout de suite, avant l'animation)
  let homeScroll = 0;
  let pendingGoto = null;
  let firstRender = true;
  let formState = { sent: false, values: {} };
  const probes = {};       // dossier making-of -> promesse de liste de photos

  /* ---------- Outils ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.fr ?? '') : (v ?? ''));
  const ui = (k) => t(C.interface[k]);
  const quote = (s) => `« ${s} »`;
  const family = (id) => C.familles.find((f) => f.id === id);
  const slash = (d) => (d.endsWith('/') ? d : d + '/');
  const instaIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".8" fill="currentColor"/></svg>';

  function pickLang() {
    try { const s = sessionStorage.getItem('lang'); if (s === 'fr' || s === 'en') return s; } catch (e) { /* navigation privée */ }
    const l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return l.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  /* ---------- En-tête et pied de page ---------- */
  function renderHeader() {
    header.innerHTML = `
      <a class="brand" href="#/" data-goto="accueil"><img src="${esc(C.accueil.logo)}" alt="" width="30" height="30"><span>${esc(C.nom)}</span></a>
      <nav class="nav" id="nav">
        <a href="#/" data-goto="pieces">${esc(ui('nav_pieces'))}</a>
        <a href="#/" data-goto="atelier">${esc(ui('nav_atelier'))}</a>
        <a href="#/" data-goto="methode">${esc(ui('nav_methode'))}</a>
        <a href="#/" data-goto="a-propos">${esc(ui('nav_a_propos'))}</a>
        <a href="#/" data-goto="contact">${esc(ui('nav_contact'))}</a>
      </nav>
      <button class="lang" id="lang" type="button" aria-label="Langue / Language"><span class="${lang === 'fr' ? 'on' : ''}">FR</span> / <span class="${lang === 'en' ? 'on' : ''}">EN</span></button>
      <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu"><span></span></button>`;
  }

  function renderFooter() {
    footer.innerHTML = `
      <div class="wrap foot">
        <p style="margin:0">© ${new Date().getFullYear()} ${esc(C.mentions_legales.editeur)}</p>
        <details><summary>${esc(ui('mentions_titre'))}</summary><p>${esc(ui('mentions_texte'))}</p></details>
        <a href="${esc(C.contact.instagram)}" target="_blank" rel="noopener">Instagram</a>
      </div>`;
  }

  /* ---------- Page d'accueil ---------- */
  function renderHome() {
    const a = C.accueil, i = C.intro, m = C.methode, ap = C.a_propos, c = C.contact;

    const families = C.familles.map((f) => {
      const list = C.pieces.filter((p) => p.famille === f.id);
      if (!list.length) return '';
      return `
        <div class="family" id="famille-${esc(f.id)}">
          <header class="family-head reveal">
            <span class="num">${esc(f.num)}</span>
            <h3 class="h-family">${esc(f.nom)}</h3>
          </header>
          <ul class="grid">
            ${list.map((p) => `
              <li class="card reveal">
                <a href="#/${esc(p.slug)}" data-slug="${esc(p.slug)}">
                  <div class="frame"><img src="${esc(p.photos[0])}" alt="${esc(p.nom)}" loading="lazy" decoding="async" width="800" height="1000"></div>
                  <span class="card-name">${esc(p.nom)}</span>
                </a>
              </li>`).join('')}
          </ul>
        </div>`;
    }).join('');

    const making = C.pieces.filter((p) => p.making_of).map((p) => `
      <div class="mo-row reveal" id="atelier-${esc(p.slug)}" data-dir="${esc(slash(p.making_of))}" data-name="${esc(p.nom)}">
        <div class="mo-head"><h3><a href="#/${esc(p.slug)}">${esc(p.nom)}</a></h3><span class="count"></span></div>
        <div class="mo-strip"></div>
      </div>`).join('');

    const texts = t(ap.texte);
    home.innerHTML = `
      <section class="hero" id="accueil">
        <div class="hero-inner">
          <img class="hero-logo" src="${esc(a.logo)}" alt="" width="400" height="400" fetchpriority="high">
          <h1 class="hero-title">${esc(C.nom)}</h1>
          <p class="hero-phrase lead">${esc(t(a.phrase))}</p>
          <p class="hero-lieux">${esc(a.lieux)}</p>
        </div>
        <a class="hero-scroll" href="#/" data-goto="intro" aria-label="${esc(t(i.titre))}"></a>
      </section>

      <section class="section wrap" id="intro">
        <div class="intro">
          <div class="section-head reveal">
            <h2 class="h-section">${esc(t(i.titre))}</h2>
            <span class="rule"></span>
          </div>
          <p class="intro-text reveal">${esc(t(i.texte))}</p>
          <p class="intro-origin lead reveal">${esc(t(i.nom_origine))}</p>
        </div>
      </section>

      <section class="section wrap" id="pieces">
        <div class="section-head reveal">
          <h2 class="h-section">${esc(ui('pieces_titre'))}</h2>
          <span class="rule"></span>
        </div>
        <ul class="toc">
          ${C.familles.filter((f) => C.pieces.some((p) => p.famille === f.id)).map((f) => `
            <li class="reveal">
              <a href="#/" data-goto="famille-${esc(f.id)}">
                <div class="toc-img">${f.texture ? `<img src="${esc(f.texture)}" alt="" loading="lazy" decoding="async" width="800" height="1000">` : ''}</div>
                <span class="toc-label"><span class="num">${esc(f.num)}</span><span class="toc-name">${esc(f.nom)}</span></span>
              </a>
            </li>`).join('')}
        </ul>
        ${families}
      </section>

      <section class="section atelier" id="atelier">
        <div class="wrap">
          <div class="section-head reveal">
            <h2 class="h-section">${esc(t(C.making_of.titre))}</h2>
            <span class="rule"></span>
            <p class="atelier-intro lead">${esc(t(C.making_of.texte))}</p>
          </div>
          ${making}
        </div>
      </section>

      <section class="section wrap" id="methode">
        <div class="section-head reveal">
          <h2 class="h-section">${esc(t(m.titre))}</h2>
          <span class="rule"></span>
        </div>
        <ol class="steps">
          ${m.etapes.map((e) => `
            <li class="step reveal">
              <div class="frame"><img src="${esc(e.photo)}" alt="${esc(t(e.titre))}" loading="lazy" decoding="async" width="800" height="1000"></div>
              <span class="num">${esc(e.num)}</span>
              <h3>${esc(t(e.titre))}</h3>
              <p>${esc(t(e.texte))}</p>
            </li>`).join('')}
        </ol>
      </section>

      <section class="section wrap" id="a-propos">
        <div class="section-head reveal">
          <h2 class="h-section">${esc(t(ap.titre))}</h2>
          <span class="rule"></span>
        </div>
        <div class="about">
          <div class="about-photo reveal"><img src="${esc(ap.photo)}" alt="${esc(C.nom)}" loading="lazy" decoding="async" width="190" height="600"></div>
          <div class="about-text reveal">${(Array.isArray(texts) ? texts : [texts]).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </div>
      </section>

      <section class="section wrap" id="contact">
        <div class="contact">
          <div class="section-head reveal">
            <h2 class="h-section">${esc(t(c.titre))}</h2>
            <span class="rule"></span>
            <p class="lead" style="margin:0">${esc(t(c.phrase))}</p>
          </div>
          <div class="reveal" id="form-zone">${formHTML()}</div>
          <div class="contact-links reveal">
            <a class="insta" href="${esc(c.instagram)}" target="_blank" rel="noopener">${instaIcon}<span>@studiolemovices</span></a>
            <span class="places">${esc(c.lieux)}</span>
          </div>
        </div>
      </section>`;

    reveal(home);
    watchAtelier();
  }

  /* ---------- Formulaire (Web3Forms) ---------- */
  function formHTML() {
    if (formState.sent) return `<div class="thanks"><p class="lead" style="margin:0">${esc(ui('merci'))}</p></div>`;
    const v = formState.values;
    return `
      <form class="form" id="form" novalidate>
        <div class="field"><label for="f-nom">${esc(ui('nom'))}</label><input id="f-nom" name="name" type="text" autocomplete="name" required value="${esc(v.name)}"></div>
        <div class="field"><label for="f-email">${esc(ui('email'))}</label><input id="f-email" name="email" type="email" autocomplete="email" required value="${esc(v.email)}"></div>
        <div class="field"><label for="f-msg">${esc(ui('message'))}</label><textarea id="f-msg" name="message" required>${esc(v.message)}</textarea></div>
        <div class="trap" aria-hidden="true"><label>botcheck<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off"></label></div>
        <button class="btn" type="submit">${esc(ui('envoyer'))}</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>`;
  }

  function saveForm() {
    const f = $('#form');
    if (f) formState.values = { name: f.name.value, email: f.email.value, message: f.message.value };
  }

  async function submitForm(form) {
    const status = $('.form-status', form);
    const btn = $('button[type=submit]', form);
    if (form.botcheck.checked) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    saveForm();
    btn.disabled = true;
    btn.textContent = ui('envoi');
    status.textContent = '';
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: C.contact.formulaire.web3forms_key,
          subject: `${C.nom} — ${formState.values.name}`,
          from_name: C.nom,
          name: formState.values.name,
          email: formState.values.email,
          message: formState.values.message,
          botcheck: false,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error('send');
      formState = { sent: true, values: {} };
      $('#form-zone').innerHTML = formHTML();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = ui('envoyer');
      status.textContent = ui('erreur');
    }
  }

  /* ---------- Making-of : on trouve 01.jpg, 02.jpg… tout seul ---------- */
  function probe(dir) {
    if (!probes[dir]) {
      probes[dir] = (async () => {
        const found = [];
        for (let start = 1; start < 100; start += 6) {
          const batch = Array.from({ length: 6 }, (_, k) => `${dir}${String(start + k).padStart(2, '0')}.jpg`);
          const ok = await Promise.all(batch.map((u) => fetch(u, { method: 'HEAD' }).then((r) => r.ok).catch(() => false)));
          for (let k = 0; k < batch.length; k++) {
            if (!ok[k]) return found;
            found.push(batch[k]);
          }
        }
        return found;
      })();
    }
    return probes[dir];
  }

  function fillStrip(row) {
    probe(row.dataset.dir).then((list) => {
      if (!row.isConnected) return;
      if (!list.length) { row.hidden = true; return; }
      const name = row.dataset.name;
      $('.count', row).textContent = String(list.length).padStart(2, '0');
      $('.mo-strip', row).innerHTML = list.map((src, k) => `
        <button class="mo-item" type="button" data-i="${k}" aria-label="${esc(name)} ${k + 1}/${list.length}">
          <img src="${esc(src)}" alt="${esc(name)}" loading="lazy" decoding="async" width="800" height="1000">
        </button>`).join('');
      row._photos = list;
    });
  }

  function watchAtelier() {
    const section = $('#atelier', home);
    if (!section) return;
    const start = () => $$('.mo-row', section).forEach(fillStrip);
    if (!('IntersectionObserver' in window)) return start();
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: '1200px 0px' });
    io.observe(section);
  }

  /* ---------- Apparitions au défilement ---------- */
  function reveal(root) {
    const els = $$('.reveal', root);
    if (reduce || !firstRender || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Fiche d'une pièce ---------- */
  function renderPiece(slug) {
    const n = C.pieces.length;
    const i = C.pieces.findIndex((p) => p.slug === slug);
    const p = C.pieces[i];
    const prev = C.pieces[(i - 1 + n) % n];
    const next = C.pieces[(i + 1) % n];
    const f = family(p.famille);
    pieceView.innerHTML = `
      <article class="fiche wrap">
        <div class="fiche-grid">
          <div class="fiche-photos">
            ${p.photos.map((src, k) => `
              <button class="fiche-photo" type="button" data-i="${k}" aria-label="${esc(p.nom)} ${k + 1}/${p.photos.length}">
                <img src="${esc(src)}" alt="${esc(p.nom)}" ${k ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" width="1500" height="2000">
              </button>`).join('')}
            ${p.making_of ? `
            <div class="mo-row fiche-mo" data-dir="${esc(slash(p.making_of))}" data-name="${esc(p.nom)}">
              <div class="mo-head"><h3>${esc(t(C.making_of.titre))}</h3><span class="count"></span></div>
              <div class="mo-strip"></div>
            </div>` : ''}
          </div>
          <div class="fiche-info">
            <a class="back" href="#/" data-back>← ${esc(ui('retour'))}</a>
            <p class="eyebrow">${esc(f ? `${f.num} — ${f.nom}` : '')}</p>
            <h1 class="fiche-title">${esc(p.nom)}</h1>
            <p class="fiche-sub lead">${esc(quote(t(p.sous_titre)))}</p>
            <p class="fiche-mat"><span class="eyebrow">${esc(ui('matieres'))}</span><span>${esc(t(p.matieres))}</span></p>
            <p class="fiche-text">${esc(t(p.texte))}</p>
            <p class="fiche-mention">${esc(t(C.contact.mention))}</p>
            <div class="fiche-actions">
              <a class="btn" href="#/" data-goto="contact">${esc(ui('nav_contact'))}</a>
            </div>
          </div>
        </div>
        <nav class="fiche-nav">
          <a class="pn prev" href="#/${esc(prev.slug)}"><span class="eyebrow">← ${esc(ui('precedente'))}</span><strong>${esc(prev.nom)}</strong></a>
          <a class="back mid" href="#/" data-back>${esc(ui('retour'))}</a>
          <a class="pn next" href="#/${esc(next.slug)}"><span class="eyebrow">${esc(ui('suivante'))} →</span><strong>${esc(next.nom)}</strong></a>
        </nav>
      </article>`;
    const mo = $('.fiche-mo', pieceView);
    if (mo) fillStrip(mo);
    pieceView._photos = p.photos;
    pieceView._name = p.nom;
    document.title = `${p.nom} — ${C.nom}`;
  }

  /* ---------- Navigation (#/slug) ---------- */
  function transition(fn) {
    if (!reduce && document.startViewTransition) {
      return document.startViewTransition(fn).finished.catch(() => {});
    }
    fn();
    return Promise.resolve();
  }

  const thumbOf = (slug) => slug && $(`.card a[data-slug="${CSS.escape(slug)}"] img`, home);

  function slugFromHash() {
    const m = location.hash.match(/^#\/([\w-]+)/);
    return m && C.pieces.some((p) => p.slug === m[1]) ? m[1] : null;
  }

  function route() {
    const slug = slugFromHash();
    if (slug) showPiece(slug); else showHome();
  }

  function showPiece(slug) {
    if (view === 'piece' && slug === current) return;
    const fromHome = view === 'home';
    view = 'piece';
    current = slug;
    if (fromHome) homeScroll = window.scrollY;
    const thumb = fromHome ? thumbOf(slug) : null;
    if (thumb) thumb.style.viewTransitionName = 'piece-hero';
    transition(() => {
      if (thumb) thumb.style.viewTransitionName = '';
      renderPiece(slug);
      home.hidden = true;
      pieceView.hidden = false;
      document.body.classList.add('on-piece');
      if (!document.startViewTransition || reduce) { pieceView.classList.remove('view-in'); void pieceView.offsetWidth; pieceView.classList.add('view-in'); }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    count();
  }

  function showHome() {
    if (view === 'home') { if (pendingGoto) scrollToId(pendingGoto, false); pendingGoto = null; return; }
    view = 'home';
    const prev = current;
    current = null;
    let thumb = null;
    transition(() => {
      pieceView.hidden = true;
      pieceView.innerHTML = '';
      home.hidden = false;
      document.body.classList.remove('on-piece');
      document.title = `${C.nom} — ${C.accueil.lieux.replace(/[^\p{L}\s/]/gu, '').trim()}`;
      if (pendingGoto) { scrollToId(pendingGoto, false); pendingGoto = null; }
      else window.scrollTo({ top: homeScroll, behavior: 'instant' });
      thumb = thumbOf(prev);
      if (thumb) thumb.style.viewTransitionName = 'piece-hero';
      if (!document.startViewTransition || reduce) { home.classList.remove('view-in'); void home.offsetWidth; home.classList.add('view-in'); }
    }).then(() => { if (thumb) thumb.style.viewTransitionName = ''; });
    if (prev) count();
  }

  function scrollToId(id, smooth = true) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.classList.contains('reveal')) el.classList.add('in');
    el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'instant', block: 'start' });
  }

  function navigate(href) {
    const depth = (history.state && history.state.depth) || 0;
    history.pushState({ depth: depth + 1 }, '', href);
    route();
  }

  function backHome(gotoId) {
    pendingGoto = gotoId || null;
    const depth = (history.state && history.state.depth) || 0;
    if (current !== null && depth > 0) { history.go(-depth); return; }
    if (current !== null) { history.pushState({ depth: 0 }, '', '#/'); route(); return; }
    if (gotoId) scrollToId(gotoId);
    pendingGoto = null;
  }

  function closeMenu() {
    header.classList.remove('menu-open');
    const b = $('.menu-btn', header);
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  /* ---------- Visionneuse plein écran ---------- */
  const lb = { el: $('#lightbox'), list: [], i: 0, name: '', last: null };
  lb.img = $('img', lb.el);
  lb.count = $('.lb-count', lb.el);
  lb.nameEl = $('.lb-name', lb.el);

  function openLB(list, i, name) {
    lb.list = list; lb.i = i; lb.name = name; lb.last = document.activeElement;
    lb.el.hidden = false;
    document.body.classList.add('lb-open');
    showLB();
    $('.lb-close', lb.el).setAttribute('aria-label', ui('fermer'));
    $('.lb-close', lb.el).focus();
  }
  function showLB() {
    const n = lb.list.length;
    lb.img.src = lb.list[lb.i];
    lb.img.alt = lb.name;
    lb.nameEl.textContent = lb.name;
    lb.count.textContent = n > 1 ? `${lb.i + 1} / ${n}` : '';
    lb.el.classList.toggle('single', n < 2);
    $$('.lb-prev, .lb-next', lb.el).forEach((b) => { b.style.visibility = n > 1 ? '' : 'hidden'; });
    if (n > 1) { new Image().src = lb.list[(lb.i + 1) % n]; }
  }
  function stepLB(d) {
    if (lb.list.length < 2) return;
    lb.i = (lb.i + d + lb.list.length) % lb.list.length;
    showLB();
  }
  function closeLB() {
    lb.el.hidden = true;
    document.body.classList.remove('lb-open');
    lb.img.removeAttribute('src');
    if (lb.last) lb.last.focus({ preventScroll: true });
  }
  lb.el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lb]');
    if (a) { const k = a.dataset.lb; if (k === 'close') closeLB(); else stepLB(k === 'next' ? 1 : -1); return; }
    if (e.target === lb.el || e.target.classList.contains('lb-figure')) closeLB();
  });
  let tx = null, ty = null;
  lb.el.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.el.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) stepLB(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLB();
    tx = ty = null;
  });

  /* ---------- Événements ---------- */
  document.addEventListener('click', (e) => {
    const lang_ = e.target.closest('#lang');
    if (lang_) { setLang(lang === 'fr' ? 'en' : 'fr'); return; }

    const menu = e.target.closest('.menu-btn');
    if (menu) {
      const open = header.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded', String(open));
      return;
    }

    const go = e.target.closest('[data-goto]');
    if (go) { e.preventDefault(); closeMenu(); backHome(go.dataset.goto); return; }

    const back = e.target.closest('[data-back]');
    if (back) { e.preventDefault(); backHome(null); return; }

    const mo = e.target.closest('.mo-item');
    if (mo) { const row = mo.closest('.mo-row'); openLB(row._photos, +mo.dataset.i, row.dataset.name); return; }

    const fp = e.target.closest('.fiche-photo');
    if (fp) { openLB(pieceView._photos, +fp.dataset.i, pieceView._name); return; }

    const link = e.target.closest('a[href^="#/"]');
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      closeMenu();
      navigate(link.getAttribute('href'));
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form') { e.preventDefault(); submitForm(e.target); }
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.el.hidden) {
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') stepLB(1);
      else if (e.key === 'ArrowLeft') stepLB(-1);
      return;
    }
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);

  const onScroll = () => header.classList.toggle('solid', window.scrollY > 40 || current !== null);
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Langue ---------- */
  function setLang(l) {
    saveForm();
    lang = l;
    try { sessionStorage.setItem('lang', l); } catch (e) { /* rien */ }
    document.documentElement.lang = l;
    const y = window.scrollY;
    renderAll();
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  function renderAll() {
    renderHeader();
    renderHome();
    renderFooter();
    if (current) renderPiece(current);
    else document.title = `${C.nom} — ${C.accueil.lieux.replace(/[^\p{L}\s/]/gu, '').trim()}`;
    firstRender = false;
    onScroll();
  }

  /* ---------- Statistiques (GoatCounter, sans cookies) ---------- */
  let statsReady = false;
  function stats() {
    const code = C.statistiques && C.statistiques.goatcounter_code;
    if (!code) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
    s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    s.onload = () => { statsReady = true; count(); };
    document.head.appendChild(s);
  }
  function count() {
    if (!statsReady || !window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({ path: current ? `/${current}` : '/', title: document.title });
  }

  /* ---------- Démarrage ---------- */
  fetch('contenu.json', { cache: 'no-cache' })
    .then((r) => r.json())
    .then((data) => {
      C = data;
      lang = pickLang();
      document.documentElement.lang = lang;
      renderAll();
      const slug = slugFromHash();
      if (slug) {
        renderPiece(slug);
        current = slug;
        view = 'piece';
        home.hidden = true;
        pieceView.hidden = false;
        document.body.classList.add('on-piece');
        onScroll();
      }
      stats();
    })
    .catch(() => {
      home.innerHTML = '<p class="noscript">Studio Lemovices — <a href="https://www.instagram.com/studiolemovices/">Instagram</a></p>';
    });
})();
