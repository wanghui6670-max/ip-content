# IP Content Web Dashboard

这是新仓库中的网页端应用，目录为 `apps/web-dashboard`。

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

## 安全说明

默认情况下，导出脚本不会把飞书主库 URL 暴露到前端页面里，右侧只显示脱敏 Token 和镜像时间。

如果你明确要在**内网环境**里显示飞书主库直达链接，可以在构建前设置：

```bash
EXPOSE_FEISHU_BASE_URL=1 npm run build:all
```

不建议在公网可访问的静态站里暴露该链接。
