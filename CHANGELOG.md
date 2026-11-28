# 变更记录 —— hulatu.com

> README / MAINTENANCE / DESIGN 只写**现状**；「什么时候改了什么、删过什么、为什么别加回来」都收在这里。
> 要取回任何删掉的文件：`git log --diff-filter=D --name-only` 定位提交，再 `git show <提交>^:<路径>`。别凭记忆重写。

## 时间线

| 日期 | 改了什么 |
| --- | --- |
| 2026-11-28 | 周刊导读卡片：每个标签后加全角冒号（`本周观察：` / `本周在用：` / `值得一读：` / `一句话想法：`），并去掉标签与正文之间的 flex gap，冒号后直接接正文；标签渲染在 `layouts/partials/weekly-brief.html`，间距在 `custom.css` 第 53 段，31 期统一生效 |
| 2026-11-28 | 周刊文末引导合并：31 期 `.weekly-outro-tip` 的「订阅 + 留言」句与「来信聊聊你最近思考的东西和小发现」合成一句，并用 `<br>` 拆成两行（订阅 / 留言在上，来信邀请在下）；写信用 `mail-link` shortcode（主题「周刊来信」），位置仍在正文末尾原来的订阅句处；模板里的 `.weekly-letter` 块和 CSS 删除，避免重复。改动文件：`content/weekly/*.md`（31 期）、`layouts/_default/single.html`、`assets/css/custom.css`、DESIGN / MAINTENANCE |
| 2026-11-28 | 首页加回「精选文章」入口（`recent-posts-head-row` 右侧，数据仍只有 `data/featured.yaml`）；页头搜索按钮改为**单个放大镜**，深浅色改为无边框月亮 / 太阳图标，两者都是 28×28、透明底、hover 浅底。`/` 与 `⌘K` 快捷键仍可用，提示只在 `title` / `aria-keyshortcuts` 里，不再显示键位框。`palette.js` 的兜底 markup 同步；`custom.css` 第 00e 段删掉已失效的 `.hl-kbd` 隐藏规则并让窄屏工具栏靠右，按钮过渡去掉 `border-color`。改动文件：`layouts/index.html`、`layouts/partials/nav.html`、`assets/js/palette.js`、`assets/css/upgrade.css`、`assets/css/custom.css`、DESIGN / MAINTENANCE / README |
| 2026-11-27 | 首页去两处：① 去掉身份条数字句「文章 N 篇，周刊 N 篇，运行 N 天」——`content/_index.md` 不再调用 `{{< home-stats >}}`，shortcode 文件保留但未使用（要恢复就在简介后加回）。② 去掉「最近更新：」右侧的「精选文章」入口；`/featured/` 页面仍在，只是首页不再放入口。CSS 删除 `.featured-entry` 规则，保留 `.recent-posts-head-row` 容器避免标题边距变化。改动文件：`content/_index.md`、`layouts/index.html`、`assets/css/custom.css`、DESIGN / MAINTENANCE |
| 2026-11-27 | 文章页减三层信息：① **可见面包屑移除**，`partials/breadcrumbs.html` 只保留 `BreadcrumbList` JSON-LD；分类入口并进文末 `.post-taxonomy`（「分类：」+ 三级灰，周刊跳过与栏目名重复的「周刊」）。② byline 去掉「全文约 N 字」，只留日期、更新、阅读时长。③ 周刊导读卡去掉重复的阅读时间，来信引导移到文末（仅周刊，复用 `hello.html` 浮层）。CSS 第 13 段由面包屑规则改成分类/标签行规则，打印隐藏列表去掉 `.breadcrumbs`；新增 `.weekly-letter`。改动文件：`layouts/partials/breadcrumbs.html`、`layouts/_default/single.html`、`layouts/partials/weekly-brief.html`、`assets/css/custom.css`、DESIGN / MAINTENANCE / README |
| 2026-11-27 | 周刊导读卡片末尾加来信引导：「欢迎来信聊聊你最近思考的东西和小发现。写信给我」，复用 `partials/hello.html` 的邮箱浮层（mailto 主题「周刊来信」）；样式 `.weekly-brief-letter` 用虚线分隔、三级灰、0.86rem。改动文件：`layouts/partials/weekly-brief.html`、`assets/css/custom.css` |
| 2026-11-27 | 阅读体验按少数派重排（实测 sspai `/post/119563`）：正文 **18/1.5 → 17px / 1.8（30.6px）**，段距 **27 → 32px**，正文列 **720 → 680px**；标题阶 **30/24/20/19/18/16 → 38/32/24/20/18/16**（600；h1 行高 1.2、h2–h6 1.4；h2 上 56 下 32、h3 上 48 下 32）；≤480px 正文 16 / 段距 28 / h1 32 / h2 26 / h3 22。圆角收成四档（图片·行内代码 4 / 卡片·按钮 8 / 代码块·引用框·大浮层 12 / 胶囊 999），阴影只留浮层并把 `--hl-shadow` 减淡（问候卡改用令牌）。代码块行高 1.6、上下距由 `.highlight` 接管 32；表格行高 1.5；归档列表钉回 1.5。连带修三处按旧宽度写死的数：热力图列宽（53×10+52×3=686 会横溢，间距 3→2.5）、TOC 展开宽度改读 `--width-max`、图片 `sizes` 媒体阈值 760→720。主题副本偏离 4→6（新增列宽、代码块圆角两项；行高原在册，值改为 1.8），`style.html` 同步。改动文件：`assets/css/theme.css`、`themes/hugo-bearneo/layouts/partials/style.html`、`custom.css`、`upgrade.css`、`render-image.html`、`content/style.md`、`content/map.md`、`hugo.toml`、`layouts/index.html`、DESIGN / MAINTENANCE / README |
| 2026-11-25 | 终端新建文章自动打开补全：`~/.config/zsh/.zshrc` 新增同名 `hugo()` 包装函数，`hugo new content …` / `hugo new posts/…` 建完后解析 `Content "<路径>" created` 并用 `open` 走系统默认 Markdown 应用（`hugo new site` / `new theme` 不打开，`hugo server` 等其余子命令原样透传；找不到 hugo 时退回 `/opt/homebrew/bin/hugo`）；`hn()` 改为委托 `new "posts/$*"`，避免和包装函数叠着打开两次。README / MAINTENANCE 的「新建文章」补上两种写法。原 `.zshrc` 备份为 `.zshrc.bak-newopen-20261125-223016` |
| 2026-11-25 | 相册拼贴放大精修：重新启用 View Transition，从缩略图位置长到全屏；放大层加 8px 白色相框、6px 圆角、柔和投影、14px 毛玻璃背景和照片说明（alt），竖图按 82vh 给说明留空间；Esc / 点背景关闭，拖动仍不误开。`motion.js` 第 5 段按缩略图 `naturalWidth / naturalHeight` 写 `--zw / --zh`，overlay 加 `image-zoom-container`。音效不变。改动文件：`layouts/shortcodes/photo-collage.html`、`custom.css` 第 72 段、`assets/js/motion.js` 第 5 段 |
| 2026-11-25 | 相册拼贴加点击放大 + 音效：照片/邮票包 `image-zoom-label` + 原生 Popover，放大源 1200px（邮票 600px），点击才下载；拖动超过 4px 的那次 click 在捕获阶段拦掉，拖完不会误开。Web Audio 合成 `pick` / `drop` / `zoom` / `close`，画布下方「拖动摆放 · 点击放大」+「音效 开/关」，选择存 `localStorage`。视频仍悬停播放。⚠️ 去掉 `.hl-collage` 的 `container-type: inline-size`：实测它和顶层 Popover 一起会把页面卡死；邮票字号改成固定 7 / 4px。改动文件：`layouts/shortcodes/photo-collage.html`、`custom.css` 第 72 段、`assets/js/motion.js` 第 5/6 段 |
| 2026-11-25 | 相册拼贴精简：按 720px 画布重出素材（图片 360/280→240/160、quality 82→78；视频 600px/8s→300px/5s、CRF 35；封面 JPG→WebP）；视频从自动播放改悬停播放，悬停前不发视频请求；删掉彩虹光晕（DOM 少 18 个 mix-blend 层）。视频由 `motion.js` 按 `canPlayType` 只选 MP4 或 WebM 之一。实测首屏 18 张图约 157 KB、无媒体请求；两段视频悬停后各下一次，合计约 75 KB；总资源约 231 KB（原 720–850 KB，Chromium 双格式时 1.18 MB）。改动文件：`custom.css` 第 72 段、`assets/js/motion.js` 第 6 段、`layouts/shortcodes/photo-collage.html`、`data/photo-collage.yaml`、`static/media/collage/*` |
| 2026-11-25 | 关于页自我介绍之后加相册拼贴：宽度随正文、比例 1040:520 的点阵画布，18 个元素（8 张个人照片、2 段循环视频、3 枚齿孔邮票、5 个占位图）；可拖动（位置写回百分比，窗口缩放不错位）、鼠标彩虹光晕、胶片噪点、视频进入视口才播放；小屏整块隐藏。新增 `data/photo-collage.yaml`、`layouts/shortcodes/photo-collage.html`、`static/media/collage/*`；改 `content/about.md`、`custom.css` 第 72 段、`assets/js/motion.js` 第 6 段。当天按用户要求从 1040px 全幅收回到正文宽度（`width: 100%`），删掉 `main` / `html` 的 overflow 放开规则 |
| 2026-11-24 | 脚注加悬停预览：鼠标停在编号上 0.3 秒弹出，移开 0.2 秒后收起；鼠标挪进弹层不收（可以点链接、拖选文字）；悬停弹出时点一下 = 钉住，再点才关。只认鼠标，触屏仍是点开 / 再点关；钉住的弹层开着时悬停别的编号不替换。悬停打开不动焦点。`showPopover` 带上 `source: 编号`，认得的浏览器点编号时不会先把弹层关掉；不认得的浏览器里「钉住」那一下会先关再开、淡入重播一次。改动文件：`assets/js/footnote.js`、`custom.css` 第 71 段（注释）、`content/style.md` |
| 2026-11-24 | 中英文自动间距加回：`main { text-autospace: normal }`（custom.css 第 43 段），汉字紧贴英文 / 数字时浏览器自己留约 2px；代码、按键、公式、Mermaid 图里不加。三家浏览器初始值都是 `no-autospace`，必须显式写；Chrome 只认 `normal`。手打的空格（约 4300 处）照旧，紧贴的约 400 处现在也有一点间距。2026-10-11 那次删掉时的「没效果」没查到原因；这次在本机浏览器里实测已生效（宽度对比）。顺带删掉第 02 段那半截说「正确写法是 ideograph-alpha」的旧注释（Chrome 不认这个值）。`/style/`「中文排版」加一句故意不加空格的样例 |
| 2026-11-24 | 脚注就地预览：点正文里的脚注编号，在编号旁边弹出这条脚注（原生 Popover：Esc / 点别处关闭、只开一个），再点一次收起；默认在下方，放不下翻到上方，跟着页面滚。键盘 / 读屏打开时焦点进弹层、关闭回到编号，鼠标打开焦点不动。⌘ / Ctrl / 中键点、没有 JS、浏览器不支持 Popover 时仍是原来的跳到文末。触屏上编号命中区撑到 44px。只在含脚注的 3 页加载。新增 `assets/js/footnote.js`、`partials/footnote.html`、`custom.css` 第 71 段；改 `baseof.html`、`content/style.md`（脚注样例补第二条、说明更新） |
| 2026-11-24 | ① **修 11-23 中文换行带出来的回归**：带自定义标题的提示框（`> [!NOTE] 2026 年 11 月补记` + 换行 + 正文）整段正文被并进了标题、正文为空 —— Hugo 按渲染后 HTML 的第一个换行切标题，cjk 扩展把两个汉字之间的换行去掉了。两篇文章中招（Twikoo 评论系统、PaperMod 仿 BearBlog），`/style/` 三条。`render-blockquote.html` 发现「标题 ≠ 源文件标题、且以它开头」时，回到 `.Page.RawContent` 把标题和正文各自重新渲染；文章本身一个字没改。② 设了列对齐的表头也补 `scope="col"`（原来只认裸 `<th>`，漏 11 个），跑步页表头 6 个也补上。③ 图片 `![alt](src "标题")` 写了标题时图注用标题；alt 和标题都空时不再输出空 `<figcaption>`。④ 站内链接可以写成 `.md` 文件名（`[地图](map.md)`），构建时换成正式网址；找不到时构建日志报 WARN。`/style/` 补了样例。改动文件：`_markup/render-blockquote.html`、`_markup/render-image.html`、`_markup/render-link.html`、`_default/single.html`、`_default/run.html`、`content/style.md`、`hugo.toml`（注释） |
| 2026-11-23 | 补齐 Markdown 扩展：① 数学公式 —— passthrough 扩展 + 新钩子 `_markup/render-passthrough.html`，`transform.ToMath` 在构建期渲染成 MathML，零 JS、零 CSS、不连 CDN；行内 `\( … \)`，独立成行 `$$ … $$` / `\[ … \]`；**没开行内 `$ … $`**（构建期 KaTeX 没法可靠转义正文里的 `$`）；写错时构建失败并报位置。② Mermaid —— 新钩子 `_markup/render-codeblock-mermaid.html` 输出 `pre.mermaid` 并记标记，`single.html` 有标记才加载；本体 11.17.2 放在 `assets/js/vendor/mermaid.min.js`（3.6 MB，gzip 约 1 MB，不再连 jsDelivr），`assets/js/mermaid-init.js` 浅深各画一份、按 `data-theme` 显示；front matter 的 `mermaid: true` 不再读（全站没人写过）。原来上游写法 ```` ```mermaid ```` 其实画不出来：没有代码块钩子时它被当成普通代码高亮。③ `==高亮==`（extras 只开 mark；下标、上标、插入不开，理由写在 `hugo.toml`）。④ 可折叠提示框 `> [!TIP]-` / `+`：外层仍是 blockquote，里面套 `<details>`。⑤ 任务列表：主题的 `margin-left: -25.5px` 与第 02b 段的自绘圆点叠在一起，复选框压着圆点、往左探出正文，现在放进圆点的位置。⑥ 代码行高亮 / 行号配样式，`lineNumbersInTable = false`，复制按钮跳过行号。⑦ 定义列表、`<kbd>` 配样式。`/style/` 全部补了样例。改动文件：`hugo.toml`、`_default/single.html`、`_markup/render-blockquote.html`、`custom.css` 第 70 段、`code-copy.js`、`content/style.md`；新增 `_markup/render-passthrough.html`、`_markup/render-codeblock-mermaid.html`、`partials/mermaid.html`、`assets/js/mermaid-init.js`、`assets/js/vendor/mermaid.min.js` |
| 2026-11-23 | 中文显示四处：① `hugo.toml` 开 Goldmark cjk 扩展（`eastAsianLineBreaks`，simple 规则），段内折行写的两个汉字之间不再多出空格（全站 26 处，12 处在《为何很多人重启，从跑步开始》；换行前是全角 ？！ 的 6 处仍有空格）；没用 css3draft，它会把第 17 期周刊里 12 行「英文标题 + 换行 + 中文」粘在一起；② 22 篇文章 / 周刊里链接与全角标点之间手打的空格删掉（42 处，含第 12 期一处链接文字末尾的空格），只删空格、一个字没改；③ 第 30 期周刊表格里的 `vsub 视频.mp4 --burn` 放进行内代码 —— 原来 `--` 被排版扩展换成了短破折号，照抄命令会失败；④ `/style/` 补「中文排版」一节（折行、链接贴标点、`--` 放代码）、删除线、嵌套引用、列对齐表格，图片改成正文实际用的 Markdown 写法，脚注说明改成现在的 16px 二级灰。⚠️ 这批一次改了 23 篇，`sync-lastmod.py` 会按批量保险一篇都不刷并告警 —— 是预期的，这些文章不该显示「更新于」。改动文件：`hugo.toml`、`content/style.md`、`content/posts` 11 篇、`content/weekly` 12 篇 |
| 2026-11-23 | 动效打磨七处：① 懒加载图片等 `img.decode()` 完成再淡入（原来一下载完就淡，手机上前半段淡的是空白），占位色延迟到图片不透明后才撤，淡入 0.28s → 0.32s；② 触屏按压 `scale: .96` 加过渡，按下 0.08s、松开 0.18s 回弹（原来两头都是瞬间跳）；③ 折叠块展开 0.26s / 收起 0.18s（原来都是 0.22s ease）；④ 列表 ↔ 文章标题过渡：新旧快照 0.14s 内交叉淡化完，防两层字重影；⑤ 目录横线从 `width` 过渡改成 `scale: .75 1` ↔ `1`，外观不变、不再触发布局；⑥ Firefox 深浅色退回路径只过渡 3 个属性、换成同一条缓动；⑦ 全站缓动收成 `--hl-ease-out` `(.33,1,.68,1)` / `--hl-ease-in` `(.32,0,.67,0)` 两个令牌（新增第 69 段），原来的 `(0.2,0.8,0.2,1)` ×6、`(0.16,1,0.3,1)`、`(0.4,0,0.2,1)` 全部替换；提示条、邮箱卡、搜索面板、图片放大改为退场比进场短约 1/3 且用 ease-in；`palette.js` 的绽开缓动改为读 `--hl-ease-out`。改动文件：`custom.css`、`assets/js/motion.js`、`assets/js/palette.js` |
| 2026-11-23 | 黑白切换的圆形绽开与图标旋转改用 easeOutCubic `cubic-bezier(.33,1,.68,1)`（`palette.js` 常量 `VT_EASE`），时长不变（500 / 550ms）。原来的 ease-in-out `(.645,.045,.355,1)` 前 100ms 圆半径只到约 5%，点下去像没反应；现在 100ms 到约 49%、200ms 约 78%、300ms 约 93%，后段慢慢铺满（同日先试过 `(.22,1,.36,1)`，前段太冲，换成这条）。Firefox 退回路径的 `.hl-theme-spin` 是三段关键帧，没跟着改 |
| 2026-11-23 | 黑白切换去抖（用户反馈「切换会抖」）：① 圆形绽开期间关掉全站 transition —— 新快照是实时画面，`upgrade.css` 里 `html, body` 常驻的 0.2s 背景 / 文字色过渡让圆里先露出旧颜色、0.2s 后才翻过来，按钮等自带颜色过渡的元素也慢半拍；原来只关了 `a`（第 63 段那条已删，并入第 57b 段）。② 新快照第一帧由 CSS 先裁成圆心处的 0 半径圆（`--hl-vt-x` / `--hl-vt-y`），图标第一帧先是 0.55 倍，WAAPI 加 `fill: both`，消掉开头可能闪一帧满屏新主题、图标先跳一下的问题。③ 绽开进行中再点击直接忽略，不再让浏览器跳过当前过渡、画面从半圆跳到满屏。时长和缓动（500ms、`cubic-bezier(.645,.045,.355,1)`）不变。改动文件：`assets/js/palette.js`、`custom.css` 第 57b / 57c / 63 段 |
| 2026-11-23 | `/tools/` 加两个可选字段（按用户要求，这一页不再「只引到 GitHub」）：`url` → 「打开 ↗」在线版入口，目前只有文章分发台（`https://publish.hulatu.com`，地址取自《分享 3 个开源工具》一文）；`kind` → 介绍下面一行灰字的工具类型，五条都已填（网页应用 / 浏览器脚本 · 需 Tampermonkey 等扩展 ×3 / macOS 终端脚本）。整卡点击仍进 GitHub；「打开」用 `z-index: 1` 浮在铺满层之上，悬停它时整卡悬停态让开。改动文件：`data/tools.yaml`、`layouts/_default/tools.html`、`custom.css` 第 41 段 |
| 2026-11-23 | `/tools/` 三处：① 整张卡片可点 —— 原来悬停整卡图标变蓝、实际只有右侧「GitHub ↗」能点，现在 `.tool-repo::after` 铺满卡片（每条仍只有一个链接，Tab 只停一次），悬停 / 键盘聚焦时图标与链接同时变蓝；② 五个链接补 `aria-label`（「GitHub 仓库：工具名（在新窗口打开）」），`↗` 改 `aria-hidden`；③ `tools.md` 的 description 与导语去掉写死的「五个」。改动文件：`layouts/_default/tools.html`、`custom.css` 第 41 段、`content/tools.md`。分享卡只由标题和日期决定（`scripts/gen-og.js`），改 description 不影响 |
| 2026-11-23 | 细节四条：搜索框占位文字「...」→「…」；页脚第一行的 ✉️🔒🚇🌀🗺️ 包 `<span aria-hidden="true">`，读屏不再念出 emoji 名；返回顶部按钮外观不变，触屏下用透明 `::after` 把命中区撑到 44px（custom.css 第 16 段，与第 00e 段同一做法）；`button` / `summary` / `.back-top` / `.heading-anchor` / `.hl-cmd-item` 加 `touch-action: manipulation`，快速连点不触发双击缩放。改动文件：`custom_body.html`、`footer.html`、`custom.css` |
| 2026-11-23 | 搜索面板按 Web Interface Guidelines 审查修了 8 处：输入框 15 → 16px（iOS 聚焦不再放大整页）；`keydown` 加输入法组字守卫（`isComposing` / `keyCode 229`），拼音选词的回车不再误跳；结果从 `<button>` 改成 `<a href>`（⌘ / 中键新标签、悬停预渲染，`⌘/Ctrl+Enter` 新标签）；补 combobox + listbox ARIA 与 `role=status` 篇数播报；删 `.hl-cmd-item:hover`，悬停同步为选中项，不再同时亮两条；列表 `overscroll-behavior: contain`；没搜到时给出归档 / 地图 / 随机三个去处；底部快捷键提示按平台显示、触屏隐藏。另外两篇「投喂文献」的腾讯视频 iframe 补 `title`、去掉无效的 `autoplay` / `muted` 属性，16:9 容器从 `padding-bottom: 56.25%` 改成 `aspect-ratio`。改动文件：`assets/js/palette.js`、`assets/css/upgrade.css`、`layouts/partials/custom_body.html`、两篇 content |
| 2026-11-23 | MAINTENANCE 验收清单第 5、9 条重写：第 5 条改按 `<main id=main>` 取正文、检查文末三选一（系列带 / 相关文章 / 上一篇下一篇恰好一块）、归档新入口 `.archive-browse`、`/roll/` 四个分组标签与页面标题，期望值从 content 的 series 字段算；第 9 条改读外置的 `/css/main.min.*.css`，并加「每页都引用它」的检查。两条都用 2026-11-23 的产物跑通，并做过反向测试 |
| 2026-11-23 | 兜底分享图换新：旧的 `static/images/share.webp`（左侧红条、居中文字，已作废的旧设计）删除，改成 `gen-og.js` 生成的 `static/images/share.png`（与文章卡同版式同配色：站名 + 「记录思考、分享日常、观察生活」），`hugo.toml` 的 `params.images` 同步改名。换文件名而不是覆盖，是为了绕开 `/images/*` 的 30 天缓存 |
| 2026-11-23 | 分享卡配色统一到升级包：`scripts/gen-og.js` 的底 / 墨 / 灰 / 线从主题原值 `#fdfdfd` / `#1a1a1a` / `#6e6e6e` / `#d0d7de` 改成 `--hl-bg` `#FCFCFA` / `--hl-ink` `#111315` / `--hl-mute` `#6B7280` / `--hl-hair` `#E5E7EB`；版式不变。SVG 变了缓存键就变，下次 `publish.sh` 自动重画全部分享卡 |
| 2026-11-23 | DESIGN 第 5 节「站点层偏离」大表重写：按覆盖 / 新增模板 / 钩子 / partial / 短代码 / 资源分成六张表，只写现状；补登 17 个漏登的文件；修正 6 处与代码不符的描述（custom_head 不再内联升级包样式、gen-og 三级灰是 #6e6e6e、页脚是中文、opengraph 两份都调 og-image、header 是覆盖不是新增、去掉 /now/）。原表整张搬到本文件末尾 |
| 2026-11-23 | 文档第二轮精简：DESIGN / MAINTENANCE 去掉行内日期标注，纯历史段落搬到本文件末尾「历史备忘」；修正几处与产物不符的说明（/roll/ 有标题、上一篇/下一篇是兜底、导航 weight、noindex 页数）|
| 2026-11-23 | 仓库清理：删掉未挂载的首页代表作（`layouts/shortcodes/projects.html`、`data/projects.toml`）；`data/image-dims.json` / `image-colors.json` 去掉 10 / 2 条无人引用的记录；清理 `.DS_Store` 与 `__pycache__`；文档里的历史说明集中搬到本文件，MAINTENANCE 验收清单的期望值按当天构建更新；给 Twikoo、PaperMod 两篇旧教程加了「补记」提示框 |
| 2026-11-21 | 新增 `/style/` 样式样本与 `/map/` 站点地图（`/colophon/` 并入并 301）；关于页加写作统计与 365 天热力图；首页固定「最新一期周刊」，精选入口移到「最近更新」同一行；`/featured/` 改成三组主编导读 |
| 2026-11-15 | 恢复 ≤1200px 的正文顶部折叠目录 |
| 2026-11-07 | 新增 `/wechat/` 公众号二维码页（`noindex`）；首页平台入口加了 X |
| 2026-11-05 | 新增 `/featured/` 精选页（`layout: "featured"`，与 `/series/` 同一套做法） |
| 2026-11-03 | 关于页撤掉「内容平台」一节（入口只留首页那一行）；「上一篇 / 下一篇」只给非系列文章；词条页与 `/weekly/` 不再挂搜索框 |
| 2026-11-02 | 删除手机端折叠目录（2026-11-15 已恢复） |
| 2026-10-26 | 分类词条页开放索引 |
| 2026-10-25 | 首页 `Hi!` 从 h2 升到 h1、`Recent Posts:` 升到 h2（与 h1 不跳级） |
| 2026-10-15 | **浏览器打开 RSS 换了实现**：Chromium 正在移除 XSLT，所以撤掉 `static/rss.xsl` 与 feed 顶部的 `<?xml-stylesheet?>`，改由 `functions/_middleware.js` 内容协商到 `/feed/` 与 `/feed/weekly/` |
| 2026-10-14 | 加载速率审计并全部实施：新增 `partials/seo_tags.html`（删掉 `keywords` 与不生效的微数据，改按页型输出 JSON-LD）、图片放大换成不重复 `<img>` 的方案。首页全页 gzip 5941 → 5082 B，全站 `<img>` 节点 644 → 323 |
| 2026-10-13 | 移除 `issue`（周刊期号）字段；删掉 PWA 五件套图标 |
| 2026-10-12 | **四个子站（run / shot / share / profile）全部下线**，`sites/` 与 `scripts/build-subdomains.sh` 从仓库删除；导航撤掉 `Hub`，内容并入 `/about/` 与 `/run/` |
| 2026-10-11 | 周刊回到导航；`links.md` 删除、友链并入 `roll.md`；`/donate/` 搬回；清理 125 张按 slug 分的 og 图，改成全站一张 `share.webp` |
| 2026-10-10 | 整站从**自建主题**迁移到上游 hugo-bearneo；主题文件逐字节未改，站点特有内容全部走 `layouts/` 覆盖 |

> 更早的历史：`git log --all`。

## 删除记录（从各文档搬来，原文保留）

### 子站下线、迁移孤儿与 rss.xsl（原 MAINTENANCE.md 第 1 节）

> ⚠️ **2026-10-12：四个子站（run / profile / shot / share）全部下线，`sites/` 目录已从仓库整体删除。**
> - `profile` 的内容平台一节并入本站 `/about/`；跑步页并入本站 `/run/`；
>   `shot` / `share` **本来就是空壳**（各 2 个 `_index.md`、合计 <300 B、零篇实际内容），无需迁移。
> - 一并删掉的还有 `scripts/build-subdomains.sh`、`resources/`（旧主题图片处理缓存）、
>   `sync-garmin.yml` 的 `file_pattern` 里的 `sites/profile/data/run_summary.json`
>   （留着会让每日 git-auto-commit 报错）、`cleanup-junk.sh` 与 `deploy.sh` 里的 `find sites`。
> - ⚠️ `sites/README.md`（子站搭建细则：设计令牌表、Cloudflare Pages 配置、页头页脚约定）
>   **没有迁移到别处**，需要时 `git show <commit>:sites/README.md`。
> - ⚠️ 要整体恢复子站：`git log --all -- sites/` 定位删除那次提交逐文件取回
>   （删除前另有本地快照 `/tmp/blog-backup/subdomains-*.tar.gz`，只是临时的）。

> ⚠️ **2026-10-11 清掉的「迁移孤儿」**（自建主题时代遗留，删前逐个核对过零引用）：
> `static/images/og/`（125 张按 slug 的分享图）、`static/images/media/`（71 张封面）、
> `static/images/avatar.webp`、`data/media.json`、`data/image_dims.json`，以及 4 个失效脚本
> `sync-douban.py` / `gen-og.js` / `css-critical-coverage.py` / `fetch-image-dims.py`，
> 加仓库根的工作产物共约 8.2 MB。**要恢复任何一个都从 git 历史取**
> （`git log --diff-filter=D --name-only`），别凭记忆重写。
>
> ⚠️ **2026-10-15 删掉的**：`static/rss.xsl`（连带 `static/_headers` 里那条 `/rss.xsl` 规则）。
> 它服务的是「浏览器打开 `/index.xml` 时用 XSLT 渲染成一页 HTML」这个方案，随 Chromium 移除
> XSLT 整体撤掉，改由 `/feed/` 两页 + `functions/_middleware.js` 承担（见第 2 节「边缘函数」）。
> ⚠️ **别加回来** —— 加回来横幅就跟着回来；真要取：`git show <旧提交>:static/rss.xsl`。

> 补注（2026-11-23）：上面 2026-10-11 那条里列的 `gen-og.js` 后来随按 slug 分享卡方案重新写过，现在的 `scripts/gen-og.js` 在用（`publish.sh` 调用），别按这条把它删掉。

### publish.sh 里撤掉的步骤

⚠️ 2026-10-11 删掉了原来排最前的 `fetch-image-dims.py`（脚本也删了）—— 它抓的 `data/image_dims.json` 上游模板根本不读，**别照旧文档加回来**。注意它与现在在用的 `sync-image-dims.py` **不是同一个东西**（后者喂的是站点层 `render-image.html`，键名 `image-dims.json`）。
⚠️ 2026-10-12 删掉了 `fetch-profile-content.py`（随 profile 子站一起删）—— 它刷的「花园页」快照已不存在。

```bash
# ⚠️ 2026-10-11：这里原本还跑一句 `scripts/fetch-image-dims.py`（抓远程图尺寸到
#     data/image_dims.json，让 <img> 带上 width/height 避免加载时页面往下跳）。
#     那一步**已经整个删掉了**，连带脚本和 data/image_dims.json 一起 —— 因为上游
#     hugo-bearneo 的 render-image.html 根本不读那个文件，写了也进不去 <img>。
#     实测过 CLS ≈ 0（三个图片最多的页面：0 / 0 / 0.0087），本来也没在抖。
#     **别照旧文档把它加回来。**
  # ⚠️ 2026-10-12：这里原本还跑一句 `scripts/fetch-profile-content.py`（刷新
  #     profile.hulatu.com「花园页」的最新文章 / 精选瞬间快照）。那个子站已按用户
  #     要求**整体删除**（内容并入主站 `/about/`），脚本也一起删了 ——
  #     **别照旧文档把它加回来**。同日稍后四个子站（run / shot / share / profile）
  #     全部下线，仓库里连 `sites/` 目录都没有了。
  #
```

### 每日重建 workflow（原 MAINTENANCE.md 第 2 节 CI）

- ~~`.github/workflows/daily-rebuild.yml`~~ **2026-11-22 删除**：它每天 00:10 调 Deploy Hook 重建，和 `sync-garmin.yml` 每天的自动提交（workflow 里「记录本次同步」一步无论 Garmin 成败都写 `runs.json` 的 `checked` → 必有提交 → CF 必构建；Garmin 失败时 job 照样标红通知）重复；过去 60 天每天都有提交。⚠️ 因此**每日重建现在靠 `sync-garmin.yml`**：停掉它、改 cron、或删掉「记录本次同步」那一步，首页「运行 N 天」、写作天数、热力图就会停在最后一次构建。⚠️ 公开仓库连续 60 天无提交会被 GitHub 停用 schedule —— 有了每日自动提交，这条不会触发。

### 验收清单第 10 条（原 MAINTENANCE.md 第 7 节）

> ⚠️ 原第 10 条「子站页头 / 导航 / 视觉残留」整段断言 **2026-10-12 删除** ——
> 它遍历 `sites/*/public/**/*.html`，而四个子站已全部下线。要恢复子站时连同那段断言
> 一起从 git 历史取回（`git log --all -- MAINTENANCE.md`）。

### 子站（原 DESIGN.md）

⚠️ **四个子站已全部下线，`sites/` 已从仓库删除**（`run` / `shot` / `share` / `profile`）。
`profile` 的内容并入 `/about/`，`run` 的跑步页并入 `/run/`；`shot` / `share` 本来就是空壳。
`scripts/build-subdomains.sh` 与 `sites/README.md` 也一并删除 —— 需要追溯就用 `git log --diff-filter=D`。
当前主站不依赖任何子站。

### 首页 Now 与代表作（原 DESIGN.md 第 4 节）

- **2026-11-21 的 Now 与代表作都已按用户要求移除**：Now 曾短暂放在周刊下方，
  随后整块删除（`shortcodes/now.html`、`partials/now-line.html`、front matter `now` 均已删）；
  `{{< projects >}}` 也未挂载，`layouts/shortcodes/projects.html` 与 `data/projects.toml`
  还在，加回一行即可恢复。

> 2026-11-23：`projects.html` 与 `data/projects.toml` 也已删除。

### 归档页搜索框（原 DESIGN.md 第 5 节）

| 文件 | 说明 | 原因 |
| --- | --- | --- |
| `layouts/partials/search-box.html`（**已删除**） | 2026-10-26 新增的归档页搜索框 + 过滤脚本，2026-11-03 起只在 `/archive/` 使用；**2026-11-21 晚彻底删除**，连同 `postSearch` 参数与 CSS 47 段的 `.search-hit` 高亮。恢复需从 git 历史取回 | 同一段脚本原本在 `_default/list.html` 与 `_default/archive.html` **各抄一份**，只差计数文案。删除后全站搜索只剩 `custom_body.html` 的命令面板。见 8.7 |

### CI 注释（原 .github/workflows/build.yml）

```yaml
# ⚠️ 2026-10-12：**四个子站（run / shot / share / profile）全部下线** ——
#    仓库里的 `sites/` 目录与 `scripts/build-subdomains.sh` 已整体删除
#    （profile 内容并入主站 `/about/`，跑步页并入主站 `/run/`，
#     shot / share 本来就是空壳）。所以这里不再有「构建子站」那一步。
#    要恢复：`git log --all -- sites/` 能取回全部源码。
# ⚠️ 2026-11-15：统一到 **0.170.0**，同时**删掉了 `extended: true` 与那条 extended 校验**。
#    0.170 起 Hugo 取消了 extended 版（LibSass 移除，只剩单一二进制），
#    `hugo version` 不再带 extended 字样，留着那条 grep 会让升级当天直接红灯。
#    本站没用过 Sass / imageConfig，extended 一直是零收益的包袱。
```

### DESIGN.md 原 front matter 描述（2026-10-10 重写时的说明）

```yaml
  ⚠️ 2026-10-10 晚**整份重写**。本站的视觉体系**不再是自建的「纸账 + 印章」系统** ——
  那一天整站迁移到了上游 hugo-bearneo 主题（`themes/hugo-bearneo/`，27 个文件）。
  ⚠️ **2026-10-14 起不再是「27 个文件逐字节未改」**：`style.html` 是 `assets/css/theme.css`
  的镜像，两处同步，做过四处登记过的改动 —— ① `content { line-height }` 最终 1.5；
  ② 删掉未启用的 upvote 三组规则与两个 `--upvoted-color` 变量（2026-11-03，省 ~260B/页）；
  ③ visited 链接色与 link 同色（2026-11-21，去掉紫色）；
  ④ 深色 `prefers-color-scheme` 改成 `[data-theme="dark"]`（2026-11-21，手动深浅色开关）。
  其余 26 个文件仍与上游逐字节一致（`diff -r` 可验）。改上游一律在第 5 节登记。
  自建的 6 个 CSS 模块 / 6 个 JS 全部删除。
  ⚠️ **2026-11-06 起 CSS 不再内联**：主题 CSS 与站点补丁 CSS 抽成外部文件，
  由 `layouts/partials/custom_head.html` 里的管道拼成一个带内容哈希的文件
  `/css/main.min.<hash>.css`（体积见 MAINTENANCE.md 第 0 节自动区块），全站共用、
  浏览器长缓存（`static/_headers` 里 `/css/*` 写 1 年 + immutable）。
  主题 CSS 的真值在 `assets/css/theme.css`（复制自
  `themes/hugo-bearneo/layouts/partials/style.html`，含上面四处登记过的改动；
  行高与复制源保持同步）；
  站点补丁的真值在 `assets/css/custom.css`（段号与注释原样保留）。
  本文件里的「第 N 段」一律指 `assets/css/custom.css` 第 N 段。
  所以下面登记的令牌**全部是上游主题的真值**，唯一真值在
  `assets/css/theme.css`（不再是主题文件本身 —— 主题文件现在只是复制源）。
  站点层只做了最小偏离（文件数见 MAINTENANCE.md 第 0 节），逐条列在正文「站点层偏离」一节。
  **改样式前先读那一节**：绝大多数视觉问题应该在上游那一份里改，
  而不是在站点层再叠一层规则 —— 那是上一版自建主题最后变得无法维护的原因。
```

## 历史备忘（2026-11-23 从 DESIGN / MAINTENANCE 正文搬来，原文保留）

> 正文里零散的行内日期标注（「（2026-11-21）」「2026-10-17 起」这类）是直接删掉的，没有逐条搬来；
> 要追溯某一行是什么时候改的，用 `git log -p -- DESIGN.md` 或 `git blame`。

### 导航：Hub 项与子站入口（原 DESIGN.md 第 4 节「导航」）

⚠️ **2026-10-12 撤掉了原来的 `Hub` 项**（`https://profile.hulatu.com/`，个人主页子站，
2026-10-11 加、weight 15 卡在 `Home` 右侧）。用户要求「子站入口只留在 `/about/`」，
所以导航里不再有跨站外链 —— **7 项全是本站页面**。`Now` 已于 2026-11-02 按用户要求删除，旧地址 301 到 `/about/`。
（`RSS` 指向 `/index.xml`，同样不是 `http(s)` 开头、同样不参与 `externalLinksNewTab`。）
⚠️ **同一天稍后 `profile.hulatu.com` 的子站被整体删除**（用户要求「把 Hub 去掉」），
内容并入 `/about/`；**同日再晚一点 `run` / `shot` / `share` 三个子站也一并下线、
`sites/` 目录整体从仓库删除**（见第 4 节「子站」）—— 所以「主站与子站导航差一项」
这类问题现在**已经不存在了**：全站只剩主站一份 `[[menu.main]]`，当前 7 项。

### 友链页 /links/（原 DESIGN.md 第 4 节「导航」）

⚠️ **`/links/` 这一页已经删除**（2026-10-11）：旧地址 `/links/` 与更早的 `/friends/`
**都 301 到 `/roll/`**（见 `static/_redirects`）。**别再拆回两页** —— 用户已经用一次合并
否掉了「两份清单互不重叠」那套说法。

### 导航 weight 旧说明（原 DESIGN.md，数值已过时）

`Weekly` 的 weight 是 **45**（卡在 `Links` 40 与 `Posts` 50 之间），
所以它必然落在 `Posts` **左边** —— 2026-10-11 用户要求的位置。
（原来的 `Hub` 靠 weight **15** 卡在 `Home` 10 与 `About` 20 之间，2026-10-12 已删。）

### 首页身份条第二轮（原 DESIGN.md「首页身份条」）

- 2026-11-20 第二轮：初版是 0.85em 三级灰 + `<br>` 独立一行，用户要求
  「正常显示、连起来」，于是删掉 `.home-stats` 样式和换行，现在就是普通正文。
  **别再给它加样式或分割线。**

### 关于页「关于本机」卡片（原 DESIGN.md「关于页介绍块」）

**2026-11-21**：当天曾加过 `{{< about-mac >}}`「关于本机」卡片，随后**按用户要求移除**：
`content/about.md` 的调用、`layouts/shortcodes/about-mac.html` 与 `.hl-mac-*` 样式
均已删除。正文重新从「大家好」开始，第一个元素是普通段落；「全站没有头像」这条不变。

### 关于页首元素外边距（原 DESIGN.md「关于页介绍块」）

- 首尾元素的 16px 外边距：2026-10-11 去掉页面标题时，介绍块是首元素，上边距会折叠穿透；
  2026-11-21 标题恢复后，介绍块回到标题下方，这条不再适用。
  ⚠️ 别为了「消掉它」再加 `content > :first-child { margin-top: 0 }`：
  那条规则 2026-10-11 已删，它会把首行顶到导航栏下面（见第 5 节第 ③ 条规矩）。

### 关于页标题的反复（原 DESIGN.md「关于页介绍块」）

- **页面标题 2026-11-21 起恢复显示**：用户要求 `/about/` `/roll/` 与文章页 / 周刊页一致，
  两页不再写 `hideTitle: true`。此前 2026-10-11 曾照 yinji 把标题整行藏掉
  （理由：导航已经在指示位置）；现在标题由站点层 `single.html` 正常输出 `<h1>`。
  `hideTitle` 开关仍保留，供 `/contact-qq/`、`/contact-wechat/` 等极简页使用。

### 关于页章节结构的演变（原 DESIGN.md「关于页章节结构」）

`/about/` 现在是**全站唯一的人物页** —— 原来那个独立子站 `profile.hulatu.com`（导航里叫 `Hub`）
2026-10-12 被用户要求**整体删除**，内容并到这里。

- **2026-10-12 只并了一项**：`## 内容平台`（公众号 / 少数派 / 即刻 / Telegram），插在「联系我」之后。
  用户明确只选了这一项 —— Hub 的工具栈、项目列表、数字花园、书影音**都没有并进来**
  （其中「数字花园」那张域名表连同子站一起消失了）。
- **2026-11-03 这一节又撤掉了**：首页已经有一行平台入口
  （公众号 / 少数派 / 知乎 / 即刻），关于页再列一遍既重复、集合还不一致
  （关于页多 X / Telegram，首页多知乎）。用户要求「保留首页那一行，关于页的去除」，
  于是 `## 内容平台` 整节删除 —— X / Telegram / 关于页那份公众号二维码链接也随之消失，
  平台入口**只在首页**。
- 「联系我」原有 QQ / Gmail / WeChat 三个渠道。**2026-11-20 起 QQ 与 WeChat
  分别指向 `/contact/qq/` 与 `/contact/wechat/`**（见下面「联系页」一节），
  Gmail 仍是 mailto。
- **「博客导览」里那条「花园」入口已删**（它指向的就是被删掉的子站），导语也跟着去掉
  「以及我另外维护的两个站点」那半句。现在那一节**全是站内链接**。
- 顺带撤掉了一条跨站外链：`content/privacy.md` 的适用域名列表去掉了 `profile.hulatu.com`
  （只剩 `hulatu.com` / `run.` / `shot.` / `share.`）。

### /roll/ 分组方式的历史（原 DESIGN.md「收藏 /roll/」）

  历史：2026-10-11 曾用「## 朋友 / ## 博客聚合平台」，随后照 yinji 删成平铺；
  2026-10-11 晚用裸 `<hr>` 分隔；2026-11-21 换成现在的标签，**不是 `##`**。

### 跑步子站（原 DESIGN.md「跑步 /run/」）

⚠️ 子站 `sites/run` **2026-10-12 晚已随全部子站一起删除**（下线前它只剩一条
`/* → https://hulatu.com/run/ 301`）。配合 Cloudflare 侧撤掉 CNAME，
`run.hulatu.com` 现在**既不解析、也没有内容**。要让旧域名重新跳过来，需要重建
CNAME + 一条 301（重建子站项目，或在 Cloudflare 配 Bulk Redirect）。

### 归档页搜索框移除（原 DESIGN.md「归档与周刊」）

**2026-11-21 起搜索框全部移除**（用户要求）：归档页的 `search-box.html`、`postSearch`
参数与 CSS 高亮样式**已彻底删除**（不是隐藏）；全站搜索走 `⌘K` / `/` 命令面板。

### 命令面板旁的旧搜索框与旧快捷键（原 DESIGN.md「全局命令面板」）

- `/archive/` 原来那份页内搜索框 2026-11-21 晚**已彻底删除**（partial、`postSearch`
  参数、CSS 47 段的高亮规则都没了），恢复要从 git 历史取回。
  ⚠️ 如果哪天再加输入框，记得补回 `/` 的 `typing` 守卫。
- ⚠️ `baseof.html` 里原来那份「`/` 跳 `/archive/#search-input`」的脚本已删；
  别再加第二份 `keydown` —— 两处同时监听会一次开两个面板，或面板打开后页面又跳走。

### 上一篇/下一篇何时不渲染（原 DESIGN.md「文章页」）

- **2026-11-03 起，系列文章不渲染这一块**（2026-11-21 起「有相关文章」也不渲染）：
  系列带已经给了组内上一篇/下一篇，再出一组同名的「时间线前后」会让读者分不清
  两个「上一篇」。`.post-series + .post-nav` 那条「相邻时去边框」的规则随之删除。

### 上一篇/下一篇的反复（原 DESIGN.md「文章页」）

- ⚠️ 历史：文末「上一篇 / 下一篇」2026-10-05 曾整条删过一次（当时的理由是它和相关文章
  `if/else` 互斥、从没渲染过）。2026-10-11 用户要求加回来，与系列带并存；
  **2026-11-03 又收了一次**；**2026-11-21 起彻底退成第三优先级**——
  只要前面有系列带或相关文章，这一块就不渲染。当前全站 143 篇长文里 0 篇用到它，
  它只是「既没有系列、也没有相关文章」时的兜底，别因为「看不到」就删掉。

### 页脚移除随机与搜索入口（原 DESIGN.md「页脚」）

- 「随机读一篇」**2026-11-21 已从页脚移除**，改到 `/archive/` 的计数行
  （「共 143 篇，随机阅读一篇。」）。⚠️ 别在 `footer.html` 或 `custom_body.html`
  里再加页脚按钮 —— 用户明确要求只保留归档页那一个入口。
- 「搜索」入口 **2026-11-21 晚已按用户要求从页脚移除**（原来落到 `/archive/#search-input`）。
  站内搜索只保留 `⌘K` / `/` 命令面板与导航右侧的「搜索 /」按钮，**别再加回页脚**。

### 站内搜索（原 DESIGN.md 8.7）

**2026-11-21 起站内搜索只剩全局命令面板**（`partials/custom_body.html`）：
`⌘K` / `/` 呼出，`/archive/` 顶部的输入框**已彻底删除**（partial、`postSearch`
参数、CSS 47 段一并移除，恢复需从 git 历史取回）。

### 已知缺口：/media/（原 DESIGN.md 第 7 节）

3. **`/media/`（书影音）仍是已删除状态**：要恢复得同时取回页面模板、`data/media.json`、`static/images/media/` 与同步脚本（都在 git 历史里）。

### 文件地图：links.md（原 MAINTENANCE.md 第 1 节）

                            ⚠️ links.md 2026-10-11 已删（友链并进 roll.md），别再加回来

### _redirects：/running/（原 MAINTENANCE.md 第 5 节）

⚠️ `/running/` → `run.hulatu.com` 那条 **2026-10-12 已删**（子站入口只留在 `/about/`）—— `hulatu.com/running/` 现在 **404**，要恢复就把它加回 `static/_redirects`。

### 验收清单第 2 条旧期望值（2026-10-14）

# 期望值（2026-10-14 实测）：figure=323 img=323（**1:1**，overlay 已不重复 <img>）
#   带宽高=323 lazy=321（少的 2 个是 /donate/ 直接写在 Markdown 里的两张赞赏码，
#   不经 render-image.html，所以没有 lazy）
# ⚠️ 改前是 figure=323 img=644 —— img 应**恰好等于** figure，大于它就是
#   overlay 是空壳，不再重复渲染第二个 <img>（见 DESIGN.md 8.5）

### 验收清单：/now/（原 MAINTENANCE.md 第 7 节）

- `/now/`：2026-11-02 已按用户要求删除，旧地址 301 到 `/about/`；⚠️ `/privacy/` 与 `/donate/` **仍保留页面标题**

### 待办：sync-lastmod 半废（已不成立）

1. **`scripts/sync-lastmod.py` 半废** → `lastmod` 只喂 RSS / sitemap，页面无可见产出。

### 待办 5 原文：每日重建的部署凭据

5. ~~**每日重建的部署凭据**~~（2026-11-22 随 `daily-rebuild.yml` 一起废弃）：不再需要 Deploy Hook。迁移时**别再配**；旧仓库里的 `CLOUDFLARE_DEPLOY_HOOK` secret 与 Cloudflare 里那个 hook 应删除（它是带凭据的地址，谁拿到都能触发部署）。每日重建见第 2 节 `sync-garmin.yml` 那条。

### DESIGN.md 第 5 节「站点层偏离」原表（2026-11-23 重写前，原文保留）

> 每一格里的「某天加了什么、某天改成什么」就是这些文件的改动史。
> 另：主题 `content { line-height }` 的演变是 2026-10-14 起 1.8 → 1.7 → 1.6 → 1.5。

| 文件 | 偏离 | 为什么 |
| --- | --- | --- |
| `layouts/_default/baseof.html` | ① `.Site.LanguageCode` → `.Site.Language.Locale`；② 补回 robots 分支；③ **2026-10-17 加 skip-link**（`<body>` 后第一个元素）+ **`<main id="main" tabindex="-1">`** + 长文页的 `.print-url`；④ **2026-11-21 删掉页内 `/` 快捷键脚本**（改由 `custom_body.html` 全局接管）；⑤ **2026-11-21 `<body>` 支持 `bodyClass` front matter**（`/roll/` 的专属排版钩子） | ① 前者 Hugo 0.158 起弃用，将来移除会让整站构建失败；② 上游**完全没有** robots 输出，而本站有两类页面本来就该 noindex（见下）；③ 无障碍：原来要按 8 次 Tab 才到正文（WCAG 2.4.1 A 级）。⚠️ skip-link 的目标是 `#main`，**不能**复用 `#top`（那是返回顶部的落点，跳过去等于跳到页头）；④ 两处同时监听会一次开两个面板，或面板打开后页面又跳走；⑤ 只输出 class，不改变原有 id |
| `layouts/_default/single.html` | 去掉 `if eq .Type "blog"` 外层门槛；加 `hideDate` / `hideTitle`；加文末「系列坐标带」+「上一篇 / 下一篇」；加评论区；**2026-11-21 日期行改成「发布于 YYYY-MM-DD / 更新于 YYYY-MM-DD」普通灰字**（发布日期前加「发布于」；有更新时再显示「更新于」；不再用升级包的浅蓝徽章，按用户要求不强调；`lastmod` 与 `date` 不是同一天才显示） | 上游把标题日期写死给 `blog` 段；其余都是站点层新增（见第 4 节）。判据取**日历日不同**而不是「差 24 小时」—— 当天发当天改的两个日期长得一样，并排显示是噪音。样式沿用 `.byline` 的灰字，不做徽章；`enableGitInfo = true` 让 `lastmod` 跟 Git 提交走 |
| `layouts/_default/list.html` | 5 处界面文案英译中；列表本体改用 `partials/post-list.html`；**2026-11-21 传 `desc=(ne .Section "weekly")`**（`/posts/` 显示一句话导语，`/weekly/` 不显示） | 上游文案写死英文、没走 i18n；列表与 `/archive/` 共用一份。周刊按用户要求去掉导语；归档页不传 `desc`，避免 143 条全部变三行 |
| `layouts/partials/post-list.html` | **新增**：按年分组 + `orphan-safe` 标题的列表本体；**2026-11-21 加可选 `desc` 参数**，在标题链接内追加 `.hl-post-desc`；年份改成 `<li class="year-heading"><h2>…</h2></li>`，链接用 `.RelPermalink` | `/posts/`、`/weekly/`、`/archive/` 三处共用，避免复制粘贴漂移。⚠️ 导语必须放在 `<a>` 内部：`li` 是 flex，外置会成为第三个 flex 子项。⚠️ `<ul>` 的直接子元素只能是 `<li>`，裸放 `<h2>` 会被 axe 判为 serious；`.year-heading` 显式改回 `display:block` 让 h2 边距照旧 |
| `layouts/_default/rss.xml` | 四处：① `xmlns:content` + **顶部不再挂 `<?xml-stylesheet?>`**（旧的 `/rss.xsl` 已删）；② 首页 feed 改成**只收文章页**（`Type` ∈ `posts`/`weekly`）；③ 补 `atom:updated` / `category` / 摘要式 `description` / 全文 `content:encoded`，并存 `params.RSS.pageLimit` 上限（20）；④ **2026-10-25 补 `<image>`**（144×144 PNG，走 `params.feedIcon`） | ① 旧版靠浏览器 XSLT 渲染，Chromium 正在移除 XSLT（弹横幅，移除后那页退化成 raw XML）→ 改由 `functions/_middleware.js` 内容协商到 `/feed/`，见第 4 节「订阅源」；② 迁移后新增的 `/about/` `/now/` `/roll/` `/privacy/` `/donate/` `/archive/` 都是 content 根下的普通页，会被一并收进订阅；③ 上游只发全文 `description`、没有「更新于」和分类；④ `<image>` 是订阅端**唯一有明文依据**的图标来源，缺了它阅读器只能猜（见 8.6） |
| `layouts/_default/archive.html` | **新增**（且比上游 `list.html` 多「系列」一行入口 + 标签常显/折叠） | `/archive/` 是内容页不是 section，上游无对应模板 |
| `layouts/_default/run.html` | **新增**：跑步数据页。从子站 `sites/run/layouts/index.html` 搬来，去掉子站自己的 `<head>` / `<header>` / `<footer>`，补一个页面级 `<h1>`，数据块包进 `<content>` | 跑步数据要从 `run.hulatu.com` 变成本站的 `/run/` 页，数据来自 `hugo.Data.runs`（`data/runs.json`）—— 上游没有任何读 `data/` 的模板 |
| `layouts/_default/_markup/render-link.html` | **新增**：`</a>` 后**不留换行** | 上游模板末尾多一个换行，行内链接后紧跟中文标点时会被折叠成一个空格（「花墨 ：点评」）。迁移后实测 **26 页 / 70 处**，其中 `/roll/` 一页 15 处。见下 |
| `layouts/feed/list.html` + `layouts/feed/single.html` | **新增**：把 `/feed/` 与 `/feed/weekly/` 挂到 `baseof` 上，内容全在 `partials/feed-view.html` | 「浏览器直接打开 feed 看到的那一页」的新家（旧版是 `static/rss.xsl`）。⚠️ **两个文件名都要有**：section 页（`/feed/`）走 `list.html`，它下面的普通页（`/feed/weekly/`）走 `single.html`，缺一个就会掉进 `_default/single.html` 被渲染成一篇「文章」（多出日期行、标签行、上下篇导航） |
| `layouts/partials/feed-view.html` | **新增**：订阅源的浏览器视图 —— 标题 + 站点简介 + 订阅地址 + 条目（日期 / 标题 / 摘要）。⚠️ **页面集合口径必须与 `_default/rss.xml` 逐字一致**（`site` = Type ∈ posts/weekly；`weekly` = 周刊 section 的 `.RegularPages`） | 见第 4 节「订阅源」。两边算得不一样 = 「网页上比订阅里少一篇」，而且构建 0 警告 |
| `layouts/index.html` | **新增**（且简介正文**不包 `<content>`**，与上游不同、与 yinji 一致） | 上游首页只有 `{{ .Content }}`，等于空页；`<content>` 那层见第 4 节「首页」 |
| `layouts/partials/nav.html` | 完全由 `[[menu.main]]` 驱动；**2026-10-17 加 `aria-current="page"`** | 上游把 `Home` / `Blog` 写死，和 `[menu]` 语义打架。⚠️ 当前页判断必须**精确相等** `$.RelPermalink` —— 按前缀会让每篇文章页点亮 `Posts`（它指向 `/archive/`，而文章在 `/posts/…`）；样式**只改颜色**（不加下划线，用户 2026-10-17 当天否掉）、**不改字重**（Verdana 400→700 会让导航折行位置变） |
| `layouts/partials/header.html` | **新增**（2026-10-18）：站名从 `<h1>` 降级成 `<p class="title">`，外观由 `custom.css` 第 00c 段补回 | 上游把站名写成 h1，而文章页的正文标题也是 h1 → **每篇文章页两个 h1**（实测 134 / 344 页）。改成 `<p>` 后文章页唯一 h1 = 文章标题；首页 / `/about/` / `/now/` / `/roll/` / 列表页变成 0 个 h1 —— 与第 7 节第 1 条「非文章页没有页面级 h1」一致。⚠️ `<p>` 与 `<h1>` 的默认样式差**四处**（color / font-size / font-weight / margin），少补哪一条都看不出来但页面会变；验收是改前改后各截一张首页跑 `magick compare -metric AE` = **0** |
| `layouts/partials/favicon.html` | **新增**：一条 `shortcut icon` 扩成五条（SVG / 512 / 192 / apple-touch / ico）；**另加一条 `rel="manifest"`** | 上游只输出 `params.favicon` **一条**，本站指向 SVG ⇒ head 里只有 SVG。而 RSS 阅读器与图标聚合服务的取图管线基本不吃 SVG，`/favicon.ico` 这个约定路径又不存在 → 订阅端拿不到图标、退回字母头像或地球图标，表现就是「订阅里的头像和网站不一样」；站内一切正常、构建 0 警告、本地截图也看不出来。见 8.6。manifest 是为了安卓「添加到主屏幕」——没有它，桌面图标是自动截图、名字取 `<title>`、点开还是浏览器界面（见 8.8） |
| `layouts/partials/footer.html` | 版权独立成行；`Say hello` 大写；末行英文化 + `Privacy` 链接 + CC 带链接；**2026-11-21 页脚不放随机入口**（随机移到了 `/archive/` 计数行） | 上游版权和 Sitemap 挤一行，配置不出来；后三处是 2026-10-11 用户要求 |
| `layouts/partials/breadcrumbs.html` | **新增**：面包屑 `<nav>` + `BreadcrumbList` JSON-LD | 上游与 yinji 都没有面包屑；只给有层级的文章页挂（见第 4 节） |
| `layouts/partials/seo_tags.html` | **新增**：整份覆盖上游的同名 partial —— ① 删 `<meta name="keywords">` 与 `<meta name="title">`；② 删掉整块微数据（`itemscope` / `itemprop` 那套）；③ 补 `og:image:width` / `height`；④ 换成按页型输出的 JSON-LD；⑤ **2026-10-26 BlogPosting 补 `inLanguage` / `articleSection` / `keywords`** | 上游那份是「HTML 规范还在 2015 年」的写法（见 8.8）。现在全站每页都有 `ld+json`、`keywords` / `itemprop` / `pubdate` 全站归零。⑤ 三个都是**短值**（分类一个词、标签逗号拼接、locale），不破「JSON-LD 不放长文本」这条原则 —— 分类/标签为空时走 `merge` 条件追加，**不能塞空串**，否则富媒体测试会报「字段为空」 |
| `layouts/partials/og-image.html` | **新增**：分享卡片图的**唯一**取值来源 —— 长文页按 `.Slug` 找 `images/og/<slug>.png`，取不到回落 `site.Params.images` 第一张；返回**绝对 URL** | 这段逻辑原本在 `_partials/opengraph.html` 与 `_partials/twitter_cards.html` 各写一份、靠注释提醒「必须逐字一致」；2026-10-26 给 JSON-LD 的 `image` 也用同一张图时正好会变成第三份，于是收成一份。见 8.8 |
| `layouts/partials/noindex.html` | **新增**：`noindex` 判定的**唯一**来源（`tags` / `404` / `.Params.noindex`），返回 bool | 同上：原本 `_default/baseof.html` 与 `sitemap.xml` 各写一份 `or(...)`，漂移的后果是「sitemap 里混进 noindex 页」而构建 0 警告。分类页放行时正好要动它，于是收成一份。见 8.9 |
| `layouts/partials/custom_body.html` | **只剩对话框 HTML，脚本搬到 `assets/js/palette.js`，按钮搬到 `partials/nav.html`。** 以下是原始说明：**新增**：**升级包原版** —— `⌘K` / `/` 命令面板、导航右侧 `搜索 /` 与内联 SVG 月亮/太阳按钮（尺寸在 `custom.css` 第 56 段）、归档计数行随机入口 `#archive-random`、`applyTheme()` 手动深浅色。**2026-11-22**：`toggleTheme()` 改为从点击处圆形绽开（View Transitions + WAAPI，见第 57b/57c 段的 `.hl-vt-theme` 约定），图标同拍转一圈；保留 `.hl-theme-transition` 作为无 View Transitions 时的降级。`loadIndex()` 里把本站 `t/u/g/h/k/d` 映射成升级包的 `title/url/summary/date/section/headings/keywords` | 用户要求完全采用升级包，但随机按钮从页脚改挂到归档页；月亮/太阳由文字换成 SVG 以消除跨平台字形差异。⚠️ 不要改回本站自己的数据形状：命令面板的字段映射依赖 `t/u/g/h/k/d`。⚠️ `applyTheme` 额外同步 `<meta id="hl-theme-color">`、giscus iframe 主题与按钮 `aria-label`。⚠️ `.hl-vt-theme` 用序号 `vtSeq` 防连点时旧过渡提前摘类 |
| `assets/css/upgrade.css` | **新增**：升级包原样样式（`--hl-*` 令牌、`.hl-*` 组件、站点令牌桥接），原来是 `custom_head.html` 末尾的内联 `<style>` | 每页 4.8 KB 不能缓存。⚠️ 在 CSS 管道里必须排**最后**（theme → custom → upgrade），它靠「后出现」覆盖旧设计 |
| `assets/js/palette.js` | **新增**：命令面板 / 深浅色切换 / 随机漫游，原 `custom_body.html` 的内联脚本 | 与 `hello.js`、`toc.js` 拼成 `/js/site.min.<hash>.js`，`<head>` 里 `defer`。⚠️ 必须在 `giscus.js` 之前执行（它要读 `applyTheme` 写好的主题），所以别挪到 `<body>` 末尾 |
| `assets/js/hello.js` | **新增**：「问候」/「写信」邮箱浮层，原 `partials/hello-script.html`（已删除） | 拼进全站 site.js，省掉每页 1.5 KB 重复下载 |
| `assets/js/toc.js` | **新增**：右侧目录显隐，原 `_default/single.html` 末尾的内联脚本 | 同上；没有 `div.toc` 的页面直接 return |
| `layouts/index.json` | **新增**：首页的 JSON 输出视图，产物 `/index.json` —— 144 篇的 `{t,u,g,h,k,d}`（标题 / 站内路径 / 标签 / h2·h3 章节 / 关键词 / 引用框）。**不再索引正文**：标题 > 章节 > 关键词 > 引用四级打分，章节命中显示「章节 · 短语」，关键词命中显示「相关 · 短语」 | 列表页搜索原来只 `title.includes`，搜正文里的词一条都出不来。⚠️ 文件名**必须**是 `index.json`：home 的输出格式按 `layouts/index.<ext>` 找模板，找不到会退到 `_default/list.<ext>`，那份带分页变量、结构也不对。⚠️ 体积约 137 KB / gzip 61 KB；命令面板只在呼出时 fetch 一次，别改成进页面就拉。见 8.7 |
| `layouts/partials/inline-links.html` + `data/inline-links.json` | **新增**：渲染层正文内链 —— 词表 `{a: 锚点, u: 目标URL}`，在 `single.html` 的 `$content` 管线上把正文文本节点里的锚点词包成 `<a>`。词表 30 条，全部逐字校验过「确实在别的文章正文里出现过」 | 133 篇里 120 篇正文零内链，影响主题相关性；但挨篇插链接要动 120 个用户手写的 `.md`，不动。详见 8.10 |
| `layouts/partials/custom_head.html` | CSS 管道 + **升级包完整 `<style>`（`--hl-*` 令牌与所有组件）** + 主题引导脚本 + 图床预连 + 单个 `theme-color` + GoatCounter | 升级包样式最后加载，覆盖站点旧设计；末尾「站点令牌桥接」把 `--bg-color-*` / `--text-color-*` / `--border-color` / `--link-*` 映射到 `--hl-*`，旧组件也换色。⚠️ 管道必须在升级包 `<style>` 之前，否则主题基础排版会被打回上游默认 |
| `layouts/404.html` | **新增** | 上游默认只有 `<h1>404</h1>` + 一行颜文字 |
| `layouts/_default/_markup/render-heading.html` | **新增**：标题末尾的 `#` 锚点 | 上游没有这个钩子（Goldmark 只给 id、不给可点入口） |
| `layouts/partials/orphan-safe.html` | **新增**：标题末 2 字包 `nowrap` | 中文标题的孤行问题（取回旧主题的做法） |
| `layouts/_default/_markup/render-image.html` | **新增**（2026-10-12）：正文图片补 `width` / `height`。⚠️ **2026-10-14 改了放大方案**：overlay 里原本还重复渲染一个 `<img>`，现在整段删掉、URL 改走 figure 上的 `--zoom-src` 自定义属性（见下）。⚠️ **2026-10-25 又加了三样**：`srcset` + `sizes`（400/720/1080 三档）、图床边缘转换前缀、首图 `fetchpriority="high"` | 上游只输出 `src` / `alt`，图片加载前高度为 0 → 页面跳动（CLS）。宽高取自 `data/image-dims.json`（`scripts/sync-image-dims.py` 采集）。⚠️ 必须配第 21 段的 `img { height: auto }`，否则 `height` 会当硬高度生效、图被**竖向拉伸**。**2026-10-25 的 srcset 走 Cloudflare Image Resizing**（`/cdn-cgi/image/width=W,format=auto,quality=82/`），实测省 47–71%，见 8.5 |
| `layouts/partials/back-top.html` | **新增**：返回顶部（只长文页） | 上游没有；**纯 CSS 滚动驱动动画，零 JS**。⚠️ 同日曾有过「阅读进度条」，已按用户要求删除 |
| `layouts/partials/code-copy.html` + `assets/js/code-copy.js` | **新增**：代码块复制按钮（只含代码的页） | 上游没有 |
| `layouts/partials/giscus.html` + `assets/js/giscus.js` | **新增** | 上游没有评论区 |
| `layouts/sitemap.xml` | **新增**：按 `$noindex` 过滤，336 条 → **134 条** | 内置 sitemap 把 197 个词条页 + `/posts/` `/donate/` `/privacy/` `/feed/` `/feed/weekly/` 一起交给爬虫 —— **202 / 336 = 60.1%** 是自带 noindex 的页。爬虫不会收录，但 Search Console 会持续报「已提交但被 noindex 排除」。⚠️ 过滤条件必须与 `baseof.html` 的 `$noindex` **逐字同口径**（四个判据），两处漂移时构建 0 警告 |
| `layouts/_partials/opengraph.html` + `layouts/_partials/twitter_cards.html` | **新增**：按 slug 取 `images/og/<slug>.png`，**取不到就回落 `share.webp`** | 内置那份只会用 `site.Params.images` 一张图 → 337 页的 `og:image` 全是同一张，分享卡片长得一样（现已按 slug 分图，见 8.8）。⚠️ 两个文件的取图逻辑必须**逐字一致**，否则「微信卡片和 Twitter 卡片不是同一张」；⚠️ 覆盖的是 Hugo **内置**的 `_partials/` 命名空间（0.146+），不是主题的 `partials/` |
| `scripts/gen-og.js` | sharp 把 SVG 光栅化成 1200×630 PNG，每篇文章一张 | 只用现在的 token：`#fdfdfd` 底 / `#1a1a1a` 墨 / `#8c8c8c` 三级灰 / `#d0d7de` 虚线；**不用链接蓝**（卡片上没有可点的东西，用了会让强调色失去语义） |
