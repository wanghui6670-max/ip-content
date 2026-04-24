# feishu-sync

`feishu-sync` 承接飞书多维表镜像相关的本地契约、字段映射、CSV 校验和后续同步能力。

## 当前范围

当前版本是 P2.1 skeleton，不直接调用飞书 API，先建立本地镜像契约：

- mirror manifest 归一化
- app token 脱敏
- CSV 解析
- CSV header 校验
- 已知镜像表契约

## Public API

```js
export * from "./src/index.js";
```

当前模块：

- `src/manifest.js`
- `src/csv.js`
- `src/table-contracts.js`
- `src/index.js`

## 本地测试

```bash
cd packages/feishu-sync
npm test
```

## 当前表契约

- `内容任务.csv`
- `发布回执.csv`
- `周复盘.csv`

## 后续方向

下一步会继续补：

- 镜像目录扫描
- 缺失表报告
- CSV 文件级校验
- 与 `apps/web-dashboard/scripts/export_dashboard_data.py` 的边界收敛
- 未来飞书在线同步适配层
