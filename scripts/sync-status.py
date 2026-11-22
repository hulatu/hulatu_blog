#!/usr/bin/env python3
"""把站点的「会变的数字」自动写进文档。2026-11-22 新增。

为什么需要它：README / DESIGN / MAINTENANCE 里原来到处手写着「113 篇」「48 个文件」
「sitemap 163 条」—— 每发一篇、每加一个模板就过期一处，三份文档之间互相矛盾
（2026-11-22 审查时同一个「周刊期数」在三处分别写着 28 / 30 / 30，实际 31）。
而这几份文档是改站时的唯一依据，错数字会直接变成错决策。

现在的约定：**会随内容变化的数字只在两个自动区块里出现**，正文里不再手写。
  · MAINTENANCE.md 第 0 节 `<!-- status:begin -->` … `<!-- status:end -->`（完整版）
  · README.md「站点现状」里同名标记之间（精简版）
  · README.md 顶部「内容 / 周刊」两枚徽章上的数字
区块外面的数字一律是**带日期的历史记录**，不代表现在。

数字分两类：
  · 源码统计（content/、layouts/、scripts/ …）每次都重算；
  · 构建统计（public/ 里的 HTML 数、sitemap、CSS/JS/索引体积）读的是**上一次构建**。
    public/ 不存在，或者是 `hugo server` 写出来的开发版（含 livereload、未压缩）时，
    构建那几行**保留区块里的旧值**，不会写进错误的数字。

用法：
  python3 scripts/sync-status.py           # 更新文档（没变化就一个字节都不写）
  python3 scripts/sync-status.py --check   # 只检查，过期就退出码 1（适合 CI）
  python3 scripts/sync-status.py --print   # 只打印统计结果

publish.sh 在提交前自动跑（失败只告警，不阻断发布）。
⚠️ 只用标准库。⚠️ 区块里的内容整段重写，**别在标记之间手改**，改了也会被覆盖。
"""

from __future__ import annotations

import argparse
import gzip
import re
import statistics
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

BEGIN = "<!-- status:begin（scripts/sync-status.py 自动生成，别手改） -->"
END = "<!-- status:end -->"
BLOCK_RE = re.compile(r"<!-- status:begin[^>]*-->\n.*?\n<!-- status:end -->", re.S)
BUILD_KEYS = ("产出 HTML", "sitemap", "标签词条页", "CSS", "全站 JS", "搜索索引", "文章页 HTML", "首页 HTML")


def files(rel: str, pattern: str = "**/*") -> list[Path]:
    base = ROOT / rel
    if not base.is_dir():
        return []
    return sorted(p for p in base.glob(pattern) if p.is_file() and p.name != ".DS_Store")


def front_matter(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    return m.group(1) if m else ""


def field(fm: str, key: str) -> str:
    m = re.search(rf"^{key}:\s*(.*)$", fm, re.M)
    return m.group(1).strip().strip("\"'") if m else ""


def list_field(fm: str, key: str) -> list[str]:
    raw = field(fm, key)
    if raw.startswith("["):
        return [x.strip().strip("\"'") for x in raw.strip("[]").split(",") if x.strip().strip("\"'")]
    m = re.search(rf"^{key}:\s*\n((?:\s+-.*\n?)+)", fm, re.M)
    if m:
        return [x.strip()[1:].strip().strip("\"'") for x in m.group(1).splitlines() if x.strip()]
    return [raw] if raw else []


def kb(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def gz(data: bytes) -> int:
    return len(gzip.compress(data, compresslevel=9, mtime=0))


def source_stats() -> dict:
    def articles(section: str) -> list[Path]:
        return [p for p in files(f"content/{section}", "*.md") if p.name != "_index.md"]

    posts, weekly = articles("posts"), articles("weekly")
    fms = {p: front_matter(p) for p in posts + weekly}
    drafts = sum(1 for fm in fms.values() if field(fm, "draft") == "true")
    cats = Counter(c for fm in fms.values() for c in list_field(fm, "categories"))
    series = Counter(s for fm in fms.values() if (s := field(fm, "series")))
    sections = [p for p in (ROOT / "content/posts/_index.md", ROOT / "content/weekly/_index.md") if p.is_file()]
    root_pages = [p for p in files("content", "*.md") if p.name != "_index.md"]
    redirects = [
        line for line in (ROOT / "static/_redirects").read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ] if (ROOT / "static/_redirects").is_file() else []
    return {
        "posts": len(posts), "weekly": len(weekly), "drafts": drafts,
        "markdown": len(posts) + len(weekly) + len(sections),
        "sections": len(sections),
        "cats": cats, "series": series,
        "root_pages": len(root_pages),
        "layouts": len(files("layouts")),
        "js": len(files("assets/js", "*.js")),
        "css": len(files("assets/css", "*.css")),
        "theme": len(files("themes/hugo-bearneo")),
        "scripts": len([p for p in files("scripts", "*") if p.parent == ROOT / "scripts"]),
        "workflows": len(files(".github/workflows", "*.yml")),
        "redirects": len(redirects),
    }


def build_stats() -> dict | None:
    """读上一次构建。开发版产物（hugo server）或没有 public/ 时返回 None。"""
    home = PUBLIC / "index.html"
    if not home.is_file():
        return None
    home_bytes = home.read_bytes()
    if b"livereload" in home_bytes or b"localhost:1313" in home_bytes:
        return None
    out: dict = {"html": len(list(PUBLIC.rglob("*.html")))}
    sm = PUBLIC / "sitemap.xml"
    out["sitemap"] = sm.read_text(encoding="utf-8").count("<loc>") if sm.is_file() else None
    tags = PUBLIC / "tags"
    out["tags"] = len([d for d in tags.iterdir() if d.is_dir()]) if tags.is_dir() else 0
    for key, pattern in (("css", "css/main.min.*.css"), ("site_js", "js/site.min.*.js"), ("index", "index.json")):
        found = sorted(PUBLIC.glob(pattern), key=lambda p: p.stat().st_mtime)
        if found:
            data = found[-1].read_bytes()
            out[key] = (len(data), gz(data))
    pages = [p.read_bytes() for p in PUBLIC.glob("posts/*/*/*/*/index.html")]
    if pages:
        out["post_html"] = (int(statistics.median(len(b) for b in pages)), int(statistics.median(gz(b) for b in pages)))
    out["home_html"] = (len(home_bytes), gz(home_bytes))
    return out


def size_cell(v) -> str:
    return f"{kb(v[0])}，gzip {kb(v[1])}" if v else "—"


def rows_maintenance(s: dict, b: dict | None) -> list[tuple[str, str]]:
    cats = " / ".join(f"{k} {v}" for k, v in s["cats"].most_common())
    series = " / ".join(f"{k} {v}" for k, v in s["series"].most_common())
    rows = [
        ("内容", f"文章 **{s['posts']}** 篇 + 周刊 **{s['weekly']}** 期 = **{s['posts'] + s['weekly']}** 个内容页"
                f"（另有 {s['sections']} 个 section index，共 {s['markdown']} 个 Markdown）；草稿 {s['drafts']} 篇"),
        ("分类", f"{len(s['cats'])} 个：{cats}"),
        ("系列", f"{len(s['series'])} 组 {sum(s['series'].values())} 篇：{series}" if s["series"] else "0"),
        ("根级独立页", f"{s['root_pages']} 个（`content/*.md`，不含首页 `_index.md`）"),
        ("站点层", f"`layouts/` {s['layouts']} 个文件 + `assets/js/` {s['js']} 个 + `assets/css/` {s['css']} 个"),
        ("主题副本", f"`themes/hugo-bearneo/` {s['theme']} 个文件"),
        ("脚本", f"`scripts/` {s['scripts']} 个；GitHub Actions {s['workflows']} 个"),
        ("301", f"`static/_redirects` {s['redirects']} 条"),
    ]
    if b:
        rows += [
            ("产出 HTML", f"{b['html']} 个"),
            ("sitemap", f"{b['sitemap']} 条" if b.get("sitemap") is not None else "—"),
            ("标签词条页", f"{b['tags']} 个（`noindex`）"),
            ("CSS", f"`/css/main.min.*.css` {size_cell(b.get('css'))}"),
            ("全站 JS", f"`/js/site.min.*.js` {size_cell(b.get('site_js'))}"),
            ("搜索索引", f"`/index.json` {size_cell(b.get('index'))}"),
            ("文章页 HTML", f"中位数 {size_cell(b.get('post_html'))}"),
            ("首页 HTML", size_cell(b.get("home_html"))),
        ]
    return rows


def render(rows: list[tuple[str, str]], note: str) -> str:
    body = "\n".join(f"| {k} | {v} |" for k, v in rows)
    return f"{BEGIN}\n{note}\n\n| 项 | 当前值 |\n| --- | --- |\n{body}\n{END}"


def old_build_rows(text: str) -> list[tuple[str, str]]:
    m = BLOCK_RE.search(text)
    if not m:
        return []
    out = []
    for line in m.group(0).splitlines():
        cm = re.match(r"\| (.+?) \| (.+) \|$", line)
        if cm and cm.group(1) in BUILD_KEYS:
            out.append((cm.group(1), cm.group(2)))
    return out


def update_block(text: str, rows: list[tuple[str, str]], note: str, keep_build: bool) -> str:
    if keep_build:
        rows = rows + old_build_rows(text)
    new = render(rows, note)
    if not BLOCK_RE.search(text):
        raise SystemExit("文档里没找到 <!-- status:begin --> … <!-- status:end --> 标记")
    return BLOCK_RE.sub(lambda _m: new, text, count=1)


def main() -> int:
    ap = argparse.ArgumentParser(description="把站点统计写进 README / MAINTENANCE 的自动区块")
    ap.add_argument("--check", action="store_true", help="只检查是否过期，过期退出码 1")
    ap.add_argument("--print", action="store_true", help="只打印统计")
    args = ap.parse_args()

    s = source_stats()
    b = build_stats()
    if args.print:
        for k, v in rows_maintenance(s, b):
            print(f"{k}：{v}")
        if b is None:
            print("（public/ 不存在或是 hugo server 的开发版产物，构建统计跳过）")
        return 0

    note_m = ("源码统计每次重算；构建统计取自上一次干净构建（`./deploy.sh`）的 `public/`。"
              "这里之外出现的数字都是带日期的历史记录。")
    rows_r = [r for r in rows_maintenance(s, b) if r[0] in ("内容", "分类", "系列", "产出 HTML", "sitemap", "文章页 HTML")]
    note_r = "完整统计见 [MAINTENANCE.md 第 0 节](MAINTENANCE.md)。"

    targets = {
        ROOT / "MAINTENANCE.md": (rows_maintenance(s, b), note_m),
        ROOT / "README.md": (rows_r, note_r),
    }
    changed = []
    for path, (rows, note) in targets.items():
        text = path.read_text(encoding="utf-8")
        new = update_block(text, rows, note, keep_build=b is None)
        if path.name == "README.md":
            new = re.sub(r"(message=)\d+(%20%E7%AF%87)", rf"\g<1>{s['posts']}\g<2>", new)   # 「篇」
            new = re.sub(r"(message=)\d+(%20%E6%9C%9F)", rf"\g<1>{s['weekly']}\g<2>", new)  # 「期」
        if new != text:
            changed.append(path.name)
            if not args.check:
                path.write_text(new, encoding="utf-8")

    if args.check:
        if changed:
            print(f"文档里的统计过期了：{', '.join(changed)}。跑一次 python3 scripts/sync-status.py", file=sys.stderr)
            return 1
        print("文档统计是最新的")
        return 0
    print(f"    站点统计已更新：{', '.join(changed)}" if changed else "    站点统计没有变化")
    if b is None:
        print("    （public/ 是开发版产物或不存在，构建那几行沿用旧值）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
