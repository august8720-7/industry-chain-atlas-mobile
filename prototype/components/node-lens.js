(function () {
  'use strict'

  const arr = value => Array.isArray(value) ? value : []
  const importanceRank = value => ({ '非常重要': 0, '核心': 0, '重要': 1, '一般': 2 }[value] ?? 3)
  const edgeOrder = edge => Number.isFinite(Number(edge?.order)) ? Number(edge.order) : Number.MAX_SAFE_INTEGER

  function eligibleEdge(edge, store) {
    if (!edge || !store?.node(edge.source) || !store?.node(edge.target)) return false
    if (edge.source === edge.target || !String(edge.relation || '').trim()) return false
    if (edge.relation === '包含' || edge.type === 'derived') return false
    if (edge.type === 'path' && !arr(edge.pathIds).length) return false
    return edge.type === 'path' || edge.type === 'direct'
  }

  function toEntry(store, centerNodeId, edge, side) {
    const endpointId = side === 'predecessor' ? edge.source : edge.target
    const node = store.node(endpointId)
    if (!node) return null
    return {
      id: endpointId,
      node,
      edge,
      side,
      placement: store.placement(endpointId),
      parent: store.parent(endpointId)
    }
  }

  function sortEntries(entries) {
    return [...entries].sort((a, b) =>
      importanceRank(a.node.importanceLevel) - importanceRank(b.node.importanceLevel) ||
      Number(b.edge.importance === 'main') - Number(a.edge.importance === 'main') ||
      Number(Boolean(b.node.companyRefs?.length && b.node.indicatorRefs?.length)) - Number(Boolean(a.node.companyRefs?.length && a.node.indicatorRefs?.length)) ||
      edgeOrder(a.edge) - edgeOrder(b.edge) ||
      a.node.name.localeCompare(b.node.name, 'zh-CN')
    )
  }

  function relationSides(store, centerNodeId) {
    const incoming = typeof store.incomingFor === 'function'
      ? store.incomingFor(centerNodeId)
      : store.edgesFor(centerNodeId).filter(edge => edge.target === centerNodeId)
    const outgoing = typeof store.outgoingFor === 'function'
      ? store.outgoingFor(centerNodeId)
      : store.edgesFor(centerNodeId).filter(edge => edge.source === centerNodeId)

    return {
      predecessor: sortEntries(incoming.filter(edge => eligibleEdge(edge, store)).map(edge => toEntry(store, centerNodeId, edge, 'predecessor')).filter(Boolean)),
      successor: sortEntries(outgoing.filter(edge => eligibleEdge(edge, store)).map(edge => toEntry(store, centerNodeId, edge, 'successor')).filter(Boolean))
    }
  }

  function buildGroups(entries) {
    const parentCounts = new Map()
    entries.forEach(entry => {
      if (!entry.parent?.id) return
      const parentKey = entry.edge.type + ':' + entry.edge.relation + ':parent:' + entry.parent.id
      parentCounts.set(parentKey, (parentCounts.get(parentKey) || 0) + 1)
    })

    const groups = new Map()
    entries.forEach(entry => {
      const parentKey = entry.parent?.id ? entry.edge.type + ':' + entry.edge.relation + ':parent:' + entry.parent.id : ''
      const useParent = parentKey && parentCounts.get(parentKey) >= 2
      const key = useParent ? parentKey : entry.edge.type + ':relation:' + entry.edge.relation
      const label = useParent ? entry.parent.name : entry.edge.relation
      if (!groups.has(key)) groups.set(key, { key, label, basis: useParent ? 'parent' : 'relation', items: [] })
      groups.get(key).items.push(entry)
    })

    return [...groups.values()]
      .map(group => ({ ...group, items: sortEntries(group.items) }))
      .sort((a, b) =>
        importanceRank(a.items[0]?.node.importanceLevel) - importanceRank(b.items[0]?.node.importanceLevel) ||
        b.items.length - a.items.length ||
        a.label.localeCompare(b.label, 'zh-CN')
      )
  }

  function projectionForEntries(entries, side) {
    const edgeTypes = new Set(entries.map(entry => entry.edge.type))
    const relationType = edgeTypes.size === 1 ? [...edgeTypes][0] : (edgeTypes.size ? 'mixed' : 'path')
    const label = relationType === 'direct'
      ? (side === 'predecessor' ? '直接前序' : '直接后序')
      : relationType === 'path'
        ? (side === 'predecessor' ? '路径前序' : '路径后序')
        : (side === 'predecessor' ? '已记录前序' : '已记录后序')

    if (entries.length <= 6) return { mode: 'nodes', source: 'self', label, relationType, total: entries.length, items: entries, groups: [], allGroups: [], restCount: 0 }

    const groups = buildGroups(entries)
    const previewCount = entries.length <= 20 ? 2 : 1
    const maxGroups = entries.length > 50 ? 3 : 4
    const visibleGroups = groups.slice(0, maxGroups)
    const restCount = groups.slice(maxGroups).reduce((sum, group) => sum + group.items.length, 0)

    return {
      mode: 'groups',
      source: 'self',
      label,
      relationType,
      total: entries.length,
      items: entries,
      groups: visibleGroups.map(group => ({ ...group, preview: group.items.slice(0, previewCount) })),
      allGroups: groups,
      restCount
    }
  }

  function projectSides(store, centerNodeId) {
    const cache = store?.lensProjectionCache
    if (cache?.has(centerNodeId)) return cache.get(centerNodeId)
    const sides = relationSides(store, centerNodeId)
    const projection = {
      predecessor: projectionForEntries(sides.predecessor, 'predecessor'),
      successor: projectionForEntries(sides.successor, 'successor')
    }
    cache?.set(centerNodeId, projection)
    return projection
  }

  function projectSide(store, centerNodeId, side) {
    return projectSides(store, centerNodeId)[side]
  }
  function childProjectionLabel(edgeTypes, side) {
    const type = edgeTypes.size === 1 ? [...edgeTypes][0] : (edgeTypes.size ? 'mixed' : 'path')
    if (type === 'direct') return side === 'predecessor' ? '子节点直接前序' : '子节点直接后序'
    if (type === 'path') return side === 'predecessor' ? '子节点路径前序' : '子节点路径后序'
    return side === 'predecessor' ? '子节点已记录前序' : '子节点已记录后序'
  }

  function projectChildSides(store, centerNodeId) {
    const cache = store?.lensProjectionCache
    const cacheKey = 'children:' + centerNodeId
    if (cache?.has(cacheKey)) return cache.get(cacheKey)
    const children = store.children(centerNodeId)
    const childIds = new Set(children.map(node => node.id))
    const build = side => {
      const groups = children.map(child => {
        const parentRelation = store.parentRelation?.(centerNodeId, child.id)
        const parentPathIds = new Set(arr(parentRelation?.pathIds))
        const edges = (side === 'predecessor' ? store.incomingFor(child.id) : store.outgoingFor(child.id))
          .filter(edge => eligibleEdge(edge, store))
          .map(edge => {
            if (edge.type !== 'path') return edge
            const scopedPathIds = arr(edge.pathIds).filter(pathId => parentPathIds.has(pathId))
            return scopedPathIds.length ? { ...edge, pathIds: scopedPathIds } : null
          })
          .filter(Boolean)
          .filter(edge => {
            const endpointId = side === 'predecessor' ? edge.source : edge.target
            return endpointId !== centerNodeId && !childIds.has(endpointId)
          })
        const items = sortEntries(edges.map(edge => ({ ...toEntry(store, child.id, edge, side), viaNode: child })).filter(Boolean))
        return {
          key: 'child:' + child.id,
          label: child.name,
          child,
          fromId: centerNodeId,
          items,
          preview: items.slice(0, 2)
        }
      }).filter(group => group.items.length)
        .sort((a, b) =>
          importanceRank(a.child.importanceLevel) - importanceRank(b.child.importanceLevel) ||
          b.items.length - a.items.length ||
          Number(Boolean(b.child.companyRefs?.length && b.child.indicatorRefs?.length)) - Number(Boolean(a.child.companyRefs?.length && a.child.indicatorRefs?.length)) ||
          a.child.name.localeCompare(b.child.name, 'zh-CN')
        )
      const items = groups.flatMap(group => group.items)
      const maxGroups = items.length > 50 ? 3 : 4
      const visibleGroups = groups.slice(0, maxGroups)
      const hiddenGroups = groups.slice(maxGroups)
      return {
        mode: 'child-groups',
        source: 'children',
        fromId: centerNodeId,
        label: childProjectionLabel(new Set(items.map(item => item.edge.type)), side),
        relationType: items.length ? (new Set(items.map(item => item.edge.type)).size === 1 ? items[0].edge.type : 'mixed') : 'path',
        total: items.length,
        items,
        groups: visibleGroups,
        allGroups: groups,
        restCount: hiddenGroups.reduce((sum, group) => sum + group.items.length, 0),
        restGroupCount: hiddenGroups.length
      }
    }
    const projection = { predecessor: build('predecessor'), successor: build('successor') }
    cache?.set(cacheKey, projection)
    return projection
  }

  function descendantCount(store, nodeId) {
    if (typeof store.descendantCount === 'function') return store.descendantCount(nodeId)
    const visited = new Set([nodeId])
    const queue = [...store.children(nodeId)]
    let count = 0
    while (queue.length) {
      const node = queue.shift()
      if (!node || visited.has(node.id)) continue
      visited.add(node.id)
      count += 1
      queue.push(...store.children(node.id))
    }
    return count
  }

  function hasVerifiedConnection(store, fromId, toId, kind = 'path', edgeId = '') {
    if (!fromId || !toId || fromId === toId) return false
    if (kind === 'containment') {
      return store.children(fromId).some(node => node.id === toId) || store.children(toId).some(node => node.id === fromId)
    }
    return store.edgesFor(fromId).some(edge =>
      eligibleEdge(edge, store) &&
      (!edgeId || edge.id === edgeId) &&
      (!['path', 'direct'].includes(kind) || edge.type === kind) &&
      ((edge.source === fromId && edge.target === toId) || (edge.source === toId && edge.target === fromId))
    )
  }

  window.NodeLens = Object.freeze({
    eligibleEdge,
    relationSides,
    buildGroups,
    projectSide,
    projectSides,
    projectChildSides,
    descendantCount,
    hasVerifiedConnection,
    importanceRank
  })
})()
