(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("visible", window.scrollY > 420);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5800);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeTerm = "";
    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }
    function applyFilter() {
        var typed = normalize(filterInput ? filterInput.value : "");
        var tabValue = normalize(activeTerm);
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var passTyped = !typed || text.indexOf(typed) !== -1;
            var passTab = !tabValue || text.indexOf(tabValue) !== -1;
            card.classList.toggle("hidden-card", !(passTyped && passTab));
        });
    }
    if (filterInput && cards.length) {
        var query = new URLSearchParams(window.location.search).get("q") || "";
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }
    tabs.forEach(function (button) {
        button.addEventListener("click", function () {
            tabs.forEach(function (item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            activeTerm = button.getAttribute("data-filter-value") || "";
            applyFilter();
        });
    });
})();
