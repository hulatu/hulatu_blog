/* 脚注就地预览（2026-11-24）
 *
 * 点正文里的脚注编号，就在编号旁边弹出这条脚注，不用跳到文末再跳回来。
 * 只在含脚注的页面加载（判断在 partials/footnote.html），样式在 custom.css 第 71 段。
 *
 * 做法：全页共用一个 <div popover>，打开时把它挪到被点的那个 <sup> 后面，
 *   内容从文末那条 <li id="fn:N"> 抄一份（去掉 ↩︎ 返回链接和 id）。
 *   · Esc 关闭、点别处关闭、只能同时开一个、浮在最上层：都是 Popover 自带的。
 *   · 位置：popover 在顶层，position: absolute 是相对整张页面算的，所以跟着页面一起滚，
 *     不用监听 scroll。默认放在编号下方，下面放不下就翻到上方；左右夹在视口内。
 *   · 弹层在 DOM 里紧跟着编号：键盘用户 Tab 一下就进到脚注里的链接，再 Tab 回到正文，顺序不乱。
 *
 * 悬停预览（2026-11-24 加）：鼠标停在编号上 0.3 秒弹出，移开 0.2 秒后收起；鼠标挪进弹层里不收，
 *   可以点里面的链接、选字。悬停弹出时再点一下编号 = 钉住（移开也不收），再点一次才关。
 *   · 只认鼠标（pointerType === 'mouse'）：触屏点按照旧是「点开 / 再点关」；触摸屏笔记本两种都能用。
 *   · 钉住的弹层开着时，悬停别的编号不会把它换掉；悬停弹出的开着时，悬停另一个编号就换过去。
 *   · 悬停打开不动焦点、读屏不播报 —— 悬停本来就只是给鼠标用户的快捷方式，键盘和读屏走回车。
 *
 * ⚠️ 渐进增强：链接仍是 <a href="#fn:N">。没有 JS、浏览器不支持 Popover、
 *    按住 ⌘ / Ctrl / Shift / Alt 点、中键点 —— 都还是原来的「跳到文末」。
 * ⚠️ 焦点：只有键盘 / 读屏打开（click 的 detail 为 0）时才把焦点移进弹层，关闭后回到编号；
 *    鼠标、触屏打开时焦点不动，免得关的时候把焦点从别处抢回来。
 * ⚠️ 再点一次同一个编号是「关闭」（悬停弹出的是「钉住」）。点编号时浏览器可能先按「点了弹层外面」把它关掉，
 *    所以在 pointerdown 时先记下「按下去那一刻它是不是开着的、是不是钉住的」。
 *    showPopover 传了 source: 编号，新浏览器认得这层关系就不会先关（旧浏览器忽略这个参数，走上面的补救）。
 * ⚠️ 状态（current、aria-expanded）在 beforetoggle 里改，不能放在 toggle 里：toggle 是异步的，
 *    「关 1 开 2」时关 1 的那个 toggle 会在 2 打开之后才到；浏览器还会把同一轮里的
 *    「关 → 开」合并成一个 open → open 的 toggle，关 1 的事件干脆不来。beforetoggle 是同步的、不合并。
 * ⚠️ 抄内容用 innerHTML 上的正则：浏览器序列化出来的属性一律是 name="value" 的形式，
 *    文本里的 < 一律转成 &lt;，所以「标签里的 id="…"」「class 含 footnote-backref 的 <a>」都能可靠地认出来。
 */
(function () {
  var refs = document.querySelectorAll('a.footnote-ref[href^="#fn"]');
  if (!refs.length || !('popover' in HTMLElement.prototype)) return;

  var EDGE = 12; /* 离视口边缘至少留多少 px */
  var GAP = 6; /* 离编号多远 */
  var HOVER_OPEN = 300; /* 鼠标停多久弹出 */
  var HOVER_CLOSE = 200; /* 移开后多久收起：给鼠标从编号挪进弹层留时间（中间隔着 6px） */

  var pop = document.createElement('div');
  pop.className = 'fn-pop';
  pop.setAttribute('popover', 'auto');
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('tabindex', '-1');
  var head = document.createElement('p');
  head.className = 'fn-pop-head';
  head.setAttribute('aria-hidden', 'true');
  var body = document.createElement('div');
  body.className = 'fn-pop-body';
  pop.appendChild(head);
  pop.appendChild(body);

  var current = null; /* 当前是哪个编号打开的 */
  var closedRef = null; /* 刚关掉的那个编号（给 toggle 里补焦点用） */
  var viaKeyboard = false;
  var pinned = false; /* 点开的、或悬停弹出后又点了一下的 = 钉住：鼠标移开不收 */
  var downWhileOpen = false;
  var downPinned = false;
  var openTimer = null;
  var closeTimer = null;

  function isOpen() {
    return pop.matches(':popover-open');
  }

  function cancelOpen() {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(function () {
      closeTimer = null;
      if (isOpen() && !pinned) pop.hidePopover();
    }, HOVER_CLOSE);
  }

  function noteHTML(li) {
    return li.innerHTML
      .replace(/(?:&nbsp;|\s)*<a\b[^>]*\bclass="[^"]*\bfootnote-backref\b[^"]*"[^>]*>[\s\S]*?<\/a>/g, '')
      .replace(/(<[^>]*?)\sid="[^"]*"/g, '$1');
  }

  function place() {
    if (!current) return;
    var r = current.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var w = pop.offsetWidth;
    var h = pop.offsetHeight;
    var left = Math.max(EDGE, Math.min(r.left + r.width / 2 - w / 2, vw - EDGE - w));
    var top = r.bottom + GAP;
    var side = 'below';
    if (top + h > vh - EDGE && r.top - GAP - h >= EDGE) {
      top = r.top - GAP - h;
      side = 'above';
    }
    pop.style.left = left + window.scrollX + 'px';
    pop.style.top = top + window.scrollY + 'px';
    pop.setAttribute('data-side', side);
  }

  function open(ref, li, keyboard, pin) {
    cancelOpen();
    cancelClose();
    if (isOpen()) pop.hidePopover();
    var sup = ref.parentNode;
    sup.parentNode.insertBefore(pop, sup.nextSibling);
    var n = ref.textContent.trim();
    head.textContent = '注 ' + n;
    pop.setAttribute('aria-label', '脚注 ' + n);
    body.innerHTML = noteHTML(li);
    current = ref;
    viaKeyboard = keyboard;
    pinned = pin;
    ref.setAttribute('aria-expanded', 'true');
    pop.showPopover({ source: ref });
    place();
    if (keyboard) pop.focus({ preventScroll: true });
  }

  pop.addEventListener('beforetoggle', function (e) {
    if (e.newState !== 'closed' || !current) return;
    closedRef = current;
    current = null;
    pinned = false;
    cancelOpen();
    cancelClose();
    closedRef.setAttribute('aria-expanded', 'false');
  });

  /* 鼠标从编号挪进弹层：取消收起；从弹层移出：没钉住就收起。按着键（在弹层里拖选文字）时移出不收。 */
  pop.addEventListener('pointerenter', cancelClose);
  pop.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse' && !pinned && !e.buttons) scheduleClose();
  });

  /* 浏览器会把焦点还给打开前聚焦的元素；没还（焦点掉到 body）时自己补一下。 */
  pop.addEventListener('toggle', function () {
    var ref = closedRef;
    closedRef = null;
    if (!ref || isOpen() || !viaKeyboard) return;
    if (!document.activeElement || document.activeElement === document.body) ref.focus({ preventScroll: true });
  });

  /* Tab 出弹层（到了弹层和编号以外的地方）就收起来。
     等焦点真的移走了再关：focusout 那一刻关的话，浏览器会以为焦点还在弹层里，把它还给编号。 */
  pop.addEventListener('focusout', function (e) {
    var to = e.relatedTarget;
    if (!to || pop.contains(to) || to === current) return;
    setTimeout(function () {
      var a = document.activeElement;
      if (isOpen() && !pop.contains(a) && a !== current) pop.hidePopover();
    }, 0);
  });

  window.addEventListener('resize', function () {
    if (isOpen()) place();
  });

  refs.forEach(function (ref) {
    var id = decodeURIComponent(ref.getAttribute('href').slice(1));
    var li = document.getElementById(id);
    if (!li) return;
    ref.setAttribute('aria-expanded', 'false');
    ref.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      cancelClose();
      cancelOpen();
      if (isOpen() && (current === ref || pinned)) return;
      openTimer = setTimeout(function () {
        openTimer = null;
        if (isOpen() && pinned) return;
        open(ref, li, false, false);
      }, HOVER_OPEN);
    });
    ref.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      cancelOpen();
      if (isOpen() && current === ref && !pinned) scheduleClose();
    });
    ref.addEventListener('pointerdown', function () {
      downWhileOpen = isOpen() && current === ref;
      downPinned = downWhileOpen && pinned;
    });
    ref.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      var keyboard = e.detail === 0;
      var openNow = isOpen() && current === ref;
      var byPointer = !keyboard && downWhileOpen;
      var wasOpen = byPointer || openNow;
      var wasPinned = byPointer ? downPinned : openNow && pinned;
      downWhileOpen = false;
      cancelOpen();
      if (wasOpen && wasPinned) {
        if (isOpen()) pop.hidePopover();
        return;
      }
      /* 悬停弹出的：这一下是「钉住」。还开着就原地钉住，被浏览器先关掉了就重新打开。 */
      if (wasOpen && openNow) {
        cancelClose();
        pinned = true;
        if (keyboard) {
          viaKeyboard = true;
          pop.focus({ preventScroll: true });
        }
        return;
      }
      open(ref, li, keyboard, true);
    });
  });
})();
