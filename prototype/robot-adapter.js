// 机器人全量源数据 -> 现有页面数据契约。只解释源字段,不补造节点或关系。
window.buildRobotChainFromSource = source => {
  if (!source || !Array.isArray(source.nodes) || !source.nodes.length) return null

  const bandOfRegion = { 上游: 'upstream', 中游: 'midstream', 下游: 'downstream' }
  const stageBand = { upstream_2: 'upstream', upstream_1: 'upstream', midstream: 'midstream', downstream_1: 'downstream', downstream_2: 'downstream' }
  const stageOf = node => {
    if (node.region === '上游') return node.depth === 1 ? 'upstream_1' : 'upstream_2'
    if (node.region === '中游') return 'midstream'
    if (node.region === '下游') return node.lane === '下游销售渠道' ? 'downstream_2' : 'downstream_1'
    return 'midstream'
  }

  const idByName = new Map(source.nodes.map(node => [node.name, node.id]))
  const NODE = {}
  source.nodes.forEach(node => {
    const band = bandOfRegion[node.region] || 'midstream'
    NODE[node.id] = {
      name: node.name,
      band,
      stage: stageOf(node),
      region: node.region,
      lane: node.lane,
      depth: node.depth,
      parent: node.parent || null,
      parentId: node.parent ? idByName.get(node.parent) || null : null,
      important: !!node.important,
      importance: node.important ? '重点节点' : '一般节点',
      intro: `${node.name}位于${node.region}「${node.lane}」,是源数据第 ${node.depth} 层节点${node.parent ? `,父节点为「${node.parent}」` : ''}。`,
      alsoIn: [],
      companies: (node.companies || []).map(company => ({
        ...company,
        role: company.role || '角色未标注'
      })),
      indicators: (node.indicators || []).map(indicator => ({
        name: indicator.name,
        freq: '源文件未标注',
        source: source.source?.file || '机器人产业链源数据',
        unit: indicator.unit || '',
        latest: indicator.latest,
        latestDate: indicator.period || indicator.seriesEnd || '',
        trend: indicator.trend || '',
        series: (indicator.series || []).map(point => Number(point.value)).filter(Number.isFinite),
        seriesDates: (indicator.series || []).map(point => point.date),
        seriesPointCount: indicator.seriesPointCount || (indicator.series || []).length,
        seriesStart: indicator.seriesStart || indicator.series?.[0]?.date || null,
        seriesEnd: indicator.seriesEnd || indicator.series?.at(-1)?.date || null
      }))
    }
  })

  const contains = []
  const edges = []
  source.nodes.forEach(node => {
    if (!node.parent) return
    const parentId = idByName.get(node.parent)
    if (!parentId) return
    if (node.lane === '包含') contains.push([parentId, node.id])
    else if (node.region === '上游') edges.push([node.id, parentId])
    else edges.push([parentId, node.id])
  })

  const stages = source.stages?.length ? source.stages : [
    { id: 'upstream_2', title: '中间供给', region: '上游', lanes: ['上游原材料', '上游生产设备'] },
    { id: 'upstream_1', title: '直接供给', region: '上游', lanes: ['上游原材料', '上游生产设备', '上游技术服务', '上游运维设备'] },
    { id: 'midstream', title: '核心环节', region: '中游', lanes: ['中游'] },
    { id: 'downstream_1', title: '直接应用', region: '下游', lanes: ['下游产品/业务'] },
    { id: 'downstream_2', title: '应用承接', region: '下游', lanes: ['下游销售渠道'] }
  ]
  const bands = stages.map(stage => ({
    key: stage.id,
    band: stageBand[stage.id] || bandOfRegion[stage.region] || 'midstream',
    title: stage.title,
    subtitle: (stage.lanes || []).join(' / '),
    nodes: source.nodes
      .filter(node => node.lane !== '包含' && stageOf(node) === stage.id)
      .map(node => ({ id: node.id, name: node.name, companies: node.companies?.length || 0, indicators: node.indicators?.length || 0 }))
  }))

  return {
    intro: `机器人产业链全量源数据: ${bands.length} 个阶段、${source.nodeCount} 个节点,包含关系单独进入节点详情。`,
    bands,
    NODE,
    edges,
    contains,
    sourceInfo: source.source,
    counts: source.counts,
    adjNote: `节点、parent、lane 与 depth 均来自「${source.source?.file || '机器人产业链源数据'}」;方向连线仅由非“包含”的 parent + lane 推导,不代表直接供应、交易或一一对应关系。`
  }
}
