#!/usr/bin/env python3
"""在本地登录 Garmin Connect，生成登录令牌，供 GitHub Actions 使用。

用法（在本机执行，不要在 GitHub 上执行）：
    pip install --upgrade garminconnect
    python3 scripts/garmin-token.py
    python3 scripts/garmin-token.py --fresh   # 令牌失效时：忽略本机旧令牌，重新登录

运行后会按提示输入邮箱、密码（密码不显示）。如果账号开了两步验证，
登录时会再提示输入验证码（看 Garmin 发到邮箱/验证器 App 的 6 位数字）。

执行成功后会把一段 JSON 令牌打印出来（形如 {"di_token":"eyJ..."}），
把它复制到 GitHub 仓库的 Settings → Secrets and variables → Actions，
新建一个名为 GARMINTOKENS 的 Secret 粘贴进去即可。
令牌会同时保存在本机 ~/.garminconnect/garmin_tokens.json。

令牌等同于你的登录凭证，只放进 GitHub Secret，不要发到公开场合。
令牌过期后重新跑一次本脚本即可。

环境变量（可选）：
    GARMIN_REGION     设为 cn 表示中国区账号（garmin.cn），不设时自动识别/询问
    GARMIN_MFA_CODE   两步验证码，不设则登录时交互输入
"""

from __future__ import annotations

import base64
import getpass
import os
import sys
import json
from pathlib import Path


def _token_text_indicates_cn(token_text: str) -> bool:
    lowered = token_text.lower()
    if "garmin.cn" in lowered or "prod-cn" in lowered:
        return True
    try:
        data = json.loads(token_text)
        di_token = data.get("di_token") or ""
        parts = di_token.split(".")
        if len(parts) >= 2:
            payload_b64 = parts[1]
            payload_b64 += "=" * (-len(payload_b64) % 4)
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            return str(payload.get("iss", "")).endswith("garmin.cn")
    except Exception:
        pass
    return False


def mfa_code() -> str:
    code = os.environ.get("GARMIN_MFA_CODE", "").strip()
    if not code:
        code = input("两步验证码（Garmin 发到邮箱/验证器 App，30-60 秒有效）: ").strip()
    if not code:
        raise RuntimeError("未输入验证码")
    return code


def dump_token(client, token_dir: Path) -> str:
    """尝试多种方式导出令牌字符串。"""
    candidates: list[str] = []

    # garminconnect 0.3.x：底层 client 直接导出 JSON 令牌
    try:
        candidates.append(client.client.dumps())
    except Exception:
        pass

    # 兜底：读本机 ~/.garminconnect/garmin_tokens.json 的原文
    if token_dir.is_dir():
        token_file = token_dir / "garmin_tokens.json"
        if token_file.is_file():
            try:
                candidates.append(token_file.read_text(encoding="utf-8").strip())
            except OSError:
                pass

    # 旧版 garth 令牌
    try:
        import garth

        candidates.append(garth.dumps())
    except Exception:
        pass

    try:
        candidates.append(client.garth.dumps())
    except Exception:
        pass

    # 最后的兜底：把其他令牌文件 base64 编码（旧格式专用）
    if token_dir.is_dir():
        for f in sorted(token_dir.iterdir()):
            if f.is_file() and ("token" in f.name.lower() or f.name == "garmin_tokens.json"):
                candidates.append(base64.b64encode(f.read_bytes()).decode())

    for token in candidates:
        if token:
            return token
    sys.exit("未能导出令牌：请确认 garminconnect 已安装且登录成功（pip show garminconnect）")


def main() -> None:
    email = os.environ.get("GARMIN_EMAIL", "").strip()
    password = os.environ.get("GARMIN_PASSWORD", "")
    region_env = os.environ.get("GARMIN_REGION", "").strip().lower()
    is_cn = region_env == "cn"
    token_dir = Path.home() / ".garminconnect"

    # 没显式指定区域时：已有令牌就按令牌识别，否则询问用户
    token_file = token_dir / "garmin_tokens.json"

    # 2026-11-22：--fresh 先把旧令牌挪开，强制用账号密码重新登录。
    # 不挪的话，库会优先加载旧令牌；旧令牌的 refresh token 若已被 CI 用掉（令牌轮换），
    # 这里会和 CI 报一样的「Failed to retrieve social profile」。
    # ⚠️ 区域要在挪走之前从旧令牌里读（2026-11-22 修：原来挪完才读，结果每次都要手答）；
    #    登录失败时把旧令牌原样放回去，不让一次输错密码把本机令牌也弄丢。
    backup = token_file.with_name("garmin_tokens.json.bak")
    moved = False
    region_known = bool(region_env)
    for candidate in (token_file, backup):
        if not region_known and candidate.is_file():
            try:
                is_cn = _token_text_indicates_cn(candidate.read_text(encoding="utf-8"))
                region_known = True
                print(f"按已有令牌识别为：{'中国区 garmin.cn' if is_cn else '国际区 garmin.com'}")
            except OSError:
                pass
    if "--fresh" in sys.argv[1:] and token_file.is_file():
        token_file.replace(backup)
        moved = True
        print(f"已把旧令牌挪到 {backup}，改用账号密码重新登录（失败会自动放回）。")
    if not region_known:
        answer = input("Garmin 账号是中国区（garmin.cn）吗？输入 y 或回车默认否: ").strip().lower()
        is_cn = answer in ("y", "yes")

    if not email:
        email = input("Garmin 账号邮箱: ").strip()
    # 容错：去掉手误输入或从命令行复制的反斜杠（\@ 转义残留）
    email = email.replace("\\", "").strip()
    if not password:
        password = getpass.getpass("Garmin 密码（输入时不显示）: ")
    if not email or not password:
        sys.exit("邮箱或密码不能为空。")

    try:
        from garminconnect import Garmin
    except ImportError:
        sys.exit("未安装 garminconnect，请先执行：pip install --upgrade garminconnect")

    try:
        client = Garmin(email=email, password=password, prompt_mfa=mfa_code, is_cn=is_cn)
        client.login(str(token_dir))
    except Exception as exc:
        if moved and backup.is_file() and not token_file.is_file():
            backup.replace(token_file)
            print("登录没成功，已把旧令牌放回原处。")
        hint = ""
        if "401" in str(exc) or "Invalid Username or Password" in str(exc):
            site = "https://connect.garmin.cn" if is_cn else "https://connect.garmin.com"
            hint = (
                f"\n  · 先在浏览器打开 {site}，用同一个账号和密码登录一次，确认能登录；\n"
                "  · 中国区和国际区是两套独立账号，密码可能不一样（这次按"
                f"{'中国区' if is_cn else '国际区'}登录）；\n"
                "  · 中国区账号如果是用手机号注册的，这里要填手机号；\n"
                "  · 输入密码时切到英文输入法（中文输入法可能打出全角字符）；\n"
                "  · 别连续试太多次，Garmin 会临时锁定账号。"
            )
        sys.exit(f"Garmin 登录失败：{exc}{hint}")

    token = dump_token(client, token_dir)
    print(token)
    print()
    print("把上面这一整段 JSON 复制到 GitHub Secret：GARMINTOKENS")


if __name__ == "__main__":
    main()
