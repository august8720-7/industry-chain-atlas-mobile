// 搜索发现页：真实本地历史 + 运营配置热门词 + 股票反查 + 现有六链 search-index 结果。
(function () {
  'use strict'

  const HISTORY_KEY = 'feiyan-search-history-v1'
  // 运营配置的研究热词，不表示用户行为频次排名。
  const HOT_SEARCHES = ['人形机器人', '低空经济', '商业航天', '算力', '光模块', '汇川技术']
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char])

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim()).slice(0, 8) : []
    } catch (_error) {
      return []
    }
  }

  function writeHistory(items) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 8))) } catch (_error) {}
  }

  function ensureStyles() {
    if (document.getElementById('pg-search-module-css')) return
    const style = document.createElement('style')
    style.id = 'pg-search-module-css'
    style.textContent = `
      .pg-sm-top { display: flex; align-items: center; gap: 10px; padding: 4px 16px 12px; }
      .pg-sm-top .search-bar { flex: 1; min-width: 0; }
      .pg-sm-top .search-bar input { min-width: 0; font-size: 14px; }
      .pg-sm-cancel { flex: none; border: 0; background: transparent; color: var(--brand); font: 600 13px var(--font); cursor: pointer; }
      .pg-sm-section { margin: 16px 0 0; }
      .pg-sm-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; color: var(--t1); font-size: 14px; font-weight: 700; }
      .pg-sm-section-head button { border: 0; background: transparent; color: var(--t3); font: 500 11px var(--font); cursor: pointer; }
      .pg-sm-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .pg-sm-chip { padding: 7px 11px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--t2); font-size: 12px; cursor: pointer; }
      .pg-sm-stock { padding: 14px; border: 1px solid #D7E4FA; border-radius: 16px; background: #F7FAFF; box-shadow: 0 5px 16px rgba(46,107,232,.08); }
      .pg-sm-stock-title { display: flex; align-items: center; gap: 8px; color: var(--t1); font-size: 15px; font-weight: 750; }
      .pg-sm-stock-title i { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 8px; background: var(--brand); color: #fff; font-style: normal; }
      .pg-sm-stock > p { margin: 6px 0 10px; color: var(--t3); font-size: 11px; line-height: 1.55; }
      .pg-sm-stock-form { display: flex; overflow: hidden; border: 1px solid var(--line); border-radius: 11px; background: #fff; }
      .pg-sm-stock-form input { min-width: 0; flex: 1; padding: 10px 11px; border: 0; outline: 0; background: transparent; color: var(--t1); font: 12px var(--font); }
      .pg-sm-stock-form button { flex: none; padding: 0 14px; border: 0; background: var(--brand); color: #fff; font: 700 12px var(--font); cursor: pointer; }
      .pg-sm-examples { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 9px; color: var(--t3); font-size: 10.5px; }
      .pg-sm-insight-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); align-items: stretch; gap: 9px; }
      .pg-sm-insight { display: flex; width: 100%; min-width: 0; min-height: 138px; flex-direction: column; padding: 12px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); color: inherit; font: inherit; text-align: left; cursor: pointer; }
      .pg-sm-insight:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
      .pg-sm-insight strong { display: block; color: var(--t1); font-size: 13px; }
      .pg-sm-insight p { margin-top: 5px; color: var(--t3); font-size: 10.5px; line-height: 1.5; }
      .pg-sm-insight span { display: block; margin-top: auto; padding-top: 9px; color: var(--brand); font-size: 10.5px; font-weight: 700; }
      .pg-sm-group-head { margin: 15px 0 8px; color: var(--t3); font-size: 12px; }
      .pg-sm-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 11px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); cursor: pointer; }
      .pg-sm-type { display: grid; width: 30px; height: 30px; place-items: center; flex: none; border-radius: 8px; font-size: 10px; font-weight: 700; }
      .pg-sm-row .title { color: var(--t1); font-size: 13px; font-weight: 650; }
      .pg-sm-row .meta { margin-top: 3px; color: var(--t3); font-size: 10px; line-height: 1.4; }
      .pg-sm-empty { padding: 34px 18px; border: 1px dashed var(--line-strong); border-radius: 14px; color: var(--t3); font-size: 12px; line-height: 1.65; text-align: center; }
    `
    document.head.appendChild(style)
  }

  window.Page_search = {
    title: '搜索',
    render(el, ctx) {
      ensureStyles()
      const M = window.MOCK
      const research = window.RESEARCH_CONFIG || { hotInsightKeys: [], insights: {} }
      const typeStyle = {
        '产业': 'background:var(--brand-weak);color:var(--brand)',
        '节点': 'background:var(--up-soft);color:var(--up-ink)',
        '公司': 'background:var(--mid-soft);color:var(--mid-ink)',
        '指标': 'background:var(--down-soft);color:var(--down-ink)'
      }
      let query = String(ctx.params?.q || '')
      let historyItems = readHistory()

      const resultMarkup = result => {
        if (!result?.total) {
          return `<div class="pg-sm-empty">没找到“${esc(query.trim())}”相关内容。<br>请尝试产业链、环节、公司、股票代码或指标全称。</div>`
        }
        return result.groups.map(group => `
          <div class="pg-sm-group-head">${esc(group.type)} · ${group.items.length}</div>
          ${group.items.map(item => `
            <div class="pg-sm-row" data-type="${esc(group.type)}" data-chain="${esc(item.chainKey || '')}" data-node="${esc(item.id || '')}" data-key="${esc(item.key || '')}" data-locked="${item.locked === true}">
              <span class="pg-sm-type" style="${typeStyle[group.type]}">${esc(group.type)}</span>
              <div style="flex:1;min-width:0"><div class="title">${esc(item.t)}</div><div class="meta">${esc(item.s)}</div></div>
              <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
            </div>`).join('')}
        `).join('')
      }

      const idleMarkup = () => {
        const hotItems = (research.hotInsightKeys || []).map(key => ({
          key,
          chain: M.chainCatalog.find(item => item.key === key),
          insight: research.insights?.[key]
        })).filter(item => item.chain?.live && item.insight)
        return `
          ${historyItems.length ? `
            <section class="pg-sm-section">
              <div class="pg-sm-section-head"><span>最近搜索</span><button id="pg-sm-clear-history">清空</button></div>
              <div class="pg-sm-chips">${historyItems.map(item => `<button class="pg-sm-chip" data-search-query="${esc(item)}">${esc(item)}</button>`).join('')}</div>
            </section>` : ''}
          <section class="pg-sm-section">
            <div class="pg-sm-section-head"><span>热门搜索</span></div>
            <div class="pg-sm-chips">${HOT_SEARCHES.map(item => `<button class="pg-sm-chip" data-search-query="${esc(item)}">${esc(item)}</button>`).join('')}</div>
          </section>
          <section class="pg-sm-section pg-sm-stock">
            <div class="pg-sm-stock-title"><i>⌕</i><span>股票反查</span></div>
            <p>输入股票代码或公司名，复用现有搜索索引查看对应产业链与产业环节。</p>
            <div class="pg-sm-stock-form"><input id="pg-sm-stock-input" placeholder="如：300124 汇川技术"><button id="pg-sm-stock-submit">查一下</button></div>
            <div class="pg-sm-examples"><span>示例</span><button class="pg-sm-chip" data-search-query="汇川技术">汇川技术</button><button class="pg-sm-chip" data-search-query="埃斯顿">埃斯顿</button></div>
          </section>
          <section class="pg-sm-section">
            <div class="pg-sm-section-head"><span>热门解读</span></div>
            <div class="pg-sm-insight-grid">${hotItems.map(item => `
              <button type="button" class="pg-sm-insight" data-insight-key="${item.key}">
                <strong>${esc(item.insight.title)}</strong><p>${esc(item.insight.summary)}</p><span>${item.insight.posterStatus === 'ready' ? '一图看懂 →' : '敬请期待 →'}</span>
              </button>`).join('')}</div>
          </section>`
      }

      el.innerHTML = `
        <div class="pg-sm-top">
          <div class="search-bar">${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}<input id="pg-sm-input" placeholder="搜索产业链、环节、公司或股票代码"></div>
          <button class="pg-sm-cancel" id="pg-sm-cancel">取消</button>
        </div>
        <div class="page-pad" id="pg-sm-body"></div>`

      const body = el.querySelector('#pg-sm-body')
      const input = el.querySelector('#pg-sm-input')
      input.value = query

      const remember = value => {
        const normalized = value.trim()
        if (!normalized) return
        historyItems = [normalized, ...historyItems.filter(item => item !== normalized)].slice(0, 8)
        writeHistory(historyItems)
      }

      const commitQuery = value => {
        query = String(value || '').trim()
        input.value = query
        remember(query)
        renderBody()
        input.focus()
      }

      const openChain = async key => {
        await ctx.selectChain(key, 'overview')
      }

      function bindResults() {
        body.querySelectorAll('.pg-sm-row').forEach(row => row.onclick = async () => {
          remember(query)
          const type = row.dataset.type
          if (type === '产业' && row.dataset.locked === 'true') {
            UI.toast(`「${row.querySelector('.title').textContent}」产业链需开通查看权限，请联系专属客户经理`)
            return
          }
          if (type === '产业') {
            if (row.dataset.key) await openChain(row.dataset.key)
          } else if (type === '节点') {
            if (row.dataset.chain) await ctx.selectChain(row.dataset.chain, 'graph', row.dataset.node ? { node: row.dataset.node } : {})
          } else if (type === '公司') {
            const next = { q: row.querySelector('.title').textContent }
            if (row.dataset.chain) await ctx.selectChain(row.dataset.chain, 'company', next)
            else ctx.go('company', next)
          } else {
            const next = { ind: row.querySelector('.title').textContent }
            if (row.dataset.chain) await ctx.selectChain(row.dataset.chain, 'indicator', next)
            else ctx.go('indicator', next)
          }
        })
      }

      function bindIdle() {
        body.querySelectorAll('[data-search-query]').forEach(button => button.onclick = () => commitQuery(button.dataset.searchQuery))
        body.querySelector('#pg-sm-clear-history')?.addEventListener('click', () => {
          historyItems = []
          writeHistory([])
          renderBody()
        })
        const stockInput = body.querySelector('#pg-sm-stock-input')
        const submitStock = () => commitQuery(stockInput?.value || '')
        body.querySelector('#pg-sm-stock-submit')?.addEventListener('click', submitStock)
        stockInput?.addEventListener('keydown', event => { if (event.key === 'Enter') submitStock() })
        body.querySelectorAll('[data-insight-key]').forEach(card => card.onclick = () => openChain(card.dataset.insightKey))
      }

      function renderBody() {
        const normalized = query.trim()
        body.innerHTML = (normalized ? resultMarkup(M.runSearch(normalized)) : idleMarkup()) + UI.disclaimer()
        if (normalized) bindResults()
        else bindIdle()
      }

      input.oninput = () => {
        query = input.value
        renderBody()
      }
      input.onkeydown = event => {
        if (event.key === 'Enter') commitQuery(input.value)
      }
      el.querySelector('#pg-sm-cancel').onclick = () => window.app.back()
      renderBody()
      input.focus()
    }
  }
})()
