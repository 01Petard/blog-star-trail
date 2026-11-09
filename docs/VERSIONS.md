# 多版本共存：目录结构与文件对应关系

> 目标：把 1.0、2.0 的界面并入当前 3.0，用户可随时切换查看历史版本，且三版代码互不冲突、互不影响。
> 切换交互：**左上角一个按钮，点击循环切到下一个版本**（v1 → v2 → v3 → v1）；鼠标移开 3 秒后自动淡出，移回左上角即可唤出。
> 根路径 `/` 只做一件事：**跳到最新版本**（当前 `/v3/`）。

## 1. 设计原则

| 原则 | 落地方式 |
| --- | --- |
| 一个版本 = 一个目录 = 一个独立 HTML document | `v1/`、`v2/`、`v3/` 各自含入口 HTML、全部源码与静态资源 |
| 目录彻底自包含 | 入口 `vN/index.html`、源码 `vN/main.js` 等、资源 `vN/img|audio|assets`，一个版本所需的一切都在一个目录里 |
| 静态资源按类型分目录 | `vN/img`（图片）、`vN/audio`（音乐）、`vN/assets`（字体许可等），不再有集中的 `public/vN` |
| 编译期禁止跨版本误引 | 只保留 `@v1` / `@v2` / `@v3` / `@shared` 四个别名，**删除通用 `@`** |
| 历史代码最小侵入 | 1.0 / 2.0 仅改 import 别名与资源路径前缀；业务数据、模板、样式逻辑逐字未动 |
| 共享代码收敛到一处 | `shared/` 是唯一跨版本目录，且不 import 任何 `v1/v2/v3` 代码 |
| 最新版本单点定义 | `shared/versions.js` 的 `VERSIONS` 最后一项即「最新版本」，根跳转页目标由构建期注入 |

### 为什么这样就能「互不影响」

三份代码原本都存在 `id="background"`、`id="trails"`、全局 `window.scroll` / `resize` 监听、`document.getElementById` 调用，且 `main.css` 都是全局 `* / html / body / button` 规则。若塞进同一个 SPA 同时挂载，这些全局副作用必然互相抢占（1.0 的 scroll 监听甚至没有卸载）。

改为三个独立 HTML 入口后，**同一时刻浏览器只存在一个版本的 document 和 JS 运行时**。冲突面从「运行时共存」降级为「构建期共存」，构建期只共享 Vue runtime 和一份 UnoCSS 原子类 CSS（原子类语义一致，不会互相覆盖）。

### 根路径为什么是跳转页

静态托管访问 `/` 时只认根目录 `index.html`。根 `index.html` 不承载任何版本，只用 `<meta http-equiv="refresh">` + `location.replace()` 跳到最新版本，保证：

- 域名根地址永远打开最新版本，不需要部署平台重定向；
- 版本升级（把新版本放到 `VERSIONS` 数组末尾）后，根跳转自动跟随；
- 三个版本各有稳定可分享的 URL：`/v1/`、`/v2/`、`/v3/`。

跳转目标由 `vite.config.js` 读取 `shared/versions.js` 的 `VERSIONS` 最后一项，构建期替换 `index.html` 里的 `__LATEST_VERSION__` 占位符。

## 2. 最终目录结构

```text
blog-star-trail/
├── index.html                       # [跳转页] URL / → 最新版本（当前 /v3/）
│
├── v1/                              # [1.0] URL /v1/，完全自包含
│   ├── index.html                   #   入口，引入 /v1/main.js
│   ├── main.js
│   ├── App.vue
│   ├── assets/css/main.css          #   源码样式（构建后进入 dist/assets）
│   ├── components/{MiniPlayer,StarTrails}.vue
│   ├── img/                         #   star.svg、vite.svg、vite_2.svg
│   └── audio/                       #   mengdenglong.mp3
│
├── v2/                              # [2.0] URL /v2/
│   ├── index.html
│   ├── main.js
│   ├── App.vue
│   ├── config.js
│   ├── assets/css/main.css
│   ├── components/{MiniPlayer,StarTrails}.vue
│   ├── img/                         #   star.svg、yourname.avif、vite.svg、vite_2.svg
│   └── audio/                       #   mengdenglong.mp3
│
├── v3/                              # [3.0] URL /v3/
│   ├── index.html
│   ├── main.js
│   ├── App.vue
│   ├── config.js
│   ├── data.js
│   ├── effects/sky.js
│   ├── assets/
│   │   ├── css/main.css             #   源码样式
│   │   └── MaShanZheng-OFL.txt      #   字体许可（静态文件）
│   ├── components/{MiniPlayer,ProjectCard,StarTrails}.vue
│   ├── img/                         #   star.svg、star-decor.svg、dusk.webp、sky.webp、
│   │                                #   sky-reference.webp、music_cover.jpg、quote-*.svg、
│   │                                #   github.svg、bilibili.svg、speckles.svg
│   └── audio/                       #   mengdenglong.mp3
│
├── shared/                          # ★ 唯一跨版本共享层（不依赖任何 vX）
│   ├── versions.js                  #   版本清单 / 当前判定 / 循环切换
│   ├── switcher.js                  #   单按钮切换器（原生 JS）
│   ├── switcher.css                 #   切换器样式（st- 前缀，作用域限定）
│   └── uno.js                       #   UnoCSS 唯一 import 入口
│
├── .github/workflows/deploy.yml     # 唯一部署通道：构建 dist 并发布到 GitHub Pages
│
├── vite.config.js                   # 4 个 HTML 入口 + 4 个别名 + 2 个构建插件
├── uno.config.js                    # 扫描 v1|v2|v3 全量与根跳转页
├── jsconfig.json                    # paths 同步为版本别名
├── components.d.ts                  # 无全局组件声明，避免同名组件混淆
├── eslint.config.js                 # 忽略 v1/v2 历史快照
├── README.md
└── docs/VERSIONS.md
```

原 `versions/` 中间层已取消，源码目录直接位于根；原 `public/vN/` 的静态资源已并入对应 `vN/` 目录。

## 3. 构建期如何把 `vN/` 里的资源送进产物

静态资源不再位于 `public/`，Vite 的 `publicDir` 不会自动带它们。这里用三条规则保证产物正确：

| 场景 | 机制 |
| --- | --- |
| 入口 HTML 的 favicon（`/vN/img/star.svg`） | 加 `vite-ignore` 属性，Vite 不打包、原样保留 |
| Vue 模板里的静态 `<img src="/vN/img/...">` | `vue({ template: { transformAssetUrls: false } })`，保留绝对路径 |
| 运行时字符串（BGM、封面、社交图标） | 本就不参与打包，由 `copyVersionStatic()` 插件在 `closeBundle` 复制到 `dist/vN/` |
| CSS 的 `url('/vN/img/...')` | **例外**：Vite/lightningcss 会把它们打包成 `dist/assets/<name>-<hash>.webp`（`@vite-ignore` 在 CSS url 中会让 lightningcss 报 `BadUrl`）。功能正常，代价是这几张背景图在产物里存两份 |

`copyVersionStatic()` 复制 `vN/img`、`vN/audio` 整目录，以及 `vN/assets` 的顶层文件；`vN/assets/css` 属于源码，跳过（已由 JS 打包）。

## 4. 版本 ↔ 入口 ↔ 源码 ↔ 产物对应表

| 版本 | 来源 | 访问 URL | 入口 HTML | 源码目录 | 构建产物 |
| --- | --- | --- | --- | --- | --- |
| 跳转页 | 本次新增 | `/` | `index.html` | — | `dist/index.html` |
| 1.0 线性星轨 | 分支 `bak/v1_linear_star`（tag `1.0`、`1.0-remake`） | `/v1/` | `v1/index.html` | `v1/` | `dist/v1/index.html` + `v1-*.js/css` + `dist/v1/img|audio/` |
| 2.0 彩色星轨 | 分支 `bak/v2_colorful_star`（tag `2.0`、`2.0-remake`） | `/v2/` | `v2/index.html` | `v2/` | `dist/v2/index.html` + `v2-*.js/css` + `dist/v2/img|audio/` |
| 3.0 星轨之下 | 分支 `main` 的 `src/` | `/v3/` | `v3/index.html` | `v3/` | `dist/v3/index.html` + `v3-*.js/css` + `dist/v3/img|audio|assets/` |
| 共享层 | 本次新增 | — | 三个版本各自 import | `shared/` | `uno-*.js/css`（Vue runtime / 原子类 / 切换器） |

> 归档分支：`bak/v1_linear_star`（`0dddb4c`）、`bak/v2_colorful_star`（`4e1a7b3`）为 1.0 / 2.0 原分支改名；`bak/v3_under_star`（`bef19db`）是合并多版本改造**之前**的 3.0 快照。三者均已推送到远程，远程旧名已删除。

## 5. 逐文件来源与变更范围

### 5.1 1.0（来源 `bak/v1_linear_star`）

| 原路径 | 新路径 | 变更内容 | 是否动业务逻辑 |
| --- | --- | --- | --- |
| `src/main.js` | `v1/main.js` | `@/` → `@v1/`；`virtual:uno.css` → `@shared/uno.js`；新增 `import '@shared/switcher.js'` | 否 |
| `src/App.vue` | `v1/App.vue` | 1 处 `@/components/MiniPlayer.vue` → `@v1/...`；BGM → `/v1/audio/mengdenglong.mp3` | 否 |
| `src/assets/css/main.css` | `v1/assets/css/main.css` | 无 | 否 |
| `src/components/{MiniPlayer,StarTrails}.vue` | `v1/components/` | 无 | 否 |
| `index.html` | `v1/index.html` | 脚本 → `/v1/main.js`；新增 `#version-switcher`；favicon → `/v1/img/star.svg`（带 `vite-ignore`）；title 加版本标识 | 否 |
| `public/star.svg`、`mengdenglong.mp3` | `v1/img/star.svg`、`v1/audio/mengdenglong.mp3` | 由共享改为 1.0 自持，按类型分目录，内容不变 | 否 |
| `public/vite.svg`、`vite_2.svg` | `v1/img/` | 位置迁移；模板遗留，未被引用 | 否 |

### 5.2 2.0（来源 `bak/v2_colorful_star`）

| 原路径 | 新路径 | 变更内容 | 是否动业务逻辑 |
| --- | --- | --- | --- |
| `src/main.js` | `v2/main.js` | 同 1.0 | 否 |
| `src/App.vue` | `v2/App.vue` | 2 处 `@/` → `@v2/`；`/yourname.avif` → `/v2/img/yourname.avif`；BGM → `/v2/audio/mengdenglong.mp3` | 否 |
| `src/config.js` | `v2/config.js` | 无 | 否 |
| `src/assets/css/main.css` | `v2/assets/css/main.css` | 无 | 否 |
| `src/components/{MiniPlayer,StarTrails}.vue` | `v2/components/` | 无 | 否 |
| `index.html` | `v2/index.html` | 同 1.0（favicon → `/v2/img/star.svg`） | 否 |
| `public/star.svg`、`mengdenglong.mp3` | `v2/img/`、`v2/audio/` | 由共享改为 2.0 自持并分类 | 否 |
| `public/yourname.avif` | `v2/img/yourname.avif` | 位置迁移（黄昏插画，页脚使用） | 否 |
| `public/vite.svg`、`vite_2.svg` | `v2/img/` | 位置迁移；未被引用 | 否 |

### 5.3 3.0（来源 `main`）

| 原路径 | 新路径 | 变更内容 |
| --- | --- | --- |
| `src/` 整个目录 | `v3/` | `git mv` 整体迁移，保留目录层级与文件关联 |
| `src/main.js` | `v3/main.js` | `@/` → `@v3/`；`virtual:uno.css` → `@shared/uno.js`；新增 `import '@shared/switcher.js'` |
| `src/App.vue` | `v3/App.vue` | 5 处 `@/` → `@v3/`；插图 → `/v3/img/quote-hero.svg`、`/v3/img/quote-footer.svg`；BGM → `/v3/audio/mengdenglong.mp3` |
| `src/config.js` | `v3/config.js` | 封面 → `/v3/img/music_cover.jpg`；BGM → `/v3/audio/mengdenglong.mp3` |
| `src/data.js` | `v3/data.js` | 图标 → `/v3/img/github.svg`、`/v3/img/bilibili.svg` |
| `src/effects/sky.js` | `v3/effects/sky.js` | `@/config` → `@v3/config` |
| `src/components/StarTrails.vue` | `v3/components/StarTrails.vue` | `@/effects/sky` → `@v3/effects/sky` |
| `src/components/MiniPlayer.vue` | `v3/components/MiniPlayer.vue` | 封面 → `/v3/img/music_cover.jpg` |
| `src/components/ProjectCard.vue` | `v3/components/ProjectCard.vue` | 无 |
| `src/assets/css/main.css` | `v3/assets/css/main.css` | 背景图 → `/v3/img/dusk.webp`、`/v3/img/sky-reference.webp`、`/v3/img/speckles.svg` |
| 原 `public/scenery/` | `v3/img/` | 11 个文件平铺进 `img/`；原 `star.svg`（32×32 装饰星星）与 favicon 同名，改名 `star-decor.svg` |
| `public/star.svg`、`mengdenglong.mp3` | `v3/img/`、`v3/audio/` | 由共享改为 3.0 自持并分类 |
| 根 `index.html` | `v3/index.html` | 3.0 入口移入版本目录；脚本 → `/v3/main.js`；favicon → `/v3/img/star.svg`（带 `vite-ignore`） |
| 新增 | 根 `index.html` | 纯跳转页，`__LATEST_VERSION__` 由构建注入 |

### 5.4 共享层

| 文件 | 职责 | 边界 |
| --- | --- | --- |
| `shared/versions.js` | 版本清单、当前判定、循环切换；数组最后一项即最新版本 | 纯数据 + 纯函数，只读 `window.location.pathname` |
| `shared/switcher.js` | 左上角按钮，点击 `location.assign()`；移开 3 秒淡出、聚焦恢复 | 不 import 任何 `vX` 代码、不依赖 Vue；挂独立 `#version-switcher` 节点；带 `stMounted` 防重复 |
| `shared/switcher.css` | 切换器样式（左上角定位、`st-hidden` 淡出态、触屏降级） | 选择器全部限定在 `#version-switcher` 内、`st-` 前缀；`?inline` 注入 |
| `shared/uno.js` | 唯一 `import 'virtual:uno.css'` | 避免多入口重复导入告警 |

### 5.5 配置层

| 文件 | 变更 |
| --- | --- |
| `vite.config.js` | 四入口（根跳转页 + `v1|v2|v3/index.html`）；`latestVersionRedirect()` 注入最新版本路径；`copyVersionStatic()` 复制版本资源；`transformAssetUrls: false`；别名 `@v1/@v2/@v3/@shared` |
| `uno.config.js` | `filesystem` 扫描 `v1/**`、`v2/**`、`v3/**` 与根 `index.html` |
| `jsconfig.json` | `paths` → `./v1/*`、`./v2/*`、`./v3/*`、`./shared/*` |
| `components.d.ts` | 无 `GlobalComponents` 声明 |
| `eslint.config.js` | `ignores` 含 `./v1/**`、`./v2/**` |
| `.github/workflows/deploy.yml` | 唯一部署通道：`pnpm build` → 上传 `dist` → GitHub Pages |
| `package.json`、`pnpm-lock.yaml` | **未改动**，无新增依赖 |

## 6. 静态资源归属

| 路径 | 类型 | 使用方 |
| --- | --- | --- |
| `v1/img/star.svg` | 图片 | `v1/index.html` favicon |
| `v1/audio/mengdenglong.mp3` | 音频 | `v1/App.vue` 背景音乐 |
| `v1/img/vite.svg`、`vite_2.svg` | 图片 | 无（模板遗留） |
| `v2/img/star.svg` | 图片 | `v2/index.html` favicon |
| `v2/img/yourname.avif` | 图片 | `v2/App.vue` 页脚黄昏插画 |
| `v2/audio/mengdenglong.mp3` | 音频 | `v2/App.vue` 背景音乐 |
| `v2/img/vite.svg`、`vite_2.svg` | 图片 | 无（模板遗留） |
| `v3/img/star.svg` | 图片 | `v3/index.html` favicon |
| `v3/audio/mengdenglong.mp3` | 音频 | `v3/config.js`、`v3/App.vue` |
| `v3/img/dusk.webp`、`sky.webp`、`sky-reference.webp`、`speckles.svg` | 图片 | `v3/assets/css/main.css` 背景 |
| `v3/img/music_cover.jpg` | 图片 | `v3/config.js`、`MiniPlayer.vue` 封面 |
| `v3/img/quote-hero.svg`、`quote-footer.svg` | 图片 | `v3/App.vue` 装饰插图 |
| `v3/img/github.svg`、`bilibili.svg` | 图片 | `v3/data.js` 社交链接 |
| `v3/img/star-decor.svg` | 图片 | 无（存档，原 `scenery/star.svg`） |
| `v3/assets/MaShanZheng-OFL.txt` | 文档 | 字体许可，README 引用 |

## 7. 运行与验证

```sh
pnpm dev      # / 跳转最新版，/v1/ /v2/ /v3/ 各自独立
pnpm build    # 产出根跳转页 + 三个版本入口 + 各版本资源
pnpm preview
```

本次验证结果：

| 项 | 结果 |
| --- | --- |
| `pnpm build` | 通过，4 个 HTML + 3 份版本 JS/CSS + 1 份共享 JS/CSS，无告警 |
| dev server | `/` 200（跳转页，无切换器）、`/v1/`、`/v2/`、`/v3/` 均 200，标题与入口脚本正确 |
| dist 静态预览 | `/`、`/v1/`、`/v2/`、`/v3/` 全部 200 |
| 版本内资源 | `/v1/img/star.svg`、`/v1/audio/mengdenglong.mp3`、`/v2/img/yourname.avif`、`/v3/img/dusk.webp`、`/v3/audio/mengdenglong.mp3`、`/v3/assets/MaShanZheng-OFL.txt` 等 dev 与 preview 均 200 |
| 旧路径清理 | `/star.svg`、`/v1/star.svg`、`/v3/mengdenglong.mp3` 均 404 |
| favicon | 三版产物分别保持 `/v1/img/star.svg`、`/v2/img/star.svg`、`/v3/img/star.svg`（`vite-ignore` 生效） |
| 模板插图 | `v3` 产物 JS 中保持 `/v3/img/quote-hero.svg` 原路径（`transformAssetUrls: false` 生效） |
| 跳转页注入 | `dist/index.html` 与 dev 下 `/` 的 `__LATEST_VERSION__` 均替换为 `/v3/` |
| 版本判定单测 | `/v3/`→v3→v1、`/v1/`→v1→v2、`/v2/`→v2→v3、`/v1/index.html`→v1、`/v3/index.html`→v3、`/`→v3 全部通过 |
| 切换器自动隐藏 | 首屏 3 秒收起、悬停恢复、离开 3 秒再隐藏、键盘聚焦恢复、触屏不启用，DOM 模拟 10 例通过 |

### 已知事项

- **CSS 背景图会在产物中存两份**：`dist/assets/<name>-<hash>.webp`（CSS 引用）与 `dist/v3/img/`（复制插件产出）。CSS 的 `url()` 不支持 `@vite-ignore`（lightningcss 报 `BadUrl`），只能交给 Vite 打包。多出约 400 KB，功能无影响。
- **`pnpm lint` 无法运行**：`@unocss/eslint-plugin` 加载期找不到 `@typescript-eslint/types`。既有依赖链接问题，与本次结构无关。
- 本机 Node 22 低于 `package.json` 要求的 24，构建仅有 engine 警告。
- 三个页面共载一份 UnoCSS 原子类 CSS（gzip 约 8.8 KB），是构建期唯一共享样式。
- 切换为整页跳转，会有一次刷新；后续若要无刷新，只需改 `shared/switcher.js`。
- 根跳转页刻意**不使用** `<link rel="canonical">`：Vite 会把 `link[href]` 当资源处理，`/v3/` 是目录会触发 `EISDIR`。页面本身 `noindex`，无需 canonical。

## 8. 新增一个版本的步骤

1. 建 `vN/`，放入入口 `vN/index.html`（引入 `/vN/main.js`，保留 `<div id="version-switcher"></div>`）与全部源码（用 `@vN/` 别名）。
2. 资源放 `vN/img`、`vN/audio`、`vN/assets`；代码内用 `/vN/img/...` 等绝对路径，favicon 加 `vite-ignore`。
3. `vite.config.js` 的 `entries`、`alias` 各加一项。
4. `shared/versions.js` 的 `VERSIONS` 加一项。**数组最后一项即最新版本**，根跳转目标自动跟随；循环顺序同样按数组顺序。
5. `uno.config.js` 的 `filesystem` 与 `eslint.config.js` 的 `ignores` 各加一条。
6. 其余文件与已有版本代码均不需要改动。
