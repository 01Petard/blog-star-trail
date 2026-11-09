# 多版本共存：目录结构与文件对应关系

> 改造分支：`feat/multi-version-switch`（基于 `main` 新建，已合并入本地 `main`）
> 目标：把 1.0、2.0 的界面并入当前 3.0，用户可随时切换查看历史版本，且三版代码互不冲突、互不影响。
> 切换交互目前是**右上角一个按钮，点击循环切到下一个版本**（3.0 → 1.0 → 2.0 → 3.0）。

## 1. 设计原则

| 原则 | 落地方式 |
| --- | --- |
| 一个版本 = 一个独立 HTML document | `/`、`/v1/`、`/v2/` 三个 Vite 入口，各自加载自己的 JS 与全局 CSS |
| 源码按版本平级隔离 | `versions/v1`、`versions/v2`、`versions/v3`；`MiniPlayer.vue`、`StarTrails.vue`、`App.vue`、`main.css` 等同名文件不共处同一目录 |
| 静态资源按版本完全自持 | `public/v1`、`public/v2`、`public/v3` 各持一套 favicon 与 BGM；**根目录不再保留任何跨版本共享资源** |
| 编译期禁止跨版本误引 | 只保留 `@v1` / `@v2` / `@v3` / `@shared` 四个别名，**删除通用 `@`**；任何 import 一眼可辨归属 |
| 历史代码最小侵入 | 1.0 / 2.0 仅改 import 别名、资源路径前缀、入口 HTML；业务数据、模板、样式逻辑逐字未动 |
| 共享代码收敛到一处 | `versions/shared/` 是唯一跨版本目录，且不 import 任何 `v1/v2/v3` 代码 |

### 为什么这样就能「互不影响」

三份代码原本都存在 `id="background"`、`id="trails"`、全局 `window.scroll` / `resize` 监听、`document.getElementById` 调用，且 `main.css` 都是全局 `* / html / body / button` 规则。若把它们塞进同一个 SPA 同时挂载，这些全局副作用必然互相抢占（1.0 的 scroll 监听甚至没有卸载）。

改为三个独立 HTML 入口后，**同一时刻浏览器只存在一个版本的 document 和 JS 运行时**。冲突面从「运行时共存」降级为「构建期共存」，构建期只共享 Vue runtime 和一份 UnoCSS 原子类 CSS（原子类语义一致，不会互相覆盖）。因此三版天然隔离。

切换采用整页跳转（临时单按钮形态）。后续若要改无刷新切换（iframe 或 SPA 路由），只需改 `versions/shared/switcher.js`，三个入口和三个版本源码都不用动。

## 2. 最终目录结构

```text
blog-star-trail/
├── index.html                       # [3.0 入口] URL /
├── v1/index.html                    # [1.0 入口] URL /v1/
├── v2/index.html                    # [2.0 入口] URL /v2/
│
├── versions/                        # ★ 唯一存放业务源码的区域，三版平级
│   ├── v1/                          # 1.0 源码，来自分支 bak/v1_linear_star（原 bak/linear_star）
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── assets/css/main.css
│   │   └── components/{MiniPlayer,StarTrails}.vue
│   ├── v2/                          # 2.0 源码，来自分支 bak/v2_colorful_star（原 bak/colorful_star）
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── config.js
│   │   ├── assets/css/main.css
│   │   └── components/{MiniPlayer,StarTrails}.vue
│   ├── v3/                          # 3.0 源码，来自 main 分支 src/（整体 git mv）
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── config.js
│   │   ├── data.js
│   │   ├── effects/sky.js
│   │   ├── assets/css/main.css
│   │   └── components/{MiniPlayer,ProjectCard,StarTrails}.vue
│   └── shared/                      # ★ 唯一跨版本共享层（不依赖任何 vX）
│       ├── versions.js              # 版本清单 / 当前判定 / 循环切换
│       ├── switcher.js              # 单按钮切换器（原生 JS）
│       ├── switcher.css             # 切换器样式（st- 前缀，作用域限定）
│       └── uno.js                   # UnoCSS 唯一 import 入口
│
├── public/                          # 静态资源，全部按版本归属分区
│   ├── CNAME                        # 站点级，唯一与版本无关的文件
│   ├── v1/                          # [1.0 专属]
│   │   ├── star.svg                 #   favicon        → /v1/star.svg
│   │   ├── mengdenglong.mp3         #   BGM            → /v1/mengdenglong.mp3
│   │   └── vite.svg、vite_2.svg     #   Vite 模板遗留，代码未引用
│   ├── v2/                          # [2.0 专属]
│   │   ├── star.svg、mengdenglong.mp3
│   │   ├── yourname.avif            #   页脚黄昏插画   → /v2/yourname.avif
│   │   └── vite.svg、vite_2.svg
│   └── v3/                          # [3.0 专属] 原 public/scenery/ 整体平铺，无 scenery 子目录
│       ├── star.svg                 #   favicon        → /v3/star.svg
│       ├── mengdenglong.mp3         #   BGM            → /v3/mengdenglong.mp3
│       ├── star-decor.svg           #   原 scenery/star.svg，装饰小星星（改名避冲突）
│       ├── MaShanZheng-OFL.txt      #   字体许可
│       └── bilibili.svg、dusk.webp、github.svg、music_cover.jpg、
│           quote-footer.svg、quote-hero.svg、sky-reference.webp、
│           sky.webp、speckles.svg
│
├── vite.config.js                   # 3 个 HTML 入口 + 4 个版本别名
├── uno.config.js                    # 增加 versions/** 全量扫描
├── jsconfig.json                    # paths 同步为版本别名
├── components.d.ts                  # 清空全局组件声明，避免同名组件混淆
├── eslint.config.js                 # 忽略 v1/v2 历史快照，保持原始风格
├── netlify.toml                     # 未改动
├── package.json / pnpm-lock.yaml    # 未改动
├── README.md                        # 路径与多版本说明已更新
└── docs/VERSIONS.md                 # 本文档
```

**关于 3.0 入口为何留在根目录**：静态托管（GitHub Pages / Netlify）访问 `/` 时只会找根目录 `index.html`，把 3.0 放根可让域名直达当前版本，无需跳转页或部署平台重定向。若把入口移到 `v3/index.html`，3.0 的 URL 会变成 `/v3/`，还需额外保留根跳转页、改动 `versions.js` 的路径判定与 `netlify.toml` 的 fallback，且源码目录 `v3/` 会与静态资源目录 `public/v3/` 同名造成混淆。因此当前结构刻意保持：**入口 HTML 在根，业务源码在 `versions/v3/`，静态资源在 `public/v3/`**，三者职责不同、路径不重叠。

原根目录 `src/` 已整体迁走，不再保留；`public/star.svg`、`public/mengdenglong.mp3` 两个跨版本共享文件也已删除，避免任何版本替换素材时影响其它版本。

## 3. 版本 ↔ 入口 ↔ 源码 ↔ 产物对应表

| 版本 | 来源 | 访问 URL | 入口 HTML | 源码目录 | 构建产物 |
| --- | --- | --- | --- | --- | --- |
| 1.0 线性星轨 | 分支 `bak/v1_linear_star`（原 `bak/linear_star`，tag `1.0`、`1.0-remake`） | `/v1/` | `v1/index.html` | `versions/v1/` | `dist/v1/index.html` + `v1-*.js` + `v1-*.css` |
| 2.0 彩色星轨 | 分支 `bak/v2_colorful_star`（原 `bak/colorful_star`，tag `2.0`、`2.0-remake`） | `/v2/` | `v2/index.html` | `versions/v2/` | `dist/v2/index.html` + `v2-*.js` + `v2-*.css` |
| 3.0 星轨之下（未发布） | 分支 `main` 的 `src/` | `/` | `index.html` | `versions/v3/` | `dist/index.html` + `v3-*.js` + `v3-*.css` |
| 共享层 | 本次新增，无历史来源 | — | 三个入口各自 import | `versions/shared/` | `uno-*.js` + `uno-*.css`（Vue runtime / 原子类 / 切换器） |

> 归档分支：`bak/v1_linear_star`（`0dddb4c`）、`bak/v2_colorful_star`（`4e1a7b3`）为 1.0 / 2.0 原分支改名；`bak/v3_under_star`（`bef19db`）是合并多版本改造**之前**的 3.0 快照。三者均已推送到远程，远程旧名 `bak/linear_star`、`bak/colorful_star` 已删除。

## 4. 逐文件来源与变更范围

### 4.1 1.0（来源 `bak/v1_linear_star`）

| 原路径 | 新路径 | 变更内容 | 是否动业务逻辑 |
| --- | --- | --- | --- |
| `src/main.js` | `versions/v1/main.js` | `@/` → `@v1/`；`virtual:uno.css` → `@shared/uno.js`；新增 `import '@shared/switcher.js'` | 否 |
| `src/App.vue` | `versions/v1/App.vue` | 1 处 `@/components/MiniPlayer.vue` → `@v1/components/MiniPlayer.vue`；BGM `/mengdenglong.mp3` → `/v1/mengdenglong.mp3` | 否 |
| `src/assets/css/main.css` | `versions/v1/assets/css/main.css` | 无 | 否 |
| `src/components/MiniPlayer.vue` | `versions/v1/components/MiniPlayer.vue` | 无 | 否 |
| `src/components/StarTrails.vue` | `versions/v1/components/StarTrails.vue` | 无 | 否 |
| `index.html` | `v1/index.html` | 入口脚本指向 `versions/v1/main.js`；新增 `#version-switcher`；favicon 改 `/v1/star.svg`；`lang` 改 `zh-CN`、title 加版本标识、统计脚本改用 `window.LA?.init` | 否（仅入口适配） |
| `public/star.svg`、`mengdenglong.mp3` | 复制到 `public/v1/` | 由共享改为 1.0 自持，文件内容不变 | 否 |
| `public/vite.svg`、`vite_2.svg` | `public/v1/` | 位置迁移；Vite 模板遗留，代码未引用 | 否 |

### 4.2 2.0（来源 `bak/v2_colorful_star`）

| 原路径 | 新路径 | 变更内容 | 是否动业务逻辑 |
| --- | --- | --- | --- |
| `src/main.js` | `versions/v2/main.js` | 同 1.0 | 否 |
| `src/App.vue` | `versions/v2/App.vue` | 2 处 `@/` → `@v2/`；`/yourname.avif` → `/v2/yourname.avif`；BGM → `/v2/mengdenglong.mp3` | 否 |
| `src/config.js` | `versions/v2/config.js` | 无 | 否 |
| `src/assets/css/main.css` | `versions/v2/assets/css/main.css` | 无 | 否 |
| `src/components/MiniPlayer.vue` | `versions/v2/components/MiniPlayer.vue` | 无 | 否 |
| `src/components/StarTrails.vue` | `versions/v2/components/StarTrails.vue` | 无 | 否 |
| `index.html` | `v2/index.html` | 同 1.0（favicon → `/v2/star.svg`） | 否 |
| `public/star.svg`、`mengdenglong.mp3` | 复制到 `public/v2/` | 由共享改为 2.0 自持，文件内容不变 | 否 |
| `public/yourname.avif` | `public/v2/yourname.avif` | 位置迁移（黄昏插画，2.0 页脚使用） | 否 |
| `public/vite.svg`、`vite_2.svg` | `public/v2/` | 位置迁移；代码未引用 | 否 |

### 4.3 3.0（来源 `main`）

| 原路径 | 新路径 | 变更内容 |
| --- | --- | --- |
| `src/` 整个目录 | `versions/v3/` | `git mv` 整体迁移，保留原有目录层级与文件关联 |
| `src/main.js` | `versions/v3/main.js` | `@/` → `@v3/`；`virtual:uno.css` → `@shared/uno.js`；新增 `import '@shared/switcher.js'` |
| `src/App.vue` | `versions/v3/App.vue` | 5 处 `@/` → `@v3/`；2 处 `/scenery/` → `/v3/`；BGM → `/v3/mengdenglong.mp3` |
| `src/config.js` | `versions/v3/config.js` | 封面路径 → `/v3/music_cover.jpg`；BGM → `/v3/mengdenglong.mp3` |
| `src/data.js` | `versions/v3/data.js` | 2 处图标路径 → `/v3/github.svg`、`/v3/bilibili.svg` |
| `src/effects/sky.js` | `versions/v3/effects/sky.js` | `@/config` → `@v3/config` |
| `src/components/StarTrails.vue` | `versions/v3/components/StarTrails.vue` | `@/effects/sky` → `@v3/effects/sky` |
| `src/components/MiniPlayer.vue` | `versions/v3/components/MiniPlayer.vue` | 封面路径 → `/v3/music_cover.jpg` |
| `src/components/ProjectCard.vue` | `versions/v3/components/ProjectCard.vue` | 无 |
| `src/assets/css/main.css` | `versions/v3/assets/css/main.css` | 7 处背景图路径 → `/v3/dusk.webp`、`/v3/sky-reference.webp`、`/v3/speckles.svg` |
| `public/scenery/` | `public/v3/` | 11 个文件整体平铺，去掉 `scenery` 子目录；其中 `star.svg`（32×32 装饰星星）与 favicon 同名且内容不同，改名 `star-decor.svg` 保留 |
| `public/star.svg`、`mengdenglong.mp3` | 复制到 `public/v3/` | 由共享改为 3.0 自持，文件内容不变 |
| 根目录 `public/star.svg`、`mengdenglong.mp3` | **删除** | 不再保留跨版本共享资源 |
| `index.html` | `index.html` | 入口脚本指向 `versions/v3/main.js`；新增 `#version-switcher`；favicon → `/v3/star.svg`；head 其余内容不变 |

### 4.4 共享层（本次新增）

| 文件 | 职责 | 边界 |
| --- | --- | --- |
| `versions/shared/versions.js` | 版本清单、当前版本判定、循环切换规则 | 纯数据 + 纯函数，只读 `window.location.pathname` |
| `versions/shared/switcher.js` | 创建右上角按钮，点击 `location.assign()` | 不 import 任何 `vX` 代码、不依赖 Vue；挂载到独立 `#version-switcher` 节点；带 `stMounted` 防重复 |
| `versions/shared/switcher.css` | 切换器样式 | 全部选择器限定在 `#version-switcher` 内、`st-` 前缀；`?inline` 注入，不污染三版全局样式 |
| `versions/shared/uno.js` | 唯一 `import 'virtual:uno.css'` | 避免多入口重复导入告警；三版共用一份原子类 |

### 4.5 配置层

| 文件 | 变更 |
| --- | --- |
| `vite.config.js` | `rollupOptions.input` 配置 `index.html` / `v1/index.html` / `v2/index.html` 三入口；别名改为 `@v1/@v2/@v3/@shared`（删除通用 `@`）；`Components({ dts: false })` 防止生成混淆的同名组件声明 |
| `uno.config.js` | `content.filesystem` 显式扫描 `versions/**` 与三个入口 HTML，保证三版（含 `v-html` 字符串里的图标类名）都被生成 |
| `jsconfig.json` | `paths` 同步四个新别名，补 `baseUrl` |
| `components.d.ts` | 清空 `GlobalComponents` 声明（三版有同名组件，全局声明会混淆，改为各版本显式 import） |
| `eslint.config.js` | `ignores` 增加 `versions/v1/**`、`versions/v2/**`，历史快照不被格式化 |
| `netlify.toml` | **未改动**：`/*` → `/index.html` 的 200 rewrite 不会覆盖已存在的 `dist/v1/index.html`、`dist/v2/index.html` |
| `package.json`、`pnpm-lock.yaml` | **未改动**，无新增依赖 |

## 5. 静态资源归属

`public/` 下除 `CNAME` 外**全部按版本分区**，任何版本都可以独立替换自己的素材而不影响其它版本。

| 资源 | 归属 | 使用方 | 说明 |
| --- | --- | --- | --- |
| `public/v1/star.svg`、`mengdenglong.mp3` | 1.0 | `v1/index.html` favicon、`versions/v1/App.vue` | 从原根目录共享文件复制，三份字节一致；引用改为 `/v1/...` |
| `public/v2/star.svg`、`mengdenglong.mp3` | 2.0 | `v2/index.html` favicon、`versions/v2/App.vue` | 同上，引用改为 `/v2/...` |
| `public/v3/star.svg`、`mengdenglong.mp3` | 3.0 | `index.html` favicon、`versions/v3/App.vue`、`config.js` | 同上，引用改为 `/v3/...` |
| 根目录 `public/star.svg`、`mengdenglong.mp3` | **已删除** | — | 原三版共享资源，本次拆分后不再保留 |
| `public/v1/vite.svg`、`vite_2.svg` | 1.0 | 无（模板遗留） | 保留以完整还原版本快照 |
| `public/v2/yourname.avif` | 2.0 | `versions/v2/App.vue` 页脚 | 路径 `/v2/yourname.avif` |
| `public/v2/vite.svg`、`vite_2.svg` | 2.0 | 无（模板遗留） | 同上 |
| `public/v3/*`（背景、图标、封面、字体许可） | 3.0 | `versions/v3/` 模板、数据、CSS | 原 `public/scenery/` 整体平铺到 `public/v3/`，引用统一为 `/v3/...` |
| `public/v3/star-decor.svg` | 3.0 | 无（存档） | 原 `public/scenery/star.svg`；与 favicon 同名但内容不同（32×32 装饰星星），平铺时改名避免覆盖 |
| `public/CNAME` | 站点级 | 部署 | 与版本无关 |

## 6. 运行与验证

```sh
pnpm dev      # / = 3.0，/v1/ = 1.0，/v2/ = 2.0
pnpm build    # 一条命令产出三个入口
pnpm preview
```

本次验证结果：

| 项 | 结果 |
| --- | --- |
| `pnpm build` | 通过，产出 3 个 HTML + 3 份版本专属 JS/CSS + 1 份共享 JS/CSS，无重复导入告警 |
| dev server 三个入口 | `/`、`/v1/`、`/v2/` 均 200，标题、入口脚本、`#version-switcher` 挂载点正确 |
| 三版 SFC / CSS / 数据模块 | 全部 200，无编译错误 |
| 版本专属静态资源 | `/v1/`、`/v2/`、`/v3/` 下各自的 `star.svg`、`mengdenglong.mp3`，以及 `/v2/yourname.avif`、`/v3/dusk.webp`、`/v3/music_cover.jpg` 等均 200；根目录不再提供这两个共享文件 |
| UnoCSS 覆盖 | `wv`、`f-c-c`、`i-ant-design-user-outlined`（1.0/2.0）与 `i-lucide-map-pin`（3.0）等类名均生成 |
| 切换逻辑单测 | `/`→v3→v1、`/v1/`→v1→v2、`/v2/`→v2→v3、`/v1/index.html`→v1 全部通过 |
| 切换器执行确定性 | 由三个 `main.js` 显式 `import '@shared/switcher.js'`，ESM 语义保证执行；未采用 HTML 第二个 module script（多入口构建时执行时机不确定） |

### 已知事项

- **`pnpm lint` 无法运行**：`@unocss/eslint-plugin` 在加载期找不到 `@typescript-eslint/types`。这是既有依赖链接问题（`unocss: true` 在 `main` 分支即已启用），本次未改动任何依赖，与多版本改造无关。
- 本机 Node 22 低于 `package.json` 要求的 24，构建时仅有 engine 警告，不影响产物。
- 三个页面共载一份 UnoCSS 原子类 CSS（gzip 约 8.8 KB），是构建期唯一共享的样式；三版 preset 相同，不存在覆盖冲突。
- 切换为整页跳转，会有一次刷新；这是当前「单按钮」临时形态，后续可平滑替换为无刷新方案。

## 7. 新增一个版本的步骤

1. 建 `versions/vN/`，放入该版本自包含源码（入口 `main.js` 使用 `@vN/` 别名）。
2. 建 `vN/index.html`，引入 `/versions/vN/main.js`，保留 `<div id="version-switcher"></div>`。
3. `vite.config.js` 的 `entries` 与 `alias` 各加一项。
4. `versions/shared/versions.js` 的 `VERSIONS` 加一项（决定按钮循环顺序）。
5. 该版本专属静态资源放 `public/vN/`，代码内用 `/vN/...` 引用；**favicon 与 BGM 也要各放一份，不复用其它版本或根目录文件**。
6. 其余文件和已有三个版本的代码均不需要改动。
