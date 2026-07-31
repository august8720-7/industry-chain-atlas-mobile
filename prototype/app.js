(function () {
  'use strict'

  const TABS = [
    { key: 'home', label: '首页', icon: 'home' },
    { key: 'graph', label: '图谱', icon: 'graph' },
    { key: 'company', label: '公司', icon: 'company' },
    { key: 'indicator', label: '指标', icon: 'indicator' }
  ]
  let currentPage = 'home'
  let params = {}
  let renderVersion = 0
  let store = null

  const pageModule = () => window.Pages?.[currentPage]
  const encodeHash = (page, values = {}) => {
    const query = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== '' && value != null) query.set(key, value)
    })
    return `#/${page}${query.size ? `?${query}` : ''}`
  }
  const decodeHash = () => {
    const raw = location.hash.replace(/^#\/?/, '')
    if (!raw) return { page: 'home', params: {} }
    const [page, query = ''] = raw.split('?')
    return { page: window.Pages?.[page] ? page : 'home', params: Object.fromEntries(new URLSearchParams(query)) }
  }

  function renderHeader() {
    const header = document.getElementById('header')
    const isHome = currentPage === 'home'
    const isSearch = currentPage === 'search'
    if (isHome) {
      header.innerHTML = `<span class="brand-mark">${UI.icon('logo')}</span><div class="header-copy"><strong>飞研产业研究平台</strong></div><span class="header-spacer"></span><button class="icon-button" id="header-search" aria-label="搜索">${UI.icon('search')}</button>`
    } else if (isSearch) {
      header.innerHTML = `<button class="icon-button quiet" id="header-back" aria-label="返回">${UI.icon('back')}</button><div class="header-copy centered"><strong>全局搜索</strong></div><span class="header-balance"></span>`
    } else {
      const backControl = currentPage === 'graph'
        ? `<button class="icon-button quiet" id="header-back" aria-label="返回">${UI.icon('back')}</button>`
        : '<span class="header-balance"></span>'
      header.innerHTML = `${backControl}<button class="chain-title" id="chain-selector" aria-label="切换产业链"><strong>机器人产业链</strong>${UI.icon('down')}</button><button class="icon-button quiet" id="header-search" aria-label="搜索">${UI.icon('search')}</button>`
    }
    header.querySelector('#header-back')?.addEventListener('click', back)
    header.querySelector('#header-search')?.addEventListener('click', () => go('search'))
    header.querySelector('#chain-selector')?.addEventListener('click', () => UI.toast('当前仅开放机器人产业链'))
  }

  function renderTabbar() {
    const tabbar = document.getElementById('tabbar')
    const hidden = currentPage === 'search'
    tabbar.hidden = hidden
    if (hidden) return
    tabbar.innerHTML = TABS.map(tab => `<button class="tab-item ${currentPage === tab.key ? 'on' : ''}" data-tab="${tab.key}">${UI.icon(tab.icon)}<span>${tab.label}</span></button>`).join('')
    tabbar.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => go(button.dataset.tab))
  }

  async function render() {
    if (!store) return
    const version = ++renderVersion
    renderHeader()
    renderTabbar()
    const content = document.getElementById('content')
    content.className = `content page-${currentPage}`
    content.innerHTML = UI.loadingSkeleton(5)
    const module = pageModule()
    if (!module) {
      content.innerHTML = UI.emptyState('页面不存在', '当前页面模块未加载。')
      return
    }
    try {
      await module.render(content, { store, params, go, back })
      if (version !== renderVersion) return
      document.title = `${module.title || '飞研产业研究平台'} · 飞研产业研究平台`
    } catch (error) {
      console.error(error)
      content.innerHTML = UI.emptyState('页面加载失败', error.message || '未知错误', '<button class="primary-button" id="page-retry">重新加载</button>')
      content.querySelector('#page-retry')?.addEventListener('click', render)
    }
  }

  function go(page, nextParams = {}, options = {}) {
    if (!window.Pages?.[page]) page = 'home'
    currentPage = page
    params = nextParams
    const hash = encodeHash(page, nextParams)
    if (options.replace) history.replaceState(null, '', hash)
    else if (location.hash !== hash) history.pushState(null, '', hash)
    const content = document.getElementById('content')
    if (content) content.scrollTop = 0
    UI.closeSheet()
    render()
  }

  function back() {
    const module = pageModule()
    if (module?.handleBack?.()) return
    if (currentPage === 'search' && history.length > 1) {
      history.back()
      return
    }
    go('home')
  }

  function showConsent() {
    let accepted = false
    try { accepted = sessionStorage.getItem('feiyan-consent') === '1' } catch (_error) {}
    if (accepted) return
    UI.openSheet(`<div class="consent-copy"><span class="brand-mark large">${UI.icon('logo')}</span><h2>${UI.esc(COMPLIANCE.consentTitle)}</h2><p>${UI.esc(COMPLIANCE.consentBody)}</p><button class="primary-button" id="consent-ok">${UI.esc(COMPLIANCE.consentConfirm)}</button></div>`)
    document.getElementById('consent-ok').onclick = () => {
      try { sessionStorage.setItem('feiyan-consent', '1') } catch (_error) {}
      UI.closeSheet()
    }
  }

  async function boot() {
    const content = document.getElementById('content')
    content.innerHTML = UI.loadingSkeleton(6)
    try {
      store = await loadWorkbenchData('data/robot.json')
      window.store = store
      const route = decodeHash()
      currentPage = route.page
      params = route.params
      await render()
      showConsent()
    } catch (error) {
      console.error(error)
      renderHeader()
      document.getElementById('tabbar').hidden = true
      content.innerHTML = `<div class="fatal-state">${UI.icon('info')}<h2>真实数据加载失败</h2><p>${UI.esc(error.message)}</p><p class="muted">页面没有切换到示意数据，以避免展示无法确认的关系。</p><button class="primary-button" id="boot-retry">重新加载</button></div>`
      content.querySelector('#boot-retry').onclick = boot
    }
  }

  window.addEventListener('popstate', () => {
    const route = decodeHash()
    currentPage = route.page
    params = route.params
    render()
  })
  window.addEventListener('DOMContentLoaded', boot)
  window.App = { go, back, render, get store() { return store }, get currentPage() { return currentPage } }
})()


