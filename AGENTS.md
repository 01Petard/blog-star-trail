# Blog Star Trail

Vue 3 + Vite + UnoCSS + pnpm。

- `v1/`、`v2/`、`v3/` 分别提供独立 HTML 入口与页面源码。
- `shared/` 提供共用背景音乐、版本切换与 UnoCSS 入口。目录地图见 [shared/AGENTS.md](shared/AGENTS.md)。
- `index.html` 跳转到最新版本。`vite.config.js` 构建四个入口并复制静态资源。
- 发布路径与资源归属见 [docs/VERSIONS.md](docs/VERSIONS.md)。
