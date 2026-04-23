# Security Policy

## Scope

`ip-content` 是一个面向内部内容运营场景的仓库。

即使当前仓库里没有提交真实 token，仓库仍然可能包含：

- 内部内容规划信息
- 选题与任务安排
- 镜像数据结构
- 发布节奏与运营上下文

因此默认安全策略应是：

- GitHub 仓库尽量保持私有
- Vercel 生产部署应启用访问保护
- 不在公网环境暴露飞书主库 URL
- 不提交真实 `base-config.json`、token、密钥或私密链接

## Secrets and sensitive data

禁止提交：

- `data/feishu-mirror/base-config.json`
- `.env` / `.env.*`
- 私钥、证书、token、临时凭证
- 真实飞书 Base URL（除非明确用于内网受控环境）

允许提交：

- `base-config.example.json`
- 脱敏后的 token
- 不含敏感信息的 schema、示例数据、说明文档

## Reporting a vulnerability

如果你发现以下问题，请优先以私下方式处理，而不要先公开开 issue：

- 凭证泄漏
- Vercel 未授权访问
- 真实飞书链接暴露
- 生成产物包含不应公开的内部数据

建议处理方式：

1. 立即撤销相关 token / 权限
2. 暂停相关公开部署或限制访问
3. 修复仓库内容与构建逻辑
4. 再补充 issue / 复盘说明

## Current operational requirements

在合并任何涉及数据、部署、导出脚本的 PR 前，至少确认：

- 构建仍然通过
- 未引入新的敏感信息提交
- 未扩大前端暴露范围
- 文档与实际行为一致
