const asArray = value => Array.isArray(value) ? value : []
const clean = value => value == null ? '' : String(value).trim()

const LEGACY_STAGE_IDS = Object.freeze({
  upstream_2: 'U2',
  upstream_1: 'U1',
  midstream: 'M0',
  downstream_1: 'D1',
  downstream_2: 'D2'
})
const UPSTREAM_TITLES = Object.freeze({ 1: '直接供给', 2: '中间供给', 3: '基础供给', 4: '初级供给' })
const DOWNSTREAM_TITLES = Object.freeze({ 1: '直接应用', 2: '应用承接', 3: '应用拓展', 4: '应用深化' })

export function normalizeStageId(value) {
  const stageId = clean(value)
  return LEGACY_STAGE_IDS[stageId] || stageId
}

export function stageSortValue(value) {
  const stageId = normalizeStageId(value)
  if (stageId === 'M0') return 0
  if (/^U[1-9]\d*$/.test(stageId)) return -Number(stageId.slice(1))
  if (/^D[1-9]\d*$/.test(stageId)) return Number(stageId.slice(1))
  return Number.NaN
}

const isStageId = value => Number.isFinite(stageSortValue(value))

export function buildStages(stageIds, rawStages = []) {
  const ids = [...new Set(asArray(stageIds).map(normalizeStageId).filter(isStageId))]
    .sort((left, right) => stageSortValue(left) - stageSortValue(right))
  const maxU = Math.max(0, ...ids.filter(id => id.startsWith('U')).map(id => Number(id.slice(1))))
  const maxD = Math.max(0, ...ids.filter(id => id.startsWith('D')).map(id => Number(id.slice(1))))
  const displayTitles = new Map(asArray(rawStages)
    .map(stage => [normalizeStageId(stage?.id), clean(stage?.displayTitle)])
    .filter(([id, title]) => isStageId(id) && title))

  return ids.map((id, order) => {
    if (id === 'M0') {
      return {
        id,
        title: displayTitles.get(id) || '核心环节',
        description: '产业链核心商品、产品、材料、设备或可交易服务',
        order,
        tone: 'green',
        direction: 'midstream',
        depth: 0
      }
    }

    const upstream = id.startsWith('U')
    const depth = Number(id.slice(1))
    const outermost = upstream ? maxU : maxD
    const title = depth >= 5 && depth === outermost
      ? (upstream ? '源头供给' : '终端落地')
      : (upstream ? UPSTREAM_TITLES[depth] || `上游第 ${depth} 层` : DOWNSTREAM_TITLES[depth] || `下游第 ${depth} 层`)
    return {
      id,
      title: displayTitles.get(id) || title,
      description: upstream
        ? `距核心第 ${depth} 层上游；层内按原材料、生产设备、技术服务及运维关系分类`
        : `距核心第 ${depth} 层下游；层内按产品/业务与销售渠道分类`,
      order,
      tone: upstream ? (depth === 1 ? 'cyan' : 'blue') : (depth === 1 ? 'violet' : 'purple'),
      direction: upstream ? 'upstream' : 'downstream',
      depth
    }
  })
}

export const STAGES = Object.freeze(buildStages(['U2', 'U1', 'M0', 'D1', 'D2']))

const IMPORTANT_LEVELS = new Set(['非常重要', '重要', '核心'])
const LEVEL_RANK = new Map([['非常重要', 4], ['核心', 4], ['重要', 3], ['相关', 2], ['一般', 1]])

export function stableId(prefix, value) {
  let hash = 2166136261
  for (const ch of clean(value)) {
    hash ^= ch.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `${prefix}_${(hash >>> 0).toString(36)}`
}

export function parseFrequencyUnit(rawValue) {
  const value = clean(rawValue)
  if (!value) return { frequency: '', unit: '' }
  const parts = value.split(/\s*[·|]\s*/).filter(Boolean)
  const code = (parts[0] || '').toUpperCase()
  const labels = { D: '日', W: '周', M: '月', Q: '季', A: '年', Y: '年' }
  if (labels[code]) return { frequency: labels[code], unit: parts.slice(1).join(' · ') }
  return { frequency: parts.length > 1 ? parts[0] : '', unit: parts.length > 1 ? parts.slice(1).join(' · ') : parts[0] }
}

export function normalizeMarketCode(rawValue) {
  const value = clean(rawValue)
  if (!value) return { market: '', code: '' }
  const parts = value.split(/\s*·\s*/).filter(Boolean)
  if (parts.length === 1) return { market: '', code: parts[0] }
  return { market: parts.slice(0, -1).join(' · '), code: parts.at(-1) }
}

export function companyDedupeKey(company) {
  const { code } = normalizeMarketCode(company?.marketCode ?? company?.code)
  const name = clean(company?.stockName ?? company?.name)
  return code ? `code:${code.toUpperCase()}` : `name:${name}`
}

export function dedupeCompanies(rows) {
  const seen = new Map()
  for (const row of asArray(rows)) {
    const key = companyDedupeKey(row)
    if (key === 'name:' || seen.has(key)) continue
    seen.set(key, row)
  }
  return [...seen.values()]
}

function chooseStronger(current, candidate) {
  return (LEVEL_RANK.get(clean(candidate)) || 0) > (LEVEL_RANK.get(clean(current)) || 0) ? clean(candidate) : clean(current)
}

const isFormulaResidue = value => /^=/.test(clean(value))

function associationCompleteness(association) {
  return ['role', 'level', 'score', 'reason'].reduce((count, key) => {
    const value = association?.[key]
    return count + Number(value !== '' && value != null)
  }, 0)
}

function compareAssociation(left, right) {
  return (LEVEL_RANK.get(clean(left?.level)) || 0) - (LEVEL_RANK.get(clean(right?.level)) || 0) ||
    (Number.isFinite(left?.score) ? left.score : -1) - (Number.isFinite(right?.score) ? right.score : -1) ||
    Number(Boolean(left?.reason)) - Number(Boolean(right?.reason)) ||
    associationCompleteness(left) - associationCompleteness(right)
}

function mergeAssociation(current, candidate) {
  const preferred = compareAssociation(candidate, current) > 0 ? candidate : current
  const fallback = preferred === candidate ? current : candidate
  return {
    ...preferred,
    role: preferred.role || fallback.role,
    level: preferred.level || fallback.level,
    score: preferred.score ?? fallback.score,
    reason: preferred.reason || fallback.reason
  }
}

function normalizeSeries(series) {
  const byPeriod = new Map()
  for (const point of asArray(series)) {
    const period = clean(point?.period)
    const value = Number(point?.value)
    if (!period || !Number.isFinite(value)) continue
    byPeriod.set(period, { period, value })
  }
  return [...byPeriod.values()].sort((a, b) => a.period.localeCompare(b.period))
}

function makePathEvidence(rawPaths, idByName, stageContext) {
  const placements = new Map()
  const parents = new Map()
  const edges = new Map()
  const warnings = []

  for (const rawPath of asArray(rawPaths)) {
    const steps = asArray(rawPath?.steps)
    let lane = clean(rawPath?.topRelation)
    let previous = null

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index]
      const relation = clean(step?.relation)
      if (relation && relation !== '包含') lane = relation
      const nodeId = idByName.get(clean(step?.node))
      if (!nodeId) {
        warnings.push(`路径 ${clean(rawPath?.pathId)} 引用了未知节点：${clean(step?.node)}`)
        previous = null
        continue
      }

      const stageId = normalizeStageId(step?.stage)
      if (stageContext.stageOrder.has(stageId)) {
        placements.set(`${nodeId}|${stageId}|${lane}`, { nodeId, stageId, lane })
      } else {
        warnings.push(`节点 ${nodeId} 缺少有效阶段：${stageId || '(empty)'}`)
      }

      if (previous) {
        const pathId = clean(rawPath?.pathId)
        if (relation === '包含') {
          const key = `${previous.nodeId}|${nodeId}`
          const item = parents.get(key) || { parentId: previous.nodeId, childId: nodeId, pathIds: [] }
          if (pathId && !item.pathIds.includes(pathId)) item.pathIds.push(pathId)
          parents.set(key, item)
        } else if (relation) {
          const prevOrder = stageContext.stageOrder.get(previous.stageId)
          const nextOrder = stageContext.stageOrder.get(stageId)
          const forward = Number.isFinite(prevOrder) && Number.isFinite(nextOrder)
            ? prevOrder <= nextOrder
            : true
          const source = forward ? previous.nodeId : nodeId
          const target = forward ? nodeId : previous.nodeId
          const key = `${source}|${target}|${relation}`
          const explicitType = clean(step?.edgeType ?? step?.type)
          const type = ['direct', 'path', 'derived'].includes(explicitType) ? explicitType : 'path'
          const item = edges.get(key) || {
            id: stableId('edge', key),
            source,
            target,
            pathIds: [],
            order: Math.min(Number(previous.stepIndex) || index, Number(step?.stepIndex) || index + 1),
            type,
            relation,
            importance: 'normal'
          }
          if (pathId && !item.pathIds.includes(pathId)) item.pathIds.push(pathId)
          if (type === 'direct') item.type = 'direct'
          edges.set(key, item)
        }
      }

      previous = { nodeId, stageId, stepIndex: step?.stepIndex }
    }
  }

  return {
    placements: [...placements.values()],
    parentRelations: [...parents.values()],
    edges: [...edges.values()],
    warnings
  }
}

function normalizePathIds(value) {
  return [...new Set(asArray(value).map(clean).filter(Boolean))]
}

function makeDirectEvidence(raw, nodeIds, stageContext) {
  const placements = new Map()
  const parents = new Map()
  const edges = new Map()
  const warnings = []

  if (Array.isArray(raw.placements)) {
    for (const row of raw.placements) {
      const nodeId = clean(row?.nodeId)
      const stageId = normalizeStageId(row?.stageId)
      const lane = clean(row?.lane)
      if (!nodeIds.has(nodeId)) {
        warnings.push(`placement 引用了未知节点：${nodeId || '(empty)'}`)
        continue
      }
      if (!stageContext.stageOrder.has(stageId)) {
        warnings.push(`节点 ${nodeId} 的 placement 阶段无效：${stageId || '(empty)'}`)
        continue
      }
      placements.set(`${nodeId}|${stageId}|${lane}`, { nodeId, stageId, lane })
    }
  }

  if (Array.isArray(raw.parentRelations)) {
    for (const row of raw.parentRelations) {
      const parentId = clean(row?.parentId)
      const childId = clean(row?.childId)
      if (!nodeIds.has(parentId) || !nodeIds.has(childId)) {
        warnings.push(`parentRelation 引用了未知节点：${parentId || '(empty)'} -> ${childId || '(empty)'}`)
        continue
      }
      if (parentId === childId) {
        warnings.push(`parentRelation 不允许自关联：${parentId}`)
        continue
      }
      const key = `${parentId}|${childId}`
      const item = parents.get(key) || { parentId, childId, pathIds: [] }
      for (const pathId of normalizePathIds(row?.pathIds)) if (!item.pathIds.includes(pathId)) item.pathIds.push(pathId)
      parents.set(key, item)
    }
  }

  if (Array.isArray(raw.edges)) {
    for (const row of raw.edges) {
      const source = clean(row?.source)
      const target = clean(row?.target)
      const relation = clean(row?.relation)
      if (!nodeIds.has(source) || !nodeIds.has(target)) {
        warnings.push(`edge 引用了未知节点：${source || '(empty)'} -> ${target || '(empty)'}`)
        continue
      }
      if (source === target) {
        warnings.push(`edge 不允许自关联：${source}`)
        continue
      }
      if (!relation) {
        warnings.push(`edge ${clean(row?.id) || `${source} -> ${target}`} 缺少可确认的 relation`)
        continue
      }

      const key = `${source}|${target}|${relation}`
      const explicitType = clean(row?.type)
      if (explicitType && !['direct', 'path', 'derived'].includes(explicitType)) {
        warnings.push(`edge ${clean(row?.id) || key} 的 type 无效：${explicitType}`)
      }
      const type = ['direct', 'path', 'derived'].includes(explicitType) ? explicitType : 'path'
      const numericOrder = row?.order == null || row.order === '' ? 0 : Number(row.order)
      const item = edges.get(key) || {
        id: clean(row?.id) || stableId('edge', key),
        source,
        target,
        pathIds: [],
        order: Number.isFinite(numericOrder) ? numericOrder : 0,
        type,
        relation,
        importance: clean(row?.importance) === 'main' ? 'main' : 'normal'
      }
      for (const pathId of normalizePathIds(row?.pathIds)) if (!item.pathIds.includes(pathId)) item.pathIds.push(pathId)
      edges.set(key, item)
    }
  }

  return {
    placements: [...placements.values()],
    parentRelations: [...parents.values()],
    edges: [...edges.values()],
    warnings
  }
}

function normalizeFlatNodeInput(raw) {
  const warnings = []
  const sourceNodes = asArray(raw.nodes)
  const nameCounts = new Map()
  for (const node of sourceNodes) {
    const name = clean(node?.name)
    if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
  }

  let ambiguousIndicatorGroups = 0
  let ambiguousIndicatorRows = 0
  for (const node of sourceNodes) {
    const fallbackCounts = new Map()
    for (const indicator of asArray(node?.indicators)) {
      if (clean(indicator?.indicatorId)) continue
      const name = clean(indicator?.indicatorName ?? indicator?.name)
      if (!name) continue
      const { frequency, unit } = parseFrequencyUnit(indicator?.freqUnit ?? indicator?.unit)
      const key = `${name}|${frequency}|${unit}`
      fallbackCounts.set(key, (fallbackCounts.get(key) || 0) + 1)
    }
    for (const count of fallbackCounts.values()) {
      if (count < 2) continue
      ambiguousIndicatorGroups += 1
      ambiguousIndicatorRows += count
    }
  }
  if (ambiguousIndicatorGroups) {
    warnings.push(`扁平样例中 ${ambiguousIndicatorGroups} 组同节点指标缺少 indicatorId（共 ${ambiguousIndicatorRows} 条），仅按名称、频率与单位合并`)
  }

  const mappingByName = {}
  const idByName = new Map()
  const usedIds = new Set()
  for (const node of sourceNodes) {
    const name = clean(node?.name)
    if (!name) {
      warnings.push('扁平节点缺少 name，已省略')
      continue
    }
    if (nameCounts.get(name) !== 1) {
      warnings.push(`扁平节点名称不唯一，无法安全映射：${name}`)
      continue
    }
    const id = clean(node?.id) || stableId('node', name)
    if (usedIds.has(id)) {
      warnings.push(`扁平节点 id 不唯一，无法安全映射：${id}`)
      continue
    }
    usedIds.add(id)
    idByName.set(name, id)
    mappingByName[name] = {
      nodeId: id,
      nodeName: name,
      laneLevelName: clean(node?.region),
      topRelation: clean(node?.lane),
      level: Number(node?.depth) || 0,
      importanceLevel: node?.important === true ? '重要' : '一般',
      importanceReason: '',
      companies: asArray(node?.companies).map(company => ({
        stockName: clean(company?.stockName ?? company?.name),
        marketCode: clean(company?.marketCode ?? company?.code),
        businessRole: clean(company?.businessRole ?? company?.role),
        matchLevel: clean(company?.matchLevel ?? company?.level),
        semanticScore: company?.semanticScore ?? company?.score,
        reason: clean(company?.reason ?? company?.evidenceSummary),
        updatedAt: clean(company?.updatedAt)
      })),
      indicators: asArray(node?.indicators).map(indicator => ({
        indicatorId: clean(indicator?.indicatorId),
        indicatorName: clean(indicator?.indicatorName ?? indicator?.name),
        latestValue: indicator?.latestValue ?? indicator?.latest ?? null,
        latestPeriod: clean(indicator?.latestPeriod ?? indicator?.period),
        freqUnit: clean(indicator?.freqUnit ?? indicator?.unit),
        trendSummary: clean(indicator?.trendSummary ?? indicator?.trend),
        dataSource: clean(indicator?.dataSource ?? indicator?.source),
        updatedAt: clean(indicator?.updatedAt),
        chartSeries: asArray(indicator?.chartSeries ?? indicator?.series).map(point => ({
          period: clean(point?.period ?? point?.date),
          value: point?.value
        }))
      }))
    }
  }

  const stageIdsByLane = new Map()
  for (const stage of asArray(raw.stages)) {
    const stageId = normalizeStageId(stage?.id)
    if (!isStageId(stageId)) continue
    for (const lane of asArray(stage?.lanes).map(clean).filter(Boolean)) {
      if (!stageIdsByLane.has(lane)) stageIdsByLane.set(lane, new Set())
      stageIdsByLane.get(lane).add(stageId)
    }
  }

  const placements = []
  let unresolvedPlacements = 0
  if (!Array.isArray(raw.placements)) {
    for (const node of sourceNodes) {
      const name = clean(node?.name)
      const nodeId = idByName.get(name)
      if (!nodeId) continue
      const explicitStageId = normalizeStageId(node?.stageId)
      const lane = clean(node?.lane)
      let stageId = ''
      if (explicitStageId) {
        if (isStageId(explicitStageId)) stageId = explicitStageId
      } else {
        const candidates = [...(stageIdsByLane.get(lane) || [])]
        if (candidates.length === 1) stageId = candidates[0]
      }
      if (!stageId) {
        unresolvedPlacements += 1
        continue
      }
      placements.push({ nodeId, stageId, lane })
    }
    if (unresolvedPlacements) {
      warnings.push(`扁平样例中 ${unresolvedPlacements} 个节点缺少可唯一确认的 stageId，未生成 placement`)
    }
  }

  const parentRelations = []
  let omittedPathLinks = 0
  if (!Array.isArray(raw.parentRelations)) {
    for (const node of sourceNodes) {
      const childId = idByName.get(clean(node?.name))
      const parentName = clean(node?.parent)
      if (!childId || !parentName) continue
      if (clean(node?.lane) !== '包含') {
        omittedPathLinks += 1
        continue
      }
      const parentId = idByName.get(parentName)
      if (!parentId) {
        warnings.push(`扁平节点 ${clean(node?.name)} 引用了无法唯一确认的 parent：${parentName}`)
        continue
      }
      parentRelations.push({ parentId, childId, pathIds: [] })
    }
  }

  const normalized = {
    ...raw,
    key: clean(raw.key) || clean(raw.chain),
    title: clean(raw.title) || clean(raw.chain),
    summary: {
      ...(raw?.summary && typeof raw.summary === 'object' && !Array.isArray(raw.summary) ? raw.summary : {}),
      graphName: clean(raw?.summary?.graphName) || clean(raw.chain) || clean(raw.title)
    },
    nodeMappings: { byName: mappingByName },
    placements: Array.isArray(raw.placements) ? raw.placements : placements,
    parentRelations: Array.isArray(raw.parentRelations) ? raw.parentRelations : parentRelations
  }

  if (Array.isArray(raw.edges)) {
    normalized.edges = raw.edges
  } else if (!Array.isArray(raw.rawPaths)) {
    normalized.edges = []
    if (omittedPathLinks) {
      warnings.push(`扁平样例中 ${omittedPathLinks} 个非包含 parent 缺少可确认的阶段与方向，未生成 edge`)
    }
  }

  const provenance = {
    placements: Array.isArray(raw.placements) ? 'placements' : 'flat nodes.stageId or unique stages[].lanes membership',
    parentRelations: Array.isArray(raw.parentRelations) ? 'parentRelations' : 'flat nodes.parent only where lane is 包含',
    pathEdges: Array.isArray(raw.edges)
      ? 'edges'
      : (Array.isArray(raw.rawPaths) ? 'adjacent rawPath steps where next relation is not 包含' : 'not provided; omitted')
  }
  return { raw: normalized, warnings, provenance }
}

function normalizeIndustryInput(raw) {
  if (Array.isArray(raw?.nodes) && !raw?.nodeMappings?.byName) return normalizeFlatNodeInput(raw)
  return { raw, warnings: [], provenance: null }
}

function makeStageContext(raw) {
  const stageIds = new Set()
  for (const stage of asArray(raw?.stages)) {
    const stageId = normalizeStageId(stage?.id)
    if (isStageId(stageId)) stageIds.add(stageId)
  }
  for (const placement of asArray(raw?.placements)) {
    const stageId = normalizeStageId(placement?.stageId)
    if (isStageId(stageId)) stageIds.add(stageId)
  }
  for (const rawPath of asArray(raw?.rawPaths)) {
    for (const step of asArray(rawPath?.steps)) {
      const stageId = normalizeStageId(step?.stage)
      if (isStageId(stageId)) stageIds.add(stageId)
    }
  }
  if (!stageIds.size) STAGES.forEach(stage => stageIds.add(stage.id))
  if (!stageIds.has('M0')) throw new TypeError('动态阶段缺少核心层 M0')
  const stages = buildStages([...stageIds], raw?.stages)
  return { stages, stageOrder: new Map(stages.map(stage => [stage.id, stage.order])) }
}

export function adaptIndustryData(raw) {
  if (!raw || typeof raw !== 'object') throw new TypeError('产业链 JSON 根节点必须是对象')
  const normalizedInput = normalizeIndustryInput(raw)
  raw = normalizedInput.raw
  const byName = raw?.nodeMappings?.byName
  if (!byName || typeof byName !== 'object' || Array.isArray(byName)) throw new TypeError('缺少 nodeMappings.byName')
  const mappingEntries = Object.entries(byName)
  const stageContext = makeStageContext(raw)
  const idByName = new Map(mappingEntries.map(([name, mapping]) => [name, clean(mapping?.nodeId) || stableId('node', name)]))
  const mappedNodeIds = new Set(idByName.values())
  const directFields = {
    placements: Array.isArray(raw.placements),
    parentRelations: Array.isArray(raw.parentRelations),
    edges: Array.isArray(raw.edges)
  }
  const needsPathEvidence = Object.values(directFields).some(present => !present)
  if (needsPathEvidence && !Array.isArray(raw.rawPaths)) {
    throw new TypeError('缺少 rawPaths，且未提供完整的 placements、edges、parentRelations')
  }
  const pathEvidence = needsPathEvidence
    ? makePathEvidence(raw.rawPaths, idByName, stageContext)
    : { placements: [], parentRelations: [], edges: [], warnings: [] }
  const directEvidence = makeDirectEvidence(raw, mappedNodeIds, stageContext)
  const evidence = {
    placements: directFields.placements ? directEvidence.placements : pathEvidence.placements,
    parentRelations: directFields.parentRelations ? directEvidence.parentRelations : pathEvidence.parentRelations,
    edges: directFields.edges ? directEvidence.edges : pathEvidence.edges,
    warnings: [...normalizedInput.warnings, ...pathEvidence.warnings, ...directEvidence.warnings]
  }
  const placementByNode = new Map()
  for (const placement of evidence.placements) if (!placementByNode.has(placement.nodeId)) placementByNode.set(placement.nodeId, placement)

  const parentByChild = new Map()
  for (const relation of evidence.parentRelations) {
    const existing = parentByChild.get(relation.childId)
    if (existing && existing !== relation.parentId) evidence.warnings.push(`节点 ${relation.childId} 存在多个父节点：${existing}, ${relation.parentId}`)
    if (!existing) parentByChild.set(relation.childId, relation.parentId)
  }

  const companies = new Map()
  const indicators = new Map()
  const nodes = []
  const sanitization = {
    formulaReasonsCleared: 0,
    duplicateCompanyRefsMerged: 0
  }

  for (const [name, mapping] of mappingEntries) {
    const id = idByName.get(name)
    const placement = placementByNode.get(id)
    const companyRefsById = new Map()
    const companyMetaById = new Map()
    const indicatorRefs = []

    for (const row of asArray(mapping?.companies)) {
      const companyName = clean(row?.stockName)
      if (!companyName) continue
      const { market, code } = normalizeMarketCode(row?.marketCode)
      const dedupeKey = code ? `code:${code.toUpperCase()}` : `name:${companyName}`
      const companyId = stableId('company', dedupeKey)
      const rawReason = clean(row?.reason ?? row?.evidenceSummary)
      const reason = isFormulaResidue(rawReason) ? '' : rawReason
      if (rawReason && !reason) sanitization.formulaReasonsCleared += 1
      const association = {
        companyId,
        role: clean(row?.businessRole),
        level: clean(row?.matchLevel),
        score: Number.isFinite(Number(row?.semanticScore)) ? Number(row.semanticScore) : null,
        reason
      }

      const currentAssociation = companyRefsById.get(companyId)
      if (currentAssociation) {
        sanitization.duplicateCompanyRefsMerged += 1
        companyRefsById.set(companyId, mergeAssociation(currentAssociation, association))
      } else {
        companyRefsById.set(companyId, association)
        companyMetaById.set(companyId, { name: companyName, code, market })
      }
    }

    const companyRefs = [...companyRefsById.values()]
    for (const association of companyRefs) {
      const companyId = association.companyId
      const companyMeta = companyMetaById.get(companyId)
      const existing = companies.get(companyId) || {
        id: companyId,
        name: companyMeta.name,
        code: companyMeta.code,
        market: companyMeta.market,
        role: association.role,
        level: association.level,
        score: association.score,
        reason: association.reason,
        nodeRefs: []
      }
      existing.level = chooseStronger(existing.level, association.level)
      if ((association.score ?? -1) > (existing.score ?? -1)) {
        existing.score = association.score
        existing.role = association.role
        existing.reason = association.reason
      }
      if (!existing.nodeRefs.some(ref => ref.nodeId === id)) existing.nodeRefs.push({ nodeId: id, ...association, companyId: undefined })
      companies.set(companyId, existing)
    }

    for (const row of asArray(mapping?.indicators)) {
      const indicatorName = clean(row?.indicatorName)
      if (!indicatorName) continue
      const { frequency, unit } = parseFrequencyUnit(row?.freqUnit)
      const rawId = clean(row?.indicatorId) || `${indicatorName}|${frequency}|${unit}`
      const indicatorId = stableId('indicator', rawId)
      indicatorRefs.push(indicatorId)
      const series = normalizeSeries(row?.chartSeries)
      const existing = indicators.get(indicatorId) || {
        id: indicatorId,
        sourceId: clean(row?.indicatorId),
        name: indicatorName,
        latest: row?.latestValue ?? null,
        period: clean(row?.latestPeriod),
        unit,
        frequency,
        trend: clean(row?.trendSummary),
        source: clean(row?.dataSource),
        series,
        nodeIds: []
      }
      if (series.length > existing.series.length) existing.series = series
      if (clean(row?.latestPeriod).localeCompare(existing.period) > 0) {
        existing.latest = row?.latestValue ?? null
        existing.period = clean(row?.latestPeriod)
      }
      if (!existing.nodeIds.includes(id)) existing.nodeIds.push(id)
      indicators.set(indicatorId, existing)
    }

    nodes.push({
      id,
      name: clean(mapping?.nodeName) || name,
      region: clean(mapping?.laneLevelName),
      lane: placement?.lane || clean(mapping?.topRelation),
      depth: Number(mapping?.level) || 0,
      parentId: parentByChild.get(id) || null,
      important: IMPORTANT_LEVELS.has(clean(mapping?.importanceLevel)),
      importanceLevel: clean(mapping?.importanceLevel) || '一般',
      importanceReason: clean(mapping?.importanceReason),
      description: '',
      companyRefs,
      indicatorRefs: [...new Set(indicatorRefs)]
    })
  }

  const companyList = [...companies.values()].map(company => ({
    ...company,
    nodeRefs: company.nodeRefs.map(({ companyId: _ignored, ...ref }) => ref)
  })).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  const indicatorList = [...indicators.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  const nodeIds = new Set(nodes.map(node => node.id))
  const updatedAtCandidates = [
    ...mappingEntries.flatMap(([, mapping]) => asArray(mapping?.companies).map(row => clean(row?.updatedAt))),
    ...mappingEntries.flatMap(([, mapping]) => asArray(mapping?.indicators).map(row => clean(row?.updatedAt)))
  ].filter(Boolean).sort()

  return {
    schemaVersion: 'feiyan-mobile-workbench-v1',
    meta: {
      key: clean(raw.key) || 'robot',
      title: clean(raw.title) || '机器人',
      graphName: clean(raw?.summary?.graphName) || clean(raw.title),
      sourceSchemaVersion: clean(raw.schemaVersion),
      generatedAt: clean(raw?.summary?.generatedAt),
      dataAsOf: updatedAtCandidates.at(-1) || clean(raw?.summary?.generatedAt),
      counts: {
        nodes: nodes.length,
        placements: evidence.placements.length,
        parentRelations: evidence.parentRelations.length,
        pathEdges: evidence.edges.length,
        companies: companyList.length,
        indicators: indicatorList.length
      },
      warnings: evidence.warnings,
      sanitization,
      provenance: {
        placements: normalizedInput.provenance?.placements || (directFields.placements ? 'placements' : 'rawPaths.steps.stage + nearest non-containment relation'),
        parentRelations: normalizedInput.provenance?.parentRelations || (directFields.parentRelations ? 'parentRelations' : 'adjacent rawPath steps where next relation is 包含'),
        pathEdges: normalizedInput.provenance?.pathEdges || (directFields.edges ? 'edges' : 'adjacent rawPath steps where next relation is not 包含')
      }
    },
    stages: stageContext.stages,
    nodes,
    placements: evidence.placements,
    parentRelations: evidence.parentRelations,
    edges: evidence.edges,
    companies: companyList,
    indicators: indicatorList,
    sourceSummary: raw.summary || {}
  }
}

export function localPathSubgraph(data, focusedNodeId, maxAnimatedEdges = 8) {
  const allEdges = asArray(data?.edges)
  const firstHop = allEdges.filter(edge => edge.source === focusedNodeId || edge.target === focusedNodeId)
  const firstNodeIds = new Set([focusedNodeId])
  firstHop.forEach(edge => { firstNodeIds.add(edge.source); firstNodeIds.add(edge.target) })
  const secondHop = allEdges.filter(edge => firstNodeIds.has(edge.source) || firstNodeIds.has(edge.target))
  const edges = [...new Map([...firstHop, ...secondHop].map(edge => [edge.id, edge])).values()].slice(0, 24)
  const nodeIds = new Set([focusedNodeId])
  edges.forEach(edge => { nodeIds.add(edge.source); nodeIds.add(edge.target) })
  return {
    focusedNodeId,
    nodeIds: [...nodeIds],
    edges,
    animatedEdgeIds: firstHop.slice(0, maxAnimatedEdges).map(edge => edge.id)
  }
}
