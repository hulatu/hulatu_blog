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
#  ── 查哪四样 ───────────────────────────────────────────────────────────
#    ① 同页重复 id            —— 无效 HTML，锚点跳转与 aria-* 引用都会失准
#    ② 同名 landmark          —— 两个 aria-label="目录" 的 nav，读屏分不清
#    ③ <img> 缺 alt 属性      —— 不是「alt 为空」（装饰图允许空），是压根没写
#    ④ 标题跳级               —— h2 直接跳到 h4，大纲断档
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

problems = collections.OrderedDict(
    [("重复 id", []), ("同名 landmark", []), ("img 缺 alt", []), ("标题跳级", [])]
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
