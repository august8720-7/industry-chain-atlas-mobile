// 指标页:指标库(按环节分组) + 指标详情(页内两态)
window.Page_indicator = {
  title: '指标',
  render(el, ctx) {
    if (!document.getElementById('pg-indicator-css')) {
      const s = document.createElement('style'); s.id = 'pg-indicator-css'
      s.textContent = `
      .pg-in-row { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px; cursor: pointer; }
      .pg-in-row .nm { font-size: 14px; font-weight: 600; color: var(--t1); }
      .pg-in-row .meta { font-size: 11px; color: var(--t3); margin-top: 3px; }
      .pg-in-row .val { text-align: right; flex: none; }
      .pg-in-row .val b { font-size: 16px; color: var(--t1); font-variant-numeric: tabular-nums; }
      .pg-in-row .val .d { font-size: 11px; color: var(--t3); }
      .pg-in-group-hd { display: flex; align-items: center; gap: 7px; margin: 18px 0 8px; }
      .pg-in-group-hd .t { font-size: 15px; font-weight: 700; color: var(--t1); flex: 1; }
      .pg-in-banner { background: var(--warn-soft); color: var(--warn); font-size: 12px; line-height: 1.6; border-radius: var(--r-sm); padding: 9px 12px; margin-bottom: 12px; }
      .pg-in-big { background: var(--card); border-radius: var(--r-lg); box-shadow: var(--shadow-card); padding: 16px; }
      .pg-in-big .nm { font-size: 17px; font-weight: 700; color: var(--t1); }
      .pg-in-big .v { font-size: 28px; font-weight: 700; color: var(--t1); font-variant-numeric: tabular-nums; }
      .pg-in-kv { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
      .pg-in-kv:last-child { border-bottom: 0; }
      .pg-in-kv .k { color: var(--t3); }
      .pg-in-kv .v2 { color: var(--t1); font-weight: 500; }
      .pg-in-rel { display: flex; gap: 8px; flex-wrap: wrap; }
      .pg-in-rel .chip { cursor: pointer; }
      `
      document.head.appendChild(s)
    }

    const M = window.MOCK
    const chain = M.chains.find(c => c.key === M.currentChainKey) || M.chains[0]
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
    const refreshLabel = { updated: '本轮已更新', unchanged: '已检查无变化', no_new_value: '已检查无新值' }
    const refreshBadge = status => status ? `<span class="badge badge-level-weak">${refreshLabel[status] || status}</span>` : ''

    function renderList() {
      const groups = M.indicatorGroups
      el.innerHTML = `<div class="page-pad">
        <div style="margin-top:8px">
          <div style="font-size:15px;font-weight:700;color:var(--t1)">${chain.title}产业链</div>
          <div class="fs12 t3" style="margin-top:3px">按全部关联节点分组 · ${M.sourceCounts ? `${M.sourceCounts.uniqueIndicators} 个唯一指标 / ${M.sourceCounts.indicatorRows} 条节点关联` : `共 ${chain.indicatorCount} 个指标`}</div>
        </div>
        ${groups.length ? groups.map((g, gi) => `
          <div class="pg-in-group-hd">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--mid)"></span>
            <span class="t">${g.node}</span>
            <span class="link fs13" data-node="${g.nodeId}">进入环节 ›</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${g.items.map((ind, i) => `
            <div class="pg-in-row" data-g="${gi}" data-i="${i}">
              <div style="flex:1;min-width:0">
                <div class="nm">${ind.name} ${ind.discontinued ? '<span class="badge badge-warn">已停更</span>' : ''} ${refreshBadge(ind.refreshStatus)}</div>
                <div class="meta">${ind.freq} · ${ind.source} · ${ind.unit}</div>
              </div>
              <canvas data-g="${gi}" data-i="${i}" style="width:64px;height:24px;flex:none"></canvas>
              <div class="val"><b>${ind.latest}</b><div class="d">${ind.latestDate}</div></div>
            </div>`).join('')}
          </div>`).join('') : '<div class="empty"><div class="ico">📈</div>该产业链指标整理中</div>'}
        ${UI.disclaimer()}
      </div>`

      setTimeout(() => el.querySelectorAll('canvas').forEach(c => {
        const ind = groups[+c.dataset.g].items[+c.dataset.i]
        UI.sparkline(c, ind.series, ind.discontinued ? '#98A1B3' : brand)
      }))
      el.querySelectorAll('.pg-in-row').forEach(r => r.onclick = () => renderDetail(groups[+r.dataset.g].items[+r.dataset.i]))
      el.querySelectorAll('[data-node]').forEach(a => a.onclick = () => ctx.go('graph', { node: a.dataset.node }))
    }

    function renderDetail(ind) {
      const startDate = ind.seriesStart || ind.seriesDates?.[0] || '—'
      const endDate = ind.seriesEnd || ind.latestDate || '—'
      const related = M.nodesByIndicator(ind.name)
      el.innerHTML = `<div class="page-pad">
        <div class="link fs13" id="pg-in-back" style="padding:10px 0">‹ 返回指标列表</div>
        ${ind.discontinued ? '<div class="pg-in-banner">该指标已停更,最后更新 ' + ind.latestDate + ',仅供历史参考</div>' : ''}
        <div class="pg-in-big">
          <div class="nm">${ind.name}</div>
          <div class="row gap6 mt8">
            <span class="chip">频率 · ${ind.freq}</span><span class="chip">${ind.source}</span><span class="chip">${ind.unit}</span>
          </div>
          <div class="mt16"><span class="v">${ind.latest}</span> <span class="fs13 t3">${ind.unit} · ${ind.latestDate}</span></div>
          <canvas id="pg-in-chart" style="width:100%;height:160px;margin-top:12px"></canvas>
          <div class="row" style="justify-content:space-between;margin-top:4px">
            <span class="fs12 t3">${startDate}</span><span class="fs12 t3">${endDate}</span>
          </div>
        </div>
        <div class="card mt12" style="padding:4px 16px">
          <div class="pg-in-kv"><span class="k">数据来源</span><span class="v2">${ind.source}</span></div>
          <div class="pg-in-kv"><span class="k">单位</span><span class="v2">${ind.unit}</span></div>
          <div class="pg-in-kv"><span class="k">频率</span><span class="v2">${ind.freq}</span></div>
          <div class="pg-in-kv"><span class="k">统计区间</span><span class="v2">${startDate} 至 ${endDate}</span></div>
          <div class="pg-in-kv"><span class="k">本轮刷新</span><span class="v2">${refreshLabel[ind.refreshStatus] || '状态未记录'}</span></div>
          ${ind.trend ? `<div class="pg-in-kv"><span class="k">序列描述</span><span class="v2" style="max-width:70%;text-align:right">${ind.trend}</span></div>` : ''}
          <div class="pg-in-kv"><span class="k">完整序列点数</span><span class="v2">${ind.seriesPointCount || ind.series.length}（图中展示最近 ${ind.series.length} 期）</span></div>
        </div>
        ${related.length ? `
        <div class="sect-hd" style="margin:16px 0 8px"><div class="sect-title">相关环节</div><div class="sect-more" style="cursor:default">${related.length} 个</div></div>
        <div class="pg-in-rel">${related.map(n => `<span class="chip" data-nid="${n.id}">${n.name}</span>`).join('')}</div>` : ''}
        ${UI.disclaimer()}
      </div>`
      setTimeout(() => UI.sparkline(el.querySelector('#pg-in-chart'), ind.series, ind.discontinued ? '#98A1B3' : brand))
      el.querySelector('#pg-in-back').onclick = renderList
      el.querySelectorAll('.pg-in-rel .chip').forEach(c => c.onclick = () => ctx.go('graph', { node: c.dataset.nid }))
    }

    // 深链:?ind=指标名 → 直接打开该指标详情(节点详情指标行/搜索结果跳入)
    if (ctx.params && ctx.params.ind) {
      const hit = M.findIndicator(ctx.params.ind)
      if (hit) { renderDetail(hit); return }
    }
    renderList()
  }
}
