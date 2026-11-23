#!/usr/bin/env python3
"""把 layouts/ 迁到 Hugo 0.146+ 的新目录结构，并用前后两次构建逐字节比对来验收。2026-11-23 新增。

为什么要迁：Hugo 0.146 重写了模板系统 —— `partials` / `shortcodes` 改名 `_partials` /
`_shortcodes`，`_markup` 可以放在 layouts 根，`_default/` 下的模板直接放根目录。旧路径
现在靠兼容映射在跑，官方文档只写新结构；本仓又是新旧混用（`partials/` 21 个 + `_partials/` 3 个）。

为什么要写成脚本、而不是直接挪：模板路径挪错时 Hugo **不会报错**，只会悄悄退回主题里的
同名模板 —— 构建照样成功，页面却变了。所以每一步都要用构建产物来验：

  1. 干净构建一次 → 临时目录 before/
  2. 挪目录（仓库里有 git 就用 git mv，保留历史）
  3. 再构建一次 → after/，和 before/ 逐字节比对（404.html 例外：它每次构建随机抽一篇）
  4. 完全一致 → 批量改文档 / 注释里的旧路径，再构建一次复核
     有任何差异 → 打印差异、把挪动和改动全部撤回，仓库回到运行前的样子

用法：
    python3 scripts/migrate-layouts.py             # 迁移 + 验收（失败自动回滚）
    python3 scripts/migrate-layouts.py --dry-run   # 只打印要挪哪些文件，不动仓库

⚠️ 跑之前先关掉 `hugo server`（它会和这里的构建抢 resources/ 缓存）。
⚠️ 只动 layouts/ 和文档里的路径字符串；themes/ 一个字节不碰（上游副本，主题仍是旧结构，
   Hugo 会把站点 `_partials/x.html` 当成主题 `partials/x.html` 的覆盖）。
⚠️ 迁移成功后这个脚本就没用了，可以删掉。
"""

from __future__ import annotations

import argparse
import filecmp
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
L = ROOT / "layouts"

ROOT_TEMPLATES = ("archive", "baseof", "categories", "featured", "list", "rss", "run",
                  "series", "single", "tools")
TEXT_SUFFIXES = {".md", ".html", ".xml", ".json", ".js", ".css", ".py", ".sh", ".toml", ".yml", ".yaml"}
REWRITE_DIRS = ("layouts", "assets", "scripts", "functions", ".github", "archetypes", "static")
REWRITE_FILES = ("README.md", "DESIGN.md", "MAINTENANCE.md", "hugo.toml", "deploy.sh", "publish.sh")
IGNORE_IN_DIFF = {"404.html"}


def find_hugo() -> str:
    for cand in (shutil.which("hugo"), "/opt/homebrew/bin/hugo", "/usr/local/bin/hugo"):
        if cand and os.access(cand, os.X_OK):
            return cand
    sys.exit("找不到 hugo。")


def has_git() -> bool:
    try:
        return subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], cwd=ROOT,
                              capture_output=True, text=True).returncode == 0
    except FileNotFoundError:
        return False


def plan_moves() -> list[tuple[Path, Path]]:
    moves: list[tuple[Path, Path]] = []
    if (L / "partials").is_dir():
        for f in sorted((L / "partials").rglob("*")):
            if f.is_file() and f.name != ".DS_Store":
                moves.append((f, L / "_partials" / f.relative_to(L / "partials")))
    if (L / "shortcodes").is_dir():
        for f in sorted((L / "shortcodes").rglob("*")):
            if f.is_file() and f.name != ".DS_Store":
                moves.append((f, L / "_shortcodes" / f.relative_to(L / "shortcodes")))
    if (L / "_default" / "_markup").is_dir():
        for f in sorted((L / "_default" / "_markup").rglob("*")):
            if f.is_file() and f.name != ".DS_Store":
                moves.append((f, L / "_markup" / f.relative_to(L / "_default" / "_markup")))
    if (L / "_default").is_dir():
        for f in sorted((L / "_default").iterdir()):
            if f.is_file() and f.name != ".DS_Store":
                moves.append((f, L / f.name))
    for src, dst in moves:
        if dst.exists():
            sys.exit(f"目标已存在，先手动处理：{dst.relative_to(ROOT)}")
    return moves


def move(src: Path, dst: Path, git: bool) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if git:
        r = subprocess.run(["git", "mv", str(src), str(dst)], cwd=ROOT, capture_output=True, text=True)
        if r.returncode == 0:
            return
        # 未被跟踪的文件（比如刚新建还没提交）git mv 会失败，退回普通移动
    shutil.move(str(src), str(dst))


def prune_empty_dirs() -> None:
    for d in (L / "partials", L / "shortcodes", L / "_default" / "_markup", L / "_default"):
        if d.is_dir():
            for junk in d.glob(".DS_Store"):
                junk.unlink()
            try:
                d.rmdir()
            except OSError:
                pass


def build(hugo: str, dest: Path) -> None:
    r = subprocess.run([hugo, "--gc", "--minify", "--cleanDestinationDir", "--quiet",
                        "--destination", str(dest)], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("构建失败：\n" + (r.stderr or r.stdout)[-3000:])
    warn = [l for l in (r.stderr or "").splitlines() if "WARN" in l]
    if warn:
        print("    构建警告：\n      " + "\n      ".join(warn[:10]))


def diff_trees(a: Path, b: Path) -> list[str]:
    out: list[str] = []
    fa = {p.relative_to(a).as_posix() for p in a.rglob("*") if p.is_file()}
    fb = {p.relative_to(b).as_posix() for p in b.rglob("*") if p.is_file()}
    for rel in sorted(fa ^ fb):
        out.append(f"只在{'改前' if rel in fa else '改后'}：{rel}")
    for rel in sorted(fa & fb):
        if Path(rel).name in IGNORE_IN_DIFF and rel.count("/") == 0:
            continue
        if not filecmp.cmp(a / rel, b / rel, shallow=False):
            out.append(f"内容不同：{rel}")
    return out


def rewrite_text(s: str) -> str:
    """把旧路径换成新路径；主题里的路径（主题仍是旧结构）先保护起来。"""
    # ⚠️ 占位符以 "/" 结尾：下面几条正则的后顾断言把 "/" 当成「前面还有路径」，
    #    这样主题路径里的 partials/ _default/ 都不会被碰。不带 themes/ 前缀的写法也一起保护。
    s = s.replace("hugo-bearneo/layouts/", "\0HB\0/")
    s = s.replace("layouts/_default/_markup/", "layouts/_markup/")
    s = re.sub(r"(?<![\w/.-])_default/_markup/", "_markup/", s)
    s = s.replace("layouts/partials/", "layouts/_partials/")
    s = s.replace("layouts/shortcodes/", "layouts/_shortcodes/")
    s = re.sub(r"(?<![\w/._-])partials/", "_partials/", s)
    s = re.sub(r"(?<![\w/._-])shortcodes/", "_shortcodes/", s)
    names = "|".join(ROOT_TEMPLATES)
    s = re.sub(rf"layouts/_default/(?=(?:{names})\.)", "layouts/", s)
    s = re.sub(rf"(?<![\w/.-])_default/(?=(?:{names})\.)", "", s)
    return s.replace("\0HB\0/", "hugo-bearneo/layouts/")


def rewrite_refs(dry: bool) -> dict[Path, str]:
    touched: dict[Path, str] = {}
    files = [ROOT / f for f in REWRITE_FILES if (ROOT / f).is_file()]
    for d in REWRITE_DIRS:
        if (ROOT / d).is_dir():
            files += [p for p in (ROOT / d).rglob("*") if p.is_file() and p.suffix in TEXT_SUFFIXES]
    me = Path(__file__).resolve()
    for p in files:
        if p.resolve() == me:
            continue
        try:
            old = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        new = rewrite_text(old)
        if new != old:
            touched[p] = old
            if not dry:
                p.write_text(new, encoding="utf-8")
    return touched


def main() -> int:
    ap = argparse.ArgumentParser(description="迁移 layouts/ 到 Hugo 新目录结构（自带验收与回滚）")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    moves = plan_moves()
    if not moves:
        print("layouts/ 已经是新结构，没有要挪的。")
        return 0
    print(f"要挪 {len(moves)} 个文件：")
    for s, d in moves:
        print(f"  {s.relative_to(ROOT)}  →  {d.relative_to(ROOT)}")
    if args.dry_run:
        touched = rewrite_refs(dry=True)
        print(f"\n另有 {len(touched)} 个文件里的旧路径会被改写（--dry-run 未写入）。")
        return 0

    hugo = find_hugo()
    git = has_git()
    tmp = Path(tempfile.mkdtemp(prefix="hb-migrate-"))
    done: list[tuple[Path, Path]] = []
    touched: dict[Path, str] = {}

    def rollback(reason: str) -> int:
        print(f"\n!! {reason}，正在回滚……")
        for p, old in touched.items():
            p.write_text(old, encoding="utf-8")
        for s, d in reversed(done):
            move(d, s, git)
        for d in (L / "_shortcodes", L / "_markup"):
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()
        print("   已回滚：layouts/ 和文档都回到了运行前的样子。")
        return 1

    try:
        print("\n==> 1/4 改前构建")
        build(hugo, tmp / "before")
        print("==> 2/4 挪目录" + ("（git mv）" if git else ""))
        for s, d in moves:
            move(s, d, git)
            done.append((s, d))
        prune_empty_dirs()
        print("==> 3/4 改后构建并逐字节比对（404.html 每次随机，不比）")
        build(hugo, tmp / "after")
        diffs = diff_trees(tmp / "before", tmp / "after")
        if diffs:
            print("    产物有差异：\n      " + "\n      ".join(diffs[:30]))
            return rollback("挪完目录后产物变了（多半是某个模板落回了主题的同名文件）")
        print("    ✓ 产物逐字节一致")
        print("==> 4/4 改写文档 / 注释里的旧路径，再构建复核")
        touched = rewrite_refs(dry=False)
        build(hugo, tmp / "final")
        diffs = diff_trees(tmp / "before", tmp / "final")
        if diffs:
            print("    产物有差异：\n      " + "\n      ".join(diffs[:30]))
            return rollback("改写路径字符串后产物变了")
        print(f"    ✓ 改写了 {len(touched)} 个文件里的路径，产物仍逐字节一致")
    except Exception as exc:  # 构建失败等
        return rollback(str(exc))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("\n迁移完成。建议：git status 看一眼，提交时单独成一个提交（只有挪动和路径字符串）。")
    print("这个脚本已经用完，可以删掉：git rm scripts/migrate-layouts.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
