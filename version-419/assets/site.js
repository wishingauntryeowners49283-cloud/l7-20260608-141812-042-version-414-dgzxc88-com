(function () {
    function $(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = $('[data-hero-slide]', slider);
        var dots = $('[data-hero-dot]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
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

        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
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
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function activeChip(panel, target) {
        $('[data-filter-clear], [data-filter-field]', panel).forEach(function (button) {
            button.classList.toggle('is-active', button === target);
        });
    }

    function filterCards(query, field, value) {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return false;
        }
        var cards = $('[data-movie-card]', grid);
        var text = normalize(query);
        var fieldName = field || '';
        var fieldValue = normalize(value);
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var fieldMatch = true;
            if (fieldName && fieldValue) {
                fieldMatch = normalize(card.getAttribute('data-' + fieldName)) === fieldValue;
            }
            var textMatch = !text || haystack.indexOf(text) !== -1;
            var keep = fieldMatch && textMatch;
            card.classList.toggle('is-hidden', !keep);
            if (keep) {
                visible += 1;
            }
        });
        var empty = document.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
        return true;
    }

    function initFilters() {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var hasGrid = Boolean(document.querySelector('[data-filter-grid]'));
        $('[data-search-form]').forEach(function (form) {
            var input = form.querySelector('input[name="q"]');
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value : '';
                if (!filterCards(query)) {
                    window.location.href = 'library.html?q=' + encodeURIComponent(query);
                }
            });
        });
        $('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('input[name="q"]');
            $('[data-filter-clear]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    activeChip(panel, button);
                    filterCards('');
                });
            });
            $('[data-filter-field]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    activeChip(panel, button);
                    filterCards(input ? input.value : '', button.getAttribute('data-filter-field'), button.getAttribute('data-filter-value'));
                });
            });
        });
        if (hasGrid && initialQuery) {
            filterCards(initialQuery);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    if (!video || !source) {
        return;
    }
    var hls = null;
    var ready = false;

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function attachAndPlay() {
        hideOverlay();
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.src = source;
            }
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!hls) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        video.pause();
                    }
                });
            } else if (ready || video.readyState > 0) {
                playVideo();
            }
            return;
        }
        video.src = source;
        playVideo();
    }

    function togglePlay() {
        if (!video.getAttribute('src') && !hls) {
            attachAndPlay();
            return;
        }
        hideOverlay();
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    if (overlay) {
        overlay.addEventListener('click', attachAndPlay);
    }
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', hideOverlay);
}
