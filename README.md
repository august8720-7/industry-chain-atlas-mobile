# 产业链图谱 · 移动端 —— 飞研产业研究平台

当前唯一主线是 `prototype/`：零依赖、可直接在浏览器运行的移动端产业链工作台。V1.9 外形是本轮冻结基线；旧 `src/` uni-app 工程已下线，`preview/` 为归档参考，不再修改。

## 数据口径

- 当前正式数据底稿：`6条产业链底稿最新版_修复存储芯片方向.xlsx`；六链产物位于 `prototype/data/`。
- 六链顺序固定为机器人、航空航天、黄金、白银、算力、存储芯片，启动加载目录和机器人，切链按需加载并缓存。
- Web 参考项目仅用于只读同步 241 条产品目录及交互对照；运行时不跨项目读取文件。
- 严格包含关系只来自相邻步骤中的“包含”。
- 路径边只来自同一 `rawPath` 的相邻非“包含”步骤；同阶段、同 lane 或行业常识不得生成边。
- `Stage` 表示直接供给/中间供给/核心环节等距离层级，`Placement.lane` 表示原材料、生产设备、技术服务等层内分类；两者在总览同时展示。
- 1,718 个唯一指标已完成在线核验：批量精确 ID 取回 1,715 条，批量缺失的 3 条经单指标 iFinD MCP 精确复核；应用结果为 `updated=1226`、`unchanged=492`、其余状态为 0。
- `indicator-fetch-audit.json` 固化在线查询证据，`indicator-update-audit.json` 固化合并应用结果；二者 SHA-256 与 `build-manifest.json` 强制对账，失败和未查询任一不为 0 都禁止正式覆盖。
- 优先级：数据语义正确 > 交互可用 > 大数据性能 > 视觉美观。

## 核心交互

节点点击进入 V1.9 的详情页：一屏围绕当前节点明确展示有证据的直接上游、直接下游和独立包含入口；相邻节点可点击换心，关系超过 4 个时在页面原位展开。没有节点级证据的方向明确显示空状态，不使用同阶段、同 lane 或行业常识补画。

`工业机器人`是当前严格语义样例：自身路径前序/后序均为 0，直接包含 12 个一级子节点；12 个子节点另有 17 条可追溯路径后序，这些记录独立展示，不冒充工业机器人的直接下游。

## 启动与验证

```powershell
python prototype/scripts/build-six-chain-data.py build --help
node prototype/verify.mjs
node server.mjs
```

打开：http://localhost:5185/prototype/index.html（端口占用时以 `server.mjs` 实际输出为准）

## 主要目录

```text
prototype/core/        数据适配、类型与运行时索引
prototype/components/  通用交互组件
prototype/pages/       首页、图谱、公司、指标、搜索
prototype/data/        由真实源生成的移动端快照与懒加载序列
prototype/tests/       数据语义与 UI 契约单元测试
docs/09-*              本轮真实数据重构的权威规则
```
