/* =========================================================
   TRAINOVA — Página de ventas (IIFE, sin módulos)
   ========================================================= */
(function () {
  "use strict";
  window.__kofBoot = true;

  const B = window.__BRAND__ || {};
  const D = window.__DEMO__ || null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const root = document.documentElement;

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "] falló:", e); } }

  /* ---------- intro arcade ---------- */
  function initSplash() {
    const s = $("#splash");
    const go = () => {
      root.classList.add("is-live");
      if (!s) return;
      s.classList.add("is-done");
      setTimeout(() => { s.style.display = "none"; }, 500); // no depende de que la transición termine
    };
    if (!s) return go();
    // una sola vez por sesión: quien vuelve a la página no espera la intro
    let seen = false;
    try { seen = sessionStorage.getItem("kofIntro") === "1"; sessionStorage.setItem("kofIntro", "1"); } catch (e) {}
    setTimeout(go, seen ? 0 : 1500);
  }

  /* ---------- datos editables ---------- */
  function initBrand() {
    if (B.checkout && B.checkout !== "#precio") {
      $$("[data-checkout]").forEach(a => { a.href = B.checkout; a.target = "_blank"; a.rel = "noopener"; });
    }
    if (B.precio) $$("[data-price]").forEach(e => e.textContent = B.precio);
    if (B.precioAntes) $$("[data-price-old]").forEach(e => e.textContent = B.precioAntes);
    if (B.moneda) $$("[data-currency]").forEach(e => e.textContent = B.moneda);
    const fc = $("#footContact");
    if (fc) {
      const parts = [];
      if (B.soporteWhatsapp) parts.push(`Soporte por WhatsApp: <a href="https://wa.me/${esc(B.soporteWhatsapp)}">+${esc(B.soporteWhatsapp)}</a>`);
      if (B.soporteEmail) parts.push(`Correo: <a href="mailto:${esc(B.soporteEmail)}">${esc(B.soporteEmail)}</a>`);
      fc.innerHTML = parts.join(" · ");
    }
  }

  /* ---------- cuenta regresiva de la oferta ---------- */
  // Por visitante: cada persona tiene sus propias horas desde su primera visita.
  // Si se configura ofertaFin, se usa esa fecha fija para todos.
  function offerEnd() {
    const fixed = Date.parse(B.ofertaFin || "");
    if (!isNaN(fixed)) return {end: fixed, fixed: true};
    const ms = (+B.ofertaHoras || 48) * 3600000, KEY = "trainovaOfertaInicio";
    let start = NaN;
    try { start = +localStorage.getItem(KEY); } catch (e) {}
    if (!start || Date.now() - start >= ms || start > Date.now()) {
      start = Date.now(); // primera visita, o su oferta ya terminó: nuevo ciclo
      try { localStorage.setItem(KEY, String(start)); } catch (e) {}
    }
    return {end: start + ms, fixed: false};
  }

  function initCountdown() {
    const boxes = $$("[data-countdown]");
    if (!boxes.length) return;
    let {end, fixed} = offerEnd();
    const pad = n => String(n).padStart(2, "0");
    let timer;
    const tick = () => {
      const left = end - Date.now();
      if (left <= 0 && !fixed) { end = offerEnd().end; return tick(); } // por visitante: nuevo ciclo
      if (left <= 0) {
        clearInterval(timer);
        root.classList.add("is-expired");
        // oferta terminada: se muestra el precio normal
        if (B.precioAntes) $$("[data-price]").forEach(e => e.textContent = B.precioAntes);
        $$(".ob-btn").forEach(b => b.textContent = "Quiero acceder");
        return;
      }
      const h = Math.floor(left / 3600000), m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
      boxes.forEach(bx => {
        $("[data-cd=h]", bx).textContent = pad(h);
        $("[data-cd=m]", bx).textContent = pad(m);
        $("[data-cd=s]", bx).textContent = pad(s);
      });
    };
    tick(); timer = setInterval(tick, 1000);
  }

  /* ---------- nav y barra de oferta ---------- */
  function initNav() {
    const nav = $("#nav"), cta = $("#offerBar"), price = $(".price-card");
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      nav && nav.classList.toggle("is-scrolled", y > 20);
      if (cta && price) {
        const r = price.getBoundingClientRect();
        const inPrice = r.top < innerHeight && r.bottom > 0;
        cta.classList.toggle("is-on", y > innerHeight * 0.6 && !inPrice);
      }
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
    update();
  }

  /* ---------- líneas de velocidad del hero ---------- */
  function initHeroLines() {
    if (reduced) return;
    const c = $("#heroLines"); if (!c) return;
    const ctx = c.getContext("2d");
    const colors = ["255,204,26", "255,43,78", "47,107,255"];
    let w, h, lines = [], visible = true;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 700 ? 14 : 30;
      lines = Array.from({length: n}, () => spawn(true));
    };
    const spawn = (anywhere) => ({
      x: anywhere ? Math.random() * w : w + Math.random() * 200,
      y: Math.random() * h, len: 80 + Math.random() * 260, sp: 3 + Math.random() * 9,
      a: .08 + Math.random() * .3, col: colors[(Math.random() * 3) | 0], th: Math.random() < .2 ? 2 : 1
    });
    const tick = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (const l of lines) {
          l.x -= l.sp; l.y += l.sp * 0.42;
          if (l.x + l.len < 0 || l.y > h + 50) Object.assign(l, spawn(false), {y: Math.random() * h - 100});
          const g = ctx.createLinearGradient(l.x, l.y, l.x + l.len, l.y - l.len * .42);
          g.addColorStop(0, `rgba(${l.col},${l.a})`); g.addColorStop(1, `rgba(${l.col},0)`);
          ctx.strokeStyle = g; ctx.lineWidth = l.th;
          ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.len, l.y - l.len * .42); ctx.stroke();
        }
      }
      requestAnimationFrame(tick);
    };
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(c);
    addEventListener("resize", resize);
    resize(); tick();
  }

  /* ---------- inclinación 3D al mover el mouse ---------- */
  function initTilt() {
    if (!canHover) return;
    $$(".tilt").forEach(el => {
      const max = el.classList.contains("phone") ? 12 : 6;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(1200px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- series que se marcan solas en el celular ---------- */
  function initSets() {
    const sets = $$("#psSets i"); if (!sets.length) return;
    let i = 0;
    setInterval(() => {
      if (i >= sets.length) { sets.forEach(s => s.classList.remove("ok")); i = 0; return; }
      sets[i++].classList.add("ok");
    }, 1100);
  }

  /* ---------- contadores ---------- */
  function initCount() {
    const els = $$("[data-count]"); if (!els.length) return;
    const run = el => {
      const to = +el.dataset.count, t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), {threshold: 0.05});
    els.forEach(el => io.observe(el));
  }

  /* ---------- aparición al hacer scroll ---------- */
  function initReveals() {
    const els = $$(".reveal"); if (!els.length) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), {threshold: 0.05, rootMargin: "0px 0px -6% 0px"});
    els.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.06 + "s"; io.observe(el); });
    // red de seguridad: nada queda oculto
    setTimeout(() => els.forEach(el => el.classList.add("is-in")), 6000);
  }

  /* ---------- foco de luz en tarjetas ---------- */
  function initSpot() {
    if (!canHover) return;
    $$(".spot").forEach(el => el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }));
  }

  /* ---------- botones magnéticos ---------- */
  function initMagnetic() {
    if (!canHover) return;
    $$(".magnetic").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${x * .15}px, ${y * .25}px) skewX(-8deg)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- demo interactiva ---------- */
  function initDemo() {
    const body = $("#demoBody"), roster = $("#demoRoster");
    if (!D || !body || !roster) return;
    const G = Object.fromEntries(D.grupos.map(g => [g.id, g]));
    const st = {lvl: "basico", grp: "pecho", day: "A", sel: 0};
    const routine = () => D.rutinas[`${st.lvl}|${st.grp}|${st.day}`];

    function renderRoster() {
      roster.innerHTML = D.grupos.map(g => {
        const first = D.rutinas[`${st.lvl}|${g.id}|A`].items[0].id;
        return `<button class="fighter ${g.id === st.grp ? "on" : ""}" data-g="${g.id}" style="--c:${g.c}" aria-pressed="${g.id === st.grp}">
          <span class="pt"><img src="assets/img/${first}.webp" alt="" loading="lazy" width="320" height="320"></span>
          <span class="fn">${esc(g.n)}</span></button>`;
      }).join("");
    }
    function renderBody() {
      const r = routine(), g = G[st.grp], lvl = D.niveles.find(n => n.id === st.lvl).n;
      const it = r.items[st.sel], ex = D.ex[it.id];
      body.style.setProperty("--c", g.c);
      body.innerHTML = `
        <div class="d-sheet" style="--c:${g.c}">
          <div class="d-banner"><small>NIVEL ${esc(lvl).toUpperCase()}</small>
            <h3>${esc(g.n).toUpperCase()} <span>${st.day}</span></h3><p>Día ${"ABC".indexOf(st.day) + 1} de 3 · ${esc(r.t)}</p></div>
          <ol class="d-list">${r.items.map((x, i) => `
            <li><button class="d-item ${i === st.sel ? "on" : ""}" data-i="${i}">
              <span class="n">${String(i + 1).padStart(2, "0")}</span>
              <span><b>${esc(x.n)}</b><small>${esc(x.m)}</small></span>
              <span class="sr">${x.s} x ${esc(x.r)}</span></button></li>`).join("")}</ol>
        </div>
        <div class="d-detail">${ex ? `
          <div class="dg"><img src="assets/img/${it.id}.webp" alt="Animación: ${esc(ex.n)}" width="320" height="320"></div>
          <h4>${esc(ex.n)}</h4>
          <p class="dm"><b>Trabaja:</b> ${esc(ex.m)} · ${it.s} series · ${esc(it.r)} reps · ${esc(it.d)} descanso</p>
          <div class="dhow">
            <p><span class="k k-ini">INICIO</span>${esc(ex.ini)}</p>
            <p><span class="k k-fin">FINAL</span>${esc(ex.fin)}</p>
            <p><span class="k k-inh">INHALA</span>${esc(ex.inh)}</p>
            <p><span class="k k-exh">EXHALA</span>${esc(ex.exh)}</p>
            <p><span class="k k-ev">EVITA</span>${esc(ex.ev)}</p>
          </div>` : `
          <h4>${esc(it.n)}</h4>
          <p class="dm"><b>Trabaja:</b> ${esc(it.m)} · ${it.s} series · ${esc(it.r)} reps · ${esc(it.d)} descanso</p>
          <div class="d-lock"><span class="lk">🔒</span><div><b>Animación e instrucciones completas</b>Inicio, final, respiración y qué evitar de los 174 ejercicios vienen en el sistema.</div>
          <a class="btn btn-gold btn-sm" href="${esc(B.checkout && B.checkout !== "#precio" ? B.checkout : "#precio")}">Desbloquear todo</a></div>`}
        </div>`;
    }
    roster.addEventListener("click", e => {
      const b = e.target.closest("[data-g]"); if (!b) return;
      st.grp = b.dataset.g; st.sel = 0; renderRoster(); renderBody();
    });
    body.addEventListener("click", e => {
      const b = e.target.closest("[data-i]"); if (!b) return;
      st.sel = +b.dataset.i; renderBody();
    });
    const tabs = (wrap, key) => wrap && wrap.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", wrap).forEach(x => x.classList.toggle("on", x === b));
      st[key] = b.dataset[key]; st.sel = 0;
      if (key === "lvl") renderRoster();
      renderBody();
    });
    tabs($("#demoLevels"), "lvl");
    tabs($("#demoDays"), "day");
    renderRoster(); renderBody();
  }

  /* ---------- pasos con celular fijo ---------- */
  function initSteps() {
    const steps = $$(".step"), screens = $$("#howPhone .scr"), dots = $$(".how-dots i");
    if (!steps.length) return;
    const show = n => {
      steps.forEach(s => s.classList.toggle("on", s.dataset.step === n));
      screens.forEach(s => s.classList.toggle("on", s.dataset.scr === n));
      dots.forEach((d, i) => d.classList.toggle("on", String(i + 1) === n));
    };
    show("1");
    if (matchMedia("(max-width: 860px)").matches) {
      // en móvil el celular no es fijo: rota solo entre las 3 pantallas
      let n = 1;
      setInterval(() => { n = n % 3 + 1; show(String(n)); }, 3200);
      return;
    }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(e.target.dataset.step); }),
      {rootMargin: "-45% 0px -45% 0px", threshold: 0});
    steps.forEach(s => io.observe(s));
  }

  /* ---------- parallax de las etiquetas del hero (GSAP) ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$(".chip[data-depth]").forEach(ch => {
      gsap.to(ch, {y: -120 * +ch.dataset.depth, ease: "none",
        scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: true}});
    });
    gsap.to(".hero-copy", {y: 60, opacity: .4, ease: "none",
      scrollTrigger: {trigger: ".hero", start: "top top", end: "bottom top", scrub: true}});
  }

  function boot() {
    safe(initBrand, "brand");
    safe(initSplash, "splash");
    safe(initCountdown, "countdown");
    safe(initNav, "nav");
    safe(initHeroLines, "heroLines");
    safe(initTilt, "tilt");
    safe(initSets, "sets");
    safe(initCount, "count");
    safe(initReveals, "reveals");
    safe(initSpot, "spot");
    safe(initMagnetic, "magnetic");
    safe(initDemo, "demo");
    safe(initSteps, "steps");
    safe(initParallax, "parallax");
    root.classList.add("is-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
