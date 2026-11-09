// 每次进入页面从老博客的短句中选择一条，换行保持原有排版
export const heroTitles = [
  '热爱……',
  '敬畏之心！',
  '赞美之心！',
  '我很好奇！',
  '你好，请多指教',
  '*舒缓的现代音乐*',
  '希望能成为有趣的人',
  '相信美好的事情即将发生',
  '平凡的日常正奇迹的发生着',
  '你所热爱的\n就是你的生活',
  '给时光以生命\n给岁月以文明',
  '路虽远行则将至\n事虽难做则必成',
  '一望无际的迷雾中\n有人在寻找光明',
  '当你在凝视着网页的时候\n网页也正在凝视着你',
]

// 每个项目统一使用 3 个标签，顺序为：形态/领域 → 核心功能 → 技术/主题。
// 分类和组内项目均按数组顺序展示，新增项目直接放入对应的 projects 数组。
export const categories = [
  {
    id: 'life',
    label: '生活应用',
    projects: [
      {
        name: 'Gallery Lens · E站替代客户端',
        description: '更便捷的图库搜索与浏览体验',
        url: 'https://e-gallery.bugstack.top/',
        icon: 'GL',
        tags: [
          '第三方客户端',
          '图片浏览',
          '图库检索',
        ],
      },
      {
        name: 'TrackFit · 形轨',
        description: '记录身体变化，看见习惯的影响',
        url: 'https://fit.bugstack.top/',
        icon: 'TF',
        tags: [
          '健康管理',
          '身体记录',
          '习惯追踪',
        ],
      },
      {
        name: 'Pixiv 每日排行榜 Top50',
        description: '轮播每日人气插画，遇见新的灵感',
        url: 'https://pixiv.bugstack.top/',
        icon: 'PV',
        tags: [
          '插画艺术',
          '图片浏览',
          '排行榜',
        ],
      },
      {
        name: 'RepoTime · 代码时光机',
        description: '朝花夕拾，回放你的开发旅程',
        url: 'https://repo.bugstack.top/',
        icon: 'RT',
        tags: [
          '开发工具',
          '代码回顾',
          '数据可视化',
        ],
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI 应用',
    projects: [
      {
        name: 'Agent 智能体工作台',
        description: '一站式构建、编排与调试你的智能体',
        url: 'https://agent.bugstack.top',
        icon: 'AW',
        tags: [
          '智能体',
          '可视化编排',
          '调试验证',
        ],
      },
      {
        name: 'MLOps 模型研发运营平台',
        description: '模型研发，从这里开始',
        url: 'https://forge.bugstack.top/',
        icon: 'AX',
        tags: [
          'MLOps',
          '模型训练',
          '推理服务',
        ],
      },
      {
        name: '仿GPT风格 Agent 原型演示',
        description: 'AI 应用功能演示，需部署后使用',
        url: 'https://chat.bugstack.top/',
        icon: 'AI',
        tags: [
          '智能体',
          'AI 对话',
          '原型演示',
        ],
      },
      {
        name: 'Agent 运行可视化技术验证',
        description: '配置智能体，编排工作流',
        url: 'https://github.com/01Petard/ai-agent-station-web/',
        icon: 'AG',
        tags: [
          '智能体',
          '工作流',
          '运行可视化',
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: '实用工具',
    projects: [
      {
        name: 'StatureAtlas · 身高体重对照表',
        description: '对照身高体重与BMI，识别身材状况',
        url: 'https://atlas.bugstack.top/',
        icon: 'SA',
        tags: [
          '健康工具',
          'BMI 计算',
          '数据可视化',
        ],
      },
      {
        name: '北京理工大学访客预约系统',
        description: '简化校园访客的预约操作',
        url: 'https://bit.bugstack.top/',
        icon: 'BT',
        tags: [
          '校园服务',
          '访客预约',
          '便民工具',
        ],
      },
      {
        name: 'What Is Your IPv4',
        description: '查看当前网络的公网 IPv4 出口',
        url: 'https://ip.bugstack.top/',
        icon: 'IP',
        tags: [
          '网络工具',
          'IP 查询',
          '开发辅助',
        ],
      },
      {
        name: '离下班还有多久',
        description: '忙里偷闲，看一眼下班倒计时',
        url: 'https://shutdown.bugstack.top/',
        icon: 'OFF',
        tags: [
          '时间工具',
          '倒计时',
          '职场生活',
        ],
      },
    ],
  },
  {
    id: 'visual',
    label: '创意实验',
    projects: [
      {
        name: '哈基米加密解密工具',
        description: '把文字变成有趣的曼波语言',
        url: 'https://hajimi.bugstack.top/',
        icon: 'HM',
        tags: [
          '趣味工具',
          '文本加密',
          '曼波语言',
        ],
      },
      {
        name: '粒子土星',
        description: '用粒子探索土星与星环的视觉效果',
        url: 'https://saturn.bugstack.top/',
        icon: 'ST',
        tags: [
          '粒子特效',
          '天文主题',
          '交互动效',
        ],
      },
      {
        name: '手势捕捉',
        description: '实时识别与捕捉手部动作轨迹',
        url: 'https://hand.bugstack.top/',
        icon: 'HD',
        tags: [
          '计算机视觉',
          '手势识别',
          '实时交互',
        ],
      },
      {
        name: '像素变形生成器',
        description: '一键生成创意像素形变图',
        url: 'https://pixel.bugstack.top/',
        icon: 'PX',
        tags: [
          '图像生成',
          '像素艺术',
          '创意设计',
        ],
      },
    ],
  },
  {
    id: 'browser',
    label: '浏览器扩展',
    projects: [
      {
        name: 'FocusMask',
        description: '专注浏览的网页媒体信息屏蔽插件',
        url: 'https://github.com/01Petard/FocusMask/',
        icon: 'FM',
        tags: [
          '内容屏蔽',
          '专注模式',
          '隐私保护',
        ],
      },
      {
        name: 'Autofill',
        description: '基于大语言模型的智能表单填充扩展',
        url: 'https://github.com/01Petard/Autofill/',
        icon: 'AF',
        tags: [
          '大语言模型',
          '表单填充',
          '办公效率',
        ],
      },
      {
        name: '复古终端风格起始页',
        description: '一个专注效率的终端风格仪表盘',
        url: 'https://start.bugstack.top/',
        icon: 'TM',
        tags: [
          '起始页',
          '终端风格',
          '个性化',
        ],
      },
      {
        name: 'Pintree 收藏夹',
        description: '整理链接灵感的配置型个人收藏夹',
        url: 'https://fav.bugstack.top/',
        icon: 'PT',
        tags: [
          '书签工具',
          '链接收藏',
          '个人导航',
        ],
      },
    ],
  },
]

// 博客入口按数组顺序展示，新增博客直接追加。
export const blogs = [
  {
    title: '代码港湾',
    description: '个人知识库，学习与随笔',
    link: 'https://01petard.github.io/blog-vue-vitepress/',
    action: '迎接未来',
    icon: 'i-lucide-book-open',
    color: 'blue'
  },
  {
    title: '花火の红玉宫',
    description: '旧时博客与过往记录',
    link: 'https://01petard.github.io/',
    action: '回到过去',
    icon: 'i-lucide-notebook-pen',
    color: 'pink'
  },
]

// 社交与联系方式按数组顺序展示，image 优先于 icon。
export const socialLinks = [
  {
    title: 'GitHub',
    description: '开源代码与项目',
    link: 'https://github.com/01Petard/',
    image: '/v3/scenery/github.svg',
    color: 'github'
  },
  {
    title: 'Bilibili',
    description: '视频与日常',
    link: 'https://space.bilibili.com/12764212/',
    image: '/v3/scenery/bilibili.svg',
    color: 'bilibili'
  },
  {
    title: '留言板',
    description: '交流想法与灵感',
    link: 'https://doc.bugstack.top/about.html',
    icon: 'i-lucide-mail',
    color: 'message'
  },
]
