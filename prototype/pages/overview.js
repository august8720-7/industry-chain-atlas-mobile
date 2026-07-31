// 产业链详情：默认“一图看懂”，右侧页签承接原动态交互图谱。
(function () {
  'use strict'

  const config = () => window.RESEARCH_CONFIG || { insights: {} }
  const safeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char])

  function ensureStyles() {
    if (document.getElementById('pg-overview-css')) return
    const style = document.createElement('style')
    style.id = 'pg-overview-css'
    style.textContent = `
      .pg-ov-page { padding: 0 16px 24px; }
      .pg-ov-index,
      .pg-ov-poster-card { border: 1px solid #E8ECF3; border-radius: 15px; background: var(--card); box-shadow: 0 3px 12px rgba(27,46,83,.05); }
      .pg-ov-index { overflow: hidden; margin-bottom: 12px; padding: 12px 14px 10px; }
      .pg-ov-index-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .pg-ov-index-title { display: flex; align-items: center; gap: 5px; min-width: 0; }
      .pg-ov-index-title strong { overflow: hidden; color: var(--t1); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
      .pg-ov-index-info { display: grid; width: 15px; height: 15px; place-items: center; flex: none; padding: 0; border: 1px solid #BEC6D5; border-radius: 50%; background: transparent; color: #8E99AA; font: 700 9px/1 var(--font); cursor: pointer; }
      .pg-ov-index-date { flex: none; color: var(--t3); font-size: 8.5px; white-space: nowrap; }
      .pg-ov-index-empty { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 9px 10px; border-radius: 10px; background: #F6F8FB; color: var(--t2); font-size: 11px; line-height: 1.5; }
      .pg-ov-index-empty i { display: grid; width: 23px; height: 23px; place-items: center; flex: none; border-radius: 50%; background: var(--brand-weak); color: var(--brand); font-style: normal; font-weight: 800; }
      .pg-ov-index-empty-copy { min-width: 0; flex: 1; }
      .pg-ov-index-retry { margin-top: 6px; padding: 0; border: 0; background: transparent; color: var(--brand); font: 700 11px var(--font); cursor: pointer; }
      .pg-ov-index-loading i { animation: pg-ov-pulse 1s ease-in-out infinite alternate; }
      @keyframes pg-ov-pulse { to { opacity: .42; transform: scale(.9); } }
      .pg-ov-index-main { display: grid; grid-template-columns: minmax(104px,.78fr) minmax(0,1.22fr); align-items: end; gap: 10px; margin-top: 6px; }
      .pg-ov-index-value { color: var(--t1); font-size: 21px; font-weight: 800; letter-spacing: -.35px; font-variant-numeric: tabular-nums; }
      .pg-ov-index-five { display: flex; align-items: center; gap: 4px; margin-top: 2px; color: var(--t3); font-size: 9px; }
      .pg-ov-index-five b { font-size: 10px; font-variant-numeric: tabular-nums; }
      .pg-ov-index-five b.up { color: #D95050; }
      .pg-ov-index-five b.down { color: #13945B; }
      .pg-ov-index-five b.flat { color: var(--t3); }
      .pg-ov-index-chart canvas { display: block; width: 100%; height: 38px; }
      .pg-ov-index-range { margin-top: 1px; color: var(--t3); font-size: 8px; text-align: right; }
      .pg-ov-poster-card { overflow: hidden; }
      .pg-ov-poster-button { display: block; width: 100%; padding: 0; border: 0; background: #fff; cursor: zoom-in; }
      .pg-ov-poster-button img { display: block; width: 100%; height: auto; }
      .pg-ov-coming { display: grid; min-height: 330px; place-items: center; padding: 30px 20px; background: linear-gradient(180deg,#FBFCFE,#F3F6FA); text-align: center; }
      .pg-ov-coming-icon { display: grid; width: 54px; height: 54px; margin: 0 auto 14px; place-items: center; border-radius: 16px; background: var(--brand-weak); color: var(--brand); font-size: 24px; }
      .pg-ov-coming strong { display: block; color: var(--t1); font-size: 16px; }
      .pg-ov-coming p { max-width: 250px; margin: 8px auto 0; color: var(--t3); font-size: 12px; line-height: 1.65; }
      .pg-ov-action { width: calc(100% - 24px); margin: 12px; padding: 12px 16px; border: 0; border-radius: 8px; background: var(--brand); color: #fff; font: 700 13px/1.2 var(--font); cursor: pointer; box-shadow: 0 6px 15px rgba(46,107,232,.18); }
      .pg-ov-preview { position: absolute; inset: 0; z-index: 100; overflow: auto; background: rgba(13,18,27,.96); overscroll-behavior: contain; }
      .pg-ov-preview-bar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: max(12px, env(safe-area-inset-top)) 14px 10px; background: rgba(13,18,27,.92); color: #fff; font-size: 13px; backdrop-filter: blur(8px); }
      .pg-ov-preview-close { padding: 7px 10px; border: 1px solid rgba(255,255,255,.28); border-radius: 999px; background: transparent; color: #fff; font: 600 12px var(--font); cursor: pointer; }
      .pg-ov-preview img { display: block; width: 100%; height: auto; background: #fff; }
    `
    document.head.appendChild(style)
  }

  const formatDate = value => {
    const digits = String(value || '').replace(/\D/g, '')
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}` : String(value || '—')
  }
  const fixed = (value, digits = 2) => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  const signed = (value, suffix = '') => `${Number(value) > 0 ? '+' : ''}${fixed(value)}${suffix}`
  const direction = value => Number(value) > 0 ? 'up' : Number(value) < 0 ? 'down' : 'flat'

  function renderIndexCard(chainTitle, state = { status: 'loading' }) {
    const heading = `<div class="pg-ov-index-head"><div class="pg-ov-index-title"><strong>${safeText(chainTitle)}产业链指数</strong><button class="pg-ov-index-info" data-index-info aria-label="查看指数口径">i</button></div>${state.status === 'ready' ? `<span class="pg-ov-index-date">${formatDate(state.data.latest.date)} 收盘</span>` : ''}</div>`
    if (state.status !== 'ready') {
      const failed = state.status === 'error'
      return `<section class="pg-ov-index" aria-label="${safeText(chainTitle)}产业链指数">
        ${heading}
        <div class="pg-ov-index-empty ${failed ? '' : 'pg-ov-index-loading'}"><i>${failed ? '!' : '·'}</i><div class="pg-ov-index-empty-copy"><span>${failed ? `行情数据暂时未加载成功：${safeText(state.error?.message || '未知错误')}` : '正在加载最新产业链行情…'}</span>${failed ? '<br><button class="pg-ov-index-retry" data-index-retry>重新加载</button>' : ''}</div></div>
      </section>`
    }
    const { seriesData, latest } = state.data
    const fiveDayTone = direction(latest.fiveDayPct)
    return `<section class="pg-ov-index" aria-label="${safeText(chainTitle)}产业链指数" data-market-state="ready">
      ${heading}
      <div class="pg-ov-index-main">
        <div><div class="pg-ov-index-value">${fixed(latest.close)}</div><div class="pg-ov-index-five"><span>5日涨跌</span><b class="${fiveDayTone}">${signed(latest.fiveDayPct, '%')}</b></div></div>
        <div class="pg-ov-index-chart"><canvas data-index-line aria-label="近${seriesData.series.length}个交易日产业链指数走势"></canvas><div class="pg-ov-index-range">近 ${seriesData.series.length} 个交易日</div></div>
      </div>
    </section>`
  }

  function bindIndexInfo(host, data) {
    host.querySelector('[data-index-info]')?.addEventListener('click', () => {
      const detail = data
        ? `样本 ${data.entry.constituents} 只，${data.manifest.methodology?.weighting || '按既定方法加权'}，截至 ${formatDate(data.latest.date)}。`
        : ''
      UI.toast(`页面试算指数，非交易所正式指数。${detail}`)
    })
  }

  function mountIndex(host, chainKey, chainTitle) {
    if (!host) return
    host.innerHTML = renderIndexCard(chainTitle)
    bindIndexInfo(host)
    const loader = window.ChainMarketIndex
    if (!loader) {
      host.innerHTML = renderIndexCard(chainTitle, { status: 'error', error: new Error('行情加载模块未就绪') })
      bindIndexInfo(host)
      return
    }
    loader.getChain(chainKey).then(data => {
      if (!host.isConnected || window.MOCK?.currentChainKey !== chainKey) return
      host.innerHTML = renderIndexCard(chainTitle, { status: 'ready', data })
      bindIndexInfo(host, data)
      const canvas = host.querySelector('[data-index-line]')
      if (canvas) {
        const tone = direction(data.latest.changePct)
        UI.sparkline(canvas, data.seriesData.series.map(item => Number(item.close)), tone === 'up' ? '#D95050' : tone === 'down' ? '#13945B' : '#64748B', true)
      }
    }).catch(error => {
      if (!host.isConnected || window.MOCK?.currentChainKey !== chainKey) return
      host.innerHTML = renderIndexCard(chainTitle, { status: 'error', error })
      bindIndexInfo(host)
      host.querySelector('[data-index-retry]')?.addEventListener('click', () => {
        loader.clear(chainKey)
        mountIndex(host, chainKey, chainTitle)
      })
    })
  }

  window.Page_overview = {
    title: '一图看懂',
    render(el, ctx) {
      ensureStyles()
      const M = window.MOCK
      const chainKey = M.currentChainKey
      const chain = M.chainCatalog.find(item => item.key === chainKey) || { key: chainKey, title: M.chainTitle || '当前' }
      const insight = config().insights?.[chainKey] || {
        title: `${chain.title}产业链`,
        summary: '解读图准备中，可先进入交互图谱查看真实产业环节与关联数据。',
        poster: '',
        posterStatus: 'coming-soon'
      }
      const posterReady = insight.posterStatus === 'ready' && insight.poster

      el.innerHTML = `
        <div class="pg-ov-page">
          <div data-index-host="${safeText(chainKey)}">${renderIndexCard(chain.title)}</div>
          <section class="pg-ov-poster-card">
            ${posterReady
              ? `<button class="pg-ov-poster-button" id="pg-ov-poster" aria-label="全屏查看${safeText(chain.title)}产业链解读图"><img src="${safeText(insight.poster)}" loading="lazy" alt="${safeText(chain.title)}产业链上下游核心环节与代表公司概览图"></button>`
              : `<div class="pg-ov-coming"><div><span class="pg-ov-coming-icon">⌁</span><strong>解读图敬请期待</strong><p>当前产业关系、公司和指标数据仍可在“交互图谱”中完整查看。</p></div></div>`}
            <button class="pg-ov-action" id="pg-ov-open-atlas">查看完整交互图谱 →</button>
          </section>
          ${UI.disclaimer()}
        </div>`

      mountIndex(el.querySelector('[data-index-host]'), chainKey, chain.title)

      el.querySelector('#pg-ov-open-atlas').onclick = () => ctx.go('atlas')
      el.querySelector('#pg-ov-poster')?.addEventListener('click', () => {
        const preview = document.createElement('div')
        preview.className = 'pg-ov-preview'
        preview.setAttribute('role', 'dialog')
        preview.setAttribute('aria-modal', 'true')
        preview.innerHTML = `<div class="pg-ov-preview-bar"><span>${safeText(chain.title)}产业链解读图</span><button class="pg-ov-preview-close">关闭</button></div><img src="${safeText(insight.poster)}" alt="${safeText(chain.title)}产业链解读图全屏预览">`
        const close = () => preview.remove()
        preview.querySelector('.pg-ov-preview-close').onclick = close
        preview.addEventListener('click', event => { if (event.target === preview) close() })
        document.getElementById('phone').appendChild(preview)
      })
    }
  }

  window.Page_atlas = {
    title: '交互图谱',
    render(el, ctx) {
      window.Page_graph.render(el, {
        go: ctx.go,
        selectChain: ctx.selectChain,
        params: { ...(ctx.params || {}), __list: true }
      })
    }
  }
})()
