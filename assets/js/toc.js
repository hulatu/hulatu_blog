/* 右侧目录（>1200px）的显隐（2026-11-22 从 layouts/_default/single.html 末尾搬到这里）
   滚动时收起；触屏第一下点按只展开；空目录隐藏；键盘 Tab 进入时展开。
   2026-11-23：当前节高亮也搬到这里（原来是主题 toc.html 里的内联脚本，站点层已覆盖掉）：
   用 IntersectionObserver 盯住「距视口顶 100px」那条阅读线，标题跨线时才重新算一次，
   滚动过程中不再每帧测量；滚动停下（scrollend）再校正一次，防止快速拖动跳过了标题。
   ⚠️ 触屏「第一下只展开」的 click 监听必须先注册（stopImmediatePropagation 要拦住后面的高亮监听）。
   ⚠️ 没有 div.toc 的页面直接 return（全站共用一个 site.js）。 */
(function () {
  var toc = document.querySelector('div.toc');
  if (!toc) return;
  var nav = toc.querySelector('.toc-nav');
  if (!nav || !nav.querySelector('a')) {
    toc.style.display = 'none';
    return;
  }
  /* 滚动时收起：有 scrollend 就用它，没有再退回 150ms 计时器。 */
  var hasScrollEnd = 'onscrollend' in window;
  var timer = null;
  window.addEventListener('scroll', function () {
    if (!toc.classList.contains('toc-scrolling')) toc.classList.add('toc-scrolling');
    if (hasScrollEnd) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { toc.classList.remove('toc-scrolling'); }, 150);
  }, { passive: true });
  if (hasScrollEnd) {
    window.addEventListener('scrollend', function () { toc.classList.remove('toc-scrolling'); });
  }
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

  /* ── 当前节高亮（与上游同一套规则：从后往前找第一个 top ≤ 100px 的标题，连同父级一起点亮）── */
  var OFFSET = 100;
  var links = nav.querySelectorAll('a[href^="#"]');
  var idToLink = {};
  var headings = [];
  Array.prototype.forEach.call(links, function (a) {
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (idToLink[id]) return;
    var h = document.getElementById(id);
    if (!h) return;
    idToLink[id] = a;
    headings.push(h);
  });
  if (!headings.length) return;

  var chain = [];
  var current = null;
  function chainOf(a) {
    var out = [];
    var li = a && a.closest('li');
    if (a) out.push(a);
    while (li) {
      var parent = li.parentElement ? li.parentElement.closest('li') : null;
      if (parent) {
        var pa = parent.querySelector('a');
        if (pa) out.push(pa);
      }
      li = parent;
    }
    return out;
  }
  function activate(a) {
    if (a === current) return;
    var next = chainOf(a);
    chain.forEach(function (el) { if (next.indexOf(el) < 0) el.classList.remove('active'); });
    next.forEach(function (el) { el.classList.add('active'); });
    chain = next;
    current = a;
  }
  function update() {
    var hit = null;
    for (var i = headings.length - 1; i >= 0; i--) {
      if (headings[i].getBoundingClientRect().top <= OFFSET) { hit = idToLink[headings[i].id] || null; break; }
    }
    activate(hit);
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; update(); });
  }

  if ('IntersectionObserver' in window) {
    /* 观察区 = 阅读线以下的整个视口：标题向上越过阅读线（离开）或回到线下（进入）都会触发。 */
    var io = new IntersectionObserver(schedule, { rootMargin: '-' + OFFSET + 'px 0px 0px 0px' });
    headings.forEach(function (h) { io.observe(h); });
    /* 校正：快速拖动时标题可能一帧之内从视口下方跳到阅读线上方，IO 不会报。
       停下后补算一次；没有 scrollend 的浏览器（Safari）用 150ms 防抖代替，仍不是每帧测量。 */
    if (hasScrollEnd) {
      window.addEventListener('scrollend', schedule);
    } else {
      var settle = null;
      window.addEventListener('scroll', function () {
        if (settle) clearTimeout(settle);
        settle = setTimeout(schedule, 150);
      }, { passive: true });
    }
  } else {
    window.addEventListener('scroll', schedule, { passive: true });
  }
  window.addEventListener('resize', schedule, { passive: true });

  /* 点目录：立即点亮被点的那一项（跳转本身走原生锚点）。触屏第一下已被上面拦掉。 */
  nav.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && nav.contains(a)) activate(a);
  });

  update();
})();
