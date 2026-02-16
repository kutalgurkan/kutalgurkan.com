/* ── Intro Animation — Plays on every page load ── */
(function () {
  var monogram = document.getElementById('monogram');
  if (!monogram) return;

  monogram.classList.add('intro-animate');

  monogram.addEventListener('animationend', function () {
    monogram.classList.remove('intro-animate');
  }, { once: true });
})();
