// 六条产业链行情试算指数：按 manifest 懒加载、校验并缓存单链序列。
(function () {
  'use strict'

  const MANIFEST_URL = 'data/chain-market-index/manifest.json'
  const MANIFEST_SCHEMA = 'feiyan-chain-market-index-manifest-v1'
  const SERIES_SCHEMA = 'feiyan-chain-market-index-v1'
  const EXPECTED_KEYS = ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip']
  let manifestPromise = null
  const seriesPromises = new Map()

  async function fetchJson(url, label) {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`${label}加载失败（HTTP ${response.status}）`)
    try {
      return await response.json()
    } catch (_error) {
      throw new Error(`${label}不是有效 JSON`)
    }
  }

  function finite(value, field) {
    const number = Number(value)
    if (!Number.isFinite(number)) throw new Error(`产业链行情字段 ${field} 无效`)
    return number
  }

  function validateManifest(raw) {
    if (raw?.schemaVersion !== MANIFEST_SCHEMA) throw new Error('产业链行情 manifest 版本不受支持')
    if (!Array.isArray(raw.chains)) throw new Error('产业链行情 manifest 缺少 chains')
    const keys = raw.chains.map(item => item?.key)
    if (raw.chains.length !== EXPECTED_KEYS.length || EXPECTED_KEYS.some(key => !keys.includes(key)) || new Set(keys).size !== raw.chains.length) {
      throw new Error('产业链行情 manifest 未完整覆盖 6 条产业链')
    }
    if (raw.audit?.coverageErrors !== 0 || raw.audit?.completeChains !== EXPECTED_KEYS.length) {
      throw new Error('产业链行情数据覆盖审计未通过')
    }
    raw.chains.forEach(item => {
      if (!/^series\/[a-z0-9_-]+\.json$/.test(String(item.file || ''))) throw new Error(`产业链行情文件路径无效：${item.key || 'unknown'}`)
      if (!item.latest?.date) throw new Error(`产业链行情缺少最新日期：${item.key || 'unknown'}`)
    })
    return raw
  }

  function getManifest() {
    if (!manifestPromise) manifestPromise = fetchJson(MANIFEST_URL, '产业链行情清单').then(validateManifest)
    return manifestPromise
  }

  async function loadChain(key) {
    const manifest = await getManifest()
    const entry = manifest.chains.find(item => item.key === key)
    if (!entry) throw new Error(`未找到 ${key} 产业链行情`)
    const raw = await fetchJson(`data/chain-market-index/${entry.file}`, `${entry.title}产业链行情`)
    if (raw?.schemaVersion !== SERIES_SCHEMA || raw.key !== key) throw new Error(`${entry.title}产业链行情版本或标识不一致`)
    if (!Array.isArray(raw.series) || raw.series.length < 2) throw new Error(`${entry.title}产业链行情序列不足`)
    const latest = raw.series[raw.series.length - 1]
    if (String(latest.date) !== String(entry.latest.date)) throw new Error(`${entry.title}产业链行情最新日期与清单不一致`)
    const fields = ['open', 'high', 'low', 'close', 'change', 'changePct', 'fiveDayPct', 'volumeWanShares', 'amountYuan']
    fields.forEach(field => finite(latest[field], field))
    if (raw.coverage?.anomalies?.length) throw new Error(`${entry.title}产业链行情仍有未处理异常`)
    return Object.freeze({ manifest, entry, seriesData: raw, latest })
  }

  function getChain(key) {
    if (!seriesPromises.has(key)) seriesPromises.set(key, loadChain(key).catch(error => {
      seriesPromises.delete(key)
      throw error
    }))
    return seriesPromises.get(key)
  }

  function clear(key) {
    if (key) seriesPromises.delete(key)
    else {
      manifestPromise = null
      seriesPromises.clear()
    }
  }

  window.ChainMarketIndex = Object.freeze({ getManifest, getChain, clear, expectedKeys: Object.freeze([...EXPECTED_KEYS]) })
})()
