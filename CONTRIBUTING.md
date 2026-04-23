# Contributing

## Branching

建议使用清晰的分支前缀：

- `chore/`：工程护栏、文档、治理
- `feat/`：新功能
- `fix/`：问题修复
- `refactor/`：重构

## Pull Request expectations

发起 PR 前请至少确认：

1. 改动目标清楚
2. 范围可控
3. 不包含敏感信息
4. 构建可通过
5. 文档已同步更新（如适用）

## Data and security rules

- 不提交真实 `base-config.json`
- 不提交真实 token / key / 私密链接
- 不在前端扩大内部数据暴露范围
- 涉及镜像数据时优先检查生成产物

## Recommended validation

```bash
cd apps/web-dashboard
npm install
npm run build:all

# 或仓库根
npm run build:web
```

## Current development order

当前建议开发顺序：

1. P0 工程护栏与仓库收口
2. `web-dashboard` 小步重构
3. `content-domain` 规则迁移
4. `feishu-sync`
5. `ip-cli`
