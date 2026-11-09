/* =====================================================================
   EXPRESS LUPITA · script.js
   JavaScript vanilla (sin librerías externas): la página se ve completa aunque
   falle cualquier recurso. Todo respeta prefers-reduced-motion.
   ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
   ÚNICA constante de WhatsApp: número en formato internacional, sin "+" ni espacios.
   Si queda vacía, el botón flotante, los CTA de WhatsApp y el envío del formulario
   se ocultan con elegancia.
   --------------------------------------------------------------------- */
const WHATSAPP_NUMERO = '524428183675';

(function () {
  const root = document.documentElement;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  root.classList.add('js');

  let revealOk = false;
  const seguro = setTimeout(function () { root.classList.add('reveal-all'); }, 7000);
  const safe = function (fn, nombre) {
    try { fn(); } catch (e) { if (window.console) console.warn('[init] ' + nombre, e); }
  };

  /* ================= WhatsApp ================= */
  const waNum = String(WHATSAPP_NUMERO || '').replace(/\D/g, '');
  const waUrl = function (texto) {
    return 'https://wa.me/' + waNum + (texto ? '?text=' + encodeURIComponent(texto) : '');
  };

  function initWhatsApp() {
    if (!waNum) {
      root.classList.add('no-wa');
      const nota = $('#formNota');
      if (nota) nota.textContent = 'El envío por WhatsApp estará disponible muy pronto.';
      return;
    }
    $$('[data-wa]').forEach(function (a) {
      const t = a.dataset.waText || a.dataset.waFijo || '';
      a.href = waUrl(t);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    // Tooltip del botón flotante: aparece una vez, unos segundos
    const fl = $('#waFlotante');
    if (fl && !reduce) {
      setTimeout(function () { fl.classList.add('is-tip'); }, 6500);
      setTimeout(function () { fl.classList.remove('is-tip'); }, 11500);
    }
  }

  /* ================= Cargador ================= */
  function initCargador() {
    const el = $('#cargador');
    let hecho = false;
    const fin = function () {
      if (hecho) return;
      hecho = true;
      root.classList.add('ready');
      if (el) el.classList.add('cargador--sale');
      document.dispatchEvent(new Event('listo'));
    };
    if (!el) { fin(); return; }
    const av = $('#cargadorAvance');
    const pct = $('#cargadorPct');
    const txt = $('#cargadorTexto');
    const frases = ['Iniciando diagnóstico', 'Revisando conexiones', 'Calibrando sensores', 'Todo en orden'];
    const C = 339.29;
    const dur = reduce ? 250 : 1250;
    let t0 = null;
    const paso = function (ts) {
      if (t0 === null) t0 = ts;
      const p = clamp((ts - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      if (av) av.style.strokeDashoffset = (C * (1 - e)).toFixed(2) + 'px';
      if (pct) pct.textContent = String(Math.round(e * 100));
      if (txt) txt.textContent = frases[Math.min(frases.length - 1, Math.floor(e * frases.length))];
      if (p < 1) requestAnimationFrame(paso); else setTimeout(fin, 120);
    };
    requestAnimationFrame(paso);
    // Respaldo por si el navegador pausa requestAnimationFrame
    setTimeout(fin, 1700);
  }

  /* ================= Cabecera y menú ================= */
  function initCabecera() {
    const burger = $('#burger');
    const nav = $('#nav');
    if (!burger || !nav) return;
    const cerrar = function () {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      nav.classList.remove('is-abierto');
      root.classList.remove('menu-abierto');
    };
    const abrir = function () {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Cerrar menú');
      nav.classList.add('is-abierto');
      root.classList.add('menu-abierto');
      const cab = $('#cabecera');
      if (cab) cab.classList.remove('is-oculta');
    };
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') cerrar(); else abrir();
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', cerrar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    window.matchMedia('(min-width: 1040px)').addEventListener('change', function (e) { if (e.matches) cerrar(); });

    // Sección activa en el menú
    const enlaces = $$('.nav__lista a');
    if ('IntersectionObserver' in window && enlaces.length) {
      const mapa = {};
      enlaces.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });
      const io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting && mapa[en.target.id]) {
            enlaces.forEach(function (a) { a.classList.remove('is-activo'); });
            mapa[en.target.id].classList.add('is-activo');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(mapa).forEach(function (id) { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ================= Revelado al hacer scroll ================= */
  function dividirPalabras(el) {
    const texto = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', texto);
    const frag = document.createDocumentFragment();
    const palabras = texto.split(' ');
    palabras.forEach(function (w, i) {
      const o = document.createElement('span');
      o.className = 'pal';
      o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span');
      s.textContent = w;
      s.style.setProperty('--i', String(i));
      o.appendChild(s);
      frag.appendChild(o);
      if (i < palabras.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  function initReveal() {
    const partidos = $$('[data-split]');
    partidos.forEach(dividirPalabras);
    const els = $$('[data-reveal], [data-split]');
    // Escalonado entre hermanos
    const grupos = new Map();
    $$('[data-reveal]').forEach(function (el) {
      const p = el.parentElement;
      if (!grupos.has(p)) grupos.set(p, 0);
      const n = grupos.get(p);
      el.style.setProperty('--d', String(Math.min(n, 6)));
      grupos.set(p, n + 1);
    });
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (e) { e.classList.add('visto'); });
      revealOk = true;
      return;
    }
    const io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visto');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
    revealOk = true;
  }

  /* ================= Contadores ================= */
  function initContadores() {
    $$('[data-count]').forEach(function (el) {
      const fin = Number(el.dataset.count);
      const pre = el.dataset.prefix || '';
      if (!isFinite(fin)) return;
      el.textContent = pre + (reduce ? fin : 0);
      let corrido = false;
      const correr = function () {
        if (corrido) return;
        corrido = true;
        if (reduce) { el.textContent = pre + fin; return; }
        const t0 = performance.now();
        const d = 1700;
        (function f(t) {
          const p = clamp((t - t0) / d);
          const e = 1 - Math.pow(1 - p, 4);
          el.textContent = pre + Math.round(fin * e);
          if (p < 1) requestAnimationFrame(f);
        })(t0);
      };
      const lanzar = function () {
        if (root.classList.contains('ready')) correr();
        else document.addEventListener('listo', function () { setTimeout(correr, 500); }, { once: true });
      };
      if (!('IntersectionObserver' in window)) { el.textContent = pre + fin; return; }
      const io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); lanzar(); }
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ================= Hero ================= */
  function initHero() {
    const hero = $('.hero');
    if (!hero) return;

    // Palabra que rota
    const palabras = $$('.rot__v');
    if (palabras.length > 1 && !reduce) {
      let i = 0;
      const rotar = function () {
        const actual = palabras[i];
        i = (i + 1) % palabras.length;
        const sig = palabras[i];
        actual.classList.remove('is-on');
        actual.classList.add('is-sale');
        sig.classList.add('is-on');
        setTimeout(function () { actual.classList.remove('is-sale'); }, 1000);
      };
      document.addEventListener('listo', function () { setTimeout(function () { setInterval(rotar, 2600); }, 2200); }, { once: true });
    }

    // Chips que alternan "falla" y "reparado"
    const chips = $$('.chip');
    if (chips.length && !reduce) {
      document.addEventListener('listo', function () {
        setTimeout(function () {
          setInterval(function () {
            chips.forEach(function (c, i) {
              setTimeout(function () { c.dataset.estado = c.dataset.estado === '0' ? '1' : '0'; }, i * 650);
            });
          }, 3400);
        }, 1800);
      }, { once: true });
    }

    // Inclinación 3D con el puntero
    const escena = $('#nucleoEscena');
    if (escena && fino && !reduce) {
      let nx = 0, ny = 0, pend = false;
      const aplicar = function () {
        pend = false;
        escena.style.setProperty('--ry', (nx * 11).toFixed(2) + 'deg');
        escena.style.setProperty('--rx', (-ny * 9).toFixed(2) + 'deg');
        hero.style.setProperty('--px', nx.toFixed(3));
        hero.style.setProperty('--py', ny.toFixed(3));
      };
      hero.addEventListener('pointermove', function (e) {
        nx = (e.clientX / window.innerWidth - 0.5) * 2;
        ny = (e.clientY / window.innerHeight - 0.5) * 2;
        if (!pend) { pend = true; requestAnimationFrame(aplicar); }
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { nx = 0; ny = 0; requestAnimationFrame(aplicar); });
    }

    initCanvas(hero);
  }

  /* Partículas: red de puntos + burbujas que suben (siempre en movimiento) */
  function initCanvas(hero) {
    const cv = $('#heroCanvas');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, raf = 0, corriendo = false, visible = true;
    const P = [];
    const raton = { x: -9999, y: -9999 };

    const crear = function (inicio) {
      const burbuja = Math.random() < 0.32;
      const r = burbuja ? 5 + Math.random() * 14 : 1 + Math.random() * 1.9;
      return {
        x: Math.random() * w,
        y: inicio ? Math.random() * h : h + r + 10,
        r: r, bub: burbuja,
        vx: (Math.random() - 0.5) * 0.28,
        vy: burbuja ? -(0.22 + Math.random() * 0.5) : (Math.random() - 0.5) * 0.32,
        ph: Math.random() * 6.28
      };
    };
    const medir = function () {
      const b = cv.getBoundingClientRect();
      w = b.width; h = b.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp(w * h / 21000, 26, 84));
      while (P.length < n) P.push(crear(true));
      P.length = Math.min(P.length, n);
    };
    const dibujar = function (mover) {
      ctx.clearRect(0, 0, w, h);
      const enlace = w < 700 ? 96 : 132;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (mover) {
          p.ph += 0.012;
          p.x += p.vx + (p.bub ? Math.sin(p.ph) * 0.35 : 0);
          p.y += p.vy;
          const dx = p.x - raton.x, dy = p.y - raton.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const f = (1 - d2 / 14000) * 1.6, d = Math.sqrt(d2) || 1;
            p.x += dx / d * f; p.y += dy / d * f;
          }
          if (p.bub) {
            if (p.y < -p.r - 10 || p.x < -30 || p.x > w + 30) P[i] = crear(false);
          } else {
            if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
          }
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < P.length; i++) {
        const a = P[i];
        if (a.bub) continue;
        for (let j = i + 1; j < P.length; j++) {
          const b = P[j];
          if (b.bub) continue;
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < enlace * enlace) {
            const al = (1 - Math.sqrt(d2) / enlace) * 0.3;
            ctx.strokeStyle = 'rgba(22,89,184,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (p.bub) {
          ctx.strokeStyle = 'rgba(17,191,232,.55)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.6)';
          ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, Math.max(1, p.r * 0.2), 0, 6.2832); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(22,89,184,.55)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
      }
    };
    const bucle = function () {
      if (!corriendo) return;
      dibujar(true);
      raf = requestAnimationFrame(bucle);
    };
    const iniciar = function () { if (corriendo || reduce) return; corriendo = true; raf = requestAnimationFrame(bucle); };
    const parar = function () { corriendo = false; cancelAnimationFrame(raf); };

    medir();
    dibujar(false);
    if (reduce) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !document.hidden) iniciar(); else parar();
      }).observe(hero);
    } else { iniciar(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else if (visible) iniciar();
    });
    let t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(medir, 200); });
    hero.addEventListener('pointermove', function (e) {
      const b = cv.getBoundingClientRect();
      raton.x = e.clientX - b.left; raton.y = e.clientY - b.top;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { raton.x = -9999; raton.y = -9999; });
  }

  /* ================= Catálogo de servicios ================= */
  function initCatalogo() {
    const cat = $('#catalogo');
    if (!cat) return;
    const lista = $('.catalogo__tabs', cat);
    const tabs = $$('[role="tab"]', cat);
    const paneles = $$('[role="tabpanel"]', cat);
    const modos = $$('.modo', cat);
    let modo = 'reparacion';
    let actual = 0;

    const actualizarCtas = function () {
      paneles.forEach(function (p) {
        const a = $('[data-wa-dyn]', p);
        const span = $('[data-cta-txt]', p);
        if (!a || !span) return;
        const eq = p.dataset.equipo || 'mi equipo';
        const rep = modo === 'reparacion';
        span.textContent = rep ? 'Quiero que reparen ' + eq : 'Quiero dar mantenimiento a ' + eq;
        if (waNum) {
          a.href = waUrl(rep
            ? 'Hola, necesito reparar ' + eq + '. ¿Pueden revisarlo?'
            : 'Hola, quiero agendar el mantenimiento de ' + eq + '.');
        }
      });
    };
    const activar = function (i, enfocar) {
      actual = i;
      tabs.forEach(function (t, k) {
        const on = k === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      paneles.forEach(function (p, k) {
        p.hidden = k !== i;
        p.classList.toggle('is-on', k === i);
      });
      if (enfocar) tabs[i].focus();
      if (lista && lista.scrollWidth > lista.clientWidth + 4) {
        const t = tabs[i];
        lista.scrollTo({ left: t.offsetLeft - (lista.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activar(i, false); });
      t.addEventListener('keydown', function (e) {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (actual + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (actual - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); activar(n, true); }
      });
    });
    modos.forEach(function (b) {
      b.addEventListener('click', function () {
        modo = b.dataset.modo;
        cat.dataset.modo = modo;
        modos.forEach(function (m) {
          const on = m === b;
          m.classList.toggle('is-on', on);
          m.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        actualizarCtas();
      });
    });
    actualizarCtas();
  }

  /* ================= Efectos con el puntero ================= */
  function initPunteros() {
    if (!fino || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      const max = 5;
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(1100px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max).toFixed(2) + 'deg)';
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    $$('[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.16).toFixed(1) + 'px,' + (y * 0.26).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  function initCursor() {
    if (!fino || reduce) return;
    const c = $('#cursor');
    if (!c) return;
    let x = 0, y = 0, tx = 0, ty = 0, visible = false, corriendo = false;
    const bucle = function () {
      x = lerp(x, tx, 0.22); y = lerp(y, ty, 0.22);
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) requestAnimationFrame(bucle); else corriendo = false;
    };
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!visible) { visible = true; x = tx; y = ty; c.classList.add('is-on'); }
      if (!corriendo) { corriendo = true; requestAnimationFrame(bucle); }
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      c.classList.toggle('is-link', Boolean(e.target.closest && e.target.closest('a, button, [role="tab"], input, select, textarea, label')));
    });
    document.documentElement.addEventListener('pointerleave', function () { c.classList.remove('is-on'); visible = false; });
  }

  /* ================= Scroll: progreso, cabecera, texto que se llena, imagen que se expande, pila ================= */
  function initScroll() {
    const barra = $('#progresoBarra');
    const cab = $('#cabecera');
    const hero = $('.hero');
    let ultimoY = window.scrollY || 0;
    let tick = false;

    // Texto que se llena palabra por palabra (se queda lleno al pasar)
    const manif = $('[data-llenar]');
    let palabras = [];
    let llenas = 0;
    if (manif) {
      const texto = manif.textContent.trim().replace(/\s+/g, ' ');
      const azules = ['técnico', 'revise', 'fondo', 'falla', 'funcionando.'];
      manif.textContent = '';
      const frag = document.createDocumentFragment();
      texto.split(' ').forEach(function (w, i, arr) {
        const s = document.createElement('span');
        s.className = 'w' + (azules.indexOf(w.replace(/[,]/g, '').toLowerCase()) > -1 ? ' az' : '');
        s.textContent = w;
        frag.appendChild(s);
        if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      manif.appendChild(frag);
      palabras = $$('.w', manif);
      if (reduce) palabras.forEach(function (p) { p.classList.add('on'); });
    }
    const llenar = function () {
      if (!palabras.length || reduce) return;
      const r = manif.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.84 - r.top) / (r.height + vh * 0.26));
      const n = Math.min(palabras.length, Math.round(p * palabras.length * 1.03));
      if (n > llenas) {
        for (let i = llenas; i < n; i++) palabras[i].classList.add('on');
        llenas = n;
      }
    };

    // Imagen que se expande a pantalla completa al llegar
    const marco = $('#expandeMarco');
    const expandir = function () {
      if (!marco) return;
      if (reduce) { marco.style.setProperty('--p', '1'); return; }
      const r = marco.getBoundingClientRect();
      const vh = window.innerHeight;
      const centro = r.top + r.height / 2;
      const d = Math.abs(centro - vh / 2) / (vh * 0.62 + r.height * 0.2);
      const p = clamp((1 - d) * 1.7);
      marco.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3));
    };

    // Tarjetas del método (se apilan y se encogen)
    const pasos = $$('.paso');
    let topes = [];
    const medirTopes = function () {
      topes = pasos.map(function (p) { return parseFloat(getComputedStyle(p).top) || 0; });
    };
    const apilar = function () {
      if (reduce || pasos.length < 2) return;
      for (let i = 0; i < pasos.length - 1; i++) {
        const tarjeta = pasos[i].firstElementChild;
        const rc = pasos[i].getBoundingClientRect();
        const rn = pasos[i + 1].getBoundingClientRect();
        const solape = clamp(1 - (rn.top - topes[i]) / Math.max(1, rc.height));
        tarjeta.style.setProperty('--esc', (1 - solape * 0.07).toFixed(4));
      }
    };

    const actualizar = function () {
      tick = false;
      const y = window.scrollY || window.pageYOffset || 0;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      if (barra) barra.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
      if (cab) {
        cab.classList.toggle('is-pegada', y > 24);
        if (!root.classList.contains('menu-abierto')) {
          if (y > ultimoY + 6 && y > 260) cab.classList.add('is-oculta');
          else if (y < ultimoY - 6 || y < 260) cab.classList.remove('is-oculta');
        }
      }
      ultimoY = y;
      if (hero && !reduce) hero.style.setProperty('--hp', clamp(y / (vh * 0.9)).toFixed(3));
      llenar();
      expandir();
      apilar();
    };
    const pedir = function () {
      if (!tick) { tick = true; requestAnimationFrame(actualizar); }
    };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', function () { medirTopes(); pedir(); });
    medirTopes();
    actualizar();
  }

  /* ================= Visor de fotos ================= */
  function initVisor() {
    const dlg = $('#visor');
    const img = $('#visorImg');
    const cap = $('#visorCap');
    const botones = $$('#galeriaGrupo .foto');
    if (!dlg || !img || !cap || !botones.length) return;
    const datos = botones.map(function (b) {
      const im = $('img', b);
      const c = $('.foto__cap', b);
      return {
        src: im.getAttribute('src'),
        alt: im.getAttribute('alt') || '',
        cap: c ? c.textContent.replace(/^\s*\d+\s*/, '').trim() : ''
      };
    });
    let idx = 0;
    let origen = null;
    const mostrar = function (i) {
      idx = (i + datos.length) % datos.length;
      const d = datos[idx];
      img.src = d.src;
      img.alt = d.alt;
      cap.textContent = d.cap + '  ·  ' + (idx + 1) + ' / ' + datos.length;
    };
    const abrir = function (i, btn) {
      origen = btn;
      mostrar(i);
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      root.style.overflow = 'hidden';
    };
    const cerrar = function () {
      if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
      root.style.overflow = '';
      if (origen) origen.focus();
    };
    botones.forEach(function (b, i) { b.addEventListener('click', function () { abrir(i, b); }); });
    $('#visorCerrar').addEventListener('click', cerrar);
    $('#visorPrev').addEventListener('click', function () { mostrar(idx - 1); });
    $('#visorNext').addEventListener('click', function () { mostrar(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) cerrar(); });
    dlg.addEventListener('cancel', function () { root.style.overflow = ''; });
    dlg.addEventListener('close', function () { root.style.overflow = ''; });
    document.addEventListener('keydown', function (e) {
      if (!dlg.open && !dlg.hasAttribute('open')) return;
      if (e.key === 'ArrowRight') mostrar(idx + 1);
      else if (e.key === 'ArrowLeft') mostrar(idx - 1);
    });
    let x0 = null;
    dlg.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    dlg.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 60) mostrar(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ================= Preguntas frecuentes ================= */
  function initFaq() {
    const btns = $$('.acordeon__btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const abierto = btn.getAttribute('aria-expanded') === 'true';
        btns.forEach(function (b) {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const c = document.getElementById(b.getAttribute('aria-controls'));
            if (c) c.classList.remove('is-open');
          }
        });
        btn.setAttribute('aria-expanded', abierto ? 'false' : 'true');
        const cuerpo = document.getElementById(btn.getAttribute('aria-controls'));
        if (cuerpo) cuerpo.classList.toggle('is-open', !abierto);
      });
    });
  }

  /* ================= Formulario → WhatsApp ================= */
  function initForm() {
    const f = $('#formulario');
    if (!f) return;
    const nota = $('#formNota');
    const error = function (campo, msg) {
      const caja = campo.closest('.campo');
      if (!caja) return;
      caja.classList.toggle('is-error', Boolean(msg));
      const s = $('.campo__error', caja);
      if (s) s.textContent = msg || '';
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!waNum) return;
      const el = f.elements;
      const nombre = el.nombre.value.trim();
      const equipo = el.equipo.value;
      const servicio = el.servicio.value;
      const zona = el.zona.value.trim();
      const mensaje = el.mensaje.value.trim();
      let ok = true;
      error(el.nombre, nombre ? '' : 'Cuéntanos cómo te llamas.');
      error(el.equipo, equipo ? '' : 'Elige el equipo que necesita ayuda.');
      error(el.mensaje, mensaje ? '' : 'Cuéntanos brevemente qué le pasa.');
      if (!nombre || !equipo || !mensaje) ok = false;
      if (!ok) {
        const primero = $('.is-error input, .is-error select, .is-error textarea', f);
        if (primero) primero.focus();
        return;
      }
      const texto = [
        'Hola, soy ' + nombre + '.',
        'Necesito servicio para: ' + equipo + ' (' + servicio.toLowerCase() + ').',
        zona ? 'Mi zona en Querétaro: ' + zona + '.' : '',
        'Lo que pasa: ' + mensaje,
        'Los contacto desde su página web y quiero agendar mi revisión.'
      ].filter(Boolean).join('\n');
      const url = waUrl(texto);
      if (nota) nota.textContent = 'Abriendo WhatsApp con tu mensaje listo…';
      const w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
    f.addEventListener('input', function (e) {
      if (e.target && e.target.closest('.campo.is-error')) error(e.target, '');
    });
  }

  /* ================= Varios ================= */
  function initVarios() {
    const anio = $('#anio');
    if (anio) anio.textContent = String(new Date().getFullYear());
    document.addEventListener('visibilitychange', function () { root.classList.toggle('pausa', document.hidden); });
  }

  /* ================= Arranque ================= */
  safe(initWhatsApp, 'whatsapp');
  safe(initCatalogo, 'catalogo');
  safe(initCabecera, 'cabecera');
  safe(initReveal, 'reveal');
  safe(initContadores, 'contadores');
  safe(initHero, 'hero');
  safe(initPunteros, 'punteros');
  safe(initCursor, 'cursor');
  safe(initScroll, 'scroll');
  safe(initVisor, 'visor');
  safe(initFaq, 'faq');
  safe(initForm, 'form');
  safe(initVarios, 'varios');
  safe(initCargador, 'cargador');
  // Último respaldo: nada se queda oculto si algo del arranque falló
  setTimeout(function () { root.classList.add('ready'); }, 2600);
  if (revealOk) clearTimeout(seguro); else root.classList.add('reveal-all');
})();
