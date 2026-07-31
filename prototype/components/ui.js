(function () {
  'use strict'

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
  const fmt = value => new Intl.NumberFormat('zh-CN').format(Number(value) || 0)
  const ICONS = {
    logo: '<svg viewBox="0 0 24 24"><path d="M5 4.5h14v4H9v3.2h7v4H9v3.8H5z" fill="currentColor" stroke="none"/><path d="M15 12.5l5 3.2-5 3.2z" fill="currentColor" stroke="none"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="M16 16l4.8 4.8"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    graph: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7 11l9.8-4M7 13l9.8 4"/></svg>',
    company: '<svg viewBox="0 0 24 24"><path d="M4 21V5h10v16M14 9h6v12M2 21h20"/><path d="M7 8h4M7 12h4M7 16h4"/></svg>',
    indicator: '<svg viewBox="0 0 24 24"><path d="M4 4v16h16"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M4 11a8 8 0 111.8 5"/><path d="M4 5v6h6"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>',
    cube: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M3 11.5L21 3l-7.5 18-2.3-7.2zM11.2 13.8L21 3"/></svg>',
    building: '<svg viewBox="0 0 24 24"><path d="M4 21V8l8-4v17M12 10l8-3v14M2 21h20"/><path d="M7 11h2M7 15h2M15 11h2M15 15h2"/></svg>',
    robot: '<svg viewBox="0 0 24 24"><path d="M5 19h14M8 19v-4l3-3 2 2 3-4"/><circle cx="8" cy="13" r="2"/><circle cx="16" cy="8" r="2"/><path d="M16 6V3M14 3h4"/></svg>',
    plane: '<svg viewBox="0 0 24 24"><path d="M3 13l18-9-7 17-3-7zM11 14l10-10"/></svg>',
    ai: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>',
    screen: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    lowaltitude: '<svg viewBox="0 0 24 24"><path d="M3 14h18M7 14l2-5h6l2 5M12 9V5M9 5h6"/><path d="M5 18h14"/></svg>',
    coin: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="7" ry="3.5"/><path d="M5 7v5c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5V7M5 12v5c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-5"/></svg>'
  }
  const STAGE_ICONS = { blue: 'cube', cyan: 'truck', green: 'gear', violet: 'send', purple: 'building' }

  function icon(name, className = '') {
    return `<span class="icon ${className}">${ICONS[name] || ''}</span>`
  }

  function stageIcon(stage) {
    return icon(STAGE_ICONS[stage?.tone] || 'cube', 'stage-icon')
  }

  function stageLabel(stage) {
    return stage ? [stage.id, stage.title].filter(Boolean).join(' ') : ''
  }

  function stageRibbon(stages, activeId) {
    return `<div class="stage-ribbon" role="tablist" aria-label="产业链动态层级">${stages.map(stage => `<button class="stage-step tone-${stage.tone} ${activeId === stage.id ? 'on' : ''}" data-stage="${stage.id}" role="tab" aria-selected="${activeId === stage.id}" title="${esc(stageLabel(stage))}"><b class="stage-code">${esc(stage.id)}</b><span class="stage-name">${esc(stage.title)}</span></button>`).join('')}</div>`
  }

  function viewModeSwitch(mode) {
    return `<div class="mode-switch" role="tablist"><button data-mode="structure" class="${mode === 'structure' ? 'on' : ''}">结构</button><button data-mode="path" class="${mode === 'path' ? 'on' : ''}">路径</button></div>`
  }

  function filterChips(items, active) {
    return `<div class="filter-chips">${items.map(item => `<button class="filter-chip ${active === item.value ? 'on' : ''}" data-filter="${esc(item.value)}">${esc(item.label)}</button>`).join('')}</div>`
  }

  function loadingSkeleton(rows = 5) {
    return `<div class="skeleton-wrap" aria-label="加载中"><div class="skeleton hero"></div>${Array.from({ length: rows }, (_, index) => `<div class="skeleton row" style="--delay:${index}"></div>`).join('')}</div>`
  }

  function emptyState(title, description, action = '') {
    return `<div class="empty-state">${icon('info')}<h3>${esc(title)}</h3><p>${esc(description)}</p>${action}</div>`
  }

  function avatar(name) {
    const colors = ['#2e6be8', '#0f9ca8', '#1ea568', '#6e5bd7', '#8f56c9', '#b76c26']
    const hash = [...String(name)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return `<span class="text-avatar" style="--avatar:${colors[hash % colors.length]}">${esc(String(name).slice(0, 1))}</span>`
  }

  function companyCard(company, store) {
    const nodeNames = company.nodeRefs.slice(0, 3).map(ref => store.node(ref.nodeId)?.name).filter(Boolean)
    const more = Math.max(0, company.nodeRefs.length - nodeNames.length)
    return `<article class="company-card" data-company-id="${company.id}" tabindex="0">
      ${avatar(company.name)}
      <div class="company-main"><div class="card-title">${esc(company.name)}</div><div class="card-sub">${esc([company.market, company.code].filter(Boolean).join(' · ') || '暂无市场代码')}</div>${company.role ? `<div class="company-role">${esc(company.role)}</div>` : ''}
        <div class="tag-row">${nodeNames.map(name => `<span class="soft-tag">${esc(name)}</span>`).join('')}${more ? `<span class="soft-tag">+${more}</span>` : ''}</div>
      </div>
      <div class="company-side"><span class="level-tag">${esc(company.level || '相关')}</span><small>${company.nodeRefs.length} 个关联节点</small>${icon('right')}</div>
    </article>`
  }

  function sparkline(series, color = '#2e6be8') {
    if (!Array.isArray(series) || series.length < 2) return '<div class="sparkline-empty">暂无趋势序列</div>'
    const values = series.map(point => Number(point.value)).filter(Number.isFinite)
    if (values.length < 2) return '<div class="sparkline-empty">暂无趋势序列</div>'
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1
    const points = values.map((value, index) => `${(index / (values.length - 1) * 100).toFixed(2)},${(34 - (value - min) / range * 28).toFixed(2)}`).join(' ')
    return `<svg class="sparkline" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`
  }

  function indicatorCard(indicator, store) {
    const nodes = indicator.nodeIds.slice(0, 2).map(id => store.node(id)?.name).filter(Boolean)
    return `<article class="indicator-card" data-indicator-id="${indicator.id}" tabindex="0">
      <div class="indicator-top"><div><div class="card-title clamp2">${esc(indicator.name)}</div><div class="card-sub">${esc([indicator.frequency, indicator.period].filter(Boolean).join(' · ') || '统计期缺失')}</div></div><span class="series-badge">${indicator.seriesCount ? `${fmt(indicator.seriesCount)} 期` : '无序列'}</span></div>
      <div class="indicator-value"><strong>${esc(indicator.latest ?? '—')}</strong><span>${esc(indicator.unit)}</span></div>
      <div class="indicator-trend">${esc(indicator.trend || '趋势摘要未提供')}</div>
      ${sparkline(indicator.seriesPreview)}
      <div class="indicator-foot"><div class="tag-row">${nodes.map(name => `<span class="soft-tag">${esc(name)}</span>`).join('')}</div>${icon('right')}</div>
    </article>`
  }

  function pathCanvas(store, focusedNodeId) {
    const subgraph = store.localPath(focusedNodeId)
    if (!subgraph.edges.length) {
      return {
        html: emptyState('暂无路径关系', '当前节点暂无可展示的前序／后序路径关系。'),
        focusX: 0,
        visibleEdgeIds: []
      }
    }
  
    const animated = new Set(subgraph.animatedEdgeIds)
    const directIds = new Set([focusedNodeId])
    store.edgesFor(focusedNodeId).forEach(edge => {
      directIds.add(edge.source)
      directIds.add(edge.target)
    })
  
    const byStage = new Map(store.stages.map(stage => [stage.id, []]))
    subgraph.nodes.forEach(node => {
      const stageId = store.placement(node.id)?.stageId
      if (byStage.has(stageId)) byStage.get(stageId).push(node)
    })
    for (const [stageId, nodes] of byStage) {
      nodes.sort((a, b) =>
        Number(b.id === focusedNodeId) - Number(a.id === focusedNodeId) ||
        Number(directIds.has(b.id)) - Number(directIds.has(a.id)) ||
        Number(b.important) - Number(a.important) ||
        a.name.localeCompare(b.name, 'zh-CN')
      )
      byStage.set(stageId, nodes.slice(0, 2))
    }
  
    const visibleIds = new Set([...byStage.values()].flat().map(node => node.id))
    const visibleEdges = subgraph.edges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target))
    const canvasWidth = Math.max(368, store.stages.length * 76)
    const stageWidth = canvasWidth / Math.max(store.stages.length, 1)
    const maxRows = Math.max(1, ...[...byStage.values()].map(nodes => nodes.length))
    const height = Math.max(166, 54 + maxRows * 56)
    const positions = new Map()
  
    store.stages.forEach((stage, stageIndex) => {
      ;(byStage.get(stage.id) || []).forEach((node, nodeIndex) => positions.set(node.id, {
        stageIndex,
        nodeIndex,
        x: stageIndex * stageWidth + stageWidth / 2,
        y: 39 + nodeIndex * 56 + 23
      }))
    })
  
    const incomingByTarget = new Map()
    const outgoingBySource = new Map()
    visibleEdges.forEach(edge => {
      if (!incomingByTarget.has(edge.target)) incomingByTarget.set(edge.target, [])
      if (!outgoingBySource.has(edge.source)) outgoingBySource.set(edge.source, [])
      incomingByTarget.get(edge.target).push(edge)
      outgoingBySource.get(edge.source).push(edge)
    })
    for (const edges of [...incomingByTarget.values(), ...outgoingBySource.values()]) {
      edges.sort((a, b) => a.id.localeCompare(b.id))
    }
  
    const portOffset = (groups, nodeId, edgeId, step = 8) => {
      const edges = groups.get(nodeId) || []
      const index = edges.findIndex(edge => edge.id === edgeId)
      if (index < 0 || edges.length < 2) return 0
      return (index - (edges.length - 1) / 2) * step
    }
  
    const defs = '<defs><marker id="path-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9aa8ba"/></marker><marker id="path-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2474e8"/></marker></defs>'
    const edgeSvg = visibleEdges.map(edge => {
      const source = positions.get(edge.source)
      const target = positions.get(edge.target)
      if (!source || !target) return ''
  
      let d
      if (source.stageIndex === target.stageIndex) {
        const direction = target.y >= source.y ? 1 : -1
        const sourceX = source.x + portOffset(outgoingBySource, edge.source, edge.id, 7)
        const targetX = target.x + portOffset(incomingByTarget, edge.target, edge.id, 7)
        d = `M${sourceX} ${source.y + direction * 22} C${sourceX + 18} ${source.y + direction * 32},${targetX + 18} ${target.y - direction * 32},${targetX} ${target.y - direction * 22}`
      } else {
        const direction = target.x >= source.x ? 1 : -1
        const x1 = source.x + direction * (stageWidth / 2 - 7)
        const x2 = target.x - direction * (stageWidth / 2 - 7)
        const sourceY = source.y + portOffset(outgoingBySource, edge.source, edge.id)
        const targetY = target.y + portOffset(incomingByTarget, edge.target, edge.id)
        const bend = Math.max(12, Math.abs(x2 - x1) * .48)
        d = `M${x1} ${sourceY} C${x1 + direction * bend} ${sourceY},${x2 - direction * bend} ${targetY},${x2} ${targetY}`
      }
  
      const active = animated.has(edge.id)
      return `<path class="path-edge ${active ? 'active' : ''}" marker-end="url(#${active ? 'path-arrow-active' : 'path-arrow'})" d="${d}"/>${active ? `<path class="path-edge-flow" d="${d}"/>` : ''}<path class="path-hit" d="${d}" data-edge-id="${edge.id}"/>${active ? `<circle class="flow-particle" r="2.6"><animateMotion dur=".32s" repeatCount="1" path="${d}"/></circle>` : ''}`
    }).join('')
  
    const stageWidthPercent = 100 / Math.max(store.stages.length, 1)
    const stageStyle = index => `--stage-left:${index * stageWidthPercent}%;--stage-width:${stageWidthPercent}%`
    const columns = store.stages.map((stage, index) => `<div class="path-stage-column tone-${stage.tone}" style="${stageStyle(index)}" aria-hidden="true"></div>`).join('')
    const labels = store.stages.map((stage, index) => `<div class="path-stage-label tone-${stage.tone}" style="${stageStyle(index)}">${esc(stageLabel(stage))}</div>`).join('')
    const nodesHtml = store.stages.map((stage, stageIndex) =>
      (byStage.get(stage.id) || []).map((node, nodeIndex) =>
        `<button class="path-node tone-${stage.tone} ${node.id === focusedNodeId ? 'focus' : ''}" data-path-node="${node.id}" style="${stageStyle(stageIndex)};top:${39 + nodeIndex * 56}px"><span>${esc(node.name)}</span>${node.id === focusedNodeId ? '<small>当前焦点</small>' : ''}</button>`
      ).join('')
    ).join('')
  
    return {
      html: `<div class="path-scroll"><div class="path-canvas" style="width:${canvasWidth}px;height:${height}px">${columns}${labels}<svg viewBox="0 0 ${canvasWidth} ${height}" preserveAspectRatio="none" aria-hidden="true">${defs}${edgeSvg}</svg>${nodesHtml}</div></div>`,
      focusX: (positions.get(focusedNodeId)?.stageIndex || 0) * 20,
      visibleEdgeIds: visibleEdges.map(edge => edge.id)
    }
  }

  let sheetCloseTimer = null

  function openSheet(content, options = {}) {
    const root = document.getElementById('overlay-root')
    if (sheetCloseTimer) {
      clearTimeout(sheetCloseTimer)
      sheetCloseTimer = null
    }
    const sheetClass = String(options.className || '').replace(/[^a-z0-9_-]+/gi, ' ')
    const ariaModal = options.modal === false ? 'false' : 'true'
    root.innerHTML = `<div class="sheet-mask" data-sheet-close></div><section class="sheet ${sheetClass}" role="dialog" aria-modal="${ariaModal}"><div class="sheet-grab"><i></i></div><button class="sheet-close" data-sheet-close aria-label="关闭">${icon('close')}</button><div class="sheet-body">${content}</div></section>`
    requestAnimationFrame(() => root.classList.add('show'))
    root.querySelectorAll('[data-sheet-close]').forEach(button => button.onclick = () => closeSheet(options.onClose))

    const sheet = root.querySelector('.sheet')
    const grab = root.querySelector('.sheet-grab')
    if (sheet && grab) {
      let dragStartY = 0
      let dragDistance = 0
      let dragging = false
      const finishDrag = event => {
        if (!dragging) return
        dragging = false
        try { grab.releasePointerCapture(event.pointerId) } catch (_error) {}
        sheet.style.transition = ''
        sheet.style.transform = ''
        if (dragDistance > 56) requestAnimationFrame(() => closeSheet(options.onClose))
      }
      grab.onpointerdown = event => {
        dragging = true
        dragStartY = event.clientY
        dragDistance = 0
        sheet.style.transition = 'none'
        try { grab.setPointerCapture(event.pointerId) } catch (_error) {}
      }
      grab.onpointermove = event => {
        if (!dragging) return
        dragDistance = Math.max(0, event.clientY - dragStartY)
        sheet.style.transform = `translateY(${dragDistance}px)`
      }
      grab.onpointerup = finishDrag
      grab.onpointercancel = finishDrag
    }
  }

  function closeSheet(onClose) {
    const root = document.getElementById('overlay-root')
    root.classList.remove('show')
    if (sheetCloseTimer) clearTimeout(sheetCloseTimer)
    sheetCloseTimer = setTimeout(() => {
      sheetCloseTimer = null
      root.innerHTML = ''
      if (typeof onClose === 'function') onClose()
    }, 220)
  }

  function toast(message) {
    const host = document.getElementById('toast-host')
    host.innerHTML = `<div class="toast">${esc(message)}</div>`
    setTimeout(() => { host.innerHTML = '' }, 1800)
  }

  window.UI = { esc, fmt, icon, stageIcon, stageLabel, stageRibbon, viewModeSwitch, filterChips, loadingSkeleton, emptyState, avatar, companyCard, indicatorCard, sparkline, pathCanvas, openSheet, closeSheet, toast }
})()






