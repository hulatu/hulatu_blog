#!/usr/bin/env python3
"""给每张图床图片算一个「主色」，写成 data/image-colors.json。2026-11-23 新增。

用途：图片还没加载出来时，占位块先显示这张图自己的平均色（render-image.html 输出
`--ph:#rrggbb`，custom.css 第 64 段用它），而不是全站统一的浅灰 —— 图片淡入时颜色
是「接上」的，不是从灰色突然跳成一张彩图。

做法（只用标准库 + macOS 自带的 sips）：
  1. 让图床的边缘转换先把图缩成 24×24 的 baseline JPEG（几百字节，图床替我们缩图）：
       https://img.hulatu.com/cdn-cgi/image/width=24,height=24,fit=cover,anim=false,format=baseline-jpeg/<path>
  2. `sips` 把它转成 BMP（macOS 自带，不用装 Pillow）；
  3. 读 BMP 像素取平均，写成 #rrggbb。

只处理 data/image-dims.json 里 img.hulatu.com 的图（尺寸表本来就列全了正文里的图）；
站内 /images/ 下的图不走图床转换，跳过（模板里会退回浅灰）。

和 sync-image-dims.py 一样是「离线生成、提交进仓库」的派生数据：构建本身不联网。
不是 macOS（没有 sips）或断网时直接跳过，不影响发布。

用法：
    python3 scripts/sync-image-colors.py          # 只补缺的
    python3 scripts/sync-image-colors.py --all    # 全部重算
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIMS = ROOT / "data" / "image-dims.json"
OUT = ROOT / "data" / "image-colors.json"
HOST = "https://img.hulatu.com/"
TRANSFORM = HOST + "cdn-cgi/image/width=24,height=24,fit=cover,anim=false,format=baseline-jpeg/"
UA = {"User-Agent": "hulatu-blog-color-fetcher/1.0"}


def fetch_small(url: str) -> bytes:
    path = urllib.parse.quote(url[len(HOST):], safe="/%")
    req = urllib.request.Request(TRANSFORM + path, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def bmp_average(data: bytes) -> tuple[int, int, int]:
    """读 sips 输出的 BMP（BITMAPINFOHEADER 或更新版本），返回 RGB 平均值。"""
    if data[:2] != b"BM":
        raise ValueError("不是 BMP")
    offset = struct.unpack_from("<I", data, 10)[0]
    width, height = struct.unpack_from("<ii", data, 18)
    bpp = struct.unpack_from("<H", data, 28)[0]
    if bpp not in (24, 32):
        raise ValueError(f"不支持 {bpp} 位 BMP")
    step = bpp // 8
    row = ((width * step + 3) // 4) * 4
    total = [0, 0, 0]
    n = 0
    for y in range(abs(height)):
        base = offset + y * row
        for x in range(width):
            b, g, r = data[base + x * step: base + x * step + 3]
            total[0] += r
            total[1] += g
            total[2] += b
            n += 1
    if not n:
        raise ValueError("空图")
    return tuple(round(c / n) for c in total)  # type: ignore[return-value]


def average_color(jpeg: bytes, sips: str) -> str:
    with tempfile.TemporaryDirectory(prefix="hb-color-") as tmp:
        src = Path(tmp) / "in.jpg"
        dst = Path(tmp) / "out.bmp"
        src.write_bytes(jpeg)
        r = subprocess.run([sips, "-s", "format", "bmp", str(src), "--out", str(dst)],
                           capture_output=True, text=True)
        if r.returncode != 0 or not dst.exists():
            raise RuntimeError((r.stderr or r.stdout).strip()[:200] or "sips 转换失败")
        red, green, blue = bmp_average(dst.read_bytes())
    return f"#{red:02x}{green:02x}{blue:02x}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="全部重算（默认只补缺的）")
    args = ap.parse_args()

    sips = shutil.which("sips") or ("/usr/bin/sips" if os.path.exists("/usr/bin/sips") else "")
    if not sips:
        print("    跳过图片主色：没有 sips（只在 macOS 上运行）")
        return 0
    if not DIMS.exists():
        print("    跳过图片主色：还没有 data/image-dims.json")
        return 0

    urls = sorted(u for u in json.loads(DIMS.read_text(encoding="utf-8")) if u.startswith(HOST))
    old: dict[str, str] = {}
    if OUT.exists():
        old = json.loads(OUT.read_text(encoding="utf-8"))
    todo = urls if args.all else [u for u in urls if u not in old]
    if not todo:
        print(f"    图片主色：{len(old)} 张都已记录，没有要补的")
        return 0

    ok = fail = 0
    for n, u in enumerate(todo, 1):
        if n > 1:
            time.sleep(0.2)  # 节流，别把图床打限流
        try:
            old[u] = average_color(fetch_small(u), sips)
            ok += 1
        except Exception as exc:  # 断网 / 图被删 / 转换失败：跳过这一张
            fail += 1
            print(f"    ✗ {u}：{type(exc).__name__}: {exc}")
            if fail >= 5 and ok == 0:
                print("    连续失败，多半是断网，先停下（不影响发布）")
                break

    # 只保留仍在尺寸表里的图，排序输出，diff 才稳定
    keep = {k: old[k] for k in sorted(old) if k in set(urls)}
    OUT.write_text(json.dumps(keep, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"    图片主色：本次新增 {ok}、失败 {fail}，共 {len(keep)} 张 → {OUT.relative_to(ROOT)}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
