#!/usr/bin/env node
// 机器人源 JSON 接入与原型口径断言(零依赖)。运行:node prototype/verify.mjs
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const read = f => fs.readFileSync(path.join(root, f), 'utf8')
let pass = 0, fail = 0
const t = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (extra ? ' —— ' + extra : '')) }
}

const win = {}
new Function('window', read('robot-source.js'))(win)
new Function('window', read('robot-adapter.js'))(win)
new Function('window', read('mock-data.js'))(win)
const M = win.MOCK
const source = win.ROBOT_SOURCE_DATA
const names = new Map(source.nodes.map(n => [n.name, n]))
const allCompanies = source.nodes.flatMap(n => n.companies)
const allIndicators = source.nodes.flatMap(n => n.indicators)
const stageOrder = ['upstream_2', 'upstream_1', 'midstream', 'downstream_1', 'downstream_2']

console.log('A. 源文件与数量口径')
t('A1 机器人源数据脚本已加载', source?.chain === '机器人')
t('A2 源节点 420/420', source.nodeCount === 420 && source.nodes.length === 420)
t('A3 页面全节点数 420', M.allNodeCount === 420)
t('A4 公司关联 1085 / 唯一公司 103', source.counts.companyRows === 1085 && source.counts.uniqueCompanies === 103)
t('A5 指标关联 377 / 唯一指标 339', source.counts.indicatorRows === 377 && source.counts.uniqueIndicators === 339)
t('A6 页面统计与源统计一致', M.sourceCounts.companyRows === 1085 && M.sourceCounts.uniqueCompanies === 103 && M.sourceCounts.indicatorRows === 377 && M.sourceCounts.uniqueIndicators === 339)
t('A7 SHA256 存在且格式正确', /^[a-f0-9]{64}$/.test(M.sourceInfo.sha256))
t('A8 首页机器人统计使用唯一实体口径', M.chains.find(c => c.key === 'robot')?.nodeCount === 420 && M.chains.find(c => c.key === 'robot')?.companyCount === 103 && M.chains.find(c => c.key === 'robot')?.indicatorCount === 339)
t('A9 源数据包保留全部节点公司指标', allCompanies.length === 1085 && allIndicators.length === 377)
t('A10 图表客户端策略为最近24期且记录完整点数', allIndicators.every(ind => ind.series.length <= 24 && ind.seriesPointCount >= ind.series.length && ind.seriesStart && ind.seriesEnd))

console.log('B. 五阶段与层级完整性')
t('B1 五阶段顺序正确', M.bands.map(b => b.key).join(',') === stageOrder.join(','))
t('B2 五阶段标题正确', M.bands.map(b => b.title).join(',') === '中间供给,直接供给,核心环节,直接应用,应用承接')
t('B3 总览仅放非包含节点', M.bands.flatMap(b => b.nodes).length === source.nodes.filter(n => n.lane !== '包含').length)
t('B4 总览所有节点均可解析详情', M.bands.every(b => b.nodes.every(n => M.nodeDetail(n.id).id === n.id)))
t('B5 全部420个源节点均可精确定位', source.nodes.every(n => M.findNodes(n.name, 20).some(hit => hit.id === n.id)))
t('B6 父节点缺失为0', source.nodes.every(n => !n.parent || names.has(n.parent)))
t('B7 节点ID和名称均不重复', new Set(source.nodes.map(n => n.id)).size === 420 && names.size === 420)
t('B8 最大深度为5', Math.max(...source.nodes.map(n => n.depth)) === 5)

console.log('C. 关系方向与包含关系')
t('C1 包含关系271', M.relationCounts.contains === 271 && source.nodes.filter(n => n.lane === '包含').length === 271)
t('C2 非包含方向边86', M.relationCounts.edges === source.nodes.filter(n => n.parent && n.lane !== '包含').length)
const planetHit = M.findNodes('行星齿轮', 10).find(n => n.name === '行星齿轮')
const rvHit = M.findNodes('RV减速器', 10).find(n => n.name === 'RV减速器')
const reducerHit = M.findNodes('减速器', 10).find(n => n.name === '减速器')
const planet = M.nodeDetail(planetHit?.id)
const rv = M.nodeDetail(rvHit?.id)
const reducer = M.nodeDetail(reducerHit?.id)
t('C3 行星齿轮存在且父节点为RV减速器', planetHit && planet.parentName === 'RV减速器')
t('C4 行星齿轮保留上游/上游原材料/第3层', planet.region === '上游' && planet.lane === '上游原材料' && planet.depth === 3)
t('C5 RV减速器父节点为减速器且关系为包含', rv.parentName === '减速器' && rv.lane === '包含')
t('C6 减速器包含RV减速器可双向解析', reducer.children.includes(rv.id) && rv.parents.includes(reducer.id))
t('C7 行星齿轮→RV减速器方向边可解析', planet.downs.includes(rv.id) && rv.ups.includes(planet.id))
t('C8 所有包含关系双向可解析', source.nodes.filter(n => n.lane === '包含').every(n => { const child = M.nodeDetail(n.id); const parentId = M.findNodes(n.parent, 20).find(x => x.name === n.parent)?.id; return parentId && child.parents.includes(parentId) && M.nodeDetail(parentId).children.includes(n.id) }))
t('C9 源关系说明不冒充直接交易', M.adjNote.includes('parent、lane 与 depth') && M.adjNote.includes('不代表直接供应'))

console.log('D. 公司、指标与检索')
const lookup = M.lookupStock('兆威机电')
t('D1 兆威机电反查命中', lookup && !lookup.notFound && lookup.company.name === '兆威机电')
t('D2 兆威机电可反查行星齿轮', lookup.hits.some(h => h.chainKey === 'robot' && h.nodes.some(n => n.id === planet.id)))
t('D3 行星齿轮公司角色来自源文件', planet.companies.some(c => c.name === '兆威机电' && c.role === '齿轮/传动部件供应商'))
t('D4 公司浏览覆盖103家唯一公司', M.companyBrowse.length === 103)
const planetSearch = M.runSearch('行星齿轮')
t('D5 全局搜索命中行星齿轮且ID可解析', planetSearch.groups.some(g => g.type === '节点' && g.items.some(n => n.id === planet.id)) && M.nodeBrief(planet.id).name === '行星齿轮')
const coSearch = M.runSearch('兆威机电')
t('D6 全局搜索命中兆威机电', coSearch.groups.some(g => g.type === '公司' && g.items.some(c => c.t === '兆威机电')))
t('D7 所有源指标字段和图表序列可用', allIndicators.every(ind => ind.name && ind.latest !== undefined && ind.period && ind.unit && ind.trend && ind.series.length && ind.series.every(p => p.date && Number.isFinite(Number(p.value)))))
const uniqueIndicatorNames = [...new Set(allIndicators.map(ind => ind.name))]
t('D8 339个唯一指标均可从页面解析', uniqueIndicatorNames.length === 339 && uniqueIndicatorNames.every(name => M.findIndicator(name)))
t('D9 指标分组覆盖全部377条节点关联', M.indicatorGroups.reduce((sum, group) => sum + group.items.length, 0) === 377)
t('D10 不存在的指标返回null', M.findIndicator('不存在的指标xyz') === null)

console.log('E. 算力链兼容与合规')
M.currentChainKey = 'compute'
t('E1 算力链仍可打开三阶段数据', M.bands.length === 3 && M.allNodeCount > 0)
t('E2 算力节点详情仍可解析', M.bands.every(b => b.nodes.every(n => M.nodeDetail(n.id).id === n.id)))
M.currentChainKey = 'robot'
t('E3 免责声明存在', M.COMPLIANCE.DISCLAIMER.includes('不构成任何投资建议'))
t('E4 知情同意三要素存在', !!(M.COMPLIANCE.CONSENT.title && M.COMPLIANCE.CONSENT.body && M.COMPLIANCE.CONSENT.confirm))

console.log('F. 页面源码防回潮')
const graph = read('pages/graph.js')
const home = read('pages/home.js')
const company = read('pages/company.js')
const indicator = read('pages/indicator.js')
const shell = read('index.html')
const mock = read('mock-data.js')
const runtime = read('six-chain-runtime.js')
const overview = read('pages/overview.js')
const research = read('research-config.js')
const nodeInsightsScript = read('node-insights.js')
const searchModule = read('pages/search-module.js')
const marketLoader = read('chain-market-index.js')
const appCss = read('app.css')
t('F1 脚本加载顺序为源数据→适配器→页面契约', shell.indexOf('robot-source.js') < shell.indexOf('robot-adapter.js') && shell.indexOf('robot-adapter.js') < shell.indexOf('mock-data.js'))
t('F2 机器人强依赖SOURCE_ROBOT且无手工回退', mock.includes('if (!SOURCE_ROBOT) throw new Error') && mock.includes('robot: SOURCE_ROBOT') && !mock.includes('SOURCE_ROBOT ||'))
t('F3 图谱有全节点定位入口', graph.includes('pg-gr-locate-input') && graph.includes('M.findNodes(locatorQuery'))
t('F4 详情阶段上下文来自M.bands动态层级', graph.includes('M.bands.findIndex(band => band.key === d.stage)') && graph.includes('stageContext'))
t('F5 核心标识严格对应非常重要节点', runtime.includes("core: clean(node.importanceLevel) === '非常重要'") && runtime.includes('this.coreBands = this.buildBands(true)') && graph.includes('M.nodeBrief(id)?.core') && graph.includes('仅核心节点') && graph.includes('归属于 ${n.parentName}'))
t('F6 包含关系全部内联且不再占用Tab', graph.includes("var __graphDetailTab = 'co'") && !graph.includes('data-t="contain"') && graph.includes('childCards.map(child =>') && !graph.includes('data-contain-all'))
t('F7 直接上下游超过4个在图内展开', graph.includes('__graphRelationExpanded') && graph.includes('aria-expanded') && !graph.includes('openRelationSheet'))
t('F8 折线小箭头和流动点保留', graph.includes('markerWidth="5"') && graph.includes('animateMotion') && graph.includes('pg-gr-node-trunk'))
t('F9 公司页展示源role而非伪region', company.includes('c.role') && company.includes('n.role'))
t('F10 指标页使用真实统计区间与序列点数', indicator.includes('ind.seriesStart') && indicator.includes('ind.seriesPointCount') && !indicator.includes('(示意)'))
t('F11 页面无alert演示残留', !graph.includes('alert('))
t('F12 hash深链和sessionStorage仍保留', shell.includes('hashchange') && shell.includes('sessionStorage'))
t('F13 图谱节点用公司/指标图标数量且不另起文字行', graph.includes('pg-gr-metric-legend { flex: 0 0 auto; margin-left: auto') && graph.includes('<em>公司</em>') && graph.includes('<em>指标</em>') && graph.includes('metricBadges(n)') && !graph.includes('<em>公司数</em>') && !graph.includes('<em>指标数</em>') && !graph.includes('class="cnt"'))
t('F14 六链分类排序以重要度优先、承接能力次之', runtime.indexOf('Boolean(right.important)') < runtime.indexOf('right.importanceScore') && runtime.indexOf('right.importanceScore') < runtime.indexOf('associationCount(right)') && runtime.indexOf('associationCount(right)') < runtime.indexOf('this.nodeOrder.get(leftId)'))
t('F15 动态大层级按阶段使用不同图标', ['U1:', 'U2:', 'M0:', 'D1:'].every(token => graph.includes(token)) && graph.includes('stageIcon(b)'))
t('F16 总览删除核心线型图例且归类分支统一实线', !graph.includes('<div class="pg-gr-legend"') && graph.includes('所有分支同色同线型') && !graph.includes('p.trunk ? t'))
t('F17 详情三槽阶段对齐、删除重复信息并保留真实关系动画', graph.includes('grid-template-columns: repeat(3, minmax(0, 1fr))') && graph.includes('M.bands[stageIndex - 1]') && graph.includes('M.bands[stageIndex + 1]') && graph.includes(".pg-gr-posbar .seg[data-band]") && graph.includes('已到最上游') && graph.includes('已到最下游') && !graph.includes('class="arr"') && !graph.includes('<span class="label">节点介绍</span>') && !graph.includes('源数据第 ${d.depth} 层') && !graph.includes('<div class="k">父子关系</div>') && graph.includes('.pg-gr-ego-col::before { display: none; }') && !graph.includes('<div class="pg-gr-relation-key"') && graph.includes('animateMotion') && graph.includes("emptyCard('暂无直接上游')") && graph.includes("emptyCard('暂无直接下游')") && !graph.includes('暂无可验证') && !graph.includes('pg-gr-card-meta">${n.stageTitle'))
t('F18 父子上下游不生成继承边', !graph.includes('继承关系') && !runtime.includes('inheritedEdge') && runtime.includes('this.parentRelations'))
t('F19 节点介绍按需加载并按链节点精确匹配', runtime.includes("fetchJson('data/node-descriptions.json', '节点介绍')") && runtime.includes('feiyan-node-descriptions-v1') && graph.includes('M.ensureNodeDescriptions()'))
t('F20 首页顶部原搜索模块与 241 目录图标族保留', home.includes('.pg-hm-hero') && home.includes('.pg-hm-stats') && home.includes('id="pg-hm-search"') && home.includes('搜产业链、节点、公司、指标') && home.includes('themesShown.map(themeCard)') && home.includes('FAMILY_RULES') && home.includes('data-icon-family') && !home.includes('🔒'))

console.log('G. 六链正式数据与浏览器验收门禁')
const packageTest = spawnSync(process.execPath, ['--test', path.join(root, 'tests', 'six-chain-package.test.mjs')], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
t('G1 六链 package 单测全绿', packageTest.status === 0, packageTest.stderr || packageTest.stdout)
const sixChainVerify = spawnSync(process.execPath, [path.join(root, 'verify-six-chain-data.mjs')], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
t('G2 六链 schema、引用、目录、指标和路径审计全绿', sixChainVerify.status === 0, sixChainVerify.stderr || sixChainVerify.stdout.slice(-2000))
const qaPath = path.join(root, 'qa-artifacts', 'v19-browser-qa.json')
const qa = fs.existsSync(qaPath) ? JSON.parse(fs.readFileSync(qaPath, 'utf8')) : null
t('G3 两档移动视口浏览器验收已通过', qa?.status === 'passed' && qa.coverage?.fullInteractionViewports?.join(',') === '390x844,430x932' && Object.entries(qa.coverage).filter(([key]) => key !== 'fullInteractionViewports').every(([, value]) => value === true) && qa.results?.length === 2 && qa.results.every(item => !item.consoleErrors.length && !item.pageErrors.length && !item.failedRequests.length && item.overflow.content <= 1 && item.overflow.phone <= 1 && item.overflow.body <= 1))
const currentQaPath = path.join(root, 'qa-artifacts', 'market-home-nav-20260730', 'results.json')
const currentQa = fs.existsSync(currentQaPath) ? JSON.parse(fs.readFileSync(currentQaPath, 'utf8')) : null
t('G4 行情、当前最热与首页入口在两档移动视口验收通过', currentQa?.status === 'passed' && ['390x844', '430x932'].every(key => { const item = currentQa.viewports?.[key]; return item?.status === 'passed' && item.chains?.join(',') === 'robot,aerospace,gold,silver,compute,storage_chip' && Object.values(item.overflow || {}).every(group => Object.values(group).every(value => value <= 1)) && Object.values(item.telemetry || {}).every(events => events.length === 0) }))

console.log('H. 本轮信息架构与最高指示保护')
const homeHeroIndex = home.indexOf('<div class="pg-hm-hero">')
const marketSectionIndex = home.indexOf('<h2 id="pg-hm-market-title">当前最热</h2>')
const directoryIndex = home.indexOf('<div class="pg-hm-filters">')
const graphNodeRouteCount = (graph.match(/ctx\.go\('graph', \{ node:/g) || []).length
const researchWindow = {}
new Function('window', nodeInsightsScript)(researchWindow)
new Function('window', research)(researchWindow)
const researchConfig = researchWindow.RESEARCH_CONFIG
const robotNodeInsights = Object.values(researchConfig?.nodeInsights?.robot || {})
const expectedPosters = Object.freeze({
  robot: 'assets/机器人图解.png',
  aerospace: 'assets/航空航天产业链图解.png',
  gold: 'assets/黄金产业链图解.png',
  silver: 'assets/白银产业链图解.png',
  compute: 'assets/算力产业链图解.png',
  storage_chip: 'assets/存储芯片产业链图解.png'
})
const marketManifest = JSON.parse(read('data/chain-market-index/manifest.json'))
const expectedMarketKeys = ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip']
const marketFilesValid = marketManifest.chains.every(entry => {
  if (!fs.existsSync(path.join(root, 'data', 'chain-market-index', entry.file))) return false
  const series = JSON.parse(read(path.join('data', 'chain-market-index', entry.file)))
  const latest = series.series?.[series.series.length - 1]
  const numericFields = ['open', 'high', 'low', 'close', 'change', 'changePct', 'fiveDayPct', 'volumeWanShares', 'amountYuan']
  return series.schemaVersion === 'feiyan-chain-market-index-v1' && series.key === entry.key &&
    series.coverage?.anomalies?.length === 0 && series.series?.length === entry.tradingDays &&
    series.coverage?.tradingDays === entry.tradingDays && String(latest?.date) === String(entry.latest?.date) &&
    numericFields.every(field => Number.isFinite(Number(latest?.[field])) && Number(latest[field]) === Number(entry.latest[field]))
})
t('H1 首页顶部搜索及双统计结构保持', home.includes('<div class="pg-hm-hero">') && home.includes('<div class="pg-hm-stats">') && home.includes('grid-template-columns: repeat(2,minmax(0,1fr))') && (home.match(/class="pg-hm-stat"/g) || []).length === 2 && !home.includes('<div class="k">开放</div>') && !home.includes('stats.live') && home.includes('id="pg-hm-search"') && home.includes('placeholder="搜产业链、节点、公司、指标"') && home.includes("ctx.go('search')"))
t('H2 241 目录生成、默认六链预览、完整展开及卡片对齐规则保留', runtime.includes("fetchJson('data/directory.json', '241 条产业链目录')") && runtime.includes('loadedDirectory?.counts?.total !== 241') && runtime.includes('loadedDirectory?.counts?.open !== 6') && runtime.includes('loadedDirectory?.counts?.locked !== 235') && home.includes('function themeCard(th)') && home.includes("const themesShown = filter === '全部' ? M.themes") && home.includes('prioritizedItems.slice(0, 2)') && home.includes('expandedThemes') && home.includes('class="pg-hm-mini ${it.live ?') && home.includes('data-live="${it.live === true}"') && home.includes('class="nm-label"') && home.includes('flex-wrap: nowrap') && home.includes("${themesShown.map(themeCard).join('')}") && home.includes("if (m.dataset.live === 'true') enterChain(m.dataset.key)") && home.includes('产业链需开通查看权限'))
t('H3 当前最热严格位于顶部搜索和 241 目录之间且无空按钮', homeHeroIndex >= 0 && marketSectionIndex > homeHeroIndex && directoryIndex > marketSectionIndex && !home.includes('当前可直接查看') && !home.includes('pg-hm-insight-more'))
t('H4 一图看懂与交互图谱职责分离', overview.includes('window.Page_overview = {') && overview.includes("title: '一图看懂'") && overview.includes('window.Page_atlas = {') && overview.includes("title: '交互图谱'") && overview.includes('window.Page_graph.render(el, {') && shell.indexOf('pages/graph.js') < shell.indexOf('pages/overview.js'))
t('H5 底部 Tab 不显示', shell.includes("tabbar.innerHTML = ''") && shell.includes('tabbar.hidden = true'))
t('H6 航空航天与存储芯片标题口径统一', researchConfig?.insights?.aerospace?.title === '航空航天产业链' && researchConfig?.insights?.aerospace?.homeTitle === '航空航天' && researchConfig?.insights?.storage_chip?.title === '存储芯片产业链' && researchConfig?.insights?.storage_chip?.homeTitle === '存储芯片' && marketManifest.chains.find(item => item.key === 'aerospace')?.title === '航空航天')
t('H7 六链图解资产完整映射且均可展示', Object.entries(expectedPosters).every(([key, poster]) => researchConfig?.insights?.[key]?.posterStatus === 'ready' && researchConfig.insights[key].poster === poster && fs.existsSync(path.join(root, poster))) && overview.includes("const posterReady = insight.posterStatus === 'ready' && insight.poster") && overview.includes('pg-ov-poster-button'))
t('H8 节点切换统一走 graph 深链并同步 URL', graphNodeRouteCount >= 7 && !graph.includes("ctx.go('detail'") && shell.includes('location.hash = _lastHash'))
t('H9 搜索页使用运营配置热门搜索口径', searchModule.includes('const HOT_SEARCHES') && searchModule.includes('不表示用户行为频次排名') && searchModule.includes('<span>热门搜索</span>') && !searchModule.includes('推荐搜索'))
t('H10 六链当前最热复用38px圆形独立图标', home.includes('.pg-hm-market-icon { display: grid; width: 38px; height: 38px;') && home.includes('border-radius: 50%') && home.includes('LEGACY_OPEN_CHAIN_ICONS[key](tone.color)') && ['aerospace', 'storage_chip'].every(key => home.includes(`${key}: ic(`)))

t('H11 公司指标数量收进 Tab 且删除重复统计卡', graph.includes('pg-gr-tab-count') && graph.includes('公司 <b class="pg-gr-tab-count">${d.stats.companies}</b>') && graph.includes('指标 <b class="pg-gr-tab-count">${d.stats.indicators}</b>') && !graph.includes('<div class="stat-row mt12">') && !graph.includes('<div class="k">关联公司</div>') && !graph.includes('<div class="k">关联指标</div>'))
t('H12 七个机器人一级整机节点解读与来源完整', robotNodeInsights.length === 7 && ['工业机器人', '协作机器人', '人形机器人', '物流机器人', '服务机器人', '特种机器人', '医疗机器人'].every(name => robotNodeInsights.some(item => item.name === name)) && robotNodeInsights.every(item => item.summary && item.whyImportant && item.keyVariables?.length === 3 && ['demand', 'supply', 'profit', 'competition', 'technology', 'risks', 'indicatorContext', 'reviewedAt'].every(key => item[key]) && item.watchIndicators?.length && item.sources?.length && item.sources.every(sourceItem => sourceItem.title && /^20\d{2}-\d{2}-\d{2}$/.test(sourceItem.date) && /^https?:\/\//.test(sourceItem.url))))
t('H13 富解读结构与折叠交互完整', ['30 秒看懂', '为什么重要', '需求驱动', '供给约束', '盈利逻辑', '竞争格局', '技术路线', '风险事项', '展开更多研究要点', 'data-expanded="false"'].every(text => graph.includes(text)) && graph.includes("closest('.pg-gr-insight-card-rich')") && graph.includes("insightCard.dataset.expanded = String(expanded)") && graph.includes('暂无补充解读。当前仅展示底稿中的节点定义与真实结构关系。'))
t('H14 公司依据与景气指标边界完整', runtime.includes('reason: clean(ref.reason || company.reason)') && runtime.includes('sourceRaw: rawSource') && runtime.includes('updatedAt: clean(ref.updatedAt || company.updatedAt)') && graph.includes('companyRelationLabel') && graph.includes('关联依据：') && graph.includes('公司关联依据来自底稿与公开资料，不代表投资评级') && graph.includes('<b>景气观察</b>') && graph.includes('nodeInsight.indicatorContext') && graph.includes('关键观察') && graph.includes('查看全部 ${orderedIndicators.length} 项指标') && nodeInsightsScript.includes('代理指标') && !graph.includes('节点市场表现'))
t('H15 六链行情 manifest 与逐链序列完整一致', marketManifest.schemaVersion === 'feiyan-chain-market-index-manifest-v1' && marketManifest.audit?.expectedChains === 6 && marketManifest.audit?.completeChains === 6 && marketManifest.audit?.coverageErrors === 0 && marketManifest.chains.length === 6 && expectedMarketKeys.every(key => marketManifest.chains.some(entry => entry.key === key)) && marketFilesValid)
t('H16 链内指数卡精简且口径边界可查看', researchConfig?.chainMarketIndex?.manifest === 'data/chain-market-index/manifest.json' && shell.indexOf('chain-market-index.js') < shell.indexOf('pages/overview.js') && marketLoader.includes('const seriesPromises = new Map()') && marketLoader.includes("fetch(url, { cache: 'no-store' })") && overview.includes('产业链指数') && overview.includes('5日涨跌') && overview.includes('data-index-info') && ['开盘', '最高', '最低', '成交量', '成交额'].every(text => !overview.includes(text)) && overview.includes('页面试算指数，非交易所正式指数') && overview.includes('data-index-host') && overview.includes('loader.getChain(chainKey)') && !overview.includes('pg-ov-index-metrics') && !overview.includes('pg-ov-poster-head') && !overview.includes('pg-ov-source'))
t('H17 首页当前最热使用六链真实行情横滑卡', marketManifest.chains.map(item => item.key).join(',') === expectedMarketKeys.join(',') && home.includes('grid-auto-flow: column') && home.includes('grid-auto-columns: calc(33.333% - 5.34px)') && home.includes('marketKeys.map(key =>') && home.includes('loader.getManifest()') && home.includes('loader.getChain(key)') && home.includes('latest.close') && home.includes('latest.fiveDayPct') && home.includes('UI.sparkline(canvas') && !home.includes('pg-hm-insight-card') && !home.includes('pg-hm-insight-more'))
t('H18 链内页复刻居中标题与胶囊式切链回首页', shell.includes('class="hd-back"') && shell.includes('class="hd-chain-title"') && shell.includes('class="hd-capsule"') && shell.includes('class="hd-more"') && shell.includes("onclick=\"app.chainPop()\"") && shell.includes('class="hd-home-orb"') && shell.includes('aria-label="返回首页"') && shell.includes("onclick=\"app.go('home')\"") && !shell.includes('class="hd-chain"') && !shell.includes('class="hd-home"') && appCss.includes('.hd-chain-title') && appCss.includes('.hd-capsule') && appCss.includes('.hd-home-orb') && appCss.includes('.seg-item.on::after'))
t('H19 搜索页热门解读展示六条开放链且删除重复快捷入口', researchConfig?.hotInsightKeys?.join(',') === expectedMarketKeys.join(',') && searchModule.includes('const hotItems = (research.hotInsightKeys || []).map(key =>') && searchModule.includes('class="pg-sm-insight" data-insight-key="${item.key}"') && searchModule.includes('min-height: 138px') && !searchModule.includes('.slice(0, 2)') && !searchModule.includes('全部产业链快捷入口') && !searchModule.includes('quickChains') && !searchModule.includes('data-quick-key') && !searchModule.includes('pg-sm-quick'))
console.log(`\n${fail ? '❌ 有断言失败' : '✅ 全绿'} —— ${pass} 通过, ${fail} 失败`)
process.exit(fail ? 1 : 0)
