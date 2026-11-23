/**
 * Cloudflare Pages Functions 中间件 —— 订阅源的内容协商 + www 归一（2026-10-15 / 2026-11-21）
 *
 * ⚠️⚠️ 2026-11-23：**这个中间件现在只在三个地址上运行**（static/_routes.json）：
 *     /index.xml   /weekly/index.xml   /stats/*
 *    以前仓库里没有 _routes.json，Pages 会让**每一个请求**（HTML / CSS / 图片 / 分享卡）
 *    都先过一遍 Function：多一跳延迟，还吃每天 10 万次的免费额度。
 *    · www → 根域的 301 因此改由 Cloudflare 后台的 **Redirect Rule** 负责
 *      （配置见 MAINTENANCE.md「部署清单」）；下面那段 www 代码只剩兜底作用 ——
 *      访问 www.hulatu.com/index.xml 时还会走到这里。别删，也别指望它处理别的路径。
 *    · 以后给 Function 加新路由，**必须同时把路径加进 static/_routes.json 的 include**，
 *      否则新函数根本不会被调用（症状：一切照旧、不报错）。
 *
 * ── www → 根域（2026-11-21 新增）────────────────────────────────────
 * `www.hulatu.com` 与根域指向同一个 Pages 项目，但搜索引擎会把两个主机名
 * 当成两份内容，权重被摊薄。这里在边缘做 301，把 www 永久并到根域，
 * 路径、查询串、锚点原样保留：
 *     https://www.hulatu.com/posts/x/?a=1  →  https://hulatu.com/posts/x/?a=1
 *
 * ⚠️ 只处理 GET / HEAD。301 会把 POST 改成 GET，表单提交不能这么干 ——
 *    本站没有表单接口，这个守卫是防以后加东西时踩坑。
 * ⚠️ 只认精确的 `www.hulatu.com`，不认 `*.pages.dev` 预览域和本地
 *    `localhost` —— 否则预览环境会被跳到生产站。
 * ⚠️ 这条规则**依赖 www 也绑定在这个 Pages 项目上**。如果 www 只是 DNS
 *    指向别处（或没开橙云），函数根本不会执行，301 也不会发生。
 *    验证：`curl -sI https://www.hulatu.com/ | head` 应该看到
 *    `HTTP/2 301` 与 `location: https://hulatu.com/`。
 *
 * ── 为什么需要内容协商 ──────────────────────────────────────────────
 * Chromium 正在移除 XSLT，浏览器打开 /index.xml 时会弹
 *   This site uses XSLT; that functionality is being removed from this browser…
 * 等它真移除，那一页就从「设计过的 HTML」退化成一片 raw XML。
 * 旧的实现是 feed 顶部挂一行 <?xml-stylesheet?>，靠浏览器自己渲染。
 *
 * 现在改成在边缘按「谁在请求」分派：
 *   浏览器地址栏导航  → /feed/ 或 /feed/weekly/（站点层生成的 HTML 页）
 *   订阅器 / 抓取器   → 原样返回 /index.xml（纯 RSS 2.0）
 * 两个地址一个字都没变，所以订阅者、聚合站、已经导入的订阅全都不用动。
 *
 * ── 判定逻辑（保守优先）─────────────────────────────────────────────
 * 只认 `Sec-Fetch-Dest: document` —— 这是**现代浏览器顶层导航**才会带的头，
 * 订阅器（Feedly / Inoreader / NetNewsWire / Reeder…）与服务端抓取一律不发。
 * 头不存在时才退回到 `Accept` 以 text/html 开头这个较弱的判据。
 * 判定不成立就 `next()`，也就是原样走静态资源 —— 宁可让浏览器看到 XML，
 * 也不能让订阅器拿到 HTML（后者是静默的、用户察觉不到的故障）。
 *
 * ⚠️ 部署前提：Cloudflare Pages 项目的 **Functions 目录**要是默认的
 *    `functions`（仓库根）。若那里被改过或关了 Functions，本文件不会生效 ——
 *    症状是「一切照旧、横幅还在」，**不会报错**。核对方法见 MAINTENANCE.md。
 * ⚠️ 这两页在 Hugo 侧都设了 noindex；这里再补一个 X-Robots-Tag 兜底，
 *    避免爬虫把 /index.xml 当成一个可索引的 HTML 页。
 * ⚠️ 响应头在代码里显式写：static/_headers 只作用于静态资源，
 *    函数返回的响应不吃那些规则。
 */

const APEX_HOST = 'hulatu.com';
const WWW_HOST = 'www.hulatu.com';

/** feed 地址 → 浏览器视图地址 */
const FEED_VIEWS = new Map([
  ['/index.xml', '/feed/'],
  ['/weekly/index.xml', '/feed/weekly/'],
]);

export async function onRequest(context) {
  const { request, env, next } = context;

  const url = new URL(request.url);

  // www → 根域：只对读请求做，301 永久跳转（权重并到根域）。
  if (url.hostname === WWW_HOST && (request.method === 'GET' || request.method === 'HEAD')) {
    const target = new URL(request.url);
    target.hostname = APEX_HOST;
    return Response.redirect(target.toString(), 301);
  }

  const view = FEED_VIEWS.get(url.pathname);
  if (!view) return next();

  // 只处理读请求；HEAD 也交给静态资源，少一次分支。
  if (request.method !== 'GET') return next();

  if (!isBrowserNavigation(request)) return next();

  // 显式取 index.html，不依赖资源服务器对目录索引的处理。
  // ⚠️ 传的是 **Request 而不是 URL 对象**：Fetcher.fetch 的入参是
  //    `Request | string`，URL 对象在本地 Node 桩测试里直接抛
  //    `TypeError: Invalid URL`（实测踩到过），别改回去。
  const asset = await env.ASSETS.fetch(
    new Request(new URL(`${view}index.html`, url.origin).href, {
      headers: { Accept: 'text/html' },
    })
  );
  // 页面不存在（构建产物变了、路径写错了）就退回 XML —— 有页面才换。
  if (!asset.ok) return next();

  return new Response(asset.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      Vary: 'Accept, Sec-Fetch-Dest',
      'X-Robots-Tag': 'noindex, follow',
    },
  });
}

/**
 * 是不是「浏览器地址栏导航」。
 * @param {Request} request
 * @returns {boolean}
 */
function isBrowserNavigation(request) {
  const dest = request.headers.get('Sec-Fetch-Dest');
  if (dest !== null) return dest === 'document';

  const accept = (request.headers.get('Accept') || '').trim().toLowerCase();
  return accept.startsWith('text/html');
}
