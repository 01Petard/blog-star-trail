<div align="center">
  <img src="v3/img/star.svg" width="80" height="80" alt="Star-Trail · 星轨 标志">
  <h1>Star-Trail · 星轨</h1>
  <p><strong>让热爱，在星空下相遇。</strong></p>
  <p>以星轨与黄昏为背景的个人主页，把作品、博客和社交入口放在同一片夜空里。</p>
  <p>
    <img src="https://img.shields.io/badge/Vue-3-42b883" alt="Vue 3">
    <img src="https://img.shields.io/badge/Vite-8-646cff" alt="Vite 8">
    <img src="https://img.shields.io/badge/style-UnoCSS-333333" alt="UnoCSS">
    <img src="https://img.shields.io/badge/deploy-static-0ea5e9" alt="纯静态部署">
  </p>
  <p>
    <a href="#你可以用它做什么">功能</a> ·
    <a href="#快速开始">快速开始</a> ·
    <a href="#多版本共存">多版本</a> ·
    <a href="#换成你的主页">个性化</a> ·
    <a href="#部署">部署</a>
  </p>
  <p><a href="https://www.bugstack.top/">在线访问</a> · <a href="https://github.com/01Petard/star-trail">GitHub</a></p>
</div>

## 你可以用它做什么

- **展示自己的作品**：按生活应用、Agent 应用、实用工具、创意实验和浏览器扩展分组，给每个项目一个清晰入口。
- **连接过去与现在**：博客、个人介绍与社交链接集中呈现，作为自己的网络名片。
- **留一会儿看星空**：Canvas 星轨、彗星尾迹与黄昏渐变组成背景，可切换沉浸模式。
- **给页面一点声音**：迷你播放器支持播放、暂停、进度和音量调节。
- **回看历史版本**：1.0、2.0 与当前 3.0 三个页面共存，左上角按钮随时切换（鼠标移开 3 秒后自动收起）。

| 体验 | 实现 |
| --- | --- |
| 星空背景 | 可配置的星轨、彗星、粒子与桌面 / 移动端渲染参数 |
| 沉浸观看 | 隐藏页面内容，支持浏览器允许时进入全屏 |
| 内容展示 | 随机首页短句、分类项目卡片、博客和社交入口 |
| 动效适配 | 响应减少动态效果偏好，针对移动设备调整绘制规模 |
| 轻量运行 | Vue 3 + Vite + UnoCSS，无业务后端、数据库或登录服务 |

## 快速开始

使用 **Node.js ≥ 24.11.0、pnpm 11.5.2**，仓库已提供 `.nvmrc`。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端中显示的 Vite 地址，默认端口为 `5173`。访问 `/` 会自动跳转到最新版本（当前是 `/v3/`）；`/v1/`、`/v2/` 是历史版本，`/v3/` 是当前 3.0。

```sh
pnpm build    # 一条命令生成三个入口的 dist
pnpm preview  # 预览构建结果
pnpm lint     # 代码检查
```

## 多版本共存

站点同时保留 1.0、2.0 与当前 3.0，左上角按钮可循环切换（3.0 → 1.0 → 2.0 → 3.0）。按钮在鼠标移开 3 秒后自动淡出，鼠标移回左上角即重新显示；触屏设备始终显示。

| 版本 | 访问路径 | 源码目录 | 入口 HTML |
| --- | --- | --- | --- |
| 1.0 线性星轨 | `/v1/` | [v1](v1) | `v1/index.html` |
| 2.0 彩色星轨 | `/v2/` | [v2](v2) | `v2/index.html` |
| 3.0 星轨之下（当前） | `/v3/` | [v3](v3) | `v3/index.html` |

三个版本各自是独立 HTML 文档，只加载自己的 JS 与全局 CSS；同名文件、同名 DOM id、全局样式和 `window` 事件监听不会互相影响。每个版本目录彻底自包含：入口 `vN/index.html`、源码 `vN/main.js` 等、静态资源 `vN/img/`（图片）、`vN/audio/`（音乐）、`vN/assets/`（字体许可等）。根目录 `index.html` 只是一个跳转页，指向最新版本。完整的目录结构、文件来源、路径归属与逐文件变更范围见 [docs/VERSIONS.md](docs/VERSIONS.md)。

> 配置当前版本内容时，请编辑 `v3/` 下的文件，**不要**改动 `v1/`、`v2/`（历史快照）。

## 换成你的主页

内容与视觉配置分开维护，无需在组件中寻找每一张项目卡片。

| 想修改什么 | 文件 | 对应内容 |
| --- | --- | --- |
| 首页短句 | [v3/data.js](v3/data.js) | `heroTitles`，支持换行 |
| 项目分类与作品 | [v3/data.js](v3/data.js) | `categories` 内各分类的 `projects` 数组，按数组顺序展示 |
| 头像 | [v3/config.js](v3/config.js) | `profile.avatar`、`profile.avatars` |
| 背景音乐 | [v3/config.js](v3/config.js) | `music.tracks` |
| 彗星与星轨 | [v3/config.js](v3/config.js) | `effects.comet`、`effects.sky` |
| 博客与联系方式 | [v3/data.js](v3/data.js) | `blogs`、`socialLinks` |
| 页面文案 | [v3/App.vue](v3/App.vue) | 页面结构与静态文案 |
| 站点标题、统计 | [v3/index.html](v3/index.html) | HTML 元信息及 51.la 脚本 |
| 公共素材 | [v3/img](v3/img)、[v3/audio](v3/audio)、[v3/assets](v3/assets) | 当前版本的图片、音乐与字体许可，跟随版本目录存放 |

`effects.comet` 当前为 `true`。`effects.sky` 包含视角、轴心、弧段、星轨数量、帧率与彗星尾迹等参数，桌面端与移动端可分别调整。建议先修改内容，再小幅调整视觉参数。

替换音乐时，同时更新资源路径、曲名、作者和封面。浏览器可能限制自动播放，访客可手动点击播放。

## 部署

构建后发布 **`dist`** 即可，运行阶段无需 Node 服务。

### GitHub Pages

仓库包含 [Pages 工作流](.github/workflows/deploy.yml)，在 `main` / `master` 推送、PR 和手动运行时触发。使用前在仓库 **Settings → Pages** 中选择 **GitHub Actions** 作为来源。

自定义域名不依赖仓库文件：项目已移除 `CNAME`，域名由仓库 **Settings → Pages → Custom domain** 维护（Actions 部署不读取产物中的 CNAME 文件）。当前 [Vite 配置](vite.config.js) 使用 `base: '/'`；若部署到 `/<仓库名>/` 子路径，还需同步调整构建路径及组件中的根路径资源引用。

### 其他静态托管

项目已移除 `netlify.toml`，当前只使用 GitHub Actions 部署。若要迁移到其它平台，按下表配置即可：

| 设置 | 值 |
| --- | --- |
| 安装命令 | `pnpm install --frozen-lockfile` |
| 构建命令 | `pnpm build` |
| 发布目录 | `dist` |
| Node.js | 满足 `≥24.11.0`，建议 24.x |

**不要配置 `/*` → `/index.html` 的 SPA 回退重写。** 本站是多入口静态站，`/v1/`、`/v2/`、`/v3/` 各有自己的 `index.html`；全局回退会把它们全部改写成根跳转页。目录形式的 URL 只需要服务器默认返回该目录下的 `index.html`，绝大多数静态托管默认如此。

更新内容后重新构建并替换 `dist`，或推送到已连接的部署分支。

### 历史版本（3.0后已不再维护）

两个旧版本已构建为静态站点镜像并发布到 Docker Hub。当前主站已把 1.0 / 2.0 内联为 `/v1/`、`/v2/` 页面，直接访问即可，无需单独启动容器；以下镜像仅作独立存档用途。

| 标签 | 版本 | 预览 |
| --- | --- | --- |
| `1.0-remake` | 1.0 版本存档 | <img src="https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202611041400541.png" alt="FireShot Capture 012 - 热爱可抵岁月漫长 - [localhost]" style="zoom:25%;" /> |
| `2.0-remake` | 2.0 版本存档 | <img src="https://cdn.jsdelivr.net/gh/01Petard/imageURL@main/img/202611041400213.png" alt="FireShot Capture 015 - 热爱可抵岁月漫长 - [localhost]" style="zoom:25%;" /> |

```sh
# 1.0 版本
docker pull 01petard/blog-star-trail:1.0-remake
docker run -d --name blog-star-trail-1.0-remake -p 8080:80 01petard/blog-star-trail:1.0-remake

# 2.0 版本
docker pull 01petard/blog-star-trail:2.0-remake
docker run -d --name blog-star-trail-2.0-remake -p 8080:80 01petard/blog-star-trail:2.0-remake
```

容器内使用 Nginx 提供静态页面，默认监听 `80`。两个版本不能同时占用宿主机的 `8080` 端口；如需并行运行，请修改其中一个的端口映射，例如 `-p 8081:80`。

如需从源码重新打包，可使用仓库中的 Dockerfile：

```sh
docker build -f docker/Dockerfile.1.0-remake -t 01petard/blog-star-trail:1.0-remake output/dist-1.0-remake
docker build -f docker/Dockerfile.2.0-remake -t 01petard/blog-star-trail:2.0-remake output/dist-2.0-remake
```

## 常见问题

**可以只做作品集，不播放音乐吗？** 可以修改播放器及音乐配置；页面没有依赖音乐的业务逻辑。

**为什么 Fork 后还显示原作者信息？** 头像、作品、博客、社交、备案、统计脚本和域名都需要按上面的文件逐项替换。

**页面会发起外部请求吗？** 当前页面包含 51.la 统计及远程头像等资源；自行部署时可按需要移除统计、改为自己的本地素材。

## 参考与反馈

页面设计参考 [哞菇 / Nekotora · fLaG.Moe](https://flag.moe/)。背景音乐《夢燈籠》来自 RADWIMPS，黄昏插画与《你的名字》相关；代码与第三方音乐、图片的使用权限应分别确认。字体许可见 [MaShanZheng-OFL.txt](v3/assets/MaShanZheng-OFL.txt)。

欢迎通过 [Issues](https://github.com/01Petard/star-trail/issues) 反馈问题，附上浏览器、设备尺寸和复现步骤。当前仓库未提供项目级 `LICENSE` 文件。
