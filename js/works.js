/* ── Works Grid — Dynamic Card Generation ── */
(function () {
  var grid = document.getElementById('works-grid');
  if (!grid) return;

  fetch('works-data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Works data fetch failed');
      return res.json();
    })
    .then(function (works) {
      renderCards(works);
      observeCards();
    })
    .catch(function (err) {
      console.warn('Works grid:', err.message);
    });

  function renderCards(works) {
    var fragment = document.createDocumentFragment();

    works.forEach(function (work, index) {
      var card = document.createElement('a');
      card.className = 'works__card';
      card.href = work.links && work.links.spotify ? work.links.spotify : '#';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('data-grid', work.gridPosition);
      card.setAttribute('data-size', work.size);
      card.setAttribute('aria-label', work.artist + ' — ' + work.project);
      card.style.transitionDelay = (index * 0.04) + 's';

      var img = document.createElement('img');
      img.className = 'works__card-image';
      img.src = work.cover;
      img.alt = work.artist + ' — ' + work.project;
      img.loading = index < 6 ? 'eager' : 'lazy';

      var info = document.createElement('div');
      info.className = 'works__card-info';

      var artist = document.createElement('span');
      artist.className = 'works__card-artist';
      artist.textContent = work.artist;

      var project = document.createElement('span');
      project.className = 'works__card-project';
      project.textContent = work.project;

      var meta = document.createElement('span');
      meta.className = 'works__card-meta';
      meta.textContent = work.role + ' · ' + work.year;

      info.appendChild(artist);
      info.appendChild(project);
      info.appendChild(meta);

      card.appendChild(img);
      card.appendChild(info);
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
  }

  function observeCards() {
    var cards = grid.querySelectorAll('.works__card');

    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (card) {
        card.classList.add('is-visible');
      });
      return;
    }

    // Use the section as root since sections are scroll containers
    var section = grid.closest('section');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: section,
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }
})();
