/* Mermaid 图（2026-11-23）
 *
 * 只在含 ```mermaid 代码块的页面加载（layouts/partials/mermaid.html；判据是
 * render-codeblock-mermaid.html 记在页面上的 hasMermaid 标记），排在 vendor/mermaid.min.js
 * 后面，两个都 defer。
 *
 * 做法：每个 <pre class="mermaid"> 画两次 —— 浅色（default）一份、深色（dark）一份 ——
 * 放进 .mermaid-box，custom.css 第 70 段按 <html data-theme> 只显示其中一份。
 *   为什么不在切换深浅色时重画：重画是异步的，而圆形绽开（palette.js）在回调里一改 data-theme
 *   就截新快照，图会先以旧颜色出现在圆里、动画结束后才翻过来。两份都画好，切换就是纯 CSS。
 * ⚠️ 源码取 textContent：正文内链（inline-links.html）可能在源码里包了 <a>，textContent 不受影响。
 * ⚠️ 先 parse 再 render：语法错的图不调 render（它出错时会往 body 里塞一张错误图），
 *    原来的 <pre> 留着显示源码，并加上 .mermaid-error。
 * ⚠️ securityLevel 用 strict：图里的 HTML 标签会被转义、点击回调被禁用。
 */
(function () {
  var nodes = document.querySelectorAll('pre.mermaid');
  var m = window.mermaid;
  if (!nodes.length || !m) return;

  var font = getComputedStyle(document.body).fontFamily;

  function config(theme) {
    return { startOnLoad: false, securityLevel: 'strict', theme: theme, fontFamily: font };
  }

  async function draw(pre, i) {
    var src = pre.textContent;
    var ok = await m.parse(src, { suppressErrors: true });
    if (!ok) {
      pre.classList.add('mermaid-error');
      return;
    }
    m.initialize(config('default'));
    var light = await m.render('hl-mmd-' + i + '-light', src);
    m.initialize(config('dark'));
    var dark = await m.render('hl-mmd-' + i + '-dark', src);

    var box = document.createElement('div');
    box.className = 'mermaid-box';
    box.innerHTML =
      '<div class="mermaid-light">' + light.svg + '</div>' +
      '<div class="mermaid-dark">' + dark.svg + '</div>';
    pre.replaceWith(box);
  }

  (async function () {
    /* 一张一张画：initialize 是全局配置，并发画的话浅、深两套主题会互相串。 */
    for (var i = 0; i < nodes.length; i++) {
      try {
        await draw(nodes[i], i);
      } catch (e) {
        nodes[i].classList.add('mermaid-error');
      }
    }
  })();
})();
