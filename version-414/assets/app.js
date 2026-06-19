(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('.cover-img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.remove();
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(index + 1);
      }, 5600);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function paramsQuery() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  if (searchInput && paramsQuery()) {
    searchInput.value = paramsQuery();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionFilter ? regionFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var ok = true;

      if (query && text.indexOf(query) === -1) {
        ok = false;
      }

      if (region && card.getAttribute('data-region') !== region) {
        ok = false;
      }

      if (type && card.getAttribute('data-type') !== type) {
        ok = false;
      }

      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }

      card.hidden = !ok;

      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (cards.length && (searchInput || regionFilter || typeFilter || yearFilter)) {
    applyFilters();
  }

  var hlsLoading = false;
  var hlsCallbacks = [];

  function withHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsCallbacks.push(callback);

    if (hlsLoading) {
      return;
    }

    hlsLoading = true;

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = function () {
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      hlsCallbacks = [];
    };
    document.head.appendChild(script);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var veil = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    function begin(autoPlay) {
      if (video.dataset.ready === '1') {
        if (autoPlay) {
          video.play().catch(function () {});
        }
        return;
      }

      video.dataset.ready = '1';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        if (autoPlay) {
          video.play().catch(function () {});
        }
        return;
      }

      withHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (autoPlay) {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = stream;
          if (autoPlay) {
            video.play().catch(function () {});
          }
        }
      });
    }

    if (veil) {
      veil.addEventListener('click', function () {
        veil.classList.add('is-hidden');
        begin(true);
      });
    }

    video.addEventListener('play', function () {
      if (veil) {
        veil.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.dataset.ready !== '1') {
        begin(true);
        return;
      }

      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  });
})();
