(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-source');
    var hlsInstance = null;
    var initialized = false;

    function writeStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (!video || !source) {
        writeStatus('当前页面没有可用播放源。');
        return Promise.reject(new Error('No playable source.'));
      }

      if (initialized) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        initialized = true;
        writeStatus('已使用浏览器原生播放能力加载播放源。');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          writeStatus('播放源解析完成，可以开始播放。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            writeStatus('播放遇到网络或媒体错误，请稍后重试。');
          }
        });
        initialized = true;
        return Promise.resolve();
      }

      writeStatus('当前浏览器不支持该播放格式，请更换支持在线播放的浏览器。');
      return Promise.reject(new Error('Streaming is not supported.'));
    }

    function play() {
      attachSource().then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            writeStatus('播放已准备好，请在播放器控制栏中再次点击播放。');
          });
        }
      }).catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 && button) {
          button.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
