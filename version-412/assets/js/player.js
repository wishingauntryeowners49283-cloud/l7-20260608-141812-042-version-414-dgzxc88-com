(function () {
    function setupPlayer(wrapper) {
        var video = wrapper.querySelector("video");
        var overlay = wrapper.querySelector(".video-overlay");
        var sourceUrl = wrapper.getAttribute("data-video");
        var hlsInstance = null;
        var started = false;

        if (!video || !sourceUrl) {
            return;
        }

        function playVideo() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = sourceUrl;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (!started) {
                playVideo();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
