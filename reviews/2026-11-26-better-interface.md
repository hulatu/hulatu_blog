# better-interface 审查 —— hulatu.com

日期：2026-11-26 ｜ 力度：full ｜ 结论：**Approve**（0 条 HIGH）

## 范围与覆盖

**范围**：全站界面，主走三条入口路径 —— 首页 → 文章页 → 文末/目录；页头工具 → 命令面板（搜索）；关于页 → 相册拼贴 → 图片放大层。含空态（搜索无结果、搜索索引加载失败）、错误态（复制失败）、窄屏与深浅色两套外观。

**技术栈**：Hugo 0.170 静态站；无框架 CSS，`theme.css`（上游镜像）+ `custom.css`（站点补丁）+ `upgrade.css`（`--hl-*` 升级包）按序拼成一份 `main.min.<hash>.css`；原生 JS 拼成 `site.min.<hash>.js`；断点只有 480 / 800 / 1200；深浅色走 `<html data-theme>` 手动切换。

**项目约定文档**：找到 `DESIGN.md`（设计真值，第 0 节是唯一的现状表）、`MAINTENANCE.md`、`README.md`。没有 `CONTRIBUTING.md` / `AGENTS.md` / Storybook / ADR。下文所有「After」都按这套分层写：上游 `theme.css` → 站点 `custom.css` → `.hl-*` 的 `upgrade.css`。

**边界**：未审 giscus 第三方 iframe 内部、Cloudflare 边缘行为（除下表里那条邮件地址混淆）、RSS 阅读视图。

**运行环境限制**：ego-browser 只装在 Mac 上，本会话的 shell 是隔离 Linux 环境，跑不了真正的浏览器。所以判断基于：源码逐行、`public/` 里已构建的 408 个 HTML（注意这份是 `hugo server` 产出的 dev 构建，canonical 是 localhost，结构可对照、URL 不可引用）、以及线上 hulatu.com 抓取到的文本。**凡是需要看渲染结果的检查都标了 Not verified**，没有拿源码冒充渲染证据。

| 领域 | 检查的证据 | 结果 |
| --- | --- | --- |
| Accessibility | 全站 408 页静态扫描（alt、可访问名、重复 id、tabindex、表单标签、h1 数量、标题跳级、`aria-hidden` 包可聚焦）+ `baseof/nav/single/404/photo-collage` + `palette/motion/toc/hello` | 2 条 MEDIUM |
| Layout | 三档断点、`.table-wrap`、`.chart`、`div.toc`、相册 `aspect-ratio`、`touch-action`、`100vw/100vh`、`dvh` | 2 条 MEDIUM |
| Writing | 界面文案、空态、错误态、404、页脚、复制反馈 | 1 条 MEDIUM、2 条 LOW |
| Typography | 字号阶梯、行高、`text-wrap`、tabular-nums、`user-select`、标点 | 1 条 MEDIUM、1 条 LOW |
| Colors | 浅/深 9 个 token 的 16 组前景/背景对，逐一计算 | Clear（最低 4.35 的那对没有被任何文字实际使用） |
| UI | 焦点描边、圆角、图标 `currentColor`、`overscroll-behavior`、悬停门控 | 1 条 LOW |
| Motion | 全站动效的 `prefers-reduced-motion` 门控、时长/缓动、按下缩放、跨页转场 | Clear |

## 发现

| 严重度 | 领域 | 位置 | Before | After | 为什么 |
| --- | --- | --- | --- | --- | --- |
| MEDIUM | Writing | `assets/js/hello.js:42`、`assets/js/code-copy.js:47` | 复制失败时完全静默，按钮外形不变 | 失败时把按钮文字换成「复制失败，请手动选中」，或用已有的 `role="status"` 念一句 | 这是「错误没有出路」：clipboard 被拒、非 HTTPS、iframe 内都会走到这里，按了没反应会被当成按钮坏了 |
| MEDIUM | Layout | `assets/css/custom.css:2553`（配 `custom.css:989`、`upgrade.css:180`、`custom.css:2259`） | `* { scrollbar-width: none }` + `::-webkit-scrollbar { width: 0 }`，搜索结果为 320px 封顶、6 个页面上的 10 张表格、浮动目录都能滚但都没有滚动条，也没有渐隐 | 把隐藏限定在 `html` 上；或给这三个容器加 `.chart:1558` 已经写好的 24px 渐隐 `mask-image` | 滚动条是「右边/下面还有内容」的唯一提示；现在只剩被切一半的单元格当线索，看起来更像渲染坏了 |
| MEDIUM | Accessibility | `layouts/shortcodes/photo-collage.html:118` + `assets/js/motion.js:269` | `aria-pressed="true"` 的按钮，`aria-label` 在「关闭相册音效 / 开启相册音效」之间随状态切换 | 可访问名固定为「相册音效」，状态只交给 `aria-pressed`（可见文字「音效 开/关」不变） | 切换按钮的可访问名描述动作、`aria-pressed` 又描述状态，读屏会念「关闭相册音效，已按下」，两句话互相矛盾 |
| MEDIUM | Layout | `assets/css/custom.css:5036` | `.hl-collage-item { touch-action: none }` 常驻 | 只在拖动真正开始后收窄（`pointerdown` 再加），或改 `touch-action: pan-y` 让纵向滚动交还浏览器 | 手指落在照片上时纵向滚动被吃掉；相册在手机上约 180–200px 高，读者得换位置重新起手才能继续往下翻 |
| MEDIUM | Accessibility | `assets/css/upgrade.css:170` | `.hl-cmd-input { outline: none }`，面板里没有 `:focus` / `:focus-within` 兜底 | 删掉 `outline: none`，或给 `.hl-cmd-input-wrap:focus-within` 加 00d 段那条 2px `--link-color` 环 | 全站只有这一个可聚焦控件退出了统一焦点描边（`custom.css:71`）；键盘用户从浏览器 chrome 回到面板时，唯一提示是那个光标（有光标，所以按 2.4.7 判 MEDIUM 而不是 HIGH） |
| MEDIUM | Typography | `assets/css/upgrade.css:83` | `.hl-tag-pill { font-size: 0.76em }`，父级 14px → 实测 10.64px | `0.86em`（12px），或 `0.8rem` | 低于 12px 下限，还是等宽字；搜索结果的日期 / 栏目是最需要一眼扫到的元信息 |
| LOW | Writing | 线上 `/about/` 与页脚（Cloudflare Email Obfuscation，仓库里没有对应配置） | 线上输出 `[问候](/cdn-cgi/l/email-protection#…)`，卡片里的地址被换成 `[email protected]` | 在 Cloudflare 关掉邮件地址混淆；或地址不进 HTML，只留 `data-email` 由按钮复制 | 服务端把地址改写了，无 JS 时读者看到占位符，「复制链接地址」拿到的是 `/cdn-cgi/` 串。有 JS 时 CF 的脚本会解回来，所以只是 LOW |
| LOW | UI | `assets/css/custom.css`（49 条 `:hover`，1 条门控）、`upgrade.css`（4 / 0）、`theme.css`（5 / 0） | `.tool:hover .tool-icon`、`.code-copy:hover`、`.toc-nav a:hover::before` 等直接悬停 | 包进 `@media (hover: hover)`；触屏专用规则已经在 `(hover: none)` 里，两者不冲突 | 触屏点按后 `:hover` 会粘住，颜色停在被点亮的状态，看起来像选中。没有隐藏内容，所以只是观感 |
| LOW | Typography | `layouts/partials/footer.html:34` | `… <a>隐私</a>. … <a>开往</a>. … <a>虫洞</a>.`，同一行前面用的是全角「，」 | 统一成全角「。」 | 一句里混用全角逗号和半角句点，中文标点读起来是断的 |
| LOW | Writing | `content/posts/利用微信那双小眼睛（小微）做点什么.md:37`、`content/weekly/胡拉图的周刊-第23期.md:76` | `![完整回复.webp](…)`、`![Paper 录用.webp](…)`，alt 是文件名 | 改成图在说什么，如「公众号后台的完整回复截图」 | 读屏会把「点 webp」念出来。扫描到的 401 张图里只有这 2 张是文件名 |

上限 15 条，未截断。

## 验证

**跑过的检查**

- 408 个 HTML 静态扫描（BeautifulSoup）：`img` 缺 `alt` 0 处、按钮无可访问名 0 处、链接无文本 0 处、`tabindex` 正值 0 处、`target=_blank` 缺 `noopener` 0 处、`aria-hidden` 包住可聚焦元素 0 处、重复 id 0 处、标题跳级 0 处、`<html lang>` / `<title>` 齐全 408/408。命中的只有两类：`/style/` 里 3 个 disabled 的示例 checkbox（禁用控件，豁免）、相册 16 张图没有 `width/height`（外层用 `aspect-ratio: var(--ar)` 预留版面，不是 CLS）。
- 对比度：用 `--hl-*` 两套 token 算了 16 组对。最低的一组是浅色 `--hl-mute` 压在 `--hl-bg-hover` 上 = 4.35，查遍用法后确认没有文字直接落在这一对上（搜索选中行里那颗 pill 自带 `--hl-bg-subtle` 底，4.55，过 4.5），所以不构成失败。
- `prefers-reduced-motion`：`custom.css` 里 20 处以上显式门控，`motion.js:103/155/301`、`palette.js:152` 三处 JS 动效全部有 `reduce` 分支，跨页转场包在 `no-preference` 里。Clear。
- 焦点：全局 `a/button/summary` 的 `:focus-visible` 2px 描边；TOC 折叠态靠 `toc.js:43` 的 `focusin` + Tab 判定展开，键盘进得去也读得到；图片放大用原生 Popover + `autofocus` 关闭按钮。
- 搜索面板：`<dialog>` + `showModal()`、combobox + `aria-activedescendant` + `aria-selected`、`role=status` 播报条数、结果项是 `<a>` 可 ⌘/中键、输入法组字时不响应方向键。
- 线上抓取 `/` 与 `/about/`：结构、文案、目录、相册都与源码一致；同时发现邮件地址被服务端改写（发现表第 7 条）。

**Not verified（没有浏览器，不能声称看过）**

- 320px 重排、200% 缩放下的实际断行与溢出；
- 深浅色两套的实际观感与切换动效（View Transition 的圆形绽开）；
- 每一处 `:focus-visible` 描边是否真的画得出来（例如 TOC 折叠态下 `overflow: hidden` 有没有裁掉）；
- 相册 `touch-action: none` 在真机上的手感（结论来自声明语义，不是实测）；
- 屏幕阅读器实际播报（VoiceOver / NVDA）；
- 任何性能数字。

## 结论

**Approve** —— 没有 HIGH，没有阻塞项。这条结论只覆盖上表里标了「已检查」的七个领域（`Colors` 与 `Motion` 是 Clear）；六条 MEDIUM 建议排进下一轮，不用为它们停下发布。四条 LOW 可随手改。

如果要补上渲染层的检查（320px、深色、真实焦点环、真机触屏），在 Mac 终端起一个 `ego-browser` 会话，我再跑一轮，把上面的 Not verified 逐条填掉。
