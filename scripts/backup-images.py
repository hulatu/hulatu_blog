#!/usr/bin/env python3
"""把文章引用的图床图片（img.hulatu.com）镜像到备份盘。2026-11-22 新增。

为什么需要它：backup-blog.sh 只打包仓库里的东西，而正文的 380 多张图全在图床上，
不在仓库里。图床账号出问题（欠费 / 误删 / 平台变动）时，Git 备份救不回任何一张图，
整站会变成「有字没图」。这个脚本把**正文实际引用到的**每一张原图下载下来，
连同清单一起放进备份目录，才算完整的 3-2-1。

做法：
  · 扫 content/ 与 data/ 里所有 https://img.hulatu.com/post/… 地址（只要原图，
    不要 /cdn-cgi/image/ 变换后的版本）；
  · 镜像到 <备份目录>/images/post/<文件名>，**增量**：本地已有且大小与服务器一致就跳过，
    所以每次备份只下新图；
  · 写一份 images/manifest.tsv（地址 / 本地路径 / 字节数 / sha256），恢复时按它
    原样传回图床即可，文章里的地址一个字都不用改。

下载失败不会让备份失败：只在最后列出失败的地址并以退出码 2 结束，
backup-blog.sh 收到后只告警。图床正常但某张图 404，多半是正文里写错了地址，顺手修掉。

用法：
  python3 scripts/backup-images.py ~/Backups/hulatu-blog
  python3 scripts/backup-images.py ~/Backups/hulatu-blog --dry-run   # 只列清单，不下载

⚠️ 只用标准库（urllib），不引入依赖；和 publish.sh 一样，找不到 python3 就整步跳过。
⚠️ 只认 img.hulatu.com/post/ 下的图。换图床 / 加目录时改下面的 URL_RE。
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCAN_DIRS = ("content", "data")
SCAN_SUFFIXES = {".md", ".json", ".yaml", ".yml", ".toml", ".html"}

# 文件名里可能有中文和 %20，所以不能只认 ASCII；用「图片扩展名」收尾，
# 免得把正文里紧跟在地址后面的「（954×954）。」「`，」之类吞进去。
URL_RE = re.compile(
    r"https://img\.hulatu\.com/post/[^\s)\"'<>\]`（）。，、；：]+?\.(?:jpe?g|png|webp|gif|avif|svg)",
    re.IGNORECASE,
)
# 正文里举例用的占位地址，不是真图。
PLACEHOLDERS = {"XX"}

UA = "hulatu-blog-backup/1.0 (+https://hulatu.com/)"
TIMEOUT = 30
RETRIES = 3


def collect_urls() -> list[str]:
    urls: set[str] = set()
    for d in SCAN_DIRS:
        for path in (ROOT / d).rglob("*"):
            if path.is_file() and path.suffix.lower() in SCAN_SUFFIXES:
                text = path.read_text(encoding="utf-8", errors="replace")
                urls.update(URL_RE.findall(text))
    return sorted(
        u for u in urls
        if Path(urllib.parse.unquote(urllib.parse.urlsplit(u).path)).stem not in PLACEHOLDERS
    )


def local_path(dest: Path, url: str) -> Path:
    rel = urllib.parse.unquote(urllib.parse.urlsplit(url).path).lstrip("/")
    return dest / "images" / rel


def request_url(url: str) -> str:
    """把中文文件名编码成合法 URL；已经是 %XX 的部分保持不动。"""
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(parts._replace(path=urllib.parse.quote(parts.path, safe="/%")))


def fetch(url: str, method: str = "GET") -> tuple[int, bytes, int | None]:
    req = urllib.request.Request(request_url(url), method=method, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        length = resp.headers.get("Content-Length")
        body = resp.read() if method == "GET" else b""
        return resp.status, body, int(length) if length and length.isdigit() else None


def mirror(url: str, target: Path) -> str:
    """返回 'skip' / 'new' / 'updated'；失败抛异常。"""
    if target.is_file():
        try:
            _, _, remote_size = fetch(url, "HEAD")
            if remote_size is None or remote_size == target.stat().st_size:
                return "skip"
        except Exception:
            return "skip"  # HEAD 不通时保留旧文件，不覆盖
    last: Exception | None = None
    for attempt in range(RETRIES):
        try:
            status, body, _ = fetch(url)
            if status != 200 or not body:
                raise RuntimeError(f"HTTP {status}，{len(body)} 字节")
            existed = target.is_file()
            target.parent.mkdir(parents=True, exist_ok=True)
            tmp = target.with_suffix(target.suffix + ".part")
            tmp.write_bytes(body)
            tmp.replace(target)
            return "updated" if existed else "new"
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                raise RuntimeError("404，图床上已经没有这张图") from exc
            last = exc
        except Exception as exc:  # 超时、断网等，重试
            last = exc
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(str(last))


def main() -> int:
    parser = argparse.ArgumentParser(description="镜像正文引用的图床图片到备份目录")
    parser.add_argument("dest", help="备份目录（与 backup-blog.sh 的 DEST 相同）")
    parser.add_argument("--dry-run", action="store_true", help="只列出会备份哪些图，不下载")
    args = parser.parse_args()

    dest = Path(args.dest).expanduser().resolve()
    urls = collect_urls()
    print(f"图床图片：正文共引用 {len(urls)} 张")

    if args.dry_run:
        have = sum(1 for u in urls if local_path(dest, u).is_file())
        print(f"备份目录里已有 {have} 张，需下载 {len(urls) - have} 张（只检查，不写入）")
        return 0

    counts = {"skip": 0, "new": 0, "updated": 0}
    failed: list[tuple[str, str]] = []
    rows: list[str] = []
    for i, url in enumerate(urls, 1):
        target = local_path(dest, url)
        try:
            counts[mirror(url, target)] += 1
        except Exception as exc:
            failed.append((url, str(exc)))
        if target.is_file():
            data = target.read_bytes()
            rows.append("\t".join([url, target.relative_to(dest).as_posix(),
                                   str(len(data)), hashlib.sha256(data).hexdigest()]))
        if i % 50 == 0:
            print(f"  …{i}/{len(urls)}")

    manifest = dest / "images" / "manifest.tsv"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text("url\tpath\tbytes\tsha256\n" + "\n".join(rows) + "\n", encoding="utf-8")

    total = sum(int(r.split("\t")[2]) for r in rows)
    print(
        f"图片备份：新增 {counts['new']}、更新 {counts['updated']}、未变 {counts['skip']}，"
        f"共 {len(rows)} 张 / {total / 1024 / 1024:.1f} MB → {dest / 'images'}"
    )
    print(f"清单：{manifest}")
    if failed:
        print(f"!! {len(failed)} 张没备份上：", file=sys.stderr)
        for url, why in failed:
            print(f"   {url}  —— {why}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
