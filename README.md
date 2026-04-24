# ip-content

`ip-content` 是当前正在开发中的 **IP 打造内容中台仓库**。

它不是普通内容看板，也不是单纯的飞书同步工具。仓库的核心目标是把 IP 打造过程中从输入资产、知识库、选题、内容执行到复盘增长的链路沉淀成一个可持续维护的内部操作系统。

它承载三类核心能力：

1. **网页端应用**：`apps/web-dashboard`
2. **数据快照与镜像**：`data/feishu-mirror`
3. **后续模块**：`packages/content-domain`、`packages/feishu-sync`、`tools/ip-cli`

这个仓库已经从原评审包中独立出来，后续开发都应在这个新仓库中继续完成，不再回到 `light-meal`。

项目级产品定义见：

- `docs/product-definition.md`

## 当前状态

目前已完成：

- [x] GitHub 新仓库已创建并推送
- [x] Vercel Project 已创建并完成首版部署
- [x] `apps/web-dashboard` 可独立 `npm run build:all`
- [x] 仓库根可执行 `npm run build:web`
- [x] 飞书主库 URL 默认脱敏，不在前端公开暴露
- [x] `packages/content-domain` 已具备最小骨架与自动化测试
- [x] `web-dashboard` 已具备纯逻辑测试入口
- [x] `apps/web-dashboard/src/main.js` 已收口为兼容壳

当前仍在推进：

- [ ] IP 输入链路建模：博主数据采集 -> 输入资产 -> 知识库 -> 选题池
- [ ] `packages/feishu-sync` 正式实现与镜像校验
- [ ] `tools/ip-cli` 正式实现
- [ ] 部署访问与发布治理收口

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

### 本地测试

```bash
# 领域层测试
cd packages/content-domain
npm test

# dashboard 纯逻辑测试
cd apps/web-dashboard
npm test
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

## 当前 CI 覆盖范围

当前 CI 会跑两类检查：

1. `packages/content-domain` 测试
2. `apps/web-dashboard` 测试 + 构建

也就是说，仓库现在不再只是“能 build”，而是已经开始具备基础回归保护。

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
- 基础自动化测试与 CI
- dashboard 模块化入口

尚未完全落地的部分：

- IP 档案、输入资产、知识库、选题来源关系
- 飞书在线同步 Worker / Sync 模块
- 领域模型与状态规则进一步抽象
- `ip` CLI 的真实实现

## IP 打造主线

后续开发应优先围绕这条闭环推进：

```text
IP 定位
  -> 博主数据采集
  -> 输入资产
  -> 知识库
  -> 洞察 / 方法论
  -> 选题池
  -> 内容任务
  -> 发布回执
  -> 周复盘
  -> 反哺知识库和 IP 定位
```

其中知识库是关键中间层：它负责把外部信号和现场经验沉淀成自己的观点、方法论、案例、问题和证据，再支撑后续选题生成。

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
- `docs/product-definition.md`
- `docs/开发路线图.md`
- `docs/迁移清单.md`

## 下一阶段

后续任务入口见：

- `docs/backlog.md`

下一阶段会优先推进：

1. 输入链路表模型：博主数据采集、输入资产、知识库、选题池
2. P2 `feishu-sync` mirror validation
3. P3 `content-domain` 领域实体扩展与 `ip-cli`
4. P4 访问与发布治理
