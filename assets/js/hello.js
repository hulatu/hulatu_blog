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

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        legacy(text, onDone);
      });
      return;
    }
    legacy(text, onDone);
  }

  /* 老办法：临时 textarea + execCommand。clipboard API 不可用时的唯一退路。 */
  function legacy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      onDone();
    } catch (e) {
      /* 静默失败：卡片保持原样，用户自然知道没复制上。 */
    }
    document.body.removeChild(ta);
  }

  Array.prototype.forEach.call(nodes, function (wrap) {
    var link = wrap.querySelector('.hello-link');
    var chip = wrap.querySelector('.hello-copy');
    if (!link || !chip) return;

    var email = chip.getAttribute('data-email') || '';
    var timer = null;

    function showDone() {
      chip.classList.add('is-copied');
      chip.setAttribute('aria-label', '已复制');
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        chip.classList.remove('is-copied');
        chip.setAttribute('aria-label', '复制邮箱地址 ' + email);
      }, 1600);
    }

    chip.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(email, showDone);
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
