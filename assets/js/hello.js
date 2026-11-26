/* 邮箱浮层的交互脚本（2026-11-20 起；2026-11-22 从 partials/hello-script.html 搬到这里）
   与 partials/hello.html、assets/css/custom.css 第 48 段配套。
   页脚「问候」和正文 mail-link shortcode（/about/ 的「写信」）共用同一套标记与脚本。

   ⚠️ 原文件头写着「压缩后不到 1 KB，内联省一次请求；超过 3 KB 再外链」。
      实测压缩后 1.5 KB；而且现在它和 palette.js / toc.js 拼在同一个长缓存文件里，
      不额外多一次请求，反而省掉每页 1.5 KB 的重复下载。
   ⚠️ 遍历**所有** .hello，不能只取第一个（正文「写信」排在页脚之前）。
   ⚠️ 桌面端不拦截触发词点击（仍是 mailto）；只有 hover: none 的设备改成点开卡片。
   ⚠️ 复制必须保留 execCommand 兜底：navigator.clipboard 只在 HTTPS / localhost 下存在。
   ⚠️ 「已复制」1.6 秒后复原，与代码块复制按钮同一个节奏。 */
(function () {
  var nodes = document.querySelectorAll('.hello');
  if (!nodes.length) return;

  var canHover = !window.matchMedia || window.matchMedia('(hover: hover)').matches;

  function copyText(text, onDone, onFail) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        legacy(text, onDone, onFail);
      });
      return;
    }
    legacy(text, onDone, onFail);
  }

  /* 老办法：临时 textarea + execCommand。clipboard API 不可用时的唯一退路。 */
  function legacy(text, onDone, onFail) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var copied = false;
    try {
      copied = document.execCommand('copy') === true;
    } catch (e) {}
    document.body.removeChild(ta);
    if (copied) onDone();
    else onFail();
  }

  function announce(text) {
    if (typeof window.hlAnnounce === 'function') {
      window.hlAnnounce(text);
      return;
    }
    var status = document.getElementById('hlCmdStatus');
    if (status) status.textContent = text;
  }

  Array.prototype.forEach.call(nodes, function (wrap) {
    var link = wrap.querySelector('.hello-link');
    var chip = wrap.querySelector('.hello-copy');
    if (!link || !chip) return;

    var email = chip.getAttribute('data-email') || '';
    var timer = null;
    var done = chip.querySelector('.hello-done');

    function resetChip() {
      chip.classList.remove('is-copied', 'is-failed');
      chip.setAttribute('aria-label', '复制邮箱地址 ' + email);
      if (done) done.textContent = '已复制';
    }

    function showDone() {
      if (timer) clearTimeout(timer);
      chip.classList.remove('is-failed');
      chip.classList.add('is-copied');
      chip.setAttribute('aria-label', '已复制');
      timer = setTimeout(function () {
        timer = null;
        resetChip();
      }, 1600);
    }

    function showFailed() {
      if (timer) clearTimeout(timer);
      timer = null;
      chip.classList.remove('is-copied');
      chip.classList.add('is-failed');
      chip.setAttribute('aria-label', '复制失败，请手动选中邮箱地址');
      if (done) done.textContent = '复制失败，请手动选中';
      announce('复制失败，请手动选中邮箱地址');
    }

    chip.addEventListener('click', function (e) {
      e.preventDefault();
      if (timer) clearTimeout(timer);
      timer = null;
      chip.classList.remove('is-copied', 'is-failed');
      copyText(email, showDone, showFailed);
    });

    if (!canHover) {
      function closeCard() {
        wrap.classList.remove('is-open');
        link.setAttribute('aria-expanded', 'false');
      }

      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = wrap.classList.toggle('is-open');
        link.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      document.addEventListener('click', function (e) {
        if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) closeCard();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && wrap.classList.contains('is-open')) {
          closeCard();
          link.focus();
        }
      });
    }
  });
})();
