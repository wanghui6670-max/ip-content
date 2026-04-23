# content-domain

这里放内容中台的领域模型、状态机与业务规则。

## 当前已提供的最小骨架

- `src/stages.js`
  - 阶段常量
  - topic / task 状态到阶段的映射
  - `buildStageSteps()`
- `src/entities.js`
  - Topic / Task / Receipt / Review 的轻量归一化函数
- `src/topic-rules.js`
  - 选题 summary 构造
  - topic view model 的最小规则拼装
  - 默认 pairing 解析
- `src/index.js`
  - 公共导出入口

## 目标

这个包后续要承接两类逻辑：

1. 从导出脚本中逐步迁出的业务规则
2. 被 `web-dashboard`、`feishu-sync`、`ip-cli` 共同复用的领域层能力

## 当前边界

目前它还是一个 **最小可运行骨架**，优先解决的是：

- 让状态映射和 summary 拼装不再散落在多个脚本里
- 给后续 exporter 重构提供明确落点
- 给 CLI / sync / dashboard 之间建立共享规则层

后续会继续补：

- 更完整的实体定义
- 字段校验
- 更明确的状态迁移规则
- 测试与 schema 对齐
