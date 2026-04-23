# IP Content Web Dashboard

这是新仓库中的网页端应用，目录为 `apps/web-dashboard`。

## 当前实现状态

当前页面入口已经切到：

- `src/boot.js`

`src/main.js` 已经收口为兼容壳，只负责导入 `src/boot.js`。这样可以避免旧本地引用失效，同时确保当前页面只维护一套模块化启动逻辑。

当前拆出的模块包括：

- `src/lib/app-shell.js`
- `src/lib/command-dock.js`
- `src/lib/commands.js`
- `src/lib/feedback.js`
- `src/lib/format.js`
- `src/lib/interactions.js`
- `src/lib/mode.js`
- `src/lib/panels.js`
- `src/lib/render.js`
- `src/lib/schedule.js`
- `src/lib/topic-panel.js`
- `src/lib/topics.js`

## 本地开发

```bash
cd apps/web-dashboard
npm install
npm run dev
```

## 构建静态站点

```bash
cd apps/web-dashboard
npm install
npm run build:all
```

构建产物在：

`apps/web-dashboard/dist`

## 本地测试

```bash
cd apps/web-dashboard
npm test
```

当前 `npm test` 覆盖的是页面入口所依赖的纯逻辑模块，例如：

- build mode / sync helper
- command builder
- command dock helper
- topic filter / current topic helper
- panel renderers
- render helpers
- app shell helper
- interaction bindings

## 数据来源

### 完整源模式（推荐）

当仓库中存在以下文件时，前端会优先从源文件重新导出页面数据：

- `data/content-sources/种子资产卡-20条.md`
- `data/content-sources/选题池-种子.md`
- `data/content-sources/历史高表现内容-候选池.md`
- `data/feishu-mirror/*.csv`
- `data/feishu-mirror/base-config.json`（可选）

### 回退构建模式

如果当前仓库还没有完整的 Markdown 源数据，脚本会自动复用：

- `src/generated/dashboard-data.json`
- `data/feishu-mirror/周复盘.csv`（若存在）

这样可以保证你在新仓库初始化阶段，也能继续构建和部署网页端。

## 当前 UI 改造方向

当前正在推进三件事：

1. 继续保持 `boot.js` 只负责启动装配
2. 在页面上显式展示 build mode / source context，避免 fallback 构建被误读成完整源数据构建
3. 给重构中的纯逻辑模块补自动化测试

## CI 说明

当前仓库 CI 会在 `build-web` job 中：

1. 安装 `apps/web-dashboard` 依赖
2. 运行 `npm test`
3. 运行 `npm run build:web`
4. 验证 `dist/index.html` 存在

## 安全说明

默认情况下，导出脚本不会把飞书主库 URL 暴露到前端页面里，右侧只显示脱敏 Token 和镜像时间。

如果你明确要在**内网环境**里显示飞书主库直达链接，可以在构建前设置：

```bash
EXPOSE_FEISHU_BASE_URL=1 npm run build:all
```

不建议在公网可访问的静态站里暴露该链接。
