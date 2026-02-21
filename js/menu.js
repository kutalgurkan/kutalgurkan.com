/* ── Hamburger Menu + Section Navigation ── */
(function () {
  var hamburger = document.querySelector('.hamburger');
  var navMenu = document.querySelector('.nav-menu');
  var navLinks = document.querySelectorAll('.nav-menu__link');
  var sections = document.querySelectorAll('main > section');

  if (!hamburger || !navMenu) return;

  // Initialize — show hero, hide others
  sections.forEach(function (section) {
    section.classList.remove('is-active');
  });
  var heroSection = document.getElementById('hero');
  if (heroSection) heroSection.classList.add('is-active');

  // Set initial active link
  navLinks.forEach(function (link) {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#hero') {
      link.classList.add('active');
    }
  });

  function openMenu() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    navMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    // Staggered reveal
    navLinks.forEach(function (link, i) {
      link.style.transitionDelay = (0.4 + i * 0.2) + 's';
      link.style.transitionDuration = '0.25s';
    });
  }

  function closeMenu() {
    navLinks.forEach(function (link) {
      link.style.transitionDelay = '0s';
      link.style.transitionDuration = '0.2s';
    });

    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    navMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function navigateTo(targetId) {
    // Hide all sections
    sections.forEach(function (section) {
      section.classList.remove('is-active');
      section.scrollTop = 0;
    });

    // Show target section
    var target = document.getElementById(targetId);
    if (target) {
      target.classList.add('is-active');
    }

    // Update active link
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + targetId) {
        link.classList.add('active');
      }
    });

  }

  hamburger.addEventListener('click', function () {
    if (navMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Menu link click — navigate to section
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = link.getAttribute('href').replace('#', '');
      closeMenu();
      setTimeout(function () {
        navigateTo(targetId);
      }, 400);
    });
  });

  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Hide header on scroll, show on stop/top
  var header = document.querySelector('.header');
  var scrollTimer = null;

  sections.forEach(function (section) {
    var lastScroll = 0;
    section.addEventListener('scroll', function () {
      var currentScroll = section.scrollTop;

      if (currentScroll > 50 && !navMenu.classList.contains('is-open')) {
        header.classList.add('is-hidden');
      }

      lastScroll = currentScroll;

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        header.classList.remove('is-hidden');
      }, 800);

      if (currentScroll <= 10) {
        header.classList.remove('is-hidden');
      }
    });
  });
})();
