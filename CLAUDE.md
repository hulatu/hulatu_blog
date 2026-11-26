# 胡拉图说（hulatu.com）

Hugo + Cloudflare Pages 的个人博客。主题是 `themes/hugo-bearneo/`，本站所有定制都走站点层：`layouts/`、`hugo.toml`、`assets/css/`、`content/`。

改任何东西前，按需读这三份（它们是唯一真值，别凭记忆）：

- `MAINTENANCE.md` —— 操作步骤、文件地图、验收清单
- `DESIGN.md` —— 视觉体系与设计令牌
- `CHANGELOG.md` —— 变更历史

## 常用命令

| 目的 | 命令 |
|---|---|
| 新建文章并打开 | `new posts/标题`（zsh 函数；非交互 shell 用 `bash scripts/new-post.sh posts/标题`） |
| 新建周刊 | `new weekly/周刊-N` |
| 一键发布 | `up`（zsh 函数；非交互 shell 分两步：`bash ./publish.sh`，然后 `hugo --minify --cleanDestinationDir`） |
| 只提交推送 | `bash ./publish.sh "提交信息"` |
| 干净构建 + 链接检查 | `bash ./deploy.sh`（验证用，不是部署） |
| 站内链接/锚点检查 | `bash scripts/check-links.sh [public]` |
| HTML 结构检查 | `bash scripts/check-html.sh public` |
| 本地预览 | `hugo server`（构建/发布前必须停掉） |

`new` / `up` / `hugo` 是 `~/.config/zsh/.zshrc` 里的 zsh 函数，Claude 在非交互 shell 里调不到，**不要直接写 `up`**。

## 发布链路（重要）

1. `publish.sh` 顺序执行：`sync-pinyin` → `sync-lastmod` → `sync-image-dims` → `sync-image-colors` → `sync-status` → `gen-og`
2. 这些产物都是「**本机生成、提交进仓库**」的派生数据；Hugo 构建期不联网、也不生成它们
3. 漏跑**不会报错**，只会静默降级：分享卡退回兜底图、图片缺 width/height、中文锚点变成 `#%E4...`
4. 任一同步脚本失败只警告、不阻断发布 —— 加新步骤时保持这个约定
5. `git push` 后由 Cloudflare Pages 的 Git 集成自动构建。**本机没有 wrangler，不要手动上传**

## 写作约定

- 新建走 archetype，默认 `draft: true`；发布前改成 `false`
- frontmatter：`slug` 留空时由文件名兜底，英文文件名更稳；`summary` / `description` / `categories` / `tags` 要填
- `lastmod` 由 `sync-lastmod.py` 维护，**不要手改**
- 中文标题锚点在构建期由 `data/pinyin.json` 计算，**md 里不要写 `{#anchor}`**；缺字跑 `python3 scripts/sync-pinyin.py`
- 周刊模板固定 `frontmatter.brief` 四个 key：`observe` / `use` / `read` / `idea`（idea 可省略）
- 图片全部托管在 `img.hulatu.com`；尺寸和主色分别由 `sync-image-dims.py`、`sync-image-colors.py` 写入 `data/image-dims.json`、`data/image-colors.json`，**不要手改这两个文件**
- 本地未发布草稿放 `drafts/`（已 gitignore）；`content/**` 下 `draft: true` 是正常草稿

## 目录地图

- `content/posts/` 文章、`content/weekly/` 周刊；其余是单页（about / archive / tools / …）
- `layouts/` 站点层模板；`assets/css/theme.css`（上游复制）+ `custom.css`（站点补丁）+ `upgrade.css`（升级包），按序拼成 `main.min.<hash>.css`
- `data/`：`featured.yaml`、`tools.yaml`、`runs.json`（Garmin）、`pinyin.json`、`image-*.json`
- `static/`：`_headers`、`_redirects`、`images/og/<slug>.png`（分享卡）
- `functions/` Cloudflare Functions；`.github/workflows/build.yml`（构建校验）、`sync-garmin.yml`（每日跑步数据）

## 边界与坑

- 改样式前先读 `DESIGN.md` 和 `custom.css` 的「第 N 段」约定；优先改上游 `theme.css`，站点层尽量少叠规则
- 不要在正文或文档里手写篇数/文件数/体积 —— 这些只在 `sync-status.py` 的自动区块里出现
- 不要手改 `public/`（构建产物）
- 构建前清掉 `static/.DS_Store`；本地构建用 `hugo --minify --cleanDestinationDir`，否则删过的文章页会残留在 `public/`
- `hugo server` 运行时会往 `public/` 写 livereload，**部署/构建前先停掉**
- 发布前脚本依赖 `python3`（PATH 里的 conda base 3.13，脚本只用标准库）和 `node` + `sharp`（WorkBuddy 工作区，见 `publish.sh` 里的 `NODE_PATH`）
- Hugo 版本：CI 与 Cloudflare 固定 **0.170.0**，`hugo.toml` 的 `[module.hugoVersion]` 要求 ≥ 0.170.0；升级时三处一起改
- `publish.sh` 开头会检查 `.git/index.lock` 和未完成的 rebase，失败就停 —— 不要绕过

## 验收

发布或大改后至少确认：

1. `hugo --minify --cleanDestinationDir` 零报错
2. `bash scripts/check-links.sh` 无站内 404 / 锚点失效
3. `git status` 里派生数据（`data/*.json`、`static/images/og/`、文档自动区块）已一并提交
