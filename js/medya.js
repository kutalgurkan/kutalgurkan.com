/* ── Medya — Split Landing, Gallery & Lightbox ── */
(function () {
  var landing = document.getElementById('medya-landing');
  if (!landing) return;

  var medyaSection = document.getElementById('medya');
  var gallery = document.getElementById('medya-gallery');
  var grid = document.getElementById('medya-grid');
  var galleryTitle = document.getElementById('medya-gallery-title');
  var backBtn = document.getElementById('medya-back-btn');
  var lightbox = document.getElementById('medya-lightbox');
  var lightboxBg = document.getElementById('medya-lightbox-bg');
  var lightboxClose = document.getElementById('medya-lightbox-close');
  var lightboxImg = document.getElementById('medya-lightbox-img');

  var mediaData = null;
  var currentGallery = null;

  // Fetch data
  fetch('media-data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Media data fetch failed');
      return res.json();
    })
    .then(function (data) {
      mediaData = data;
      initCovers(data);
    })
    .catch(function (err) {
      console.warn('Medya:', err.message);
    });

  function initCovers(data) {
    var studioCover = document.getElementById('medya-cover-studio');
    var stageCover = document.getElementById('medya-cover-stage');
    if (studioCover) studioCover.style.backgroundImage = 'url(' + data.studio.cover + ')';
    if (stageCover) stageCover.style.backgroundImage = 'url(' + data.stage.cover + ')';
  }

  // Reset state when section is re-navigated to
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'class' && medyaSection.classList.contains('is-active')) {
        resetToLanding();
      }
    });
  });
  observer.observe(medyaSection, { attributes: true });

  function resetToLanding() {
    // Close lightbox if open
    if (lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
    // Close gallery if open
    gallery.classList.remove('is-active');
    gallery.setAttribute('aria-hidden', 'true');
    landing.classList.remove('is-exiting', 'is-hidden');
    currentGallery = null;

    // Hamburger white on landing
    var header = document.querySelector('.header');
    if (header) header.classList.add('header--dark-section');
  }

  // Panel click
  var panels = landing.querySelectorAll('.medya__panel');
  panels.forEach(function (panel) {
    panel.addEventListener('click', function () {
      var galleryKey = panel.getAttribute('data-gallery');
      openGallery(galleryKey);
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.click();
      }
    });
  });

  function openGallery(key) {
    if (!mediaData) return;
    currentGallery = key;

    // Set gallery title
    var titleEl = landing.querySelector(
      key === 'studio' ? '.medya__panel-label--studio' : '.medya__panel-label--stage'
    );
    if (titleEl) galleryTitle.textContent = titleEl.textContent;

    // Render grid
    var photos = key === 'studio' ? mediaData.studio.photos : mediaData.stage.photos;
    renderGrid(photos);

    // Animate landing out
    landing.classList.add('is-exiting');
    setTimeout(function () {
      landing.classList.add('is-hidden');
      gallery.setAttribute('aria-hidden', 'false');
      gallery.classList.add('is-active');

      // Hamburger back to default color in gallery
      var header = document.querySelector('.header');
      if (header) header.classList.remove('header--dark-section');

      // Calculate row spans now that gallery is visible
      requestAnimationFrame(function () {
        recalcRowSpans();

        // Staggered reveal
        var items = grid.querySelectorAll('.medya__grid-item');
        items.forEach(function (item, i) {
          setTimeout(function () {
            item.classList.add('is-visible');
          }, i * 50);
        });
      });
    }, 500);
  }

  var ROW_HEIGHT = 10; // matches grid-auto-rows in CSS
  var GAP = 4;         // matches gap in CSS

  function recalcRowSpans() {
    var items = grid.querySelectorAll('.medya__grid-item');
    items.forEach(function (item) {
      var img = item.querySelector('img');
      if (img && img.naturalWidth && item.clientWidth) {
        var ratio = img.naturalHeight / img.naturalWidth;
        var height = item.clientWidth * ratio;
        var spans = Math.ceil((height + GAP) / (ROW_HEIGHT + GAP));
        item.style.gridRowEnd = 'span ' + spans;
      }
    });
  }

  window.addEventListener('resize', recalcRowSpans);

  function renderGrid(photos) {
    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();

    photos.forEach(function (photo) {
      var item = document.createElement('div');
      item.className = 'medya__grid-item';
      item.style.gridColumn = photo.gridColumn;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Fotoğraf ' + photo.id);

      var img = document.createElement('img');
      img.alt = '';
      img.src = photo.thumb;

      item.appendChild(img);
      item.addEventListener('click', function () {
        openLightbox(photo.full);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(photo.full);
        }
      });

      fragment.appendChild(item);
    });

    grid.appendChild(fragment);
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      closeGallery();
    });
  }

  function closeGallery() {
    gallery.classList.remove('is-active');
    gallery.setAttribute('aria-hidden', 'true');
    landing.classList.remove('is-exiting', 'is-hidden');
    currentGallery = null;

    // Hamburger back to white on landing
    var header = document.querySelector('.header');
    if (header) header.classList.add('header--dark-section');
  }

  // Lightbox
  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    var section = lightbox.closest('section');
    if (section) section.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    var section = lightbox.closest('section');
    if (section) section.style.overflow = '';
  }

  if (lightboxBg) lightboxBg.addEventListener('click', closeLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  // ESC key handling
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    // Lightbox open → close lightbox
    if (lightbox.classList.contains('is-open')) {
      closeLightbox();
      return;
    }

    // Gallery open → back to landing
    if (gallery.classList.contains('is-active')) {
      closeGallery();
    }
  });
})();
