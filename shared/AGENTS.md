# shared/

> L2 | Parent: [AGENTS.md](../AGENTS.md)

- `audio/mengdenglong.mp3`：三个版本共用的背景音乐。Vite 构建时保留此访问路径。
- `css/switcher.css`：版本切换按钮的作用域样式。由切换器脚本内联加载。
- `js/switcher.js`：挂载常显切换按钮。根据版本清单跳转到下一版本。
- `js/uno.js`：为三个版本入口加载同一份 UnoCSS 原子类样式。
- `js/versions.js`：定义版本路径和切换顺序。构建配置取末项作为根路径跳转目标。

[PROTOCOL]: Update this header on change, then check AGENTS.md
