(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-links]");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-zone]")).forEach(function (zone) {
        var input = zone.querySelector("[data-filter-input]");
        var yearSelect = zone.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-card]"));
        var years = [];

        cards.forEach(function (card) {
            var year = card.getAttribute("data-year");
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });

        years.sort(function (a, b) {
            return Number(b) - Number(a);
        });

        if (yearSelect && yearSelect.options.length <= 1) {
            years.forEach(function (year) {
                var option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var visible = true;

                if (keyword && title.indexOf(keyword) === -1) {
                    visible = false;
                }

                if (year && cardYear !== year) {
                    visible = false;
                }

                card.classList.toggle("is-hidden", !visible);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
    });
})();
