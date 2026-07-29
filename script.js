(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const progress = document.querySelector('.scroll-progress span');

  const setHeaderState = () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const reveals = document.querySelectorAll('.reveal');
  const routeStage = document.querySelector('.route-stage');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -40px' });
    reveals.forEach((el) => observer.observe(el));

    if (routeStage) {
      const routeObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          routeStage.classList.add('is-visible');
          routeObserver.disconnect();
        }
      }, { threshold: 0.3 });
      routeObserver.observe(routeStage);
    }
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
    routeStage?.classList.add('is-visible');
  }

  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (window.instgrm?.Embeds) window.instgrm.Embeds.process();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      activateTab(tabs[next].dataset.tab);
    });
  });

  const countdown = document.querySelector('[data-countdown]');
  const electionDate = new Date('2026-08-19T08:00:00-05:00');
  const pad = (value) => String(Math.max(0, value)).padStart(2, '0');
  const updateCountdown = () => {
    if (!countdown) return;
    const diff = electionDate.getTime() - Date.now();
    if (diff <= 0) {
      countdown.innerHTML = '<strong style="font-family:Montserrat,sans-serif">HOY DEFENDEMOS LA UNACHI</strong>';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    countdown.querySelector('[data-days]').textContent = pad(days);
    countdown.querySelector('[data-hours]').textContent = pad(hours);
    countdown.querySelector('[data-minutes]').textContent = pad(minutes);
  };
  updateCountdown();
  window.setInterval(updateCountdown, 30000);

  const tilt = document.querySelector('[data-tilt]');
  if (tilt && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    tilt.addEventListener('pointermove', (event) => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    });
    tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }

  const glow = document.querySelector('.cursor-glow');
  if (glow && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const canvas = document.getElementById('ambient-canvas');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let frame = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(48, Math.floor(window.innerWidth / 28));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + .4,
        vx: (Math.random() - .5) * .12,
        vy: Math.random() * -.16 - .03,
        a: Math.random() * .35 + .08
      }));
    };
    const animate = () => {
      frame = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) p.y = window.innerHeight + 5;
        if (p.x < -5) p.x = window.innerWidth + 5;
        if (p.x > window.innerWidth + 5) p.x = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,124,255,${p.a})`;
        ctx.fill();
      }
    };
    resize();
    animate();
    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else animate();
    });
  }
})();
