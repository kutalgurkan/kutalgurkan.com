/* ── Language System ── */
(function () {
  var supportedLangs = ['tr', 'en', 'de', 'es'];
  var langBtns = document.querySelectorAll('.lang-selector__btn');

  function detectLanguage() {
    // 1. Check localStorage
    var saved = localStorage.getItem('preferred-lang');
    if (saved && supportedLangs.indexOf(saved) !== -1) {
      return saved;
    }

    // 2. Check browser language
    var browserLang = (navigator.language || navigator.userLanguage || '').substring(0, 2).toLowerCase();
    if (supportedLangs.indexOf(browserLang) !== -1) {
      return browserLang;
    }

    // 3. Default to English for non-supported languages
    return 'en';
  }

  function setLanguage(lang) {
    if (supportedLangs.indexOf(lang) === -1) return;

    // Update all translatable elements
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update active button
    langBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Save preference
    localStorage.setItem('preferred-lang', lang);
  }

  // Bind click events
  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(btn.getAttribute('data-lang'));
    });
  });

  // Initialize
  var initialLang = detectLanguage();
  setLanguage(initialLang);
})();
