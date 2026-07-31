// 示意数据唯一出处。所有页面数字必须来自本文件,不得在页面里自造。
// 机器人/算力两链为"真实模拟":公司关联/指标名称/来源均按真实口径整理,数值序列为示意。
//
// 【关系口径】当前原型显式维护节点级结构关系表:EDGES 表示上/下游结构关联,CONTAINS 表示父子包含。
// 这些关系用于验证交互与视觉方案,不是接口返回的正式拓扑;页面必须同步展示"原型示意"边界,
// 不得把结构关联解释为直接供应、交易或一一对应关系。
window.MOCK = (() => {
  const COMPLIANCE = {
    DISCLAIMER: '本内容基于公开资料与第三方数据整理,仅供参考,不构成任何投资建议或对任何证券价值的判断。产业链归类与公司关联为研究性梳理,不代表对相关公司经营或股价的预测。市场有风险,投资需谨慎。',
    SOURCE_LINE: '数据来源:同花顺金融研究中心 · iFinD',
    CONSENT: {
      title: '欢迎使用飞研产业研究平台',
      body: '本产品提供产业链结构、代表公司与行业指标等信息展示服务,不提供投资咨询、荐股或买卖建议。请您根据自身风险承受能力独立决策。',
      confirm: '我已知晓'
    }
  }
  const meta = { dataAsOf: '2026-07-15', note: '原型示意数据' }
  const ADJ_NOTE = '节点连线与父子包含来自原型关系表,用于表达结构方向与交互方案;不代表直接供应、交易或一一对应关系,正式关系以后续接口数据为准。'

  const chains = [
    { key: 'robot',        title: '机器人',   nodeCount: 420, companyCount: 103,  indicatorCount: 339, live: true },
    { key: 'compute',      title: '算力',     nodeCount: 436, companyCount: 1177, indicatorCount: 377, live: true },
    { key: 'storage_chip', title: '存储芯片', nodeCount: 249, companyCount: 322,  indicatorCount: 316, live: false },
    { key: 'aerospace',    title: '航空航天', nodeCount: 166, companyCount: 663,  indicatorCount: 262, live: false },
    { key: 'gold',         title: '黄金',     nodeCount: 188, companyCount: 360,  indicatorCount: 349, live: false },
    { key: 'silver',       title: '白银',     nodeCount: 203, companyCount: 362,  indicatorCount: 356, live: false }
  ]

  const ser = (base, slope, amp, n = 24) =>
    Array.from({ length: n }, (_, i) => +(base + slope * i + amp * Math.sin(i * 1.13) + amp * 0.5 * Math.sin(i * 2.71)).toFixed(2))

  const bandLabelOf = { upstream: '上游供给侧', midstream: '中游核心环节', downstream: '下游需求侧' }

  // ============================================================
  //  机器人链
  // ============================================================
  const IND = {
    gycl:  { name: '工业机器人产量:当月值', freq: '月', source: '国家统计局', unit: '万套', latest: '5.23', latestDate: '2026-05', series: ser(3.4, 0.07, 0.35) },
    gytb:  { name: '工业机器人产量:当月同比', freq: '月', source: '国家统计局', unit: '%', latest: '12.6', latestDate: '2026-05', series: ser(6, 0.25, 2.8) },
    zztz:  { name: '制造业固定资产投资:累计同比', freq: '月', source: '国家统计局', unit: '%', latest: '6.8', latestDate: '2026-05', series: ser(5.2, 0.06, 1.1) },
    kdl:   { name: '快递业务量:当月值', freq: '月', source: '国家邮政局', unit: '亿件', latest: '158.3', latestDate: '2026-05', series: ser(110, 1.9, 9) },
    lpi:   { name: '中国物流业景气指数(LPI)', freq: '月', source: '中国物流与采购联合会', unit: '%', latest: '51.2', latestDate: '2026-06', series: ser(49.5, 0.04, 1.2) },
    rxchl: { name: '人形机器人出货量:年度', freq: '年', source: 'GGII', unit: '万台', latest: '1.2', latestDate: '2025-12', series: ser(0.1, 0.11, 0.04, 10) },
    xzxl:  { name: '协作机器人销量:年度', freq: '年', source: 'GGII', unit: '万台', latest: '9.6', latestDate: '2025-12', series: ser(2.8, 0.65, 0.3, 10) },
    cgqcl: { name: '敏感元件及传感器产量:当月值', freq: '月', source: '国家统计局', unit: '亿只', latest: '32.5', latestDate: '2026-05', series: ser(24, 0.35, 2.2) }
  }

  const ROBOT_NODE = {
    jsq: { name: '减速器', band: 'upstream', importance: '非常重要',
      intro: '减速器是机器人关节传动的核心部件,通过降速增扭实现高精度运动控制。谐波减速器与RV减速器为主流技术路线,是机器人整机成本占比最高的零部件之一。',
      companies: [
        { name: '绿的谐波', code: '688017.SH', region: '江苏苏州', level: '代表' },
        { name: '双环传动', code: '002472.SZ', region: '浙江台州', level: '代表' },
        { name: '中大力德', code: '002896.SZ', region: '浙江宁波', level: '相关' },
        { name: '国茂股份', code: '603915.SH', region: '江苏常州', level: '相关' },
        { name: '秦川机床', code: '000837.SZ', region: '陕西宝鸡', level: '相关' }
      ],
      indicators: [
        { name: '减速机产量:当月值', freq: '月', source: '国家统计局', unit: '万台', latest: '73.6', latestDate: '2026-05', series: ser(58, 0.6, 4) },
        { name: 'RV减速器进口均价', freq: '月', source: '海关总署', unit: '美元/台', latest: '486.2', latestDate: '2021-11', series: ser(560, -3.2, 18, 12), discontinued: true }
      ] },
    cgq: { name: '传感器', band: 'upstream', importance: '非常重要',
      intro: '传感器为机器人提供力觉、视觉、位置等感知能力,是实现智能交互与安全控制的基础。机器人常用类型包括力/力矩传感器、编码器与3D视觉传感器。',
      companies: [
        { name: '奥比中光', code: '688322.SH', region: '广东深圳', level: '代表' },
        { name: '柯力传感', code: '603662.SH', region: '浙江宁波', level: '代表' },
        { name: '汉威科技', code: '300007.SZ', region: '河南郑州', level: '相关' },
        { name: '敏芯股份', code: '688286.SH', region: '江苏苏州', level: '相关' },
        { name: '芯动联科', code: '688582.SH', region: '安徽蚌埠', level: '相关' }
      ],
      indicators: [ IND.cgqcl, { name: 'MEMS传感器市场规模:年度', freq: '年', source: '赛迪顾问', unit: '亿元', latest: '1,082', latestDate: '2025-12', series: ser(620, 20, 15, 10) } ] },
    sfdj: { name: '伺服电机', band: 'upstream', importance: '非常重要',
      intro: '伺服电机是机器人的动力执行单元,配合驱动器完成对速度、位置与扭矩的闭环控制,其响应速度与控制精度直接决定整机性能。',
      companies: [
        { name: '汇川技术', code: '300124.SZ', region: '广东深圳', level: '代表' },
        { name: '禾川科技', code: '688320.SH', region: '浙江衢州', level: '代表' },
        { name: '鸣志电器', code: '603728.SH', region: '上海',     level: '相关' },
        { name: '雷赛智能', code: '002979.SZ', region: '广东深圳', level: '相关' },
        { name: '江特电机', code: '002176.SZ', region: '江西宜春', level: '概念' }
      ],
      indicators: [ { name: '交流伺服系统市场规模:季度', freq: '季', source: 'MIR睿工业', unit: '亿元', latest: '68.3', latestDate: '2026-03', series: ser(48, 0.9, 3.5, 16) }, { name: '微特电机出口数量:当月值', freq: '月', source: '海关总署', unit: '亿台', latest: '5.8', latestDate: '2026-05', series: ser(4.6, 0.05, 0.4) } ] },
    kzq: { name: '控制器', band: 'upstream', importance: '重要',
      intro: '控制器是机器人的"大脑",负责运动规划、轨迹插补与多轴协同,核心壁垒在控制算法与实时软件,近年国产化率持续提升。',
      companies: [
        { name: '固高科技', code: '301510.SZ', region: '广东深圳', level: '代表' },
        { name: '雷赛智能', code: '002979.SZ', region: '广东深圳', level: '代表' },
        { name: '汇川技术', code: '300124.SZ', region: '广东深圳', level: '相关' },
        { name: '英威腾',   code: '002334.SZ', region: '广东深圳', level: '相关' }
      ],
      indicators: [ { name: 'PLC市场规模:季度', freq: '季', source: 'MIR睿工业', unit: '亿元', latest: '42.6', latestDate: '2026-03', series: ser(35, 0.4, 2.4, 16) }, { name: '运动控制器出货量:年度', freq: '年', source: 'MIR睿工业', unit: '万套', latest: '412', latestDate: '2025-12', series: ser(260, 15, 10, 10) } ] },
    sg: { name: '丝杠', band: 'upstream', importance: '重要',
      intro: '丝杠将旋转运动转化为高精度直线运动,行星滚柱丝杠是人形机器人线性关节的核心传动部件,磨削工艺与专用设备构成主要壁垒。',
      companies: [
        { name: '恒立液压', code: '601100.SH', region: '江苏常州', level: '相关' },
        { name: '贝斯特',   code: '300580.SZ', region: '江苏无锡', level: '相关' },
        { name: '五洲新春', code: '603667.SH', region: '浙江绍兴', level: '相关' },
        { name: '秦川机床', code: '000837.SZ', region: '陕西宝鸡', level: '相关' }
      ],
      indicators: [ { name: '行星滚柱丝杠市场规模:年度', freq: '年', source: 'GGII', unit: '亿元', latest: '28.6', latestDate: '2025-12', series: ser(6, 2.2, 1, 10) }, { name: '金属切削机床产量:当月值', freq: '月', source: '国家统计局', unit: '万台', latest: '6.2', latestDate: '2026-05', series: ser(5.1, 0.04, 0.5) } ] },
    jqsj: { name: '机器视觉', band: 'upstream', importance: '重要',
      intro: '机器视觉为机器人提供定位、识别与质检能力,由工业相机、镜头、光源与算法平台构成,3D视觉在无序抓取等场景加速渗透。',
      companies: [
        { name: '奥普特',   code: '688686.SH', region: '广东东莞', level: '代表' },
        { name: '凌云光',   code: '688400.SH', region: '北京',     level: '代表' },
        { name: '天准科技', code: '688003.SH', region: '江苏苏州', level: '相关' },
        { name: '奥比中光', code: '688322.SH', region: '广东深圳', level: '相关' }
      ],
      indicators: [ { name: '中国机器视觉市场规模:年度', freq: '年', source: 'GGII', unit: '亿元', latest: '208.5', latestDate: '2025-12', series: ser(120, 8.5, 6, 10) }, IND.cgqcl ] },
    mdzxq: { name: '末端执行器', band: 'upstream', importance: '重要',
      intro: '末端执行器是机器人与作业对象直接交互的部件,涵盖夹爪、吸盘与灵巧手,灵巧手作为人形机器人的关键增量部件受到广泛关注。',
      companies: [
        { name: '兆威机电', code: '003021.SZ', region: '广东深圳', level: '相关' },
        { name: '捷昌驱动', code: '603583.SH', region: '浙江绍兴', level: '相关' },
        { name: '鸣志电器', code: '603728.SH', region: '上海',     level: '相关' }
      ],
      indicators: [IND.rxchl, IND.gycl] },
    zc: { name: '精密轴承', band: 'upstream', importance: '一般',
      intro: '精密轴承支撑机器人关节与执行机构的高速回转,等截面薄壁轴承与交叉滚子轴承是关节部位的主流方案。',
      companies: [
        { name: '长盛轴承', code: '300718.SZ', region: '浙江嘉兴', level: '相关' },
        { name: '五洲新春', code: '603667.SH', region: '浙江绍兴', level: '相关' },
        { name: '国机精工', code: '002046.SZ', region: '河南洛阳', level: '相关' }
      ],
      indicators: [ { name: '滚动轴承产量:当月值', freq: '月', source: '国家统计局', unit: '亿套', latest: '2.36', latestDate: '2026-05', series: ser(1.9, 0.015, 0.18) } ] },
    gyjqr: { name: '工业机器人', band: 'midstream', importance: '非常重要',
      intro: '工业机器人面向焊接、搬运、装配等工业场景,以多关节机械臂为主流形态,广泛应用于汽车、3C电子等制造业,是产业链中游规模最大的整机品类。',
      companies: [
        { name: '埃斯顿',   code: '002747.SZ', region: '江苏南京', level: '代表' },
        { name: '机器人',   code: '300024.SZ', region: '辽宁沈阳', level: '代表' },
        { name: '埃夫特',   code: '688165.SH', region: '安徽芜湖', level: '相关' },
        { name: '拓斯达',   code: '300607.SZ', region: '广东东莞', level: '相关' },
        { name: '华中数控', code: '300161.SZ', region: '湖北武汉', level: '相关' },
        { name: '新时达',   code: '002527.SZ', region: '上海',     level: '相关' }
      ],
      indicators: [IND.gycl, IND.gytb, IND.zztz] },
    xzjqr: { name: '协作机器人', band: 'midstream', importance: '非常重要',
      intro: '协作机器人是与人类在共同空间中协同工作的机器人,具备安全、易用、灵活部署等特点,广泛应用于多行业的自动化场景。',
      alsoIn: ['算力', '人工智能'],
      companies: [
        { name: '埃斯顿',   code: '002747.SZ', region: '江苏南京', level: '代表' },
        { name: '机器人',   code: '300024.SZ', region: '辽宁沈阳', level: '代表' },
        { name: '汇川技术', code: '300124.SZ', region: '广东深圳', level: '相关' },
        { name: '绿的谐波', code: '688017.SH', region: '江苏苏州', level: '相关' },
        { name: '拓斯达',   code: '300607.SZ', region: '广东东莞', level: '相关' },
        { name: '埃夫特',   code: '688165.SH', region: '安徽芜湖', level: '概念' }
      ],
      indicators: [IND.xzxl, IND.gycl, IND.gytb] },
    rxjqr: { name: '人形机器人', band: 'midstream', importance: '非常重要',
      intro: '人形机器人以类人形态面向通用任务场景,是产业链当前关注度最高的整机方向,量产与降本依赖上游核心零部件的国产化。',
      companies: [
        { name: '优必选',   code: '9880.HK',   region: '广东深圳', level: '代表' },
        { name: '均普智能', code: '688306.SH', region: '浙江宁波', level: '相关' },
        { name: '埃夫特',   code: '688165.SH', region: '安徽芜湖', level: '概念' },
        { name: '埃斯顿',   code: '002747.SZ', region: '江苏南京', level: '概念' }
      ],
      indicators: [IND.rxchl, IND.xzxl] },
    fwjqr: { name: '服务机器人', band: 'midstream', importance: '重要',
      intro: '服务机器人面向家庭与商用服务场景,涵盖清洁、配送、导览等品类,消费级市场以扫地机器人渗透率最高。',
      companies: [
        { name: '科沃斯',   code: '603486.SH', region: '江苏苏州', level: '代表' },
        { name: '石头科技', code: '688169.SH', region: '北京',     level: '代表' },
        { name: '九号公司', code: '689009.SH', region: '北京',     level: '相关' },
        { name: '亿嘉和',   code: '603666.SH', region: '江苏南京', level: '相关' }
      ],
      indicators: [ { name: '服务机器人产量:当月值', freq: '月', source: '国家统计局', unit: '万套', latest: '98.4', latestDate: '2026-05', series: ser(62, 1.4, 6) }, { name: '服务机器人产量:当月同比', freq: '月', source: '国家统计局', unit: '%', latest: '17.2', latestDate: '2026-05', series: ser(9, 0.3, 3.2) } ] },
    psjqr: { name: '配送机器人', band: 'midstream', importance: '重要',
      intro: '配送机器人聚焦室内外末端配送场景,与即时物流、餐饮酒店等业态结合,是服务机器人中商业化落地较快的方向之一。',
      companies: [
        { name: '九号公司', code: '689009.SH', region: '北京',     level: '代表' },
        { name: '德马科技', code: '688360.SH', region: '浙江湖州', level: '相关' },
        { name: '机器人',   code: '300024.SZ', region: '辽宁沈阳', level: '相关' }
      ],
      indicators: [ IND.kdl, { name: '即时配送订单规模:年度', freq: '年', source: '艾瑞咨询', unit: '亿单', latest: '512', latestDate: '2025-12', series: ser(280, 24, 12, 10) } ] },
    tzjqr: { name: '特种机器人', band: 'midstream', importance: '重要',
      intro: '特种机器人面向电力巡检、消防救援、核工业等高危专业场景,以行业定制与运维服务为主要商业模式。',
      companies: [
        { name: '亿嘉和',   code: '603666.SH', region: '江苏南京', level: '代表' },
        { name: '申昊科技', code: '300853.SZ', region: '浙江杭州', level: '代表' },
        { name: '景业智能', code: '688290.SH', region: '浙江杭州', level: '相关' }
      ],
      indicators: [ { name: '特种机器人市场规模:年度', freq: '年', source: '中国电子学会', unit: '亿元', latest: '246', latestDate: '2025-12', series: ser(110, 13, 6, 10) } ] },
    agv: { name: '移动机器人AGV', band: 'midstream', importance: '重要',
      intro: '移动机器人(AGV/AMR)通过激光/视觉导航自主完成物料搬运与分拣,是智能仓储与柔性产线的基础装备。',
      companies: [
        { name: '诺力股份', code: '603611.SH', region: '浙江湖州', level: '代表' },
        { name: '兰剑智能', code: '688557.SH', region: '山东济南', level: '相关' },
        { name: '机器人',   code: '300024.SZ', region: '辽宁沈阳', level: '相关' },
        { name: '东杰智能', code: '300486.SZ', region: '山西太原', level: '相关' }
      ],
      indicators: [ { name: '工业应用移动机器人销量:年度', freq: '年', source: '中国移动机器人产业联盟', unit: '万台', latest: '12.8', latestDate: '2025-12', series: ser(4, 0.9, 0.4, 10) }, IND.lpi ] },
    xtjc: { name: '系统集成', band: 'midstream', importance: '一般',
      intro: '系统集成商将机器人本体与工艺、软件结合为产线级解决方案,贴近终端行业需求,是机器人规模化落地的关键环节。',
      companies: [
        { name: '拓斯达',   code: '300607.SZ', region: '广东东莞', level: '代表' },
        { name: '赛腾股份', code: '603283.SH', region: '江苏苏州', level: '相关' },
        { name: '克来机电', code: '603960.SH', region: '上海',     level: '相关' }
      ],
      indicators: [IND.zztz, IND.gycl] },
    qczz: { name: '汽车制造', band: 'downstream', importance: '非常重要',
      intro: '汽车制造是工业机器人最大的下游应用行业,焊装、涂装与总装环节自动化率高,新能源车产线扩建带来持续需求。',
      companies: [
        { name: '比亚迪',   code: '002594.SZ', region: '广东深圳', level: '相关' },
        { name: '赛力斯',   code: '601127.SH', region: '重庆',     level: '相关' },
        { name: '长城汽车', code: '601633.SH', region: '河北保定', level: '相关' }
      ],
      indicators: [ { name: '汽车产量:当月值', freq: '月', source: '中国汽车工业协会', unit: '万辆', latest: '268.5', latestDate: '2026-06', series: ser(220, 1.8, 16) }, { name: '新能源汽车产量:当月值', freq: '月', source: '中国汽车工业协会', unit: '万辆', latest: '132.7', latestDate: '2026-06', series: ser(80, 2.2, 8) } ] },
    dzzz: { name: '3C电子制造', band: 'downstream', importance: '重要',
      intro: '3C电子是工业机器人第二大应用行业,精密装配、检测与搬运环节大量使用小负载与协作机器人。',
      companies: [
        { name: '立讯精密', code: '002475.SZ', region: '广东东莞', level: '相关' },
        { name: '工业富联', code: '601138.SH', region: '广东深圳', level: '相关' },
        { name: '蓝思科技', code: '300433.SZ', region: '湖南长沙', level: '相关' }
      ],
      indicators: [ { name: '手机产量:当月值', freq: '月', source: '国家统计局', unit: '亿台', latest: '1.28', latestDate: '2026-05', series: ser(1.1, 0.006, 0.09) } ] },
    zxjx: { name: '重型机械制造', band: 'downstream', importance: '重要',
      intro: '重型机械制造是机器人重要的下游应用领域,焊接、搬运机器人在工程机械与重工生产线中大规模使用,自动化改造需求持续释放。',
      companies: [
        { name: '三一重工', code: '600031.SH', region: '湖南长沙', level: '代表' },
        { name: '徐工机械', code: '000425.SZ', region: '江苏徐州', level: '代表' },
        { name: '中联重科', code: '000157.SZ', region: '湖南长沙', level: '相关' },
        { name: '柳工',     code: '000528.SZ', region: '广西柳州', level: '相关' }
      ],
      indicators: [ { name: '挖掘机销量:当月值', freq: '月', source: '中国工程机械工业协会', unit: '台', latest: '19,650', latestDate: '2026-06', series: ser(15200, 130, 1400) }, { name: '起重机产量:当月值', freq: '月', source: '国家统计局', unit: '台', latest: '4,820', latestDate: '2026-05', series: ser(4100, 22, 260) } ] },
    syqj: { name: '商业清洁', band: 'downstream', importance: '一般',
      intro: '商业清洁场景使用清洁机器人替代人工完成商场、写字楼等公共空间的清洁作业,人力成本上升推动渗透率持续提升。',
      companies: [
        { name: '盈峰环境', code: '000967.SZ', region: '广东佛山', level: '代表' },
        { name: '科沃斯',   code: '603486.SH', region: '江苏苏州', level: '相关' },
        { name: '石头科技', code: '688169.SH', region: '北京',     level: '概念' }
      ],
      indicators: [ { name: '扫地机器人零售额:当月值', freq: '月', source: '奥维云网', unit: '亿元', latest: '13.8', latestDate: '2026-05', series: ser(9.2, 0.16, 1.3) }, { name: '商用清洁机器人销量:年度', freq: '年', source: 'GGII', unit: '万台', latest: '11.2', latestDate: '2025-12', series: ser(4.5, 0.72, 0.5, 10) } ] },
    zhyl: { name: '最后一公里配送', band: 'downstream', importance: '重要',
      intro: '最后一公里配送是物流链路的末端环节,配送机器人与无人配送车在社区、园区等封闭半封闭场景逐步落地。',
      companies: [
        { name: '顺丰控股', code: '002352.SZ', region: '广东深圳', level: '相关' },
        { name: '德邦股份', code: '603056.SH', region: '上海',     level: '相关' },
        { name: '九号公司', code: '689009.SH', region: '北京',     level: '概念' }
      ],
      indicators: [ IND.kdl, { name: '快递业务收入:当月值', freq: '月', source: '国家邮政局', unit: '亿元', latest: '1,246', latestDate: '2026-05', series: ser(980, 10, 55) } ] },
    ccwl: { name: '仓储物流', band: 'downstream', importance: '重要',
      intro: '仓储物流场景大量使用移动机器人(AGV/AMR)完成搬运、分拣与存取,是机器人下游增长较快的应用方向。',
      companies: [
        { name: '诺力股份', code: '603611.SH', region: '浙江湖州', level: '代表' },
        { name: '兰剑智能', code: '688557.SH', region: '山东济南', level: '代表' },
        { name: '音飞储存', code: '603066.SH', region: '江苏南京', level: '相关' },
        { name: '东杰智能', code: '300486.SZ', region: '山西太原', level: '相关' }
      ],
      indicators: [ IND.lpi, { name: '社会物流总额:累计值', freq: '月', source: '中国物流与采购联合会', unit: '万亿元', latest: '168.2', latestDate: '2026-05', series: ser(120, 2.1, 4) } ] },
    ylkf: { name: '医疗康复', band: 'downstream', importance: '重要',
      intro: '医疗场景涵盖手术、康复与院内物流机器人,手术机器人技术壁垒与单机价值量最高,国产化进程加快。',
      companies: [
        { name: '天智航',     code: '688277.SH', region: '北京', level: '代表' },
        { name: '微创机器人', code: '2252.HK',   region: '上海', level: '代表' },
        { name: '伟思医疗',   code: '688580.SH', region: '江苏南京', level: '相关' }
      ],
      indicators: [ { name: '手术机器人市场规模:年度', freq: '年', source: '弗若斯特沙利文', unit: '亿元', latest: '98.4', latestDate: '2025-12', series: ser(30, 7, 3, 10) } ] }
  }
  const ROBOT_BANDS = [
    { key: 'upstream', title: '上游供给侧', subtitle: '关键零部件与材料供给', nodeCount: 168, companyCount: 483, indicatorCount: 180,
      nodes: [
        { id: 'jsq', name: '减速器', companies: 86, indicators: 24 }, { id: 'cgq', name: '传感器', companies: 112, indicators: 32 },
        { id: 'sfdj', name: '伺服电机', companies: 78, indicators: 20 }, { id: 'kzq', name: '控制器', companies: 65, indicators: 18 },
        { id: 'sg', name: '丝杠', companies: 42, indicators: 12 }, { id: 'jqsj', name: '机器视觉', companies: 96, indicators: 18 },
        { id: 'mdzxq', name: '末端执行器', companies: 58, indicators: 10 }, { id: 'zc', name: '精密轴承', companies: 74, indicators: 14 }
      ] },
    { key: 'midstream', title: '中游核心环节', subtitle: '整机制造与系统集成', nodeCount: 96, companyCount: 296, indicatorCount: 98,
      nodes: [
        { id: 'gyjqr', name: '工业机器人', companies: 128, indicators: 36 }, { id: 'xzjqr', name: '协作机器人', companies: 86, indicators: 24 },
        { id: 'rxjqr', name: '人形机器人', companies: 68, indicators: 12 }, { id: 'fwjqr', name: '服务机器人', companies: 76, indicators: 22 },
        { id: 'psjqr', name: '配送机器人', companies: 54, indicators: 16 }, { id: 'tzjqr', name: '特种机器人', companies: 47, indicators: 14 },
        { id: 'agv', name: '移动机器人AGV', companies: 61, indicators: 15 }, { id: 'xtjc', name: '系统集成', companies: 88, indicators: 12 }
      ] },
    { key: 'downstream', title: '下游需求侧', subtitle: '应用场景与解决方案', nodeCount: 156, companyCount: 277, indicatorCount: 127,
      nodes: [
        { id: 'qczz', name: '汽车制造', companies: 156, indicators: 44 }, { id: 'dzzz', name: '3C电子制造', companies: 132, indicators: 38 },
        { id: 'zxjx', name: '重型机械制造', companies: 142, indicators: 40 }, { id: 'syqj', name: '商业清洁', companies: 98, indicators: 26 },
        { id: 'zhyl', name: '最后一公里配送', companies: 71, indicators: 20 }, { id: 'ccwl', name: '仓储物流', companies: 63, indicators: 18 },
        { id: 'ylkf', name: '医疗康复', companies: 52, indicators: 16 }
      ] }
  ]
  // 注:原 ROBOT_HOT「热门主干路径」已删除(v1.4)——跨分段三节点连成"路径"违背底稿无节点级边的口径;
  // README 预留的降级规则(拓扑不符则降级为精选)经评估仍易误读,直接移除,待真实数据可用后再议。

  // ============================================================
  //  算力链(真实模拟)
  // ============================================================
  const CIND = {
    gpucl: { name: 'GPU显卡进口金额:当月值', freq: '月', source: '海关总署', unit: '亿美元', latest: '38.6', latestDate: '2026-05', series: ser(22, 0.6, 3) },
    fwqcl: { name: '服务器出货量:季度', freq: '季', source: 'IDC', unit: '万台', latest: '112.4', latestDate: '2026-03', series: ser(70, 2.6, 6, 16) },
    idctz: { name: '数据中心IT投资:年度', freq: '年', source: '信通院', unit: '亿元', latest: '5,820', latestDate: '2025-12', series: ser(2800, 300, 120, 10) }
  }
  const COMPUTE_NODE = {
    c_gpu: { name: 'AI芯片/GPU', band: 'upstream', importance: '非常重要',
      intro: 'AI芯片是算力的核心引擎,GPU/GPGPU、NPU、ASIC等提供大规模并行计算能力,是大模型训练与推理的算力底座,国产替代空间广阔。',
      alsoIn: ['机器人', '人工智能'],
      companies: [
        { name: '英伟达',   code: 'NVDA',      region: '美国',     level: '代表' },
        { name: '海光信息', code: '688041.SH', region: '天津',     level: '代表' },
        { name: '寒武纪',   code: '688256.SH', region: '北京',     level: '代表' },
        { name: '景嘉微',   code: '300474.SZ', region: '湖南长沙', level: '相关' },
        { name: '龙芯中科', code: '688047.SH', region: '北京',     level: '相关' }
      ],
      indicators: [ CIND.gpucl, { name: 'AI芯片市场规模:年度', freq: '年', source: '亿欧智库', unit: '亿元', latest: '1,680', latestDate: '2025-12', series: ser(400, 150, 40, 10) } ] },
    c_hbm: { name: '存储芯片/HBM', band: 'upstream', importance: '非常重要',
      intro: 'HBM高带宽存储通过3D堆叠为AI芯片提供高吞吐数据供给,是大模型算力的关键瓶颈之一;DRAM与接口芯片同为算力存储的核心环节。',
      companies: [
        { name: '兆易创新', code: '603986.SH', region: '北京',     level: '代表' },
        { name: '澜起科技', code: '688008.SH', region: '上海',     level: '代表' },
        { name: '北京君正', code: '300223.SZ', region: '北京',     level: '相关' },
        { name: '深科技',   code: '000021.SZ', region: '广东深圳', level: '相关' }
      ],
      indicators: [ { name: 'DRAM现货价格:DDR5', freq: '月', source: 'DRAMeXchange', unit: '美元', latest: '4.82', latestDate: '2026-05', series: ser(3.2, 0.05, 0.3) }, { name: '集成电路进口金额:累计值', freq: '月', source: '海关总署', unit: '亿美元', latest: '1,536', latestDate: '2026-05', series: ser(1100, 22, 40) } ] },
    c_gmk: { name: '光模块', band: 'upstream', importance: '非常重要',
      intro: '光模块承担数据中心内部与集群互联的光电转换,800G/1.6T高速光模块随AI集群规模扩张需求高增,国内厂商全球份额领先。',
      companies: [
        { name: '中际旭创', code: '300308.SZ', region: '四川成都', level: '代表' },
        { name: '新易盛',   code: '300502.SZ', region: '四川成都', level: '代表' },
        { name: '天孚通信', code: '300394.SZ', region: '江苏苏州', level: '代表' },
        { name: '光迅科技', code: '002281.SZ', region: '湖北武汉', level: '相关' }
      ],
      indicators: [ { name: '光模块市场规模:年度', freq: '年', source: 'LightCounting', unit: '亿美元', latest: '176', latestDate: '2025-12', series: ser(80, 9, 5, 10) } ] },
    c_pcb: { name: 'PCB印制电路板', band: 'upstream', importance: '重要',
      intro: '高多层与高频高速PCB是AI服务器与交换机的核心承载,算力升级带动高端PCB价值量与技术门槛提升。',
      companies: [
        { name: '沪电股份', code: '002463.SZ', region: '江苏昆山', level: '代表' },
        { name: '深南电路', code: '002916.SZ', region: '广东深圳', level: '代表' },
        { name: '生益科技', code: '600183.SH', region: '广东东莞', level: '相关' }
      ],
      indicators: [ { name: '印制电路板产量:当月值', freq: '月', source: '国家统计局', unit: '万平方米', latest: '3,860', latestDate: '2026-05', series: ser(3100, 24, 180) } ] },
    c_dy: { name: '服务器电源', band: 'upstream', importance: '重要',
      intro: '服务器电源为高功率AI服务器提供稳定供电,高功率密度与高转换效率是技术方向,液冷机柜带动电源架构升级。',
      companies: [
        { name: '麦格米特', code: '002851.SZ', region: '广东深圳', level: '相关' },
        { name: '欧陆通',   code: '300870.SZ', region: '广东深圳', level: '相关' },
        { name: '泰嘉股份', code: '002843.SZ', region: '湖南长沙', level: '相关' }
      ],
      indicators: [ CIND.idctz ] },
    c_wk: { name: '液冷温控', band: 'upstream', importance: '重要',
      intro: '液冷温控通过冷板式/浸没式方案解决高功率算力集群的散热瓶颈,PUE约束与单机柜功率提升推动液冷渗透率快速上行。',
      companies: [
        { name: '英维克',   code: '002837.SZ', region: '广东深圳', level: '代表' },
        { name: '高澜股份', code: '300499.SZ', region: '广东广州', level: '相关' },
        { name: '申菱环境', code: '301018.SZ', region: '广东佛山', level: '相关' }
      ],
      indicators: [ { name: '数据中心液冷市场规模:年度', freq: '年', source: '赛迪顾问', unit: '亿元', latest: '236', latestDate: '2025-12', series: ser(60, 20, 8, 10) } ] },
    c_fwq: { name: 'AI服务器', band: 'midstream', importance: '非常重要',
      intro: 'AI服务器是算力的整机载体,以GPU/加速卡为核心提供训练与推理算力,是数据中心资本开支的最大承载环节。',
      companies: [
        { name: '浪潮信息', code: '000977.SZ', region: '山东济南', level: '代表' },
        { name: '工业富联', code: '601138.SH', region: '广东深圳', level: '代表' },
        { name: '中科曙光', code: '603019.SH', region: '北京',     level: '代表' },
        { name: '紫光股份', code: '000938.SZ', region: '广东深圳', level: '相关' }
      ],
      indicators: [ CIND.fwqcl, CIND.idctz ] },
    c_jhj: { name: '交换机', band: 'midstream', importance: '重要',
      intro: '数据中心交换机构建算力集群的网络互联,高速率(400G/800G)交换机随AI组网需求升级,国产厂商加速导入。',
      companies: [
        { name: '紫光股份', code: '000938.SZ', region: '广东深圳', level: '代表' },
        { name: '锐捷网络', code: '301165.SZ', region: '福建福州', level: '代表' },
        { name: '菲菱科思', code: '301191.SZ', region: '广东深圳', level: '相关' }
      ],
      indicators: [ { name: '以太网交换机市场规模:季度', freq: '季', source: 'IDC', unit: '亿美元', latest: '18.6', latestDate: '2026-03', series: ser(12, 0.4, 1, 16) } ] },
    c_gtx: { name: '光通信设备', band: 'midstream', importance: '重要',
      intro: '光通信设备承担数据中心间(DCI)与骨干网的高速传输,相干光模块与光传输设备受益于算力枢纽间的互联需求。',
      companies: [
        { name: '中兴通讯', code: '000063.SZ', region: '广东深圳', level: '代表' },
        { name: '烽火通信', code: '600498.SH', region: '湖北武汉', level: '相关' }
      ],
      indicators: [ { name: '光通信设备市场规模:年度', freq: '年', source: 'Omdia', unit: '亿美元', latest: '156', latestDate: '2025-12', series: ser(120, 4, 5, 10) } ] },
    c_idc: { name: '数据中心IDC', band: 'midstream', importance: '非常重要',
      intro: 'IDC为算力提供机房、电力与网络基础设施,智算中心建设与"东数西算"推动一线及枢纽节点机柜需求持续增长。',
      companies: [
        { name: '光环新网', code: '300383.SZ', region: '北京',     level: '代表' },
        { name: '宝信软件', code: '600845.SH', region: '上海',     level: '代表' },
        { name: '润泽科技', code: '300442.SZ', region: '河北廊坊', level: '相关' },
        { name: '奥飞数据', code: '300738.SZ', region: '广东广州', level: '相关' }
      ],
      indicators: [ CIND.idctz ] },
    c_yjs: { name: '云计算', band: 'downstream', importance: '非常重要',
      intro: '云计算以IaaS/PaaS形式对外提供弹性算力,是算力最主要的商业化出口,AI推理需求驱动云厂商资本开支回升。',
      companies: [
        { name: '金山云',   code: '3896.HK',   region: '北京',     level: '相关' },
        { name: '优刻得',   code: '688158.SH', region: '上海',     level: '相关' },
        { name: '青云科技', code: '688316.SH', region: '北京',     level: '相关' }
      ],
      indicators: [ { name: '中国公有云市场规模:年度', freq: '年', source: '信通院', unit: '亿元', latest: '6,240', latestDate: '2025-12', series: ser(2600, 380, 120, 10) } ] },
    c_dmx: { name: 'AI大模型', band: 'downstream', importance: '非常重要',
      intro: '大模型是算力的核心需求侧,训练与推理消耗海量算力;模型能力迭代与应用落地直接牵引上游算力投资节奏。',
      companies: [
        { name: '科大讯飞', code: '002230.SZ', region: '安徽合肥', level: '代表' },
        { name: '昆仑万维', code: '300418.SZ', region: '北京',     level: '相关' },
        { name: '三六零',   code: '601360.SH', region: '北京',     level: '相关' }
      ],
      indicators: [ { name: '生成式AI市场规模:年度', freq: '年', source: 'IDC', unit: '亿美元', latest: '328', latestDate: '2025-12', series: ser(60, 32, 12, 10) } ] },
    c_zsx: { name: '智算中心', band: 'downstream', importance: '重要',
      intro: '智算中心面向AI训练与推理提供集约化算力服务,由地方政府与运营商主导建设,是算力普惠化的重要载体。',
      companies: [
        { name: '中科曙光', code: '603019.SH', region: '北京',     level: '代表' },
        { name: '并行科技', code: '839493.BJ', region: '北京',     level: '相关' }
      ],
      indicators: [ CIND.idctz ] },
    c_hlw: { name: '互联网应用', band: 'downstream', importance: '重要',
      intro: '互联网平台是算力的规模化应用方,搜索、推荐、内容生成等场景的AI化持续放大对推理算力的需求。',
      companies: [
        { name: '腾讯控股', code: '0700.HK', region: '广东深圳', level: '相关' },
        { name: '美团',     code: '3690.HK', region: '北京',     level: '相关' },
        { name: '金山办公', code: '688111.SH', region: '北京',   level: '相关' }
      ],
      indicators: [ { name: '移动互联网接入流量:累计值', freq: '月', source: '工信部', unit: '亿GB', latest: '1,682', latestDate: '2026-05', series: ser(1200, 22, 40) } ] }
  }
  const COMPUTE_BANDS = [
    { key: 'upstream', title: '上游供给侧', subtitle: '芯片与硬件基础设施', nodeCount: 186, companyCount: 528, indicatorCount: 172,
      nodes: [
        { id: 'c_gpu', name: 'AI芯片/GPU', companies: 96, indicators: 22 }, { id: 'c_hbm', name: '存储芯片/HBM', companies: 84, indicators: 20 },
        { id: 'c_gmk', name: '光模块', companies: 72, indicators: 16 }, { id: 'c_pcb', name: 'PCB印制电路板', companies: 68, indicators: 14 },
        { id: 'c_dy', name: '服务器电源', companies: 45, indicators: 10 }, { id: 'c_wk', name: '液冷温控', companies: 52, indicators: 12 }
      ] },
    { key: 'midstream', title: '中游核心环节', subtitle: '算力设备与数据中心', nodeCount: 108, companyCount: 342, indicatorCount: 116,
      nodes: [
        { id: 'c_fwq', name: 'AI服务器', companies: 118, indicators: 28 }, { id: 'c_jhj', name: '交换机', companies: 64, indicators: 16 },
        { id: 'c_gtx', name: '光通信设备', companies: 58, indicators: 14 }, { id: 'c_idc', name: '数据中心IDC', companies: 92, indicators: 24 }
      ] },
    { key: 'downstream', title: '下游需求侧', subtitle: '算力应用与服务', nodeCount: 142, companyCount: 307, indicatorCount: 89,
      nodes: [
        { id: 'c_yjs', name: '云计算', companies: 86, indicators: 20 }, { id: 'c_dmx', name: 'AI大模型', companies: 74, indicators: 16 },
        { id: 'c_zsx', name: '智算中心', companies: 58, indicators: 14 }, { id: 'c_hlw', name: '互联网应用', companies: 96, indicators: 18 }
      ] }
  ]

  // 节点级结构关系:EDGES 为上游→下游,CONTAINS 为父级→子级。
  // 机器人关系沿用原型早期业务梳理并收窄到可解释节点;算力关系按硬件→设备/IDC→应用结构整理。
  const ROBOT_EDGES = [
    ['jsq', 'gyjqr'], ['jsq', 'xzjqr'], ['jsq', 'rxjqr'],
    ['cgq', 'gyjqr'], ['cgq', 'xzjqr'], ['cgq', 'fwjqr'], ['cgq', 'psjqr'], ['cgq', 'rxjqr'],
    ['sfdj', 'gyjqr'], ['sfdj', 'xzjqr'], ['sfdj', 'rxjqr'],
    ['kzq', 'gyjqr'], ['kzq', 'xzjqr'], ['kzq', 'psjqr'], ['kzq', 'agv'],
    ['sg', 'gyjqr'], ['sg', 'rxjqr'], ['jqsj', 'gyjqr'], ['jqsj', 'xzjqr'], ['jqsj', 'tzjqr'],
    ['mdzxq', 'xzjqr'], ['mdzxq', 'rxjqr'], ['zc', 'gyjqr'], ['zc', 'rxjqr'],
    ['gyjqr', 'qczz'], ['gyjqr', 'dzzz'], ['gyjqr', 'zxjx'], ['gyjqr', 'ccwl'],
    ['xzjqr', 'zxjx'], ['xzjqr', 'syqj'], ['xzjqr', 'zhyl'], ['xzjqr', 'ccwl'], ['xzjqr', 'dzzz'], ['xzjqr', 'ylkf'],
    ['rxjqr', 'ccwl'], ['rxjqr', 'qczz'], ['fwjqr', 'syqj'], ['fwjqr', 'zhyl'], ['fwjqr', 'ylkf'],
    ['psjqr', 'zhyl'], ['psjqr', 'ccwl'], ['tzjqr', 'zxjx'], ['agv', 'ccwl'], ['agv', 'qczz'],
    ['xtjc', 'qczz'], ['xtjc', 'dzzz'], ['xtjc', 'zxjx']
  ]
  const ROBOT_CONTAINS = [
    ['gyjqr', 'xzjqr'],
    ['fwjqr', 'psjqr']
  ]
  const COMPUTE_EDGES = [
    ['c_gpu', 'c_fwq'], ['c_gpu', 'c_idc'], ['c_hbm', 'c_fwq'],
    ['c_gmk', 'c_jhj'], ['c_gmk', 'c_gtx'], ['c_gmk', 'c_idc'],
    ['c_pcb', 'c_fwq'], ['c_pcb', 'c_jhj'], ['c_dy', 'c_fwq'], ['c_dy', 'c_idc'],
    ['c_wk', 'c_fwq'], ['c_wk', 'c_idc'],
    ['c_fwq', 'c_dmx'], ['c_fwq', 'c_zsx'], ['c_jhj', 'c_yjs'], ['c_jhj', 'c_zsx'],
    ['c_gtx', 'c_yjs'], ['c_gtx', 'c_hlw'],
    ['c_idc', 'c_yjs'], ['c_idc', 'c_dmx'], ['c_idc', 'c_zsx'], ['c_idc', 'c_hlw']
  ]
  const COMPUTE_CONTAINS = [
    ['c_idc', 'c_zsx']
  ]

  // ============================================================
  //  按链取数(currentChainKey 决定;非 live 链回退机器人,仅用于原型展示)
  // ============================================================
  const SOURCE_ROBOT = window.buildRobotChainFromSource?.(window.ROBOT_SOURCE_DATA)
  if (!SOURCE_ROBOT) throw new Error('机器人产业链源数据未加载:请先运行 build-robot-source.mjs')
  const robotMeta = chains.find(chain => chain.key === 'robot')
  Object.assign(robotMeta, { nodeCount: SOURCE_ROBOT.counts.nodes, companyCount: SOURCE_ROBOT.counts.uniqueCompanies, indicatorCount: SOURCE_ROBOT.counts.uniqueIndicators })
  const CHAINS = {
    robot: SOURCE_ROBOT,
    compute: { intro: '算力产业链:上游芯片与硬件基础设施 → 中游算力设备与数据中心 → 下游算力应用与服务。', bands: COMPUTE_BANDS, NODE: COMPUTE_NODE, edges: COMPUTE_EDGES, contains: COMPUTE_CONTAINS }
  }
  const cur = () => CHAINS[state.currentChainKey] || CHAINS.robot
  const state = { currentChainKey: 'robot' }

  function nodeBrief(id) {
    const d = cur().NODE[id]
    if (!d) return null
    return {
      id,
      name: d.name,
      band: d.band,
      stage: d.stage || d.band,
      lane: d.lane || '',
      important: !!d.important,
      companies: d.companies?.length || 0,
      indicators: d.indicators?.length || 0
    }
  }

  function nodeDetail(id) {
    const chain = cur()
    const NODE = chain.NODE
    const fallbackId = Object.keys(NODE)[0]
    const key = NODE[id] ? id : fallbackId
    const d = NODE[key]
    const brief = nodeBrief(key) || { companies: 0, indicators: 0 }
    const edges = chain.edges || []
    const contains = chain.contains || []
    const parents = contains.filter(pair => pair[1] === key).map(pair => pair[0])
    const children = contains.filter(pair => pair[0] === key).map(pair => pair[1])
    const hasSourceHierarchy = Object.hasOwn(d, 'parentId') || Object.hasOwn(d, 'lane')
    const siblings = hasSourceHierarchy
      ? Object.entries(NODE).filter(([nid, node]) => nid !== key && node.parentId === d.parentId && node.lane === d.lane).map(([nid]) => nid)
      : (chain.bands.find(b => b.key === d.band)?.nodes || []).filter(n => n.id !== key).map(n => n.id)
    const ups = edges.filter(pair => pair[1] === key).map(pair => pair[0])
    const downs = edges.filter(pair => pair[0] === key).map(pair => pair[1])
    const stage = d.stage || d.band
    const stageLabel = chain.bands.find(b => b.key === stage)?.title || d.region || bandLabelOf[d.band]
    return {
      id: key, name: d.name, band: d.band, stage, stageLabel, region: d.region || bandLabelOf[d.band],
      lane: d.lane || '', depth: d.depth || 1, parentName: d.parent || null, important: !!d.important,
      bandLabel: d.region || bandLabelOf[d.band], importance: d.importance,
      intro: d.intro, alsoIn: d.alsoIn || [], adjNote: chain.adjNote || ADJ_NOTE,
      stats: { companies: brief.companies, indicators: brief.indicators, siblings: siblings.length, parents: parents.length, children: children.length },
      ups, downs, parents, children, siblings,
      companies: d.companies || [],
      moreCompanies: Math.max(brief.companies - (d.companies || []).length, 0),
      indicators: d.indicators || []
    }
  }

  // —— 指标 tab:完整展示当前链所有有指标的节点 ——
  function indicatorGroups() {
    return Object.entries(cur().NODE)
      .filter(([, d]) => d.indicators?.length)
      .sort(([, a], [, z]) => (z.important === true) - (a.important === true) || a.name.localeCompare(z.name, 'zh-CN'))
      .map(([nodeId, d]) => ({ node: d.name, nodeId, items: d.indicators }))
  }

  // —— 公司浏览:从当前链所有节点公司去重汇总,统计覆盖环节数 ——
  function companyBrowse() {
    const map = new Map()
    Object.entries(cur().NODE).forEach(([nid, d]) => (d.companies || []).forEach(c => {
      const k = c.code || c.name
      if (!map.has(k)) map.set(k, { name: c.name, code: c.code, role: c.role || '角色未标注', level: c.level, nodes: 0, best: 0 })
      const rec = map.get(k); rec.nodes++
      const lv = ({ '核心': 4, '非常重要': 4, '重要': 3, '代表': 3, '相关': 2 })[c.level] || 1
      if (lv > rec.best) { rec.best = lv; rec.level = c.level; rec.role = c.role || rec.role }
    }))
    return [...map.values()].sort((a, z) => z.nodes - a.nodes || z.best - a.best || a.name.localeCompare(z.name, 'zh-CN'))
  }
  // —— 股票反查:在所有 live 链里找该公司命中的环节(真实检索) ——
  function lookupStock(kw) {
    const q = (kw || '').trim().toLowerCase()
    if (!q) return null
    let company = null
    const byChain = {}
    for (const [ckey, cdata] of Object.entries(CHAINS)) {
      const title = chains.find(c => c.key === ckey)?.title || ckey
      Object.entries(cdata.NODE).forEach(([nid, d]) => (d.companies || []).forEach(c => {
        const nameHit = c.name.toLowerCase().includes(q)
        const codeHit = (c.code || '').toLowerCase().includes(q)
        if (!nameHit && !codeHit) return
        if (!company) company = { name: c.name, code: c.code, role: c.role || '角色未标注' }
        if (c.name !== company.name) return // 同名精确锁定第一家
        ;(byChain[ckey] = byChain[ckey] || { chain: title, chainKey: ckey, nodes: [] }).nodes.push({ id: nid, name: d.name, band: d.band, stage: d.stage || d.band, lane: d.lane || '', level: c.level, role: c.role || '角色未标注' })
      }))
    }
    const hits = Object.values(byChain)
    if (!company) return { notFound: true, query: kw }
    return { query: kw, company, hits, chainCount: hits.length, nodeCount: hits.reduce((s, h) => s + h.nodes.length, 0) }
  }

  // —— 全局搜索:在所有 live 链的 链/节点/公司/指标 上做关键词过滤(真实检索) ——
  function runSearch(kw) {
    const q = (kw || '').trim().toLowerCase()
    if (!q) return null
    const g = { 产业: [], 节点: [], 公司: [], 指标: [] }
    chains.filter(c => c.live).forEach(c => { if (c.title.toLowerCase().includes(q)) g.产业.push({ t: c.title, s: '产业链 · 可直接查看', key: c.key }) })
    const seenCo = new Set(), seenInd = new Set()
    for (const [ckey, cdata] of Object.entries(CHAINS)) {
      const title = chains.find(c => c.key === ckey)?.title || ckey
      Object.entries(cdata.NODE).forEach(([nid, d]) => {
        if (d.name.toLowerCase().includes(q)) g.节点.push({ t: d.name, s: `${title} 产业链`, chainKey: ckey, id: nid })
        ;(d.companies || []).forEach(c => {
          if ((c.name.toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q)) && !seenCo.has(c.code || c.name)) {
            seenCo.add(c.code || c.name); g.公司.push({ t: c.name, s: `${c.code || '未上市'} · ${d.name} · ${title}`, chainKey: ckey })
          }
        })
        ;(d.indicators || []).forEach(ind => {
          if (ind.name.toLowerCase().includes(q) && !seenInd.has(ind.name)) {
            seenInd.add(ind.name); g.指标.push({ t: ind.name, s: `指标 · ${d.name} · ${title}`, chainKey: ckey })
          }
        })
      })
    }
    const groups = ['产业', '节点', '公司', '指标'].map(type => ({ type, items: g[type].slice(0, 8) })).filter(x => x.items.length)
    const total = groups.reduce((s, x) => s + x.items.length, 0)
    return { query: kw, groups, total }
  }

  // —— 图谱内定位:只搜索当前链全部节点,包含未出现在总览 bands 的分类子节点 ——
  function findNodes(kw, limit = 12) {
    const q = (kw || '').trim().toLowerCase()
    if (!q) return []
    return Object.entries(cur().NODE)
      .filter(([, d]) => d.name.toLowerCase().includes(q))
      .sort(([, a], [, z]) => (z.name.toLowerCase() === q) - (a.name.toLowerCase() === q) || (z.important === true) - (a.important === true) || a.name.length - z.name.length)
      .slice(0, limit)
      .map(([id, d]) => ({ id, name: d.name, band: d.band, stage: d.stage || d.band, lane: d.lane || '', depth: d.depth || 1, parentName: d.parent || null }))
  }
  // —— 平台首页(数量一律由列表现算,不在此硬编码,防口径漂移) ——
  const platform = { brand: '飞研产业研究平台', slogan: '覆盖产业上下游图谱、核心公司与关键指标等维度,支持快速开展产业链研究' }
  const chainCatalog = [
    { key: 'robot',        title: '机器人',   desc: '聚焦机器人产业链全景与核心环节', live: true },
    { key: 'aerospace',    title: '航空航天', desc: '覆盖航空航天全产业链与关键企业', live: false },
    { key: 'gold',         title: '黄金',     desc: '贵金属产业链,供需与价格跟踪',   live: false },
    { key: 'compute',      title: '算力',     desc: '算力基础设施与产业链全景',       live: true },
    { key: 'storage_chip', title: '存储芯片', desc: '存储产业链与关键技术环节',       live: false },
    { key: 'silver',       title: '白银',     desc: '白银产业链,工业需求与价格',      live: false }
  ]
  const themes = [
    { key: 'plan155', name: '十五五规划产业链', sub: '国家战略新兴产业与未来产业', items: [
      { name: '机器人', key: 'robot', live: true }, { name: '航空航天', key: 'aerospace', live: false },
      { name: '具身智能', tag: '未来产业' }, { name: '新一代信息技术', tag: '战略新兴产业' },
      { name: '低空经济', tag: '战略新兴产业' }, { name: '量子科技', tag: '未来产业' } ] },
    { key: 'futures', name: '期货产业链', sub: '大宗商品与衍生品关联产业', items: [
      { name: '黄金', key: 'gold', live: false }, { name: '白银', key: 'silver', live: false },
      { name: '原油' }, { name: '铜' }, { name: '生猪' }, { name: '铁矿石' } ] },
    { key: 'hot', name: '热门产业链', sub: '近期市场关注度较高的方向', items: [
      { name: '算力', key: 'compute', live: true }, { name: '存储芯片', key: 'storage_chip', live: false },
      { name: '人工智能' }, { name: '低空经济' }, { name: '固态电池' }, { name: '创新药' } ] }
  ]

  // —— 按名称在当前链找指标(详情页/搜索深链到指标详情用) ——
  function findIndicator(name) {
    const NODE = cur().NODE
    for (const d of Object.values(NODE)) {
      const hit = (d.indicators || []).find(ind => ind.name === name)
      if (hit) return hit
    }
    return null
  }

  // —— 共享某指标的所有环节(指标详情「相关环节」用) ——
  function nodesByIndicator(name) {
    const NODE = cur().NODE
    const out = []
    Object.entries(NODE).forEach(([nid, d]) => {
      if ((d.indicators || []).some(ind => ind.name === name)) out.push({ id: nid, name: d.name, band: d.band })
    })
    return out
  }

  // 对外接口:bands/chainIntro/indicatorGroups/companyBrowse 随 currentChainKey 变化 → 用 getter
  const M = {
    COMPLIANCE, meta, chains, platform, chainCatalog, themes,
    nodeDetail, nodeBrief, lookupStock, runSearch, findNodes, findIndicator, nodesByIndicator,
    get currentChainKey() { return state.currentChainKey },
    set currentChainKey(v) { state.currentChainKey = v },
    get chainIntro() { return cur().intro },
    get bands() { return cur().bands },
    get indicatorGroups() { return indicatorGroups() },
    get companyBrowse() { return companyBrowse() },
    get chainTitle() { return chains.find(c => c.key === state.currentChainKey)?.title || '' },
    get adjNote() { return cur().adjNote || ADJ_NOTE },
    get sourceInfo() { return cur().sourceInfo || null },
    get sourceCounts() { return cur().counts || null },
    get allNodeCount() { return Object.keys(cur().NODE).length },
    get relationCounts() { return { edges: (cur().edges || []).length, contains: (cur().contains || []).length } }
  }
  return M
})()
