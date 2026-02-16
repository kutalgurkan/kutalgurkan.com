/* ── KutiCo Application Form — Multi-Step Wizard ── */
(function () {
  var overlay = document.getElementById('kutico-overlay');
  var ctaBtn = document.getElementById('kutico-cta');
  var closeBtn = document.getElementById('kutico-overlay-close');
  var form = document.getElementById('kutico-form');
  var successEl = document.getElementById('kutico-success');
  var successCloseBtn = document.getElementById('kutico-success-close');
  var progressFill = document.getElementById('wizard-progress-fill');
  var currentStepEl = document.getElementById('wizard-current-step');

  if (!overlay || !form) return;

  var steps = form.querySelectorAll('.form-step');
  var totalSteps = steps.length;
  var currentStep = 1;

  function showStep(n) {
    steps.forEach(function (step) {
      step.classList.remove('is-active');
    });
    var target = form.querySelector('[data-step="' + n + '"]');
    if (target) {
      target.classList.add('is-active');
    }
    currentStep = n;
    currentStepEl.textContent = n;
    progressFill.style.width = ((n / totalSteps) * 100) + '%';

    // Scroll overlay to top
    overlay.scrollTop = 0;
  }

  function validateStep(n) {
    var step = form.querySelector('[data-step="' + n + '"]');
    if (!step) return true;

    var requiredInputs = step.querySelectorAll('[required]');
    var valid = true;

    requiredInputs.forEach(function (input) {
      if (input.type === 'radio') {
        // Check if any radio in the group is selected
        var name = input.name;
        var checked = step.querySelector('input[name="' + name + '"]:checked');
        if (!checked) {
          valid = false;
        }
      } else if (!input.value.trim()) {
        valid = false;
      }
    });

    return valid;
  }

  // Open overlay
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      showStep(1);
    });
  }

  // Close overlay
  function closeOverlay() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', closeOverlay);
  }

  // ESC to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeOverlay();
    }
  });

  // Next / Previous buttons
  form.addEventListener('click', function (e) {
    if (e.target.classList.contains('wizard-next')) {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          showStep(currentStep + 1);
        }
      } else {
        // Highlight first invalid field
        var step = form.querySelector('[data-step="' + currentStep + '"]');
        var firstInvalid = step.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.reportValidity();
        }
      }
    }

    if (e.target.classList.contains('wizard-prev')) {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    }
  });

  // Form submission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    var formData = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Form submission failed: ' + response.status);
        }
        form.style.display = 'none';
        document.querySelector('.kutico-overlay__progress').style.display = 'none';
        successEl.classList.add('is-visible');
      })
      .catch(function (err) {
        alert('Başvuru gönderilemedi: ' + err.message);
      });
  });
})();
