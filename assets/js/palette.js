/* hulatu.com 全站脚本：搜索面板（/ 与 ⌘K）、深浅色切换、随机漫游。零外部依赖。
   2026-11-22 从 layouts/partials/custom_body.html 的内联 <script> 搬到这里，
   由 custom_head.html 与 hello.js / toc.js 拼成 /js/site.min.<hash>.js（defer，长缓存）。
   ⚠️ 面板的 HTML（#hlCmdOverlay）仍在 custom_body.html；按钮在 partials/nav.html。
   ⚠️ 这里没有任何 Hugo 模板变量 —— 需要模板值时写成 data-* 属性再读，别把它改回内联。 */
(function () {
  var indexCache = null;
  var selectedIdx = 0;
  var currentItems = [];
  var themeTimer = null;
  var vtSeq = 0;
  /* 2026-11-23：圆形绽开进行中（约 0.55s）再点一次就忽略。
     原来第二次点击会让浏览器跳过第一次过渡 —— 画面从半个圆一下子跳到满屏，再从头长一个圆。 */
  var vtRunning = false;
  /* 圆形绽开和图标旋转共用的缓动。2026-11-23 起由 ease-in-out（.645,.045,.355,1）改成 ease-out：
     原来前 100ms 圆几乎不动（半径约 5%），点下去像是没反应。先试过 (.22,1,.36,1)，用户觉得太急；
     现在是 easeOutCubic：100ms 到半径约一半、200ms 约 78%，
     后段慢慢铺满，收尾也更柔。Firefox 退回路径的 .hl-theme-spin（custom.css 第 57c 段）没跟着改 ——
     那是三段关键帧，每段各用一次缓动，换成 ease-out 会在中间那个关键帧顿一下。 */
  /* 2026-11-23：缓动的唯一出处改成 custom.css 第 69 段的 --hl-ease-out（全站共用），这里切换时读一次；
     读不到（CSS 没加载、被换掉）时用下面这个同值常量。改曲线只改 CSS 那一处。 */
  var VT_EASE_FALLBACK = 'cubic-bezier(0.33, 1, 0.68, 1)';

  function vtEase() {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue('--hl-ease-out').trim();
      return v || VT_EASE_FALLBACK;
    } catch (err) {
      return VT_EASE_FALLBACK;
    }
  }

  /* 深浅色按钮的图标：内联 SVG，不依赖系统 emoji 字体。
     dark 时显示太阳（点击回浅色），light 时显示月亮（点击去深色）。 */
  var ICON_MOON = '<svg class="hl-theme-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg class="hl-theme-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  /* 2026-11-23：缓存 Promise 本身。原来只缓存结果，索引还在下载时每敲一个字
     就会再发一次 fetch；现在下载中的请求被共用。失败时清空，下次打开会重试。 */
  var indexPromise = null;
  var indexFailed = false;

  function loadIndex() {
    if (indexCache) return Promise.resolve(indexCache);
    if (indexPromise) return indexPromise;
    indexFailed = false;
    indexPromise = fetch('/index.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        /* 本站 /index.json 是 {t,u,g,h,k,d}（layouts/index.json），
           这里统一成升级包需要的 title/url/summary/date/section。
           h 是二/三级标题，k 是 description / 粗体 / 「」短语，
           d 是引用框内容；面板按标题 > 章节 > 关键词 > 引用四级匹配。 */
        indexCache = (Array.isArray(data) ? data : []).map(function (p) {
          return {
            title: p.title || p.t || '',
            url: p.url || p.u || '',
            date: p.date || '',
            section: p.section || (p.g && p.g[0]) || '文章',
            summary: p.summary || p.d || '',
            headings: Array.isArray(p.h) ? p.h : [],
            keywords: Array.isArray(p.k) ? p.k : []
          };
        });
        return indexCache;
      })
      .catch(function () {
        indexFailed = true;
        indexPromise = null;
        return [];
      });
    return indexPromise;
  }

  /* 第一次打开面板、索引还没到时显示三条占位（约 61 KB gzip，慢网要等一会儿）。
     ⚠️ 仍然只在打开面板时才拉索引 —— 别改成进页面或聚焦就拉（MAINTENANCE 有约定）。 */
  function renderLoading() {
    resultsEl.setAttribute('aria-busy', 'true');
    resultsEl.innerHTML =
      '<li class="hl-cmd-skel" aria-hidden="true"></li>' +
      '<li class="hl-cmd-skel" aria-hidden="true"></li>' +
      '<li class="hl-cmd-skel" aria-hidden="true"></li>';
  }

  function retryIndex() {
    indexPromise = null;
    indexFailed = false;
    openCmd();
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function applyTheme(theme, persist, animate) {
    /* 退回方案：不支持 View Transitions 的浏览器临时给 <html> 加过渡类，
       360ms 后移除；首次加载不播放动画。 */
    if (animate && !prefersReducedMotion()) {
      document.documentElement.classList.add('hl-theme-transition');
      if (themeTimer) clearTimeout(themeTimer);
      themeTimer = setTimeout(function () {
        document.documentElement.classList.remove('hl-theme-transition');
        themeTimer = null;
      }, 360);
    }
    document.documentElement.setAttribute('data-theme', theme);
    var icon = document.getElementById('hlThemeIcon');
    if (icon) icon.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    var themeBtn = document.getElementById('hlThemeBtn');
    if (themeBtn) themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    /* 手动切换后同步地址栏配色与 giscus 主题（两者原本只认系统）。 */
    var meta = document.getElementById('hl-theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#111214' : '#FCFCFA');
    var slot = document.getElementById('giscus-slot');
    if (slot) slot.dataset.theme = theme;
    var frame = document.querySelector('iframe.giscus-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, 'https://giscus.app');
    }
    /* 首次加载只同步界面，不把「系统当前是什么」写成用户偏好。 */
    if (persist !== false) {
      try { localStorage.setItem('hl-theme', theme); } catch (e) {}
    }
  }

  /* 图标转一整圈（退回方案 / 无 View Transitions 时用）。
     先移除再强制回流，连续点击也能从头重播；360° 收尾回到原位，
     不会把月亮留在倒着的角度上。 */
  function spinThemeIcon() {
    if (prefersReducedMotion()) return;
    var icon = document.getElementById('hlThemeIcon');
    if (!icon) return;
    icon.classList.remove('hl-theme-spin');
    void icon.offsetWidth;
    icon.classList.add('hl-theme-spin');
  }

  /* 黑白切换：从点击处向外圆形绽开（时长与目录站同款 500ms；缓动 2026-11-23 起改为 ease-out，见 vtEase()）。
     - 点击坐标取 clientX/Y；键盘触发（detail 为 0）时退到按钮中心。
     - 半径取点击点到四角的最远距离，保证圆一定能铺满整屏。
     - 不支持 startViewTransition 时退回 applyTheme 的 360ms 颜色过渡。
     - ⚠️ View Transitions 下不要再加 .hl-theme-transition：新快照在
       过渡刚起步时抓取，颜色可能还是旧的，绽开出来的会是旧主题。 */
  function toggleTheme(e) {
    if (vtRunning) return;
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';

    if (prefersReducedMotion() || typeof document.startViewTransition !== 'function') {
      applyTheme(next, true, true);
      spinThemeIcon();
      return;
    }

    var btn = document.getElementById('hlThemeBtn');
    var x = window.innerWidth / 2;
    var y = 0;
    if (e && e.detail > 0 && (e.clientX || e.clientY)) {
      x = e.clientX;
      y = e.clientY;
    } else if (btn) {
      var rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    var radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    var ease = vtEase();

    /* 只在这次切换期间给 <html> 挂 .hl-vt-theme：
       custom.css 里「关掉根快照默认淡入」的规则都挂在它下面，
       否则会把第 30 段「跨页转场」的 0.2s 交叉淡入一起干掉。
       2026-11-23：它同时关掉全站 transition（第 57b 段 ①），所以必须在 startViewTransition
       **之前**挂上 —— 回调里 data-theme 一变，新颜色就是终值，不会在圆里慢慢过渡。
       圆心坐标写成 CSS 变量，新快照第一帧就裁成圆心处的 0 半径圆（第 57b 段 ②）。 */
    var root = document.documentElement;
    root.style.setProperty('--hl-vt-x', x + 'px');
    root.style.setProperty('--hl-vt-y', y + 'px');
    root.classList.add('hl-vt-theme');
    var seq = ++vtSeq;
    var transition;
    try {
      transition = document.startViewTransition(function () {
        applyTheme(next, true, false);
      });
    } catch (err) {
      root.classList.remove('hl-vt-theme');
      root.style.removeProperty('--hl-vt-x');
      root.style.removeProperty('--hl-vt-y');
      applyTheme(next, true, true);
      spinThemeIcon();
      return;
    }
    vtRunning = true;
    /* 进行中的点击已经被 vtRunning 挡掉；seq 仍保留，防的是别处（比如命令面板）
       意外再起一次过渡时，旧过渡的 finished 把新过渡还在用的类和变量摘掉。 */
    transition.finished.finally(function () {
      if (seq !== vtSeq) return;
      vtRunning = false;
      root.classList.remove('hl-vt-theme');
      root.style.removeProperty('--hl-vt-x');
      root.style.removeProperty('--hl-vt-y');
    }).catch(function () {});

    transition.ready.then(function () {
      /* fill: both —— 开始前就停在 0 半径、结束后停在满屏，两头都不会退回 CSS 的初始圆。
         try：个别浏览器不支持给伪元素做 WAAPI 时，过渡没有动画会立即结束，直接露出新主题。 */
      try {
        root.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
            ]
          },
          {
            duration: 500,
            easing: ease,
            fill: 'both',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      } catch (err) {}
      /* 图标快照单独转一圈：实时 DOM 在过渡期间被快照盖住，
         直接给图标元素加 CSS 动画是看不见的，必须动它自己的快照层。 */
      try {
        root.animate(
          {
            transform: ['rotate(-360deg) scale(0.55)', 'rotate(0deg) scale(1)']
          },
          {
            duration: 550,
            easing: ease,
            fill: 'both',
            pseudoElement: '::view-transition-new(hl-theme-icon)'
          }
        );
      } catch (err) {}
    }).catch(function () {});
  }

  function openRandomPost() {
    loadIndex().then(function (posts) {
      if (!posts.length) return;
      var pick = posts[Math.floor(Math.random() * posts.length)];
      if (pick && pick.url) window.location.href = pick.url;
    });
  }

  /* 「搜索 /」与「深浅色」按钮：2026-11-22 起由 layouts/partials/nav.html 直接输出。
     本文件改成外链 defer 之后，首访要等它下载完才执行；如果还由这里动态插入，
     读者会先看到没有按钮的页头，再看着它被撑宽一截。现在这里只绑定事件，
     找不到静态按钮时（比如 nav.html 被换掉）才退回原来的动态插入。 */
  var nav = document.querySelector('header nav');
  if (nav && !document.getElementById('hlThemeBtn')) {
    var bar = document.createElement('span');
    bar.className = 'hl-toolbar';
    var curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    bar.innerHTML =
      '<button type="button" class="hl-ctrl-btn" id="hlOpenCmdBtn" aria-label="站内搜索">搜索 <span class="hl-kbd">/</span></button>' +
      '<button type="button" class="hl-ctrl-btn" id="hlThemeBtn" aria-label="切换深浅色模式"><span id="hlThemeIcon">' + (curTheme === 'dark' ? ICON_SUN : ICON_MOON) + '</span></button>';
    nav.appendChild(bar);
  }
  var openCmdBtn = document.getElementById('hlOpenCmdBtn');
  var themeToggleBtn = document.getElementById('hlThemeBtn');
  if (openCmdBtn) openCmdBtn.addEventListener('click', openCmd);
  /* 2026-11-23：鼠标停到「搜索」按钮上就开始拉索引（约 61 KB gzip），点下去时多半已经到了。
     只认鼠标悬停（明确的使用意图）；触屏没有悬停、键盘聚焦也不算 —— 仍然遵守
     「别在进页面或聚焦时拉索引」那条约定（MAINTENANCE.md）。失败了打开面板时会自动重试。 */
  if (openCmdBtn) {
    openCmdBtn.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') loadIndex();
    }, { once: true });
  }
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

  // 归档页计数行里的「随机阅读一篇」（2026-11-21 从页脚移过来）
  var archiveRandom = document.getElementById('archive-random');
  if (archiveRandom) {
    archiveRandom.addEventListener('click', function (e) {
      e.preventDefault();
      openRandomPost();
    });
  }

  // 首次加载：把 theme-color / 图标同步到当前 data-theme
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light', false);

  // 命令面板逻辑
  var overlay = document.getElementById('hlCmdOverlay');
  var input = document.getElementById('hlCmdInput');
  var resultsEl = document.getElementById('hlCmdResults');
  var statusEl = document.getElementById('hlCmdStatus');

  /* 2026-11-23：面板底部的快捷键提示按平台显示（HTML 里默认写 ⌘K，非苹果设备改成 Ctrl K）。
     触屏设备整行隐藏（upgrade.css）。 */
  var hintEl = document.getElementById('hlCmdHint');
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
  if (hintEl && !/Mac|iPhone|iPad|iPod/i.test(platform)) hintEl.textContent = '按 / 或 Ctrl K 随时唤起';

  /* 2026-11-23：结果改成先转义再拼 HTML —— 原来标题直接塞进 innerHTML，
     索引里将来要是混进带 < 的文字就会被当成标签。命中的那几个字用 <mark> 标出来。 */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function markHit(text, q) {
    text = String(text || '');
    var i = q ? text.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  /* 右侧胶囊只放得下约 18 个字：命中位置靠后时从命中处前几个字开始截，保证 <mark> 看得见。 */
  function snippet(text, q, max) {
    text = String(text || '');
    var i = text.toLowerCase().indexOf(q);
    var start = i > max - q.length - 2 ? Math.max(0, i - 4) : 0;
    var out = text.slice(start, start + max);
    return (start > 0 ? '…' : '') + out + (start + max < text.length ? '…' : '');
  }

  function renderCmd(posts) {
    var q = (input.value || '').trim().toLowerCase();

    /* 命中优先级：标题 > 章节（h）> 关键词（k）> 引用（d）。
       章节/关键词命中时把命中文本显示在右侧，读者能看出为什么搜到它。
       ⚠️ h 是二/三级标题，k 是 description / 粗体 / 「」短语，两者分开，
          显示时用「章节」和「相关」区分；d 是引用框内容，只做最后一级匹配。 */
    function arrayHit(arr, needle) {
      arr = arr || [];
      for (var i = 0; i < arr.length; i++) {
        var v = arr[i];
        if (v && String(v).toLowerCase().indexOf(needle) !== -1) return String(v);
      }
      return '';
    }

    var matched = [];
    posts.forEach(function (p, idx) {
      var score = 0;
      var hit = '';
      var hitKind = '';
      if (!q) {
        score = 1;
      } else if (p.title && p.title.toLowerCase().indexOf(q) !== -1) {
        score = 4;
      } else if ((hit = arrayHit(p.headings, q))) {
        score = 3;
        hitKind = '章节';
      } else if ((hit = arrayHit(p.keywords, q))) {
        score = 2;
        hitKind = '相关';
      } else if (p.summary && p.summary.toLowerCase().indexOf(q) !== -1) {
        score = 1;
        hitKind = '引用';
        hit = p.summary;
      }
      if (score) matched.push({ p: p, score: score, hit: hit, hitKind: hitKind, idx: idx });
    });

    /* 同分时保留索引里的日期倒序；sort 在旧浏览器不保证稳定，所以显式比 idx。 */
    matched.sort(function (a, b) {
      return b.score - a.score || a.idx - b.idx;
    });

    currentItems = matched.slice(0, 10).map(function (m) {
      var p = m.p;
      var metaHtml = esc(p.date || p.section);
      if (m.hit) {
        metaHtml = esc(m.hitKind + ' · ') + markHit(snippet(m.hit, q, 18), q);
      }
      return {
        label: p.title,
        labelHtml: m.score === 4 ? markHit(p.title, q) : esc(p.title),
        metaHtml: metaHtml,
        url: p.url
      };
    });

    resultsEl.removeAttribute('aria-busy');
    if (indexFailed) {
      currentItems.unshift({ label: '搜索索引加载失败，点这里重试', meta: '重试', action: retryIndex });
    }

    var randomItem = { label: '随机读一篇文章（Surprise me）', meta: '快捷指令', action: openRandomPost };
    var hasRandom = false;
    if (!q || '随机'.indexOf(q) !== -1 || 'random'.indexOf(q) !== -1) {
      currentItems.push(randomItem);
      hasRandom = true;
    }
    if (!q || '深色'.indexOf(q) !== -1 || 'theme'.indexOf(q) !== -1) {
      currentItems.push({ label: '切换浅色 / 深色模式', meta: '主题', action: toggleTheme });
    }

    /* 2026-11-23：一篇都没搜到时不再是死胡同 —— 列出归档 / 地图 / 随机三个去处。
       索引加载失败时 matched 也是空的，上面已经有「重试」那一条，去处照样列出。 */
    var noMatch = !!q && !matched.length;
    if (noMatch) {
      currentItems.push({ label: '去归档页，按分类 / 系列浏览', meta: '归档', url: '/archive/' });
      currentItems.push({ label: '打开网站地图', meta: '地图', url: '/map/' });
      if (!hasRandom) currentItems.push(randomItem);
    }

    if (selectedIdx >= currentItems.length) selectedIdx = 0;

    announce(
      indexFailed ? '搜索索引加载失败，可以选择重试' :
      noMatch ? '没有找到相关文章，列出了其他入口' :
      q ? '找到 ' + matched.length + ' 篇' + (matched.length > 10 ? '，显示前 10 篇' : '') : ''
    );

    if (!currentItems.length) {
      resultsEl.innerHTML = '<li style="padding:14px;text-align:center;color:var(--hl-mute);font-size:13.5px;">没有找到匹配的内容</li>';
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      return;
    }

    resultsEl.innerHTML = '';
    if (noMatch) {
      /* 视觉提示；读屏由上面的 announce() 播报，这里 aria-hidden 免得念两遍。 */
      var empty = document.createElement('li');
      empty.className = 'hl-cmd-empty';
      empty.setAttribute('aria-hidden', 'true');
      empty.textContent = '没有找到「' + (input.value || '').trim() + '」相关的文章，可以试试：';
      resultsEl.appendChild(empty);
    }

    /* 2026-11-23：结果项
       · 文章 / 归档 / 地图是真正的 <a href>：⌘ / Ctrl / Shift 点击、中键、右键「复制链接」、
         悬停看地址都按浏览器原生行为走，悬停时 Speculation Rules 也会预渲染。
         快捷指令（随机 / 深浅色 / 重试）没有地址，仍是 <button>。
       · ARIA 走 APG 的 combobox + listbox：输入框 role=combobox，列表 role=listbox，
         每项 role=option；焦点始终留在输入框，选中项靠 aria-activedescendant 告诉读屏。
         ⚠️ option 的子元素是 presentational，里面不能再嵌可聚焦元素，
            所以 role 直接挂在 <a> / <button> 上，<li> 是 role=none。
       · tabindex=-1：Tab 不会一项一项停在结果上（方向键负责选），<dialog> 的焦点循环不受影响。 */
    currentItems.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.setAttribute('role', 'none');
      var el = document.createElement(item.url ? 'a' : 'button');
      if (item.url) el.href = item.url; else el.type = 'button';
      el.id = 'hlCmdOpt' + idx;
      el.className = 'hl-cmd-item';
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', 'false');
      el.tabIndex = -1;
      el.innerHTML = '<span>' + (item.labelHtml || esc(item.label)) + '</span><span class="hl-tag-pill">' + (item.metaHtml || esc(item.meta)) + '</span>';
      el.addEventListener('click', function (e) {
        if (item.url) {
          /* 带修饰键：交给浏览器开新标签 / 新窗口，面板留着方便接着挑。中键走 auxclick，不经过这里。 */
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          closeCmd();
          return;
        }
        closeCmd();
        item.action();
      });
      /* 鼠标划过就把它设为选中项：悬停与键盘选中共用一个高亮，不会同时亮两条。
         用 pointermove 而不是 pointerenter：列表滚动时项目从静止的指针下滑过，不该抢走键盘选中。 */
      el.addEventListener('pointermove', function () {
        if (selectedIdx !== idx) setSelected(idx, false);
      });
      li.appendChild(el);
      resultsEl.appendChild(li);
    });

    input.setAttribute('aria-expanded', 'true');
    setSelected(selectedIdx, true);
  }

  /* 只改选中态、不重画列表（方向键、悬停都走这里）。scroll 为 true 时把选中项滚进列表可视区（2026-11-21）。
     ⚠️ 只改 resultsEl.scrollTop，不要用 scrollIntoView —— 后者会连
        整个页面一起滚，命令面板是 fixed 覆盖层，背后页面动了很怪。
     ⚠️ 用 getBoundingClientRect 而不是 offsetTop：li 的 offsetParent
        不一定是 resultsEl，offsetTop 在有的浏览器里会算到对话框上。 */
  function setSelected(idx, scroll) {
    var opts = resultsEl.querySelectorAll('.hl-cmd-item');
    if (!opts.length) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    if (idx < 0 || idx >= opts.length) idx = 0;
    selectedIdx = idx;
    for (var i = 0; i < opts.length; i++) {
      var on = i === idx;
      opts[i].classList.toggle('selected', on);
      opts[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    var sel = opts[idx];
    input.setAttribute('aria-activedescendant', sel.id);
    if (!scroll) return;
    var listRect = resultsEl.getBoundingClientRect();
    var itemRect = sel.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      resultsEl.scrollTop -= (listRect.top - itemRect.top);
    } else if (itemRect.bottom > listRect.bottom) {
      resultsEl.scrollTop += (itemRect.bottom - listRect.bottom);
    }
  }

  /* 读屏播报「找到 N 篇」。停手 400ms 再写，免得每敲一个字念一次。 */
  var announceTimer = null;
  function announce(text) {
    if (!statusEl) return;
    if (announceTimer) clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { statusEl.textContent = text; }, 400);
  }

  function resetA11y() {
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    if (announceTimer) clearTimeout(announceTimer);
    if (statusEl) statusEl.textContent = '';
  }

  /* Enter 选中一项：有地址的直接跳；⌘ / Ctrl + Enter 在新标签打开、面板保留。 */
  function activate(item, newTab) {
    if (item.url) {
      if (newTab) {
        window.open(item.url, '_blank', 'noopener');
        return;
      }
      closeCmd();
      window.location.href = item.url;
      return;
    }
    closeCmd();
    item.action();
  }

  /* 2026-11-23：#hlCmdOverlay 是 <dialog>。.open 类继续保留 —— 淡入淡出的 CSS（第 60 段）
     和 :not(.open) 的点击穿透都挂在它上面。不支持 showModal 的旧浏览器只靠这个类显示。 */
  var hasModal = typeof overlay.showModal === 'function';

  function openCmd() {
    overlay.classList.add('open');
    if (hasModal && !overlay.open) overlay.showModal();
    input.value = '';
    selectedIdx = 0;
    if (!indexCache) renderLoading();
    loadIndex().then(renderCmd);
    setTimeout(function () { input.focus(); }, 20);
  }

  function closeCmd() {
    overlay.classList.remove('open');
    if (hasModal && overlay.open) overlay.close();
    resetA11y();
  }

  /* Esc 由 <dialog> 原生处理（不走下面的 keydown），这里把 .open 类同步掉。 */
  overlay.addEventListener('close', function () { overlay.classList.remove('open'); resetA11y(); });

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCmd(); });
  input.addEventListener('input', function () { selectedIdx = 0; loadIndex().then(renderCmd); });

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement ? document.activeElement.tagName : '';
    var isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
    if ((e.key === '/' && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (overlay.classList.contains('open')) closeCmd(); else openCmd();
      return;
    }
    if (!overlay.classList.contains('open')) return;
    /* 2026-11-23：输入法正在组字（拼音选词、回车上屏）时，方向键和回车都归输入法，
       不能拿来选结果 / 跳转。Safari 上那一下回车 isComposing 是 false、keyCode 是 229，两个都要判。 */
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'Escape') {
      closeCmd();
    } else if (e.key === 'ArrowDown' && currentItems.length) {
      e.preventDefault();
      setSelected((selectedIdx + 1) % currentItems.length, true);
    } else if (e.key === 'ArrowUp' && currentItems.length) {
      e.preventDefault();
      setSelected((selectedIdx - 1 + currentItems.length) % currentItems.length, true);
    } else if (e.key === 'Enter' && currentItems[selectedIdx]) {
      e.preventDefault();
      activate(currentItems[selectedIdx], e.metaKey || e.ctrlKey);
    }
  });
})();
