(function () {
  var body = document.body;

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      body.classList.toggle('menu-open', opened);
      button.setAttribute('aria-label', opened ? '关闭菜单' : '打开菜单');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = toArray(hero.querySelectorAll('[data-hero-slide]'));
    var dots = toArray(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function getQueryParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      year: params.get('year') || '',
      region: params.get('region') || '',
      type: params.get('type') || ''
    };
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-form]');
    var cards = toArray(document.querySelectorAll('[data-movie-card]'));
    var count = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-empty-state]');

    if (!panel || !cards.length) {
      return;
    }

    var input = panel.querySelector('input[name="q"]');
    var year = panel.querySelector('select[name="year"]');
    var region = panel.querySelector('select[name="region"]');
    var type = panel.querySelector('select[name="type"]');
    var reset = panel.querySelector('[data-reset-filter]');
    var params = getQueryParams();

    if (input && params.q) {
      input.value = params.q;
    }

    if (year && params.year) {
      year.value = params.year;
    }

    if (region && params.region) {
      region.value = params.region;
    }

    if (type && params.type) {
      type.value = params.type;
    }

    function matches(card) {
      var q = normalize(input ? input.value : '');
      var selectedYear = normalize(year ? year.value : '');
      var selectedRegion = normalize(region ? region.value : '');
      var selectedType = normalize(type ? type.value : '');
      var searchText = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));

      if (q && searchText.indexOf(q) === -1) {
        return false;
      }

      if (selectedYear && cardYear !== selectedYear) {
        return false;
      }

      if (selectedRegion && cardRegion !== selectedRegion) {
        return false;
      }

      if (selectedType && cardType !== selectedType) {
        return false;
      }

      return true;
    }

    function apply() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      panel.addEventListener(eventName, apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function setupImageFallback() {
    var images = toArray(document.querySelectorAll('.cover-img, .hero-slide img, .ranking-row img, .detail-backdrop'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  setupMobileMenu();
  setupHero();
  setupFilters();
  setupImageFallback();
})();
