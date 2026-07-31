(function () {
  'use strict'

  const M = window.MOCK
  if (!M) throw new Error('six-chain-runtime 需要先加载 mock-data.js')

  const OPEN_ORDER = ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip']
  const LANE_ORDER = new Map([
    '上游原材料',
    '上游生产设备',
    '上游运维材料',
    '上游运维设备',
    '上游技术服务',
    '中游',
    '下游产品/业务',
    '下游销售渠道'
  ].map((name, index) => [name, index]))
  const SIDE_LABEL = { upstream: '上游供给侧', midstream: '中游核心', downstream: '下游需求侧' }
  const SHORT_SIDE_LABEL = { upstream: '上游', midstream: '中游', downstream: '下游' }
  const LEVEL_RANK = new Map([['核心', 5], ['非常重要', 5], ['重要', 4], ['代表', 3], ['相关', 2], ['一般', 1]])
  const clean = value => value == null ? '' : String(value).trim()
  const list = value => Array.isArray(value) ? value : []
  const unique = values => [...new Set(values)]
  const lower = value => clean(value).toLocaleLowerCase('zh-CN')
  const number = value => Number.isFinite(Number(value)) ? Number(value) : -1

  let catalog = null
  let directory = null
  let searchIndex = null
  let activeKey = 'robot'
  let active = null
  let initializePromise = null
  let lastError = ''
  const cache = new Map()
  let nodeDescriptionPromise = null
  let nodeDescriptions = null

  function directionOf(stage) {
    if (stage?.direction) return stage.direction
    if (clean(stage?.id).startsWith('U')) return 'upstream'
    if (clean(stage?.id).startsWith('D')) return 'downstream'
    return 'midstream'
  }

  function associationCount(node) {
    return list(node?.companyRefs).length + list(node?.indicatorRefs).length
  }

  function nodeImportanceRank(node) {
    return LEVEL_RANK.get(clean(node?.importanceLevel)) || (node?.important ? 4 : 1)
  }

  class ChainAdapter {
    constructor(raw) {
      if (!raw || raw.schemaVersion !== 'feiyan-mobile-workbench-v1') throw new Error('产业链数据版本不受支持')
      this.raw = raw
      this.meta = raw.meta || {}
      this.stages = list(raw.stages).slice().sort((a, b) => number(a.order) - number(b.order))
      this.nodes = list(raw.nodes)
      this.placements = list(raw.placements)
      this.edges = list(raw.edges)
      this.parentRelations = list(raw.parentRelations)
      this.companies = list(raw.companies)
      this.indicators = list(raw.indicators)
      this.nodeById = new Map(this.nodes.map(node => [node.id, node]))
      this.stageById = new Map(this.stages.map(stage => [stage.id, stage]))
      this.placementByNode = new Map(this.placements.map(placement => [placement.nodeId, placement]))
      this.companyById = new Map(this.companies.map(company => [company.id, company]))
      this.indicatorById = new Map(this.indicators.map(indicator => [indicator.id, indicator]))
      this.nodeOrder = new Map(this.nodes.map((node, index) => [node.id, index]))
      this.parentsByChild = new Map()
      this.childrenByParent = new Map()
      this.incomingByNode = new Map()
      this.outgoingByNode = new Map()

      for (const relation of this.parentRelations) {
        if (!this.parentsByChild.has(relation.childId)) this.parentsByChild.set(relation.childId, [])
        if (!this.childrenByParent.has(relation.parentId)) this.childrenByParent.set(relation.parentId, [])
        this.parentsByChild.get(relation.childId).push(relation.parentId)
        this.childrenByParent.get(relation.parentId).push(relation.childId)
      }
      for (const edge of this.edges) {
        if (!this.incomingByNode.has(edge.target)) this.incomingByNode.set(edge.target, [])
        if (!this.outgoingByNode.has(edge.source)) this.outgoingByNode.set(edge.source, [])
        this.incomingByNode.get(edge.target).push(edge)
        this.outgoingByNode.get(edge.source).push(edge)
      }
      this.bands = this.buildBands()
      this.coreBands = this.buildBands(true)
    }

    stageBand(stageId) {
      return directionOf(this.stageById.get(stageId))
    }

    compareNodeIds(leftId, rightId) {
      const left = this.nodeById.get(leftId) || {}
      const right = this.nodeById.get(rightId) || {}
      return nodeImportanceRank(right) - nodeImportanceRank(left) ||
        number(right.importanceScore) - number(left.importanceScore) ||
        associationCount(right) - associationCount(left) ||
        number(this.nodeOrder.get(leftId)) - number(this.nodeOrder.get(rightId))
    }

    buildBands(includeContained = false) {
      const contained = new Set(this.parentRelations.map(relation => relation.childId))
      return this.stages.map(stage => {
        const laneMap = new Map()
        for (const placement of this.placements) {
          if (placement.stageId !== stage.id || (!includeContained && contained.has(placement.nodeId))) continue
          const lane = clean(placement.lane) || '未标注分类'
          if (!laneMap.has(lane)) laneMap.set(lane, [])
          laneMap.get(lane).push(placement.nodeId)
        }
        const lanes = [...laneMap.entries()].map(([name, ids]) => ({
          name,
          nodes: unique(ids).sort((a, b) => this.compareNodeIds(a, b)).map(id => this.nodeBrief(id)).filter(Boolean)
        })).sort((a, b) => {
          const left = LANE_ORDER.has(a.name) ? LANE_ORDER.get(a.name) : 99
          const right = LANE_ORDER.has(b.name) ? LANE_ORDER.get(b.name) : 99
          return left - right || a.name.localeCompare(b.name, 'zh-CN')
        })
        return {
          key: stage.id,
          title: clean(stage.title) || stage.id,
          subtitle: clean(stage.description),
          band: directionOf(stage),
          depth: number(stage.depth),
          lanes,
          nodes: lanes.flatMap(lane => lane.nodes)
        }
      })
    }

    nodeBrief(id) {
      const node = this.nodeById.get(id)
      if (!node) return null
      const placement = this.placementByNode.get(id) || {}
      const stage = this.stageById.get(placement.stageId) || {}
      const parents = list(this.parentsByChild.get(id))
      return {
        id,
        name: clean(node.name),
        band: directionOf(stage),
        stage: clean(placement.stageId),
        stageTitle: clean(stage.title),
        lane: clean(placement.lane || node.lane),
        important: Boolean(node.important),
        core: clean(node.importanceLevel) === '非常重要',
        importanceScore: number(node.importanceScore),
        companies: list(node.companyRefs).length,
        indicators: list(node.indicatorRefs).length,
        depth: Number(node.depth) || 1,
        parentName: parents.length ? clean(this.nodeById.get(parents[0])?.name) : '',
        nodePath: clean(node.nodePath)
      }
    }

    companyView(ref) {
      const company = this.companyById.get(ref.companyId)
      if (!company) return null
      const rawSource = clean(ref.source || company.source)
      const sourceLabel = rawSource.includes('iFinD')
        ? 'iFinD 主营业务'
        : rawSource.includes('公开资讯')
          ? '产业链底稿与公开资料'
          : '产业链研究底稿'
      return {
        name: clean(company.name),
        code: clean(company.code),
        region: clean(company.market),
        role: clean(ref.role || company.role) || '角色未标注',
        level: clean(ref.level || company.level) || '相关',
        score: number(ref.score ?? company.score),
        reason: clean(ref.reason || company.reason) || clean(ref.role || company.role) || '底稿已建立该节点关联',
        source: sourceLabel,
        sourceRaw: rawSource,
        updatedAt: clean(ref.updatedAt || company.updatedAt) || this.meta.dataAsOf || '—'
      }
    }

    indicatorView(indicator) {
      if (!indicator) return null
      const preview = list(indicator.seriesPreview)
      return {
        id: indicator.id,
        sourceId: clean(indicator.sourceId),
        name: clean(indicator.name),
        freq: clean(indicator.frequency) || '未标注',
        source: clean(indicator.source) || 'iFinD',
        unit: clean(indicator.unit) || '—',
        latest: indicator.latest ?? '—',
        latestDate: clean(indicator.period) || '—',
        series: preview.map(point => Number(point.value)).filter(Number.isFinite),
        seriesDates: preview.map(point => clean(point.period)),
        seriesStart: preview[0]?.period || '',
        seriesEnd: preview.at(-1)?.period || '',
        seriesPointCount: Number(indicator.seriesCount) || preview.length,
        trend: clean(indicator.trend),
        discontinued: Boolean(indicator.discontinued),
        refreshStatus: clean(indicator.refreshStatus)
      }
    }

    nodeDetail(id) {
      let node = this.nodeById.get(id)
      if (!node) node = this.nodes.find(item => clean(item.importanceLevel) === '非常重要' && (this.incomingByNode.has(item.id) || this.outgoingByNode.has(item.id))) ||
        this.nodes.find(item => item.important && (this.incomingByNode.has(item.id) || this.outgoingByNode.has(item.id))) || this.nodes[0]
      if (!node) return null
      const brief = this.nodeBrief(node.id)
      const placement = this.placementByNode.get(node.id) || {}
      const stage = this.stageById.get(placement.stageId) || {}
      const parents = unique(list(this.parentsByChild.get(node.id)))
      const children = unique(list(this.childrenByParent.get(node.id)))
      const ups = unique(list(this.incomingByNode.get(node.id)).map(edge => edge.source))
      const downs = unique(list(this.outgoingByNode.get(node.id)).map(edge => edge.target))
      const siblingPool = parents.length
        ? parents.flatMap(parentId => list(this.childrenByParent.get(parentId)))
        : this.placements.filter(item => item.stageId === placement.stageId && item.lane === placement.lane).map(item => item.nodeId)
      const siblings = unique(siblingPool).filter(nodeId => nodeId !== node.id)
      return {
        id: node.id,
        name: clean(node.name),
        band: brief.band,
        stage: brief.stage,
        stageLabel: brief.stageTitle,
        region: SHORT_SIDE_LABEL[brief.band],
        lane: brief.lane,
        depth: brief.depth,
        parentName: brief.parentName || null,
        important: brief.important,
        core: brief.core,
        bandLabel: SIDE_LABEL[brief.band],
        importance: clean(node.importanceLevel) || (brief.important ? '重要' : '一般'),
        intro: clean(node.description) || '源数据暂未提供该节点的独立说明。',
        alsoIn: [],
        adjNote: '折线仅表示底稿原始路径中的相邻非“包含”关系，不代表直接供应、交易或一一对应。',
        nodePath: brief.nodePath,
        stats: {
          companies: brief.companies,
          indicators: brief.indicators,
          siblings: siblings.length,
          parents: parents.length,
          children: children.length
        },
        ups,
        downs,
        parents,
        children,
        siblings,
        companies: list(node.companyRefs).map(ref => this.companyView(ref)).filter(Boolean),
        moreCompanies: 0,
        indicators: list(node.indicatorRefs).map(indicatorId => this.indicatorView(this.indicatorById.get(indicatorId))).filter(Boolean)
      }
    }

    indicatorGroups() {
      return this.nodes.map(node => {
        const items = list(node.indicatorRefs).map(id => this.indicatorView(this.indicatorById.get(id))).filter(Boolean)
        return items.length ? { node: clean(node.name), nodeId: node.id, items } : null
      }).filter(Boolean).sort((a, b) => a.node.localeCompare(b.node, 'zh-CN'))
    }

    companyBrowse() {
      return this.companies.map(company => {
        const refs = list(company.nodeRefs)
        const best = refs.slice().sort((a, b) => (LEVEL_RANK.get(clean(b.level)) || 0) - (LEVEL_RANK.get(clean(a.level)) || 0) || number(b.score) - number(a.score))[0] || {}
        return {
          name: clean(company.name),
          code: clean(company.code),
          role: clean(best.role || company.role) || '角色未标注',
          level: clean(best.level || company.level) || '相关',
          nodes: unique(refs.map(ref => ref.nodeId)).length,
          best: LEVEL_RANK.get(clean(best.level || company.level)) || 0
        }
      }).sort((a, b) => b.nodes - a.nodes || b.best - a.best || a.name.localeCompare(b.name, 'zh-CN'))
    }

    findNodes(query, limit = 12) {
      const keyword = lower(query)
      if (!keyword) return []
      return this.nodes.filter(node => lower(node.name).includes(keyword)).sort((a, b) => {
        const left = lower(a.name)
        const right = lower(b.name)
        const leftRank = left === keyword ? 0 : (left.startsWith(keyword) ? 1 : 2)
        const rightRank = right === keyword ? 0 : (right.startsWith(keyword) ? 1 : 2)
        return leftRank - rightRank || this.compareNodeIds(a.id, b.id) || a.name.length - b.name.length
      }).slice(0, limit).map(node => this.nodeBrief(node.id))
    }

    findIndicator(name) {
      const exact = lower(name)
      const indicator = this.indicators.find(item => lower(item.name) === exact)
      return this.indicatorView(indicator)
    }

    nodesByIndicator(name) {
      const exact = lower(name)
      const indicator = this.indicators.find(item => lower(item.name) === exact)
      if (!indicator) return []
      return list(indicator.nodeIds).map(id => this.nodeBrief(id)).filter(Boolean)
    }
  }

  function chainEntry(key) {
    return list(catalog?.chains).find(item => item.key === key) || null
  }

  async function fetchJson(path, label) {
    const response = await fetch(path, { cache: 'no-store' })
    if (!response.ok) throw new Error(`${label}加载失败（HTTP ${response.status}）`)
    try {
      return await response.json()
    } catch (error) {
      throw new Error(`${label}解析失败：${error.message}`)
    }
  }

  async function ensureNodeDescriptions() {
    if (nodeDescriptions) return nodeDescriptions
    if (!nodeDescriptionPromise) {
      nodeDescriptionPromise = fetchJson('data/node-descriptions.json', '节点介绍').then(payload => {
        if (payload?.schemaVersion !== 'feiyan-node-descriptions-v1' || !Array.isArray(payload.items)) {
          throw new Error('节点介绍数据版本不受支持')
        }
        nodeDescriptions = new Map(payload.items.map(item => [`${clean(item.chainKey)}:${clean(item.nodeId)}`, clean(item.description)]))
        return nodeDescriptions
      }).catch(error => {
        nodeDescriptionPromise = null
        throw error
      })
    }
    return nodeDescriptionPromise
  }

  function nodeDescription(nodeId, chainKey = activeKey) {
    return nodeDescriptions?.get(`${clean(chainKey)}:${clean(nodeId)}`) || ''
  }
  async function loadChain(key) {
    if (cache.has(key)) return cache.get(key)
    const entry = chainEntry(key)
    if (!entry || !OPEN_ORDER.includes(key)) throw new Error('该产业链尚未开放')
    const raw = await fetchJson(entry.file || `data/${key}.json`, `${entry.title}产业链数据`)
    if (raw.meta?.key !== key) throw new Error(`${entry.title}产业链键值不一致`)
    const adapter = new ChainAdapter(raw)
    cache.set(key, adapter)
    return adapter
  }

  function commitChain(key, adapter) {
    activeKey = key
    active = adapter
    lastError = ''
    window.dispatchEvent(new CustomEvent('feiyan:chainchange', { detail: { chainKey: key } }))
  }

  async function selectChain(key) {
    const target = clean(key)
    if (target === activeKey && active) return active
    const previousKey = activeKey
    const previous = active
    try {
      const adapter = await loadChain(target)
      commitChain(target, adapter)
      return adapter
    } catch (error) {
      activeKey = previousKey
      active = previous
      lastError = error.message || String(error)
      window.dispatchEvent(new CustomEvent('feiyan:chainerror', { detail: { chainKey: target, message: lastError } }))
      throw error
    }
  }

  function buildChains() {
    return OPEN_ORDER.map(key => {
      const entry = chainEntry(key)
      const counts = entry?.counts || {}
      return {
        key,
        title: clean(entry?.title) || key,
        live: true,
        nodeCount: Number(counts.nodes) || 0,
        companyCount: Number(counts.companies) || 0,
        indicatorCount: Number(counts.indicators) || 0
      }
    })
  }

  function buildDirectoryCatalog() {
    return list(directory?.items).map(item => ({
      key: item.chainKey || item.id,
      title: item.name,
      desc: item.attr || item.topic,
      topic: item.topic,
      attr: item.attr,
      live: item.live === true,
      locked: item.locked === true,
      chainKey: item.chainKey || ''
    }))
  }

  function buildThemes() {
    const keys = { '十五五规划产业链': 'plan155', '期货产业链': 'futures', '热门产业链': 'hot' }
    const subtitles = { '十五五规划产业链': '国家战略新兴产业与未来产业', '期货产业链': '大宗商品与衍生品关联产业', '热门产业链': '近期市场关注度较高的方向' }
    const groups = new Map()
    for (const item of list(directory?.items)) {
      if (!groups.has(item.topic)) groups.set(item.topic, [])
      groups.get(item.topic).push({
        name: item.name,
        key: item.chainKey || item.id,
        live: item.live === true,
        locked: item.locked === true,
        tag: item.attr,
        attr: item.attr
      })
    }
    return [...groups.entries()].map(([name, items]) => ({
      key: keys[name] || name,
      name,
      sub: subtitles[name] || '',
      items
    }))
  }

  function lookupStock(query) {
    const keyword = lower(query)
    if (!keyword || !searchIndex) return null
    const matches = searchIndex.items.filter(item => item.kind === 'company' && (lower(item.name).includes(keyword) || lower(item.code).includes(keyword)))
    if (!matches.length) return { notFound: true, query }
    matches.sort((a, b) => {
      const aExact = lower(a.name) === keyword || lower(a.code) === keyword
      const bExact = lower(b.name) === keyword || lower(b.code) === keyword
      return Number(bExact) - Number(aExact) || a.name.length - b.name.length
    })
    const chosen = matches[0]
    const occurrences = searchIndex.items.filter(item => item.kind === 'company' && item.name === chosen.name)
    const grouped = new Map()
    for (const item of occurrences) {
      if (!grouped.has(item.chainKey)) grouped.set(item.chainKey, { chain: item.chainTitle, chainKey: item.chainKey, nodes: [] })
      const group = grouped.get(item.chainKey)
      if (group.nodes.some(node => node.id === item.nodeId)) continue
      group.nodes.push({
        id: item.nodeId,
        name: item.node,
        band: item.direction || 'midstream',
        stage: item.stageId,
        lane: item.lane,
        level: item.level || '相关',
        role: item.role || '角色未标注'
      })
    }
    const hits = [...grouped.values()].sort((a, b) => OPEN_ORDER.indexOf(a.chainKey) - OPEN_ORDER.indexOf(b.chainKey))
    return {
      query,
      company: { name: chosen.name, code: chosen.code, role: chosen.role || '角色未标注' },
      hits,
      chainCount: hits.length,
      nodeCount: hits.reduce((sum, group) => sum + group.nodes.length, 0)
    }
  }

  function runSearch(query) {
    const keyword = lower(query)
    if (!keyword || !searchIndex || !directory) return null
    const groups = { 产业: [], 节点: [], 公司: [], 指标: [] }
    const directoryHits = directory.items.filter(item => lower(item.name).includes(keyword)).sort((a, b) => {
      const aRank = lower(a.name) === keyword ? 0 : 1
      const bRank = lower(b.name) === keyword ? 0 : 1
      return aRank - bRank || Number(b.live) - Number(a.live)
    })
    for (const item of directoryHits.slice(0, 12)) {
      groups.产业.push({
        t: item.name,
        s: item.live ? '产业链 · 可直接查看' : '产业链 · 已锁定 · 联系专属客户经理',
        key: item.chainKey || '',
        locked: item.locked === true
      })
    }

    const seen = { 节点: new Set(), 公司: new Set(), 指标: new Set() }
    for (const item of searchIndex.items) {
      const haystack = item.kind === 'company' ? `${item.name} ${item.code}` : item.name
      if (!lower(haystack).includes(keyword)) continue
      if (item.kind === 'node') {
        const key = `${item.chainKey}|${item.nodeId}`
        if (seen.节点.has(key)) continue
        seen.节点.add(key)
        groups.节点.push({
          t: item.name,
          s: `${item.chainTitle} · ${SHORT_SIDE_LABEL[item.direction] || ''} · ${item.stageTitle} · ${item.lane}`,
          chainKey: item.chainKey,
          id: item.nodeId
        })
      } else if (item.kind === 'company') {
        const key = `${item.chainKey}|${item.name}`
        if (seen.公司.has(key)) continue
        seen.公司.add(key)
        groups.公司.push({
          t: item.name,
          s: `${item.code || '未上市'} · ${item.node} · ${item.chainTitle}`,
          chainKey: item.chainKey
        })
      } else if (item.kind === 'indicator') {
        const key = `${item.chainKey}|${item.name}`
        if (seen.指标.has(key)) continue
        seen.指标.add(key)
        groups.指标.push({
          t: item.name,
          s: `指标 · ${item.node} · ${item.chainTitle}`,
          chainKey: item.chainKey
        })
      }
    }
    const ordered = ['产业', '节点', '公司', '指标'].map(type => ({ type, items: groups[type].slice(0, 12) })).filter(group => group.items.length)
    return { query, groups: ordered, total: ordered.reduce((sum, group) => sum + group.items.length, 0) }
  }

  async function initialize() {
    if (initializePromise) return initializePromise
    initializePromise = (async () => {
      const [loadedCatalog, loadedDirectory, loadedSearch] = await Promise.all([
        fetchJson('data/catalog.json', '六链目录'),
        fetchJson('data/directory.json', '241 条产业链目录'),
        fetchJson('data/search-index.json', '六链搜索索引')
      ])
      if (loadedDirectory?.counts?.total !== 241 || loadedDirectory?.counts?.open !== 6 || loadedDirectory?.counts?.locked !== 235) {
        throw new Error('产业链目录数量不符合 241/6/235 契约')
      }
      catalog = loadedCatalog
      directory = loadedDirectory
      searchIndex = loadedSearch
      M.chains = buildChains()
      M.chainCatalog = buildDirectoryCatalog()
      M.themes = buildThemes()
      commitChain('robot', await loadChain('robot'))
      return M
    })().catch(error => {
      lastError = error.message || String(error)
      initializePromise = null
      throw error
    })
    return initializePromise
  }

  Object.defineProperties(M, {
    currentChainKey: {
      configurable: true,
      enumerable: true,
      get() { return activeKey },
      set(value) { void selectChain(value).catch(() => {}) }
    },
    chainIntro: { configurable: true, enumerable: true, get() { return active ? `${M.chainTitle}产业链动态分为 ${active.bands.map(band => band.title).join('、')}。` : '' } },
    bands: { configurable: true, enumerable: true, get() { return active?.bands || [] } },
    coreBands: { configurable: true, enumerable: true, get() { return active?.coreBands || [] } },
    indicatorGroups: { configurable: true, enumerable: true, get() { return active?.indicatorGroups() || [] } },
    companyBrowse: { configurable: true, enumerable: true, get() { return active?.companyBrowse() || [] } },
    chainTitle: { configurable: true, enumerable: true, get() { return chainEntry(activeKey)?.title || active?.meta?.title || '' } },
    adjNote: { configurable: true, enumerable: true, get() { return '折线仅表示底稿原始路径中的相邻非“包含”关系；分类包含关系在当前节点下方独立完整展示。' } },
    sourceInfo: { configurable: true, enumerable: true, get() { return active?.meta?.source || null } },
    sourceCounts: {
      configurable: true,
      enumerable: true,
      get() {
        const counts = active?.meta?.counts
        return counts ? {
          nodes: counts.nodes,
          companyRows: counts.companyAssociations,
          uniqueCompanies: counts.companies,
          indicatorRows: counts.indicatorAssociations,
          uniqueIndicators: counts.indicators
        } : null
      }
    },
    allNodeCount: { configurable: true, enumerable: true, get() { return active?.nodes.length || 0 } },
    relationCounts: {
      configurable: true,
      enumerable: true,
      get() { return { edges: active?.edges.length || 0, contains: active?.parentRelations.length || 0 } }
    },
    meta: {
      configurable: true,
      enumerable: true,
      get() { return { dataAsOf: active?.meta?.dataAsOf || catalog?.generatedAt?.slice(0, 10) || '—', note: '六链真实数据' } }
    },
    directoryCounts: { configurable: true, enumerable: true, get() { return directory?.counts || { total: 0, open: 0, locked: 0 } } },
    loadError: { configurable: true, enumerable: true, get() { return lastError } }
  })

  M.initialize = initialize
  M.selectChain = selectChain
  M.nodeBrief = id => active?.nodeBrief(id) || null
  M.nodeDetail = id => active?.nodeDetail(id) || null
  M.findNodes = (query, limit) => active?.findNodes(query, limit) || []
  M.findIndicator = name => active?.findIndicator(name) || null
  M.nodesByIndicator = name => active?.nodesByIndicator(name) || []
  M.ensureNodeDescriptions = ensureNodeDescriptions
  M.nodeDescription = (nodeId, chainKey) => nodeDescription(nodeId, chainKey)
  M.lookupStock = lookupStock
  M.runSearch = runSearch
  M.__runtime = {
    get active() { return active },
    get catalog() { return catalog },
    get directory() { return directory },
    get searchIndex() { return searchIndex },
    get cacheKeys() { return [...cache.keys()] }
  }
})()
