/**
 * 统计脚本的同源代理（2026-11-21 新增）
 *
 * ── 为什么 ────────────────────────────────────────────────────────────
 * GoatCounter 的脚本在 gc.zgo.at、计数端点在 hulatu.goatcounter.com。
 * 两个域名都在主流拦截清单里（uBlock Origin 的 privacy / analytics 列表），
 * 读者装了插件就完全统计不到 —— 而且是静默的，后台只会看到「今天没人来」。
 *
 * 现在改成同源：
 *     /stats/count.js  →  反代 https://gc.zgo.at/count.js
 *     /stats/count     →  反代 https://hulatu.goatcounter.com/count
 * 浏览器只看见 hulatu.com，不触发第三方域名拦截。
 *
 * ── 路由 ──────────────────────────────────────────────────────────────
 * 文件名是 `[[path]].js`（catch-all），同时接住上面两个地址；
 * `params.path` 是路径段数组：`['count.js']` / `['count']`。
 * ⚠️ 不要拆成 `count.js.js` 之类的独立文件 —— Pages Functions 的文件名
 *    映射会把扩展名吃掉，`functions/stats/count.js` 实际对应 `/stats/count`，
 *    接不住 `/stats/count.js`。
 *
 * ── 回退 ──────────────────────────────────────────────────────────────
 * 如果 Functions 被关掉，这两个地址会 404，统计随之失效（页面不报错）。
 * 本站的内容协商（/feed/）本来就依赖 Functions，所以这不是新增的单点。
 * 想临时绕过代理：
 *   1. hugo.toml 的 `[params.analytics] goatcounter` 改回
 *      `https://hulatu.goatcounter.com/count`
 *   2. custom_head.html 里的 `s.src` 改回 `https://gc.zgo.at/count.js`
 *
 * ⚠️ 计数端点必须同时接受 **POST**：count.js 优先用
 *    `navigator.sendBeacon(url)`，那是 POST（body 为空）。只放行 GET 的话，
 *    sendBeacon 仍会返回 true，脚本**不会**退回 <img> 兜底 —— 结果是
 *    请求被 405 吃掉、后台一条记录都没有，而且页面不报错。
 *    所以 /stats/count 放行 GET / HEAD / POST，方法原样转发。
 * ⚠️ 脚本缓存 1 天（边缘 + 浏览器）：GoatCounter 的 count.js 极少变，
 *    真变了最多一天内生效。计数请求 `no-store`，否则会丢 PV。
 */

const SCRIPT_URL = 'https://gc.zgo.at/count.js';
const COUNT_URL = 'https://hulatu.goatcounter.com/count';

export async function onRequest(context) {
  const { request, params } = context;

  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD' && method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD, POST' },
    });
  }

  const path = (params.path || []).join('/');

  if (path === 'count.js') {
    const upstream = await fetch(SCRIPT_URL, {
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });
    if (!upstream.ok) {
      return new Response('', { status: 502 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  if (path === 'count') {
    const target = new URL(COUNT_URL);
    target.search = new URL(request.url).search;

    const upstream = await fetch(target.toString(), {
      method,
      headers: {
        // 转发 Referer / UA：GoatCounter 用它们区分来源与设备，
        // 丢了就只剩「直接访问 / 未知设备」。
        Referer: request.headers.get('Referer') || '',
        'User-Agent': request.headers.get('User-Agent') || '',
        'Content-Type': request.headers.get('Content-Type') || 'text/plain;charset=UTF-8',
      },
      // sendBeacon 的 body 是空的；原样转过去，别改写成 GET。
      body: method === 'POST' ? request.body : undefined,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response('Not Found', { status: 404 });
}
