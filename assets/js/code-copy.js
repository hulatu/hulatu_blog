/* 代码块「复制」按钮（2026-10-11 从旧「印章」主题取回，重写为无依赖版）
 *
 * 做法：**运行时插入按钮**，不覆盖 Hugo 的代码块渲染钩子。
 *   理由：覆盖 `render-codeblock.html` 意味着自己调 `transform.Highlight`
 *   重写整段高亮输出，还要和 `hugo.toml` 的 `noClasses = false` 协调 ——
 *   为「加一个按钮」重写渲染管线，代价远大于收益。
 *   运行时插入的代价是「JS 到达前没有按钮」，但按钮本来就是渐进增强。
 *
 * ⚠️ 只在**含代码块的页面**加载（判断在 partials/code-copy.html 里），
 *    全站 327 页里只有 5 页命中。
 * ⚠️ 类名 `.code-copy` 是与 custom.css 第 18 段的契约，改名要两边一起改。
 * ⚠️ 文案：默认「复制」→ 点击后「**已复制**」→ 1.6 秒回到「复制」。
 *    2026-10-11 当天改过两次：先「已复制」→ 用户要求「显示复制成功」→
 *    收盘时用户又改回「已复制」。**以「已复制」为准**，别再改成「复制成功」。
 *    同一天按钮样式也简化过（去掉边框/圆角，见 custom.css 第 18 段）。
 * ⚠️ 用 `pre.innerText` 取代码而不是 `textContent`：Chromium 输出的是
 *    `<span class="line">` 逐行结构，`innerText` 会按**渲染结果**还原换行；
 *    `textContent` 在某些情况下会把多行挤成一行。
 * ⚠️ 必须保留 `fallback()`：`navigator.clipboard` 只在 **HTTPS / localhost**
 *    下可用（本地 `hugo server` 是 http://localhost，算安全上下文，能用；
 *    但若有人从 file:// 打开或用了 http 域名，clipboard 就是 undefined）。
 */
(function () {
  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        legacy(text, onDone);
      });
      return;
    }
    legacy(text, onDone);
  }

  /* 老办法：临时 textarea + execCommand。已废弃但在所有浏览器里还能用，
     是 clipboard API 失败时唯一的选择。 */
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
      /* 静默失败：不弹 alert。按钮文字不变，用户自然知道没成功。 */
    }
    document.body.removeChild(ta);
  }

  /* 2026-11-23：代码块开了行号（```js {linenos=true}）时，innerText 会把行号一起带走。
     这时改成逐行取 `.cl`（Chroma 的「代码本体」span，每行末尾自带换行），跳过行号 `.ln`。
     没开行号的块照旧用 innerText（原因见文件头）。 */
  function codeText(pre) {
    if (!pre.querySelector('.ln')) return pre.innerText;
    var parts = [];
    pre.querySelectorAll('.cl').forEach(function (el) {
      parts.push(el.textContent);
    });
    return parts.join('');
  }

  function init() {
    var boxes = document.querySelectorAll('div.highlight');
    if (!boxes.length) return;

    /* 2026-10-14：`Array.prototype.forEach.call(boxes, …)` → `boxes.forEach(…)`。
       NodeList.prototype.forEach 是 IE Edge 15+ / Chrome 51+ / Firefox 50+ / Safari 10+
       就有的基线方法，本站的 `IntersectionObserver` / `:has()` / `content-visibility`
       比它新得多 —— 这一层兼容完全是白写的。 */
    boxes.forEach(function (box) {
      /* 已经加过就跳过（防止被重复初始化，例如以后的局部刷新） */
      if (box.querySelector('.code-copy')) return;

      var pre = box.querySelector('pre');
      if (!pre) return;

      /* 2026-11-15：插一条头部条（左语言、右复制）。语言取自
         `<code data-lang="python">`，这是 Chroma 自己写的属性 —— 不用额外配置。
         ⚠️ 为什么不在 CSS 里用 `::before` + `attr(data-lang)` 画角标：
            那个属性在 <code> 上，而 `::before` 只能读**自己元素**的属性；
            画进 <code> 里会挤在第一行代码前面（code 是 block + pre-wrap）。
         ⚠️ 没有语言（`{{< highlight >}}` 不写 lang）时只放复制按钮，条子照样在 ——
            靠 CSS 的 `margin-left: auto` 把按钮推到右边，不用另写一套样式。 */
      var code = box.querySelector('code');
      var lang = code ? (code.getAttribute('data-lang') || '') : '';

      var head = document.createElement('div');
      head.className = 'code-head';
      if (lang) {
        var badge = document.createElement('span');
        badge.className = 'code-lang';
        badge.textContent = lang;
        head.appendChild(badge);
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = '复制';
      btn.setAttribute('aria-label', '复制这段代码');

      var timer = null;
      btn.addEventListener('click', function () {
        copyText(codeText(pre), function () {
          btn.textContent = '已复制';
          /* 2026-11-15：aria-label 必须跟着文字一起换。
             按钮上有一个固定的 aria-label「复制这段代码」，它在无障碍树里
             **覆盖**可见文字 —— 只改 textContent 的话，读屏用户听到的名字
             从头到尾没变过，「已复制」这个唯一的结果反馈就丢了。
             （焦点还停在这个按钮上，改名字会被重新播报。） */
          btn.setAttribute('aria-label', '已复制');
          btn.classList.add('is-done');
          if (timer) clearTimeout(timer);
          timer = setTimeout(function () {
            btn.textContent = '复制';
            btn.setAttribute('aria-label', '复制这段代码');
            btn.classList.remove('is-done');
          }, 1600);
        });
      });

      head.appendChild(btn);
      /* 插在 <pre> **前面**：CSS 里 `.code-head + pre.chroma` 的相邻选择器
         靠的就是这个位置，插错了圆角接不上。 */
      box.insertBefore(head, pre);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
