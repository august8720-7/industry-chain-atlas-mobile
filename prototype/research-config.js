// 产业链研究展示层的最小配置。
// 只保存运营位与静态资产映射，不复制 Node / PathEdge / Containment 等底层数据。
(function () {
  'use strict'

  window.RESEARCH_CONFIG = Object.freeze({
    schemaVersion: 'feiyan-research-module-v2',
    hotInsightKeys: ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip'],
    insights: Object.freeze({
      robot: Object.freeze({
        title: '机器人产业链',
        summary: '沿上游关键零部件、核心产品与下游应用，先建立一张可下钻的研究地图。',
        poster: 'assets/机器人图解.png',
        posterStatus: 'ready'
      }),
      aerospace: Object.freeze({
        title: '航空航天产业链',
        homeTitle: '航空航天',
        summary: '卫星制造、发射与应用服务协同展开，先看产业化落在哪些环节。',
        poster: 'assets/航空航天产业链图解.png',
        posterStatus: 'ready'
      }),
      gold: Object.freeze({
        title: '黄金产业链',
        summary: '从资源与采选、冶炼加工到消费与渠道，查看黄金产业链的价值传导。',
        poster: 'assets/黄金产业链图解.png',
        posterStatus: 'ready'
      }),
      silver: Object.freeze({
        title: '白银产业链',
        summary: '工业需求与贵金属属性交织，梳理矿产、冶炼与应用环节。',
        poster: 'assets/白银产业链图解.png',
        posterStatus: 'ready'
      }),
      compute: Object.freeze({
        title: '算力产业链',
        summary: '从芯片、服务器到数据中心与应用，查看算力供给的关键承接环节。',
        poster: 'assets/算力产业链图解.png',
        posterStatus: 'ready'
      }),
      storage_chip: Object.freeze({
        title: '存储芯片产业链',
        homeTitle: '存储芯片',
        summary: '周期修复与国产化并行，先看产品、设备与材料环节。',
        poster: 'assets/存储芯片产业链图解.png',
        posterStatus: 'ready'
      })
    }),
    chainMarketIndex: Object.freeze({
      manifest: 'data/chain-market-index/manifest.json',
      label: '产业链行情',
      qualifier: '试算指数'
    }),
    nodeInsights: window.NODE_INSIGHTS || Object.freeze({})
  })
})()
