#!/usr/bin/env bash
# ============================================================================
#  自查：构建产物里的 HTML 结构问题
#
#  用法：
#    bash scripts/check-html.sh              # 临时构建一份再查
#    bash scripts/check-html.sh public       # 查已有产物（不重新构建）
#  退出码：0 = 干净；1 = 发现问题；2 = 环境问题（没有产物 / 没有 hugo）
#
#  CI：`.github/workflows/build.yml` 在 lychee 链接检查之后跑
#      `bash scripts/check-html.sh public`，失败即阻断（2026-11-15 接入）。
#
#  ── 为什么需要它 ────────────────────────────────────────────────────────
#  `check-links.sh`（lychee）查的是「链接和锚点指向的东西存不存在」，
#  查不到「同一个 id 出现两次」这类问题 —— 而后者恰恰是模板拼接最容易出的事：
#  两份目录、两份评论框、页头 + 正文各一个 id，构建**不报错**、页面也没明显坏，
#  只有读屏软件和 HTML 校验器看得出来。
#
#  2026-11-15 加窄屏目录时就是这个形状：正文顶部多了一份目录，
#  靠字符串替换把 `<nav id="TableOfContents">` 换成 `<div>`；哪天上游改了
#  TOC 的写法，替换会**静默失效**，页面上就会出现两个同 id 的 nav。
#  这个脚本就是那条防线的执行者。
#
#  ── 查哪八样 ───────────────────────────────────────────────────────────
#    ① 同页重复 id            —— 无效 HTML，锚点跳转与 aria-* 引用都会失准
#    ② 同名 landmark          —— 两个 aria-label="目录" 的 nav，读屏分不清
#    ③ <img> 缺 alt 属性      —— 不是「alt 为空」（装饰图允许空），是压根没写
#    ④ 标题跳级               —— h2 直接跳到 h4，大纲断档
#    ⑤ 重复锚点 aria-label    —— 所有 `#` 都叫「链接到本节」，读屏分不清
#    ⑥ 产物污染               —— livereload / localhost:1313（hugo server 的残留）
#    ⑦ 打印字号               —— 屏幕 px 字号是否压过了 print 的 pt 覆盖
#    ⑧ 对比度                 —— :root 里正文/次级/三级/链接色对底色的最终组合
#
#  ⚠️ 本脚本不联网、不依赖构建之外的任何工具，只要求 python3。
#  ⚠️ 别把它并进 check-links.sh：那一个依赖 lychee（可能没装），
#     这个必须永远能跑 —— 两个脚本的依赖面不一样。
# ============================================================================

set -euo pipefail
cd "$(dirname "$0")/.."

build_dir="${1:-}"
owned_build=""

cleanup() {
  if [ -n "$owned_build" ]; then
    rm -rf -- "$owned_build"
  fi
}
trap cleanup EXIT

if [ -z "$build_dir" ]; then
  if ! command -v hugo >/dev/null 2>&1; then
    echo "没有指定目录，本机也没有 hugo —— 先构建，再 bash scripts/check-html.sh public" >&2
    exit 2
  fi
  owned_build=$(mktemp -d "${TMPDIR:-/tmp}/hb-html-build.XXXXXX")
  hugo --gc --minify --destination "$owned_build" >/dev/null
  build_dir="$owned_build"
fi

if [ ! -d "$build_dir" ]; then
  echo "构建目录不存在：$build_dir" >&2
  exit 2
fi

python3 - "$build_dir" <<'PY'
import collections
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1])
files = sorted(root.rglob("*.html"))

# 属性值可能带引号也可能不带（Hugo 的 minify 会去掉引号），两种都认。
VAL = r'("[^"]*"|\'[^\']*\'|[^\s>]+)'
ID = re.compile(r'\sid=' + VAL)
LANDMARK = re.compile(r'<(nav|aside|form|section)\b[^>]*\baria-label=' + VAL)
IMG = re.compile(r'<img\b[^>]*>')
# ⚠️ 必须认**裸 `alt`**（没有 `=`）：`<img alt width=48>` 是合法的「空 alt」，
#    表示装饰性图片 —— Hugo 的 minify 就会把 `alt=""` 压成 `alt`。
#    只写 `\salt=` 会把这类全部误报成「缺 alt」（2026-11-15 首跑踩过一次）。
ALT = re.compile(r"\salt(?=[\s=>/])")
HEADING = re.compile(r'<h([1-6])\b')
ANCHOR_TAG = re.compile(r'<a\b[^>]*>')

problems = collections.OrderedDict(
    [
        ("重复 id", []),
        ("同名 landmark", []),
        ("img 缺 alt", []),
        ("标题跳级", []),
        ("重复锚点 aria-label", []),
        ("产物污染(livereload/localhost)", []),
    ]
)


def unquote(v):
    return v[1:-1] if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'" else v


for path in files:
    rel = path.relative_to(root)
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        problems["重复 id"].append(f"{rel}: 读不出来（{exc}）")
        continue

    ids = [unquote(m.group(1)) for m in ID.finditer(text)]
    for value, count in collections.Counter(ids).items():
        if count > 1:
            problems["重复 id"].append(f"{rel}: id={value} 出现 {count} 次")

    labels = [unquote(m.group(2)) for m in LANDMARK.finditer(text)]
    for value, count in collections.Counter(labels).items():
        if count > 1:
            problems["同名 landmark"].append(f"{rel}: aria-label={value} 出现 {count} 次")

    for m in IMG.finditer(text):
        if not ALT.search(m.group(0)):
            problems["img 缺 alt"].append(f"{rel}: {m.group(0)[:110]}")

    previous = 0
    for m in HEADING.finditer(text):
        level = int(m.group(1))
        if previous and level > previous + 1:
            problems["标题跳级"].append(f"{rel}: h{previous} → h{level}")
        previous = level

    labels = []
    for m in ANCHOR_TAG.finditer(text):
        tag = m.group(0)
        if "heading-anchor" not in tag:
            continue
        lm = re.search(r'\baria-label=' + VAL, tag)
        if lm:
            labels.append(unquote(lm.group(1)))
    # 只查「所有锚点共用一个泛化名称」这种回归；同页两节标题恰好同名
    # （如周刊里的「主要内容：」）时 label 相同是内容本身决定的，不算错。
    if len(labels) > 1 and len(set(labels)) == 1:
        problems["重复锚点 aria-label"].append(
            f"{rel}: {len(labels)} 个锚点的 aria-label 全是「{labels[0]}」"
        )

    if "livereload" in text or "http://localhost:1313" in text:
        problems["产物污染(livereload/localhost)"].append(f"{rel}: 含开发服务器注入内容")

# robots.txt / sitemap.xml 也要查：它们不在 files 里（不是 .html）
for name in ("robots.txt", "sitemap.xml"):
    p = root / name
    if p.exists():
        t = p.read_text(encoding="utf-8", errors="replace")
        if "localhost:1313" in t:
            problems["产物污染(livereload/localhost)"].append(f"{name}: 指向 localhost:1313")

# ── CSS 检查：当前 HTML 真正引用的那一份（别被 public/ 里的旧 hash 误导）──
css_hrefs = set()
for path in files:
    text = path.read_text(encoding="utf-8", errors="replace")
    for m in re.finditer(r'<link\b[^>]*rel=stylesheet[^>]*href=' + VAL, text):
        href = unquote(m.group(1))
        css_hrefs.add(href.split("?")[0].split("#")[0])
css_text = ""
for href in css_hrefs:
    p = root / href.lstrip("/")
    if p.exists() and p.suffix == ".css":
        css_text += p.read_text(encoding="utf-8", errors="replace") + "\n"


def media_blocks(css, needle):
    out = []
    for m in re.finditer(r'@media\s*([^{]+)\{', css):
        if needle not in m.group(1):
            continue
        i = m.end()
        depth = 1
        j = i
        while j < len(css) and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        out.append(css[i:j - 1])
    return out


print_blocks = media_blocks(css_text, "print")
print_css = "\n".join(print_blocks)
css_no_print = css_text
for block in print_blocks:
    css_no_print = css_no_print.replace(block, "")

# 屏幕上的正文字号如果是 px，打印时必须再写一条 pt 覆盖，否则 20px 会压过 body 11pt。
extra = collections.OrderedDict([
    ("打印字号", []),
    ("对比度", []),
])
for m in re.finditer(r'content\.post-body\s*\{([^}]*)\}', css_no_print):
    fm = re.search(r'font-size\s*:\s*([^;}]+)', m.group(1))
    if not fm:
        continue
    screen_size = fm.group(1).strip()
    pm = re.search(r'content\.post-body\s*\{([^}]*)\}', print_css)
    print_size = None
    if pm:
        pf = re.search(r'font-size\s*:\s*([^;}]+)', pm.group(1))
        print_size = pf.group(1).strip() if pf else None
    if not screen_size.endswith("pt") and (not print_size or not print_size.endswith("pt")):
        extra["打印字号"].append(
            f"content.post-body 屏幕字号 {screen_size}，但打印块没有 pt 覆盖"
        )

# 对比度：按 CSS 顺序合并 :root 变量，分别得到 light / dark 的最终值。
ROOT = re.compile(
    r'(@media\s*\(prefers-color-scheme\s*:\s*(light|dark)\)\s*\{\s*)?:root\s*\{([^}]*)\}'
)
palettes = {"light": {}, "dark": {}}
for m in ROOT.finditer(css_text):
    mode = m.group(2)
    decls = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+)', m.group(3)))
    for key in (["light", "dark"] if not mode else [mode]):
        palettes[key].update({k: v.strip() for k, v in decls.items()})


def luminance(hex_color):
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        return None
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

    def f(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    if a is None or b is None:
        return None
    hi, lo = sorted((a, b), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


for mode, pal in palettes.items():
    bg = pal.get("--bg-color-primary")
    for var in ("--text-color-primary", "--text-color-secondary",
                "--text-color-tertiary", "--link-color"):
        fg = pal.get(var)
        if not bg or not fg or not fg.startswith("#"):
            continue
        ratio = contrast(fg, bg)
        if ratio is not None and ratio < 4.5:
            extra["对比度"].append(
                f"{mode}: {var} {fg} on {bg} = {ratio:.2f}:1 (< 4.5)"
            )

for name, items in extra.items():
    problems[name] = items

total = 0
for name, items in problems.items():
    total += len(items)
    if not items:
        print(f"  ✓ {name}：0")
        continue
    print(f"  ✗ {name}：{len(items)}")
    for item in items[:20]:
        print(f"      {item}")
    if len(items) > 20:
        print(f"      ……另有 {len(items) - 20} 条")

print()
print(f"检查了 {len(files)} 个 HTML 文件；问题合计 {total} 条。")
sys.exit(1 if total else 0)
PY
