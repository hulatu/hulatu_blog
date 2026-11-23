#!/usr/bin/env python3
"""从 Garmin Connect 同步跑步记录到 data/runs.json。

本地使用：
    ./publish.sh   # 自动用本机令牌同步并提交推送
    或直接：python3 scripts/sync-garmin.py

本机令牌由 scripts/garmin-token.py 生成，保存在 ~/.garminconnect/garmin_tokens.json，
存在时优先使用，不需要每次输账号密码。

也可把 garmin-token.py 打印的长字符串存为 GitHub Secret：GARMINTOKENS，
手动触发 GitHub Actions 同步（见 .github/workflows/sync-garmin.yml）。

环境变量：
    GARMIN_EMAIL      Garmin 账号邮箱（仅本机兜底用；CI 不再提供）
    GARMIN_PASSWORD   Garmin 密码（仅本机兜底用；CI 不再提供）
    GARMIN_REGION     可选，cn 表示中国区账号（garmin.cn），不设时自动从令牌识别
    GARMINTOKENS      登录令牌（scripts/garmin-token.py 生成），优先使用；CI 里必填
    GARMIN_MFA_CODE   可选，账号开启两步验证时填当前验证码
    GARMIN_TOKEN_ONLY 设为 1 时只允许令牌登录，令牌缺失或无效直接失败、不回退密码
                      （2026-11-22 起 GitHub Actions 里设为 1）
    GARMIN_TYPES      可选，要同步的运动类型，逗号分隔，默认 running
    GARMIN_LIMIT      可选，每次最多拉取多少条，默认 100
"""

from __future__ import annotations

import json
import os
import sys
import time
import base64
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "runs.json"
# 2026-11-22：`updated` 固定写台北时间（与 sync-lastmod.py 同一口径）。GitHub 的机器是 UTC，
# 同步挪到 00:10（Asia/Taipei）之后，UTC 时间正好还是前一天，/run/ 上的「数据更新于」会差一天。
TZ = timezone(timedelta(hours=8))


def _token_text_indicates_cn(token_text: str) -> bool:
    """判断令牌是否属于中国区（garmin.cn）账号。

    garminconnect 0.3.x 的令牌是 JSON，其中 di_token 是 JWT，
    明文里不再有 prod-cn 字样，需要解码 JWT 的 iss 字段判断。
    旧格式令牌若直接含 garmin.cn / prod-cn，也能兼容识别。
    """
    lowered = token_text.lower()
    if "garmin.cn" in lowered or "prod-cn" in lowered:
        return True
    if "garmin.com" in lowered:
        return False

    raw = token_text
    if not raw.lstrip().startswith("{"):
        # 兼容旧脚本导出的 base64 令牌
        try:
            raw = base64.b64decode(raw).decode("utf-8")
            if "garmin.cn" in raw.lower() or "prod-cn" in raw.lower():
                return True
            if "garmin.com" in raw.lower():
                return False
        except Exception:
            return False

    try:
        data = json.loads(raw)
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


def token_expiry_note(token_text: str) -> str:
    """只读令牌里访问令牌的过期时间（JWT 的 exp），用于日志诊断；不输出任何令牌内容。"""
    try:
        data = json.loads(token_text)
        part = (data.get("di_token") or "").split(".")[1]
        part += "=" * (-len(part) % 4)
        exp = json.loads(base64.urlsafe_b64decode(part)).get("exp")
        when = datetime.fromtimestamp(float(exp), TZ)
        state = "已过期，需要用 refresh token 续期" if when < datetime.now(TZ) else "仍有效"
        return f"Secret 里的访问令牌有效期至 {when:%Y-%m-%d %H:%M}（台北时间），{state}"
    except Exception:
        return "无法从令牌里读出有效期"


def load_existing() -> dict:
    if not DATA_FILE.exists():
        return {"updated": "", "activities": []}
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        sys.exit(f"读取 {DATA_FILE} 失败：{exc}")


def to_item(activity: dict, allowed_types: set[str]) -> dict | None:
    atype = activity.get("activityType") or {}
    type_key = atype.get("typeKey", "")
    if type_key not in allowed_types:
        return None

    start_time = activity.get("startTimeLocal") or ""
    activity_id = str(activity.get("activityId") or "")
    if not start_time or not activity_id:
        return None

    distance_m = activity.get("distance") or 0
    duration_s = activity.get("duration") or 0

    item: dict = {
        "id": activity_id,
        "date": start_time[:10],
        "distance_km": round(distance_m / 1000.0, 2),
        "duration_s": round(duration_s),
    }
    avg_hr = activity.get("averageHR")
    if avg_hr:
        item["avg_hr"] = round(avg_hr)
    calories = activity.get("calories")
    if calories:
        item["calories"] = round(calories)
    return item


def fingerprint(item: dict) -> tuple:
    """生成除活动 id 外的内容指纹，用于防止 Garmin 返回不同 id 的重复记录。"""
    return tuple(sorted((k, str(v)) for k, v in item.items() if k != "id"))


def _pace_seconds(item: dict) -> int | None:
    distance_km = float(item.get("distance_km") or 0)
    duration_s = float(item.get("duration_s") or 0)
    if distance_km <= 0 or duration_s <= 0:
        return None
    return int(round(duration_s / distance_km))


def _format_pace(seconds: int | None) -> str | None:
    if seconds is None:
        return None
    seconds = int(round(seconds))
    return f"{seconds // 60}:{seconds % 60:02d}"


def add_pace(item: dict) -> dict:
    """给单条跑步记录补充配速字段，供本站 `/run/` 页直接展示。"""
    enriched = dict(item)
    pace = _pace_seconds(item)
    if pace is not None:
        enriched["pace_s"] = pace
        enriched["pace"] = _format_pace(pace)
    return enriched


def _record(item: dict) -> dict:
    return {
        "id": item.get("id"),
        "date": item.get("date"),
        "distance_km": item.get("distance_km"),
        "duration_s": item.get("duration_s"),
        "pace_s": item.get("pace_s"),
        "pace": item.get("pace"),
        "avg_hr": item.get("avg_hr"),
        "calories": item.get("calories"),
    }


def _summarise(items: list[dict], year: str | None = None, month: str | None = None) -> dict:
    count = len(items)
    distance = round(sum(float(i.get("distance_km") or 0) for i in items), 2)
    duration = int(round(sum(float(i.get("duration_s") or 0) for i in items)))
    calories = int(round(sum(float(i.get("calories") or 0) for i in items)))
    hr_values = [int(i["avg_hr"]) for i in items if i.get("avg_hr")]
    avg_hr = round(sum(hr_values) / len(hr_values)) if hr_values else None
    pace_s = _pace_seconds({"distance_km": distance, "duration_s": duration})
    summary: dict = {
        "count": count,
        "distance_km": distance,
        "duration_s": duration,
        "calories": calories,
        "avg_hr": avg_hr,
        "pace_s": pace_s,
        "pace": _format_pace(pace_s),
    }
    if year is not None:
        summary["year"] = year
    if month is not None:
        summary["month"] = month
    return summary


def compute_stats(activities: list[dict]) -> dict:
    """生成本站 `/run/` 页需要的派生统计数据。"""
    enriched = [add_pace(item) for item in activities]
    enriched.sort(key=lambda x: (x.get("date", ""), str(x.get("id", ""))))

    totals = _summarise(enriched)
    totals["latest_date"] = enriched[-1]["date"] if enriched else None
    if not enriched:
        return {
            "totals": totals,
            "best": {},
            "recent7": _summarise([]),
            "recent30": _summarise([]),
            "streak_current": 0,
            "streak_longest": 0,
            "yearly": [],
            "monthly": [],
            "by_year": [],
        }

    longest = max(enriched, key=lambda x: float(x.get("distance_km") or 0))
    fastest_candidates = [x for x in enriched if x.get("pace_s")]
    fastest = min(fastest_candidates, key=lambda x: x["pace_s"]) if fastest_candidates else {}
    most_calories_candidates = [x for x in enriched if x.get("calories")]
    most_calories = (
        max(most_calories_candidates, key=lambda x: x["calories"])
        if most_calories_candidates
        else {}
    )
    highest_hr_candidates = [x for x in enriched if x.get("avg_hr")]
    highest_hr = (
        max(highest_hr_candidates, key=lambda x: x["avg_hr"])
        if highest_hr_candidates
        else {}
    )

    latest = date.fromisoformat(enriched[-1]["date"])
    start7 = latest - timedelta(days=6)
    start30 = latest - timedelta(days=29)
    recent7 = [
        x for x in enriched if start7 <= date.fromisoformat(x["date"]) <= latest
    ]
    recent30 = [
        x for x in enriched if start30 <= date.fromisoformat(x["date"]) <= latest
    ]

    dates = sorted({date.fromisoformat(x["date"]) for x in enriched})
    streak_current = 0
    cursor = latest
    date_set = set(dates)
    while cursor in date_set:
        streak_current += 1
        cursor -= timedelta(days=1)

    streak_longest = 0
    current_streak = 0
    previous: date | None = None
    for run_date in dates:
        if previous is not None and (run_date - previous).days == 1:
            current_streak += 1
        else:
            current_streak = 1
        streak_longest = max(streak_longest, current_streak)
        previous = run_date

    year_groups: dict[str, list[dict]] = {}
    month_groups: dict[str, list[dict]] = {}
    for item in enriched:
        run_date = item["date"]
        year_groups.setdefault(run_date[:4], []).append(item)
        month_groups.setdefault(run_date[:7], []).append(item)

    yearly = [
        _summarise(year_groups[year], year=year)
        for year in sorted(year_groups, reverse=True)
    ]
    monthly = [
        _summarise(month_groups[month], month=month)
        for month in sorted(month_groups)
    ]

    descending = sorted(
        enriched, key=lambda x: (x.get("date", ""), str(x.get("id", ""))), reverse=True
    )
    by_year = []
    for summary in yearly:
        year = summary["year"]
        by_year.append(
            {
                "year": year,
                "summary": summary,
                "activities": [_record(x) for x in descending if x["date"][:4] == year],
            }
        )

    return {
        "totals": totals,
        "best": {
            "longest": _record(longest),
            "fastest": _record(fastest) if fastest else {},
            "most_calories": _record(most_calories) if most_calories else {},
            "highest_hr": _record(highest_hr) if highest_hr else {},
        },
        "recent7": _summarise(recent7),
        "recent30": _summarise(recent30),
        "streak_current": streak_current,
        "streak_longest": streak_longest,
        "yearly": yearly,
        "monthly": monthly,
        "by_year": by_year,
    }


def main() -> None:
    # 去掉令牌里的空白/换行（复制时可能混入）
    tokens = "".join(os.environ.get("GARMINTOKENS", "").split())
    email = os.environ.get("GARMIN_EMAIL", "").strip()
    password = os.environ.get("GARMIN_PASSWORD", "")
    region_env = os.environ.get("GARMIN_REGION", "").strip().lower()
    # 显式设置 GARMIN_REGION 时以它为准；未设置时从令牌内容自动识别
    is_cn = region_env == "cn"

    # 本机令牌：garmin-token.py 生成后保存在 ~/.garminconnect/garmin_tokens.json，
    # 存在时优先使用；令牌的 iss / 域名会标明是否中国区账号。
    local_tokenstore = Path.home() / ".garminconnect"
    local_token_file = local_tokenstore / "garmin_tokens.json"
    use_local_store = local_token_file.is_file()
    if not region_env and use_local_store:
        try:
            if _token_text_indicates_cn(local_token_file.read_text(encoding="utf-8")):
                is_cn = True
        except OSError:
            pass
    if not region_env and not use_local_store and tokens:
        if _token_text_indicates_cn(tokens):
            is_cn = True

    # 2026-11-22：CI（GARMIN_TOKEN_ONLY=1）只认令牌，缺了就直接失败，不回退密码 ——
    # workflow 里已经不再注入账号密码，回退也只会得到一句更难懂的错误。
    token_only = os.environ.get("GARMIN_TOKEN_ONLY", "").strip() == "1"
    if token_only:
        email, password = "", ""
        if not use_local_store and len(tokens) < 100:
            sys.exit(
                "GARMINTOKENS 缺失或不完整（正常令牌是很长的一串 JSON）。\n"
                "在本机运行 python3 scripts/garmin-token.py，把打印出来的整段 JSON\n"
                "更新到 GitHub 仓库 Settings → Secrets and variables → Actions → GARMINTOKENS。"
            )

    if not use_local_store and not tokens and (not email or not password):
        sys.exit("缺少登录信息：请先运行 python3 scripts/garmin-token.py 生成本机令牌，"
                 "或设置 GARMIN_EMAIL + GARMIN_PASSWORD / GARMINTOKENS。")
    if tokens and len(tokens) < 100 and not token_only:
        print("警告：GARMINTOKENS 看起来不完整（正常令牌是很长的一串），将回退到账号密码登录。")

    allowed_types = {
        t.strip()
        for t in os.environ.get("GARMIN_TYPES", "running").split(",")
        if t.strip()
    }
    try:
        limit = int(os.environ.get("GARMIN_LIMIT", "100"))
    except ValueError:
        limit = 100

    try:
        from garminconnect import Garmin, GarminConnectAuthenticationError
    except ImportError:
        sys.exit("未安装 garminconnect，请先执行：pip install --upgrade garminconnect")

    def mfa_code() -> str:
        code = os.environ.get("GARMIN_MFA_CODE", "").strip()
        if not code:
            raise RuntimeError("账号开启了双重验证，请把当前验证码填入 GARMIN_MFA_CODE 后重试")
        return code

    def cause_chain(exc: BaseException) -> str:
        """把 garminconnect 包在外面的异常一层层拆开，露出真正的原因（429 / 401 / 超时…）。
        2026-11-22：它会把「接口连续 3 次没响应」也报成 AuthenticationError
        （Failed to retrieve social profile），只看最外层分不清是令牌坏了还是 Garmin 在限流。"""
        parts, seen = [], set()
        while exc is not None and id(exc) not in seen:
            seen.add(id(exc))
            parts.append(f"{type(exc).__name__}: {exc}")
            exc = exc.__cause__ or exc.__context__
        return "\n    ← ".join(parts)

    def do_login():
        # 始终带上账号密码作为兜底；有令牌时优先用令牌
        client = Garmin(
            email=email or None,
            password=password or None,
            prompt_mfa=mfa_code,
            is_cn=is_cn,
        )
        if use_local_store:
            # 直接用本机令牌，避免输密码 / 两步验证
            print("使用本机令牌登录（~/.garminconnect）……")
            client.login(str(local_tokenstore))
        elif tokens:
            # 有令牌时直接用令牌登录，避免每次从数据中心 IP 输密码被限流
            print("使用 GARMINTOKENS 令牌登录……")
            client.login(tokens)
        else:
            print("使用账号密码登录……")
            client.login()
        return client

    # 2026-11-22：令牌登录失败时隔 90 秒再试一次。Garmin 的接口偶尔连续拒绝几次
    # （实测：同一个令牌 22:38 成功、23:09 失败），多数是临时限流，不是令牌坏了。
    # 账号密码登录不重试 —— 连续输错密码可能触发账号锁定。
    if tokens and not use_local_store:
        print(token_expiry_note(tokens))
    attempts = 2 if (use_local_store or tokens) else 1
    client = None
    for attempt in range(1, attempts + 1):
        try:
            client = do_login()
            break
        except Exception as exc:
            detail = cause_chain(exc)
            if attempt < attempts:
                print(f"登录失败（第 {attempt} 次），90 秒后重试：\n    {detail}", flush=True)
                time.sleep(90)
                continue
            msg = str(exc)
            if not isinstance(exc, GarminConnectAuthenticationError):
                sys.exit(f"Garmin 登录失败：\n    {detail}")
            if token_only:
                sys.exit(
                    f"令牌登录连续 {attempts} 次失败：\n    {detail}\n"
                    "· 原因里有 429 / Too Many Requests / timeout：Garmin 临时限流，过一会儿再手动 Run workflow 即可，令牌不用动；\n"
                    "· 原因里有 401 / Unauthorized / expired：令牌失效，在本机运行 python3 scripts/garmin-token.py 重新生成，\n"
                    "  把整段 JSON 更新到 GitHub Secret GARMINTOKENS。"
                )
            if "Username and password are required" in msg:
                sys.exit(
                    "登录信息无效：GARMINTOKENS 不是有效的令牌，且 GARMIN_EMAIL/GARMIN_PASSWORD "
                    "为空或不被接受。请检查 GitHub Secrets：令牌必须是 garmin-token.py 打印的完整字符串；"
                    "账号密码必须能用浏览器登录 garmin.cn。"
                )
            sys.exit(f"Garmin 登录失败（请检查账号密码/验证码）：\n    {detail}")

    try:
        activities = client.get_activities(0, limit)
    except Exception as exc:
        sys.exit(f"拉取活动列表失败：{exc}")

    # 2026-11-22：令牌回写。访问令牌过期时库会用 refresh token 换一套新的，而 Garmin 换完
    # 会让旧的 refresh token 作废（令牌轮换）。令牌以 JSON 字符串传入时（CI 的 GARMINTOKENS），
    # 库没有地方保存新令牌 —— 下一次运行拿着已作废的旧令牌，刷新失败，最终报
    # 「Failed to retrieve social profile」（2026-11-22 第 82、83 次运行就是这样）。
    # 所以这里把续期后的令牌写到 GARMIN_TOKEN_OUT，由 workflow 下一步回写到 Secret。
    # 本机令牌（~/.garminconnect）库自己会保存，不需要这一步。⚠️ 绝不 print 令牌内容。
    token_out = os.environ.get("GARMIN_TOKEN_OUT", "").strip()
    if tokens and not use_local_store and token_out:
        try:
            fresh = client.client.dumps()
            if json.loads(fresh) != json.loads(tokens):
                out = Path(token_out)
                out.parent.mkdir(parents=True, exist_ok=True)
                fd = os.open(out, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
                with os.fdopen(fd, "w", encoding="utf-8") as fh:
                    fh.write(fresh)
                print("令牌已续期，交给下一步回写 GitHub Secret GARMINTOKENS")
            else:
                print("令牌没有变化，不需要回写")
        except Exception as exc:
            print(f"警告：读取续期后的令牌失败（不影响这次同步）：{type(exc).__name__}")

    data = load_existing()
    seen_ids = set()
    seen_fingerprints = set()
    merged_rows = []
    for item in data.get("activities", []):
        item_id = str(item.get("id"))
        item_fingerprint = fingerprint(item)
        if item_id in seen_ids or item_fingerprint in seen_fingerprints:
            continue
        if item_id:
            seen_ids.add(item_id)
        seen_fingerprints.add(item_fingerprint)
        merged_rows.append(item)

    added = 0
    for activity in activities or []:
        item = to_item(activity, allowed_types)
        if item is None:
            continue
        item_fingerprint = fingerprint(item)
        if item["id"] in seen_ids or item_fingerprint in seen_fingerprints:
            continue
        seen_ids.add(item["id"])
        seen_fingerprints.add(item_fingerprint)
        merged_rows.append(item)
        added += 1

    merged = sorted(merged_rows, key=lambda x: (x["date"], x["id"]))
    # `updated` = 最近一次**成功**同步的时间（/run/ 上的「数据更新于」）。
    # 每日提交（→ 每日重建）不靠它：workflow 里有一步无论同步成败都会写 `checked`，见 sync-garmin.yml。
    data["updated"] = datetime.now(TZ).isoformat(timespec="seconds")
    data["activities"] = [add_pace(item) for item in merged]
    data["stats"] = compute_stats(data["activities"])

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # 2026-11-22：删掉了给 profile 子站写 sites/profile/data/run_summary.json 的那段 ——
    # 子站 2026-10-12 已下线，每次同步都会把已删除的 sites/ 目录重新建出来。
    print(f"同步完成：新增 {added} 条，共 {len(merged)} 条跑步记录")


if __name__ == "__main__":
    main()
