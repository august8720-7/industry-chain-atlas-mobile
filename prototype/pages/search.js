// 全局搜索:真实检索(产业/节点/公司/指标四类分组) + 空态/无结果态
window.Page_search = {
  title: '搜索',
  render(el, ctx) {
    if (!document.getElementById('pg-search-css')) {
      const s = document.createElement('style'); s.id = 'pg-search-css'
      s.textContent = `
      .pg-se-top { display: flex; align-items: center; gap: 12px; padding: 6px 16px 12px; }
      .pg-se-top .search-bar { flex: 1; }
      .pg-se-cancel { font-size: 14px; color: var(--t2); cursor: pointer; white-space: nowrap; }
      .pg-se-group-hd { font-size: 13px; color: var(--t3); margin: 14px 0 8px; }
      .pg-se-row { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); padding: 11px 12px; cursor: pointer; margin-bottom: 8px; }
      .pg-se-type { width: 30px; height: 30px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
      .pg-se-row .t { font-size: 14px; font-weight: 600; color: var(--t1); }
      .pg-se-row .s { font-size: 12px; color: var(--t3); margin-top: 2px; }
      .pg-se-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 4px; }
      `
      document.head.appendChild(s)
    }

    const M = window.MOCK
    const typeStyle = {
      '产业': 'background:var(--brand-weak);color:var(--brand)',
      '节点': 'background:var(--up-soft);color:var(--up-ink)',
      '公司': 'background:var(--mid-soft);color:var(--mid-ink)',
      '指标': 'background:var(--down-soft);color:var(--down-ink)'
    }

    let query = ''

    function resultsHtml(r) {
      if (!r || !r.total) return `<div class="empty"><div class="ico">🔍</div>没找到「${query}」相关内容<br>试试 减速器 / 光模块 / 汇川技术 / 产量</div>`
      return r.groups.map(g => `
        <div class="pg-se-group-hd">${g.type} · ${g.items.length}</div>
        ${g.items.map(it => `
        <div class="pg-se-row" data-type="${g.type}" data-chain="${it.chainKey || ''}" data-node="${it.id || ''}" data-key="${it.key || ''}" data-locked="${it.locked === true}">
          <span class="pg-se-type" style="${typeStyle[g.type]}">${g.type}</span>
          <div style="flex:1;min-width:0"><div class="t">${it.t}</div><div class="s">${it.s}</div></div>
          <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
        </div>`).join('')}`).join('')
    }
    function idle() {
      return `
        <div class="pg-se-group-hd">最近搜索</div>
        <div class="pg-se-chips"><span class="chip" data-q="减速器">减速器</span><span class="chip" data-q="协作机器人">协作机器人</span></div>
        <div class="pg-se-group-hd">大家在看</div>
        <div class="pg-se-chips"><span class="chip" data-q="光模块">光模块</span><span class="chip" data-q="AI服务器">AI服务器</span><span class="chip" data-q="HBM">HBM</span></div>`
    }

    el.innerHTML = `
      <div class="pg-se-top">
        <div class="search-bar">
          ${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}
          <input id="pg-se-input" placeholder="搜产业链 / 环节 / 公司 / 指标">
        </div>
        <span class="pg-se-cancel">取消</span>
      </div>
      <div class="page-pad" id="pg-se-body"></div>`

    const body = el.querySelector('#pg-se-body')
    const input = el.querySelector('#pg-se-input')

    function render() {
      const q = query.trim()
      body.innerHTML = (q ? resultsHtml(M.runSearch(q)) : idle()) + UI.disclaimer()
      // 结果行跳转
      body.querySelectorAll('.pg-se-row').forEach(r => r.onclick = async () => {
        const type = r.dataset.type
        if (type === '产业' && r.dataset.locked === 'true') {
          UI.toast(`「${r.querySelector('.t').textContent}」产业链需开通查看权限，请联系专属客户经理`)
          return
        }
        if (type === '产业') {
          if (r.dataset.key) await ctx.selectChain(r.dataset.key, 'overview')
        } else if (type === '节点') {
          if (r.dataset.chain) await ctx.selectChain(r.dataset.chain, 'graph', r.dataset.node ? { node: r.dataset.node } : {})
        } else if (type === '公司') {
          const params = { q: r.querySelector('.t').textContent }
          if (r.dataset.chain) await ctx.selectChain(r.dataset.chain, 'company', params)
          else ctx.go('company', params)
        } else {
          const params = { ind: r.querySelector('.t').textContent }
          if (r.dataset.chain) await ctx.selectChain(r.dataset.chain, 'indicator', params)
          else ctx.go('indicator', params)
        }
      })
      // 建议 chip
      body.querySelectorAll('.chip[data-q]').forEach(c => c.onclick = () => { query = c.dataset.q; input.value = query; render() })
    }

    input.oninput = () => { query = input.value; render() }
    el.querySelector('.pg-se-cancel').onclick = () => ctx.go('home')
    input.focus()
    render()
  }
}
