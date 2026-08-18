# Star-Trail 个人起始页

> 热爱可抵岁月漫长 · 你的名字（君の名は）风格的星空主页

一个以「星轨 · 黄昏 · 重逢」为主题的纯前端个人主页（起始页），集成了 Canvas 星轨动画、彗星粒子特效、渐变黄昏氛围与迷你音乐播放器，展示个人简介、项目、博客与社交链接。

在线预览：<https://www.bugstack.top/>

## ✨ 功能特性

- 🌌 **星空背景动画** — 静态星轨、动态流星与彗星尾迹、粒子喷射、极光丝缕，全部基于 Canvas 手写实现
- 🌠 **彗星效果开关** — 通过配置文件一键启用/禁用星空、彗星加载项
- 🌆 **黄昏渐变氛围** — 滚动时背景随视差缓动，叠加多层径向渐变「黄昏雾霭」
- 🎵 **迷你音乐播放器** — 悬浮玻璃拟态播放器，支持播放/暂停、进度拖动、音量调节；滚动时自动隐藏，并处理浏览器自动播放策略
- 🕹️ **随机语录大标题** — 每次刷新随机展示一句文案
- 📦 **作品展示** — 项目卡片、博客链接、社交入口，均可在配置中维护
- 🌇 **「黄昏相遇」页脚** — 《你的名字》风格重逢场景，进入视口时渐显，带轻微浮动动画
- ♿ **可访问性** — 尊重 `prefers-reduced-motion`，移动端与桌面端响应式适配
- 📊 **站点统计** — 集成 51.la 访问统计

## 🛠️ 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | [Vue 3](https://vuejs.org/) |
| 构建 | [Vite](https://vitejs.dev/) |
| 样式 | [UnoCSS](https://unocss.dev/)（预设：Uno / Mini / Icons / Attributify / Typography） |
| 图标 | [Iconify](https://iconify.design/)（ant-design 图标集）+ unplugin-vue-components 自动按需引入 |
| 代码规范 | ESLint（[@antfu/eslint-config](https://github.com/antfu/eslint-config)）+ Husky + lint-staged |
| 包管理 | [pnpm](https://pnpm.io/)（≥ 11.5.2，Node ≥ 24.11.0） |

运行时仅依赖 `vue`，无 UI 组件库负担。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生产构建
pnpm build

# 本地预览构建产物
pnpm preview

# 代码检查
pnpm lint          # 检查
pnpm lint:fix      # 检查并自动修复
```

> 环境要求：Node.js ≥ 24.11.0，pnpm ≥ 11.5.2（仓库内已提供 `.nvmrc`）。

## 📁 项目结构

```
├── index.html                  # HTML 入口（含站点统计脚本）
├── vite.config.js              # Vite + UnoCSS + 组件自动引入配置
├── uno.config.js               # UnoCSS 预设、自定义规则与快捷类
├── netlify.toml                # Netlify 部署配置
├── public/
│   ├── CNAME                   # GitHub Pages 自定义域名
│   ├── mengdenglong.mp3        # 背景音乐（《梦灯笼》）
│   └── yourname.avif           # 页脚《你的名字》重逢场景图
└── src/
    ├── main.js                 # 应用入口
    ├── App.vue                 # 主页面（导航/简介/项目/博客/页脚）
    ├── config.js               # 站点配置（彗星开关等）
    ├── assets/css/main.css     # 全局样式
    └── components/
        ├── StarTrails.vue      # 星轨/彗星 Canvas 背景组件
        └── MiniPlayer.vue      # 迷你音乐播放器组件
```

## ⚙️ 配置说明

**`src/config.js`** — 全局站点配置（只读）：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `effects.comet` | `false` | 是否启用彗星（动态星 + 流星）特效，关闭后仅保留静态星轨 |

**`src/App.vue`** 中 `data` 对象集中维护了页面内容：

- `titleList` — 首页随机语录
- `navLinks` / `myProjects` / `myBlogs` / `socialLinks` — 导航、项目、博客与社交链接
- `avatar` — 头像图片地址

## 🌐 部署

- **GitHub Pages**：`public/CNAME` 已配置自定义域名 `star.codebox.icu`，推送至 `main` 分支即可触发 Pages 部署。
- **Netlify**：`netlify.toml` 已配置构建命令（`pnpm run build`）与 SPA 重定向规则。

## 🙏 参考与致谢

- 页面设计参考 [哞菇 / Nekotora - fLaG.Moe](https://flag.moe/)
- 背景音乐《夢燈籠》- RADWIMPS（你的名字 OST）
- 页脚插画取自《你的名字》黄昏重逢场景

---

© 2025 小黄同学 · [浙ICP备2024084383号](https://beian.miit.gov.cn/)
