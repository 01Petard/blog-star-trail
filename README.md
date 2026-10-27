<div align="center">
  <img src="public/star.svg" width="80" height="80" alt="Star-Trail · 星轨 标志">
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

打开终端中显示的 Vite 地址，默认端口为 `5173`。

```sh
pnpm build    # 生成 dist
pnpm preview  # 预览构建结果
pnpm lint     # 代码检查
```

## 换成你的主页

内容与视觉配置分开维护，无需在组件中寻找每一张项目卡片。

| 想修改什么 | 文件 | 对应内容 |
| --- | --- | --- |
| 首页短句 | [src/data.js](src/data.js) | `heroTitles`，支持换行 |
| 项目分类与作品 | [src/data.js](src/data.js) | `categories` 内各分类的 `projects` 数组，按数组顺序展示 |
| 头像 | [src/config.js](src/config.js) | `profile.avatar`、`profile.avatars` |
| 背景音乐 | [src/config.js](src/config.js) | `music.tracks` |
| 彗星与星轨 | [src/config.js](src/config.js) | `effects.comet`、`effects.sky` |
| 博客、社交与页面文案 | [src/App.vue](src/App.vue) | 页面内容及链接 |
| 站点标题、统计 | [index.html](index.html) | HTML 元信息及 51.la 脚本 |
| 公共素材 | [public](public) | 图标、音乐、星空和黄昏背景 |

`effects.comet` 当前为 `true`。`effects.sky` 包含视角、轴心、弧段、星轨数量、帧率与彗星尾迹等参数，桌面端与移动端可分别调整。建议先修改内容，再小幅调整视觉参数。

替换音乐时，同时更新资源路径、曲名、作者和封面。浏览器可能限制自动播放，访客可手动点击播放。

## 部署

构建后发布 **`dist`** 即可，运行阶段无需 Node 服务。

### GitHub Pages

仓库包含 [Pages 工作流](.github/workflows/deploy.yml)，在 `main` / `master` 推送、PR 和手动运行时触发。使用前在仓库 **Settings → Pages** 中选择 **GitHub Actions** 作为来源。

[public/CNAME](public/CNAME) 当前包含作者的自定义域名。复用项目时请改成自己的裸域名（如 `home.example.com`，不带协议或路径），或删除该文件。当前 [Vite 配置](vite.config.js) 使用 `base: '/'`；若部署到 `/<仓库名>/` 子路径，还需同步调整构建路径及组件中的根路径资源引用。

### Netlify 或其他静态托管

| 设置 | 值 |
| --- | --- |
| 安装命令 | `pnpm install --frozen-lockfile` |
| 构建命令 | `pnpm build` |
| 发布目录 | `dist` |
| Node.js | 满足 `≥24.11.0`，建议 24.x |

**注意：现有 [netlify.toml](netlify.toml) 仍指定 Node 20。** 在 Netlify 部署前应将该配置中的 `NODE_VERSION` 更新为 `24`，仅在控制台设置可能被文件配置覆盖。本次 README 整理未修改部署配置。

更新内容后重新构建并替换 `dist`，或推送到已连接的部署分支。

## 常见问题

**可以只做作品集，不播放音乐吗？** 可以修改播放器及音乐配置；页面没有依赖音乐的业务逻辑。

**为什么 Fork 后还显示原作者信息？** 头像、作品、博客、社交、备案、统计脚本和域名都需要按上面的文件逐项替换。

**页面会发起外部请求吗？** 当前页面包含 51.la 统计及远程头像等资源；自行部署时可按需要移除统计、改为自己的本地素材。

## 参考与反馈

页面设计参考 [哞菇 / Nekotora · fLaG.Moe](https://flag.moe/)。背景音乐《夢燈籠》来自 RADWIMPS，黄昏插画与《你的名字》相关；代码与第三方音乐、图片的使用权限应分别确认。字体许可见 [MaShanZheng-OFL.txt](public/scenery/MaShanZheng-OFL.txt)。

欢迎通过 [Issues](https://github.com/01Petard/star-trail/issues) 反馈问题，附上浏览器、设备尺寸和复现步骤。当前仓库未提供项目级 `LICENSE` 文件。
