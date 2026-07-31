// 公司页:股票反查(真实检索,裂变发动机) + 当前链热门公司浏览
window.Page_company = {
  title: '公司',
  render(el, ctx) {
    if (!document.getElementById('pg-company-css')) {
      const s = document.createElement('style'); s.id = 'pg-company-css'
      s.textContent = `
      .pg-co-head { display: flex; align-items: center; gap: 12px; background: var(--card); border-radius: var(--r-lg); box-shadow: var(--shadow-card); padding: 14px; margin-top: 14px; }
      .pg-co-head .co-avatar { width: 44px; height: 44px; font-size: 17px; }
      .pg-co-hit { display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px; cursor: pointer; }
      .pg-co-group-hd { display: flex; align-items: center; gap: 8px; margin: 16px 0 8px; }
      .pg-co-group-hd .t { font-size: 15px; font-weight: 700; color: var(--t1); }
      .pg-co-note { font-size: 11px; color: var(--t3); line-height: 1.6; margin-top: 12px; }
      .pg-co-tip { font-size: 12px; color: var(--t3); margin: 14px 2px 4px; }
      .pg-co-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0 4px; }
      `
      document.head.appendChild(s)
    }

    const M = window.MOCK
    const tone = { upstream: 'up', midstream: 'mid', downstream: 'down' }
    const bandName = { upstream: '上游', midstream: '中游', downstream: '下游' }
    let query = (ctx.params && ctx.params.q) || ''

    el.innerHTML = `<div class="page-pad">
      <div style="margin-top:6px;font-size:12px;color:var(--t3)">查一家公司位于哪些产业链环节 · 当前覆盖 6 条开放产业链</div>
      <div class="search-bar" style="margin-top:8px">
        ${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}
        <input id="pg-co-input" value="${query}" placeholder="输入股票代码或名称,如 汇川技术 / 300124">
        <button class="go">搜索</button>
      </div>
      <div id="pg-co-result"></div>
    </div>`

    const result = el.querySelector('#pg-co-result')
    const input = el.querySelector('#pg-co-input')

    function browseSection() {
      const list = M.companyBrowse
      return `
        <div class="hr" style="margin:18px 0 4px"></div>
        <div class="sect-hd"><div class="sect-title">源数据公司</div><div class="sect-more" style="cursor:default">${M.companyBrowse.length} 家 · ${M.chainTitle}</div></div>
        <div class="pg-co-tip">按覆盖节点数和源相关度排序,点击可反查全部关联节点</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${list.map(c => `
          <div class="co-card" data-co="${c.name}">${UI.avatar(c.name)}
            <div style="flex:1;min-width:0"><div class="co-name">${c.name} ${UI.levelBadge(c.level)}</div><div class="co-sub">${c.code || '未上市'} · ${c.role || '角色未标注'}</div></div>
            <span class="fs12 t3">覆盖 ${c.nodes} 个环节</span>
          </div>`).join('')}
        </div>
        <div class="pg-co-note">公司、角色、等级与关联节点均加载自 ${M.sourceInfo?.file || '当前产业链数据'};机器人链共 ${M.sourceCounts?.companyRows || M.companyBrowse.length} 条公司关联、${M.sourceCounts?.uniqueCompanies || M.companyBrowse.length} 家唯一公司。</div>
        ${UI.disclaimer()}`
    }

    function hitsSection(r) {
      return `
        <div class="pg-co-head">
          ${UI.avatar(r.company.name)}
          <div style="flex:1"><div style="font-size:16px;font-weight:700;color:var(--t1)">${r.company.name}</div><div class="co-sub">${r.company.code || '未上市'} · ${r.company.role || '角色未标注'}</div></div>
          <span class="badge badge-level-weak">已收录</span>
        </div>
        <div class="pg-co-tip">覆盖 ${r.chainCount} 条产业链 · ${r.nodeCount} 个环节</div>
        ${r.hits.map(h => `
          <div class="pg-co-group-hd">
            <span class="t">${h.chain} 产业链</span>
            <span class="badge badge-level-weak">${h.nodes.length} 个环节</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${h.nodes.map(n => `
            <div class="pg-co-hit" data-chain="${h.chainKey}" data-node="${n.id}">
              <span style="width:8px;height:8px;border-radius:50%;background:var(--${tone[n.band]});flex:none"></span>
              <span style="flex:1;min-width:0"><b style="font-size:14px;color:var(--t1)">${n.name}</b><small style="display:block;margin-top:3px;color:var(--t3)">${n.lane || '未标注关系'} · ${n.role || '角色未标注'}</small></span>
              <span class="badge badge-band-${n.band}">${bandName[n.band]}</span>
              ${UI.levelBadge(n.level)}
              <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
            </div>`).join('')}
          </div>`).join('')}
        ${UI.disclaimer()}`
    }

    function emptyState() {
      return `
        <div class="empty"><div class="ico">🔎</div>没找到「${query}」相关的上市公司<br>试试输入 兆威机电 / 汇川技术 / 003021</div>
        ${browseSection()}`
    }

    function idleState() {
      return `
        <div class="pg-co-tip">最近热门</div>
        <div class="pg-co-chips">
          <span class="chip" data-q="兆威机电">兆威机电</span>
          <span class="chip" data-q="中际旭创">中际旭创</span>
          <span class="chip" data-q="埃斯顿">埃斯顿</span>
        </div>
        ${browseSection()}`
    }

    function render() {
      const q = query.trim()
      if (!q) result.innerHTML = idleState()
      else {
        const r = M.lookupStock(q)
        result.innerHTML = (!r || r.notFound) ? emptyState() : hitsSection(r)
      }
      bind()
    }

    function bind() {
      // 反查命中环节 → 切到对应链并打开该环节详情
      result.querySelectorAll('.pg-co-hit').forEach(h => h.onclick = async () => {
        await ctx.selectChain(h.dataset.chain, 'graph', { node: h.dataset.node })
      })
      // 浏览/热门公司卡 → 反查该公司
      result.querySelectorAll('.co-card[data-co]').forEach(c => c.onclick = () => { query = c.dataset.co; input.value = query; render() })
      // 最近热门 chip → 反查
      result.querySelectorAll('.chip[data-q]').forEach(c => c.onclick = () => { query = c.dataset.q; input.value = query; render() })
    }

    input.oninput = () => { query = input.value; render() }
    el.querySelector('.search-bar .go').onclick = () => { query = input.value; render() }
    render()
  }
}
