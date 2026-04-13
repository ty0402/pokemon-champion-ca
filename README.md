# Pokémon Champions 对位伤害计算器（网页版）

面向 **Pokémon Champions 双打** 的浏览器端工具：配置我方六只、选择环境热门模板，实时查看 **速度线** 与 **伤害区间**（含天气、地形、顺风、戏法空间、威吓、光墙/反射壁、双打分摊等常见场况）。

在线演示（启用 GitHub Pages 后）：**https://ty0402.github.io/pokemon-champion-ca/**

---

## 本地预览

在项目根目录执行任意一种静态服务器（二选一即可）：

```bash
# Python 3
python3 -m http.server 8080
```

浏览器打开：<http://localhost:8080/>

---

## 推送到 GitHub（首次）

在终端进入本仓库目录：

```bash
cd pokemon-champion-ca
git init
git add .
git commit -m "Initial commit: Champions damage calculator static site"
git branch -M main
git remote add origin https://github.com/ty0402/pokemon-champion-ca.git
git push -u origin main
```

若远程已有内容或需覆盖，请按 GitHub 提示使用 `git pull --rebase origin main` 后再推送，或在新空仓库上执行上述命令。

---

## 用 GitHub Pages 发布为可访问网站

1. 打开仓库：<https://github.com/ty0402/pokemon-champion-ca>
2. 进入 **Settings** → 左侧 **Pages**
3. 在 **Build and deployment** 中：
   - **Source** 选 **Deploy from a branch**
   - **Branch** 选 `main`，文件夹选 **`/ (root)`**
4. 保存后等待约 1～3 分钟，页面顶部会出现绿色提示，给出站点地址（一般为 `https://ty0402.github.io/pokemon-champion-ca/`）。

说明：

- 本站为纯静态 HTML/JS，无需构建步骤；入口文件为根目录的 `index.html`。
- 若之后改用子目录（例如 `docs/`）部署，只需把同样文件移入 `docs/` 并在 Pages 里把源目录改为 `docs` 即可。

---

## 仓库结构

| 文件 / 目录 | 说明 |
|-------------|------|
| `index.html` | 页面结构与样式 |
| `app.js` | 界面与交互逻辑 |
| `damage-engine.js` | 伤害与能力值计算核心 |
| `data/app-data.js` | 图鉴、招式、道具、环境模板等结构化数据 |
| `data/zh-maps.js` | 中文显示名映射 |

数据来源与生成方式见原项目中的说明；本仓库仅包含 **可直接在浏览器中打开** 的静态资源。

---

## 许可与声明

宝可梦相关名称与素材版权归各自权利人所有。本项目为同人/工具向学习用途，与任天堂或 The Pokémon Company 无关联。
