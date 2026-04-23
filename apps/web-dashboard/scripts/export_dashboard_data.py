#!/usr/bin/env python3
from __future__ import annotations

import csv
import datetime as dt
import json
import os
import re
from pathlib import Path
from typing import Any


SCRIPT_PATH = Path(__file__).resolve()
WEB_ROOT = SCRIPT_PATH.parents[1]
REPO_ROOT = WEB_ROOT.parents[1]
OUTPUT_DIR = WEB_ROOT / "src" / "generated"
OUTPUT_JS = OUTPUT_DIR / "dashboard-data.js"
OUTPUT_JSON = OUTPUT_DIR / "dashboard-data.json"

TITLE_OVERRIDES = {
    "T01": "AI 五层结构：别再碎片化学 AI",
    "T02": "知识库不是收藏夹，是可复用的编译层",
    "T03": "内容自动化不是偷懒，是把素材标准化",
    "T04": "会执行的 AI，才配叫工作流",
    "T05": "顾问能力不是说会，是能落到业务里",
    "T06": "真实经营内容，核心不是晒忙",
    "T07": "轻食不该只有冷沙拉",
    "T08": "瑜伽课先给身体安全感，再谈强度",
    "T09": "一节好课，关键是老师怎么读懂你",
    "T10": "饮食和运动联动，效果才会稳定",
    "T11": "双线并行不失焦，靠的是母题统一",
    "T12": "一个母题，可以拆出多个平台版本",
}

STAGE_NAMES = ["选题", "排期", "生产", "审核", "发布", "数据", "复盘"]
TOPIC_STAGE_MAP = {
    "待挑选": 0,
    "待排期": 1,
    "进行中": 2,
    "已发布": 5,
    "已复盘": 6,
    "淘汰": -1,
}
TASK_STAGE_MAP = {
    "待分配": 1,
    "待生产": 2,
    "待审核": 3,
    "待修改": 3,
    "待发布": 4,
    "已发布": 5,
    "已复盘": 6,
}
TOPIC_STATUS_TYPE = {
    "进行中": "active",
    "待排期": "review",
    "待挑选": "queued",
    "已发布": "done",
    "已复盘": "done",
    "淘汰": "queued",
}


CONTENT_SOURCE_CANDIDATES = [
    {
        "name": "repo_workspace",
        "root": REPO_ROOT,
        "assets": REPO_ROOT / "data" / "content-sources" / "种子资产卡-20条.md",
        "topics": REPO_ROOT / "data" / "content-sources" / "选题池-种子.md",
        "high_perf": REPO_ROOT / "data" / "content-sources" / "历史高表现内容-候选池.md",
        "feishu_base": REPO_ROOT / "data" / "feishu-mirror" / "base-config.json",
        "feishu_manifest": REPO_ROOT / "data" / "feishu-mirror" / "cache" / "mirror-manifest.json",
        "feishu_latest": REPO_ROOT / "data" / "feishu-mirror" / "cache" / "latest",
    },
]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def read_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(read_text(path))
    except json.JSONDecodeError:
        return None


def clean_cell(value: str) -> str:
    return value.strip().strip("`")


def parse_markdown_table(path: Path) -> list[dict[str, str]]:
    lines = read_text(path).splitlines()
    header: list[str] | None = None
    rows: list[dict[str, str]] = []
    for line in lines:
        if not line.startswith("|"):
            continue
        cells = [clean_cell(cell) for cell in line.strip().strip("|").split("|")]
        if header is None:
            header = cells
            continue
        if all(set(cell) <= {"-", ":"} for cell in cells):
            continue
        if len(cells) != len(header):
            continue
        rows.append(dict(zip(header, cells)))
    return rows


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def split_values(value: str) -> list[str]:
    chunks = re.split(r"[|/、]", value or "")
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def extract_ids(value: str, prefix: str) -> list[str]:
    return re.findall(rf"{prefix}\d+", value or "")


def line_label(raw: str) -> str:
    if "AI" in raw:
        return "AI 实战"
    if "品牌号" in raw:
        return "品牌案例"
    return "经营 / 成长"


def status_type(raw: str) -> str:
    return TOPIC_STATUS_TYPE.get(raw, "queued")


def mask_token(token: str) -> str:
    if len(token) <= 8:
        return token
    return f"{token[:4]}***{token[-4:]}"


def should_expose_sync_url() -> bool:
    value = str(os.getenv("EXPOSE_FEISHU_BASE_URL", "")).strip().lower()
    return value in {"1", "true", "yes", "on"}


def sanitized_sync_url(raw_url: str) -> str:
    raw_url = str(raw_url or "").strip()
    if not raw_url:
        return ""
    if should_expose_sync_url():
        return raw_url
    return ""


def build_mode_label(mode: str) -> str:
    if mode == "full_sources":
        return "Full Source"
    return "Fallback Snapshot"


def build_mode_description(mode: str) -> str:
    if mode == "full_sources":
        return "当前页面数据由完整源数据与镜像重新导出生成。"
    return "当前页面数据来自已生成快照与镜像回退构建，适合迁移期持续部署。"


def build_sync_activity(sync_payload: dict[str, Any], build_mode: str) -> dict[str, str] | None:
    mirrored_at = str(sync_payload.get("mirroredAt", "")).replace("T", " ")
    if not sync_payload.get("configured") or not mirrored_at:
        return None

    if build_mode == "full_sources":
        text = "飞书在线主库最近一次镜像已同步，当前页面数据由完整源数据重新导出。"
    else:
        text = "检测到最近一次飞书镜像时间，但当前页面仍处于回退构建模式，请以 Build Mode 提示为准。"

    return {
        "badge": "S",
        "role": "Sync",
        "time": mirrored_at[:16],
        "text": text,
    }


def select_content_context() -> dict[str, Any]:
    for candidate in CONTENT_SOURCE_CANDIDATES:
        has_full_sources = all(
            path.exists()
            for path in [candidate["assets"], candidate["topics"], candidate["high_perf"]]
        )
        if has_full_sources:
            return {**candidate, "mode": "full_sources"}

    for candidate in CONTENT_SOURCE_CANDIDATES:
        if candidate["feishu_base"].exists() or candidate["feishu_manifest"].exists():
            return {**candidate, "mode": "generated_fallback"}

    return {**CONTENT_SOURCE_CANDIDATES[0], "mode": "generated_fallback"}


def preferred_csv(context: dict[str, Any], file_name: str) -> Path:
    latest = Path(context["feishu_latest"]) / file_name
    if latest.exists():
        return latest
    base_dir = Path(context["feishu_base"]).parent
    return base_dir / file_name


def build_steps(topic_status: str, task_rows: list[dict[str, str]]) -> list[dict[str, str]]:
    stage_index = TOPIC_STAGE_MAP.get(topic_status, 0)
    for row in task_rows:
        stage_index = max(stage_index, TASK_STAGE_MAP.get(row.get("当前状态", ""), stage_index))

    if stage_index >= len(STAGE_NAMES) - 1 or topic_status in {"已复盘"}:
        return [
            {"id": f"{index + 1:02d}", "name": name, "state": "done", "sub": "完成"}
            for index, name in enumerate(STAGE_NAMES)
        ]

    if stage_index < 0:
        stage_index = 0

    steps: list[dict[str, str]] = []
    for index, name in enumerate(STAGE_NAMES):
        if index < stage_index:
            state = "done"
            sub = "完成"
        elif index == stage_index:
            state = "active"
            sub = "当前"
        else:
            state = "pending"
            sub = "待执行"
        steps.append({"id": f"{index + 1:02d}", "name": name, "state": state, "sub": sub})
    return steps


def metric_card(label: str, value: str, delta: str) -> dict[str, str]:
    return {"label": label, "value": value, "delta": delta}


def build_topic_angles(topic: dict[str, str], source_assets: list[dict[str, Any]]) -> list[dict[str, str]]:
    audience = topic.get("目标用户", "目标用户待补充")
    goal = topic.get("转化动作", "待补转化动作")
    asset_titles = " / ".join(asset["title"] for asset in source_assets[:2]) or "来源资产待补"
    return [
        {"key": "A", "title": "核心观点", "body": topic.get("核心观点", "")},
        {"key": "B", "title": "用户切口", "body": f"目标用户是「{audience}」，这条内容先解决为什么值得做，再解释怎么开始。"},
        {"key": "C", "title": "转化收口", "body": f"本条内容最后只收一个动作：{goal}。来源资产优先使用：{asset_titles}。"},
    ]


def build_topic_activity(
    topic_id: str,
    source_assets: list[dict[str, Any]],
    task_rows: list[dict[str, str]],
    receipt_rows: list[dict[str, str]],
    sync_payload: dict[str, Any],
    build_mode: str,
) -> list[dict[str, str]]:
    activity: list[dict[str, str]] = []
    sync_activity = build_sync_activity(sync_payload, build_mode)
    if sync_activity:
        activity.append(sync_activity)
    if task_rows:
        current = task_rows[0]
        activity.append(
            {
                "badge": "T",
                "role": "Task",
                "time": current.get("计划发布时间", "待排期"),
                "text": f"{current.get('内容标题', topic_id)} 当前状态：{current.get('当前状态', '待处理')}，负责人：{current.get('负责人', '待分配')}",
            }
        )
    if receipt_rows:
        current = receipt_rows[0]
        activity.append(
            {
                "badge": "R",
                "role": "Receipt",
                "time": current.get("平台", "待发布"),
                "text": f"发布回执已建立，当前 24h / 72h / 7d 数据仍以“{current.get('24h数据', '待回填')}”为主。",
            }
        )
    if source_assets:
        titles = " / ".join(asset["title"] for asset in source_assets[:2])
        activity.append(
            {
                "badge": "A",
                "role": "Assets",
                "time": f"{len(source_assets)} 张资产",
                "text": f"当前母题可直接调用的核心资产：{titles}。",
            }
        )
    return activity[:4]


def title_for_topic(topic_id: str, core_view: str) -> str:
    if topic_id in TITLE_OVERRIDES:
        return TITLE_OVERRIDES[topic_id]
    if "，" in core_view:
        left, right = core_view.split("，", 1)
        return f"{left}：{right}"
    return core_view


def build_sync_payload(context: dict[str, Any]) -> dict[str, Any]:
    base_config = read_json(Path(context["feishu_base"]))
    manifest = read_json(Path(context["feishu_manifest"]))
    source_url = (base_config or {}).get("url") or (manifest or {}).get("url") or ""
    token_value = str((base_config or {}).get("app_token") or (manifest or {}).get("app_token") or "")
    return {
        "ssot": "飞书多维表",
        "baseName": (base_config or {}).get("base_name") or (manifest or {}).get("base_name") or "IP内容中台",
        "configured": bool(base_config or manifest),
        "tokenMasked": mask_token(token_value) if token_value else "",
        "url": sanitized_sync_url(str(source_url)),
        "mirroredAt": (manifest or {}).get("mirrored_at", ""),
        "mirrorSource": (manifest or {}).get("source_dir", ""),
        "status": "online" if (base_config or manifest) else "offline",
    }


def build_dashboard_payload_from_sources(context: dict[str, Any]) -> dict[str, Any]:
    asset_rows = parse_markdown_table(Path(context["assets"]))
    topic_rows = parse_markdown_table(Path(context["topics"]))
    high_perf_rows = parse_markdown_table(Path(context["high_perf"]))
    task_rows = read_csv_rows(preferred_csv(context, "内容任务.csv"))
    receipt_rows = read_csv_rows(preferred_csv(context, "发布回执.csv"))
    review_rows = read_csv_rows(preferred_csv(context, "周复盘.csv"))
    sync_payload = build_sync_payload(context)

    assets_by_id: dict[str, dict[str, Any]] = {}
    assets: list[dict[str, Any]] = []
    for row in asset_rows:
        platforms = split_values(row.get("适配平台", ""))
        item = {
            "id": row.get("编号", ""),
            "title": row.get("标题", ""),
            "line": row.get("内容线", ""),
            "type": row.get("类型", ""),
            "source": row.get("来源", ""),
            "platforms": platforms,
            "platformText": " / ".join(platforms),
            "goal": row.get("内容目标", ""),
            "reuse": row.get("可转化方向", ""),
            "status": row.get("状态", ""),
        }
        assets.append(item)
        assets_by_id[item["id"]] = item

    tasks_by_topic: dict[str, list[dict[str, str]]] = {}
    for row in task_rows:
        topic_id = row.get("所属选题", "")
        if topic_id:
            tasks_by_topic.setdefault(topic_id, []).append(row)

    receipts_by_topic: dict[str, list[dict[str, str]]] = {}
    for row in receipt_rows:
        matched_topic = ""
        for topic_id, rows in tasks_by_topic.items():
            titles = {task.get("内容标题", "") for task in rows}
            if row.get("内容标题", "") in titles:
                matched_topic = topic_id
                break
        if matched_topic:
            receipts_by_topic.setdefault(matched_topic, []).append(row)

    topics: list[dict[str, Any]] = []
    for row in topic_rows:
        topic_id = row.get("编号", "")
        platforms = split_values(row.get("适配平台", ""))
        source_ids = extract_ids(row.get("素材来源链接", ""), "A")
        source_assets = [assets_by_id[source_id] for source_id in source_ids if source_id in assets_by_id]
        topic_task_rows = tasks_by_topic.get(topic_id, [])
        topic_receipt_rows = receipts_by_topic.get(topic_id, [])
        published_count = sum(1 for task in topic_task_rows if task.get("当前状态") in {"已发布", "已复盘"})
        title = title_for_topic(topic_id, row.get("核心观点", ""))
        topics.append(
            {
                "id": topic_id,
                "title": title,
                "subtitle": row.get("目标用户", ""),
                "account": row.get("账号", ""),
                "line": row.get("内容线", ""),
                "lineLabel": line_label(row.get("内容线", "")),
                "platformText": " / ".join(platforms),
                "platforms": platforms,
                "status": row.get("状态", ""),
                "statusType": status_type(row.get("状态", "")),
                "audience": row.get("目标用户", ""),
                "goal": row.get("转化动作", ""),
                "coreView": row.get("核心观点", ""),
                "sourceAssetIds": source_ids,
                "sourceAssets": source_assets,
                "summary": "\n".join(
                    [
                        f"核心观点：{row.get('核心观点', '')}",
                        f"来源资产：{' / '.join(source_ids) if source_ids else '待补'}",
                        f"转化动作：{row.get('转化动作', '待补')}",
                    ]
                ),
                "metrics": [
                    metric_card("Assets", str(len(source_assets)), "来源资产"),
                    metric_card("Tasks", str(len(topic_task_rows)), "内容任务"),
                    metric_card("Published", str(published_count), "已发布"),
                    metric_card("Platforms", str(len(platforms)), "多端改写"),
                ],
                "angles": build_topic_angles(row, source_assets),
                "steps": build_steps(row.get("状态", ""), topic_task_rows),
                "tasks": topic_task_rows,
                "receipts": topic_receipt_rows,
                "activity": build_topic_activity(
                    topic_id,
                    source_assets,
                    topic_task_rows,
                    topic_receipt_rows,
                    sync_payload,
                    context["mode"],
                ),
            }
        )

    active_topics = sum(1 for topic in topics if topic["statusType"] == "active")
    review_topics = sum(1 for topic in topics if topic["statusType"] == "review")
    done_topics = sum(1 for topic in topics if topic["statusType"] == "done")
    total_task_count = len(task_rows)
    total_receipt_count = len(receipt_rows)

    return {
        "meta": {
            "generatedAt": dt.datetime.now().isoformat(timespec="seconds"),
            "projectName": "IP Factory",
            "projectSubtitle": "双线 IP 内容中台网页端",
            "buildMode": context["mode"],
            "buildModeLabel": build_mode_label(context["mode"]),
            "buildModeDescription": build_mode_description(context["mode"]),
            "isFallbackMode": context["mode"] != "full_sources",
            "sourceContext": context["name"],
            "sync": sync_payload,
            "counts": {
                "assets": len(assets),
                "topics": len(topics),
                "highPerf": len(high_perf_rows),
                "tasks": total_task_count,
                "receipts": total_receipt_count,
                "activeTopics": active_topics,
                "reviewTopics": review_topics,
                "doneTopics": done_topics,
            },
            "defaultPairing": {"aiTopic": "T01", "brandTopic": "T07"},
            "deploy": {
                "build": "npm run build:all",
                "preview": "npm run preview",
                "static": "上传 apps/web-dashboard/dist 到任意静态托管",
                "vercel": "vercel --prod",
            },
        },
        "topics": topics,
        "assets": assets,
        "highPerf": high_perf_rows,
        "reviews": review_rows,
    }


def build_dashboard_payload_from_generated_fallback(context: dict[str, Any]) -> dict[str, Any]:
    payload = read_json(OUTPUT_JSON)
    if not payload:
        raise FileNotFoundError(
            "未找到可复用的 src/generated/dashboard-data.json，且当前目录也不包含完整的 01-资产库/03-选题中心 源数据。"
        )

    sync_payload = build_sync_payload(context)
    meta = dict(payload.get("meta") or {})
    meta["generatedAt"] = dt.datetime.now().isoformat(timespec="seconds")
    meta["buildMode"] = context["mode"]
    meta["buildModeLabel"] = build_mode_label(context["mode"])
    meta["buildModeDescription"] = build_mode_description(context["mode"])
    meta["isFallbackMode"] = context["mode"] != "full_sources"
    meta["sourceContext"] = context["name"]
    meta["sync"] = sync_payload

    reviews = payload.get("reviews") or []
    review_rows = read_csv_rows(preferred_csv(context, "周复盘.csv"))
    if review_rows:
        reviews = review_rows

    topics = payload.get("topics") or []
    sync_activity = build_sync_activity(sync_payload, context["mode"])
    for topic in topics:
        activity = [item for item in (topic.get("activity") or []) if item.get("role") != "Sync"]
        if sync_activity:
            activity = [sync_activity, *activity]
        topic["activity"] = activity[:4]

    payload["meta"] = meta
    payload["reviews"] = reviews
    payload["topics"] = topics
    return payload


def build_dashboard_payload() -> dict[str, Any]:
    context = select_content_context()
    if context["mode"] == "full_sources":
        return build_dashboard_payload_from_sources(context)
    return build_dashboard_payload_from_generated_fallback(context)


def write_outputs(payload: dict[str, Any]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    OUTPUT_JS.write_text(
        "export const dashboardData = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )


def main() -> int:
    payload = build_dashboard_payload()
    write_outputs(payload)
    print(f"dashboard data exported -> {OUTPUT_JS}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
