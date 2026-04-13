# Pokémon Champions 对位实验室（完整仓库）

本仓库与本地 **`pokemon-personality-team`** 内容一致：根目录 **`index.html`** 即为 **Champions Matchup Lab** 入口，与用浏览器打开  
`file:///…/pokemon-personality-team/index.html`  
是同一套页面与脚本（相对路径 `./data/`、`./damage-engine.js` 等）。

在线访问（需先在 GitHub 开启 Pages）：**https://ty0402.github.io/pokemon-champion-ca/**

---

## 体积说明

整仓约 **14 MB**，最大单文件约 **1.2 MB**，远低于 GitHub 普通推送限制；**无需 Git LFS**。

---

## 目录概览

| 路径 | 说明 |
|------|------|
| `index.html` | 主应用（队伍编辑、速度线、伤害计算、热门模板） |
| `app.js`、`damage-engine.js` | 前端逻辑与伤害引擎 |
| `data/app-data.js`、`data/zh-maps.js` | 运行时加载的结构化数据与中文映射 |
| `data/game8-*.html`、`*.json` 等 | 抓取/导出的原始或中间资料（供对照或重建数据） |
| `scripts/build-app-data.mjs`、`build-data.mjs` | 从原始资料生成 `app-data.js` 等（需 Node） |
| `champions-calculator-design.md` | 设计说明 |

---

## 本地预览

与直接双击 `index.html` 等价；若需避免个别浏览器对 `file://` 的限制，可用静态服务：

```bash
cd pokemon-champion-ca
python3 -m http.server 8080
```

浏览器打开：<http://localhost:8080/>

---

## GitHub Pages

1. 仓库 **Settings** → **Pages**
2. **Source**：**Deploy from a branch**，分支 **`main`**，目录 **`/ (root)`**
3. 站点一般为：`https://ty0402.github.io/pokemon-champion-ca/`

根目录 `index.html` 为默认首页，无需构建。

---

## 首次克隆后推送到自己的远程（参考）

```bash
git add .
git commit -m "Sync full project"
git push origin main
```

---

## 许可与声明

宝可梦相关名称与素材版权归各自权利人所有。本项目为同人/工具向学习用途，与任天堂或 The Pokémon Company 无关联。
