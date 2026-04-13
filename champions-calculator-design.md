# 宝可梦 Champions 对战计算器产品设计

更新日期：2026-04-13

## 1. 先说结论

这个产品值得做，而且方向是对的。

你想做的核心价值不是“再做一个普通伤害计算器”，而是做一个更贴近实战决策的 **对局辅助工作台**：

- 左侧输入我方 6 只宝可梦配置
- 支持通过截图、队伍图片、Showdown 文本导入
- 点击我方某只宝可梦后，右侧自动展示当前环境里最值得对比的热门对手
- 自动计算双方速度线
- 自动列出我方技能打对面常见配置的伤害区间、击杀概率、是否一确 / 二确
- 同时展示该对手的几套热门配招与常见道具 / 特性 / 努力分配

这比传统单点 damage calc 更接近玩家真实使用场景，尤其适合第二屏、赛前准备、构筑复盘和 BO3 对局笔记。

## 2. 当前环境判断

这里的“宝可梦冠军”我按 `Pokémon Champions` 理解。按官方页面与当前站点数据看，截至 **2026-04-13**：

- `Pokémon Champions` 已于 **2026-04-08** 在 Switch / Switch 2 上线。
- 官方 gameplay 页面明确写了有 `Ranked / Casual / Private` 三种模式，支持 `Single Battle` 和 `Double Battle`。
- 官方同时说明：`2026` 起 Worlds 与 Championship Series 的 VGC 软件转为 `Pokémon Champions`。
- 官方还写明 Ranked 的第一套规则允许 `Mega Evolution`。
- Ranked 会按赛季和 regulation 轮换，所以你的产品必须做成“按赛制版本切换”的结构，不能把数据写死。

### 2.1 现在能看到的热门环境

按 Pikalytics 当前 `Champions` 数据，热门宝可梦大致是：

- `Incineroar`：使用率约 `55%`，当前最核心的环境枢纽
- `Sneasler`：约 `29%`
- `Sinistcha`：约 `27%`
- `Whimsicott`：约 `22%`
- `Garchomp`：约 `19%`
- `Charizard`：约 `15%`

### 2.2 这说明了什么

可以合理推断当前主流是这些 archetype：

- `Incineroar` 为中心的泛用平衡 / 轴转队
- `Sinistcha` 代表的 `Rage Powder + Trick Room / 续航支援` 体系
- `Whimsicott + Charizard` 的晴天 / 顺风爆发体系
- `Garchomp` 的地震压制与中高速物攻轴
- `Sneasler` 的高速压迫、Fake Out、Close Combat / Dire Claw 进攻线

所以你的右侧“热门对手对比”不要做成随机列表，而应该优先提供：

- 全环境 top usage 对手
- 与当前我方宝可梦存在明显对位关系的对手
- 当前我方队伍最怕的速度点 / 属性点 /功能点对手

## 3. 产品定位

产品名暂定：`Champions Matchup Lab`

一句话：

> 一个面向 Pokémon Champions 双打环境的队伍构筑与实战对位计算器，支持截图导入、热门配招聚合、速度线比较和伤害 / 击杀概率分析。

### 3.1 核心用户

- 打 Ranked 的普通构筑玩家
- 抄队后想快速理解速度线和对位的人
- VGC / Champions 内容创作者
- 想在比赛前整理 matchup notes 的高强度玩家

### 3.2 核心使用场景

- 我把自己队伍截图上传，快速转成可编辑配置
- 我点开自己的 `Garchomp`，右侧直接看到 `Incineroar / Whimsicott / Sinistcha / Charizard` 等热门对手
- 我切换对手的几种热门 set，立即看我方 `Earthquake / Dragon Claw / Rock Slide` 的伤害与击杀概率
- 我改一下自己的努力 / 性格 / 道具，速度线和伤害结果实时变化
- 我保存一个“对当前环境的准备版本”链接，后续继续改

## 4. 页面设计

## 4.1 总布局

推荐三栏式桌面布局，移动端降成上下两层。

### 左栏：我的队伍

模块：

- 队伍导入
- 六只宝可梦列表
- 选中宝可梦详情编辑器

导入方式：

- `截图上传`
- `粘贴 Showdown 文本`
- `手动创建`
- 后续可加 `从分享链接导入`

每只宝可梦卡片展示：

- 头像 / 名称
- 属性 / 特性 / 道具
- 四招
- 速度实数
- 当前推荐标签：`顺风线` `围巾线` `TR线` `Mega后速度` 等

### 中栏：对位与计算结果

这是产品核心区。

顶部：

- 当前选中：`我方宝可梦 A vs 对手宝可梦 B`
- 场地开关：天气、场地、顺风、戏法空间、威吓、强化等级、屏障

中部两个标签页：

- `速度线`
- `伤害计算`

速度线区显示：

- 我方当前速度值
- Mega 前 / 后速度
- 在顺风 / 戏法空间下的相对先后手
- 比对手快多少点 / 慢多少点
- 击败目标线所需的最小努力或性格调整

伤害区显示：

- 我方每个招式打对手当前 set 的伤害区间
- 百分比伤害
- `guaranteed OHKO / high chance OHKO / guaranteed 2HKO` 等标签
- 双打分摊伤害、天气、威吓、道具、特性修正后的结果
- 反向伤害：对手最常见招式打我方的承伤结果

### 右栏：热门对手面板

分成三块：

- `热门对手`
- `常见配招`
- `环境备注`

热门对手排序建议：

- 默认按使用率
- 可切换为“对我方威胁度”排序
- 可切换为“速度线相关”排序

点开某个对手后展示：

- 常见 2-4 套 set
- 招式占比
- 道具占比
- 特性占比
- 常见队友
- 常见战术标签：`Intimidate` `Tailwind` `TR` `Sun` `Redirection` `Fake Out`

## 5. 关键交互

## 5.1 截图上传

这个功能是差异化重点，但不要一上来就追求“100% 全自动”。

推荐做成 `半自动识别 + 人工确认`：

1. 用户上传截图
2. 系统识别队伍里的 6 只宝可梦名称
3. 尝试识别道具、招式、性格、努力、特性
4. 给出结构化草稿
5. 用户逐项确认 / 修正
6. 保存为正式队伍

这样能显著降低 OCR 误判带来的挫败感。

### 识别优先级

第一版优先识别：

- 宝可梦名称
- 道具
- 招式
- 特性

第二版再补：

- 性格
- 努力值 / 个体值
- Mega 形态 / 是否携带 Mega Stone

### 支持的截图类型

建议分三类模板：

- 游戏内队伍详情页
- 对战准备界面截图
- Showdown / 网页 builder 截图

因为不同来源 UI 差异大，OCR 前要先做“截图模板分类”。

## 5.2 点击队伍中的宝可梦

点击左侧某只后，右侧不只是列热门宝可梦，而是直接生成该宝可梦的 matchup 工作台：

- `推荐对比对象 Top 8`
- `常见对手 set`
- `我方对这些 set 的输出`
- `这些 set 对我方的输出`
- `谁先手`
- `我方需要多少速度 / 耐久才能达到目标`

### 推荐对比对象算法

综合评分：

`score = usage_weight * 0.45 + threat_weight * 0.35 + synergy_weight * 0.20`

其中：

- `usage_weight`：环境使用率
- `threat_weight`：对我方属性压制、常见招式击杀线、速度压制程度
- `synergy_weight`：该对手与其他热门核心的联动价值

## 5.3 常见配招切换

每只对手宝可梦提供：

- `最常见标准配置`
- `速度型`
- `耐久型`
- `爆发型`
- `功能型 / 支援型`

用户可以：

- 直接点选某个热门 set
- 复制成自定义 set 再微调
- 锁定某个对手 set 与多个我方成员轮流比较

## 6. 数据设计

## 6.1 你需要的核心数据表

### `pokemon_species`

- `id`
- `name_zh`
- `name_en`
- `types`
- `base_stats`
- `abilities`
- `learnset`
- `legal_regulations`
- `mega_forms`

### `format_snapshots`

- `format_id`
- `format_name`
- `regulation`
- `battle_type`
- `effective_from`
- `effective_to`
- `rule_flags` 例如 mega / item restrictions / available dex

### `usage_stats`

- `format_id`
- `species_id`
- `usage_percent`
- `raw_count`
- `source`
- `sample_date`

### `common_sets`

- `id`
- `format_id`
- `species_id`
- `set_name`
- `item`
- `ability`
- `nature`
- `evs`
- `ivs`
- `moves`
- `tera_or_special_flag`
- `usage_percent`
- `source`

### `common_partners`

- `species_id`
- `partner_species_id`
- `co_usage_percent`
- `format_id`

### `damage_cache`

- `attacker_hash`
- `defender_hash`
- `field_hash`
- `move_id`
- `damage_range`
- `ko_text`
- `calc_version`

## 6.2 数据来源建议

优先级建议：

1. `官方规则页面`：决定赛制、模式、Mega、regulation 切换
2. `Pikalytics`：使用率、常见招式、道具、队友
3. `社区队伍站 / 公开比赛队伍`：补充热门 set 模板
4. `官方或 Showdown 兼容数据`：种族值、技能、特性、伤害公式基础数据

注意点：

- 不要把线上页面当实时 API 直接硬抓到前端
- 应该做服务端定时抓取 / 清洗 / 入库
- 所有环境数据都要带 `sample_date` 与 `format_id`
- 前端必须显式显示“数据更新时间”

## 7. 核心算法设计

## 7.1 速度线引擎

输入：

- 宝可梦基础速度
- 等级
- 性格
- IV / EV 或 Champions 的对应训练值
- 特性 / 道具 / Mega
- 场地状态：顺风、戏法空间、降速 / 加速、麻痹等

输出：

- 实际速度
- 经过场地修正后的有效速度
- 与目标对手的先后手关系
- 反推所需最小速度投入

这个模块不能只给结果，要给“推线建议”：

- `当前 148 Spe 可快过无速 Sinistcha`
- `若想顺风下快过极速 Sneasler，需提升到 204 Spe`
- `Mega 后可越过 base 100 中速线`

## 7.2 伤害计算引擎

目标输出：

- 伤害绝对值范围
- 百分比范围
- 击杀概率
- 一确 / 高概率一确 / 稳二确
- 双打 spread 修正后的结果
- 反向承伤

### 结果展示建议

不要只显示一句传统文案，建议同时显示：

- `142-168 (81.6% - 96.5%)`
- `18.8% chance to OHKO after chip`
- `Guaranteed 2HKO`
- `Spread move penalty applied`

## 7.3 热门 set 生成逻辑

不要简单取“最常见四招 + 最常见道具”。

更合理的做法：

- 从真实样本中按组合聚类
- 生成 2-4 个可解释 set archetypes
- 每个 archetype 保持内部一致性

例如 `Incineroar` 不能把：

- `Sitrus Berry` 的耐久 set
- `Shuca Berry` 的抗地面 set
- `Protect` 较高的保护型 set

胡乱拼在一起。

所以建议用：

- move co-occurrence
- item co-occurrence
- EV cluster
- role tags

聚成真正可用的 set 模板。

## 8. 技术方案

## 8.1 前端

推荐：

- `Next.js + React`
- `TypeScript`
- `Zustand` 管理本地队伍状态
- `TanStack Query` 拉取环境数据
- `Tailwind` 或自定义 CSS 组件系统
- `React Hook Form + Zod` 做配置编辑校验

### 前端模块拆分

- `TeamImporter`
- `ScreenshotUpload`
- `OCRReviewPanel`
- `TeamEditor`
- `PokemonCard`
- `MatchupWorkbench`
- `MetaOpponentList`
- `SetSwitcher`
- `SpeedTierPanel`
- `DamagePanel`
- `FieldStateToolbar`

## 8.2 后端

推荐：

- `Node.js / Next.js Route Handlers` 或独立 `NestJS`
- `PostgreSQL`
- `Prisma`
- `Redis` 做计算缓存

### 后端服务拆分

- `meta-ingest-service`：抓取并清洗环境数据
- `set-clustering-service`：生成热门 set
- `calc-service`：伤害与速度线计算
- `ocr-service`：截图解析
- `share-service`：生成分享链接与快照

## 8.3 伤害计算内核

优先建议基于现成可靠内核，而不是自己重写。

选择建议：

- 首选 `@pkmn/dmg`
- 备选 `@smogon/calc`

原因：

- 都是成熟的对战计算生态
- 可扩展出你自己的 UI
- 支持 KO chance 这类关键能力
- 后续如果 Champions 有特化规则，可以在外层做规则覆盖

如果 Champions 的伤害 / 状态 / 规则和传统 Gen9 / Showdown 有差异，就做一层：

- `champions-rules-adapter`
- `champions-data-override`

把差异封装掉，而不是污染前端逻辑。

## 8.4 OCR 与截图识别

建议采用两阶段：

### 第一阶段：模板识别 + 文本提取

- 检测截图类型
- 按模板裁切头像区、名字区、招式区、道具区
- OCR 提取文本

### 第二阶段：语义纠错 + 结构化映射

- 模糊匹配宝可梦名
- 模糊匹配招式 / 道具 / 特性
- 根据 learnset 和合法性做自动修正
- 输出置信度

例如：

- OCR 识别成 `Whimscot` 时自动纠正到 `Whimsicott`
- 识别到不合法招式组合时提示用户确认

### UX 要点

- 每个字段显示置信度
- 低置信度字段高亮
- 允许一键“应用热门模板”补全缺失项

## 9. MVP 范围

第一版不要做太满，建议 MVP 只做这些：

### MVP 必做

- 手动创建队伍
- Showdown 文本导入
- 选中我方宝可梦后显示热门对手 Top 8
- 对手常见 2-3 套配置切换
- 速度线计算
- 伤害范围与 KO 概率
- 基础场地开关
- 分享链接

### MVP 暂缓

- 全自动截图识别
- 多截图批量导入
- 社区上传队伍
- 对局笔记系统
- AI 自动推荐“最佳 4 只 bring”

### V1.1 再做

- 截图 OCR 导入
- 识别后人工确认
- 热门核心 / archetype 视图
- 承伤优化建议

### V1.2 再做

- 自动建议速度线
- 自动建议 EV 微调
- 赛前 matchup note 生成
- BO3 ban/pick 备忘

## 10. 你这个产品最容易踩的坑

### 坑 1：把它做成“另一个静态 damage calc”

如果只是左右两边手填数据，那和已有工具差异不够大。

你的优势应该是：

- 环境感知
- 热门对手聚合
- 常见 set 切换
- 对位导向
- 截图导入

### 坑 2：截图识别一开始就追求全自动

这会把开发难度直接拉满。

正确做法是：

- 先做 Showdown paste 导入
- 再做半自动 OCR
- 最后才追求高准确率自动补全

### 坑 3：热门 set 逻辑不真实

玩家最敏感的就是“这套根本没人这么配”。

所以 set 必须来自真实样本聚类，而不是字段拼装。

### 坑 4：没有版本概念

Champions 的 regulation 会轮换。

如果你的页面不强调：

- 当前赛制
- 数据采样日期
- 数据来源

用户会很快失去信任。

## 11. 推荐的首个版本信息架构

### 首页

- 当前环境概览
- 进入队伍构筑
- 最近热门对手
- 数据更新时间

### Builder 页面

- 左：我的队伍
- 中：对位计算
- 右：环境热门与常见配置

### Meta 页面

- 热门宝可梦榜
- 热门核心榜
- 各宝可梦常见 set

### Team Share 页面

- 保存的队伍
- 导入历史
- 分享链接

## 12. 我建议你现在就这样做

如果我们按最稳的路径推进，开发顺序建议是：

1. 先做 `Builder + Matchup Workbench` 主界面
2. 接入 `Showdown paste` 导入
3. 接入 `热门对手 + 常见 set` 数据
4. 接入 `速度线 + 伤害计算`
5. 最后再做 `截图 OCR`

这是因为：

- 只要第 1 到第 4 步完成，产品已经有可用价值
- OCR 只是输入效率增强，不是最小价值闭环

## 13. 可直接开工的技术拆解

### 前端任务

- 搭建三栏 builder 布局
- 队伍状态模型
- 宝可梦配置编辑弹层
- 热门对手列表组件
- 速度线面板
- 伤害结果面板

### 后端任务

- species / moves / items 基础数据入库
- meta stats 抓取与定时更新
- 热门 set 聚类脚本
- calc API
- 分享链接 API

### OCR 任务

- 截图模板分类
- 区域裁切
- OCR 文本提取
- 名称纠错与合法性校验
- 人工确认 UI

## 14. 我给你的产品判断

这个方向里，最有竞争力的点不是“算得更复杂”，而是：

- 导入更轻松
- 对位更直接
- 环境更新
- 热门 set 更真实
- 速度线建议更实战

如果你愿意，我下一步可以直接继续帮你做两件事里的任意一件：

1. 继续把这份方案细化成 `PRD + 页面线框 + 数据库表结构`
2. 直接在这个项目里给你做一个 `首版前端原型页面`

## 15. 参考来源

- 官方 `Pokémon Champions` 首页：<https://champions.pokemon.com/en-us/>
- 官方 Gameplay 页面：<https://champions.pokemon.com/en-us/gameplay/>
- Pikalytics Champions 总览：<https://www.pikalytics.com/>
- Pikalytics `Incineroar`：<https://www.pikalytics.com/>
- Pikalytics `Sneasler`：<https://www.pikalytics.com/pokedex/championspreview/sneasler>
- Pikalytics `Sinistcha`：<https://www.pikalytics.com/pokedex/championspreview/sinistcha>
- Pikalytics `Whimsicott`：<https://www.pikalytics.com/pokedex/championspreview/Whimsicott>
- Pikalytics `Garchomp`：<https://www.pikalytics.com/pokedex/championspreview/garchomp>
- Pikalytics `Charizard`：<https://www.pikalytics.com/pokedex/championspreview/charizard>
- `@pkmn/dmg`：<https://github.com/pkmn/dmg>
- `@smogon/calc`：<https://github.com/smogon/damage-calc>
- 产品 benchmark `ChampTeams.gg`：<https://champteams.gg/>
- 产品 benchmark `Porygon Labs`：<https://www.porygonlabs.com/>
- 产品 benchmark `PokeCounter`：<https://pokecounter.app/pokedex>
