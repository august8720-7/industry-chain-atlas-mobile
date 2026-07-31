#!/usr/bin/env node
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const dataRoot = path.join(root, 'data')
const workbook = path.resolve(root, '..', '..', '6条产业链底稿最新版_修复存储芯片方向.xlsx')
const expectedOrder = ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip']
const catalog = JSON.parse(fs.readFileSync(path.join(dataRoot, 'catalog.json'), 'utf8'))
const directory = JSON.parse(fs.readFileSync(path.join(dataRoot, 'directory.json'), 'utf8'))
const searchIndex = JSON.parse(fs.readFileSync(path.join(dataRoot, 'search-index.json'), 'utf8'))
const updateAudit = JSON.parse(fs.readFileSync(path.join(dataRoot, 'indicator-update-audit.json'), 'utf8'))
const fetchAuditPath = path.join(dataRoot, 'indicator-fetch-audit.json')
const fetchAudit = JSON.parse(fs.readFileSync(fetchAuditPath, 'utf8'))
const singleCheckAudit = JSON.parse(fs.readFileSync(path.join(dataRoot, 'indicator-single-check-audit.json'), 'utf8'))
const pathAudit = JSON.parse(fs.readFileSync(path.join(dataRoot, 'path-edge-audit.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(dataRoot, 'build-manifest.json'), 'utf8'))
const sourceIds = fs.readFileSync(path.join(dataRoot, 'source-indicator-ids.txt'), 'utf8').trim().split(/\r?\n/)
const expectedSingleCheckIds = ['S004221944', 'S006552107', 'S019833314']
const context = vm.createContext({ window: {}, fetch: async () => { throw new Error('unexpected fetch') } })
vm.runInContext(fs.readFileSync(path.join(root, 'core', 'data-store.js'), 'utf8'), context)
const { WorkbenchStore } = context.window
const runtimeContext = vm.createContext({
  window: { MOCK: {}, dispatchEvent() {} },
  CustomEvent: class CustomEvent {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail }
  },
  fetch: async relativePath => {
    const file = path.resolve(root, String(relativePath))
    if (!file.startsWith(dataRoot + path.sep) || !fs.existsSync(file)) return { ok: false, status: 404, statusText: 'Not Found', json: async () => null }
    return { ok: true, status: 200, statusText: 'OK', json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) }
  }
})
vm.runInContext(fs.readFileSync(path.join(root, 'six-chain-runtime.js'), 'utf8'), runtimeContext)
const runtimeMock = runtimeContext.window.MOCK
await runtimeMock.initialize()

let passed = 0
const check = (message, condition) => {
  assert.ok(condition, message)
  passed += 1
  console.log(`✓ ${message}`)
}

check('权威 Excel 底稿存在', fs.existsSync(workbook))
const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(workbook)).digest('hex')
check('catalog 与 Excel SHA-256 对账', catalog.source.sha256 === sourceHash)
check('manifest 与 Excel SHA-256 对账', manifest.source.sha256 === sourceHash)
check('六链顺序固定', JSON.stringify(catalog.chains.map(item => item.key)) === JSON.stringify(expectedOrder))
check('241 条目录精确对账 6 开放 / 235 锁定', directory.schemaVersion === 'feiyan-mobile-directory-v1' && directory.items.length === 241 && directory.counts.total === 241 && directory.counts.open === 6 && directory.counts.locked === 235)
check('目录开放链顺序与六链一致', JSON.stringify(directory.items.filter(item => item.live).map(item => item.chainKey)) === JSON.stringify(expectedOrder))
check('六链跨链搜索索引计数闭合', searchIndex.schemaVersion === 'feiyan-mobile-search-v1' && searchIndex.counts.nodes === 1663 && searchIndex.counts.companies === 4091 && searchIndex.counts.indicators === 2065 && searchIndex.items.length === searchIndex.counts.total)
check('1,718 个指标 ID 唯一且格式有效', sourceIds.length === 1718 && new Set(sourceIds).size === 1718 && sourceIds.every(id => /^[SM]\d{9}$/.test(id)))
check('指标五状态审计达到正式覆盖硬门槛', updateAudit.schemaVersion === 'feiyan-indicator-update-audit-v2' && updateAudit.summary.expected === 1718 && updateAudit.summary.checked === 1718 && updateAudit.summary.updated + updateAudit.summary.unchanged + updateAudit.summary.no_new_value === 1718 && updateAudit.summary.failed === 0 && updateAudit.summary.unattempted === 0)
check('1,718 条逐项审计均为已完成状态', updateAudit.items.length === 1718 && updateAudit.items.every(item => ['updated', 'unchanged', 'no_new_value'].includes(item.status)))
check('逐项应用审计均带在线核验方式与时间', updateAudit.items.every(item => ['batch_cli_exact_id', 'single_mcp_exact_name_and_id'].includes(item.verificationMethod) && typeof item.checkedAt === 'string' && item.checkedAt.length > 0))
check('manifest 指标审计与逐项状态一致', manifest.indicatorFetch.statusCounts.updated === updateAudit.summary.updated && manifest.indicatorFetch.statusCounts.unchanged === updateAudit.summary.unchanged && manifest.indicatorFetch.statusCounts.no_new_value === updateAudit.summary.no_new_value && manifest.indicatorFetch.failedIds === 0 && manifest.indicatorFetch.unattemptedIds === 0)
const fetchAuditSha256 = crypto.createHash('sha256').update(fs.readFileSync(fetchAuditPath)).digest('hex')
const fetchIds = fetchAudit.items.map(item => item.sourceId)
const batchItems = fetchAudit.items.filter(item => item.verificationMethod === 'batch_cli_exact_id')
const singleItems = fetchAudit.items.filter(item => item.verificationMethod === 'single_mcp_exact_name_and_id')
check('在线查询证据覆盖 1,718 个唯一精确 ID', fetchAudit.schemaVersion === 'feiyan-ifind-fetch-audit-v2' && fetchAudit.items.length === 1718 && new Set(fetchIds).size === 1718 && JSON.stringify([...fetchIds].sort()) === JSON.stringify([...sourceIds].sort()) && fetchAudit.items.every(item => item.status === 'fetched' && item.pointCount > 0 && item.latestPeriod))
check('在线查询证据为批量 1,715 条加单项精确复核 3 条', fetchAudit.summary.expected === 1718 && fetchAudit.summary.batchFetched === 1715 && fetchAudit.summary.singleChecked === 3 && fetchAudit.summary.fetched === 1718 && fetchAudit.summary.failed === 0 && fetchAudit.summary.unattempted === 0 && batchItems.length === 1715 && singleItems.length === 3 && JSON.stringify(singleItems.map(item => item.sourceId).sort()) === JSON.stringify(expectedSingleCheckIds))
check('三条单指标 MCP 复核请求 ID 与返回 ID 精确一致', singleCheckAudit.schemaVersion === 'feiyan-ifind-single-check-audit-v1' && singleCheckAudit.items.length === 3 && JSON.stringify(singleCheckAudit.items.map(item => item.sourceId).sort()) === JSON.stringify(expectedSingleCheckIds) && singleCheckAudit.items.every(item => item.sourceId === item.returnedIndexId && item.status === 'fetched' && item.pointCount > 0 && item.latestPeriod))
check('查询证据 SHA-256 在 manifest 与应用审计中一致', manifest.indicatorFetch.fetchAuditFile === 'indicator-fetch-audit.json' && manifest.indicatorFetch.fetchAuditSha256 === fetchAuditSha256 && updateAudit.fetchAuditFile === 'indicator-fetch-audit.json' && updateAudit.fetchAuditSha256 === fetchAuditSha256)
check('manifest 查询汇总与原始证据摘要一致', JSON.stringify(manifest.indicatorFetch.queryEvidence) === JSON.stringify(fetchAudit.summary) && manifest.indicatorFetch.rawEvidence.completeCsv.sha256 === fetchAudit.evidence.completeCsv.sha256 && manifest.indicatorFetch.rawEvidence.completeCsv.sha256 === '915a954ee044a6cc6e5a3565b1c4156807b00c698f4b0d8d7ad4dbab939a2773')
const rawFetchCsv = manifest.indicatorFetch.fetchCsv
if (rawFetchCsv && fs.existsSync(rawFetchCsv)) {
  const rawFetchCsvSha256 = crypto.createHash('sha256').update(fs.readFileSync(rawFetchCsv)).digest('hex')
  check('本机完整 iFinD CSV 原始证据 SHA-256 对账', rawFetchCsvSha256 === fetchAudit.evidence.completeCsv.sha256)
}
const goldPathAudit = pathAudit.chains.find(item => item.key === 'gold')
const silverPathAudit = pathAudit.chains.find(item => item.key === 'silver')
check('黄金和白银 0 边由 Excel 原始路径审计确认', goldPathAudit.adjacentNonContainSteps === 0 && goldPathAudit.generatedPathEdges === 0 && silverPathAudit.adjacentNonContainSteps === 0 && silverPathAudit.generatedPathEdges === 0)

let nodes = 0
let companyAssociations = 0
let indicatorAssociations = 0
let seriesReferences = 0
const referencedSeries = new Set()

for (const entry of catalog.chains) {
  const file = path.join(dataRoot, `${entry.key}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const store = new WorkbenchStore(data)
  check(`${entry.key} 可由 WorkbenchStore 直接加载`, store.meta.key === entry.key)
  await runtimeMock.selectChain(entry.key)
  const runtimeAdapter = runtimeMock.__runtime.active
  check(`${entry.key} 所有小分类按重要度、分数、承接能力、源顺序排列`, runtimeMock.bands.every(band => band.lanes.every(lane => lane.nodes.every((node, index) => index === 0 || runtimeAdapter.compareNodeIds(lane.nodes[index - 1].id, node.id) <= 0))))
  check(`${entry.key} 来源哈希一致`, data.meta.source.sha256 === sourceHash)
  check(`${entry.key} 计数与 catalog 一致`, JSON.stringify(data.meta.counts) === JSON.stringify(entry.counts))
  check(`${entry.key} 首屏 JSON 小于 1.5MB`, fs.statSync(file).size < 1_500_000)
  nodes += data.nodes.length
  companyAssociations += data.nodes.reduce((sum, node) => sum + node.companyRefs.length, 0)
  indicatorAssociations += data.nodes.reduce((sum, node) => sum + node.indicatorRefs.length, 0)

  check(`${entry.key} 全部指标已写入合法刷新状态`, data.indicators.every(indicator => ['updated', 'unchanged', 'no_new_value'].includes(indicator.refreshStatus)))
  for (const indicator of data.indicators) {
    if (!indicator.seriesPath) continue
    const seriesFile = path.join(dataRoot, 'indicator-series', path.basename(indicator.seriesPath))
    const points = JSON.parse(fs.readFileSync(seriesFile, 'utf8'))
    check(`${entry.key}/${indicator.sourceId} 时序格式有效`, Array.isArray(points) && points.length > 0 && points.every(point => typeof point.period === 'string' && Number.isFinite(Number(point.value))))
    const last = points.at(-1)
    check(`${entry.key}/${indicator.sourceId} 最新值与时序末点一致`, indicator.period === last.period && Number(indicator.latest) === Number(last.value))
    referencedSeries.add(path.basename(seriesFile))
    seriesReferences += 1
  }
}

check('六链节点总数为 1,663', nodes === 1663)
check('节点-公司去重关联为 4,091 条', companyAssociations === 4091)
check('节点-指标关联完整保留 2,065 条', indicatorAssociations === 2065)
check('历史时序文件引用与 manifest 一致', referencedSeries.size === manifest.seriesFiles)
check('时序文件目录无未引用残留', fs.readdirSync(path.join(dataRoot, 'indicator-series')).filter(name => name.endsWith('.json')).length === referencedSeries.size)
const activeSource = [
  fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  fs.readFileSync(path.join(root, 'six-chain-runtime.js'), 'utf8'),
  ...fs.readdirSync(path.join(root, 'pages')).filter(name => name.endsWith('.js')).map(name => fs.readFileSync(path.join(root, 'pages', name), 'utf8'))
].join('\n')
check('活动页面和六链适配层旧层级称呼为 0', !/上游\s*2\s*级|下游\s*2\s*级/.test(activeSource))
check('V1.9 外壳加载六链桥接层且未启用另一套 app.js', activeSource.includes('six-chain-runtime.js') && !fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('<script src="app.js">'))

console.log(JSON.stringify({
  status: 'pass',
  checks: passed,
  chains: catalog.chains.length,
  nodes,
  companyAssociations,
  indicatorAssociations,
  uniqueIndicatorIds: sourceIds.length,
  seriesFiles: referencedSeries.size,
  seriesReferences,
  indicatorStatuses: updateAudit.summary,
  indicatorQueryEvidence: fetchAudit.summary,
  indicatorFetchAuditSha256: fetchAuditSha256,
  directory: directory.counts
}, null, 2))
