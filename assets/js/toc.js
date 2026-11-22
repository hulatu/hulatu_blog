/* 右侧目录（>1200px）的显隐（2026-11-22 从 layouts/_default/single.html 末尾搬到这里）
   滚动时收起；触屏第一下点按只展开；空目录隐藏；键盘 Tab 进入时展开。
   主题 toc.html 的滚动高亮脚本保持原样（它挂在 DOMContentLoaded 上）。
   ⚠️ 本文件经 defer 执行，仍早于 DOMContentLoaded，所以 nav 上的 click 监听依旧排在
      主题脚本之前，stopImmediatePropagation 的效果不变。
   ⚠️ 没有 div.toc 的页面直接 return（全站共用一个 site.js）。 */
(function () {
  var toc = document.querySelector('div.toc');
  if (!toc) return;
  var nav = toc.querySelector('.toc-nav');
  if (!nav || !nav.querySelector('a')) {
    toc.style.display = 'none';
    return;
  }
  var timer = null;
  window.addEventListener('scroll', function () {
    toc.classList.add('toc-scrolling');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { toc.classList.remove('toc-scrolling'); }, 150);
  }, { passive: true });
  var lastPointer = 'mouse';
  nav.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType || 'mouse'; });
  nav.addEventListener('click', function (e) {
    if (lastPointer !== 'touch') return;
    if (toc.classList.contains('toc-open')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    toc.classList.add('toc-open');
  });
  document.addEventListener('click', function (e) {
    if (!toc.contains(e.target)) toc.classList.remove('toc-open');
  });
  var kb = false;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') kb = true; });
  document.addEventListener('mousedown', function () { kb = false; });
  nav.addEventListener('focusin', function () { if (kb) toc.classList.add('toc-open'); });
  nav.addEventListener('focusout', function (e) {
    if (!nav.contains(e.relatedTarget)) toc.classList.remove('toc-open');
  });
})();
