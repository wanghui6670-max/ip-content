# ip-content

这是从评审包拆出的 **新仓库启动骨架**。后续 `ip-content` 的正式开发，建议全部在这个新仓库中完成，不再继续复用 `light-meal` 项目。

## 仓库目标

这个仓库承载三类内容：

1. **网页端应用**：`apps/web-dashboard`
2. **数据快照与镜像**：`data/feishu-mirror`
3. **后续待建设模块**：`packages/feishu-sync`、`tools/ip-cli`、`packages/content-domain`

## 当前可直接运行的部分

```bash
cd apps/web-dashboard
npm install
npm run build:all
```

或者在仓库根目录执行：

```bash
npm run build:web
```

> 首次执行根目录脚本前，仍需先进入 `apps/web-dashboard` 执行一次 `npm install`。

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

## GitHub 新仓库建议

建议创建 **私有仓库**，仓库名可直接用：

- `ip-content`
- `ip-content-platform`
- `ip-content-hub`

## 初始化步骤

1. 在 GitHub 上创建一个新的空私有仓库。
2. 把这个启动骨架解压到本地目录。
3. 执行：

```bash
git init
git add .
git commit -m "chore: bootstrap ip-content repository"
git remote add origin <your-new-repo-url>
git push -u origin main
```

## 当前边界

这个启动骨架已经把网页端从评审包迁到新仓库结构里，但还没有补齐下面三块正式能力：

- 飞书在线同步 Worker
- 内容领域模型 / 状态机代码
- `ip` 命令行工具

这些能力的开发路线图见 `docs/开发路线图.md`。
