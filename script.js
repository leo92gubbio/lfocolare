(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const views = [...document.querySelectorAll('.app-view')];
  const menuPanels = [...document.querySelectorAll('.menu-panel')];
  const mobileQuery = window.matchMedia('(max-width: 600px)');

  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const setMenuPanel = (panel, open) => {
    const button = panel?.querySelector('[data-menu-accordion]');
    if (!panel || !button) return;
    panel.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    const label = button.querySelector('.menu-accordion-label');
    if (label) label.textContent = open ? 'Chiudi' : 'Apri';
  };

  const openMenuPanel = panel => {
    menuPanels.forEach(item => setMenuPanel(item, item === panel));
  };

  menuPanels.forEach(panel => {
    panel.querySelector('[data-menu-accordion]')?.addEventListener('click', () => {
      if (!mobileQuery.matches) return;
      const shouldOpen = !panel.classList.contains('is-open');
      menuPanels.forEach(item => setMenuPanel(item, false));
      setMenuPanel(panel, shouldOpen);
    });
  });

  const targetFromHash = hash => {
    const id = (hash || '#home').slice(1) || 'home';
    if (id === 'contenuto') return document.getElementById('home');
    return document.getElementById(id) || document.getElementById('home');
  };

  const viewFromTarget = target => target?.closest('.app-view') || views[0];

  const updateActiveNavigation = activeView => {
    document.querySelectorAll('.site-nav a[href^="#"], .mobile-section-nav a[href^="#"]').forEach(link => {
      const linkView = viewFromTarget(targetFromHash(link.getAttribute('href')));
      const active = linkView === activeView;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const revealView = view => {
    requestAnimationFrame(() => {
      view.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    });
  };

  const renderRoute = (hash = window.location.hash, options = {}) => {
    const target = targetFromHash(hash);
    const activeView = viewFromTarget(target);
    const viewName = activeView?.dataset.view || 'home';

    views.forEach(view => {
      const active = view === activeView;
      view.hidden = !active;
      view.classList.toggle('is-active', active);
      view.setAttribute('aria-hidden', String(!active));
    });

    document.body.dataset.activeView = viewName;
    header?.classList.toggle('section-mode', viewName !== 'home');
    updateActiveNavigation(activeView);
    revealView(activeView);

    const menuPanel = target?.classList.contains('menu-panel') ? target : target?.closest('.menu-panel');
    if (mobileQuery.matches) {
      if (menuPanel) openMenuPanel(menuPanel);
      else if (viewName !== 'menu') menuPanels.forEach(panel => setMenuPanel(panel, false));
    }

    const canonicalTarget = target === activeView.querySelector(':scope > section:first-child');
    const shouldScrollToTarget = menuPanel || target.id === 'orari';
    const instant = options.instant === true;
    const behavior = instant ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
      if (shouldScrollToTarget) {
        target.scrollIntoView({ behavior, block: 'start' });
      } else if (canonicalTarget || target.id === 'home' || target.id === 'contenuto') {
        window.scrollTo({ top: 0, behavior });
      } else {
        window.scrollTo({ top: 0, behavior });
      }
    });
  };

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      event.preventDefault();
      if (window.location.hash === hash) renderRoute(hash);
      else window.location.hash = hash;
    });
  });

  window.addEventListener('hashchange', () => renderRoute(window.location.hash));
  mobileQuery.addEventListener?.('change', () => renderRoute(window.location.hash, { instant: true }));

  if (!window.location.hash) history.replaceState(null, '', '#home');
  renderRoute(window.location.hash, { instant: true });
})();
