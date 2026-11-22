---
version: beta
name: hulatu-bearneo
description: >
  ⚠️ 2026-10-10 晚**整份重写**。本站的视觉体系**不再是自建的「纸账 + 印章」系统** ——
  那一天整站迁移到了上游 hugo-bearneo 主题（`themes/hugo-bearneo/`，27 个文件）。
  ⚠️ **2026-10-14 起不再是「27 个文件逐字节未改」**：`style.html` 是 `assets/css/theme.css`
  的镜像，两处同步，做过三处登记过的改动 —— ① `content { line-height }` 最终 1.5；
  ② 删掉未启用的 upvote 三组规则与两个 `--upvoted-color` 变量（2026-11-03，省 ~260B/页）；
  ③ visited 链接色与 link 同色（2026-11-21，去掉紫色）。
  其余 26 个文件仍与上游逐字节一致（`diff -r` 可验）。改上游一律在第 5 节登记。
  自建的 6 个 CSS 模块 / 6 个 JS 全部删除。
  ⚠️ **2026-11-06 起 CSS 不再内联**：主题 CSS 与站点补丁 CSS 抽成外部文件，
  由 `layouts/partials/custom_head.html` 里的管道拼成一个带内容哈希的文件
  `/css/main.min.<hash>.css`（约 38.5 KB raw / 8.5 KB gzip，以构建产物为准），全站共用、
  浏览器长缓存（`static/_headers` 里 `/css/*` 写 1 年 + immutable）。
  主题 CSS 的真值在 `assets/css/theme.css`（复制自
  `themes/hugo-bearneo/layouts/partials/style.html`，含下面三处登记过的改动；
  行高与复制源保持同步）；
  站点补丁的真值在 `assets/css/custom.css`（段号与注释原样保留）。
  本文件里的「第 N 段」一律指 `assets/css/custom.css` 第 N 段。
  所以下面登记的令牌**全部是上游主题的真值**，唯一真值在
  `assets/css/theme.css`（不再是主题文件本身 —— 主题文件现在只是复制源）。
  站点层只在 50 个文件里做了最小偏离，逐条列在正文「站点层偏离」一节。
  **改样式前先读那一节**：绝大多数视觉问题应该在上游那一份里改，
  而不是在站点层再叠一层规则 —— 那是上一版自建主题最后变得无法维护的原因。

---

## 0. 当前状态（2026-11-22，唯一真值）

> 下面这些是**现在线上生效的值**。后面章节里带日期的旧值都是历史记录，
> 与这里冲突时以本表为准。样式真值在 `assets/css/theme.css` 与
> `assets/css/custom.css`；本表只是摘要。

| 项 | 当前值 |
| --- | --- |
| 阅读页正文 | **18px / 行高 1.5 / 行盒 27px**（文章、周刊、`/about/`、`/privacy/`、`/roll/` 统一） |
| 段间距 | `content > p { margin-bottom: 1.5em }` = **27px**，与行盒一致 |
| 标题阶 | h1 **30px**、h2 **24px**、h3 **20px**、h4 **19px**、h5 **18px**、h6 **16px** |
| 页头站名 | **30px**（与 h1 同档，不再大于文章标题） |
| 辅助字号 | byline 15px、TOC 14px、文末推荐元信息 13px、页脚 0.8em（14.4px） |
| 标题锚点 `#` | 默认常显、链接蓝、字号 1em（与标题同大）、`aria-label` 带标题文本、打印隐藏 |
| 浅色色板 | 升级包：bg **`#FCFCFA`**（2026-11-22 按用户要求改回暖白）/ subtle `#F7F8FA` / hover `#F1F3F6` / text `#111315` / secondary `#374151` / tertiary `#6B7280` / link `#1D4ED8` / border `#E5E7EB` / code `#F6F8FA` |
| 深色色板 | 升级包：bg `#111214` / subtle `#181A1F` / hover `#20232A` / text `#F3F4F6` / secondary `#C8CDD6` / tertiary `#8B93A1` / link `#60A5FA` / border `#262A33` / code `#16181D`（原 `#161618` 已被覆盖） |
| 深浅色模式 | **手动开关 + 跟随系统初值**：`data-theme` 写在 `<html>`，右上角 `☾/☀` 切换，`localStorage['hl-theme']` 记住；主题色、giscus 同步 |
| 导航 | 首页 / 关于 / 邻居 / 工具 / 周刊 / 文章 / 订阅（7 项） |
| 内容量 | 113 篇文章 + 30 期周刊 = 143 个内容页（另有 `posts/_index.md`、`weekly/_index.md`，共 145 个 Markdown）；sitemap 163 条；构建 HTML 404 个（以 `find` / `sitemap.xml` 为准，别背数字） |
| 行高来源 | **只在 `assets/css/theme.css` 的 `content` 声明一次 1.5**；`custom.css` 不再覆盖 |
| 正文内链 | `content.long-form a` 默认 1px 三级灰虚线（`text-underline-offset: 3px`），悬停变实线 + 当前色；标题锚点、脚注引用/返回排除 |
| 列表与表格 | 列表项之间 `0.3em`（只给无 class 的直接子级，`ul.blog-posts` 不受影响）；表格单元格 `0.5em 0.65em`、表头 600、数字 tabular |
| 脚注 / 图注 | 脚注 16px 二级灰；图注 0.85em 二级灰，alt 非空时加 `aria-hidden="true"`（避免读屏把 alt 念两遍） |
| 阅读进度条 | 长文页（posts + weekly）顶部 3px 链接蓝；`animation-timeline: scroll(root block)`，零 JS；不支持时整条隐藏 |

2026-11-21 新增两个根级页：`/style/`（所有 Markdown 元素的样式样本，`long-form: true`）与 `/map/`（人类可读的站点地图，同时收技术栈、排版、评论与隐私、站史；原 `/colophon/` 当天并入，301 到 `/map/`）。`/about/` 底部新增「写作统计」：文章/周刊数、累计字数、写作天数，以及过去 365 天的发布热力图（`layouts/shortcodes/writing-stats.html` + `custom.css` 第 51 段，纯构建期生成，无 JS）。2026-11-21 当天改版：统计条改成「小标签在上、大数字带单位」，四列之间用发丝线分隔；热力图加月份刻度与范围/有发布天数，配色改成 `--hl-*` 强调色混合（`color-mix`），注脚用虚线分隔；窄屏 2×2 统计 + 月份与格子一起横向滚动。

2026-11-21 同日并入 Bear Neo 升级包（**按用户要求完全采用，不再做令牌映射**）：
右上角 `搜索 /` 与 `☾/☀` 按钮，全站 `⌘K` / `/` 命令面板，
归档页「共 N 篇，随机阅读一篇」，文章列表一句话导语（**周刊列表不显示**）与
日期行的「发布于 / 更新于」灰字（不强调，与 byline 同级）。首页绿点 Now 与关于页「关于本机」卡片当天**先加后删**，
按用户要求不再出现在页面上（短代码文件已删除）。
配色、圆角、阴影全部换成升级包的 `--hl-*`（见上表），站点旧令牌在
`custom_head.html` 末尾的「站点令牌桥接」里映射到 `--hl-*`，所以旧组件也一起换色。
**深浅色改为手动开关**：`theme.css` / `custom.css` 里所有 `prefers-color-scheme` 规则
已改成 `[data-theme="dark|light"]`，切换后全站一致。

2026-11-22 阅读体验七项：正文链接补 1px 虚线；列表项留 0.3em；表格内边距 4px → 0.5em/0.65em；
脚注 15px 三级灰 → 16px 二级灰；图注 0.8em 三级灰 → 0.85em 二级灰并给 alt 重复的 `figcaption`
加 `aria-hidden`；长文页加回 3px 阅读进度条（CSS 滚动驱动，零 JS）；浅色底从 `#FFFFFF`
改回暖白 `#FCFCFA`（`theme-color`、`applyTheme`、`manifest.webmanifest` 同步）。
`scripts/check-html.sh` 的对比度解析同步支持 `:root[data-theme="dark"]`，不再只认媒体查询。

---

# ⚠️ 以下是上游原值（方便对照主题）；当前生效值见第 0 节。
#    2026-11-21 起 visited 与 link 同色，不再使用下面的 #551a8b。
colors:
  # ── 浅色（默认）─────────────────────────────
  bg-primary: "#fdfdfd"        # 页面底色，几乎纯白
  bg-secondary: "#f2f4f7"      # 行内 code 底 / 表头底 / 控件底
  text-primary: "#1a1a1a"      # 正文与标题
  text-secondary: "#444"       # 引用块 / 图片说明
  text-tertiary: "#8c8c8c"     # 日期列 / 目录文字
  link: "#0066cc"              # 链接
  link-visited: "#551a8b"      # 列表页已访问链接
  border: "#d0d7de"            # 表格线 / 图片描边 / 分割

  # ── 深色（`data-theme="dark"`，右上角手动切换；初值跟随系统）──
  # 只覆盖上面 8 个，--width-max / 字体 / 字号三组不动。
  dark:
    bg-primary: "#121212"
    bg-secondary: "#1c1f24"
    text-primary: "#e5e5e5"
    text-secondary: "#b3b3b7"
    text-tertiary: "#a0a0a0"
    link: "#6da6ff"
    link-visited: "#b388ff"
    border: "#30363d"

typography:
  font-primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif'  # ⚠️ 2026-11-05 改成系统字体栈，之前是 Verdana 打头
  font-secondary: "monospace"
  size-primary: "18px"   # ⚠️ 2026-11-06 由 1em（16px）改成 18px，见 custom.css 第 39 段
  size-secondary: "0.8em"
  body-line-height: 1.5
  content-line-height: 1.5       # ⚠️ 唯一来源是 theme.css；18px × 1.5 = 27px，段间距 1.5em = 27px
  note: >
    上游只有 `Verdana, sans-serif`。Verdana 不含汉字，中文一直靠浏览器兜底。
    2026-11-05 起站点层改成系统字体栈（`custom.css` 第 01 段），这是**唯一**动过字体的地方。

    ⚠️ **行高最终 1.5 —— 这是全站唯一一处改上游主题的地方**
    （`themes/hugo-bearneo/layouts/partials/style.html` 的镜像，生效的是
    `assets/css/theme.css`，见第 5 节）。
    历史：2026-10-14 由 1.6 改成 1.8；2026-11-20 改回 1.8；2026-11-21 先到 1.7、再到 1.6，
    用户仍觉偏松，最终定在 1.5。当前不再有任何 `content` 行高的重复声明。
    `body` 仍是上游的 1.5：页头 / 导航 / 页脚是外壳，不是阅读面，不跟着放。
    **2026-11-21 最终口径**：所有阅读页正文 **18px / 1.5 = 27px**；
    段间距 `1.5em = 27px`，与行距一致；文章与 `/about/` `/privacy/` `/roll/`
    不再分两套字号。打印仍走 `@media print` 的 1.5。
    体积**零变化** —— 加的中文注释被 minify 剥掉：
    8675 / 12610 / 10404 / 9101 / 10509 / 10089 逐值不变。

layout:
  width-max: 720px            # 唯一的宽度令牌。没有 --content-width / --radius / 间距阶梯
  body-padding: 20px
  heading-margin: "16px 0"    # 上游 h1~h6 一律 16px 上下；正文里由站点层加大上间距
  breakpoints:
    - 800px                   # 唯一断点：TOC 隐藏 + #minipic 图片放开宽度
  note: >
    上游**没有**间距阶梯（--space-1/2/3）、**没有**圆角档位（--radius-sm/chip/pill）、
    **没有**投影令牌。需要圆角时直接写 4px（上游对表格 / 图片 / code / 高亮块一律 4px）。
    上一版那套 `--space-*` / `--radius-*` / `--shadow-*` 随自建主题一起删了，
    别再照旧文档的写法引用。
    **唯一例外是升级包层**：`--hl-shadow` 与硬编码的 6 / 12 / 16 / 999px 圆角
    只存在于 `.hl-*` 组件（面板、mac 卡片、胶囊、按钮），别扩散到旧组件。

radius: 4px                  # 站点旧组件一档；升级包组件另有 6 / 12 / 16px 与 999px 胶囊
hit-target: "无硬性下限"      # 上游没有 44px 触控区约定；站点层只给评论区的「评论」开关补了 min-height: 44px
---

# 设计规范 —— hulatu.com

> 一句话：**本站的视觉体系 = 上游 Hugo Bear Neo + 2026-11-21 的升级包覆写层**。
> 升级包用 `--hl-*` 令牌重写了配色与首页 / 关于页组件，并带来手动深浅色；
> 站点原有的排版、目录、评论、工具页等仍保留，颜色通过「站点令牌桥接」跟随升级包。
> 这份文档登记 50 个站点层文件与 4 处主题副本改动，免得下一轮改造把已有取舍重做一遍。

---

## 如何使用这份文档

| 你想做的事 | 去哪儿 |
| --- | --- |
| 改升级包配色 / 组件样式 | `layouts/partials/custom_head.html` 末尾的升级包 `<style>`（`--hl-*`）。改站点旧组件的颜色去同一处的「站点令牌桥接」 |
| 改正文排版（标题间距、中文字体） | `assets/css/custom.css` 第 02 段（样式），`custom_head.html` 只负责加载 |
| 改首页 | `layouts/index.html`（结构）+ `content/_index.md`（文案：简介、支持链接、平台入口）。`data/projects.toml` 与 `shortcodes/projects.html` 保留但**当前未挂载** |
| 改关于页的介绍块 | `content/about.md` 的纯 Markdown 介绍，**没有照片头像、没有 mac 卡片**；页面标题 2026-11-21 起恢复显示 |
| 改支持页 / 换收款码 | `content/donate.md`（结构 + 文案）+ `custom.css` 第 08 段（样式） |
| 改跑步页 `/run/` | `content/run.md`（导语）+ `layouts/_default/run.html`（结构）+ `custom.css` 第 25 段（样式）。数据读 `data/runs.json`，**别在页面里写数字** |
| 改文末「系列」/「相关文章」/「上一篇 / 下一篇」 | 模板 `layouts/_default/single.html`（①②③ 三段）+ `custom.css` 第 09 / 10 段。⚠️ 相关文章的**权重与阈值**在 `hugo.toml` 的 `[related]`，不在模板里 |
| 改 `/roll/` 两组之间的分组标签 | `content/roll.md` 里的 `<p class="roll-group">朋友</p>` / `<p class="roll-group">组织</p>`，样式在 `custom.css` 第 49 段；⚠️ 别改成 `##` 标题（会进目录、破坏平铺） |
| 改代码块配色 | `custom.css` 第 12 段（浅/深两套）。⚠️ 前提是 `hugo.toml` 的 `[markup.highlight] noClasses = false`，改回 true 会让代码块变成看不见 |
| 改「系列」入口 / 总览页 | 入口：`layouts/_default/archive.html` + `custom.css` 第 09 段；总览页：`layouts/_default/series.html` + `content/series.md` + 第 09b 段 |
| 改链接页（朋友 / 聚合站 / 点评） | `content/roll.md` —— **全站唯一的链接页**，一条平铺 13 项（前 3 朋友、后 10 聚合站，无小标题） |
| 改导航 | `hugo.toml` 的 `[[menu.main]]`，**不用碰模板** |
| 改页脚 | `layouts/partials/footer.html` + `hugo.toml` 的 `[params] copyright` / `licenseName` / `licenseURL`；「打个招呼」浮层另见 `partials/hello.html` / `partials/hello-script.html` / `custom.css` 第 48 段；正文里的「写信」通过 `shortcodes/mail-link.html` 复用同一套浮层 |
| 改评论区 | `layouts/partials/giscus.html` + `assets/js/giscus.js` + `custom.css` 第 07 段 |
| 改订阅源（feed 字段 / 浏览器视图） | ① feed 本身：`layouts/_default/rss.xml`；② 浏览器打开 feed 时那一页：`layouts/partials/feed-view.html` + `content/feed/` + `custom.css` 第 28 段；③ 谁来分派：`functions/_middleware.js`（见第 4 节「订阅源」） |
| 改 robots / `noindex` | `layouts/_default/baseof.html` 的 robots 分支（见第 5 节） |
| 想加回一个已删功能 | 先在 git 历史里找删除当天的提交，读完理由再决定；当前设计不做「功能回收站」 |

⚠️ 主题目录 `themes/hugo-bearneo/` 基本是**上游副本**（2026-10-10 用 `diff -r` 验过），
只有 `style.html` 有上面登记的三处改动（生效的是它的镜像 `assets/css/theme.css`）。真要再改它，改完请在本文档第 5 节登记一行
—— 否则下一次跟上游同步会静默覆盖。

---

## 1. 设计谱系

```
Bear Blog（极简博客服务，Verdana + 720px + 虚线 hr）
      ↓ 社区移植
hugo-bearneo（上游主题，本站现在用的就是它；`style.html` 有三处登记改动）
      ↓ 站点层借鉴
yinji.org（同样基于 hugo-bearneo，是「别人怎么用这个主题」的现成答案）
      ↓
hulatu.com（本站：上游主题 + 29 个站点层覆盖文件）
```

**本站自己的设计主张只剩三条**，全部落在站点层，且都很小：

1. **中文字体要显式声明**（上游的 Verdana 栈不含汉字）。
2. **正文标题要有层级**（上游 h1~h6 一律 `margin: 16px 0`，标题和上下段的距离一样）。
   2026-11-21 起文章页标题后的 `#` 锚点**默认常显**并使用链接蓝，
   标题与正文的区分更直接（见 `custom.css` 第 02 段）。
3. **列表行的日期列不能写死宽度**（上游按它自己的 `"02 Jan."` 7 字符定 80px，
   本站用 ISO 的 `2006-01-02` 10 字符，写死就每行折两行）。

除此之外，**没有第四条**。上一版那套「纸账 + 印章」的语言（冷白纸画布、印章红、
衬线标题、发丝线承担层级、四档圆角、44px 触控区、view-transition 转场、三档时长）
**整体作废**，不要再往这些方向提方案。

---

## 2. 令牌

**唯一真值**：`themes/hugo-bearneo/layouts/partials/style.html` 顶部。
下面这份是摘抄，改上游之后请回来对一次。

### 颜色

浅色 8 个 + 深色 8 个，见文件头 `colors:`。几个要点：

- **只有一个强调色**：升级包墨水蓝 `#1D4ED8`（深色 `#60A5FA`）。站点旧的 `#0066cc` / `#6da6ff` 已被覆盖。
- **深色只覆盖颜色变量**，宽度 / 字体 / 字号不动。
- **深色有手动开关**：`data-theme="dark|light"` 写在 `<html>`，右上角月亮/太阳 SVG 切换，
  初值读系统设置，选择存 `localStorage['hl-theme']`。`theme.css` / `custom.css`
  里所有 `@media (prefers-color-scheme: …)` 已改成 `[data-theme="…"]`，切换后全站一致。
- **切换有颜色过渡**：`custom_body.html` 在切换前给 `<html>` 加 `.hl-theme-transition`，
  `custom.css` 第 57 段只过渡 `background-color / color / border-color / fill / stroke` 0.3s，
  360ms 后移除类；`prefers-reduced-motion: reduce` 下不加类、不播放。
- **正文用最深 ink（2026-11-22）**：升级包把 `body` 设为 `--hl-ink-2`（浅 `#374151` / 深 `#C8CDD6`），
  长文正文偏淡；站点层只在 `<content>` 上覆盖为 `--hl-ink`（浅 `#111315` / 深 `#F3F4F6`），
  页眉、页脚、日期等元信息仍保持 ink-2，层级不被拉平。对比度：浅色 10.3:1 → 18.6:1，
  深色 11.7:1 → 17.0:1。改的是 `custom.css` 第 39 段。
- ⚠️ **与 yinji.org 逐值相同**（2026-10-11 实测）：两站的 `:root` 浅色 13 行 + 深色 9 行
  **一个字节都不差**，因为两边都是上游 Bear Neo 的原样。
  所以用户 2026-10-11 提的「配色参考 yinji」**无需任何改动** —— 本来就一致。
  真正有差异的只有字体栈（见下）和几处排版补丁（见第 5 节）。

#### 代码块配色（2026-10-11 新增，**浅色 / 深色两套**）

上面说的「深色只覆盖 8 个颜色变量」**不包括代码块** —— 代码块另有一组 `--code-*` 变量，
由站点层在**含代码块的页面**上输出（见 `custom.css` 第 12 段）。

| 令牌 | 浅色 | 深色 | 用于 |
| --- | --- | --- | --- |
| `--code-fg` | `#24292f` | `#e5e5e5` | 普通标识符、标点 |
| `--code-comment` | `#656d76` | `#8b949e` | 注释 `.c .c1 .cm …` |
| `--code-keyword` | `#cf222e` | `#ff7b72` | 关键字 `.k .kn .kd …` |
| `--code-string` | `#0a3069` | `#a5d6ff` | 字符串 `.s .s1 .s2 …` |
| `--code-number` | `#0550ae` | `#79c0ff` | 数字 `.mi .mf …`、运算符 `.o .ow` |
| `--code-function` | `#8250df` | `#d2a8ff` | 函数 `.nf .fm`、类名 `.nc`、装饰器 `.nd` |
| `--code-builtin` | `#953800` | `#ffa657` | 内置 `.nb .bp`、变量 `.nv .vi …` |
| `--code-tag` | `#116329` | `#7ee787` | 标签 `.nt`、插入 `.gi` |

底色**沿用** `--bg-color-secondary`（`#f2f4f7` / `#1c1f24`），与行内 `code` 同一个底；
两者的区别靠 1px `--border-color` 边框，不是靠换底 —— 这样代码块不会在页面里「打补丁」。
深浅两套的每一个 token 对各自底色都在 **4.5:1 以上**（WCAG AA，
最低是浅色注释 4.76:1、浅色函数 4.58:1）。

⚠️ 这**不是**上游或 yinji 的做法 —— 两边用的都是 Hugo 默认的 monokai 内联色，
而它在本站**完全不可读**（详见 `custom.css` 第 12 段）。这是本站的一处**有意改进**。

### 字体

| 角色 | 栈 | 用在哪儿 |
| --- | --- | --- |
| `--font-primary` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif`（站点层补，2026-11-05 改成系统字体栈） | 正文、标题 |
| `--font-secondary` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", "Sarasa Mono SC", "Noto Sans Mono CJK SC", monospace`（站点层补，2026-10-12） | `<time>`、`<code>`、代码块 |

- ⚠️ yinji 的写法是 `"Verdana","PingFang SC", sans-serif` —— 2026-11-05 之前本站前两项与它逐字相同；改成系统字体栈后已**不再相同**，是用户明确要求的偏离（Verdana 不含汉字，中英混排基线会飘）。
- ⚠️ 上游**没有** `--font-serif`（衬线标题）也没有 `--font-meta`（等宽元信息）这两个概念 ——
  那是上一版自建主题的。现在日期和代码共用 `--font-secondary`，标题和正文共用系统字体栈（`--font-primary`）。
- ⚠️ **`--font-secondary` 2026-10-12 也补了跨平台回退**（原来只是一句裸 `monospace`）：
  `ui-monospace` 起头（macOS 走 SF Mono、Windows 走 Cascadia / Consolas、Android 走 Roboto Mono），
  再挂 `"Sarasa Mono SC"` / `"Noto Sans Mono CJK SC"` 两个**中文等宽**，最后才是 `monospace`。
  第 22 段，全站生效。没有它时中文注释会掉到宋体、与拉丁字符对不齐。

### 尺寸

| 令牌 | 值 | 说明 |
| --- | --- | --- |
| `--width-max` | `720px` | **唯一的宽度令牌**。没有内容列 / 页头列之分 |
| `body` padding | `20px` | 左右上下都是 20px |
| `--font-size-primary` | `18px` | 正文（⚠️ 2026-11-06 由 1em 改成 18px，第 39 段；这张表之前漏同步） |
| `--font-size-secondary` | `0.8em` | 页脚 / 图片说明 |
| `time` | `15px` | 硬编码，不走令牌 |
| 副标题 `.dek` | `0.9em`（≈16.2px，比正文小） | 标题下的灰色副标题，三级灰（第 39 段） |
| 日期行 `.byline` | `15px`，三级灰；一行 flex + gap（日期、更新、时长、字数） | 标题下的 log line（第 39 段；2026-11-21 去掉中点串，见该段注释） |
| 目录面板 | 折叠 36px 宽 / 展开按内容 `max-content`（上限 280px），14px 字、24px 行距；横线两态同一 x（距视口右 10px） | 折叠指示器 + 悬停扁平列表（第 40 段） |
| 圆角 | 站点旧组件 `4px`；升级包组件 6px / 12px / 16px |
| 断点 | `800px` | 主题原生那一档（minipic / image-zoom / TOC 整块隐藏） |
| 断点（站点层） | `1200px` | **桌面侧边目录 TOC 的显示闸门**（第 20 段，>1200px 显示）。手机端目录 2026-11-02 已删除，这一档只服务电脑端；主题原生的 800px 那档仍在管 minipic / image-zoom |

---

## 3. 布局与节奏

- **单列**。`body { max-width: 720px; margin: auto; padding: 20px }`。
  正文、页头、页脚共用同一条左右边界。
- **层级靠空白和虚线，不靠投影**：上游没有 `box-shadow` 令牌，
  唯一的阴影是图片放大遮罩上的 `0 8px 32px rgba(0,0,0,.3)`。
- **`hr` 是虚线**：`hr { border: 0; border-top: 1px dashed }`。
  首页「Hi! 简介」和「Recent Posts:」之间那条分隔就是它，**不用加类名**。
- **长文页引用框（2026-11-21）**：`content.long-form blockquote` —— 3px
  `--link-color` 左线、浅蓝底（亮 `#eef4fd` / 深 `#1a2230`）、左上角
  5em 低饱和 `“`（opacity .3）。只挂 `posts` + `weekly`（`single.html`
  的 `$longForm` / `.Params.longForm` 给 `<content>` 加 `long-form` 类），
  `/about/` `/roll/` 等独立页仍是原来的灰线引用；`/style/` 因为要展示文章
  排版，front matter 写了 `longForm: true`。打印去底色、去引号。
  ⚠️ 引号是绝对定位的伪元素，正文靠 `padding-left: 3.2em` 绕开；框上
  `overflow: hidden` 防止引号溢出；移动端收到 2em / 3.6em。别把引号做成
  行内内容，否则读屏会多读一个引号。
- **`content` 的 line-height 是 1.5**（2026-11-21 最终口径；唯一声明在
  `assets/css/theme.css`），`body` 是 1.5，外壳保持上游不动。
  所有阅读页正文统一 **18px**，行盒 = 18 × 1.5 = **27px**。
- **正文段间距 1.5em，与行高一致**（2026-11-21 用户要求「段间距和行间距一致，
  不用刻意增大」）：18 × 1.5 = **27px**，正好等于行盒高度。
  旧方案（2026-10-27 起）是 1.75em / 2em，刻意让段距大于行距，已经取消。
  **段落本身只加 `margin-bottom`**；「标题 → 首段」的间距由标题自己的
  `margin-bottom` 决定：标题后的段落用 `content h2 + p` 等相邻选择器把
  默认的 `1em` 上边距归零，所以 h2 / h3 / h4 后面实际是 12 / 9 / 7px。
  ⚠️ 不能给所有 `content > p` 写 `margin-top: 0` —— /roll/、/about/ 这类
  正文首段会贴住上方（2026-10-11 踩过）。
  ⚠️ 主题里 `content` 是**唯一**带行高的容器规则，所以 `<content>` 里的
  `p` / `li` / `blockquote` / **标题** 全都继承这 1.5（标题单行时看不出差别）。
  列表、引用块、图片容器也统一到 1.5em 上下距（见 `custom.css` 第 02 段）。
- **正文项目符号**（2026-11-21 晚）：非 `/roll/` 页面的普通 Markdown 无序列表统一成「链接蓝 5px 圆点 + 1.3em 悬挂缩进」，嵌套列表用 4px 三级灰圆点；`ul:not([class])` 只命中正文列表，`.blog-posts` / `.recent-posts` 这些组件列表和 `/roll/` 都不受影响（`custom.css` 第 02b 段）。

---

## 4. 组件

### 页头

```html
<header>
  <a href="/" class="title"><h1>胡拉图说</h1></a>
  <nav>…</nav>
</header>
```

- **没有头像、没有 logo 图、没有图标按钮**。全站唯一的 `<h1>` 就是这里的站名 ——
  列表页（`/archive/`、`/weekly/`）**没有页面级 h1**，这是上游的设计（Bear Blog 同款）。
- 页头**不吸顶**（`position` 默认 static）。

### 导航

**7 项，全部由 `hugo.toml` 的 `[[menu.main]]` 驱动**，模板里一个链接都不写死：

| 标签 | 落点 | 页面标题 |
| --- | --- | --- |
| `首页` | `/` | 首页 |
| `关于` | `/about/` | 关于 |
| `邻居` | `/roll/` | 收藏（**收藏 + 友链合并页**，2026-10-11 起） |
| `工具` | `/tools/` | 工具 |
| `周刊` | `/weekly/` | 周刊 |
| `文章` | `/archive/` | 归档 |
| `订阅` | `/index.xml` | ——**不是页面**，是全站订阅源（2026-10-11 新增，weight 60 排最右） |

⚠️ `RSS` 那一项与页脚的 `RSS` 指向**同一个** `/index.xml`。
它不以 `http(s)` 开头，所以 `externalLinksNewTab` 那套不会给它加 `target="_blank"`
（与页脚那个 RSS 链接行为一致：原地打开）。
✅ **2026-10-17 起有「当前页高亮」了**：`nav.html` 输出 `aria-current="page"`，
样式在第 00b 段 —— 当前项转**主文字色**，**不加下划线**（普通项是蓝字无下划线、
悬停是蓝字带下划线，三态都不改变宽度）。`RSS` 指向 `/index.xml`、不是页面，
所以它永远不会被点亮。
⚠️ 当前页**不加下划线**，只改颜色 —— 下划线会让导航看起来像一排被点亮的链接。
代价是色觉障碍用户可能分不清，但 `aria-current` 对屏幕阅读器是完整的。
⚠️ 当前页悬停时**仍然会出现下划线**（主题的 `a:hover`），刻意不压。
⚠️ 判断必须**精确相等** `$.RelPermalink`。写成前缀匹配的话，`Posts`（指向 `/archive/`）
会把每一篇 `/posts/…` 都点亮 —— 而本站 143 个内容页全在那条路径下。

⚠️ **2026-10-12 撤掉了原来的 `Hub` 项**（`https://profile.hulatu.com/`，个人主页子站，
2026-10-11 加、weight 15 卡在 `Home` 右侧）。用户要求「子站入口只留在 `/about/`」，
所以导航里不再有跨站外链 —— **7 项全是本站页面**。`Now` 已于 2026-11-02 按用户要求删除，旧地址 301 到 `/about/`。
（`RSS` 指向 `/index.xml`，同样不是 `http(s)` 开头、同样不参与 `externalLinksNewTab`。）
⚠️ **同一天稍后 `profile.hulatu.com` 的子站被整体删除**（用户要求「把 Hub 去掉」），
内容并入 `/about/`；**同日再晚一点 `run` / `shot` / `share` 三个子站也一并下线、
`sites/` 目录整体从仓库删除**（见第 4 节「子站」）—— 所以「主站与子站导航差一项」
这类问题现在**已经不存在了**：全站只剩主站一份 `[[menu.main]]`，当前 7 项。
⚠️ 导航项一多，窄屏就会折行：`nav` 靠站点层 `custom.css` 第 00 段的
`display: flex; flex-wrap: wrap; column-gap: 8px`（并清掉末项的 `margin-right`）
保证折行只发生在**项与项之间**。没有这段时 392px 视口会把 `RSS` 拆成 `RS`/`S`。

⚠️ **`/roll/` 是全站唯一的链接页**（2026-10-11 起）。**共 13 条**，
2026-11-21 起用 `.roll-group` 轻量标签分成「朋友」「组织」两组（不是 `##` 标题，
见第 4 节），DOM 上仍是**两个 `<ul>`：3 + 10**：
- 前 **3 条是朋友**：花墨 / Cytrogen / 梁某银的博客。**不含千古壹号**（用户明确说不要；
  它的 `blog-list` 就是下面「中文博客琅琊榜」那条，已经在平台那批里了）。
- 后 **10 条是聚合站 / 目录站**（原「博客圈与组织」；2026-11-02 移除了「十年之约」一条，14 → 13）。
- ⚠️ 分组靠 `.roll-group` 小字标签，**别改成 `##`**（会进目录、破坏平铺）——
  细节见第 4 节「收藏 `/roll/`」。
- 结尾照 yinji 还有一行 `&hellip;更新中`；2026-11-21 起其后追加「交友原则」与「我的友链信息」。

⚠️ **条目格式照 yinji.org/roll**：`- [名称](地址)：一句话点评`。
⚠️ **13 条点评 2026-10-11 晚已由作者自己写全**（3 位朋友 + 10 个平台，每条都有一句）——
**别再当漏写去补**。架构上仍留了口子：要加就直接接在中文冒号后面，不用改别处。

⚠️ **`/links/` 这一页已经删除**（2026-10-11）：旧地址 `/links/` 与更早的 `/friends/`
**都 301 到 `/roll/`**（见 `static/_redirects`）。**别再拆回两页** —— 用户已经用一次合并
否掉了「两份清单互不重叠」那套说法。

⚠️ 顺序由 `weight` 决定，与 `hugo.toml` 里的书写顺序无关。
`Weekly` 的 weight 是 **45**（卡在 `Links` 40 与 `Posts` 50 之间），
所以它必然落在 `Posts` **左边** —— 2026-10-11 用户要求的位置。
（原来的 `Hub` 靠 weight **15** 卡在 `Home` 10 与 `About` 20 之间，2026-10-12 已删。）

增删导航只动 `hugo.toml`；外链自动开新窗口（`externalLinksNewTab = true`，在 `nav.html` 里判）。

### 首页

**逐条照 yinji.org**：

```
## Hi!                       ← content/_index.md 里，h2
> 总得留下点什么吧。            ← 引用块
一名不谈地理…的工科研究生。       ← 段落
文章 N 篇，周刊 N 篇，运行 N 天。如果觉得…可以选择 [支持] 我。  ← 同一段、同一个正文样式
[公众号] / [少数派] / [知乎]    ← 一行链接（Markdown 段落，Goldmark 自动成 <p>）
/ [即刻]                       四个平台，2026-10-11 换掉了原来的 RSS / 周刊 / 关于 / 花园
                               ⚠️ 文档里曾写「五个平台」并多列一个「小红书」—— 产物里**只有 4 个**
<hr>                         ← 虚线，模板输出
<div class="recent-posts-head-row">
  <h2 class="recent-posts-head">最近更新：</h2>
  <p class="featured-entry">精选文章</p>  ← 右上角，常显
</div>
<ul class="recent-posts">    ← 5 条，日期 + 标题；**只取 posts，不含周刊**
<section class="latest-weekly">  ← 最新一期周刊：期号 + summary + 日期 + 订阅 RSS
```

- **文案全在 `content/_index.md`**，模板只负责分隔线、列表、周刊块和精选入口。
- **2026-11-21 的 Now 与代表作都已按用户要求移除**：Now 曾短暂放在周刊下方，
  随后整块删除（`shortcodes/now.html`、`partials/now-line.html`、front matter `now` 均已删）；
  `{{< projects >}}` 也未挂载，`layouts/shortcodes/projects.html` 与 `data/projects.toml`
  还在，加回一行即可恢复。
- **导航右侧的 `搜索 /` 与 `☾/☀` 是 JS 追加的**（`custom_body.html`），
  不在 `[[menu.main]]` 里。桌面 1280px 保持一行；390px 时工具栏折到第二行
  （`header nav` 高约 67px），这是接受的行为 —— 7 个菜单项本来就贴着折行临界。
  图标是内联 SVG（月亮 / 太阳），不再用 `☾/☀` 文字，尺寸规则在 `custom.css` 第 56 段。
- `.hl-section*` / `.hl-project-*` / `.hl-tag-pill` / `.hl-cmd-*` / `.hl-toolbar`
  样式全部在 `custom_head.html` 末尾的升级包 `<style>` 里（原样，不拆到 custom.css）。
  `.hl-project-*` 目前没有调用点（代表作区块未挂载），删掉也不影响构建。
- 2026-11-21：周刊从 `recent-posts` 移出，单独成块 —— 否则同一期会在首页出现两次。
  周刊块只取 latest 一期，摘要取 front matter 的 `summary`；完整列表在 `/weekly/`。
- 条数由 `params.homeRecentCount` 控制（当前 5），设 `0` 就退回上游原样（只剩正文）。

#### 2026-11-20：首页身份条

借花墨（flowersink.com）的「身份感」，但**不做头像、不做全屏 Hero**：在
「如果觉得…支持一下」前加一句数字，和它**同属一个段落、同一套正文样式**：

```
文章 113 篇，周刊 30 篇，运行 351 天。如果觉得我的网站不错，可以选择 支持 一下。
```

- 位置：`content/_index.md` 里写 `{{< home-stats >}}如果觉得…`，shortcode 只输出
  纯文本 `文章 N 篇，周刊 N 篇，运行 N 天。` —— **没有 span、没有 class、没有 `<br>`**，
  所以和后面的支持句同属一个 `<p>`，字号/颜色完全一样。
  标点 2026-11-20 由用户从 `·` 改成中文逗号，照现在的实现走。
- 数字在构建期算：`layouts/shortcodes/home-stats.html` 取 `site.RegularPages`
  的 posts / weekly 数量，天数取最早一篇 post/weekly 到 `now` 的整天数（含当天）。
  天数由 `.github/workflows/daily-rebuild.yml` 每天 00:10（Asia/Taipei）触发一次
  Cloudflare Pages 重建来前进；文章/周刊数在发布时自然更新。
  ⚠️ 静态站不每天构建时天数会停在最后一次构建；别为此加前端脚本。
- 2026-11-20 第二轮：初版是 0.85em 三级灰 + `<br>` 独立一行，用户要求
  「正常显示、连起来」，于是删掉 `.home-stats` 样式和换行，现在就是普通正文。
  **别再给它加样式或分割线。**
- 数量口径与 `/archive/` 一致：113 + 30 = 143 篇。

- `.recent-posts` 的样式在 `custom.css` 第 04 段：
  CSS Grid 两列（定宽日期 + 弹性标题），比上游 `ul.blog-posts` 的 `flex: 0 0 80px` 稳。
  ⚠️ 日期颜色用 `var(--text-color-tertiary)` 而不是 yinji 写死的 `#999` ——
  `#999` 在深色主题下对比度不足。
- ⚠️ **列表必须与 `Recent Posts:` 标题左对齐**（用户 2026-10-11 明确要求「靠近最左边，
  和 yinji.org 一样」）。靠 `.recent-posts { padding-left: 0 }` 顶掉上游
  `content ul { padding-left: 1.5em }`。实测两者左边界同为 x≈140（yinji 是 141/141）。
  **这条规则一旦失效，列表会缩进约 40px** —— 排查方向见下方「样式块里的注释泄漏」。
- ✅ **2026-10-11 第二轮：五个几何值全部改成 yinji 的值**（用户「按照 yinji 的设计」）。
  原本本站刻意做得更紧凑，现在逐值一致：

  | 规则 | 本站（旧） | 现在 = yinji |
  | --- | --- | --- |
  | `grid-template-columns` | `104px 1fr` | `120px 1fr` |
  | `time` 字号 | `.85rem` | `.95rem` |
  | `li` `margin-bottom` | `.85rem` | `1.2rem` |
  | `li` `line-height` | `1.5` | `1.3` |
  | `ul` `margin-top` | `1.4rem` | `2rem` |

  同时删掉本站多加的 `align-items: baseline` 与 `gap: 4px`（yinji 没有），
  以及原来的 `@media (max-width: 480px)` 单列回退（120px 定宽列在最窄内容区
  352px 下仍留 232px 给标题，实测不溢出，yinji 也没有这条）。
  **实测 A/B（同一视口、同一 `Recent Posts:` 标题排版）**：两站的
  h3 都在 y 52.5–66.5、首条文字顶都在 y 109.0、标题左边缘都在 x 260.0、
  行距都 29.0px —— **逐像素一致**。
- ⚠️ **简介正文不包 `<content>`**（2026-10-11 改，与 yinji 一致、与上游不同）。
  上游 `index.html` 是 `<content>{{ .Content }}</content>`；包着的话首页简介会吃
  `content { line-height: … }` 两条（当前是 **1.5**），结果是行高被拉松
  —— 首页简介走 `body` 的 1.5（yinji 也是 1.5）。
  去掉这一层之后两站首页的节奏逐项一致。`<hr>` / `<h3>` / `<ul.recent-posts>`
  本来就在 `<content>` 外面，不受影响。
  ⚠️ 2026-11-21 起 `content` 与 `body` 同为 1.5，但这一层仍然要留着：
  `<content>` 还带正文段距、`text-spacing-trim` 等块级规则，首页简介包进去
  会跟着正文的段落节奏走。实测首页整页 1.50、`li` 1.30，与改前逐值一致。

#### 那四个平台链接（2026-10-11）

| 顺序 | 标签 | 落点 |
| --- | --- | --- |
| 1 | 公众号 | **`/wechat/`**（站内独立页，2026-11-07 起。此前指向 `/images/gzh.webp` 二维码大图） |
| 2 | 少数派 | `https://sspai.com/u/hulatu/updates` |
| 4 | 知乎 | `https://www.zhihu.com/people/hulatu` |
| 5 | 即刻 | `https://web.okjike.com/u/25B20BAD-…` |

- 顺序是用户指定的，别按字母或热度重排。
- ⚠️ **公众号没有网页主页**，只能给二维码。2026-10-11 用户先选了「点开看大图」；
  **2026-11-07 升级成站内独立页 `/wechat/`**（内容 `content/wechat.md`，
  样式 `assets/css/custom.css` 第 38 段）。
  这一行**仍然是四个纯文字链接**，没有新增任何样式；只是第一个的落点从图变成了页。
- 新页面参考了 `zhheo/Wechat-Official-Account-Web`（微信公众号关注界面）的
  **信息架构** —— 二维码 + 「扫描关注」提示 + 公众号名/简介条 ——
  但**没有照搬它的代码和视觉**：原项目是 428px 卡片 / 16px 圆角 / 微信绿 `#1ba059` /
  系统字体 / 带作者自己 ICP 备案号的独立 footer，与本站（系统字体 / 4px 圆角 /
  墨水蓝 `#1D4ED8` / 无投影 / 无第三方请求）是两套语言。这里全部走本站 token。
- ⚠️ **原项目的 `?replyText=` 参数没有引入**：用户 2026-11-07 明确不要
  「关注并回复 XX 领取」。所以这一页**零 JS**。
- ⚠️ **地址的唯一真相来源是 `content/about.md` 的「平台」段**，改的时候两边一起改。

#### 支持入口与 `/donate/` 页（2026-10-11）

首页那句「如果觉得我的网站对你有帮助，可以选择 **[支持]** 我」里的 `支持`
是一个**站内链接**，指向独立页 **`/donate/`**（`content/donate.md`）。

> 用户原话：「首页的『支持』链接里放之前赞赏我的二维码」。
> 两个二维码（微信 + 支付宝）**只有一个**，没有第二个候选方案 ——
> 在「首页就地展开 / 独立页 / 点开看大图」三选一里，用户选了**独立 `/donate/` 页**。

- 这一页是**从旧自建主题搬回来的**：旧站的打赏块是
  `layouts/partials/donate.html` + `hugo.toml` 的 `[params.donate]`，挂在**关于页**里；
  迁移到上游 hugo-bearneo 时整块（含 `[params.donate]`）被删，
  只剩 `static/images/donate/` 两张图没删 —— 这次就是把这笔资产重新接上。
- **两个码常显**，没有折叠。这一页本身就是内容，不需要「别抢戏」的折叠。
- 布局：`.donate-qrs` 是 `grid` + `repeat(auto-fit, minmax(150px, 220px))` +
  `justify-content: center`。宽屏两列、每列被 `220px` 卡住并整行居中
  （**不用 `1fr`** —— 那会把两个码推到内容区最左最右、中间空一大块）；
  窄屏自动落成一列。
- **收款码是站内静态资源**（`/images/donate/*.webp`，440×440 / 435×435，
  自带白静区、无损 WebP），不走图床、不套 Cloudflare 变换。
  ⚠️ **换码姿势**：把新图裁成「二维码本体 + 白静区」的正方形 webp 覆盖同名文件，
  然后去 Cloudflare 后台 Purge 一次 `/images/donate/*` —— 那条路径配了 30 天缓存，
  不 purge 的话老访客看到的还是旧码。
- 收款方显示名沿用旧配置的 `hututu(**朋)`，写成行内代码（`` `…` ``）而不是裸文本 ——
  裸写 `**` 在 Markdown 里是强调符，靠「后面没有配对的 `**`」才没被解析成粗体，不值得赌。
- front matter：`hideDate: true` + `toc: false`（与 `/about/` 同一套）+ `noindex: true`
  （与 `/privacy/` 一致 —— 两者都是「不是内容」的站点家具页）。

### 关于页 `/about/` 的介绍块（2026-10-11，**没有头像**）

**2026-11-21**：当天曾加过 `{{< about-mac >}}`「关于本机」卡片，随后**按用户要求移除**：
`content/about.md` 的调用、`layouts/shortcodes/about-mac.html` 与 `.hl-mac-*` 样式
均已删除。正文重新从「大家好」开始，第一个元素是普通段落；「全站没有头像」这条不变。

正文最上面那块「名字 + 一行简介 + 关注方向」现在是一段**最朴素的 Markdown**：

```
胡拉图（朋朋）
食品领域研究生 · 郑州
记录思考、跑步、写作；分享一些工具折腾经历。
关注方向： 跑步 / 写作 / 工具折腾 / 思考 / 观察
```

- 结构就在 `content/about.md`：`# 胡拉图（朋朋）` + 三段文字，**没有包任何 div**；
  `custom.css` 第 03 段**刻意留空**（保留段号是为了不动 04~08 的编号，与 06 段同一做法）。
- **全站没有头像**：页头与关于页都不显示，`static/images/avatar.webp` 也已删除。
- ⚠️ **别再给关于页加头像**。若哪天要加：主题的全局 `img { margin-left:auto; margin-right:auto }`
  在列方向 flex 里会盖过 `align-items`，窄屏要把 `margin` 显式归零；两栏时左栏必须 `min-width: 0`。
- 首尾元素的 16px 外边距：2026-10-11 去掉页面标题时，介绍块是首元素，上边距会折叠穿透；
  2026-11-21 标题恢复后，介绍块回到标题下方，这条不再适用。
  ⚠️ 别为了「消掉它」再加 `content > :first-child { margin-top: 0 }`：
  那条规则 2026-10-11 已删，它会把首行顶到导航栏下面（见第 5 节第 ③ 条规矩）。
- **页面标题 2026-11-21 起恢复显示**：用户要求 `/about/` `/roll/` 与文章页 / 周刊页一致，
  两页不再写 `hideTitle: true`。此前 2026-10-11 曾照 yinji 把标题整行藏掉
  （理由：导航已经在指示位置）；现在标题由站点层 `single.html` 正常输出 `<h1>`。
  `hideTitle` 开关仍保留，供 `/contact-qq/`、`/contact-wechat/` 等极简页使用。

### 关于页 `/about/` 的章节结构（2026-10-12 并入原 Hub；2026-11-03 撤掉内容平台）

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

⚠️ 这一页的章节顺序（改之前想清楚，TOC 是从这里生成的）：
`介绍（无标题）→ 这个站 → 联系我 → 写作统计`（3 个 h2；TOC 自动生成）。
2026-11-21 用户要求把「这个站」从页尾移到「联系我」上面。新增小节
**照常写 `## 标题` 就行** —— 拼音锚点在构建期自动生成（见 8.1），
md 里**不要**再手写 `{#pin-yin}`。

### 联系页 `/contact/qq/` 与 `/contact/wechat/`：一页一码（2026-11-20）

关于页「联系我」里的 QQ 与微信，原来各是一条指向图床裸图的链接
（`img.hulatu.com/post/…webp`），点开是浏览器缩放的图片。用户要求
「设计成公众号的二维码一样」，最终做成**分开、每页只放一张**的两个独立页：

| 页面 | 内容文件 | 二维码 |
| --- | --- | --- |
| `/contact/qq/` | `content/contact-qq.md` | `paIl9a.webp`（954×954） |
| `/contact/wechat/` | `content/contact-wechat.md` | `qbD1Mk.webp`（762×762） |

- ⚠️ 两个文件都在 content 根目录，用 front matter 的 `url:` 落到 `/contact/` 下面。
  **不要**改成 `content/contact/` 目录 —— 那会生成一个 `/contact/` 章节页
  （list.html 会输出标题 + 子页列表），与「每页一张图」的目标不符。
  现在 `/contact/` 本身是 404，关于页直接链到两个子页。
- **视觉完全复用 `/wechat/`**：每页就是一个 `.oa-wrap`（256px 居中）：
  `.oa-qr` + `.oa-tip` + `.oa-profile`。全部样式来自 `custom.css` 第 38 段，
  **零新增布局样式**（同页双码时期的第 49 段已随改版删除）。
  改二维码的边框 / 圆角 / 信息条尺寸，`/wechat/` 与这两页会一起变 —— 这是故意的。
- **信息条**：头像沿用 `/images/wechat/avatar.webp`（站点标识 H，不是真实头像），
  名字「胡拉图」+「扫码加我好友」，与公众号页同一套语言。
- **素材仍是图床地址**。`.oa-qr` 固定 256×256 并加了 `object-fit: contain`，
  非正方形时留白、不拉变形。要本地化就下载到 `static/images/contact/qq.webp` /
  `wechat.webp`，再改对应 md 里的 `src`。
- 页面设置与 `/wechat/` 一致：`hideTitle` / `hideDate` / `toc: false` / `noindex: true`。
  导航里没有这两项，入口只在关于页的「联系我」。

### 收藏 `/roll/`（2026-10-11 照 yinji 改成平铺）

导航里的「邻居」指向的就是这一页。**全站唯一的链接清单**（友链页 `/links/` 已删，301 到这里）。

形态**照 yinji.org/roll，2026-11-21 又补了页尾**：

```
<title>收藏 | 胡拉图说</title>     ← 标题只在这里 + 导航高亮
[没有 h1]
这里是我常读、常逛的地方，还有几个我认识的朋友。…
朋友
• 花墨：一个很有设计感、很温暖的网站。
• Cytrogen：…
• 梁某银的博客：…
组织
• …（共 10 条聚合站 / 组织）
…更新中
交友原则
• 双向链接 …（链接蓝圆点 + 加粗引导词）
[写信给我]（友链申请）
我的友链信息
• 网站名称 / 地址 / 描述 / LOGO / 邮箱
```

- **页面标题 2026-11-21 起恢复显示**（用户要求与文章页 / 周刊页一致）；
  此前照 yinji 用 `hideTitle: true` 藏掉，现在 front matter 不再设该键。
  `hideDate: true` 仍保留（独立页不挂日期）。
- **分组用轻量标签，不用 `##` 小标题**（2026-11-21 第五次改版）：
  `<p class="roll-group">朋友</p>` / `<p class="roll-group">组织</p>`，
  样式在 `custom.css` 第 49 段（0.8rem 小字，无右侧延长线）。这样既重新显出分组，
  又不会进右侧目录、也不会把平铺页切成章节。**别改成 `##`**。
- 2026-11-21 第六次改版在页尾加了「交友原则」与「我的友链信息」，
  参考花墨的 `/link/`；原则是普通列表，信息是小列表。
  仍然**不新增 `##` 标题**，页面的平铺结构不变。
- **2026-11-21 排版美化（第七次）**：`content/roll.md` 的 front matter 加
  `bodyClass: "roll-page"`，样式在 `custom.css` 第 55 段。
  朋友 / 组织两列去掉圆点，改成**无横线**的链接行（名称加粗、点评次级灰、
  悬停时名称变链接蓝并出现下划线，**不再让其余行变淡** —— 用户明确不喜欢这个效果）；
  交友原则改成 **5px 链接蓝圆点 + 1.3em 悬挂缩进**，引导词用 `<strong>` 加粗
  （2026-11-21 晚；不再用 `01–05` 编号，也不用浏览器默认 disc）；
  同一套圆点已推广到全站正文列表（`custom.css` 第 02b 段），`/roll/` 因 `bodyClass` 单独保留；
  「我的友链信息」变成 12px 圆角的浅色信息块（无边框、无内部横线）。
  ⚠️ 第 55 段用 `content > ul:nth-of-type(1..4)` 定位四段列表
  （1 朋友 / 2 组织 / 3 原则 / 4 信息）。**往 `roll.md` 加删列表必须同步改选择器**，
  否则样式会套错段。
- ⚠️ **别再拆回两页**（`/links/` 已 301 到 `/roll/`），也**别把链接并成两栏**。
- 条目格式 `- [名称](地址)：一句话点评`，冒号后是作者自己写的点评。
  ⚠️ 列表项里不要在 `</a>` 和中文冒号之间手写空格（见第 5 节 `render-link.html`）。
- 结尾照 yinji 补了一行 `&hellip;更新中`，原则与友链信息排在它后面。
- ✅ **分组靠 `.roll-group` 轻量标签**（2026-11-21 第五次改版）：
  `<p class="roll-group">朋友</p>` / `<p class="roll-group">组织</p>`，
  样式在 `custom.css` 第 49 段（0.8rem 小字，无右侧延长线）。
  历史：2026-10-11 曾用「## 朋友 / ## 博客聚合平台」，随后照 yinji 删成平铺；
  2026-10-11 晚用裸 `<hr>` 分隔；2026-11-21 换成现在的标签，**不是 `##`**。
- **2026-11-21 晚：整页去线**（用户：「不要有那么多分割线」）：
  `.roll-group` 去掉右侧延长线，朋友 / 组织列表去掉逐行 `border-bottom`，
  信息块去掉外边框与 `li + li` 内部横线，只保留浅色底。分隔只靠字号、字重与间距。
- ⚠️ **裸 HTML 块会把页面拆成两个 `<ul>`**（3 条朋友 + 10 条组织）——
  Goldmark 遇到块级 HTML 就会封闭当前列表。这是**预期行为**：
  视觉上仍是连续的，语义上也正好是两组（屏幕阅读器会说「列表，3 项」+「列表，10 项」）。
- `hideTitle` 2026-11-21 起**不再用于 `/roll/` `/about/`**（两页恢复标题）；开关仍保留给联系页。

### 跑步 `/run/`（2026-10-12 从子站搬回）

**这一页原来是个独立子站 `run.hulatu.com`**（源码 `sites/run/`）。2026-10-12 用户要求
「把 `run.hulatu.com` 变成 `hulatu.com/run`，把网页变成我博客里的一个页面」，于是：

- **正文**由 `layouts/_default/run.html` 从 `hugo.Data.runs`（= 仓库根 `data/runs.json`）
  渲染 —— `content/run.md` 里只有导语一句话，**一个数字都不写在页面里**。
- **数据来源没变**：`data/runs.json` 每天由 CI 的 `scripts/sync-garmin.py` 刷新；
  子站当年也只是靠 `[[module.mounts]]` 挂载同一个目录，**从来没有第二份副本**。
- **结构**：`<h1>跑步</h1>` → 导语 → `## 总览`（8 格）→ `## 近期状态`（4 格）→
  `## 个人纪录`（4 格）→ `## 年度汇总` → `## 月度里程`（柱状图）→ `## 全部记录`
  （按年 `<details>`，最早那一年默认展开）→ 一行「数据更新于 …」。
- **样式**在 `assets/css/custom.css` 第 25 段（2026-11-06 前按 `.RelPermalink` 守卫，抽外部文件后守卫退役）。

⚠️ 这一页**没有**面包屑 / TOC / 评论区 —— 它走自己的模板，根本不经过 `single.html`，
所以 `$longForm` 那一整套（系列带、上下篇、giscus、标题锚点）都不适用。
⚠️ **柱状图用 `--link-color`**，不引入第三种颜色（404 页的主按钮也是它）。
⚠️ **月度柱状图的横向滚动条（2026-10-26 改）**：原来 `.month` 最小 48px、`gap` 6px，
15 个月最少要 **804px**，而正文只有 680px → **桌面端也一直在横向滚动**，每个访客都看得见
一条 15px 高的原生滚动条压在 200px 的图里。现在三处一起改：`.month` 最小 **38px**、
`gap` **4px**（15 个月 **626px** < 680px，桌面端**不再溢出、滚动条消失**）；真的溢出时
（手机、或月份涨到 17 个以上）滚动条走 `scrollbar-width: thin` + `::-webkit-scrollbar{height:6px}`
**6px**、轨道透明、滑块 `--border-color` 圆角；`padding-bottom: 6px` 给滑块留一条独立槽，
不压住 `25-05` 那行月份标签。⚠️ 别图省事改成 `overflow-x: hidden` —— 手机上一屏只放得下
8 个月，藏了滚动条就没人知道右边还有 7 个月。⚠️ `.month-key` / `.month-value` 的 `0.72rem`
别再调大：41px 的格子刚好装下 5 个字符，调大会让相邻标签叠在一起。
⚠️ 子站 `sites/run` **2026-10-12 晚已随全部子站一起删除**（下线前它只剩一条
`/* → https://hulatu.com/run/ 301`）。配合 Cloudflare 侧撤掉 CNAME，
`run.hulatu.com` 现在**既不解析、也没有内容**。要让旧域名重新跳过来，需要重建
CNAME + 一条 301（重建子站项目，或在 Cloudflare 配 Bulk Redirect）。

### 归档 `/archive/` 与周刊 `/weekly/`

两页都走「上游 `list.html` 的形态」：**篇数 + 按年分组的列表**。
**2026-11-21 起搜索框全部移除**（用户要求）：归档页的 `search-box.html`、`postSearch`
参数与 CSS 高亮样式**已彻底删除**（不是隐藏）；全站搜索走 `⌘K` / `/` 命令面板。

- `/weekly/` 用站点层 `layouts/_default/list.html`（上游那份的 5 处界面文案英译中 + 删标签墙）。
  **2026-11-21 起不显示一句话导语**：`list.html` 只给非 weekly 的 section 传 `desc=true`。
- `/archive/` 用 `layouts/_default/archive.html`（**站点层新增**，因为 `/archive/` 是普通内容页
  不是 section，上游没有对应模板）。内容 = `posts` + `weekly` 全部 143 篇，按年分组。
- **2026-11-21：计数行改成「共 143 篇，随机阅读一篇。」**，随机入口从页脚移到这里。
  结构照 `/weekly/` 的「共 N 期，请订阅 RSS」：`#post-count` 只包计数，
  随机链接在同一个 `<p>` 里、但**在 span 外面**（`#post-count` 只包计数；
  2026-11-21 前那个过滤脚本会重写 span 的 `textContent`，放进去会被抹掉，
  以后若再加过滤逻辑也照此办理）。点击由 `custom_body.html` 的
  `#archive-random` 监听，读 `/index.json` 随机跳一篇；无 JS 时回落到 `/archive/`。
- **2026-11-21 晚排版微调**：年份标题后面补「N 篇」（`ul.blog-posts .year-count`，
  三级灰、0.62em）；计数行下面新增「分类 / 系列」双入口，见下。
- ⚠️ **两页都有页面级 `<h1>`**（归档「归档」、周刊「周刊」）；列表页没有 h1 的是首页和词条页。
- ⚠️ **都没有分页**（上游不用 `.Paginate`）。`/weekly/page/1..3/` 与首页 `/page/*` 的旧地址
  在 `static/_redirects` 里 301 兜底。
- ⚠️ **都没有标签墙**（上游 `list.html` 底部会铺全部标签，本站 187 个，五屏蓝色链接）。
  用户在 2026-10-10 明确不要标签云，`/tags/` 索引页也一并 `disableKinds` 关掉
  （`/tags/xxx/` 词条页仍然生成，文章下方的标签链接照常可用）。

#### 全局命令面板（2026-11-21）

`layouts/partials/custom_body.html`（升级包原版）在任何页面底部输出对话框：
按 `⌘K` 或 `/` 呼出，搜标题与摘要（摘要取正文前 1000 字），`↑↓` 选择、`Enter` 跳转、`ESC` 关闭。

- **索引仍是 `layouts/index.json` 的 `/index.json`**，字段 `t/u/g/d/k`。
  升级包原版读 `{title,url,summary,date,section}`，所以 `custom_body.html` 的
  `loadIndex()` 里做了一次字段映射（`t→title`、`u→url`、`d→summary`、`g[0]→section`）。
  ⚠️ 别把 `/index.json` 换成升级包自带的 `_default/index.json`：本页面板还靠
  `t/u/g/d/k`，换了会把命令面板的搜索弄坏。
- 面板**第一次打开时才 fetch 一次**，之后缓存在内存里；索引约 500 KB / gzip 约 215 KB（随文章数浮动）。
- 空查询展示最近 10 篇 + 「随机读一篇文章」+「切换深浅色」两条快捷指令。
- `/archive/` 原来那份页内搜索框 2026-11-21 晚**已彻底删除**（partial、`postSearch`
  参数、CSS 47 段的高亮规则都没了），恢复要从 git 历史取回。
  ⚠️ 如果哪天再加输入框，记得补回 `/` 的 `typing` 守卫。
- ⚠️ `baseof.html` 里原来那份「`/` 跳 `/archive/#search-input`」的脚本已删；
  别再加第二份 `keydown` —— 两处同时监听会一次开两个面板，或面板打开后页面又跳走。
- 样式在 `custom_head.html` 末尾（`.hl-cmd-*`），面板 520px / 12px 圆角 / 模糊遮罩。

#### 「分类 / 系列」入口与总览页（2026-11-03 定稿；2026-11-21 晚补分类）

`/archive/`（导航 Posts）顶部在「共 N 篇。」下面、文章列表上面只有一行入口：

```
分类　8 类 · 143 篇　　系列　3 组 · 23 篇
```

点进 **`/categories/`** 或 **`/series/`** 才是完整总览；归档页**不再铺开任何篇目**。

- **别把篇目搬回归档页，也别把「分类 / 系列」塞进主导航** —— 入口只属于 Posts 顶部。
- 入口样式 `.series-entry`：一行内联链接，标签加粗、`N 组 · N 篇` 走三级灰；
  **无边框、无底色、无卡片、无箭头**（箭头 2026-11-03 按用户要求去掉）。
  `.archive-browse` 负责多入口的 flex 间距与换行。
- 总览页模板 `layouts/_default/series.html`，内容页 `content/series.md` 只放
  title / description / 一句 intro，front matter 是 `layout: "series"`、`hideDate: true`、
  `toc: false`。
- 总览页每行是 `序号 | 标题 | 日期` 三列 grid：标题在中间列自由换行（**不截断**），
  日期贴右、与首行基线对齐；行间只靠间距，没有发丝线。
- 站里现有 **3 组 23 篇**：跑步 14 / 综述写作 5 / 居家流水账 4，靠 content 的
  `series:` 字段表达（**字符串，一篇只能属于一个系列**）。`series: ""` 是空值，不算一组。
- 数据口径（入口计数、总览页、文章页文末的系列带）**三处一致**：
  `where $posts "Params.series" $name` + `.ByDate`（升序 = 连载顺序）。
- 系列名旁边的标题前缀（「综述写作之-」「居家流水账-」）会剥掉，
  完整标题留在 `title` 属性里（悬停可见）。三处剥法一致。
- 样式：入口在 `assets/css/custom.css` 第 09 段，总览页在 09b 段（2026-11-06 前各有守卫，抽外部文件后守卫退役）。**没有印章红**，只用正文色 + 三级灰。

#### 分类总览页 `/categories/`（2026-11-21 晚新增）

分类词条页 2026-10-26 起就存在且可索引，但一直没有站内入口。现在 `/archive/` 顶部和 `/map/` 都链到 `/categories/`。

- `hugo.toml` 的 `disableKinds = ["taxonomy"]` 仍然关着：关的是 `/categories/` 与 `/tags/` 两个**索引页**，词条页 `/categories/<词>/` 照常生成。**不要打开 taxonomy kind** —— 会把 232 个标签索引页一起放出来。
- `/categories/` 用普通内容页 `content/category.md`（`layout: "categories"` + `url: "/categories/"`）占位，模板 `layouts/_default/categories.html` 读 `.Site.Taxonomies.categories`。
- 每行：名称 + 篇数（右对齐）+ 描述；按篇数从多到少。当前 8 个分类共 143 篇。
- 样式在 `custom.css` 第 58 段：单列、无卡片、无分割线，hover 只把名称变链接蓝。
- 词条页的标题 / 描述来自 `content/categories/<词>/_index.md`；改描述会同时改这一页和词条页。

### 文章页

- **面包屑** + `<h1>` 标题 + 日期行（`.byline`，15px，三级灰；一行 flex + 间距） + 副标题 `.dek`（0.9em，三级灰） + 正文 + **标签行** + **文末两段导航** + 评论区 + **电脑端右侧目录**（>1200px；≤1200px 用正文顶部折叠目录）。顺序是 2026-11-06 晚调的：之前副标题夹在标题与日期行之间，用户要求日期行紧贴标题下方。
- ⚠️ **文末只有标签行，没有分类行**。分类的入口在页首面包屑的第三段
  （`首页 / 收藏 / 工具`），文末再来一遍是重复；标签才是文章页独有的，所以只留标签。
  ⚠️ 想找分类入口看 `layouts/partials/breadcrumbs.html`，**别再加回文末那一行**。
- **标题行可以整行藏掉**：front matter 写 `hideTitle: true`（站点层 `single.html` 识别）。
  目前用于 `/contact-qq/`、`/contact-wechat/` 这类极简联系页；`/roll/` `/about/`
  2026-11-21 起恢复显示标题，不再设该键。与 `hideDate` 是两个独立开关。
- **日期行可以单独藏掉**：front matter 写 `hideDate: true`（站点层 `single.html` 识别）。
  用在 `/about/`、`/now/`、`/roll/`、`/donate/` 这几个独立页 —— 它们挂一个「最后修改于某天」
  没有意义。⚠️ **`date` 字段本身别删**，RSS / og meta 还要用。
- 上游原本把标题和日期**写死给 `blog` 段**，导致 `/weekly/` 的 25 篇、`/about/`、`/privacy/`
  全都渲染成「没有标题没有日期的裸正文」。站点层去掉了这层条件。
- **代码块没有红绿灯**（复制按钮 2026-10-11 已加回，见下节）—— 上游只有 `pre code` 的底色和圆角。

#### 代码块的语法配色（2026-10-11 **修复**，不是新增）

> 用户原话：「我的博客代码区域的色彩显示，阅读体验不太好」

**先说实话：改之前它不是「不好看」，是「看不见」。** 详见 `custom.css` 第 12 段。

```
改前（monokai 内联色 vs 主题强制的浅色底 #f2f4f7）
  普通标识符 #f8f8f2   对比度 1.03:1   ← 完全看不见
  函数名     #a6e22e   对比度 1.41:1   ← 完全看不见
  字符串     #e6db74   对比度 1.29:1   ← 完全看不见
  数字       #ae81ff   对比度 2.58:1   ← 几乎看不见
  关键字     #f92672   对比度 3.44:1   ← 勉强
  注释       #75715e   对比度 4.45:1   ← 勉强
```

改后**每一个 token 都在 WCAG AA（≥4.5:1）以上**，浅色 / 深色各一套（配色表见第 2 节「代码块配色」）。

- 底色**沿用** `--bg-color-secondary`，与行内 `code` 同一个底；两者靠 1px 边框区分，
  不靠换底 —— 这样代码块不会在页面里「打补丁」。
- **修法的关键在 `hugo.toml`，不在 CSS**：必须 `[markup.highlight] noClasses = false`
  让 Chroma 别再写内联样式，CSS 才够得着它。**改回 `true` 会立刻退化回「看不见」。**
- 配色在 `assets/css/custom.css` 第 12 段（2026-11-06 前只给含代码块的 5 个页面输出，抽外部文件后全站共用）。

实测（`/posts/2026/10/07/engineering-students-use-macbook/`）：像素采样确认底色 `#f2f4f7`，
字色分别是 `#0a3069`（字符串，最多）/ `#656d76`（注释）/ `#24292f`（标识符）/ `#cf222e`（关键字），
**内联 monokai 色 0 处残留**。

- **图片带 `width` / `height`**（2026-10-12）：正文 `<img>` 都带真实宽高（取自
  `data/image-dims.json`），加载前就占好版面 → 无 CLS。⚠️ 配套**三件套缺一不可**：
  ① 数据文件 `data/image-dims.json` ② `render-image.html` 输出属性 ③ 第 21 段的 `img { height: auto }`。
  少了 ③ 时 `height` 会当硬高度生效，图会被**竖向拉伸**（实测旧产物 21 张图全部塌成 720×2px）。
- **图片有 CSS-only 放大**（`imageZoom = true`）：点图弹近黑遮罩 + 右上角 ✕。
  纯 `:checked` 实现，没有 JS，也没有上一版那个带 `focus-trap` 的灯箱。

#### 面包屑（2026-10-11 新增，只有文章页有）

```
首页 / 文章 / 工具                    ← 普通文章（101 篇，3 段）
首页 / 周刊                          ← 周刊（25 期，2 段）
────────────────────────────────────
# 工科研究生用 Mac，也可以很完美
```

**第三段是分类**。下面先讲为什么只给文章页挂，再讲三段各是什么。

**全站 327 页分四类，只有文章页真有层级**，所以只给它挂：

| 类型 | 页数 | 挂不挂 | 为什么 |
| --- | --- | --- | --- |
| 文章页 `/posts/年/月/日/slug/` | 126 | ✅ | 有层级：首页 → 文章/周刊 → 本篇 |
| 标签 / 分类词条页 | 221 | ❌ | 顶部就是页面标题（2026-10-26 起是 `{{ .Title }}`，如「思考」）+「全部文章」返回链接，再加「首页 / 思考」是重复 |
| 首页、`/about/`、`/roll/`… | 8 | ❌ | 一级页面，**导航高亮已经指示位置**；「首页 / 关于」是纯冗余 |
| `/archive/` `/weekly/` 列表页 | 2 | ❌ | 同上（一级页面） |

⚠️ 第三类里的 `/roll/` `/about/` 是**一级页面**，不加面包屑（导航高亮已经指示位置）。2026-11-21 起两页恢复页面标题，但标题上方仍然不要补面包屑。

**三段各是什么**：

| 段 | 文本 | 落点 | 说明 |
| --- | --- | --- | --- |
| 1 | 首页 | `/` | 固定 |
| 2 | **文章** / **周刊** | `/archive/` / `/weekly/` | 按 `type` 分：`posts`→文章（导航里那项 `Posts` 就是 `/archive/`）；`weekly`→周刊 |
| 3 | **分类名** | `/categories/<分类>/` | 取 `.GetTerms "categories"` 的**第一个** |

**第三段的两个判断**（都是实测过才这么写的）：

- ⚠️ **周刊刻意不加第三段**。周刊文章的 `categories` 就是 `["周刊"]`，
  与第二段的栏目名**一模一样** → 加了会变成「首页 / 周刊 / 周刊」。
  **这不是漏写，是「栏目名 == 分类名」时去重。**
  所以 25 期周刊是 2 段、101 篇普通文章是 3 段（实测 `{3: 101, 2: 25}`）。
- ⚠️ **每篇只有一个分类**（实测 126 篇 / 8 个值 / **无多分类**），所以直接取第一个。
  万一以后出现多分类的文章，这里只会显示**第一个** —— 面包屑本来就只表达一条路径，
  多分类要全列出来是另一件事。
- 取分类用 `.GetTerms "categories"` 而不是 `.Params.categories`：
  前者给的是**词条页对象**（有 `.LinkTitle` 和 `.RelPermalink`），
  后者只有字面字符串，还得自己拼 URL。
- 8 个分类的词条页**都真实存在**（`/categories/思考/` 等），所以第三段一定点得进去。
  实测面包屑里出现的分类分布与内容层完全一致：
  思考 38 / 记录 17 / 工具 16 / 运动 11 / 学习科研 10 / 饮食 5 / 健康 4（**不含「周刊」**）。

**只显示「祖先」，不显示当前页标题** —— 这是与常规面包屑唯一的不同：

- 紧接着就是 `<h1>`，同一个标题连着写两遍是冗余；
- 本站标题偏长（「工科研究生用 Mac，也可以很完美」17 字），
  窄屏上最后一段必然折行，把这一行撑成两行。

⚠️ **SEO 那份不受影响**：JSON-LD 里是**完整的**（首页 / 文章 / 分类 / 当前文章，**4 段**；
周刊是 3 段）。视觉精简 + 数据完整，两者不冲突。
实测 **127** 页的 JSON-LD 全部能被 `json.loads` 解成 `BreadcrumbList` 对象，
`itemListElement` 长度 = 可见段数 + 1，且 `position` 从 1 连续。
（验收：`grep -rl BreadcrumbList public | wc -l` 应等于长文页数。）

**样式**（`assets/css/custom.css` 第 13 段，2026-11-06 前挂在 `$longForm` 上）：
字号 `0.85rem`、颜色 `--text-color-tertiary`（**默认不抢眼**，悬停才变 `--link-color`）、
**无底色 / 无边框 / 无圆角**，分隔符 `/` 由 CSS 的 `li + li::before` 画 ——
与首页那行平台链接（`公众号 / 少数派 / …`）同一套写法，**别改成 `›` 或 `>`**。

**实测几何**（2x 截图按行统计暗像素）：

| 量 | 值 |
| --- | --- |
| 面包屑墨迹带（3 段：首页/文章/学习科研） | y 144.5 – 156.0，高 **11.5px**，横跨 x 143 → 299（宽 **156px**） |
| 导航底 → 面包屑顶 | **26.5px** |
| 面包屑底 → `<h1>` 顶 | **30.5px** |
| 周刊页（2 段） | y 144.5 – 156.0，横跨 x 143 → 213（宽 **70px**）—— 位置与 3 段完全相同 |
| **窄屏 420px 下** | y 144.0 – 156.0，高 **12.0px** —— 与宽屏的 11.5px 基本一致，**不折行** |
| 对照：`/roll/`（无面包屑）导航底 → 正文首行 | **28.0px**，未被影响 |

⚠️ 最长的组合是「首页 / 文章 / 学习科研」（4+2+4 字 + 2 个分隔符），
在 352px 内容宽下墨迹只有 149px，**离折行还有很大余量**。
新增分类后**总段数仍是 3**，宽度没有质的变化。

**实现要点**（细节全写在 `layouts/partials/breadcrumbs.html` 的注释里）：
- JSON-LD 与 `<nav>` 在**同一个 partial** —— JSON-LD 允许出现在 `<body>` 里，
  不必为了「规范」把它拆去 head 再算一遍层级。
- ⚠️ `<script type="application/ld+json">{{ $ld | jsonify | safeJS }}</script>`
  **三个坑**：① 不加 `safeJS` 整段 JSON 会被包成**带引号的 JS 字符串**（Schema.org 不认）；
  ② 中间**不能插任何别的过滤器**（它们把 `jsonify` 的 `template.HTML` 降级成普通 string，
  后面再加 `safeJS` 也救不回来）；③ `replace` **不能走管道**
  （Go 模板把管道值当**最后一个参数**，而 Hugo 的 `replace` 要它当**第一个**）。
  好在 `jsonify` 自己就会把 `<` `>` `&` 转义成 `\u003c` `\u003e` `\u0026`，
  所以**不需要**任何额外的 `</script>` 加固 —— 加了反而错。

#### 文末推荐（2026-10-11 新增，只挂长文页；2026-11-21 改为三选一）

顺序：标签行 → **文末推荐（三选一）** → 评论区。

2026-11-21 用户明确要求「文末的文章推荐，只显示一个项」：下面三块**互斥**，
按优先级只渲染第一块成立的：

| 优先级 | 块 | 触发条件 |
|---|---|---|
| ① | 系列坐标带 | 属于系列且 `len $seriesGroup > 1`（23 篇） |
| ② | 相关文章（最多 4 条） | 没有系列带，且 `$related` 非空（120 篇） |
| ③ | 全站上一篇 / 下一篇 | 没有系列带，且 `$related` 为空（当前 0 篇，兜底） |

所以一篇文章的底部**永远只有一块推荐**，不会出现「系列带 + 相关文章 + 上下篇」
叠在一起的情况。相关文章也不再显示推荐理由（`#标签` / 「同分类」已删），
每条右侧恢复显示日期。

**① 系列坐标带**（只有连载文章有，23 篇）

```
────────────────────────────────────────────  ← 发丝线
系列 · 综述写作                       第 2 / 5 篇   ← 「系列」是链接，回 /series/#该系列
上一篇  1  确定主题
下一篇  3  投喂文献（上）
```

- 数据口径与 `/series/` 总览页**完全一致**（同一个 `series` 字段 + `.ByDate` 升序），
  所以两处的「第 N / M 篇」必然一致。**改一处要回来对另一处。**
- ⚠️ 只有 `len $seriesGroup > 1` 才渲染 —— 单篇的「系列」是自相矛盾的。
- **「系列」两个字是指向 `/series/` 总览页的链接**（2026-11-03 起；2026-11-21 起
  直接跳到该系列的锚点，例如 `/series/#综述写作`）—— 读者在系列中段也能一键回到
  这一组的全部篇目；别把它改成普通文字。
- ⚠️ 系列内上下篇用 `index $seriesGroup (sub $seriesPos 2)` 求，
  **别用 `.NextInSection` / `.PrevInSection`** —— 那两个按 section 的全站日期序，
  会把系列之外的文章算成邻居。

**② 相关文章**（没有系列带时才渲染，最多 4 条）

- 来源：`site.RegularPages.Related`，权重 `tags 200` / `categories 50`、阈值 20，
  全部在 `hugo.toml` 的 `[related]` 里，不在模板。
- 2026-11-21 起先扫 12 条、过滤后再截 4 条；非系列文章排除时间线上下篇
  （系列文章整块不渲染，所以不存在重复）。每条右侧只显示日期，**不显示推荐理由**。

**③ 全站上一篇 / 下一篇**（没有系列带、也没有相关文章时才渲染，兜底）

```
────────────────────────────────────────────  ← 发丝线
上一篇                                    下一篇
综述写作之-确定主题        写给2025年12月考研的朋友
```

- 口径：`posts` + `weekly` 合起来按 `.ByDate.Reverse` 排一列，当前页下标 `i`，
  `i-1` → 更新的那篇（标「下一篇」）、`i+1` → 更早的那篇（标「上一篇」）。
  **即「上一篇 = 更早、下一篇 = 更晚」**，与系列带的上下篇方向一致
  （系列带也是 上一篇 = 升序里更靠前 = 更早）。两处方向必须一致，
  否则同一页里两个「上一篇」会指向相反的方向。
- ⚠️ **别用 `.PrevInSection` / `.NextInSection`**：那是 section 内的顺序，
  weekly 和 posts 会被割成两条线，周刊的邻居就丢了。
- ⚠️ 两列 `grid` 而不是 flex：`1fr 1fr` 让左右两栏宽度相等，长标题不会把另一条挤扁。
- 最新一篇没有「下一篇」、最早一篇没有「上一篇」—— 模板会补一个
  `.post-nav-empty` 空槽（`visibility: hidden`）占位，否则只剩一条时会掉到左边那列。
  （2026-11-21 起这一块当前不渲染，空槽逻辑保留给兜底场景。）
- **2026-11-03 起，系列文章不渲染这一块**（2026-11-21 起「有相关文章」也不渲染）：
  系列带已经给了组内上一篇/下一篇，再出一组同名的「时间线前后」会让读者分不清
  两个「上一篇」。`.post-series + .post-nav` 那条「相邻时去边框」的规则随之删除。
- 样式在 `custom.css` 第 09 / 10 段，**没有印章红**。
- ⚠️ 历史：文末「上一篇 / 下一篇」2026-10-05 曾整条删过一次（当时的理由是它和相关文章
  `if/else` 互斥、从没渲染过）。2026-10-11 用户要求加回来，与系列带并存；
  **2026-11-03 又收了一次**；**2026-11-21 起彻底退成第三优先级**——
  只要前面有系列带或相关文章，这一块就不渲染。当前全站 143 篇长文里 0 篇用到它，
  它只是「既没有系列、也没有相关文章」时的兜底，别因为「看不到」就删掉。

### 目录 TOC

两份目录 DOM 同时存在，靠媒体查询互斥显示：

| 视口 | 目录 | 实现 |
| --- | --- | --- |
| **>1200px** | 右侧悬浮目录：平时只见折叠指示线，悬停 / 点按 / Tab 展开扁平列表（无底色、无阴影、无圆角） | `single.html` 末尾 `div.toc` + `partials/toc.html` + `custom.css` 第 40 段 + 显隐脚本 |
| **≤1200px** | 正文顶部 `<details class="toc-mobile">` 折叠目录 | `single.html` 中段 + `custom.css` 第 46 段 |

- `$tocEnabled` = `default .Site.Params.toc .Params.toc`；`hugo.toml` 的 `params.toc = true`，`/roll/` `/archive/` `/donate/` 用 front matter `toc: false` 单独关。
- 桌面目录 `position: fixed`，贴视口右缘 10px；折叠态 36px 宽（只装 24px 指示线），展开按 `max-content`，上限 280px，窄视口再按 `min(280px, (100vw − 720px) / 2 − 22px)` 收窄，不压正文。
- 展开时指示线**不搬家**，仍钉在同一列（`right: 0`），标签从左侧长出；当前节用链接蓝、横线由 24px 拉长到 32px，悬停项也拉长到 32px（只变蓝为反馈），其余用三级灰；过渡 0.18s，reduced-motion 下关闭。页面顶部还没有当前节时，首条默认按当前节拉长（`:has` 兜底），否则刚打开文章时整排 24px，看起来像效果丢了。
- 手机折叠目录只给 **h2 ≥ 3** 的页；用原生 `<details>`，零 JS。类名不能用 `.toc-nav`（会抢走主题 `toc.html` 的 `querySelector`，且主题给 `.toc-nav a` 设了透明色）。
- 目录锚点与正文 id 由 `render-heading` / Goldmark 生成，和目录是否显示无关；`partials/toc-anchors.html` 把主题目录里的 href 换成同一套拼音锚点。
- 打印时两份目录都隐藏。

### 评论区 giscus

- **只给长文页挂**：`and .IsPage (in (slice "posts" "weekly") .Type)`，且尊重单篇 `comments: false`。
  列表页 / 关于页 / 隐私页 / `/roll/` 都不挂。
- **默认收起**，靠 `.is-open` 类切 `.giscus-body` 的 `max-height` + `visibility`
  —— **不是 `display: none`**，否则收起时 iframe 量到 0 高，点开就跳。
- **样式极简**（2026-10-11 用户要求「去掉框框」）：没有任何边框 / 底色 / 圆角，
  只剩加粗的**「评论」**二字 + 右边一个 `::after` 画的标记。
  ⚠️ 标记 2026-11-21 晚最终改成**细线「＋ 变 －」**（用户在三个方案里选出）。
  `::before` 画 12 × 1.5px 横线（始终不动），`::after` 画同样一根竖线：
  收起时 `rotate(90deg)` 即「＋」，展开时转回 `0deg` 与横线重合即「－」，
  旋转过程本身就是展开 / 收起的提示。两条线都是 `position: absolute`，
  靠 `.giscus-toggle` 的 `padding-right: 18px` 留位；跟随 `currentColor`，
  深浅色自动适配，`prefers-reduced-motion` 下只关过渡、不关旋转。
  ⚠️ 不要改回字符「＋ / －」或「0 宽高 + 三边框」的三角写法：前者无法平滑过渡、
  字体会把线宽带偏，后者会变回实心块。
  ⚠️ `minify` 会压掉可省略的属性值，按压缩后写法 grep 颜色值可能假阴性。
  ⚠️ 2026-11-21：右侧兜底提示移到 `<details>` **外面**，绝对定位在标题行右端
  （`.giscus-head > details.giscus-box + .giscus-hint`）。展开 / 收起只改变
  details 自己的高度，提示始终停在第一行，「评论」的位置也不会被牵动。
  `loading` 与 `fallback` 在 `.giscus-hint` 里叠成同一格，出现 / 消失不改变行高。
  ⚠️ 触控命中区靠 `.giscus-toggle` 自己的 `min-height: 44px` 达标，**不加纵向 padding**
  —— 加了会把这一行撑高、推掉下面的排版；`padding-right: 18px` 只为图标留横向空间。
  `::before` / `::after` 现在都用来画「＋ / －」，不再留着做命中区扩展。
  ⚠️ 类名 / ID 是和 `assets/js/giscus.js` 的契约（5 个 id + `.is-open` 类），改名要两边一起改；
  本次改版只动 CSS 与那层没用的 `.giscus-inner` 包装，**JS 一行未改**。
- `mapping = "pathname"`，所以**只要 URL 不变，老评论直接接上**（本次迁移 URL 未变，已验）。
- 全站只有两个 JS 文件：`giscus.js`（评论区）+ `code-copy.js`（代码块复制按钮，只含代码的页），都经 Hugo 管道指纹化成 `/js/<名字>.min.<hash>.js`。页脚「打个招呼」的复制脚本是**内联**的（压缩后不到 1 KB、每页都有，内联比多发一次请求划算），不计入这两个文件。

### 页脚

**2026-11-21 定稿：两行（RSS 无图标，其余保留）**

```
通过 RSS 订阅，或直接 ✉️ 问候， 🔒 隐私. 🚇 开往. 🌀 虫洞. 🗺️ 地图.
基于 Hugo Bear Neo 制作，版权所有 © 2025-2026 · 胡拉图，本站内容采用 CC BY-NC-SA 4.0 协议。
```

- 第一行是订阅、站点元信息与友链圈；第二行是制作署名、版权与授权。
- **RSS 前面的 📡 已去掉**；问候、隐私、开往、虫洞、地图仍保留图标。
- 顺序固定为：隐私 → 开往 → 虫洞 → 地图。
- 「随机读一篇」**2026-11-21 已从页脚移除**，改到 `/archive/` 的计数行
  （「共 143 篇，随机阅读一篇。」）。⚠️ 别在 `footer.html` 或 `custom_body.html`
  里再加页脚按钮 —— 用户明确要求只保留归档页那一个入口。
- 「搜索」入口 **2026-11-21 晚已按用户要求从页脚移除**（原来落到 `/archive/#search-input`）。
  站内搜索只保留 `⌘K` / `/` 命令面板与导航右侧的「搜索 /」按钮，**别再加回页脚**。
- 「问候」是 `mailto:` 链接（`partials/hello.html`），悬停仍会浮出邮箱卡片。
- 排版：行高 1.95、上下 padding 2.6rem / 2.2rem、非链接文字次级灰；
  字号仍是 `--font-size-secondary`（0.8em），一分未动。
- 四个开关全部保留：`hideMadeWithLine` / `hideCopyright` /
  `hideRSSAndEmail` / `hideSitemap`。
- 「打个招呼」仍是悬停浮层 + 点击复制（见 2026-11-20 那节）。

⚠️ 实现约定（改页脚前先看）：

- `hugo.toml` 的 `copyright` / `copyrightNote` 是文本节点输出，Go 模板会转义 `&`；必须写**字面量 `©`**，写 `&copy;` 会原样显示成六个字符。`copyrightNote` 里也不能写 Markdown 链接，所以 CC 那句话拆成 `copyrightNote` / `licenseName` / `licenseURL` 三个参数。
- 分隔符一律用 `.`，不用 `·`。第 1 行句末本来就有句号，模板里直接接 `$trav`（只带一个前导空格），不要补成 `..`。
- 四个开关：`hideRSSAndEmail`（连「开往」一起关）、`hideMadeWithLine`、`hideCopyright`、`hideSitemap`（`Privacy` 挂在这个开关里）。
- 「开往」是纯文字链接，指向 `https://www.travellings.cn/go.html`，`target="_blank"` + `rel="noopener noreferrer"`；模板里用 `safeHTML` 存成变量，三个订阅分支各引用一次。它只放页脚，别再挪进导航。
- 每块自带结尾 `<br />`（只有最后的授权行没有）；搬动时别把 `<br />` 搬丢，少一个会让两行并成一行且构建 0 警告。

#### 问候浮层（`partials/hello.html`）

触发词仍是 `mailto:` 链接；悬停 / 键盘聚焦 → 上方浮出邮箱胶囊，点它复制，
胶囊原地显示「已复制」，1.6 秒后复原：

```
              ┌───────────────────────┐
              │ hello@hulatu.com  ⧉   │   ← 点这里复制
              └───────────────────────┘
                   打个招呼
```

`.hello-card` 里只有一颗按钮：邮箱文字在左、复制图标在右；
悬停浮出浅灰底，复制后图标换勾、文字与描边变链接蓝。

- **为什么往上弹**：页脚贴着页面底部，往下会顶出视口，还会临时撑出一条竖向滚动条。
- **为什么不用 `role="tooltip"`**：卡片里有可点的复制按钮，tooltip 语义要求
  内容不可交互。这里是普通补充内容，键盘靠 `:focus-within` 进入。
- **触发词仍然是 `<a href="mailto:">`**：JS 没到 / 被禁用时行为与改前完全一致，
  复制是渐进增强。桌面端也**不拦截**它的点击；只有 `matchMedia('(hover: hover)')`
  为假（纯触屏）才改成「点一下开合胶囊」—— 触屏上以复制为主，卡片里不再另放 mailto。
- **胶囊与触发词之间必须留一块透明桥**（`.hello-card::before`）：没有它，鼠标从词
  移向胶囊的 8px 空隙里会丢掉 `:hover`，胶囊在指针到达前就收了。
- **邮箱 / 已复制两个 span 叠在同一个网格格里**：换字时胶囊宽度不跳。
- 三处契约，改名要同改：`partials/hello.html`（标记）、
  `partials/hello-script.html`（内联脚本，类 `.hello-copy` / `.is-copied` / `.is-open`）、
  `assets/css/custom.css` 第 48 段（样式）。
  2026-11-21 起正文也能用：`layouts/shortcodes/mail-link.html` 调同一个 partial，
  当前挂在 `/about/` 的「写信」。脚本已从「只取第一个 `.hello`」改成遍历所有实例，
  否则正文那处在 DOM 里靠前，会把页脚浮层的交互抢掉；正文卡片用第 52 段左对齐，
  避免窄屏从触发词中间向两边展开时溢出。

### 全站装置：skip-link / 打印 / 跨页转场（2026-10-17 新增）

三样都不属于「某个页面的组件」，而是**每一页都挂的装置**，样式都在 `custom_head.html`
第 29 / 30 段（全站生效），结构改动在 `baseof.html`。

**① skip-link**

```
（平时在视口外，完全不可见）
┌──────────┐
│ 跳到正文  │   ← 只在键盘聚焦时滑入左上角；黑底白字（深色下反转）
└──────────┘
```

- 它是 `<body>` 后的第一个元素，目标是 `<main id="main">`。
- 平时用 `left: -9999px` 藏起来，**不是 `display: none`** —— 后者会让元素不可聚焦，
  Tab 永远到不了它。这是 skip-link 最常见的写错方式，而且看起来「很正常」。
- `<main>` 带 `tabindex="-1"`：没有它时点 skip-link 只滚动不移动焦点，
  下一次 Tab 又回到页头，等于白做。`-1` 让它能被程序化聚焦但不进 Tab 序列。
- `main:focus { outline: none }` 必须有 —— 焦点环会沿整个 main 画一圈，在整页尺度上
  看着像渲染错误。
- **2026-11-21 起全站统一键盘焦点环**：`a` / `button` / `summary` / `.heatmap-scroll`
  在 `:focus-visible` 时统一 2px 链接蓝描边、offset 3px（`custom.css` 第 00d 段）。
  组件自己的 focus-visible 规则写在后面，会覆盖这里的宽度与 offset；
  `[tabindex]` 不能写进兜底选择器，否则 skip-link 聚焦 `<main>` 时会画出整块描边。

**② 打印（`@media print`）**

| 打印时隐藏 | 为什么 |
| --- | --- |
| `header` / `footer` | 7 项导航 + 2 行页脚在纸上没有意义 |
| `div.toc` | 它是 `position: fixed`，**会叠在正文右上** |
| `.back-top` / `.giscus-wrap` | 固定定位按钮会印在末页角落；评论区默认展开 |
| `.breadcrumbs` / `.post-nav` / `.post-series` | 纸上点不了，是导航不是内容 |
| `.heading-anchor` | 标题后的 `#` 是屏幕上的复制直链入口；2026-11-21 起默认常显，纸上不需要印一串蓝色 `#` |

其余调整：`@page` 给 16mm / 14mm 边距；`body` 去掉 20px padding（纸边距由 `@page` 给，
再留就是缩进两遍）但**保留 720px 限宽**（A4 可用宽约 673px，本来就装不满）；
`content` 行高与屏幕一致（1.5，不再额外收窄）；`pre` 折行 + 透明底 + 自绘边框；
链接收敛到墨色；标题 `break-after: avoid`，代码块 / 表格 / 图 / 引用 `break-inside: avoid`。

文末那条 URL 来自 `baseof.html` 的 `.print-url`（**只在长文页输出**，屏幕上 `display:none`）——
CSS 拿不到 location，只能由模板给。

⚠️ **`pre` 压不住 `pre.chroma`**：主题那条是 (0,1,1)，裸 `pre` 是 (0,0,1)。
必须写 `pre, pre.chroma { … }`，否则打印时代码块底色和主题边框都还在，而**构建 0 警告**。

**③ 跨页转场（View Transitions API）**

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  ::view-transition-old(root), ::view-transition-new(root) { animation-duration: .2s; }
}
```

- 站内跳转有 0.2s 交叉淡入。Chrome 126+ / Safari 18.2+ 支持；Firefox 不支持，
  但那是**纯渐进增强** —— 不支持时照常瞬时切换，没有降级代码要写。
- 时长 0.2s 是与站内现有过渡（0.15 / 0.2 / 0.22s）同档：整页淡入比组件慢一档才不显「闪」。
- ⚠️ **它是文档级 at-rule，没有来源 / 目标限定语法**。「只在列表→文章这一条路径上开」
  在纯 CSS 里做不到，要按路径控制只能上 JS。所以这是**全站生效**；
  不喜欢就删掉第 30 段，一行都不用回滚别处。
- ⚠️ 固定定位的返回顶部按钮会随 root 快照一起淡入淡出 —— 这是**期望行为**，
  不要给它单独 `view-transition-name`，那会出现「按钮不动、内容在淡」的割裂感。

### 子站（2026-10-12 全部下线）

⚠️ **四个子站已全部下线，`sites/` 已从仓库删除**（`run` / `shot` / `share` / `profile`）。
`profile` 的内容并入 `/about/`，`run` 的跑步页并入 `/run/`；`shot` / `share` 本来就是空壳。
`scripts/build-subdomains.sh` 与 `sites/README.md` 也一并删除 —— 需要追溯就用 `git log --diff-filter=D`。
当前主站不依赖任何子站。

---

## 5. 站点层偏离（50 个文件：layouts/ 48 + assets/js/ 2）+ 改主题副本 4 处

> ⚠️ **2026-10-14 起多了一类偏离：直接改主题样式。**
> 生效文件是 `assets/css/theme.css`，`themes/hugo-bearneo/layouts/partials/style.html`
> 是它的镜像（主题内联 `<style>` 已被站点层空覆盖压掉）。镜像有**四处**改动：
> ① `content { line-height }` 最终 1.5（2026-10-14 → 1.8 → 1.7 → 1.6 → 1.5）；
> ② 删掉未启用的 upvote 规则（`button.upvote-btn` / `button.upvoted` / `span.upvote-count`）
> 与两个 `--upvoted-color` 变量（2026-11-03，每页省约 260B）；
> ③ visited 链接色与 link 同色（2026-11-21，去掉 `#551a8b` / `#b388ff`）；
> ④ 深色 `@media (prefers-color-scheme: dark) { :root {…} }` 改成
> `[data-theme="dark"] {…}`（2026-11-21，手动深浅色开关）。
> 其余 26 个主题文件仍与上游逐字节一致。**同步上游时这四处要重新应用。**
>
> **为什么改主题而不是在站点层再叠一层**：文首那段定下的规矩 + MAINTENANCE.md 第 4 节
> 的「改颜色 / 字体 / 宽度 / 圆角 → `themes/…/style.html`，改完在第 5 节登记」。
> 行高属于**设计取舍**（不是修上游的 bug），按规矩落在主题那一份。
> ⚠️ 代价：`diff -r` 对上游不再全清 —— 验的时候先 diff 再判。
> 注释写在 CSS 里、minify 会剥掉，所以**体积零变化**（8675 / 12610 / 10404 / 9101 / 10509 / 10089 逐值不变）。

| 文件 | 偏离 | 为什么 |
| --- | --- | --- |
| `layouts/_default/baseof.html` | ① `.Site.LanguageCode` → `.Site.Language.Locale`；② 补回 robots 分支；③ **2026-10-17 加 skip-link**（`<body>` 后第一个元素）+ **`<main id="main" tabindex="-1">`** + 长文页的 `.print-url`；④ **2026-11-21 删掉页内 `/` 快捷键脚本**（改由 `custom_body.html` 全局接管）；⑤ **2026-11-21 `<body>` 支持 `bodyClass` front matter**（`/roll/` 的专属排版钩子） | ① 前者 Hugo 0.158 起弃用，将来移除会让整站构建失败；② 上游**完全没有** robots 输出，而本站有两类页面本来就该 noindex（见下）；③ 无障碍：原来要按 8 次 Tab 才到正文（WCAG 2.4.1 A 级）。⚠️ skip-link 的目标是 `#main`，**不能**复用 `#top`（那是返回顶部的落点，跳过去等于跳到页头）；④ 两处同时监听会一次开两个面板，或面板打开后页面又跳走；⑤ 只输出 class，不改变原有 id |
| `layouts/_default/single.html` | 去掉 `if eq .Type "blog"` 外层门槛；加 `hideDate` / `hideTitle`；加文末「系列坐标带」+「上一篇 / 下一篇」；加评论区；**2026-11-21 日期行改成「发布于 YYYY-MM-DD / 更新于 YYYY-MM-DD」普通灰字**（发布日期前加「发布于」；有更新时再显示「更新于」；不再用升级包的浅蓝徽章，按用户要求不强调；`lastmod` 与 `date` 不是同一天才显示） | 上游把标题日期写死给 `blog` 段；其余都是站点层新增（见第 4 节）。判据取**日历日不同**而不是「差 24 小时」—— 当天发当天改的两个日期长得一样，并排显示是噪音。样式沿用 `.byline` 的灰字，不做徽章；`enableGitInfo = true` 让 `lastmod` 跟 Git 提交走 |
| `layouts/_default/list.html` | 5 处界面文案英译中；列表本体改用 `partials/post-list.html`；**2026-11-21 传 `desc=(ne .Section "weekly")`**（`/posts/` 显示一句话导语，`/weekly/` 不显示） | 上游文案写死英文、没走 i18n；列表与 `/archive/` 共用一份。周刊按用户要求去掉导语；归档页不传 `desc`，避免 143 条全部变三行 |
| `layouts/partials/post-list.html` | **新增**：按年分组 + `orphan-safe` 标题的列表本体；**2026-11-21 加可选 `desc` 参数**，在标题链接内追加 `.hl-post-desc`；年份改成 `<li class="year-heading"><h2>…</h2></li>`，链接用 `.RelPermalink` | `/posts/`、`/weekly/`、`/archive/` 三处共用，避免复制粘贴漂移。⚠️ 导语必须放在 `<a>` 内部：`li` 是 flex，外置会成为第三个 flex 子项。⚠️ `<ul>` 的直接子元素只能是 `<li>`，裸放 `<h2>` 会被 axe 判为 serious；`.year-heading` 显式改回 `display:block` 让 h2 边距照旧 |
| `layouts/_default/rss.xml` | 四处：① `xmlns:content` + **2026-10-15 起顶部不再挂 `<?xml-stylesheet?>`**（旧的 `/rss.xsl` 已删）；② 首页 feed 改成**只收文章页**（`Type` ∈ `posts`/`weekly`）；③ 补 `atom:updated` / `category` / 摘要式 `description` / 全文 `content:encoded`，并存 `params.RSS.pageLimit` 上限（20）；④ **2026-10-25 补 `<image>`**（144×144 PNG，走 `params.feedIcon`） | ① 旧版靠浏览器 XSLT 渲染，Chromium 正在移除 XSLT（弹横幅，移除后那页退化成 raw XML）→ 改由 `functions/_middleware.js` 内容协商到 `/feed/`，见第 4 节「订阅源」；② 迁移后新增的 `/about/` `/now/` `/roll/` `/privacy/` `/donate/` `/archive/` 都是 content 根下的普通页，会被一并收进订阅；③ 上游只发全文 `description`、没有「更新于」和分类；④ `<image>` 是订阅端**唯一有明文依据**的图标来源，缺了它阅读器只能猜（见 8.6） |
| `layouts/_default/archive.html` | **新增**（且比上游 `list.html` 多「系列」一行入口 + 标签常显/折叠） | `/archive/` 是内容页不是 section，上游无对应模板 |
| `layouts/_default/run.html` | **新增**（2026-10-12）：跑步数据页。从子站 `sites/run/layouts/index.html` 搬来，去掉子站自己的 `<head>` / `<header>` / `<footer>`，补一个页面级 `<h1>`，数据块包进 `<content>` | 跑步数据要从 `run.hulatu.com` 变成本站的 `/run/` 页，数据来自 `hugo.Data.runs`（`data/runs.json`）—— 上游没有任何读 `data/` 的模板 |
| `layouts/_default/_markup/render-link.html` | **新增**：`</a>` 后**不留换行** | 上游模板末尾多一个换行，行内链接后紧跟中文标点时会被折叠成一个空格（「花墨 ：点评」）。迁移后实测 **26 页 / 70 处**，其中 `/roll/` 一页 15 处。见下 |
| `layouts/feed/list.html` + `layouts/feed/single.html` | **新增**（2026-10-15）：把 `/feed/` 与 `/feed/weekly/` 挂到 `baseof` 上，内容全在 `partials/feed-view.html` | 「浏览器直接打开 feed 看到的那一页」的新家（旧版是 `static/rss.xsl`）。⚠️ **两个文件名都要有**：section 页（`/feed/`）走 `list.html`，它下面的普通页（`/feed/weekly/`）走 `single.html`，缺一个就会掉进 `_default/single.html` 被渲染成一篇「文章」（多出日期行、标签行、上下篇导航） |
| `layouts/partials/feed-view.html` | **新增**（2026-10-15）：订阅源的浏览器视图 —— 标题 + 站点简介 + 订阅地址 + 条目（日期 / 标题 / 摘要）。⚠️ **页面集合口径必须与 `_default/rss.xml` 逐字一致**（`site` = Type ∈ posts/weekly；`weekly` = 周刊 section 的 `.RegularPages`） | 见第 4 节「订阅源」。两边算得不一样 = 「网页上比订阅里少一篇」，而且构建 0 警告 |
| `layouts/index.html` | **新增**（且简介正文**不包 `<content>`**，与上游不同、与 yinji 一致） | 上游首页只有 `{{ .Content }}`，等于空页；`<content>` 那层见第 4 节「首页」 |
| `layouts/partials/nav.html` | 完全由 `[[menu.main]]` 驱动；**2026-10-17 加 `aria-current="page"`** | 上游把 `Home` / `Blog` 写死，和 `[menu]` 语义打架。⚠️ 当前页判断必须**精确相等** `$.RelPermalink` —— 按前缀会让每篇文章页点亮 `Posts`（它指向 `/archive/`，而文章在 `/posts/…`）；样式**只改颜色**（不加下划线，用户 2026-10-17 当天否掉）、**不改字重**（Verdana 400→700 会让导航折行位置变） |
| `layouts/partials/header.html` | **新增**（2026-10-18）：站名从 `<h1>` 降级成 `<p class="title">`，外观由 `custom.css` 第 00c 段补回 | 上游把站名写成 h1，而文章页的正文标题也是 h1 → **每篇文章页两个 h1**（实测 134 / 344 页）。改成 `<p>` 后文章页唯一 h1 = 文章标题；首页 / `/about/` / `/now/` / `/roll/` / 列表页变成 0 个 h1 —— 与第 7 节第 1 条「非文章页没有页面级 h1」一致。⚠️ `<p>` 与 `<h1>` 的默认样式差**四处**（color / font-size / font-weight / margin），少补哪一条都看不出来但页面会变；验收是改前改后各截一张首页跑 `magick compare -metric AE` = **0** |
| `layouts/partials/favicon.html` | **新增**（2026-10-25）：一条 `shortcut icon` 扩成五条（SVG / 512 / 192 / apple-touch / ico）；**2026-10-26 再加一条 `rel="manifest"`** | 上游只输出 `params.favicon` **一条**，本站指向 SVG ⇒ head 里只有 SVG。而 RSS 阅读器与图标聚合服务的取图管线基本不吃 SVG，`/favicon.ico` 这个约定路径又不存在 → 订阅端拿不到图标、退回字母头像或地球图标，表现就是「订阅里的头像和网站不一样」；站内一切正常、构建 0 警告、本地截图也看不出来。见 8.6。manifest 是为了安卓「添加到主屏幕」——没有它，桌面图标是自动截图、名字取 `<title>`、点开还是浏览器界面（见 8.8） |
| `layouts/partials/footer.html` | 版权独立成行；`Say hello` 大写；末行英文化 + `Privacy` 链接 + CC 带链接；**2026-11-21 页脚不放随机入口**（随机移到了 `/archive/` 计数行） | 上游版权和 Sitemap 挤一行，配置不出来；后三处是 2026-10-11 用户要求 |
| `layouts/partials/breadcrumbs.html` | **新增**：面包屑 `<nav>` + `BreadcrumbList` JSON-LD | 上游与 yinji 都没有面包屑；只给有层级的文章页挂（见第 4 节） |
| `layouts/partials/seo_tags.html` | **新增**（2026-10-14）：整份覆盖上游的同名 partial —— ① 删 `<meta name="keywords">` 与 `<meta name="title">`；② 删掉整块微数据（`itemscope` / `itemprop` 那套）；③ 补 `og:image:width` / `height`；④ 换成按页型输出的 JSON-LD；⑤ **2026-10-26 BlogPosting 补 `inLanguage` / `articleSection` / `keywords`** | 上游那份是「HTML 规范还在 2015 年」的写法（见 8.8）。现在全站每页都有 `ld+json`、`keywords` / `itemprop` / `pubdate` 全站归零。⑤ 三个都是**短值**（分类一个词、标签逗号拼接、locale），不破「JSON-LD 不放长文本」这条原则 —— 分类/标签为空时走 `merge` 条件追加，**不能塞空串**，否则富媒体测试会报「字段为空」 |
| `layouts/partials/og-image.html` | **新增**（2026-10-26）：分享卡片图的**唯一**取值来源 —— 长文页按 `.Slug` 找 `images/og/<slug>.png`，取不到回落 `site.Params.images` 第一张；返回**绝对 URL** | 这段逻辑原本在 `_partials/opengraph.html` 与 `_partials/twitter_cards.html` 各写一份、靠注释提醒「必须逐字一致」；2026-10-26 给 JSON-LD 的 `image` 也用同一张图时正好会变成第三份，于是收成一份。见 8.8 |
| `layouts/partials/noindex.html` | **新增**（2026-10-26）：`noindex` 判定的**唯一**来源（`tags` / `404` / `.Params.noindex`），返回 bool | 同上：原本 `_default/baseof.html` 与 `sitemap.xml` 各写一份 `or(...)`，漂移的后果是「sitemap 里混进 noindex 页」而构建 0 警告。分类页放行时正好要动它，于是收成一份。见 8.9 |
| `layouts/partials/custom_body.html` | **新增**（2026-11-21）：**升级包原版** —— `⌘K` / `/` 命令面板、导航右侧 `搜索 /` 与内联 SVG 月亮/太阳按钮（尺寸在 `custom.css` 第 56 段）、归档计数行随机入口 `#archive-random`、`applyTheme()` 手动深浅色。`loadIndex()` 里把本站 `t/u/g/d/k` 映射成升级包的 `title/url/summary/date/section` | 用户要求完全采用升级包，但随机按钮从页脚改挂到归档页；月亮/太阳由文字换成 SVG 以消除跨平台字形差异。⚠️ 不要改回本站自己的数据形状：命令面板的字段映射依赖 `t/u/g/d/k`。⚠️ `applyTheme` 额外同步 `<meta id="hl-theme-color">`、giscus iframe 主题与按钮 `aria-label` |
| `layouts/shortcodes/projects.html` + `data/projects.toml` | **新增**（2026-11-21）：首页代表作列表。⚠️ **当前未挂载**（用户要求首页去掉该区块），模板与数据保留 | `projects.html` 用 `hugo.Data.projects`（`.Site.Data` 在 0.156 起弃用）。同批加入的 `shortcodes/now.html`、`partials/now-line.html`、`shortcodes/about-mac.html` 已按用户要求删除 |
| `layouts/index.json` | **新增**（2026-10-26）：首页的 JSON 输出视图，产物 `/index.json` —— 143 篇的 `{t,u,g,d,k}`（标题 / 站内路径 / 标签 / 正文纯文本 / 重点关键词）。**2026-11-21 起命令面板开始使用 `k`**：标题 > 关键词 > 摘要三级打分，关键词命中显示「相关 · 短语」 | 列表页搜索原来只 `title.includes`，搜正文里的词一条都出不来。⚠️ 文件名**必须**是 `index.json`：home 的输出格式按 `layouts/index.<ext>` 找模板，找不到会退到 `_default/list.<ext>`，那份带分页变量、结构也不对。⚠️ 体积约 500 KB / gzip 约 215 KB（随文章数浮动）；命令面板只在呼出时 fetch 一次，别改成进页面就拉。见 8.7 |
| `layouts/partials/search-box.html`（**已删除**） | 2026-10-26 新增的归档页搜索框 + 过滤脚本，2026-11-03 起只在 `/archive/` 使用；**2026-11-21 晚彻底删除**，连同 `postSearch` 参数与 CSS 47 段的 `.search-hit` 高亮。恢复需从 git 历史取回 | 同一段脚本原本在 `_default/list.html` 与 `_default/archive.html` **各抄一份**，只差计数文案。删除后全站搜索只剩 `custom_body.html` 的命令面板。见 8.7 |
| `layouts/partials/inline-links.html` + `data/inline-links.json` | **新增**（2026-10-26）：渲染层正文内链 —— 词表 `{a: 锚点, u: 目标URL}`，在 `single.html` 的 `$content` 管线上把正文文本节点里的锚点词包成 `<a>`。词表 30 条，全部逐字校验过「确实在别的文章正文里出现过」 | 133 篇里 120 篇正文零内链，影响主题相关性；但挨篇插链接要动 120 个用户手写的 `.md`，不动。详见 8.10 |
| `layouts/partials/custom_head.html` | CSS 管道 + **升级包完整 `<style>`（`--hl-*` 令牌与所有组件）** + 主题引导脚本 + 图床预连 + 单个 `theme-color` + GoatCounter | 升级包样式最后加载，覆盖站点旧设计；末尾「站点令牌桥接」把 `--bg-color-*` / `--text-color-*` / `--border-color` / `--link-*` 映射到 `--hl-*`，旧组件也换色。⚠️ 管道必须在升级包 `<style>` 之前，否则主题基础排版会被打回上游默认 |
| `layouts/404.html` | **新增** | 上游默认只有 `<h1>404</h1>` + 一行颜文字 |
| `layouts/_default/_markup/render-heading.html` | **新增**：标题末尾的 `#` 锚点 | 上游没有这个钩子（Goldmark 只给 id、不给可点入口） |
| `layouts/partials/orphan-safe.html` | **新增**：标题末 2 字包 `nowrap` | 中文标题的孤行问题（取回旧主题的做法） |
| `layouts/_default/_markup/render-image.html` | **新增**（2026-10-12）：正文图片补 `width` / `height`。⚠️ **2026-10-14 改了放大方案**：overlay 里原本还重复渲染一个 `<img>`，现在整段删掉、URL 改走 figure 上的 `--zoom-src` 自定义属性（见下）。⚠️ **2026-10-25 又加了三样**：`srcset` + `sizes`（400/720/1080 三档）、图床边缘转换前缀、首图 `fetchpriority="high"` | 上游只输出 `src` / `alt`，图片加载前高度为 0 → 页面跳动（CLS）。宽高取自 `data/image-dims.json`（`scripts/sync-image-dims.py` 采集）。⚠️ 必须配第 21 段的 `img { height: auto }`，否则 `height` 会当硬高度生效、图被**竖向拉伸**。**2026-10-25 的 srcset 走 Cloudflare Image Resizing**（`/cdn-cgi/image/width=W,format=auto,quality=82/`），实测省 47–71%，见 8.5 |
| `layouts/partials/back-top.html` | **新增**：返回顶部（只长文页） | 上游没有；**纯 CSS 滚动驱动动画，零 JS**。⚠️ 同日曾有过「阅读进度条」，已按用户要求删除 |
| `layouts/partials/code-copy.html` + `assets/js/code-copy.js` | **新增**：代码块复制按钮（只含代码的页） | 上游没有 |
| `layouts/partials/giscus.html` + `assets/js/giscus.js` | **新增** | 上游没有评论区 |
| `layouts/sitemap.xml` | **新增**（2026-10-17）：按 `$noindex` 过滤，336 条 → **134 条** | 内置 sitemap 把 197 个词条页 + `/posts/` `/donate/` `/privacy/` `/feed/` `/feed/weekly/` 一起交给爬虫 —— **202 / 336 = 60.1%** 是自带 noindex 的页。爬虫不会收录，但 Search Console 会持续报「已提交但被 noindex 排除」。⚠️ 过滤条件必须与 `baseof.html` 的 `$noindex` **逐字同口径**（四个判据），两处漂移时构建 0 警告 |
| `layouts/_partials/opengraph.html` + `layouts/_partials/twitter_cards.html` | **新增**（2026-10-17）：按 slug 取 `images/og/<slug>.png`，**取不到就回落 `share.webp`** | 内置那份只会用 `site.Params.images` 一张图 → 337 页的 `og:image` 全是同一张，分享卡片长得一样（现已按 slug 分图，见 8.8）。⚠️ 两个文件的取图逻辑必须**逐字一致**，否则「微信卡片和 Twitter 卡片不是同一张」；⚠️ 覆盖的是 Hugo **内置**的 `_partials/` 命名空间（0.146+），不是主题的 `partials/` |
| `scripts/gen-og.js` | sharp 把 SVG 光栅化成 1200×630 PNG，每篇文章一张 | 只用现在的 token：`#fdfdfd` 底 / `#1a1a1a` 墨 / `#8c8c8c` 三级灰 / `#d0d7de` 虚线；**不用链接蓝**（卡片上没有可点的东西，用了会让强调色失去语义） |

### ⚠️ `render-link.html` 那个换行（2026-10-11 修）

上游模板最后一行是 `<a {{ $attributes }}>{{ $text }}</a>` **加一个换行**，Hugo 原样写进产物；
行内链接后面紧跟中文标点时 HTML 把换行折叠成一个空格 → 渲染成「花墨 ：一个很有设计感的网站」。
**26 个页面、70 处**中招（`/roll/` 15 处）。对照 yinji.org/roll 的产物**没有**这个换行 ——
是上游模板的疏漏，不是设计。

站点层覆盖那份只在末尾加了 `{{- /* … */ -}}` 把空白吃掉，其余与上游逐字一致。
- 验收：`re.findall(r"</a>\n[，。：；！？、）」』》〈【（]", html)` 应为 **0**。
- ⚠️ 内容层**不要**在 `</a>` 和中文标点之间手写空格来「补」—— 源文件贴紧写就对了。

### 订阅源：两个 feed、只收文章页、以及「RSS 页面」长什么样（2026-10-11）

**全站只有两个 `.xml`**，靠 `hugo.toml` 的 `[outputs]` 把 section / taxonomy / term 都压回 HTML-only：

| 地址 | 内容 | 条数上限 |
| --- | --- | --- |
| `/index.xml` | **全站文章**（`posts` + `weekly`），导航最右那项和页脚 `RSS` 都指这儿 | 20 |
| `/weekly/index.xml` | **只有周刊**（`content/weekly/_index.md` 的 front matter 单独开了 `outputs: ["HTML","RSS"]`） | 20 |

`/posts/index.xml` **不存在**（`section = ["HTML"]`）—— 想知道「全站文章」看主源就够了。

**① 只收文章页。** 首页那一路的页面集合是
`where site.RegularPages "Type" "in" (slice "posts" "weekly")`。
`/about/` `/now/` `/roll/` `/privacy/` `/donate/` `/archive/` 都是 `content/` **根目录**下的
普通页，`Type` 是 `page`，一条都进不来。
⚠️ **不要改成按 `front matter` 的 `noindex` 过滤** —— `noindex` 表达的是「别让搜索引擎收录」，
与「要不要进订阅」是两件事（`/donate/` 恰好两者都占，但挡住它的是这里的 Type 白名单）。
⚠️ 周刊那一路走 `.RegularPages`（本 section 自己的页面），本来就是全文章，不用再过滤。

**② 「浏览器打开 feed 看到的那一页」改由边缘函数分派（2026-10-15）。**
feed 本身是一份**纯 RSS 2.0** —— 顶部不再有 `<?xml-stylesheet?>`，`static/rss.xsl` 已删除。
原因是 Chromium 正在移除 XSLT（见本节末尾那条 ⚠️）。现在分成两条腿：

| 谁在请求 | 拿到什么 |
| --- | --- |
| 浏览器地址栏导航（`Sec-Fetch-Dest: document`） | `/feed/` 或 `/feed/weekly/` —— 站点层生成的 HTML 页 |
| 订阅器 / 聚合站 / curl（不带那个头） | 原样返回 `/index.xml`（RSS 2.0） |

分派逻辑在 `functions/_middleware.js`（Cloudflare Pages Functions）。⚠️ 它**不在 `layouts/` 里**，
所以不占「站点层 25 个文件」的名额，但它是这套方案唯一会**静默失效**的一环 ——
Pages 项目里 Functions 目录被改过或关掉的话，横幅消失、页面却退回 raw XML，构建和部署都不报错。
判定**只认 `Sec-Fetch-Dest: document`**：那是现代浏览器顶层导航才会带的头，订阅器一律不发；
头不存在时才退回看 `Accept` 是否以 `text/html` 开头。判定不成立就 `next()` ——
宁可在浏览器里露出 raw XML，也不让订阅器拿到 HTML（后者是用户察觉不到的故障）。

两页的内容在 `layouts/partials/feed-view.html`：标题 + 站点简介 + **订阅地址（`<code>`，
刻意不做成链接** —— 点了就会打开 raw XML）+ 条目列表（日期 / 标题 / 摘要，摘要与 feed 的
`<description>` 同源，都是 `.Summary`）。`content/feed/_index.md` 与 `content/feed/weekly.md`
只是两个壳，负责给出 URL、`feedScope` 与 `noindex`。

⚠️ **页面集合口径必须与 `rss.xml` 逐字一致**：`site` 用
`where site.RegularPages "Type" "in" (slice "posts" "weekly")`，`weekly` 用周刊 section 的
`.RegularPages`，条数上限同样取 `params.RSS.pageLimit`。不一致就是「网页上比订阅里少一篇」，
而且**构建 0 警告** —— 验收脚本会逐条比对两个视图的标题与链接序列。
⚠️ 样式在 `custom.css` 第 28 段，**按 `.Type` / `.Section` 守卫**：只有那两页输出，
其余 330 多页 0 字节。
⚠️ 别把 `<?xml-stylesheet?>` 加回来，也**别把 `/feed/` 挂进导航** —— 它是「浏览器打开 feed」
的落点，不是一条页面入口；导航最右的 RSS 与页脚 `RSS` 仍然指 `/index.xml`，
地址一个字没变，所以订阅者与聚合站完全无感。
⚠️ 两页都设了 `noindex`（`content/feed/*.md` 的 front matter）：它们与 `/archive/` 是同一批
内容，旧版由 XSLT 渲染时它根本不是 HTML 页，本来就进不了索引。

**③ 条目字段。** 除 `title` / `link` / `pubDate` / `guid` 外还发：

- `atom:updated`（`Lastmod`，RFC3339）—— 文章页有「更新于」靠 `scripts/sync-lastmod.py` 刷，
  feed 只有 `pubDate` 的话订阅端感知不到一篇被修订过。`Lastmod` 等于 `Date` 的也照发。
- `<category>` —— 分类与标签各来一遍（浏览器视图那两页不渲染它，是给订阅器/聚合站分类用的）。
- `<description>` = `.Summary | plainify | htmlUnescape`（**摘要**，纯文本）。
- `<content:encoded>` = `.Content | transform.XMLEscape | safeHTML`（**全文**，HTML 当文本带走）。
  ⚠️ 旧站这里还套过一个 `partials/formula.html` 把 `$$…$$` 换成 `<p class="formula">`，
  那个 partial 随自建主题删了，**别照抄那一行**（会直接构建失败）。

**④ `<lastBuildDate>` 用「最新一篇的 `Lastmod`」，不是构建时间。** 否则每天推送的
跑步数据 / 依赖同步这类不带新内容的构建，会让订阅端以为 feed 更新了。

⚠️ **为什么不用 XSLT 了（2026-10-15）**：Chromium 家族会弹
`This site uses XSLT; that functionality is being removed from this browser very soon.`
（实测 Chromium 155）。等它真移除，靠 `<?xml-stylesheet?>` 渲染的那一页就**直接退化成
raw XML**。旧方案（`static/rss.xsl` + feed 顶部那行）因此整体撤掉，换成上面 ② 的内容协商 ——
`static/_headers` 里那条 `/rss.xsl` 规则也一并删了。
Firefox / Safari 目前仍支持 XSLT，但**这套方案已经不需要任何浏览器支持 XSLT**，
所以那边的支持与否不再影响本站。想回退到旧方案：`git show <本次改动前的提交> -- static/rss.xsl`
能取回样式表，但**不建议** —— 回退等于把横幅一起带回来。

### ⚠️ robots / `noindex` 的现状（2026-10-11）

`baseof.html` 里恢复的条件与旧站**逐字相同**：

```
{{- $noindex := or (eq .Data.Plural "tags") (eq .Data.Plural "categories") (eq .Kind "404") (eq .Params.noindex true) -}}
```

生效范围实测 **219 页** = 213 个标签词条页 + 8 个分类词条页
+ `/privacy/` + `/posts/` + `/donate/` + `/404.html`，
与线上旧站口径一致（`curl` 逐页比对过；`/donate/` 是 2026-10-11 新加的一页）。
⚠️ 标签数会随内容与合并变化，验收以 `ls public/tags | wc -l` 为准。

⚠️ **只恢复了 meta，没有恢复 `layouts/sitemap.xml`**（用户 2026-10-11 的选择）——
所以 `/privacy/`、`/posts/`、`/donate/` **仍然留在 sitemap 里**。爬虫读到 meta 不会收录，
但地址仍会先交给它一次。要彻底干净，得再加一份 sitemap 模板把 `not .Params.noindex` 排掉。

### `custom_head.html` 现在做六件事

1. **CSS 管道**：把 `assets/css/theme.css` + `assets/css/custom.css` 拼成 `/css/main.min.<hash>.css`。顺序不能反，站点补丁靠「后出现者胜」覆盖主题。
2. **升级包主题引导 + 完整样式**：文件开头的 `data-theme` 脚本（防深色闪白），以及末尾原样引入的 `<style>`（`--hl-*` + 组件 + 站点令牌桥接）。这是唯一允许内联大段 CSS 的地方。
3. **图床预连**：只有当前页 `.Content` 同时含 `img.hulatu.com` 与 `<img` 时才输出 `preconnect` / `dns-prefetch`（不要加 `crossorigin`，`<img>` 走的是 no-cors 连接池）。
4. **单个 `theme-color`**：`<meta id="hl-theme-color">` 初始 `#FCFCFA`，由 `custom_body.html` 的 `applyTheme()` 在切换时改成 `#111214`（浅色回 `#FCFCFA`）。不要再写两条 media 版本 —— 手动切换后它们不会跟。
5. **GoatCounter**。
6. **Speculation Rules**：站内预渲染。

样式段号（01–57）仍指 `assets/css/custom.css`；升级包组件的 `.hl-*` 在 `custom_head.html` 末尾，不在 custom.css。新的站点补丁继续写 custom.css，不要再往升级包 `<style>` 里加东西。

⚠️ 别加回 `<link rel=preload as=style>`：它与带 `integrity` + `crossorigin` 的 stylesheet 凭据模式不一致，浏览器会把同一个 CSS 当成两个缓存键、下载两次。

## 6. Do / Don't

### Do

- **先判断改哪一层**：`theme.css`（上游基础）→ `custom.css`（站点旧补丁）→ `custom_head.html` 末尾的升级包 `<style>`（`.hl-*` 与令牌桥接）。`.hl-*` 组件只改第三层，旧组件只改前两层。
- 改视觉先问「这是上游的东西还是站点层的？」—— 上游的东西去 `themes/` 改，改完在本文件第 5 节登记。
- 用 `hr` 就直接写 `<hr>`，它本来就是虚线。
- 加独立页时记得两个键：`hideDate: true`（不挂日期行）+ `toc: false`（短页面不挂目录）。
- 新增根级内容页**不用**再改 `static/_headers`：`/*` 已统一给 HTML 300 秒缓存。
- 改完 CSS 重新量体积：直接量产物 `/css/main.min.*.css` 的字节与 `gzip -9`。
- **文章里加了新图（或换了图床）→ 重跑 `scripts/sync-image-dims.py`**，否则新图没有
  `width` / `height`，会退化回「加载时页面跳动」。⚠️ 脚本只认图床 `img.hulatu.com` 上的图。
- 验证产物用 `/tmp` 目录 + `--cleanDestinationDir`：`hugo server` 开着会覆盖 `public/`。

### Don't

- **别在站点层叠规则去修上游的问题**。上一版自建主题就是这条路走到 6 个 CSS 模块、
  一层覆盖一层，最后没人能说清某个值是从哪来的。
- 别引入 `--space-*` / `--radius-*` / `--shadow-*` / `--font-serif` / `--font-meta` —— 这些令牌**不存在**了。升级包的 `--hl-shadow` 只属于 `.hl-*` 组件。
- **别在 `theme.css` / `custom.css` 里再写 `@media (prefers-color-scheme: …)`** —— 深色一律用 `[data-theme="dark"]`，否则手动切换会半明半暗。
- **别把 `.hl-*` 样式拆进 `custom.css`** —— 升级包要能整段替换；拆散之后下次升级无法对照。
- 别给列表页加页面级 `<h1>`（上游没有；文章页的 h1 是文章标题，非文章页 0 个 h1）。想加也行，但要一次改两处模板并登记。
- 别把链接拆成两页（`/roll/` 收藏 + `/links/` 友链）—— 2026-10-11 已合并成一页，
  拆开就是「两份清单互不重叠」那套说法，用户已经否掉了。
- 别把 `&copy;` 写进 `hugo.toml` 的 `copyright`，会被转义成字面量。
- **别在 Go 模板注释里写 C 风格注释的收尾符**（星号紧跟斜杠）。它会把注释提前收掉，
  后半段当普通文字输出到页面上；落在 `<style>` 里时还会**吞掉紧随其后的那条 CSS 规则**，
  而**构建 0 警告**。2026-10-11 因此让首页列表缩进了 40px（见第 5 节末尾）。
- 别在 `<style>` 里塞任何会输出中文的东西 —— 中文字符出现在样式块里就是「注释泄漏」的信号。
- 别为了「以后可能用」加匹配不到文件的 `_headers` 规则；`/css/*` 与 `/js/*` 是例外，它们对应真实产物。

---

## 7. 已知缺口

1. **非文章页大多没有页面级 `<h1>`**：页头站名是 `<p class="title">`，文章页唯一 h1 = 文章标题；首页、列表页、词条页是 0 个 h1。这是有意接受的上游行为。`/about/` `/roll/` 2026-11-21 起恢复可见 h1；`hideTitle: true` 的极简页仍输出 `.sr-only` h1。
2. **`scripts/sync-lastmod.py`**：`lastmod` 喂 RSS / sitemap，以及文章页日期行的「更新于」（`lastmod` 晚于 `date` 且日历日不同才显示）。
3. **`/media/`（书影音）仍是已删除状态**：要恢复得同时取回页面模板、`data/media.json`、`static/images/media/` 与同步脚本（都在 git 历史里）。

---

## 8. 实现备忘（现行机制）

> 这一节只写「现在怎么运作」和「改的时候会踩什么」。历史审计、逐次体积对比、
> 试过又撤回的方案都已删除 —— 需要追溯就读 `git log`。

### 8.1 标题锚点（拼音，构建期生成）

正文照常写 `## 标题`。`layouts/_default/_markup/render-heading.html` 给长文页（posts / weekly）的 h2/h3/h4 末尾加一个 `#`；`#` 默认常显、链接蓝、字号 1em、打印隐藏，样式在 `custom.css` 第 19 段。

id 由 `partials/heading-slug.html` 从 `.Anchor` 算出：汉字逐字查 `data/pinyin.json` 转拼音，非汉字原样保留，`{#custom}` 原样用 `custom`。`partials/toc-anchors.html` 用同一个 partial 改目录 href，两处不会错位。

⚠️ `data/pinyin.json` 缺字会让锚点退化；补字用 `python3 scripts/sync-pinyin.py`（需要 macOS），CI 用 `--check`。锚点的 `aria-label` / `title` 必带标题文本，否则读屏的链接列表全是「链接到本节」。

### 8.2 周刊标题

周刊 `<h1>` 的期号用阿拉伯数字（「第 30 期」）。标题整段用 `span.nowrap` 防孤行；`span.nowrap` 同时覆盖 `orphan-safe.html` 输出的片段，别改成裸 `.nowrap`（会把作用域放大到别的元素）。

### 8.3 `/tools/`

`content/tools.md`（必须写 `layout: "tools"`）+ `layouts/_default/tools.html`。数据在 `data/tools.yaml`，加工具只改数据文件；图标由 `partials/tool-icon.html` 按 `icon` 字段输出；样式在 `custom.css` 第 41 段。漏写 `layout` 不会报错，但整份工具列表会消失。2026-11-21 追加第 4、5 个工具：Medium 免费阅读（`unlock`）与 Pin-MacOS（`shield`）。

### 8.4 滚动条

`custom.css` 第 42 段：`* { scrollbar-width: none }` + 全局 `::-webkit-scrollbar`。**必须用 `*`**：Chrome 的 `scrollbar-width` 不继承，只写 `html` 的话 Firefox 会在表格 / 图表里继续显示。隐藏的只是指示条，`overflow` 一律没动，滚轮 / 触控板 / 方向键照常。类选择器会盖掉 `*`，所以 `.chart` 的 `scrollbar-width: thin` 已删，别再写回去。

`/run/` 的 `.chart` 用 24px 右内边距 + 右侧渐隐遮罩提示「右边还有内容」，两者必须同时存在，否则最右一根柱子会被削掉或右边留白。

### 8.5 图片管线

`layouts/_default/_markup/render-image.html` 一个文件做四件事：补 `width` / `height`（取自 `data/image-dims.json`，由 `scripts/sync-image-dims.py` 采集）、生成 `srcset`（400 / 720 / 1080）、走 Cloudflare Image Resizing（`quality=82`，别再往 70 以下调）、首图 `fetchpriority="high"`。

⚠️ 首图不能同时写 `loading="lazy"`，否则 high 会被忽略。`sizes` 里的 `680px` = 720 内容宽减左右各 20 padding，改布局宽度要回来改。宽高属性必须配 `img { height: auto }`（第 21 段），否则图会被竖向拉伸。图片放大 overlay 只画背景，不再重复渲染 `<img>`。

### 8.6 站点图标 / 分享图

`partials/favicon.html` 输出 SVG / 512 / 192 / apple-touch / ico 五条，外加 `rel="manifest"`；feed 图标走 `hugo.toml` 的 `params.feedIcon`（144×144）。

换图标：从母版 `H_avatar.jpg` 用 potrace 描摹成 `static/favicon.svg`，再生成各档光栅；`favicon.ico` 必须带 `-type TrueColorAlpha`（少了抗锯齿全丢）；最后把 `favicon.html` 里的 `$iconV` 加 1，否则浏览器 7 天内不会重抓。光栅图别手工裁，会和 SVG 分叉。分享图兜底是 `static/images/share.webp`，宽高在 `params.ogImageWidth` / `ogImageHeight`。

### 8.7 站内搜索

**2026-11-21 起站内搜索只剩全局命令面板**（`partials/custom_body.html`）：
`⌘K` / `/` 呼出，`/archive/` 顶部的输入框**已彻底删除**（partial、`postSearch`
参数、CSS 47 段一并移除，恢复需从 git 历史取回）。
面板读 `layouts/index.json` 生成的 `/index.json`，`loadIndex()` 把
`t/u/g/d/k` 映射成 `title/url/summary/date/section/keywords`；
搜索按**标题 > 关键词（k）> 正文摘要**三级打分（摘要 = 正文前 1000 字），
同分保持索引里的日期倒序；关键词命中时在右侧胶囊显示「相关 · 命中的短语」。
空查询展示最近 10 篇 +「随机读一篇文章」「切换深浅色」两条快捷指令。

↑↓ 键盘选择时，如果选中项移出结果列表的可视区，只改 `.hl-cmd-results` 的
`scrollTop` 把它带进来；**不要用 `scrollIntoView`** —— 命令面板是 fixed 覆盖层，
后者会把背后的页面一起滚。选到最后一项再按 ↓ 会回到第一项并滚回顶部。

⚠️ 升级包原版用 `innerHTML` 拼结果项。本站标题全部由作者控制，暂时没有注入面；
**以后若把评论、外部 RSS 之类不可信文本塞进索引，必须先改成 `textContent`**。
⚠️ 面板脚本**放在 `</body>` 前的 `custom_body.html` 里**，对话框标记就在它上面，
所以可以直接 `getElementById`。将来若再加页内输入框，它通常仍在 `<head>` 之后，
必须等 `DOMContentLoaded` 再跑，否则 `querySelectorAll` 拿到空列表、打字零反应且零报错。
这类问题 DOM stub 测不出来，要用真浏览器。

### 8.8 分享卡与结构化数据

`partials/og-image.html` 是 `og:image` 的唯一来源：长文页按 `.Slug` 找 `images/og/<slug>.png`，找不到回落 `site.Params.images` 第一张，返回绝对 URL。

`partials/seo_tags.html` 整份覆盖上游：不输出 `<meta name="keywords">` / `<meta name="title">`，不带微数据，补 `og:image:width/height`，按页型输出 JSON-LD；BlogPosting 带 `inLanguage` / `articleSection` / `keywords`。`partials/favicon.html` 里的 manifest 负责安卓「添加到主屏幕」。

### 8.9 分类页与 noindex

`partials/noindex.html` 是唯一判定处（`tags` / `404` / `.Params.noindex`），`baseof.html` 与 `sitemap.xml` 都调它。标签页 `noindex, follow`；分类页可索引并进 sitemap；`/tags/` `/categories/` 两个索引页已关。改判定只改这一处，两处会同时生效。

### 8.10 正文内链

词表 `data/inline-links.json`（`{a: 锚点, u: 目标URL}`）+ 逻辑 `partials/inline-links.html`，挂在 `single.html` 的 `$content` 管线末尾。

加词条前确认三件事：锚点逐字出现在**其他**文章正文里；锚点之间不互为子串（否则嵌套 `<a>`）；目标 URL 以构建产物为准。数据键带连字符，模板里必须 `index hugo.Data "inline-links"`（写成 `inlineLinks` 会静默 nil）；Hugo 0.170 没有 `strings.ReplaceAll`，用 `strings.Replace … -1`。

### 8.11 页面级 h1

页头站名是 `<p class="title">`，不是 h1。文章页唯一 h1 = 文章标题；`/about/` `/roll/` 2026-11-21 起也有可见 h1；`hideTitle: true` 的极简页仍输出一个 `.sr-only` h1（clip 方案，不是 `display:none`）；列表页没有 h1，这是有意接受的上游行为。

### 8.12 HTML 边缘缓存

HTML 走 300 秒边缘缓存，配置与验证命令见 MAINTENANCE.md 第 5 节。规则由 `static/_headers` 与 Pages Functions 共同决定；只删 `bypass_cache_for_html` 不够，别凭印象改。

### 8.13 跨页转场 / skip-link / 打印

`custom.css` 第 29 / 30 段：skip-link、`main:focus`、`@media print`、`@view-transition`。转场与平滑滚动都包在 `prefers-reduced-motion` 判定里。
