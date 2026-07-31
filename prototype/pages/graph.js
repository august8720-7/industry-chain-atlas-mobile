// 图谱:总览=动态层级/分类列表;详情=真实上下游折线 + 全量一级包含关系 + 公司/指标 Tab
// 记住最近聚焦的节点,从分段控件直接切到"详情"时有合理默认
var __graphLastFocus = ''
var __graphDetailTab = 'co'
var __graphRelationExpanded = Object.create(null)
var __graphLaneExpanded = Object.create(null)
var __graphIndicatorsExpanded = Object.create(null)
window.Page_graph = {
  title: '详情',
  render(el, ctx) {
    if (!document.getElementById('pg-graph-css')) {
      const s = document.createElement('style'); s.id = 'pg-graph-css'
      s.textContent = `
      .pg-gr-filters { display: flex; align-items: center; gap: 6px; padding: 2px 16px 12px; flex-wrap: wrap; }
      .pg-gr-locate { position: relative; margin: 2px 16px 10px; }
      .pg-gr-locate-results { position: absolute; left: 0; right: 0; top: calc(100% + 5px); z-index: 20; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--card); box-shadow: 0 12px 30px rgba(23,28,38,.14); }
      .pg-gr-locate-hit { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: pointer; }
      .pg-gr-locate-hit:last-child { border-bottom: 0; }
      .pg-gr-locate-hit .meta { margin-top: 2px; color: var(--t3); font-size: 10px; }
      .pg-gr-locate-empty { padding: 13px; color: var(--t3); font-size: 12px; text-align: center; }
      .pg-gr-pill { display: inline-flex; align-items: center; gap: 2px; padding: 6px 9px; border-radius: var(--r-sm); font-size: 12px; background: var(--card); border: 1px solid var(--line); color: var(--t2); cursor: pointer; white-space: nowrap; }
      .pg-gr-pill.on { background: var(--brand-weak); border-color: transparent; color: var(--brand); font-weight: 600; }
      .pg-gr-legend { margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--t2); white-space: nowrap; }
      .pg-gr-legend .ln { width: 18px; height: 0; border-top: 2px solid var(--brand); display: inline-block; margin-right: 3px; border-radius: 2px; }
      .pg-gr-legend .ln.dash { border-top: 2px dashed #B9C4D6; }
      .pg-gr-metric-legend { flex: 0 0 auto; margin-left: auto; display: flex; align-items: center; justify-content: flex-end; gap: 14px; min-height: 20px; color: var(--t2); font-size: 10.5px; }
      .pg-gr-metric-legend span { display: inline-flex; align-items: center; gap: 4px; }
      .pg-gr-metric-legend svg { width: 14px; height: 14px; }
      .pg-gr-metric-legend .co { color: #1F7AB7; }
      .pg-gr-metric-legend .ind { color: #1AA86F; }
      .pg-gr-metric-legend em { color: var(--t3); font-style: normal; }
      .pg-gr-banner { display: flex; align-items: center; justify-content: space-between; margin: 0 16px 14px; padding: 9px 12px; background: var(--brand-weak); border-radius: var(--r-sm); font-size: 12px; color: var(--brand); font-weight: 600; }
      .pg-gr-banner .bt { display: flex; align-items: center; gap: 6px; }
      .pg-gr-note { margin: 2px 16px 0; padding: 9px 12px; background: #EFF2F7; border-radius: var(--r-sm); font-size: 10.5px; line-height: 1.6; color: var(--t3); }
      .pg-gr-wrap { position: relative; padding: 0 16px 14px; }
      .pg-gr-band { position: relative; display: flex; gap: 26px; margin-bottom: 18px; }
      .pg-gr-rail { flex: none; width: 92px; border-radius: 14px; padding: 16px 10px; align-self: stretch; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; color: #fff; }
      .pg-gr-rail .tt { font-size: 14px; font-weight: 700; letter-spacing: 1px; }
      .pg-gr-rail .st { font-size: 11px; opacity: .85; line-height: 1.6; }
      .pg-gr-rows { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 2; }
      .pg-gr-lane { display: flex; flex-direction: column; gap: 7px; padding: 9px; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,.78); }
      .pg-gr-lane .node-row { display: grid; grid-template-columns: 8px minmax(0,1fr) auto 12px; grid-template-areas: "dot name metrics arrow"; align-items: center; column-gap: 8px; min-height: 44px; padding: 8px 10px; }
      .pg-gr-lane .node-row .pg-gr-dot { grid-area: dot; }
      .pg-gr-lane .node-row .nm { grid-area: name; min-width: 0; white-space: normal; overflow: visible; text-overflow: clip; line-height: 1.35; overflow-wrap: anywhere; }
      .pg-gr-core-tag { display: inline-flex; align-items: center; margin-left: 5px; padding: 1px 4px; border-radius: 4px; background: #FFF1D8; color: #B66B00; font-size: 8px; font-weight: 750; line-height: 1.35; vertical-align: 1px; white-space: nowrap; }
      .pg-gr-core-parent { display: block; margin-top: 3px; color: var(--t3); font-size: 9px; font-weight: 500; }
      .pg-gr-core-empty { margin: 0 16px 14px; padding: 22px 14px; border: 1px dashed var(--line-strong); border-radius: 12px; color: var(--t3); font-size: 11px; text-align: center; }
      .pg-gr-covset { grid-area: metrics; display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
      .pg-gr-cov { display: inline-flex; align-items: center; gap: 2px; color: var(--t3); font-size: 10.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .pg-gr-cov svg { width: 13px; height: 13px; display: block; }
      .pg-gr-cov b { color: inherit; font-size: inherit; }
      .pg-gr-cov-co { color: #1F7AB7; }
      .pg-gr-cov-ind { color: #1AA86F; }
      .pg-gr-lane .node-row > span:last-child { grid-area: arrow; align-self: center; }
      .pg-gr-lane-hd { display: flex; align-items: center; gap: 6px; min-width: 0; color: var(--t2); font-size: 11px; font-weight: 700; }
      .pg-gr-lane-hd b { min-width: 20px; padding: 1px 6px; border-radius: 999px; background: var(--brand-weak); color: var(--brand); font-size: 10px; text-align: center; }
      .pg-gr-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
      .pg-gr-more { text-align: center; font-size: 13px; color: var(--t3); padding: 4px 0; cursor: pointer; }
      .pg-gr-svg { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
      /* —— 聚焦视图:局部关系图 —— */
      .pg-gr-back { display: flex; align-items: center; gap: 4px; padding: 4px 16px 10px; font-size: 13px; color: var(--brand); font-weight: 600; cursor: pointer; }
      .pg-gr-posbar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center; gap: 14px; padding: 6px 14px 12px; font-size: 11px; }
      .pg-gr-posbar .stage-slot { position: relative; min-width: 0; }
      .pg-gr-posbar .stage-slot:not(:last-child)::after { content: '→'; position: absolute; top: 50%; right: -12px; width: 10px; color: #B4BED0; font-size: 12px; font-weight: 700; text-align: center; transform: translateY(-50%); }
      .pg-gr-posbar .seg { display: block; overflow: hidden; width: 100%; margin: 0; padding: 6px 4px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--t3); font-weight: 600; text-align: center; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
      .pg-gr-posbar .seg.on { color: #fff; font-weight: 750; }
      .pg-gr-posbar .seg.boundary { border-style: dashed; background: transparent; color: var(--t3); cursor: default; }
      .pg-gr-relation-key { display: flex; align-items: center; justify-content: center; gap: 18px; margin: -2px 16px 10px; font-size: 10.5px; color: var(--t3); }
      .pg-gr-relation-key span { display: inline-flex; align-items: center; gap: 5px; }
      .pg-gr-relation-key .elbow { position: relative; width: 18px; height: 10px; border-left: 1.8px solid var(--mid); border-bottom: 1.8px solid var(--mid); }
      .pg-gr-relation-key .elbow::after { content: ''; position: absolute; right: -1px; bottom: -3px; border-left: 4px solid var(--mid); border-top: 2.5px solid transparent; border-bottom: 2.5px solid transparent; }
      .pg-gr-relation-key .contain-tree { width: 18px; height: 10px; border-left: 1.4px dashed #9CAAC0; border-bottom: 1.4px dashed #9CAAC0; }
      .pg-gr-detail-search { position: relative; margin: 2px 16px 10px; }
      .pg-gr-detail-results { position: absolute; left: 0; right: 0; top: calc(100% + 5px); z-index: 30; max-height: 330px; overflow-y: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--card); box-shadow: 0 12px 30px rgba(23,28,38,.16); }
      .pg-gr-detail-group { padding: 7px 12px 5px; background: #F6F8FB; color: var(--t3); font-size: 10px; font-weight: 700; }
      .pg-gr-detail-hit { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-bottom: 1px solid var(--line); cursor: pointer; }
      .pg-gr-detail-hit:last-child { border-bottom: 0; }
      .pg-gr-detail-hit .name { color: var(--t1); font-size: 12px; font-weight: 700; }
      .pg-gr-detail-hit .meta { margin-top: 2px; color: var(--t3); font-size: 9.5px; line-height: 1.35; }
      .pg-gr-ego { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; padding: 4px 14px 20px; transition: transform .18s ease; }
      .pg-gr-node-links { position: absolute; inset: 0; z-index: 3; overflow: visible; pointer-events: none; }
      .pg-gr-node-path { fill: none; stroke-width: 1.45; stroke-linecap: round; stroke-linejoin: round; opacity: .72; filter: drop-shadow(0 1px 1px rgba(23,28,38,.06)); }
      .pg-gr-node-trunk { stroke-width: 1.7; opacity: .8; }
      .pg-gr-node-junction { stroke: #fff; stroke-width: 1.2; }
      .pg-gr-ego-group { --group-color: var(--mid); --group-soft: var(--mid-soft); position: relative; min-width: 0; z-index: 2; border: 0; border-radius: 0; padding: 46px 3px 6px; background: transparent; box-shadow: none; overflow: visible; }
      .pg-gr-ego-group.current { border: 0; background: transparent; box-shadow: none; }
      .pg-gr-group-head { position: absolute; top: 9px; left: 8px; right: 8px; min-width: 0; }
      .pg-gr-group-head .title { display: flex; align-items: center; gap: 5px; min-width: 0; color: var(--group-color); font-size: 11.5px; font-weight: 750; line-height: 1.2; white-space: nowrap; }
      .pg-gr-group-head .title i { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--group-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--group-color) 13%, transparent); }
      .pg-gr-group-head small { display: block; overflow: hidden; margin-top: 4px; color: var(--t3); font-size: 9px; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; }
      .pg-gr-ego-col { position: relative; display: flex; flex-direction: column; justify-content: center; gap: 10px; width: auto; min-width: 0; padding-left: 0; color: var(--group-color); }
      .pg-gr-ego-col::before { display: none; }
      #ego-mid::before { display: none; }
      .pg-gr-ego-card { position: relative; z-index: 5; min-width: 0; background: var(--card); border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px 7px; display: flex; align-items: center; gap: 6px; cursor: pointer; box-shadow: var(--shadow-card); }
      .pg-gr-ego-card:not(.dots)::before { display: none; }
      .pg-gr-ego-card:not(.dots)::after { display: none; }
      #ego-mid .pg-gr-ego-card::before, #ego-mid .pg-gr-ego-card::after { display: none; }
      .pg-gr-ego-card .nm { font-size: 12px; font-weight: 600; color: var(--t1); line-height: 1.3; }
      .pg-gr-card-meta { display: block; margin-top: 3px; color: var(--t3); font-size: 8.5px; font-weight: 500; line-height: 1.25; }
      .pg-gr-ego-card.center { border-width: 2px; padding: 13px 9px; box-shadow: 0 4px 16px rgba(23,28,38,.10); }
      .pg-gr-ego-card.center .nm { font-size: 13px; }
      .pg-gr-ego-card.dots { justify-content: center; min-height: 40px; color: var(--t3); box-shadow: none; background: rgba(240,243,248,.78); border-style: dashed; cursor: default; }
      .pg-gr-relation-more { position: relative; z-index: 6; width: 100%; min-height: 36px; border: 1px dashed color-mix(in srgb, var(--group-color) 40%, white); border-radius: 10px; background: rgba(255,255,255,.84); color: var(--group-color); font-size: 9px; font-weight: 720; cursor: pointer; transition: background .16s ease,border-color .16s ease; }
      .pg-gr-relation-more strong { display: block; margin-bottom: 2px; font-size: 15px; line-height: .7; letter-spacing: 2px; }
      .pg-gr-relation-more[aria-expanded="true"] { border-style: solid; border-color: color-mix(in srgb, var(--group-color) 30%, white); background: color-mix(in srgb, var(--group-soft) 58%, white); }
      .pg-gr-relation-more[aria-expanded="true"] strong { font-size: 12px; line-height: 1; letter-spacing: 0; }
      .pg-gr-ego-card { animation: pg-gr-card-in .18s ease both; }
      @keyframes pg-gr-card-in { from { opacity: .45; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
      .pg-gr-contain-summary { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin-top: 4px; }
      .pg-gr-contain-stat { padding: 12px; border: 1px solid color-mix(in srgb, var(--mid) 24%, white); border-radius: 13px; background: color-mix(in srgb, var(--mid-soft) 48%, white); }
      .pg-gr-contain-stat span { display: block; color: var(--t3); font-size: 10.5px; }
      .pg-gr-contain-stat b { display: block; margin-top: 4px; color: var(--mid); font-size: 20px; }
      .pg-gr-contain-parent { display: flex; align-items: center; gap: 6px; margin: 12px 0 4px; padding: 8px 10px; border-radius: 10px; background: #F4F7FA; color: var(--t2); font-size: 11px; }
      .pg-gr-contain-section { margin-top: 14px; color: var(--t1); font-size: 13px; font-weight: 720; }
      .pg-gr-contain-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
      .pg-gr-contain-card { display: flex; align-items: center; gap: 10px; padding: 11px 10px; border: 1px solid color-mix(in srgb, var(--mid) 22%, white); border-radius: 12px; background: linear-gradient(135deg,#fff,color-mix(in srgb,var(--mid-soft) 28%,white)); cursor: pointer; }
      .pg-gr-contain-rank { width: 24px; height: 24px; display: grid; place-items: center; flex: none; border-radius: 50%; background: var(--mid); color: #fff; font-size: 11px; font-weight: 750; }
      .pg-gr-contain-card .meta { margin-top: 4px; color: var(--t3); font-size: 10px; }
      .pg-gr-contain-empty { margin-top: 10px; padding: 20px 12px; border: 1px dashed var(--line-strong); border-radius: 12px; text-align: center; color: var(--t3); font-size: 12px; }
      .pg-gr-contain-expand { width: 100%; margin-top: 10px; padding: 10px; border: 0; border-radius: 10px; background: var(--brand-weak); color: var(--brand); font-size: 12px; font-weight: 700; cursor: pointer; }
      .pg-gr-contain-quick { grid-column: 1 / -1; position: relative; z-index: 2; margin-top: -4px; padding: 12px 10px 10px; border: 1px dashed #C3CCDB; border-radius: 14px; background: linear-gradient(180deg,#F8FAFD,#F2F5F9); }
      .pg-gr-contain-quick-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; color: var(--t1); }
      .pg-gr-contain-quick-hd strong { display: block; font-size: 12px; }
      .pg-gr-contain-quick-hd small { display: block; margin-top: 2px; color: var(--t3); font-size: 9px; font-weight: 500; }
      .pg-gr-contain-quick-hd > span { flex: none; color: var(--t3); font-size: 9.5px; }
      .pg-gr-contain-quick-parent { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 8px; color: var(--t3); font-size: 9.5px; }
      .pg-gr-contain-quick-parent button { max-width: 150px; overflow: hidden; padding: 3px 7px; border: 1px solid var(--line); border-radius: 999px; background: #fff; color: var(--t2); font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
      .pg-gr-contain-quick-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; margin-top: 12px; }
      .pg-gr-contain-quick-card { position: relative; z-index: 5; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; min-width: 0; min-height: 44px; padding: 8px 7px; border: 1px solid #D7DEE9; border-radius: 10px; background: #fff; color: var(--t1); font: 600 10.5px/1.3 var(--font); overflow-wrap: anywhere; cursor: pointer; box-shadow: 0 2px 7px rgba(23,28,38,.04); }
      .pg-gr-contain-quick-card small { display: block; margin-top: 3px; color: var(--t3); font-size: 8.5px; font-weight: 500; }
      .pg-gr-contain-path { fill: none; stroke: #9CAAC0; stroke-width: 1.25; stroke-dasharray: 3 3; stroke-linecap: round; stroke-linejoin: round; opacity: .9; }
      .pg-gr-adjnote { margin: 0 16px 12px; padding: 8px 12px; background: #F3F5F9; border-radius: var(--r-sm); font-size: 10.5px; line-height: 1.55; color: var(--t3); }
      .pg-gr-zoom { position: static; grid-column: 1 / -1; justify-self: end; z-index: 3; display: flex; flex-direction: row; margin-top: -4px; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--card); box-shadow: var(--shadow-card); }
      .pg-gr-zoom span { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 17px; color: var(--t2); cursor: pointer; }
      .pg-gr-zoom span:first-child { border-right: 1px solid var(--line); }
      /* —— 详情面板(附件样式:面板贴在图下方) —— */
      .pg-gr-panel { background: var(--card); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 32px rgba(23,28,38,.10); padding: 6px 16px 22px; min-height: 300px; }
      .pg-gr-grab { display: flex; justify-content: center; padding: 6px 0 10px; }
      .pg-gr-grab i { width: 40px; height: 4px; border-radius: 2px; background: var(--line-strong); }
      .pg-gr-panel-hd { display: flex; align-items: center; gap: 8px; }
      .pg-gr-panel-hd .nm { font-size: 20px; font-weight: 700; color: var(--t1); }
      .pg-gr-insight-card { margin-top: 2px; padding: 14px; border: 1px solid #DEE7F5; border-radius: 16px; background: linear-gradient(180deg,#FFFFFF,#FAFCFF); }
      .pg-gr-insight-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--t1); font-size: 15px; font-weight: 750; }
      .pg-gr-insight-title i { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 9px; background: var(--brand-weak); color: var(--brand); font-style: normal; }
      .pg-gr-insight-card .pg-gr-panel-hd { flex-wrap: wrap; }
      .pg-gr-insight-card .pg-gr-panel-hd .nm { font-size: 18px; }
      .pg-gr-intro { margin-top: 10px; }
      .pg-gr-intro .label { display: block; margin-bottom: 4px; color: var(--t3); font-size: 10px; font-weight: 700; }
      .pg-gr-intro p { margin: 0; color: var(--t2); font-size: 12px; line-height: 1.65; }
      .pg-gr-also { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; color: var(--t3); }
      .pg-gr-insight-research { margin-top: 13px; padding-top: 12px; border-top: 1px dashed var(--line-strong); }
      .pg-gr-insight-research h4 { color: var(--t1); font-size: 12px; }
      .pg-gr-insight-point { display: grid; grid-template-columns: 64px 1fr; gap: 8px; margin-top: 8px; color: var(--t2); font-size: 11px; line-height: 1.55; }
      .pg-gr-insight-point b { color: var(--brand); }
      .pg-gr-insight-empty { margin-top: 8px; padding: 9px 10px; border-radius: 10px; background: #F4F6F9; color: var(--t3); font-size: 11px; }
      .pg-gr-insight-card-rich { overflow: hidden; padding: 0; border-color: #D5E2F6; background: #fff; box-shadow: 0 8px 24px rgba(34,78,145,.06); }
      .pg-gr-insight-card-rich .pg-gr-insight-title { margin: 0; padding: 12px 14px; border-bottom: 1px solid #E8EEF7; background: linear-gradient(100deg,#F8FBFF,#FFFFFF); }
      .pg-gr-insight-hero { padding: 14px; }
      .pg-gr-insight-kicker { margin-bottom: 6px; color: var(--brand); font-size: 10px; font-weight: 800; letter-spacing: .08em; }
      .pg-gr-insight-summary { margin-top: 10px; color: var(--t2); font-size: 13px; line-height: 1.75; }
      .pg-gr-insight-why { display: grid; grid-template-columns: 30px minmax(0,1fr); gap: 9px; margin-top: 12px; padding: 11px; border: 1px solid #F2DFB8; border-radius: 12px; background: #FFF9ED; }
      .pg-gr-insight-why i { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 9px; background: #FFAA2B; color: #fff; font-size: 15px; font-style: normal; }
      .pg-gr-insight-why b { display: block; color: #9B5C08; font-size: 11px; }
      .pg-gr-insight-why span { display: block; margin-top: 3px; color: var(--t2); font-size: 11px; line-height: 1.55; }
      .pg-gr-keyvars { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 11px; }
      .pg-gr-keyvars span { display: inline-flex; align-items: center; gap: 4px; padding: 5px 8px; border-radius: 999px; background: #F0F5FC; color: #48617F; font-size: 10px; font-weight: 650; }
      .pg-gr-keyvars b { color: var(--brand); font-size: 9px; }
      .pg-gr-research-grid { display: grid; gap: 7px; padding: 0 14px 14px; }
      .pg-gr-research-item { display: grid; grid-template-columns: 27px 62px minmax(0,1fr); align-items: start; gap: 7px; padding: 10px; border: 1px solid #E5EAF2; border-radius: 11px; background: #FCFDFE; }
      .pg-gr-research-item .mark { display: grid; width: 27px; height: 27px; place-items: center; border-radius: 8px; background: var(--brand-weak); color: var(--brand); font-size: 13px; font-weight: 800; }
      .pg-gr-research-item b { padding-top: 5px; color: var(--t1); font-size: 11px; }
      .pg-gr-research-item p { margin: 0; color: var(--t2); font-size: 10.5px; line-height: 1.62; }
      .pg-gr-research-item.risk .mark { background: #FFF0EC; color: #D65A3A; }
      .pg-gr-research-item.is-extra { display: none; }
      .pg-gr-insight-card-rich[data-expanded=\"true\"] .pg-gr-research-item.is-extra { display: grid; }
      .pg-gr-insight-more { width: calc(100% - 28px); margin: -3px 14px 13px; padding: 9px; border: 1px dashed #C8D6EA; border-radius: 10px; background: #F8FBFF; color: var(--brand); font-size: 11px; font-weight: 700; cursor: pointer; }
      .pg-gr-insight-sources { margin: 0 14px 14px; border-top: 1px dashed #DCE4EF; color: var(--t3); font-size: 10px; }
      .pg-gr-insight-sources summary { padding-top: 11px; color: var(--t2); font-weight: 700; cursor: pointer; }
      .pg-gr-insight-sources a { display: block; margin-top: 7px; color: var(--brand); line-height: 1.45; text-decoration: none; }
      .pg-gr-insight-review { margin: 8px 14px 14px; color: var(--t3); font-size: 9.5px; line-height: 1.45; }
      .pg-gr-company-card { align-items: flex-start; }
      .pg-gr-co-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .pg-gr-co-relation { padding: 2px 6px; border-radius: 999px; background: var(--brand-weak); color: var(--brand); font-size: 9px; font-weight: 700; }
      .pg-gr-co-reason { margin-top: 6px; color: var(--t2); font-size: 10.5px; line-height: 1.5; }
      .pg-gr-co-reason b { color: var(--t3); }
      .pg-gr-co-source { margin-top: 5px; color: var(--t3); font-size: 9.5px; }
      .pg-gr-evidence-note { margin-bottom: 8px; padding: 10px 11px; border-radius: 11px; background: #F2F7FF; color: var(--t2); font-size: 10.5px; line-height: 1.55; }
      .pg-gr-evidence-note b { display: block; margin-bottom: 3px; color: var(--brand); font-size: 11px; }
      .pg-gr-watch-tag { display: inline-block; margin-left: 5px; padding: 1px 5px; border-radius: 999px; background: #EAF3FF; color: var(--brand); font-size: 8.5px; vertical-align: 1px; }
      .pg-gr-more-ind { width: 100%; margin-top: 9px; padding: 9px; border: 1px dashed #CAD5E5; border-radius: 10px; background: #F8FAFD; color: var(--brand); font-size: 11px; font-weight: 700; cursor: pointer; }
      .pg-gr-tab-label { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
      .pg-gr-tab-count { display: inline-grid; min-width: 20px; height: 18px; padding: 0 5px; place-items: center; border-radius: 999px; background: #DDE3ED; color: var(--t2); font-size: 10px; font-weight: 750; line-height: 1; font-variant-numeric: tabular-nums; }
      .pill-tab.on .pg-gr-tab-count { background: var(--brand-weak); color: var(--brand); }
      .pg-gr-panel .pill-tabs { margin-top: 14px; }
      .pg-gr-ind { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--line); }
      .pg-gr-ind:last-child { border-bottom: 0; }
      .pg-gr-ind .meta { font-size: 11px; color: var(--t3); margin-top: 3px; }
      .pg-gr-ind .val { text-align: right; }
      .pg-gr-ind .val b { font-size: 15px; color: var(--t1); font-variant-numeric: tabular-nums; }
      .pg-gr-ind .val .d { font-size: 11px; color: var(--t3); }
      .pg-gr-flowdot { opacity: .78; filter: drop-shadow(0 1px 1px rgba(46,107,232,.22)); }
      @media (prefers-reduced-motion: reduce) { .pg-gr-flowdot { display: none; } }
      `
      document.head.appendChild(s)
    }

    const M = window.MOCK
    const tone = { upstream: 'up', midstream: 'mid', downstream: 'down' }
    const css = k => getComputedStyle(document.documentElement).getPropertyValue(`--${k}`).trim()
    const STAGE_ICONS = {
      U1: '<path d="M4 12h5l2-2h4l2 2h3v6H4v-6z"/><path d="M7 12V8h3M17 12V7h-3"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>',
      U2: '<path d="M9.5 8.5l-2-2a3.2 3.2 0 00-4.5 4.5l3 3a3.2 3.2 0 004.5 0l1-1"/><path d="M14.5 15.5l2 2a3.2 3.2 0 004.5-4.5l-3-3a3.2 3.2 0 00-4.5 0l-1 1"/><path d="M9 15l6-6"/>',
      U3: '<path d="M4 17l8 4 8-4M4 12l8 4 8-4M4 7l8-4 8 4-8 4-8-4z"/>',
      U4: '<path d="M4 20V9l5 3V8l5 3V4l6 4v12H4z"/><path d="M8 17h2M13 17h2M17 13h1"/>',
      U5: '<path d="M3 19l6-9 3 4 3-7 6 12H3z"/><path d="M7 19l5-5 3 5"/>',
      M0: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
      D1: '<rect x="4" y="5" width="11" height="14" rx="2"/><path d="M9 9h2M9 13h2M16 12h5M18.5 9.5L21 12l-2.5 2.5"/>',
      D2: '<path d="M3 18h18M5 18V9l7-4 7 4v9M8 18v-5h8v5"/><path d="M4 9h16"/>',
      D3: '<circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 11l8-4M8 13l8 4"/>',
      D4: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="12" r="4"/>',
      D5: '<path d="M4 10h16v10H4V10zM2.5 10L5 4h14l2.5 6"/><path d="M8 20v-5h4v5M15 14h2"/>'
    }
    const STAGE_FALLBACK = '<path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>'
    const stageIcon = stage => `<svg class="pg-gr-stage-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${STAGE_ICONS[stage.key] || STAGE_FALLBACK}</svg>`
    // 节点小图标(线性,局部关系图卡片用)
    const NI = {
      jsq:   '<path d="M12 8.5V5M12 19v-3.5M15.5 12H19M5 12h3.5M14.5 9.5l2.4-2.4M7.1 16.9l2.4-2.4M14.5 14.5l2.4 2.4M7.1 7.1l2.4 2.4"/><circle cx="12" cy="12" r="3.2"/>',
      cgq:   '<path d="M5 12a7 7 0 0114 0M8 12a4 4 0 018 0"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><path d="M12 13.5V19"/>',
      sfdj:  '<circle cx="12" cy="12" r="7.5"/><path d="M12 8l-2.5 4.5h5L12 17"/>',
      kzq:   '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
      gyjqr: '<path d="M6 20h9M10.5 20v-4l-3-5 4-6 4.5 2.5"/><circle cx="16.5" cy="7" r="2"/><circle cx="7.5" cy="11" r="1.6"/>',
      xzjqr: '<path d="M7 20h10M12 20v-5M12 15L8 8l4-4.5L16.5 7"/><circle cx="17" cy="7.5" r="1.8"/><circle cx="12" cy="15" r="1.6"/>',
      fwjqr: '<circle cx="12" cy="8" r="4"/><path d="M9.8 7.5h.01M14.2 7.5h.01M7 20c.6-3.4 2.6-5 5-5s4.4 1.6 5 5"/>',
      psjqr: '<rect x="4" y="8" width="10" height="7" rx="1.6"/><path d="M14 10.5h4l2 2.5v2h-2"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
      zxjx:  '<path d="M4 20h16M6 20V9l6-4.5L18 9v11M10 20v-5h4v5"/>',
      syqj:  '<path d="M8 4l1.2 3.6L13 9l-3.8 1.4L8 14l-1.2-3.6L3 9l3.8-1.4L8 4zM16 12l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"/>',
      zhyl:  '<circle cx="12" cy="9" r="4.5"/><path d="M12 6.5V9l1.8 1.2M12 13.5V21M8.5 18.5L12 21l3.5-2.5"/>',
      ccwl:  '<path d="M4 9l8-5 8 5v11H4V9z"/><path d="M9 20v-6h6v6M9 11h6"/>',
      sg:    '<path d="M4 12h16M7 8v8M11 8v8M15 8v8M19 9v6"/>',
      jqsj:  '<rect x="3.5" y="7" width="17" height="12" rx="2.5"/><circle cx="12" cy="13" r="3.4"/><path d="M8.5 7l1.4-2.2h4.2L15.5 7"/>',
      mdzxq: '<path d="M12 21v-5M12 16c-3 0-4.5-2-4.5-4.5V5M12 16c3 0 4.5-2 4.5-4.5V5M7.5 5h3M13.5 5h3"/>',
      zc:    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5.5" r="1" fill="currentColor"/><circle cx="12" cy="18.5" r="1" fill="currentColor"/><circle cx="5.5" cy="12" r="1" fill="currentColor"/><circle cx="18.5" cy="12" r="1" fill="currentColor"/>',
      rxjqr: '<circle cx="12" cy="6" r="3"/><path d="M12 9v6M8 11h8M12 15l-3 6M12 15l3 6"/>',
      tzjqr: '<path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"/><path d="M9.5 12l2 2 3.5-4"/>',
      agv:   '<rect x="4" y="7" width="16" height="8" rx="2"/><circle cx="8.5" cy="18" r="1.8"/><circle cx="15.5" cy="18" r="1.8"/><path d="M8 11h8"/>',
      xtjc:  '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M10.5 7h4a2 2 0 012 2v4"/>',
      qczz:  '<path d="M4 16l1.5-5a2 2 0 012-1.5h9a2 2 0 012 1.5L20 16v3h-2M4 16v3h2M4 16h16"/><circle cx="8" cy="18.5" r="1.6"/><circle cx="16" cy="18.5" r="1.6"/>',
      dzzz:  '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M10 6.5h4M12 17.5h.01"/>',
      ylkf:  '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>',
      // —— 算力链 ——
      c_gpu: '<rect x="6" y="6" width="12" height="12" rx="1.6"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
      c_hbm: '<rect x="4" y="6" width="16" height="4" rx="1"/><rect x="4" y="14" width="16" height="4" rx="1"/><path d="M7 6V4M12 6V4M17 6V4M7 20v-2M12 20v-2M17 20v-2"/>',
      c_gmk: '<rect x="3.5" y="8" width="11" height="8" rx="1.6"/><path d="M14.5 12h5M17 9.5l2.5 2.5-2.5 2.5"/><circle cx="7" cy="12" r="1.3" fill="currentColor"/>',
      c_pcb: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><path d="M8.5 9.5v3l3 3h4"/>',
      c_dy:  '<path d="M13 3l-6 9h4l-1 9 6-10h-4l1-8z"/>',
      c_wk:  '<path d="M12 3c3.5 4.5 5 7 5 9.5A5 5 0 017 12.5C7 10 8.5 7.5 12 3z"/><path d="M9.5 13.5c0 1.5 1.1 2.5 2.5 2.5"/>',
      c_fwq: '<rect x="4" y="4" width="16" height="6" rx="1.4"/><rect x="4" y="14" width="16" height="6" rx="1.4"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="17" r="1" fill="currentColor"/><path d="M11 7h5M11 17h5"/>',
      c_jhj: '<rect x="3.5" y="8" width="17" height="8" rx="1.6"/><path d="M7 8V5m4 3V5m4 3V5M7 19v-3m5 3v-3m5 3v-3"/>',
      c_gtx: '<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="12" r="2.4"/><path d="M8.4 12h7.2M10 9.5l1.5 2.5-1.5 2.5"/>',
      c_idc: '<path d="M4 8l8-4 8 4v10H4V8z"/><path d="M8 18v-5h8v5M8 13h8"/><circle cx="10" cy="10.5" r=".8" fill="currentColor"/>',
      c_yjs: '<path d="M7 18a4 4 0 01-.5-8A5 5 0 0116 9.5a3.5 3.5 0 011 6.9"/>',
      c_dmx: '<path d="M9.5 3.5A5.5 5.5 0 0115 8.9l2.3 3.9-2 .7v2a2 2 0 01-2 2h-1v3H7.5v-3.6A6.3 6.3 0 019.5 3.5z"/><circle cx="11.5" cy="9.5" r="1" fill="currentColor"/>',
      c_zsx: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
      c_hlw: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"/>'
    }
    const NI_FALLBACK = '<path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6L12 3z"/><circle cx="12" cy="12" r="2.4"/>'
    const nodeIcon = (id, color) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${NI[id] || NI_FALLBACK}</svg>`
    const COMPANY_METRIC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5l8-2v18M14 21V9l6 2v10M4 21h17"/><path d="M7 8h.01M9.5 8h.01M7 11.5h.01M9.5 11.5h.01M7 15h.01M9.5 15h.01M17 13h.01M17 16h.01"/></svg>'
    const INDICATOR_METRIC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M7 14l3.2-3.4 3 2.4L20 6"/></svg>'
    const metricBadges = node => {
      const companies = Number(node.companies) || 0
      const indicators = Number(node.indicators) || 0
      return (companies ? `<span class="pg-gr-cov pg-gr-cov-co" title="${companies} 家关联公司">${COMPANY_METRIC_ICON}<b>${companies > 99 ? '99+' : companies}</b></span>` : '') +
        (indicators ? `<span class="pg-gr-cov pg-gr-cov-ind" title="${indicators} 个行业指标">${INDICATOR_METRIC_ICON}<b>${indicators > 99 ? '99+' : indicators}</b></span>` : '')
    }

    // ============ 列表视图 ============
    const COLLAPSED_ROWS = 4
    let nodeFilter = 'all' // 'all' | 'core'
    let locatorQuery = ''
    const sideLabel = { upstream: '上游供给侧', midstream: '中游核心', downstream: '下游需求侧' }
    const sideShortLabel = { upstream: '上游', midstream: '中游', downstream: '下游' }
    function renderNodeSearch(results, query, limit, onPick) {
      const cleanQuery = query.trim()
      const hits = M.findNodes(cleanQuery, limit)
      results.style.display = cleanQuery ? 'block' : 'none'
      if (!cleanQuery) { results.innerHTML = ''; return }
      if (!hits.length) { results.innerHTML = `<div class="pg-gr-locate-empty">未找到“${cleanQuery}”</div>`; return }
      const grouped = ['upstream', 'midstream', 'downstream'].map(band => ({
        band,
        items: hits.filter(item => item.band === band)
      })).filter(group => group.items.length)
      results.innerHTML = grouped.map(group => `
        <div class="pg-gr-detail-group pg-gr-search-group">${sideLabel[group.band]} · ${group.items.length}</div>
        ${group.items.map(item => {
          const breadcrumb = item.nodePath ? item.nodePath.split('>').slice(1).map(part => part.trim()).join(' › ') : (item.parentName ? item.parentName : '')
          return `<div class="pg-gr-locate-hit pg-gr-detail-hit pg-gr-search-hit" data-node-search="${item.id}">
            <span class="pg-gr-dot" style="background:var(--${tone[item.band]})"></span>
            <div style="flex:1;min-width:0"><div class="name">${item.name}</div>
              <div class="meta">${sideShortLabel[item.band]} · ${item.stageTitle || item.stage} · ${item.lane || '未标注分类'}</div>
              ${breadcrumb ? `<div class="meta">包含路径 · ${breadcrumb}</div>` : ''}
            </div><span style="color:var(--t3)">›</span>
          </div>`
        }).join('')}`
      ).join('')
      results.querySelectorAll('[data-node-search]').forEach(row => row.onclick = () => onPick(row.dataset.nodeSearch))
    }
    function renderList() {
      // “核心”严格等于底稿“非常重要”；“重要”仍参与默认排序，但不展示核心标识。
      const isCore = id => Boolean(M.nodeBrief(id)?.core)
      const allCoreBands = M.coreBands || M.bands
      const viewBands = nodeFilter === 'core'
        ? allCoreBands.map(band => ({ ...band, lanes: (band.lanes || []).filter(lane => (lane.nodes || []).some(node => node.core)) })).filter(band => band.lanes.length)
        : M.bands
      const visNodesOf = nodes => nodes.filter(n => nodeFilter === 'all' || isCore(n.id))
      // 深链入参:?band= 定位目标大层级(详情页阶段位置条跳入)
      const focusBand = ctx.params && ctx.params.band
      el.innerHTML = `
        <div class="pg-gr-locate">
          <div class="search-bar">
            ${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}
            <input id="pg-gr-locate-input" value="${locatorQuery}" placeholder="搜索当前链 ${M.allNodeCount} 个节点（上游 / 中游 / 下游）">
          </div>
          <div class="pg-gr-locate-results pg-gr-detail-results" id="pg-gr-locate-results" style="display:none"></div>
        </div>
        <div class="pg-gr-filters">
          <span class="pg-gr-pill ${nodeFilter === 'all' ? 'on' : ''}" data-filter="all">全部环节</span>
          <span class="pg-gr-pill ${nodeFilter === 'core' ? 'on' : ''}" data-filter="core">仅核心节点</span>

          <span class="pg-gr-metric-legend" aria-label="公司和指标图例"><span class="co">${COMPANY_METRIC_ICON}<em>公司</em></span><span class="ind">${INDICATOR_METRIC_ICON}<em>指标</em></span></span>
        </div>
        <div class="pg-gr-banner">
          <span class="bt"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>${M.chainTitle}产业链 · ${M.bands.length} 阶段 · ${M.allNodeCount} 节点</span>
        </div>
        <div class="pg-gr-wrap" id="pg-gr-wrap">
          ${viewBands.length ? viewBands.map(b => { const t = tone[b.band || b.key]; const lanes = b.lanes || [{ name: '未标注分类', nodes: b.nodes || [] }]; return `
          <div class="pg-gr-band" data-band="${b.key}">
            <div class="pg-gr-rail" style="background:var(--${t}-grad)">
              ${stageIcon(b)}
              <div class="tt">${b.title}</div>
              <div class="st">${b.subtitle}</div>
            </div>
            <div class="pg-gr-rows">
              ${lanes.map((lane, laneIndex) => {
                const laneKey = `${M.currentChainKey}:${b.key}:${laneIndex}`
                const vis = visNodesOf(lane.nodes || [])
                const expanded = !!__graphLaneExpanded[laneKey]
                const shown = expanded ? vis : vis.slice(0, COLLAPSED_ROWS)
                return `<section class="pg-gr-lane" data-lane="${laneKey}">
                  <div class="pg-gr-lane-hd"><span>${lane.name}</span><b>${vis.length}</b></div>
                  ${shown.map(n => `
                  <div class="node-row" data-id="${n.id}" data-core="${isCore(n.id) ? 1 : 0}">
                    <span class="pg-gr-dot" style="background:var(--${t})"></span>
                    <span class="nm">${n.name}${isCore(n.id) ? '<em class="pg-gr-core-tag" title="底稿重要性：非常重要">核心</em>' : ''}${nodeFilter === 'core' && n.parentName ? `<small class="pg-gr-core-parent">归属于 ${n.parentName}</small>` : ''}</span>
                    <span class="pg-gr-covset">${metricBadges(n)}</span>
                    <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
                  </div>`).join('')}
                  ${vis.length > COLLAPSED_ROWS ? `<div class="pg-gr-more" data-more="${laneKey}">${expanded ? '收起 ∧' : `更多 · 查看其余 ${vis.length - COLLAPSED_ROWS} 个 ∨`}</div>` : ''}
                  ${vis.length === 0 ? '<div class="pg-gr-locate-empty">当前分类暂无核心环节</div>' : ''}
                </section>`
              }).join('')}
            </div>
            <svg class="pg-gr-svg" data-rail="${b.key}"></svg>
          </div>`}).join('') : '<div class="pg-gr-core-empty">当前产业链暂无标记为“非常重要”的核心节点，可切回“全部环节”继续浏览。</div>'}
        </div>
        <div class="pg-gr-note">ⓘ 左侧为距离核心的大层级，右侧按小分类展示前 4 个重点节点；“核心”仅标记底稿中的“非常重要”。阶段导轨只表达归类，真实上下游与包含关系请进入详情查看。</div>
        <div class="page-pad" style="padding-top:0">${UI.disclaimer()}</div>`

      // 阶段归类导轨统一使用静态细实线，不再借线型表达节点重要性。
      function drawTree() {
        el.querySelectorAll('.pg-gr-band').forEach(band => {
          const svg = band.querySelector('svg[data-rail]')
          const rail = band.querySelector('.pg-gr-rail')
          const bandDef = M.bands.find(b => b.key === band.dataset.band)
          const t = css(tone[bandDef?.band || band.dataset.band])
          const bandBox = band.getBoundingClientRect()
          svg.setAttribute('width', bandBox.width); svg.setAttribute('height', bandBox.height)
          const railR = rail.getBoundingClientRect().right - bandBox.left
          const railY = bandBox.height / 2
          const trunkX = railR + 13
          const rows = [...band.querySelectorAll('.node-row')]
          if (!rows.length) { svg.innerHTML = ''; return }
          let html = ''
          const ys = rows.map(row => {
            const r = row.getBoundingClientRect()
            return { y: r.top - bandBox.top + r.height / 2, x1: r.left - bandBox.left + 16 }
          })
          // 导轨圆点 + 接入横线 + 竖干
          html += `<circle cx="${railR}" cy="${railY}" r="3.5" fill="${t}"/>`
          html += `<path d="M${railR} ${railY} H ${trunkX}" stroke="${t}" stroke-width="1.8" fill="none"/>`
          html += `<path d="M${trunkX} ${ys[0].y} V ${ys[ys.length - 1].y}" stroke="${t}" stroke-width="1.8" fill="none" opacity=".8"/>`
          // 所有分支同色同线型，避免把归类导轨误读为重要性或真实上下游。
          ys.forEach(p => {
            html += `<path d="M${trunkX} ${p.y} H ${p.x1}" fill="none" stroke="${t}" stroke-width="1.45" opacity=".72"/>`
          })
          svg.innerHTML = html
        })
      }
      // 注:段间不再画"末行→首行"的具体连线——真实数据没有可证明的节点级上下游边,
      //     只保留段内导轨→节点的归类连线,避免暗示不存在的具体关系。
      setTimeout(() => {
        drawTree()
        if (focusBand) { const b = el.querySelector(`[data-band="${focusBand}"]`); if (b) b.scrollIntoView({ block: 'start' }) }
      }, 0)

      // 图谱内节点定位覆盖全部节点,包括只在详情内联区出现的包含子节点。
      const locateInput = el.querySelector('#pg-gr-locate-input')
      const locateResults = el.querySelector('#pg-gr-locate-results')
      function renderLocator() {
        renderNodeSearch(locateResults, locatorQuery, 30, nodeId => ctx.go('graph', { node: nodeId }))
      }      locateInput.oninput = () => { locatorQuery = locateInput.value; renderLocator() }
      locateInput.onkeydown = event => {
        if (event.key !== 'Enter') return
        const first = M.findNodes(locatorQuery, 1)[0]
        if (first) ctx.go('graph', { node: first.id })
      }
      renderLocator()

      // 筛选：全部节点 / 仅“非常重要”核心节点。
      el.querySelectorAll('.pg-gr-pill[data-filter]').forEach(p => p.onclick = () => {
        if (nodeFilter === p.dataset.filter) return
        nodeFilter = p.dataset.filter
        renderList()
      })
      el.querySelectorAll('.pg-gr-more').forEach(m => m.onclick = () => {
        __graphLaneExpanded[m.dataset.more] = !__graphLaneExpanded[m.dataset.more]
        renderList()
      })
      // 点节点 → 切到"详情"分段并聚焦该节点(走路由,让分段控件同步高亮)
      el.querySelectorAll('.node-row').forEach(r => r.onclick = () => ctx.go('graph', { node: r.dataset.id }))
    }

    // ============ 聚焦视图:局部关系图 + 详情面板 ============
    function renderFocus(id) {
      const d = M.nodeDetail(id)
      __graphLastFocus = d.id
      const t = tone[d.band]
      const upCards = d.ups.map(uid => ({ id: uid, ...M.nodeBrief(uid) }))
      const downCards = d.downs.map(did => ({ id: did, ...M.nodeBrief(did) }))
      const currentCard = { id: d.id, ...M.nodeBrief(d.id) }
      const parentCards = d.parents.map(pid => ({ id: pid, ...M.nodeBrief(pid) }))
      const childCards = d.children.map(cid => {
        const detail = M.nodeDetail(cid)
        return { id: cid, ...M.nodeBrief(cid), childCount: detail.children.length }
      })
      const nodeInsight = window.RESEARCH_CONFIG?.nodeInsights?.[M.currentChainKey]?.[d.id] || {}
      const hasNodeInsight = Boolean(nodeInsight.summary && nodeInsight.whyImportant)
      const researchSections = [
        ['demand', '需求驱动', '↗', nodeInsight.demand],
        ['supply', '供给约束', '◆', nodeInsight.supply],
        ['profit', '盈利逻辑', '¥', nodeInsight.profit],
        ['competition', '竞争格局', '◎', nodeInsight.competition],
        ['technology', '技术路线', '◇', nodeInsight.technology],
        ['risks', '风险事项', '!', nodeInsight.risks]
      ].filter(([, , , value]) => value)
      const renderInsightCard = () => {
        if (!hasNodeInsight) return `<section class="pg-gr-insight-card">
          <div class="pg-gr-insight-title"><i>▤</i><span>节点解读</span></div>
          <div class="pg-gr-panel-hd">
            <span class="nm">${d.name}</span>
            <span class="badge badge-band-${d.band}">${d.bandLabel}</span>
            <span class="badge badge-level-weak">${d.importance}</span>
          </div>
          <div class="pg-gr-intro"><p data-node-description="${d.id}">${d.intro}</p></div>
          <div class="pg-gr-also"><span class="chip">阶段 · ${d.stageLabel}</span><span class="chip">关系 · ${d.lane || '未标注'}</span>${downCards[0] ? `<span class="chip">下游关联 · ${downCards[0].name}</span>` : (d.parentName ? `<span class="chip">父节点 · ${d.parentName}</span>` : '')}</div>
          ${d.alsoIn.length ? `<div class="pg-gr-also">该环节还出现在：${d.alsoIn.map(c => `<span class="chip" data-also="${c}">${c}产业链</span>`).join('')}</div>` : ''}
          <div class="pg-gr-insight-research"><h4>研究要点</h4><div class="pg-gr-insight-empty">暂无补充解读。当前仅展示底稿中的节点定义与真实结构关系。</div></div>
        </section>`
        return `<section class="pg-gr-insight-card pg-gr-insight-card-rich" data-expanded="false">
          <div class="pg-gr-insight-title"><i>▤</i><span>节点解读</span></div>
          <div class="pg-gr-insight-hero">
            <div class="pg-gr-insight-kicker">30 秒看懂</div>
            <div class="pg-gr-panel-hd">
              <span class="nm">${d.name}</span>
              <span class="badge badge-band-${d.band}">${d.bandLabel}</span>
              <span class="badge badge-level-weak">${d.importance}</span>
            </div>
            <div class="pg-gr-insight-summary">${nodeInsight.summary}</div>
            <div class="pg-gr-insight-why"><i>★</i><div><b>为什么重要</b><span>${nodeInsight.whyImportant}</span></div></div>
            <div class="pg-gr-keyvars">${(nodeInsight.keyVariables || []).map((item, index) => `<span><b>0${index + 1}</b> ${item}</span>`).join('')}</div>
          </div>
          <div class="pg-gr-research-grid">
            ${researchSections.map(([, label, mark, value], index) => `<article class="pg-gr-research-item ${index > 2 ? 'is-extra' : ''} ${label === '风险事项' ? 'risk' : ''}"><span class="mark">${mark}</span><b>${label}</b><p>${value}</p></article>`).join('')}
          </div>
          ${researchSections.length > 3 ? '<button class="pg-gr-insight-more" id="pg-gr-insight-more" type="button" aria-expanded="false">展开更多研究要点 ↓</button>' : ''}
          <details class="pg-gr-insight-sources"><summary>查看研究依据 · ${nodeInsight.sources?.length || 0} 份</summary>${(nodeInsight.sources || []).map(source => `<a href="${source.url}" target="_blank" rel="noopener">${source.date} · ${source.title}</a>`).join('')}</details>
          <div class="pg-gr-insight-review">研究内容复核于 ${nodeInsight.reviewedAt || '—'}；指标数据以指标卡片日期为准。内容用于产业研究，不构成投资建议。</div>
        </section>`
      }
      const containPreview = () => {
        if (!parentCards.length && !childCards.length) return ''
        return `<section class="pg-gr-contain-quick" id="pg-gr-contain-preview">
          <div class="pg-gr-contain-quick-hd">
            <div><strong>分类包含</strong><small>灰色树枝线 · 无箭头、无流动点</small></div>
            <span>${childCards.length ? `全部 ${childCards.length} 个一级子节点` : '无一级子节点'}</span>
          </div>
          ${parentCards.length ? `<div class="pg-gr-contain-quick-parent"><span>归属于</span>${parentCards.map(parent => `<button data-contain-preview-parent="${parent.id}">${parent.name}${parent.core ? '<em class="pg-gr-core-tag" title="底稿重要性：非常重要">核心</em>' : ''}</button>`).join('')}</div>` : ''}
          ${childCards.length ? `<div class="pg-gr-contain-quick-list">${childCards.map(child => `<button class="pg-gr-contain-quick-card" data-contain-preview-node="${child.id}"><span>${child.name}${child.core ? '<em class="pg-gr-core-tag" title="底稿重要性：非常重要">核心</em>' : ''}</span><small>${child.childCount ? `含 ${child.childCount} 个下级` : '末级分类'}</small></button>`).join('')}</div>` : ''}
        </section>`
      }
      const relationKey = dir => `${d.id}:${dir}`
      const relationExpanded = dir => !!__graphRelationExpanded[relationKey(dir)]
      const visibleRelationCards = (cards, dir) => relationExpanded(dir) ? cards : cards.slice(0, 4)

      const card = (n, cls = '') => {
        const nt = tone[n.band]
        return `<div class="pg-gr-ego-card ${cls}" data-id="${n.id}" ${cls.includes('center') ? `style="border-color:var(--${nt})"` : ''}>
          <span class="nm">${n.name}${n.core ? '<em class="pg-gr-core-tag" title="底稿重要性：非常重要">核心</em>' : ''}<small class="pg-gr-card-meta">${n.lane || '未标注分类'}</small></span>
        </div>`
      }
      // 空列占位(最上游无更上游、最下游无更下游)
      const emptyCard = txt => `<div class="pg-gr-ego-card dots">${txt}</div>`
      const neighborMeta = (cards, dir) => {
        const band = cards.length ? cards[0].band : (dir === 'up' ? 'upstream' : 'downstream')
        const expanded = relationExpanded(dir)
        return {
          band,
          title: dir === 'up' ? '直接上游' : '直接下游',
          subtitle: cards.length ? (cards.length > 4 ? (expanded ? `已展开全部 ${cards.length} 个` : `显示 4 / 共 ${cards.length} 个`) : `共 ${cards.length} 个`) : ''
        }
      }
      const moreButton = (cards, dir) => {
        if (cards.length <= 4) return ''
        const expanded = relationExpanded(dir)
        return `<button class="pg-gr-relation-more" data-relation-more="${dir}" aria-expanded="${expanded}"><strong>${expanded ? '↑' : '···'}</strong>${expanded ? '收起至前 4 个' : `查看全部 ${cards.length} 个`}</button>`
      }
      const upMeta = neighborMeta(upCards, 'up')
      const downMeta = neighborMeta(downCards, 'down')
      const stageIndex = M.bands.findIndex(band => band.key === d.stage)
      const stageContext = stageIndex >= 0
        ? [M.bands[stageIndex - 1] || null, M.bands[stageIndex], M.bands[stageIndex + 1] || null]
        : [null, { key: d.stage, title: d.stageLabel, band: d.band }, null]
      const formatMetricValue = value => Number.isFinite(Number(value))
        ? new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(Number(value))
        : value
      const stageSlot = (stage, position) => {
        if (!stage) {
          const boundary = position === 'previous' ? '已到最上游' : '已到最下游'
          return `<span class="stage-slot"><span class="seg boundary">${boundary}</span></span>`
        }
        const current = position === 'current'
        const stageTone = tone[stage.band || stage.key] || 'mid'
        return `<span class="stage-slot"><span class="seg ${current ? 'on' : ''}" data-band="${stage.key}" ${current ? `style="background:var(--${stageTone});border-color:var(--${stageTone})"` : ''}>${stage.title}</span></span>`
      }
      const group = ({ meta, id, body, current = false }) => {
        const gt = tone[meta.band]
        return `<section class="pg-gr-ego-group ${current ? 'current' : ''}" style="--group-color:var(--${gt});--group-soft:var(--${gt}-soft)">
          <header class="pg-gr-group-head">
            <div class="title"><i></i><span>${meta.title}</span></div>
            ${meta.subtitle ? `<small>${meta.subtitle}</small>` : ''}
          </header>
          <div class="pg-gr-ego-col" id="${id}">${body}</div>
        </section>`
      }

      el.innerHTML = `
        <div class="pg-gr-detail-search">
          <div class="search-bar">
            ${UI.icons.search.replace('stroke="currentColor"', 'stroke="#98A1B3"')}
            <input id="pg-gr-detail-input" placeholder="搜索当前链 ${M.allNodeCount} 个节点（上游 / 中游 / 下游）">
          </div>
          <div class="pg-gr-locate-results pg-gr-detail-results" id="pg-gr-detail-results" style="display:none"></div>
        </div>
        <div class="pg-gr-posbar">
          ${stageSlot(stageContext[0], 'previous')}
          ${stageSlot(stageContext[1], 'current')}
          ${stageSlot(stageContext[2], 'next')}
        </div>
        <div class="pg-gr-ego" id="pg-gr-ego">
          <svg class="pg-gr-node-links" id="pg-gr-node-links" aria-hidden="true"></svg>
          ${group({ meta: upMeta, id: 'ego-up', body: upCards.length ? visibleRelationCards(upCards, 'up').map(n => card(n)).join('') + moreButton(upCards, 'up') : emptyCard('暂无直接上游') })}
          ${group({ meta: { band: d.band, title: '当前节点', subtitle: d.name }, id: 'ego-mid', body: card(currentCard, 'center'), current: true })}
          ${group({ meta: downMeta, id: 'ego-down', body: downCards.length ? visibleRelationCards(downCards, 'down').map(n => card(n)).join('') + moreButton(downCards, 'down') : emptyCard('暂无直接下游') })}
          ${containPreview()}
          <div class="pg-gr-zoom"><span>+</span><span>−</span></div>
        </div>
        <div class="pg-gr-adjnote">ⓘ ${d.adjNote}</div>
        <div class="pg-gr-panel">
          <div class="pg-gr-grab"><i></i></div>
          ${renderInsightCard()}
          <div class="pill-tabs"><div class="pill-tab" data-t="co"><span class="pg-gr-tab-label">公司 <b class="pg-gr-tab-count">${d.stats.companies}</b></span></div><div class="pill-tab" data-t="ind"><span class="pg-gr-tab-label">指标 <b class="pg-gr-tab-count">${d.stats.indicators}</b></span></div></div>
          <div id="pg-gr-panel-body"></div>
          ${UI.disclaimer()}
        </div>`

      const insightMore = el.querySelector('#pg-gr-insight-more')
      if (insightMore) insightMore.onclick = () => {
        const insightCard = insightMore.closest('.pg-gr-insight-card-rich')
        const expanded = insightCard?.dataset.expanded !== 'true'
        if (insightCard) insightCard.dataset.expanded = String(expanded)
        insightMore.setAttribute('aria-expanded', String(expanded))
        insightMore.textContent = expanded ? '收起研究要点 ↑' : '展开更多研究要点 ↓'
      }

      const descriptionEl = el.querySelector(`[data-node-description="${d.id}"]`)
      const cachedDescription = M.nodeDescription?.(d.id)
      if (descriptionEl && cachedDescription) descriptionEl.textContent = cachedDescription
      else if (descriptionEl && M.ensureNodeDescriptions) {
        M.ensureNodeDescriptions().then(() => {
          const target = el.querySelector(`[data-node-description="${d.id}"]`)
          const description = M.nodeDescription(d.id)
          if (target && description) target.textContent = description
        }).catch(() => {})
      }

      const detailInput = el.querySelector('#pg-gr-detail-input')
      const detailResults = el.querySelector('#pg-gr-detail-results')
      function renderDetailSearch() {
        renderNodeSearch(detailResults, detailInput.value, 30, nodeId => {
          ctx.go('graph', { node: nodeId })
        })
      }      detailInput.oninput = renderDetailSearch
      detailInput.onkeydown = event => {
        if (event.key !== 'Enter') return
        const first = M.findNodes(detailInput.value, 1)[0]
        if (first) ctx.go('graph', { node: first.id })
      }

      // 直接上下游折线:默认各显示 4 个;点击更多后在图内原位展开,折线与流动点同步重绘。
      function drawNodeLinks() {
        const ego = el.querySelector('#pg-gr-ego')
        const svg = el.querySelector('#pg-gr-node-links')
        const center = ego.querySelector('.pg-gr-ego-card.center')
        if (!svg || !center) return
        const eb = ego.getBoundingClientRect()
        const cb = center.getBoundingClientRect()
        const cLeft = { x: cb.left - eb.left, y: cb.top - eb.top + cb.height / 2 }
        const cRight = { x: cb.right - eb.left, y: cLeft.y }
        const upNodes = [...ego.querySelectorAll('#ego-up .pg-gr-ego-card[data-id]')]
        const downNodes = [...ego.querySelectorAll('#ego-down .pg-gr-ego-card[data-id]')]
        const upColor = css(tone[upCards[0]?.band || d.band])
        const downColor = css(tone[downCards[0]?.band || d.band])
        svg.setAttribute('viewBox', `0 0 ${eb.width} ${eb.height}`)
        svg.setAttribute('width', eb.width)
        svg.setAttribute('height', eb.height)
        let paths = `<defs>
          <marker id="pg-arrow-up" markerWidth="5" markerHeight="5" refX="4.3" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5z" fill="${upColor}"/></marker>
          <marker id="pg-arrow-down" markerWidth="5" markerHeight="5" refX="4.3" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5z" fill="${downColor}"/></marker>
        </defs>`
        if (upNodes.length) {
          const starts = upNodes.map(node => { const b = node.getBoundingClientRect(); return { x: b.right - eb.left, y: b.top - eb.top + b.height / 2 } })
          const maxX = Math.max(...starts.map(p => p.x))
          const busX = maxX + Math.max(8, Math.min(14, (cLeft.x - maxX) / 2))
          const ys = [...starts.map(p => p.y), cLeft.y]
          paths += `<path class="pg-gr-node-path pg-gr-node-trunk" d="M${busX} ${Math.min(...ys)} V${Math.max(...ys)}" stroke="${upColor}"/>`
          starts.forEach((from, i) => {
            const flowId = `pg-flow-up-${i}`
            const route = `M${from.x} ${from.y} H${busX} V${cLeft.y} H${cLeft.x}`
            paths += `<path id="pg-node-up-${i}" class="pg-gr-node-path" d="M${from.x} ${from.y} H${busX}" stroke="${upColor}"/><circle class="pg-gr-node-junction" cx="${busX}" cy="${from.y}" r="1.7" fill="${upColor}"/>`
            paths += `<path id="${flowId}" d="${route}" fill="none" stroke="none"/><circle class="pg-gr-flowdot" r="1.35" fill="${upColor}"><animateMotion dur="3.6s" repeatCount="indefinite" begin="-${(i * .65).toFixed(2)}s"><mpath href="#${flowId}"/></animateMotion></circle>`
          })
          paths += `<path id="pg-node-up-main" class="pg-gr-node-path pg-gr-node-trunk" d="M${busX} ${cLeft.y} H${cLeft.x}" stroke="${upColor}" marker-end="url(#pg-arrow-up)"/>`
        }
        if (downNodes.length) {
          const ends = downNodes.map(node => { const b = node.getBoundingClientRect(); return { x: b.left - eb.left, y: b.top - eb.top + b.height / 2 } })
          const minX = Math.min(...ends.map(p => p.x))
          const busX = minX - Math.max(8, Math.min(14, (minX - cRight.x) / 2))
          const ys = [...ends.map(p => p.y), cRight.y]
          paths += `<path id="pg-node-down-main" class="pg-gr-node-path pg-gr-node-trunk" d="M${cRight.x} ${cRight.y} H${busX}" stroke="${downColor}"/>`
          paths += `<path class="pg-gr-node-path pg-gr-node-trunk" d="M${busX} ${Math.min(...ys)} V${Math.max(...ys)}" stroke="${downColor}"/>`
          ends.forEach((to, i) => {
            const flowId = `pg-flow-down-${i}`
            const route = `M${cRight.x} ${cRight.y} H${busX} V${to.y} H${to.x}`
            paths += `<circle class="pg-gr-node-junction" cx="${busX}" cy="${to.y}" r="1.7" fill="${downColor}"/><path id="pg-node-down-${i}" class="pg-gr-node-path" d="M${busX} ${to.y} H${to.x}" stroke="${downColor}" marker-end="url(#pg-arrow-down)"/>`
            paths += `<path id="${flowId}" d="${route}" fill="none" stroke="none"/><circle class="pg-gr-flowdot" r="1.35" fill="${downColor}"><animateMotion dur="3.6s" repeatCount="indefinite" begin="-${(i * .65 + .3).toFixed(2)}s"><mpath href="#${flowId}"/></animateMotion></circle>`
          })
        }
        const containNodes = [...ego.querySelectorAll('.pg-gr-contain-quick-card[data-contain-preview-node]')]
        if (containNodes.length) {
          const start = { x: cb.left - eb.left + cb.width / 2, y: cb.bottom - eb.top }
          const ends = containNodes.map(node => {
            const box = node.getBoundingClientRect()
            const centerX = box.left - eb.left + box.width / 2
            return {
              x: centerX < start.x ? box.right - eb.left : box.left - eb.left,
              y: box.top - eb.top + box.height / 2
            }
          })
          paths += `<path class="pg-gr-contain-path pg-gr-contain-trunk" d="M${start.x} ${start.y} V${Math.max(...ends.map(point => point.y))}"/>`
          ends.forEach(to => { paths += `<path class="pg-gr-contain-path" d="M${start.x} ${to.y} H${to.x}"/>` })
        }
        svg.innerHTML = paths
      }
      setTimeout(drawNodeLinks, 0)

      el.querySelectorAll('[data-relation-more]').forEach(btn => btn.onclick = () => {
        const content = document.getElementById('content')
        const scrollTop = content.scrollTop
        const key = relationKey(btn.dataset.relationMore)
        __graphRelationExpanded[key] = !__graphRelationExpanded[key]
        renderFocus(d.id)
        requestAnimationFrame(() => { content.scrollTop = Math.min(scrollTop, Math.max(0, content.scrollHeight - content.clientHeight)) })
      })

      // —— 面板 tab ——
      const body = el.querySelector('#pg-gr-panel-body')
      const companyRelationLabel = level => {
        const value = String(level || '')
        if (/概念|低/.test(value)) return '概念'
        if (/代表|核心|高/.test(value)) return '代表'
        return '相关'
      }
      function renderCo() {
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px">
            ${d.companies.length ? d.companies.map(c => `
            <div class="co-card pg-gr-company-card" data-co="${c.name}">${UI.avatar(c.name)}
              <div style="flex:1;min-width:0">
                <div class="pg-gr-co-top"><span class="co-name">${c.name}</span><span class="pg-gr-co-relation">${companyRelationLabel(c.level)}</span></div>
                <div class="co-sub">${c.code || '未上市'} · ${c.role || '角色未标注'}</div>
                <div class="pg-gr-co-reason"><b>关联依据：</b>${c.reason || '底稿已建立该节点关联'}</div>
                <div class="pg-gr-co-source">${c.source || '产业链研究底稿'} · 更新至 ${c.updatedAt || '—'}</div>
              </div>
              <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
            </div>`).join('') : '<div class="pg-gr-contain-empty">当前节点没有关联公司</div>'}
          </div>
          <div class="row mt12" style="justify-content:space-between">
            <span class="fs12 t3">公司关联依据来自底稿与公开资料，不代表投资评级</span>
            <span class="link fs13" id="pg-gr-allco">查看全部公司 ›</span>
          </div>`
        body.querySelector('#pg-gr-allco').onclick = () => ctx.go('company')
        body.querySelectorAll('.co-card[data-co]').forEach(cc => cc.onclick = () => ctx.go('company', { q: cc.dataset.co }))
      }
      function renderInd() {
        const watchIndicators = new Set(nodeInsight.watchIndicators || [])
        const orderedIndicators = d.indicators.slice().sort((left, right) => Number(watchIndicators.has(right.name)) - Number(watchIndicators.has(left.name)))
        const limited = hasNodeInsight && orderedIndicators.length > 5 && !__graphIndicatorsExpanded[d.id]
        const visibleIndicators = limited ? orderedIndicators.slice(0, 5) : orderedIndicators
        const context = nodeInsight.indicatorContext || '以下指标来自节点绑定，用于观察相关行业景气，不等同于该节点自身的市场表现。'
        body.innerHTML = `<div class="pg-gr-evidence-note"><b>景气观察</b>${context}</div>${visibleIndicators.length ? visibleIndicators.map((ind, i) => `
          <div class="pg-gr-ind" data-ind="${ind.name}" style="cursor:pointer">
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;color:var(--t1)">${ind.name}${watchIndicators.has(ind.name) ? '<span class="pg-gr-watch-tag">关键观察</span>' : ''}</div>
              <div class="meta">${ind.freq} · ${ind.source}${ind.trend ? ` · ${ind.trend}` : ''}</div>
            </div>
            <canvas data-i="${i}" style="width:64px;height:24px;flex:none"></canvas>
            <div class="val"><b>${formatMetricValue(ind.latest)}</b> <span class="fs12 t3">${ind.unit}</span><div class="d">${ind.latestDate}</div></div>
            <span style="color:var(--t3);display:flex">${UI.icons.right}</span>
          </div>`).join('') : '<div class="pg-gr-contain-empty">当前节点没有关联指标</div>'}${hasNodeInsight && orderedIndicators.length > 5 ? `<button class="pg-gr-more-ind" id="pg-gr-more-ind" type="button">${limited ? `查看全部 ${orderedIndicators.length} 项指标` : '收起至前 5 项'}</button>` : ''}`
        setTimeout(() => body.querySelectorAll('canvas').forEach(c => {
          const ind = visibleIndicators[+c.dataset.i]
          UI.sparkline(c, ind.series, css('brand'))
        }), 0)
        const moreIndicators = body.querySelector('#pg-gr-more-ind')
        if (moreIndicators) moreIndicators.onclick = () => {
          __graphIndicatorsExpanded[d.id] = limited
          renderInd()
        }
        body.querySelectorAll('.pg-gr-ind[data-ind]').forEach(r => r.onclick = () => ctx.go('indicator', { ind: r.dataset.ind }))
      }
      const renderers = { co: renderCo, ind: renderInd }
      function activateTab(key) {
        const next = renderers[key] ? key : 'co'
        __graphDetailTab = next
        el.querySelectorAll('.pill-tab').forEach(x => x.classList.toggle('on', x.dataset.t === next))
        renderers[next]()
      }
      activateTab(__graphDetailTab)
      el.querySelectorAll('.pill-tab').forEach(p => p.onclick = () => activateTab(p.dataset.t))
      el.querySelectorAll('[data-contain-preview-node],[data-contain-preview-parent]').forEach(item => item.onclick = () => {
        ctx.go('graph', { node: item.dataset.containPreviewNode || item.dataset.containPreviewParent })
      })

      // —— 交互:直接上下游卡片点击 → 重新聚焦 ——
      el.querySelectorAll('.pg-gr-ego-card[data-id]').forEach(cd => cd.onclick = () => {
        if (cd.dataset.id !== d.id) ctx.go('graph', { node: cd.dataset.id })
      })
      // "还出现在 X 产业链" chip → 可看则切链,否则提示
      el.querySelectorAll('.chip[data-also]').forEach(ch => ch.onclick = async () => {
        const name = ch.dataset.also
        const target = M.chains.find(c => c.title === name && c.live)
        if (target) { await ctx.selectChain(target.key, 'overview') }
        else { const t = document.createElement('div'); t.className = 'pg-hm-toast'; t.textContent = `「${name}」暂未收录数据`; document.getElementById('phone').appendChild(t); setTimeout(() => t.remove(), 1600) }
      })
      // 分段位置条:点击任一分段 → 图谱列表定位到该分段
      el.querySelectorAll('.pg-gr-posbar .seg[data-band]').forEach(s => s.onclick = () => ctx.go('atlas', { band: s.dataset.band }))
      // 缩放:0.85–1.25 有界,作用于整图容器(替代原 alert 演示)
      let zoom = 1
      const egoBox = el.querySelector('#pg-gr-ego')
      el.querySelectorAll('.pg-gr-zoom span').forEach((sp, i) => sp.onclick = () => {
        zoom = Math.min(1.25, Math.max(0.85, +(zoom + (i === 0 ? 0.1 : -0.1)).toFixed(2)))
        egoBox.style.transformOrigin = 'center top'
        egoBox.style.transform = `scale(${zoom})`
      })
    }

    if (ctx.params && ctx.params.__list) renderList()
    else renderFocus((ctx.params && ctx.params.node) || __graphLastFocus || M.findNodes('减速器', 1)[0]?.id)
  }
}

// 图谱分段 = 动态层级/小分类列表(复用本模块,__list 标记走列表分支;band 参数定位分段)
window.Page_overview = {
  title: '图谱',
  render(el, ctx) { window.Page_graph.render(el, { go: ctx.go, selectChain: ctx.selectChain, params: { __list: true, band: ctx.params && ctx.params.band } }) }
}
