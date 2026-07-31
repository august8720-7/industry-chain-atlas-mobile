// 首页:平台级落地页(hero + 六链完整网格 + 专题分组目录),保持 V1.9 视觉语言
window.Page_home = {
  title: '首页',
  render(el, ctx) {
    if (!document.getElementById('pg-home-css')) {
      const s = document.createElement('style'); s.id = 'pg-home-css'
      s.textContent = `
      .pg-hm-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 16px 14px 14px; background: #EEF5FF url("./assets/首页大卡片底图_无黑角.png") center / cover no-repeat; box-shadow: var(--shadow-card); }
      .pg-hm-hero h2 { font-size: 21px; font-weight: 800; color: var(--t1); letter-spacing: .5px; position: relative; }
      .pg-hm-hero p { position: relative; max-width: 236px; margin: 0; color: var(--t2); font-size: 13px; line-height: 1.65; }

      .pg-hm-stats { position: relative; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 7px; margin: 13px 0 12px; }
      .pg-hm-stat { display: flex; align-items: center; gap: 6px; min-width: 0; }
      .pg-hm-stat .ic { width: 30px; height: 30px; border-radius: 9px; background: #fff; box-shadow: 0 2px 8px rgba(46,107,232,.13); color: var(--brand); display: flex; align-items: center; justify-content: center; flex: none; }
      .pg-hm-stat .k { overflow: hidden; color: var(--t3); font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; }
      .pg-hm-stat .v { color: var(--t1); font-size: 18px; font-weight: 800; line-height: 1.15; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .pg-hm-stat .v em { font-style: normal; font-size: 10px; font-weight: 500; color: var(--t3); margin-left: 1px; }
      .pg-hm-hero .search-bar { position: relative; min-width: 0; border: 0; box-shadow: 0 6px 18px rgba(46,107,232,.16); }
      .pg-hm-hero .search-bar input { min-width: 0; font-size: 13px; }
      .pg-hm-hero .search-bar .go { flex: none; padding-inline: 16px; }
      .pg-hm-strip { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 2px 16px 8px; }
      .pg-hm-strip > * { min-width: 0; }
      .pg-hm-chain { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 164px; overflow: hidden; padding: 13px 12px 12px; border: 1px solid rgba(255,255,255,.7); border-radius: 18px; box-shadow: var(--shadow-card); }
      .pg-hm-chain-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 7px; min-width: 0; }
      .pg-hm-chain-head > div { min-width: 0; }
      .pg-hm-chain .tt { font-size: 17px; font-weight: 800; color: var(--t1); }
      .pg-hm-chain .ds { min-height: 17px; margin-top: 4px; color: var(--t2); font-size: 10.5px; line-height: 1.5; }
      .pg-hm-chain-metrics { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 3px; margin-top: 10px; padding: 7px 5px; border: 1px solid rgba(255,255,255,.78); border-radius: 10px; background: rgba(255,255,255,.58); }
      .pg-hm-chain-metrics span { min-width: 0; text-align: center; }
      .pg-hm-chain-metrics b { display: block; overflow: hidden; color: var(--t1); font-size: 11.5px; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
      .pg-hm-chain-metrics em { display: block; margin-top: 2px; color: var(--t3); font-size: 8px; font-style: normal; }

      .pg-hm-foot { display: flex; align-items: center; margin-top: auto; padding-top: 10px; }
      .pg-hm-chain-head .blob { width: 38px; height: 38px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; }
      .pg-hm-chain-head .blob svg { width: 25px; height: 25px; }
      .pg-hm-enter { flex: 1; border: 0; border-radius: var(--r-pill); color: #fff; font-size: 12.5px; font-weight: 700; padding: 9px 0; cursor: pointer; font-family: var(--font); letter-spacing: .5px; }
      .pg-hm-market-panel { margin: 18px 16px 10px; padding: 12px 10px 10px; border: 1px solid #EDF0F5; border-radius: 18px; background: #fff; box-shadow: var(--shadow-card); }
      .pg-hm-market-head { display: flex; min-width: 0; align-items: center; gap: 7px; margin: 0 2px 10px; }
      .pg-hm-market-head .mark { display: grid; width: 20px; height: 20px; place-items: center; border-radius: 6px; background: var(--brand); color: #fff; }
      .pg-hm-market-head .mark svg { width: 13px; height: 13px; }
      .pg-hm-market-head h2 { color: var(--t1); font-size: 15px; line-height: 1; }
      .pg-hm-market-asof { display: flex; align-items: center; gap: 4px; margin-left: auto; color: var(--t3); font-size: 9px; white-space: nowrap; }
      .pg-hm-market-asof i { display: grid; width: 13px; height: 13px; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 8px; font-style: normal; }
      .pg-hm-market-track { display: grid; grid-auto-flow: column; grid-auto-columns: calc(33.333% - 5.34px); gap: 8px; overflow-x: auto; padding: 1px 1px 3px; scroll-snap-type: x mandatory; scrollbar-width: none; }
      .pg-hm-market-track::-webkit-scrollbar { display: none; }
      .pg-hm-market-card { min-width: 0; min-height: 126px; padding: 9px 8px 7px; border: 1px solid #E7ECF5; border-radius: 13px; background: linear-gradient(160deg,#FFFFFF,#F8FAFE); box-shadow: 0 5px 12px rgba(38,70,118,.08); cursor: pointer; scroll-snap-align: start; }
      .pg-hm-market-card:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
      .pg-hm-market-card-head { display: flex; min-width: 0; align-items: center; gap: 4px; }
      .pg-hm-market-card h3 { overflow: hidden; min-width: 0; color: var(--t1); font-size: 12px; line-height: 1.2; letter-spacing: -.15px; text-overflow: ellipsis; white-space: nowrap; }
      .pg-hm-market-icon { display: grid; width: 38px; height: 38px; margin-left: auto; place-items: center; flex: none; border-radius: 50%; }
      .pg-hm-market-icon svg { width: 25px; height: 25px; }
      .pg-hm-market-value { display: block; margin-top: 5px; color: var(--t1); font-size: 17px; line-height: 1.1; font-variant-numeric: tabular-nums; }
      .pg-hm-market-change { display: flex; min-width: 0; align-items: baseline; gap: 5px; margin-top: 4px; font-size: 9px; font-variant-numeric: tabular-nums; }
      .pg-hm-market-change b { font-size: 10px; }
      .pg-hm-market-change .up { color: #D94A4A; } .pg-hm-market-change .down { color: #12925A; } .pg-hm-market-change .flat { color: var(--t2); }
      .pg-hm-market-change small { overflow: hidden; color: var(--t3); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
      .pg-hm-market-spark { display: block; width: 100%; height: 34px; margin-top: 3px; }
      .pg-hm-market-card[data-market-state="loading"] { color: transparent; background: linear-gradient(100deg,#F5F7FA 25%,#EBF0F7 40%,#F5F7FA 58%); background-size: 200% 100%; animation: pg-hm-market-loading 1.2s infinite linear; }
      .pg-hm-market-error { display: grid; min-height: 108px; place-items: center; color: var(--t3); font-size: 10px; text-align: center; }
      @keyframes pg-hm-market-loading { to { background-position-x: -200%; } }
      @media (max-width: 370px) { .pg-hm-market-panel { margin-inline: 12px; padding-inline: 8px; } .pg-hm-market-card { padding-inline: 6px; } .pg-hm-market-card h3 { font-size: 11px; } }
      .pg-hm-filters { display: flex; align-items: center; gap: 8px; padding: 14px 16px 10px; }
      .pg-hm-fpill { padding: 7px 14px; border-radius: var(--r-pill); font-size: 13px; background: var(--card); border: 1px solid var(--line); color: var(--t2); cursor: pointer; white-space: nowrap; }
      .pg-hm-fpill.on { background: var(--brand); border-color: var(--brand); color: #fff; font-weight: 600; }
      .pg-hm-theme { background: var(--card); border-radius: var(--r-lg); box-shadow: var(--shadow-card); padding: 14px; margin: 0 16px 12px; }
      .pg-hm-theme-hd { display: flex; align-items: center; gap: 10px; cursor: pointer; }
      .pg-hm-theme-hd .ic { width: 40px; height: 40px; border-radius: 12px; background: var(--brand-weak); color: var(--brand); display: flex; align-items: center; justify-content: center; flex: none; }
      .pg-hm-theme-hd .tt { font-size: 16px; font-weight: 700; color: var(--t1); }
      .pg-hm-theme-hd .tt em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--t3); }
      .pg-hm-theme-hd .st { font-size: 11px; color: var(--t3); margin-top: 2px; }
      .pg-hm-theme-hd .tg { margin-left: auto; font-size: 12px; color: var(--brand); display: flex; align-items: center; gap: 2px; white-space: nowrap; font-weight: 600; }
      .pg-hm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
      .pg-hm-mini { min-height: 73px; border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px 10px 9px; cursor: pointer; position: relative; overflow: hidden; background: linear-gradient(150deg, #fff, #FAFBFE); }
      .pg-hm-mini .tags { padding-right: 28px; }
      .pg-hm-mini .nm { display: flex; min-width: 0; align-items: center; gap: 5px; padding-right: 0; color: var(--t1); font-size: 14px; font-weight: 700; flex-wrap: nowrap; }
      .pg-hm-mini .nm-label { overflow: hidden; min-width: 0; text-overflow: ellipsis; white-space: nowrap; }
      .pg-hm-mini .st-tag { font-size: 9px; font-weight: 600; padding: 2px 5px; border-radius: 4px; }
      .pg-hm-mini .tags { display: flex; gap: 6px; margin-top: 7px; font-size: 10px; color: var(--t3); }
      .pg-hm-mini .mi { position: absolute; right: 7px; bottom: 6px; display: grid; width: 30px; height: 30px; place-items: center; border-radius: 9px; background: #F3F6FA; color: #8FA0B7; }
      .pg-hm-mini .mi .lock-mark { position: absolute; right: -3px; bottom: -3px; display: grid; width: 14px; height: 14px; place-items: center; border: 1px solid #fff; border-radius: 50%; background: #8B98AA; color: #fff; }
      .pg-hm-mini .mi .lock-mark svg { width: 8px; height: 8px; }
      .pg-hm-mini .st-tag { display: inline-flex; align-items: center; gap: 3px; }
      .pg-hm-mini .st-tag svg { width: 9px; height: 9px; }
      .pg-hm-mini.dead { opacity: .8; }
      `
      document.head.appendChild(s)
    }

    const M = window.MOCK
    const P = M.platform
    // 统计口径:全部由列表现算,展示多少就是多少,不与列表脱节
    const stats = { chains: M.chainCatalog.length, themes: M.themes.length }
    const marketKeys = window.ChainMarketIndex?.expectedKeys || ['robot', 'aerospace', 'gold', 'silver', 'compute', 'storage_chip']

    // —— 视觉素材(线性 SVG,替代 mock 的 3D 渲染图) ——
    const ic = (paths, size = 24, sw = 1.8) => color =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
    const ART = {
      robot: ic('<circle cx="12" cy="9" r="4.5"/><path d="M9.8 8.5h.01M14.2 8.5h.01M12 4.5V2.5M6 20c.8-3.4 3-5 6-5s5.2 1.6 6 5M4.5 9h3M16.5 9h3"/>', 30),
      aerospace: ic('<path d="M12 2.5c3 2.5 4.5 6 4.5 9.5l-2 6h-5l-2-6c0-3.5 1.5-7 4.5-9.5z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M7.5 14L4 18l4-.5M16.5 14L20 18l-4-.5M10.5 18l1.5 3.5L13.5 18"/>', 30),
      gold: ic('<path d="M6.5 10h5l1.5 4.5h-8L6.5 10zM12.5 10h5l1.5 4.5h-8l1.5-4.5zM9.5 5h5L16 9.5H8L9.5 5z"/>', 30),
      compute: ic('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/><circle cx="16.5" cy="16" r=".9" fill="currentColor"/>', 30),
      storage_chip: ic('<rect x="7" y="7" width="10" height="10" rx="1.6"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/>', 30),
      silver: ic('<circle cx="12" cy="12" r="7.5"/><path d="M12 7.5v9M9.2 9.5c0-1 1.2-1.7 2.8-1.7s2.8.7 2.8 1.7c0 2.6-5.6 2.3-5.6 5 0 1 1.2 1.7 2.8 1.7s2.8-.7 2.8-1.7"/>', 30)
    }
    // 当前最热复用上一版六条开放产业链的独立图标，不另造一套行情图标。
    const LEGACY_OPEN_CHAIN_ICONS = ART
    const MINI = {
      '机器人': ART.robot, '航空航天': ART.aerospace, '黄金': ART.gold, '算力': ART.compute,
      '存储芯片': ART.storage_chip, '白银': ART.silver, '新一代信息技术': ART.storage_chip,
      '具身智能': ic('<path d="M9.5 3.5A5.5 5.5 0 0115 8.9l2.3 3.9-2 .7v2a2 2 0 01-2 2h-1v3H7.5v-3.6A6.3 6.3 0 019.5 3.5z"/><circle cx="11.5" cy="9.5" r="1" fill="currentColor"/>'),
      '人工智能': ic('<path d="M9.5 3.5A5.5 5.5 0 0115 8.9l2.3 3.9-2 .7v2a2 2 0 01-2 2h-1v3H7.5v-3.6A6.3 6.3 0 019.5 3.5z"/><circle cx="11.5" cy="9.5" r="1" fill="currentColor"/>'),
      '低空经济': ic('<circle cx="5" cy="5.5" r="2"/><circle cx="19" cy="5.5" r="2"/><rect x="9" y="9.5" width="6" height="5" rx="1.5"/><path d="M6.5 7L10 10M17.5 7L14 10M12 14.5V18M9 18h6"/>'),
      '量子科技': ic('<ellipse cx="12" cy="12" rx="8.5" ry="3.4"/><ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/>'),
      '原油': ic('<path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 11-12 0c0-3.2 2.5-6.5 6-11z"/>'),
      '铜': ic('<path d="M7 9h10l2 6H5l2-6z"/><path d="M9 9l1-3h4l1 3"/>'),
      '铁矿石': ic('<path d="M7 4h10l4 5-9 11L3 9l4-5z"/><path d="M3 9h18M12 20L8.5 9 12 4l3.5 5L12 20z"/>'),
      '固态电池': ic('<rect x="4" y="7" width="15" height="10" rx="2"/><path d="M21 10.5v3M12 9l-2 3h3.5l-2 3"/>'),
      '创新药': ic('<rect x="3.8" y="9" width="16.4" height="6.2" rx="3.1" transform="rotate(-32 12 12)"/><path d="M9.3 9.7l5.4 4.6" transform="rotate(0 12 12)"/>')
    }
    const DOMAIN_ART = {
      chip: ART.storage_chip,
      digital: ic('<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 11l10-4M7 13l10 4"/>'),
      manufacturing: ic('<path d="M4 20V9l5 3V8l5 3V4l6 4v12H4z"/><path d="M8 17h2M13 17h2M17 13h1"/>'),
      transport: ic('<path d="M4 16l1.5-5a2 2 0 012-1.5h9a2 2 0 012 1.5L20 16v3h-2M4 16v3h2M4 16h16"/><circle cx="8" cy="18.5" r="1.5"/><circle cx="16" cy="18.5" r="1.5"/>'),
      energy: ic('<path d="M13 3l-6 9h4l-1 9 7-11h-4V3z"/>'),
      metal: ic('<path d="M6 9h12l2 8H4l2-8z"/><path d="M9 9l1-4h4l1 4M8 13h8"/>'),
      chemical: ic('<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/><path d="M7.5 16h9"/>'),
      agriculture: ic('<path d="M12 21V9M12 14C7 14 4.5 11.5 4 7c4.5-.5 7.5 1.8 8 7zM12 11c4.5 0 7-2.2 8-6-4-.5-7 1.5-8 6z"/>'),
      healthcare: ic('<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/>'),
      consumer: ic('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 9V6a3 3 0 016 0v3"/>'),
      finance: ic('<path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>'),
      construction: ic('<path d="M4 21V8h9v13M13 12h7v9M7 11h3M7 15h3M16 15h2M2 21h20"/>'),
      environment: ic('<path d="M12 21V9M12 14C7 14 4.5 11.5 4 7c4.5-.5 7.5 1.8 8 7z"/><path d="M14 8c1.5-2.5 3.5-4 6-4-.2 3-1.7 5-4.5 6"/>'),
      materials: ic('<path d="M7 4h10l4 5-9 11L3 9l4-5z"/><path d="M3 9h18M12 20L8.5 9 12 4l3.5 5L12 20z"/>'),
      culture: ic('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/>'),
      logistics: ic('<path d="M3 7h11v9H3V7zM14 10h4l3 3v3h-7v-6z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
      services: ic('<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M4 12h16M10 12v2h4v-2"/>'),
      industry: ic('<path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>')
    }
    const FAMILY_RULES = [
      ['healthcare', /医药|制药|原料药|医疗|生物|基因|细胞|中药|兽药|脑机|健康/],
      ['chip', /半导体|芯片|PCB|电子|显示|LED|存储|光通信|手机|可穿戴/],
      ['environment', /环保|治理|污水|水务|固废|节能|清洁|绿色|大气/],
      ['metal', /黄金|白银|铜|铁|铝|镍|锡|锌|铅|钢|硅铁|锰硅|钯|铂|有色金属|热卷/],
      ['chemical', /化工|甲醇|乙二醇|苯|二甲苯|PVC|聚丙烯|塑料|尿素|沥青|LPG|橡胶|纯碱|农药|化肥|涂料|化纤|PTA|燃油/],
      ['agriculture', /农业|种植|养殖|豆|菜|花生|棉|糖|生猪|鸡|蛋|苹果|红枣|玉米|粳米|奶牛|水产|种子|粮食|纸浆|原木/],
      ['finance', /证券|保险|银行|金融|租赁/],
      ['culture', /游戏|短剧|电影|文创|元宇宙|广告|旅游|景区|休闲|教育/],
      ['transport', /汽车|航空|航天|飞机|无人机|船舶|高铁|城轨|铁路|轨道交通|集运/],
      ['construction', /房地产|建筑|建材|水泥|玻璃|胶合板|纤维板/],
      ['logistics', /物流|仓储|运输/],
      ['consumer', /消费|零售|电商|家电|家居|电视|厨房|白酒|啤酒|食品|饮料|乳制品|酒店|纺织|服饰|包装/],
      ['materials', /新材料|碳纤维|高性能纤维|磁性材料|玻纤/],
      ['energy', /能源|电力|光伏|风电|核电|水电|发电|电网|变压器|氢|储能|充电桩|煤炭|天然气|燃气|原油|电池/],
      ['manufacturing', /机器人|装备|自动化|工业母机|机械|电梯|制造/],
      ['digital', /人工智能|智能计算|算力|量子|通信|网络|互联网|云计算|大数据|软件|数字|物联网|计算机|IDC|5G|6G/]
    ]
    const LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>'
    const iconMeta = (name, topic = '', attr = '') => {
      if (MINI[name]) return { family: 'featured', draw: MINI[name] }
      const text = `${name} ${attr} ${topic}`
      const match = FAMILY_RULES.find(([, rule]) => rule.test(text))
      return { family: match?.[0] || 'industry', draw: DOMAIN_ART[match?.[0] || 'industry'] }
    }
    const miniIcon = (name, topic, attr) => {
      const meta = iconMeta(name, topic, attr)
      return { family: meta.family, svg: meta.draw('#8FA0B7') }
    }
    const TINT = {
      robot:        { bg: 'linear-gradient(165deg,#FBFDFF,#E1EDFF)', color: '#2E6BE8', blob: 'rgba(46,107,232,.12)' },
      aerospace:    { bg: 'linear-gradient(165deg,#FCFBFF,#E8E4FE)', color: '#6C5CE7', blob: 'rgba(108,92,231,.12)' },
      gold:         { bg: 'linear-gradient(165deg,#FFFDF6,#FAEECF)', color: '#D8940F', blob: 'rgba(216,148,15,.14)' },
      compute:      { bg: 'linear-gradient(165deg,#FAFFFC,#DDF4E8)', color: '#1CA565', blob: 'rgba(28,165,101,.12)' },
      storage_chip: { bg: 'linear-gradient(165deg,#FBFDFF,#DEEBFF)', color: '#2E6BE8', blob: 'rgba(46,107,232,.12)' },
      silver:       { bg: 'linear-gradient(165deg,#FCFDFF,#E6EBF2)', color: '#64748B', blob: 'rgba(100,116,139,.14)' }
    }
    const themeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V9l8-5.5L20 9v11M4 20h16M9.5 20v-5h5v5"/></svg>'
    const statIcons = [
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/></svg>',
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>'
    ]


    let filter = '全部'
    const marketTone = key => TINT[key] || TINT.robot
    const marketNumber = value => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const marketSigned = value => `${Number(value) > 0 ? '+' : ''}${marketNumber(value)}%`
    const marketDirection = value => Number(value) > 0 ? 'up' : Number(value) < 0 ? 'down' : 'flat'
    const marketDate = value => {
      const text = String(value || '')
      if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6)}`
      return text || '—'
    }

    function mountMarketPerformance() {
      const loader = window.ChainMarketIndex
      const asOf = el.querySelector('[data-home-market-asof]')
      if (!loader) {
        el.querySelectorAll('[data-market-key]').forEach(host => { host.innerHTML = '<div class="pg-hm-market-error">行情组件未加载</div>' })
        return
      }
      loader.getManifest().then(manifest => {
        if (asOf) asOf.firstChild.textContent = `截至 ${marketDate(manifest.dataAsOf)} 收盘`
      }).catch(() => {})
      el.querySelectorAll('[data-market-key]').forEach(host => {
        const key = host.dataset.marketKey
        loader.getChain(key).then(data => {
          const latest = data.latest
          const tone = marketTone(key)
          const title = data.entry.title
          const dayClass = marketDirection(latest.changePct)
          const fiveClass = marketDirection(latest.fiveDayPct)
          host.dataset.marketState = 'ready'
          host.setAttribute('aria-label', `${title}产业链表现，收盘 ${marketNumber(latest.close)}`)
          host.innerHTML = `<div class="pg-hm-market-card-head"><h3>${title}</h3><span class="pg-hm-market-icon" style="background:${tone.blob};color:${tone.color}">${LEGACY_OPEN_CHAIN_ICONS[key](tone.color)}</span></div>
            <strong class="pg-hm-market-value">${marketNumber(latest.close)}</strong>
            <div class="pg-hm-market-change"><b class="${dayClass}">${marketSigned(latest.changePct)}</b><small>5日 <span class="${fiveClass}">${marketSigned(latest.fiveDayPct)}</span></small></div>
            <canvas class="pg-hm-market-spark" aria-label="${title}近 ${data.seriesData.series.length} 个交易日走势"></canvas>`
          requestAnimationFrame(() => {
            const canvas = host.querySelector('canvas')
            if (canvas) UI.sparkline(canvas, data.seriesData.series.map(point => Number(point.close)), '#2E6BE8', false)
          })
        }).catch(error => {
          host.dataset.marketState = 'error'
          host.innerHTML = `<div class="pg-hm-market-error">${error.message}<br>点击重试</div>`
          host.onclick = () => { loader.clear(key); mountMarketPerformance() }
        })
      })
    }

    const expandedThemes = {}

    function toast(msg) {
      const t = document.createElement('div')
      t.className = 'pg-hm-toast'; t.textContent = msg
      document.getElementById('phone').appendChild(t)
      setTimeout(() => t.remove(), 1600)
    }
    async function enterChain(key) {
      const chain = M.chainCatalog.find(item => item.key === key)
      if (!chain || !chain.live) {
        toast(`「${chain ? chain.title : key}」产业链需开通查看权限，请联系专属客户经理`)
        return
      }
      await ctx.selectChain(key, 'overview')
    }

    function themeCard(th) {
      const compactMode = filter === '全部'
      const isExpanded = Boolean(expandedThemes[th.key])
      const prioritizedItems = [...th.items.filter(item => item.live), ...th.items.filter(item => !item.live)]
      const visibleItems = compactMode && !isExpanded ? prioritizedItems.slice(0, 2) : th.items
      const toggleAttr = compactMode ? ` data-toggle="${th.key}"` : ''
      const toggleText = compactMode ? `${isExpanded ? '收起' : '查看全部'} ${UI.icons.chev}` : '全部展示'
      return `
      <div class="pg-hm-theme" data-theme="${th.key}">
        <div class="pg-hm-theme-hd"${toggleAttr}>
          <span class="ic">${themeIcon}</span>
          <div>
            <div class="tt">${th.name} <em>· ${th.items.length} 条</em></div>
            <div class="st">${th.sub}</div>
          </div>
          <span class="tg">${toggleText}</span>
        </div>
        <div class="pg-hm-grid">
          ${visibleItems.map(it => {
            const icon = miniIcon(it.name, th.name, it.attr)
            const stTag = it.live
              ? '<span class="st-tag" style="background:var(--mid-soft);color:var(--mid-ink)">可直接查看</span>'
              : `<span class="st-tag" style="background:var(--bg);color:var(--t3)">${LOCK_ICON}已锁定</span>`
            return `<div class="pg-hm-mini ${it.live ? '' : 'dead'}" data-key="${it.key || ''}" data-name="${it.name}" data-live="${it.live === true}">
              <div class="nm"><span class="nm-label">${it.name}</span>${stTag}</div>
              <div class="tags">${it.live ? '<span>图谱</span><span>公司</span><span>指标</span>' : '<span>联系专属客户经理</span>'}</div>
              <span class="mi" data-icon-family="${icon.family}">${icon.svg}${it.live ? '' : `<span class="lock-mark">${LOCK_ICON}</span>`}</span>
            </div>`
          }).join('')}
        </div>
      </div>`
    }

    function draw() {
      const themesShown = filter === '全部' ? M.themes : M.themes.filter(t => t.name.startsWith(filter))
      el.innerHTML = `
        <div class="page-pad" style="padding-bottom:0">
          <div class="pg-hm-hero">
            <p>${P.slogan}</p>
            <div class="pg-hm-stats">
              <div class="pg-hm-stat"><span class="ic">${statIcons[0]}</span><div><div class="k">已收录</div><div class="v">${stats.chains}<em>条产业链</em></div></div></div>
              <div class="pg-hm-stat"><span class="ic">${statIcons[1]}</span><div><div class="k">专题</div><div class="v">${stats.themes}<em>个</em></div></div></div>
            </div>
            <div class="search-bar" id="pg-hm-search" style="cursor:pointer">
              ${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}
              <input placeholder="搜产业链、节点、公司、指标" readonly style="pointer-events:none">
              <button class="go">搜索</button>
            </div>
          </div>
        </div>

        <section class="pg-hm-market-panel" aria-labelledby="pg-hm-market-title">
          <header class="pg-hm-market-head"><span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18V9l4 2 4-6 4 4 4-3v12z"/><path d="M4 18h16"/></svg></span><h2 id="pg-hm-market-title">当前最热</h2><span class="pg-hm-market-asof" data-home-market-asof>截至上一交易日收盘<i>i</i></span></header>
          <div class="pg-hm-market-track" aria-label="六条产业链行情，横向滑动查看全部">
            ${marketKeys.map(key => `<article class="pg-hm-market-card" data-market-key="${key}" data-market-state="loading" role="button" tabindex="0"><span>正在加载</span></article>`).join('')}
          </div>
        </section>

        <div class="pg-hm-filters">
          ${['全部', '十五五规划', '期货', '热门'].map(f => `<span class="pg-hm-fpill ${filter === f ? 'on' : ''}" data-f="${f}">${f}</span>`).join('')}
        </div>
        ${themesShown.map(themeCard).join('')}
        <div class="page-pad" style="padding-top:0">${UI.disclaimer()}</div>`

      mountMarketPerformance()

      // 事件
      el.querySelector('#pg-hm-search').onclick = () => ctx.go('search')
      el.querySelectorAll('[data-market-key]').forEach(card => card.onclick = () => enterChain(card.dataset.marketKey))
      el.querySelectorAll('.pg-hm-fpill').forEach(p => p.onclick = () => {
        filter = p.dataset.f
        Object.keys(expandedThemes).forEach(key => delete expandedThemes[key])
        draw()
      })
      el.querySelectorAll('[data-toggle]').forEach(h => h.onclick = () => {
        expandedThemes[h.dataset.toggle] = !expandedThemes[h.dataset.toggle]; draw()
      })
      el.querySelectorAll('.pg-hm-mini').forEach(m => m.onclick = () => {
        if (m.dataset.live === 'true') enterChain(m.dataset.key)
        else toast(`「${m.dataset.name}」产业链需开通查看权限，请联系专属客户经理`)
      })
    }
    draw()
  }
}
