#!/usr/bin/env bash
set -euo pipefail

# 生成博客的内容快照和 Git bundle，用于数字花园的 3-2-1 备份。
# 2026-11-22 起还会把正文引用的图床图片镜像到 <备份目录>/images/（增量，见 scripts/backup-images.py）
# —— 仓库里没有这些图，只备份仓库等于没备份图片。
#
# 用法：
#   bash scripts/backup-blog.sh
#   BACKUP_DEST="/Volumes/SSD/hulatu-blog" bash scripts/backup-blog.sh
#   bash scripts/backup-blog.sh /path/to/backup
#   bash scripts/backup-blog.sh --dry-run
#   SKIP_IMAGES=1 bash scripts/backup-blog.sh      # 只备份仓库，不下载图片（没网时）

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# 找 python3 的顺序与 publish.sh 一致；找不到就跳过图片那一步（仓库备份照常）。
PYTHON_BIN=""
for cand in "$(command -v python3 2>/dev/null || true)" \
  /opt/homebrew/Caskroom/miniforge/base/bin/python3 \
  /usr/local/bin/python3; do
  if [[ -n "$cand" && -x "$cand" ]]; then
    PYTHON_BIN="$cand"
    break
  fi
done

if [[ "${1:-}" == "--dry-run" ]]; then
  DEST="${2:-${BACKUP_DEST:-$HOME/Backups/hulatu-blog}}"
  echo "只检查，不写入。"
  echo "备份目录：$DEST"
  echo "将包含：content static layouts assets archetypes data scripts .github hugo.toml README.md MAINTENANCE.md DESIGN.md"
  if [[ -n "$PYTHON_BIN" && -z "${SKIP_IMAGES:-}" ]]; then
    "$PYTHON_BIN" scripts/backup-images.py "$DEST" --dry-run || true
  fi
  exit 0
fi

DEST="${1:-${BACKUP_DEST:-$HOME/Backups/hulatu-blog}}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"

TMP="$(mktemp -d "${TMPDIR:-/tmp}/hulatu-backup.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

SNAPSHOT="$TMP/snapshot"
mkdir -p "$SNAPSHOT"

for item in \
  content \
  static \
  layouts \
  assets \
  archetypes \
  data \
  scripts \
  docs \
  .github \
  hugo.toml \
  README.md \
  MAINTENANCE.md \
  DESIGN.md; do
  if [[ -e "$item" ]]; then
    cp -R "$item" "$SNAPSHOT/$item"
  fi
done

ARCHIVE="$DEST/hulatu-blog-content-$STAMP.tar.gz"
tar \
  --exclude='.DS_Store' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  -czf "$ARCHIVE" \
  -C "$SNAPSHOT" .

BUNDLE="$DEST/hulatu-blog-git-$STAMP.bundle"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git bundle create "$BUNDLE" --all >/dev/null
else
  echo "警告：当前目录不是 Git 仓库，已跳过 Git bundle。" >&2
fi

echo "内容备份：$ARCHIVE"
if [[ -f "$BUNDLE" ]]; then
  echo "Git 备份：$BUNDLE"
  shasum -a 256 "$ARCHIVE" "$BUNDLE"
else
  shasum -a 256 "$ARCHIVE"
fi

# 图床图片（增量镜像，不按时间戳复制：图片几乎不改，每次全量会白白占几百 MB）。
# 失败只告警：仓库那两份已经写好了，不能因为图床抖一下就让整次备份「失败」。
if [[ -n "${SKIP_IMAGES:-}" ]]; then
  echo "已按 SKIP_IMAGES 跳过图床图片备份。"
elif [[ -z "$PYTHON_BIN" ]]; then
  echo "警告：没找到 python3，跳过图床图片备份（scripts/backup-images.py）。" >&2
else
  set +e
  "$PYTHON_BIN" scripts/backup-images.py "$DEST"
  img_rc=$?
  set -e
  if [[ $img_rc -ne 0 ]]; then
    echo "警告：图床图片有部分没备份上（见上面的列表），仓库备份不受影响。" >&2
  fi
fi
