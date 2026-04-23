# 飞书镜像数据说明

这个目录用于保存 **可进入 Git 仓库的镜像数据**，默认不放真实的 `base-config.json`。

当前已包含：

- `素材采集.csv`
- `选题池.csv`
- `内容任务.csv`
- `发布回执.csv`
- `周复盘.csv`
- `ip-content-hub-base-schema.json`
- `base-config.example.json`

## 约定

- 真实 `base-config.json` 不提交到仓库。
- 如需本地联通飞书主库，请复制 `base-config.example.json` 为 `base-config.json`，再填写真实值。
- 前端默认不会把飞书 Base 直达 URL 暴露到页面里；只有设置 `EXPOSE_FEISHU_BASE_URL=1` 时才会显示。
