(function () {
  'use strict'

  const COMPLIANCE = Object.freeze({
    disclaimer: '本内容基于公开资料与第三方数据整理，仅供参考，不构成任何投资建议或对任何证券价值的判断。产业链归类与公司关联为研究性梳理，不代表对相关公司经营或股价的预测。市场有风险，投资需谨慎。',
    source: '数据来源：同花顺金融研究中心 · iFinD',
    consentTitle: '欢迎使用飞研产业研究平台',
    consentBody: '本产品提供产业链结构、代表公司与行业指标等信息展示服务，不提供投资咨询、荐股或买卖建议。请您根据自身风险承受能力独立决策。',
    consentConfirm: '我已知晓'
  })

  const arr = value => Array.isArray(value) ? value : []
  const text = value => value == null ? '' : String(value)
  const unique = values => [...new Set(values)]
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

  class WorkbenchStore {
    constructor(data) {
      if (!data || data.schemaVersion !== 'feiyan-mobile-workbench-v1') throw new Error('数据版本不受支持')
      this.data = data
      this.meta = data.meta
      this.stages = arr(data.stages).slice().sort((left, right) => Number(left.order) - Number(right.order))
      this.nodes = arr(data.nodes)
      this.companies = arr(data.companies)
      this.indicators = arr(data.indicators)
      this.edges = arr(data.edges)
      this.placements = arr(data.placements)
      this.parentRelations = arr(data.parentRelations)

      this.nodeById = new Map(this.nodes.map(node => [node.id, node]))
      this.companyById = new Map(this.companies.map(company => [company.id, company]))
      this.indicatorById = new Map(this.indicators.map(indicator => [indicator.id, indicator]))
      this.placementByNode = new Map(this.placements.map(placement => [placement.nodeId, placement]))
      this.stageById = new Map(this.stages.map(stage => [stage.id, stage]))
      this.childrenByParent = new Map()
      this.parentsByChild = new Map()
      this.parentByChild = new Map()
      this.parentRelationByPair = new Map()
      this.edgesByNode = new Map()
      this.incomingByNode = new Map()
      this.outgoingByNode = new Map()
      this.edgeById = new Map()
      this.descendantCountCache = new Map()
      this.lensProjectionCache = new Map()
      this.seriesCache = new Map()
      this._stageNodeCache = new Map()
      this._laneCache = new Map()

      for (const relation of this.parentRelations) {
        const pairKey = relation.parentId + '::' + relation.childId
        const existingRelation = this.parentRelationByPair.get(pairKey)
        if (existingRelation) existingRelation.pathIds = unique([...arr(existingRelation.pathIds), ...arr(relation.pathIds)])
        else this.parentRelationByPair.set(pairKey, { ...relation, pathIds: unique(arr(relation.pathIds)) })
        if (!this.childrenByParent.has(relation.parentId)) this.childrenByParent.set(relation.parentId, [])
        this.childrenByParent.get(relation.parentId).push(relation.childId)
        if (!this.parentsByChild.has(relation.childId)) this.parentsByChild.set(relation.childId, [])
        const parentIds = this.parentsByChild.get(relation.childId)
        if (!parentIds.includes(relation.parentId)) parentIds.push(relation.parentId)
        if (parentIds.length === 1) this.parentByChild.set(relation.childId, relation.parentId)
        else this.parentByChild.delete(relation.childId)
      }
      for (const edge of this.edges) {
        this.edgeById.set(edge.id, edge)
        for (const nodeId of [edge.source, edge.target]) {
          if (!this.edgesByNode.has(nodeId)) this.edgesByNode.set(nodeId, [])
          this.edgesByNode.get(nodeId).push(edge)
        }
        if (!this.outgoingByNode.has(edge.source)) this.outgoingByNode.set(edge.source, [])
        if (!this.incomingByNode.has(edge.target)) this.incomingByNode.set(edge.target, [])
        this.outgoingByNode.get(edge.source).push(edge)
        this.incomingByNode.get(edge.target).push(edge)
      }
    }

    node(id) { return this.nodeById.get(id) || null }
    company(id) { return this.companyById.get(id) || null }
    indicator(id) { return this.indicatorById.get(id) || null }
    placement(id) { return this.placementByNode.get(id) || null }
    children(id) { return arr(this.childrenByParent.get(id)).map(childId => this.node(childId)).filter(Boolean) }
    parents(id) { return arr(this.parentsByChild.get(id)).map(parentId => this.node(parentId)).filter(Boolean) }
    parent(id) {
      const parents = this.parents(id)
      return parents.length === 1 ? parents[0] : null
    }
    parentRelation(parentId, childId) { return this.parentRelationByPair.get(parentId + '::' + childId) || null }
    edgesFor(id) { return arr(this.edgesByNode.get(id)) }
    incomingFor(id) { return arr(this.incomingByNode.get(id)) }
    outgoingFor(id) { return arr(this.outgoingByNode.get(id)) }

    descendantCount(id) {
      if (this.descendantCountCache.has(id)) return this.descendantCountCache.get(id)
      const visited = new Set([id])
      const queue = [...arr(this.childrenByParent.get(id))]
      let count = 0
      while (queue.length) {
        const childId = queue.shift()
        if (visited.has(childId)) continue
        visited.add(childId)
        count += 1
        queue.push(...arr(this.childrenByParent.get(childId)))
      }
      this.descendantCountCache.set(id, count)
      return count
    }

    ancestors(id) {
      const result = []
      const visited = new Set()
      let current = this.parent(id)
      while (current && !visited.has(current.id)) {
        visited.add(current.id)
        result.unshift(current)
        current = this.parent(current.id)
      }
      return result
    }

    nodesInStage(stageId) {
      if (!this._stageNodeCache.has(stageId)) {
        this._stageNodeCache.set(stageId, this.placements.filter(item => item.stageId === stageId).map(item => this.node(item.nodeId)).filter(Boolean))
      }
      return this._stageNodeCache.get(stageId)
    }

    lanes(stageId) {
      if (this._laneCache.has(stageId)) return this._laneCache.get(stageId)
      const byLane = new Map()
      for (const placement of this.placements) {
        if (placement.stageId !== stageId) continue
        if (!byLane.has(placement.lane)) byLane.set(placement.lane, [])
        const node = this.node(placement.nodeId)
        if (node) byLane.get(placement.lane).push(node)
      }
      const result = [...byLane.entries()].map(([name, nodes]) => ({ name, nodes })).sort((a, b) => {
        const leftOrder = LANE_ORDER.has(a.name) ? LANE_ORDER.get(a.name) : Number.MAX_SAFE_INTEGER
        const rightOrder = LANE_ORDER.has(b.name) ? LANE_ORDER.get(b.name) : Number.MAX_SAFE_INTEGER
        return leftOrder - rightOrder || b.nodes.length - a.nodes.length || a.name.localeCompare(b.name, 'zh-CN')
      })
      this._laneCache.set(stageId, result)
      return result
    }

    stageSummary(stageId) {
      const nodes = this.nodesInStage(stageId)
      const companyIds = new Set()
      const indicatorIds = new Set()
      nodes.forEach(node => {
        node.companyRefs.forEach(ref => companyIds.add(ref.companyId))
        node.indicatorRefs.forEach(id => indicatorIds.add(id))
      })
      const representatives = [...nodes].sort((a, b) => Number(b.important) - Number(a.important) || a.depth - b.depth || a.name.localeCompare(b.name, 'zh-CN')).slice(0, 4)
      return { nodes: nodes.length, companies: companyIds.size, indicators: indicatorIds.size, representatives }
    }

    rootsFor(stageId, lane) {
      const nodes = this.lanes(stageId).find(item => item.name === lane)?.nodes || []
      const ids = new Set(nodes.map(node => node.id))
      return nodes.filter(node => !node.parentId || !ids.has(node.parentId))
    }

    initialFocus(stageId) {
      const pool = stageId ? this.nodesInStage(stageId) : this.nodes
      return pool.find(node => node.important && this.edgesFor(node.id).length) || pool.find(node => this.edgesFor(node.id).length) || null
    }

    localPath(focusedNodeId) {
      const firstHop = this.edgesFor(focusedNodeId)
      const firstIds = new Set([focusedNodeId])
      firstHop.forEach(edge => { firstIds.add(edge.source); firstIds.add(edge.target) })
      const secondHop = []
      firstIds.forEach(nodeId => secondHop.push(...this.edgesFor(nodeId)))
      const edges = [...new Map([...firstHop, ...secondHop].map(edge => [edge.id, edge])).values()].slice(0, 24)
      const nodeIds = new Set([focusedNodeId])
      edges.forEach(edge => { nodeIds.add(edge.source); nodeIds.add(edge.target) })
      return {
        focusedNodeId,
        nodes: [...nodeIds].map(id => this.node(id)).filter(Boolean),
        edges,
        animatedEdgeIds: firstHop.slice(0, 8).map(edge => edge.id)
      }
    }

    relatedIndicatorsForCompany(companyId) {
      const company = this.company(companyId)
      if (!company) return []
      const ids = new Set()
      company.nodeRefs.forEach(ref => this.node(ref.nodeId)?.indicatorRefs.forEach(id => ids.add(id)))
      return [...ids].map(id => this.indicator(id)).filter(Boolean)
    }

    stageIdsForCompany(company) {
      return unique(company.nodeRefs.map(ref => this.placement(ref.nodeId)?.stageId).filter(Boolean))
    }

    stageIdsForIndicator(indicator) {
      return unique(indicator.nodeIds.map(id => this.placement(id)?.stageId).filter(Boolean))
    }

    search(query) {
      const keyword = text(query).trim().toLocaleLowerCase('zh-CN')
      if (!keyword) return { chains: [], nodes: [], companies: [], indicators: [] }

      const chainTitle = text(this.meta?.title || this.meta?.graphName).trim()
      const graphName = text(this.meta?.graphName).trim()
      const chainLabel = chainTitle
        ? (chainTitle.endsWith('产业链') ? chainTitle : `${chainTitle}产业链`)
        : graphName
      const chainHaystack = `${this.meta?.key || ''} ${chainTitle} ${graphName} ${chainLabel}`.toLocaleLowerCase('zh-CN')
      const chains = chainTitle && chainHaystack.includes(keyword)
        ? [{
            key: text(this.meta?.key),
            title: chainTitle,
            label: chainLabel,
            graphName,
            counts: this.meta?.counts || {}
          }]
        : []

      return {
        chains,
        nodes: this.nodes.filter(node => `${node.name} ${node.lane} ${node.region}`.toLocaleLowerCase('zh-CN').includes(keyword)).slice(0, 30),
        companies: this.companies.filter(company => `${company.name} ${company.code} ${company.role}`.toLocaleLowerCase('zh-CN').includes(keyword)).slice(0, 30),
        indicators: this.indicators.filter(indicator => `${indicator.name} ${indicator.unit} ${indicator.frequency}`.toLocaleLowerCase('zh-CN').includes(keyword)).slice(0, 30)
      }
    }

    async loadSeries(indicator) {
      if (!indicator?.seriesPath) return []
      if (this.seriesCache.has(indicator.id)) return this.seriesCache.get(indicator.id)
      const response = await fetch(indicator.seriesPath, { cache: 'no-store' })
      if (!response.ok) throw new Error(`指标序列加载失败（HTTP ${response.status}）`)
      const data = await response.json()
      if (!Array.isArray(data) || data.some(point => !point || typeof point.period !== 'string' || !Number.isFinite(Number(point.value)))) {
        throw new Error('指标序列格式异常')
      }
      const series = data.map(point => ({ period: point.period, value: Number(point.value) }))
      this.seriesCache.set(indicator.id, series)
      return series
    }
  }

  async function loadWorkbenchData(url = 'data/robot.json') {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`数据加载失败（HTTP ${response.status}）`)
    let data
    try {
      data = await response.json()
    } catch (error) {
      throw new Error(`JSON 解析失败：${error.message}`)
    }
    return new WorkbenchStore(data)
  }

  window.COMPLIANCE = COMPLIANCE
  window.WorkbenchStore = WorkbenchStore
  window.loadWorkbenchData = loadWorkbenchData
})()

