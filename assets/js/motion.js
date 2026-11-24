/* 全站小动效（2026-11-23）。与 palette.js / hello.js / toc.js 拼成 /js/site.min.<hash>.js（defer）。
   四件事，互不依赖，每一段都自带「找不到元素就跳过」：
     1. 正文图片：加载前占位底色，解码完淡入（custom.css 第 64 段）
     2. 标题旁的 #：跳转的同时复制本节链接，底部提示「已复制本节链接」（第 65 段）
     3. 跑步页柱状图 / 关于页热力图：第一次进入视口时生长一次（第 66 段）
     4. 列表 ↔ 文章的标题过渡：离开页这一侧（pageswap）。进入页那一侧（pagereveal）
        必须在渲染前注册，所以写在 custom_head.html 的内联引导脚本里（第 67 段）。
     5. 图片放大：从原图位置「长」到全屏、关闭时缩回原位（同文档 View Transition，第 68 段）。
        放大本身是原生 Popover，这一段只是增强；不支持或减少动态效果时什么都不做。
   ⚠️ 所有「先藏起来、再显示」的类都由这里自己加：这个文件没加载成功时，什么都不会被藏住。 */
(function () {
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var root = document.documentElement;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ── 1. 图片占位 + 淡入 ────────────────────────────────────────────
     只管懒加载的图：每篇第一张图（fetchpriority=high，不带 loading=lazy）不碰，
     否则会拖慢 LCP。已经在缓存里的图直接显示。
     减少动态效果时只留占位底色，不做透明度变化（CSS 里分开写了）。 */
  var lazyImgs = document.querySelectorAll('.image-zoom-label > img[loading="lazy"]');
  if (lazyImgs.length) {
    root.classList.add('img-fade');
    each(lazyImgs, function (img) {
      if (img.complete) return;
      img.classList.add('img-wait');
      var show = function () { img.classList.remove('img-wait'); };
      /* 2026-11-23：等解码完再淡入。图片带 decoding="async"，load 只代表下载完 ——
         手机上解码一张 1080px 的图要几十毫秒，原来一下载完就开始淡，前半段淡的是空白，
         图会在中途「啪」地出现。decode() 失败（格式不支持、换了 srcset 档位）也照样显示；
         800ms 是兜底：万一 decode() 一直不返回，也不会把图永远藏着。 */
      var done = function () {
        if (typeof img.decode !== 'function') return show();
        setTimeout(show, 800);
        img.decode().then(show, show);
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', show, { once: true });
    });
  }

  /* ── 2. 标题 # 复制本节链接 ────────────────────────────────────────
     不拦截默认行为：照常跳转、改地址栏的 #，只是顺手复制。
     带修饰键（新标签页打开等）时什么都不做。复制失败就只跳转，不报错。 */
  var toast = null;
  var toastTimer = null;

  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'hl-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    /* 晚一帧写文字：读屏对「刚插进来就带内容」的 live region 常常不念。 */
    requestAnimationFrame(function () {
      toast.textContent = text;
      toast.classList.add('is-on');
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand('copy')) resolve(); else reject();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(ta);
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a.heading-anchor');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url = location.origin + location.pathname + a.getAttribute('href');
    copyText(url).then(function () { showToast('已复制本节链接'); }, function () {});
  });

  /* ── 3. 图表入场：第一次进入视口时生长一次 ──────────────────────────
     用 IntersectionObserver 触发一次性过渡，**不用滚动驱动动画**：后者在读者停住时
     会把柱子停在半高 —— 数据图停在一半等于显示错的数字。 */
  /* 跑步页柱状图：真的横向溢出时才让它能被 Tab 聚焦（键盘可滚），原来是 run.html 里的内联脚本。 */
  var runChart = document.querySelector('.chart');
  if (runChart && runChart.scrollWidth > runChart.clientWidth) runChart.tabIndex = 0;

  var charts = document.querySelectorAll('.chart, .heatmap-block');
  if (charts.length && !reduce && 'IntersectionObserver' in window) {
    root.classList.add('chart-anim');
    /* 柱子在 DOM 里是新 → 旧（row-reverse 排版），延迟倒过来算：视觉上从左（旧）往右（新）长。 */
    var bars = document.querySelectorAll('.chart .month-bar');
    each(bars, function (bar, i) {
      bar.style.transitionDelay = Math.min((bars.length - 1 - i) * 25, 400) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.25 });
    each(charts, function (el) { io.observe(el); });
  }

  /* ── 4. 列表 ↔ 文章的标题过渡（离开页这一侧）──────────────────────
     从文章列表点进文章：给被点的那条标题起名 post-title，新页的 h1 也叫这个名字，
     浏览器就把标题从列表位置移到文章标题位置。从文章回到列表反过来。
     进入页一侧见 custom_head.html。规则（两边必须一致）：
       文章页 = /posts/年份/…；列表页 = / /archive/ /weekly/ /posts/ /categories/x/ /tags/x/
     ⚠️ 只在有 view transition 时才起名（减少动态效果时 @view-transition 不生效，e.viewTransition 为 null）。 */
  var POST = /^\/posts\/\d{4}\//;
  var LISTPAGE = /^\/(?:archive\/|weekly\/|posts\/|categories\/[^/]+\/|tags\/[^/]+\/)?$/;
  var LISTLINKS = 'ul.blog-posts a, .recent-posts a';

  window.addEventListener('pageswap', function (e) {
    var act = e.activation;
    if (!e.viewTransition || !act || !act.entry) return;
    var to = new URL(act.entry.url);
    if (to.origin !== location.origin) return;
    var el = null;
    if (POST.test(to.pathname)) {
      var links = document.querySelectorAll(LISTLINKS);
      for (var i = 0; i < links.length; i++) {
        if (links[i].pathname === to.pathname) { el = links[i]; break; }
      }
    } else if (POST.test(location.pathname) && LISTPAGE.test(to.pathname)) {
      el = document.querySelector('main h1');
    }
    if (!el) return;
    el.style.viewTransitionName = 'post-title';
    el.setAttribute('data-vt-title', '');
  });

  /* ── 5. 图片放大的形变过渡 ───────────────────────────────────────────
     拦下 popovertarget 按钮的默认动作，自己在 startViewTransition 里开 / 关弹层：
     打开前缩略图叫 zoom-img，打开后放大图叫 zoom-img，浏览器补中间的位置和尺寸。
     把已经加载好的缩略图塞给 --zoom-thumb：新快照拍下的那一刻原图多半还没到，
     没有这层垫底的话，过渡终点会是一块空黑。
     Esc 关闭不经过这里（浏览器直接关），走第 68 段的普通淡出。 */
  if (!reduce && typeof document.startViewTransition === 'function') {
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('button[popovertarget]');
      if (!btn) return;
      var pop = document.getElementById(btn.getAttribute('popovertarget'));
      if (!pop || !pop.classList.contains('image-zoom-overlay') || typeof pop.showPopover !== 'function') return;
      var fig = pop.closest('figure');
      var thumb = fig && fig.querySelector('.zoomable-image');
      var pic = pop.querySelector('.image-zoom-pic');
      if (!thumb || !pic) return;
      var opening = !pop.matches(':popover-open');
      /* 关闭时缩略图不在屏幕里（打开后窗口大小变了）就不做形变，退回普通淡出。
         ⚠️ source: btn 让浏览器记住是谁打开的，关闭后焦点才会回到这张图（旧浏览器忽略这个参数）。 */
      if (!opening) {
        var r = thumb.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
      }
      e.preventDefault();
      if (opening && thumb.currentSrc) {
        pic.style.setProperty('--zoom-thumb', 'url("' + thumb.currentSrc.replace(/"/g, '%22') + '")');
      }
      var from = opening ? thumb : pic;
      var to = opening ? pic : thumb;
      from.style.viewTransitionName = 'zoom-img';
      root.classList.add('hl-vt-zoom');
      var t;
      try {
        t = document.startViewTransition(function () {
          from.style.viewTransitionName = '';
          to.style.viewTransitionName = 'zoom-img';
          if (opening) pop.showPopover({ source: btn }); else pop.hidePopover();
        });
      } catch (err) {
        from.style.viewTransitionName = '';
        root.classList.remove('hl-vt-zoom');
        if (opening) pop.showPopover({ source: btn }); else pop.hidePopover();
        return;
      }
      t.finished.finally(function () {
        to.style.viewTransitionName = '';
        root.classList.remove('hl-vt-zoom');
      }).catch(function () {});
    });
  }
})();
