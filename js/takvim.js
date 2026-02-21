/* ── Takvim — Event List & Detail Modal ── */
(function () {
  var list = document.getElementById('takvim-list');
  if (!list) return;

  var modal = document.getElementById('takvim-modal');
  var modalOverlay = document.getElementById('takvim-modal-overlay');
  var modalClose = document.getElementById('takvim-modal-close');
  var modalInfo = document.getElementById('takvim-modal-info');
  var modalPoster = document.getElementById('takvim-modal-poster');

  function getLang() {
    return localStorage.getItem('preferred-lang') || 'en';
  }

  function getLocalizedText(obj) {
    if (!obj) return '';
    var lang = getLang();
    return obj[lang] || obj.en || '';
  }

  fetch('takvim-data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Takvim data fetch failed');
      return res.json();
    })
    .then(function (data) {
      renderEvents(data.events);
      observeLanguageChanges(data.events);
    })
    .catch(function (err) {
      console.warn('Takvim:', err.message);
    });

  function renderEvents(events) {
    var fragment = document.createDocumentFragment();

    events.forEach(function (evt) {
      var row = document.createElement('div');
      row.className = 'takvim__row' + (evt.status === 'tba' ? ' takvim__row--tba' : '');
      row.setAttribute('data-event-id', evt.id);

      // Date
      var dateEl = document.createElement('div');
      dateEl.className = 'takvim__date';
      dateEl.setAttribute('data-takvim-date', evt.id);
      setDateHtml(dateEl, getLocalizedText(evt.date.display), evt.status);

      // Venue / TBA
      var venueEl = document.createElement('div');
      if (evt.status === 'confirmed' && evt.venue.name) {
        venueEl.className = 'takvim__venue';
        venueEl.setAttribute('data-takvim-venue', evt.id);
        venueEl.textContent = evt.venue.name + ' \u2014 ' + getLocalizedText(evt.venue.city);
      } else {
        venueEl.className = 'takvim__tba-text';
        venueEl.setAttribute('data-takvim-tba', evt.id);
        venueEl.textContent = getLocalizedText(evt.tbaText);
      }

      // Logo
      var logoWrap = document.createElement('div');
      logoWrap.className = 'takvim__logo-wrap';

      var logoLink = document.createElement('a');
      logoLink.className = 'takvim__logo-link';
      logoLink.href = evt.artist.profileUrl;
      logoLink.target = '_blank';
      logoLink.rel = 'noopener noreferrer';
      logoLink.setAttribute('aria-label', evt.artist.name);

      var logoImg = document.createElement('img');
      logoImg.className = 'takvim__logo logo-' + evt.artist.logoOrientation;
      logoImg.src = evt.artist.logo;
      logoImg.alt = evt.artist.name;
      logoImg.loading = 'lazy';

      logoLink.appendChild(logoImg);
      logoWrap.appendChild(logoLink);

      // Actions
      var actionsEl = document.createElement('div');
      actionsEl.className = 'takvim__actions';

      if (evt.status === 'confirmed') {
        var detailsBtn = document.createElement('button');
        detailsBtn.className = 'takvim__details-btn';
        detailsBtn.setAttribute('data-takvim-details-btn', evt.id);
        detailsBtn.textContent = getLocalizedText(evt.detailsButtonText);
        detailsBtn.addEventListener('click', function () {
          openModal(evt);
        });
        actionsEl.appendChild(detailsBtn);

        if (evt.ticketUrl) {
          var ticketBtn = document.createElement('a');
          ticketBtn.className = 'takvim__ticket-btn';
          ticketBtn.href = evt.ticketUrl;
          ticketBtn.target = '_blank';
          ticketBtn.rel = 'noopener noreferrer';
          ticketBtn.setAttribute('data-takvim-ticket-btn', evt.id);
          ticketBtn.textContent = getLocalizedText(evt.ticketButtonText);
          actionsEl.appendChild(ticketBtn);
        }
      } else {
        // TBA placeholders
        var detailsPlaceholder = document.createElement('span');
        detailsPlaceholder.className = 'takvim__details-btn';
        detailsPlaceholder.setAttribute('data-takvim-details-btn', evt.id);
        detailsPlaceholder.textContent = evt.detailsButtonText ? getLocalizedText(evt.detailsButtonText) : getLocalizedText({ tr: 'Detaylar', en: 'Details', de: 'Details', es: 'Detalles' });
        actionsEl.appendChild(detailsPlaceholder);

        var ticketPlaceholder = document.createElement('span');
        ticketPlaceholder.className = 'takvim__ticket-btn';
        ticketPlaceholder.setAttribute('data-takvim-ticket-btn', evt.id);
        ticketPlaceholder.textContent = evt.ticketButtonText ? getLocalizedText(evt.ticketButtonText) : getLocalizedText({ tr: 'Bilet', en: 'Tickets', de: 'Tickets', es: 'Entradas' });
        actionsEl.appendChild(ticketPlaceholder);
      }

      row.appendChild(dateEl);
      row.appendChild(venueEl);
      row.appendChild(logoWrap);
      row.appendChild(actionsEl);
      fragment.appendChild(row);
    });

    list.appendChild(fragment);
  }

  function openModal(evt) {
    var lang = getLang();

    // Build info content
    var html = '';

    // Date & Time
    if (evt.details && evt.details.datetime) {
      html += '<div class="takvim-modal__field">';
      html += '<span class="takvim-modal__label" data-takvim-modal-label="datetime">' + getLocalizedText({ tr: 'Tarih & Saat', en: 'Date & Time', de: 'Datum & Uhrzeit', es: 'Fecha & Hora' }) + '</span>';
      html += '<span class="takvim-modal__value">' + escapeHtml(getLocalizedText(evt.details.datetime)) + '</span>';
      html += '</div>';
    }

    // Venue
    if (evt.venue && evt.venue.name) {
      html += '<div class="takvim-modal__field">';
      html += '<span class="takvim-modal__label" data-takvim-modal-label="venue">' + getLocalizedText({ tr: 'Mekan', en: 'Venue', de: 'Veranstaltungsort', es: 'Lugar' }) + '</span>';
      html += '<span class="takvim-modal__value">' + escapeHtml(evt.venue.name);
      if (evt.details && evt.details.address) {
        html += '<br>' + escapeHtml(evt.details.address).replace(/\n/g, '<br>');
      }
      html += '</span>';
      html += '</div>';
    }

    // Notes
    if (evt.details && evt.details.notes) {
      html += '<div class="takvim-modal__field">';
      html += '<span class="takvim-modal__label" data-takvim-modal-label="notes">' + getLocalizedText({ tr: 'Notlar', en: 'Notes', de: 'Hinweise', es: 'Notas' }) + '</span>';
      html += '<span class="takvim-modal__value">' + escapeHtml(getLocalizedText(evt.details.notes)) + '</span>';
      html += '</div>';
    }

    // Ticket button
    if (evt.ticketUrl) {
      var ticketText = evt.modalTicketButtonText ? getLocalizedText(evt.modalTicketButtonText) : getLocalizedText({ tr: 'Bilet Al', en: 'Get Tickets', de: 'Tickets kaufen', es: 'Comprar Entradas' });
      html += '<a class="takvim-modal__ticket-btn" href="' + escapeAttr(evt.ticketUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(ticketText) + '</a>';
    }

    modalInfo.innerHTML = html;

    // Poster
    if (evt.details && evt.details.poster) {
      modalPoster.innerHTML = '<img src="' + escapeAttr(evt.details.poster) + '" alt="Event poster">';
    } else {
      modalPoster.innerHTML = '<span class="takvim-modal__poster-placeholder">Poster</span>';
    }

    // Show modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    var section = modal.closest('section');
    if (section) section.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    var section = modal.closest('section');
    if (section) section.style.overflow = '';
  }

  // Modal close events
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Language change observer — update dynamic content
  function observeLanguageChanges(events) {
    var langBtns = document.querySelectorAll('.lang-selector__btn');
    langBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(function () {
          updateTexts(events);
        }, 10);
      });
    });
  }

  function updateTexts(events) {
    events.forEach(function (evt) {
      // Date
      var dateEl = list.querySelector('[data-takvim-date="' + evt.id + '"]');
      if (dateEl) setDateHtml(dateEl, getLocalizedText(evt.date.display), evt.status);

      // Venue
      var venueEl = list.querySelector('[data-takvim-venue="' + evt.id + '"]');
      if (venueEl && evt.venue.name) {
        venueEl.textContent = evt.venue.name + ' \u2014 ' + getLocalizedText(evt.venue.city);
      }

      // TBA text
      var tbaEl = list.querySelector('[data-takvim-tba="' + evt.id + '"]');
      if (tbaEl && evt.tbaText) {
        tbaEl.textContent = getLocalizedText(evt.tbaText);
      }

      // Details button
      var detBtn = list.querySelector('[data-takvim-details-btn="' + evt.id + '"]');
      if (detBtn) {
        detBtn.textContent = evt.detailsButtonText
          ? getLocalizedText(evt.detailsButtonText)
          : getLocalizedText({ tr: 'Detaylar', en: 'Details', de: 'Details', es: 'Detalles' });
      }

      // Ticket button
      var tickBtn = list.querySelector('[data-takvim-ticket-btn="' + evt.id + '"]');
      if (tickBtn) {
        tickBtn.textContent = evt.ticketButtonText
          ? getLocalizedText(evt.ticketButtonText)
          : getLocalizedText({ tr: 'Bilet', en: 'Tickets', de: 'Tickets', es: 'Entradas' });
      }
    });
  }

  function setDateHtml(el, text, status) {
    if (status === 'confirmed') {
      var dotIndex = text.indexOf('.');
      if (dotIndex > 0) {
        var day = text.substring(0, dotIndex);
        var rest = text.substring(dotIndex);
        el.innerHTML = '<span class="takvim__date-day">' + escapeHtml(day) + '</span>' + escapeHtml(rest);
        return;
      }
    }
    el.textContent = text;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
