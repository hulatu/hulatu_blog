# 给 Claude Code 的抓图任务

把这份文件交给 Claude Code（在 `~/Blog` 里启动），它照着跑就行。

## 背景

一份 better-interface 审查（`reviews/2026-11-26-better-interface.md`）已经把源码、构建产物和静态扫描跑完了，结论 Approve，6 条 MEDIUM / 4 条 LOW。剩下七项需要真实渲染才能结案，报告里标的是 `Not verified`：

1. 320px 下断行与横向溢出
2. 长文里的表格与图片在窄屏的实际表现
3. 关于页相册在手机上的高度、照片被压到多小
4. 深色两套外观有没有串色
5. 搜索面板输入框到底有没有焦点提示（对应 MEDIUM：`upgrade.css:170` 的 `outline: none`）
6. Tab 进桌面折叠目录时，2px 焦点描边有没有被 `overflow: hidden` 裁掉
7. （顺带）320px 下页头导航折行是否正常

## 怎么做

先跑 `ego-browser skill`，按它打印的用法确认这个版本 `nodejs` 子命令暴露的对象/方法名（下面脚本按 Playwright 风格写：`page.setViewportSize` / `page.goto` / `page.locator` / `page.screenshot`）。**如果对不上，按打印出来的 API 改写，不要硬套。**

要求：

- 输出目录 `~/Blog/reviews/shots/`
- 全部只读访问 hulatu.com，不登录、不提交任何表单
- 主题靠 `localStorage['hl-theme']` 切换（站点不跟 `prefers-color-scheme` 走），所以要先 `goto` → 写 localStorage → `reload`
- 每张之间留 ~700ms，等字体和主题落定
- 单张失败不要中断整批，打 `FAIL <名字> <原因>` 继续
- 跑完把「哪张成功、哪张失败、失败原因」原样报回来

## 脚本

```bash
mkdir -p ~/Blog/reviews/shots && ego-browser nodejs <<'EOF'
const base = 'https://hulatu.com';
const out = '/Users/hulatu/Blog/reviews/shots';
const post = base + '/posts/2026/11/20/eating-and-drinking-fun-stories/';

async function shot(name, url, { width, height, dark, action, fullPage } = {}) {
  try {
    await page.setViewportSize({ width: width || 1440, height: height || 900 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(t => localStorage.setItem('hl-theme', t), dark ? 'dark' : 'light');
    await page.reload({ waitUntil: 'networkidle' });
    if (action) await action();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: !!fullPage });
    console.log('ok', name);
  } catch (e) { console.log('FAIL', name, e.message); }
}

await shot('320-home', base + '/', { width: 320, height: 720 });
await shot('320-post', post, { width: 320, height: 720 });
await shot('320-post-full', post, { width: 320, height: 720, fullPage: true });
await shot('320-about-collage', base + '/about/', { width: 320, height: 720, action: async () => {
  await page.locator('.hl-collage').scrollIntoViewIfNeeded();
}});
await shot('1440-post-dark', post, { width: 1440, height: 900, dark: true });
await shot('1440-search', base + '/', { width: 1440, height: 900, action: async () => {
  await page.click('#hlOpenCmdBtn');
  await page.keyboard.type('跑');
}});
await shot('1440-toc-focus', post, { width: 1440, height: 900, action: async () => {
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
}});
EOF
```

## 可选：真机触屏

第 3 条（`touch-action: none` 挡住页面滚动）只能在真机或真实触摸模拟里看。如果 ego-browser 支持 touch emulation，额外验一次：在 320px 下用触摸手势从相册正中往上滑，看页面是否滚动、照片是否被拖动。结论写进 `reviews/2026-11-26-better-interface.md` 的验证节。
