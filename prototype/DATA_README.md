# 六链 JSON 数据包

本目录的数据包由 `6条产业链底稿最新版_修复存储芯片方向.xlsx` 生成，可被现有 `WorkbenchStore` 直接读取。Excel 是图谱、公司和指标成员关系的唯一权威；PC 六链 JSON 只作为仍有效指标 ID 的历史时序来源。

## 文件入口

- `data/catalog.json`：六链目录、固定顺序、文件位置和计数。
- `data/{chainKey}.json`：单链完整图谱、公司、指标与双向引用。
- `data/indicator-series/{indicatorId}.json`：指标完整时序，按需加载。
- `data/build-manifest.json`：Excel 哈希、iFinD 取数覆盖、各链审计计数。
- `data/source-indicator-ids.txt`：1,718 个唯一 iFinD 指标 ID。
- `data/indicator-fetch-audit.json`：1,718 个精确 ID 的在线查询证据与原始文件哈希。
- `data/indicator-update-audit.json`：查询结果合并到正式数据后的逐项应用状态。
- `data/indicator-single-check-audit.json`：初次批量缺失 3 个 ID 的 iFinD MCP 单项复核证据。

页面读取方式：先请求 `data/catalog.json`，再按 `chains[].file` 请求目标链。单链文件的 `schemaVersion` 为 `feiyan-mobile-workbench-v1`，可直接传给 `new WorkbenchStore(data)`。

## 完整重建

```powershell
python prototype/scripts/build-six-chain-data.py ids `
  --workbook "C:\Users\august\Desktop\6条产业链底稿最新版_修复存储芯片方向.xlsx" `
  --out prototype/data/source-indicator-ids.txt

python prototype/scripts/build-six-chain-data.py build `
  --workbook "C:\Users\august\Desktop\6条产业链底稿最新版_修复存储芯片方向.xlsx" `
  --baseline-dir "C:\Users\august\Desktop\industry-chain-atlas-deploy\public\data\chains" `
  --fetch-csv "<iFinD batch-fetch CSV>" `
  --output-dir prototype/data

python prototype/scripts/normalize-six-chain-markets.py `
  --data-dir prototype/data

node --test prototype/tests/six-chain-package.test.mjs
node prototype/verify-six-chain-data.mjs
```

没有取得 iFinD CSV 时必须省略 `--fetch-csv`。市场规范化步骤保留 Excel 原始 `市场与代码` 为 `marketCodeRaw`，并输出页面可用的一个 canonical `market` / `code`；无法从原字段确认上市主体的记录标记为 `marketCodeStatus=needs_review`。

## 当前数据状态

- Excel SHA-256：`a2a05c22acd17bcf6064da7dd59a561da1de72241ba827476e8c5223216852db`
- 6 条链、1,663 个实际节点、4,091 条去重节点-公司关联、2,065 条节点-指标关联。
- 1,718 个唯一指标 ID；1,585 个 ID 有可复用历史时序，152 个链内指标实体目前只有底稿最新值/最新期、没有完整序列文件。
- 2026-07-22 已完成 1,718 个唯一指标 ID 的在线检查：初次批量取回 1,715 条；`S004221944`、`S006552107`、`S019833314` 三条批量缺失项均经单指标 iFinD MCP 返回同一精确 ID 并复核通过。
- 完整取数 CSV 共 77,215 行有效数据，SHA-256 为 `915a954ee044a6cc6e5a3565b1c4156807b00c698f4b0d8d7ad4dbab939a2773`。查询审计为 `fetched=1718`、`failed=0`、`unattempted=0`；应用审计为 `updated=1226`、`unchanged=492`、`no_new_value=0`、`failed=0`、`unattempted=0`。
- `indicator-fetch-audit.json` 证明“是否成功查询”，`indicator-update-audit.json` 证明“查询结果是否改变正式数据”；不能用后者的状态计数替代前者的原始查询证据。
- 6 条公司主体记录仍需业务侧复核原始身份口径：中国航发控制、中矿资源、中兴通讯、秦淮数据、上海黄金交易所、通义千问；页面字段已安全归一为 `其他` 且保留 `marketCodeRaw`，没有猜填证券代码。
