/* ── Main — Contact Form Handler ── */
(function () {
  var contactForm = document.getElementById('contact-form');
  var contactSuccess = document.getElementById('contact-success');

  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(contactForm);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
      .then(function () {
        contactForm.style.display = 'none';
        contactSuccess.classList.add('is-visible');
      })
      .catch(function () {
        contactForm.style.display = 'none';
        contactSuccess.classList.add('is-visible');
      });
  });
})();
