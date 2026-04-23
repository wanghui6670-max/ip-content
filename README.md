# ip-content

`ip-content` 是当前正在开发中的 **内部内容中台仓库**。

它承载三类核心能力：

1. **网页端应用**：`apps/web-dashboard`
2. **数据快照与镜像**：`data/feishu-mirror`
3. **后续模块**：`packages/content-domain`、`packages/feishu-sync`、`tools/ip-cli`

这个仓库已经从原评审包中独立出来，后续开发都应在这个新仓库中继续完成，不再回到 `light-meal`。

## 当前状态

目前已完成：

- [x] GitHub 新仓库已创建并推送
- [x] Vercel Project 已创建并完成首版部署
- [x] `apps/web-dashboard` 可独立 `npm run build:all`
- [x] 仓库根可执行 `npm run build:web`
- [x] 飞书主库 URL 默认脱敏，不在前端公开暴露

当前仍在推进：

- [ ] 仓库工程护栏（CI、模板、SECURITY、文档收口）
- [ ] `web-dashboard` 结构重构与模式提示
- [ ] `packages/content-domain` 最小可运行骨架
- [ ] `packages/feishu-sync` 与 `tools/ip-cli` 正式实现

## 快速开始

### 本地开发

```bash
cd apps/web-dashboard
npm install
npm run dev
```

### 本地构建

```bash
cd apps/web-dashboard
npm install
npm run build:all
```

或者在仓库根目录执行：

```bash
npm run build:web
```

### Vercel 构建入口

仓库根 `package.json` 已提供：

```bash
npm run vercel-build
```

输出目录由 `vercel.json` 指向：

```text
apps/web-dashboard/dist
```

## 目录结构

```text
ip-content/
├── apps/
│   └── web-dashboard/
├── data/
│   ├── content-sources/
│   └── feishu-mirror/
├── docs/
├── packages/
│   ├── content-domain/
│   └── feishu-sync/
└── tools/
    └── ip-cli/
```

## 开发边界

当前仓库仍处于 **可持续开发的启动阶段**，不是最终完态。

已经稳定的部分：

- 静态网页端构建链路
- Vercel 基础部署链路
- 回退构建模式
- 脱敏后的飞书镜像配置约束

尚未完全落地的部分：

- 飞书在线同步 Worker / Sync 模块
- 领域模型与状态规则抽象
- `ip` CLI 的真实实现
- 自动化 CI / 模板 / 安全治理

## 数据模式说明

当前 `web-dashboard` 支持两种模式：

### 1. 完整源模式（推荐）

当以下内容齐备时：

- `data/content-sources/*.md`
- `data/feishu-mirror/*.csv`
- 可选的 `data/feishu-mirror/base-config.json`

构建会优先从源数据重新导出页面数据。

### 2. 回退构建模式

如果完整源数据尚未补回，则会复用：

- `apps/web-dashboard/src/generated/dashboard-data.json`
- 已存在的镜像 CSV（若存在）

这保证仓库在迁移阶段仍可持续构建和部署。

## 安全与访问策略

这个仓库面向 **内部运营场景**，默认策略应是：

- GitHub 仓库尽量保持私有
- Vercel 生产环境应加访问保护
- 不提交真实飞书 token / base-config
- 不在公网静态站中暴露飞书主库直达 URL

更多约束见：

- `SECURITY.md`
- `docs/开发路线图.md`
- `docs/迁移清单.md`

## 下一阶段

下一阶段的直接目标是：

1. 收口 P0 工程护栏
2. 对 `web-dashboard` 做小步重构
3. 建立 `content-domain` 最小骨架
4. 再进入 `feishu-sync` 与 `ip-cli`
