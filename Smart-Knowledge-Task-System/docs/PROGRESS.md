# PROGRESS — Smart Knowledge Task System

## 当前阶段

**S6 — AI Service**（进行中）

## 阶段进度

| 阶段 | 状态 | 完成日期 |
|---|---|---|
| S1: 数据模型 + Store | ✅ 已完成 | 2026-05-10 |
| S2: Kanban 视图 | ✅ 已完成 | 2026-05-11 |
| S3: Table 视图 | ✅ 已完成 | 2026-05-12 |
| S4: Block + Detail | ✅ 已完成 | 2026-05-12 |
| S5: Workspace + UI | ✅ 已完成 | 2026-05-13 |
| S6: AI Service | ✅ 已完成 | 2026-05-13 |

## S1 任务清单

- [x] 创建 `src/types/index.ts` — Task / Block / Workspace 接口
  - **验收**：`npm run type-check` 无报错 ✅ (2026-05-10)
- [x] 创建 `src/services/storageService.ts` — localStorage 抽象层
  - **验收**：console 调 `save('k', {a:1})` → 刷新 → `load('k')` 返回 `{a:1}` ✅ (2026-05-10)
- [x] 创建 `src/stores/taskStore.ts` — 任务 CRUD + $subscribe 持久化
  - **验收**：addTask → tasks 长度 +1 → 刷新不丢 → changeStatus 状态改对 → deleteTask 消失 ✅ (2026-05-10)
- [x] 创建 `src/stores/uiStore.ts` — 当前视图、选中任务等 UI 状态
  - **验收**：切换 `currentView = 'table'`，值正确响应 ✅ (2026-05-10)

## S2 任务清单

> **设计策略**: 看板核心视觉（卡片/列/拖拽动画）使用 frontend-design 产出，弹窗/表单用 Element Plus 兜底。

- [x] 搭建路由 + App 布局壳
  - **验收**：访问首页不再显示 demo，路由正常跳转至 KanbanView ✅ (2026-05-11)
- [x] 创建 TaskCard 组件
  - **验收**：传 mock Task 数据，卡片正确渲染 title / priority 色标 / tags ✅ (2026-05-11)
- [x] 创建 KanbanColumn 组件
  - **验收**：三列分别渲染 Todo / Doing / Done，计数正确，空列显示占位提示 ✅ (2026-05-11)
- [x] 创建 KanbanView + 接入 Store
  - **验收**：数据来自 `taskStore.tasksByStatus`，顶部输入框回车可新增任务 ✅ (2026-05-11)
- [x] 状态切换（下拉菜单）
  - **验收**：卡片上切换状态 → `changeStatus` 生效 → 列更新 → 刷新不丢 ✅ (2026-05-11)
- [x] 卡片交互（删除 + 跳转 Detail）
  - **验收**：点删除 → 卡片消失；点卡片 → 跳转 `/workspace/:id/task/:taskId`
- [x] 拖拽流转（可选）
  - **验收**：卡片从一列拖到另一列 → 状态自动更新

## S3 任务清单

> **设计策略**: Table 视图用 Element Plus el-table 做主框架，筛选/排序/搜索栏放在表格上方，样式简洁对齐看板风格。

- [x] 创建 TaskRow 组件
  - **验收**：传 mock Task 数据，行内正确渲染 title / status 色标 / priority / tags / 时间，支持双击行内编辑标题（回车保存，Esc 取消）
- [x] 创建 TableView + 接入 Store
  - **验收**：el-table 渲染 `taskStore.tasks`，列：标题、状态、优先级、标签、创建时间、操作；数据来自 Store 而非 mock
- [x] 搜索与筛选
  - **验收**：顶栏有搜索框（按标题）+ 状态筛选下拉 + 优先级筛选下拉，三个条件可组合生效
- [x] 排序
  - **验收**：点击表头按创建时间 / 优先级升序降序排序，表头有小箭头指示排序方向 ✅ (2026-05-12)
- [x] 行操作（状态切换 + 删除 + 跳转 Detail）
  - **验收**：行内可改状态、删除任务（有确认弹窗）、点击标题跳转 Detail 页 ✅ (2026-05-12)

## S4 任务清单

> **设计策略**: Block 编辑器采用类 Notion 逐块编辑体验——点击 Block 切换为编辑态，Enter 末尾新建 Block，删除自动聚焦下一个。先从 text 类型打地基，再扩展 todo/code/image/ai。

- [x] 创建 DetailView 页面壳
  - **验收**：从看板/表格点任务进入 Detail，正确显示标题/状态/优先级/标签，可编辑标题和属性，数据来自 taskStore ✅ (2026-05-12)
- [x] Text Block 系统
  - **验收**：支持新增 text Block、点击编辑内容、Enter 自动在下方创建新 Block、Backspace 空行删除 Block，编辑态切换流畅 ✅ (2026-05-12)
- [x] Todo + Code + Image + AI Block
  - **验收**：todo Block 可勾选/取消勾选；code Block 有 monospace 样式；image Block 显示图片 URL；ai Block 显示 AI 标记占位 ✅ (2026-05-12)
- [x] Block 类型切换 + 拖拽排序
  - **验收**：任意 Block 可切换类型；拖拽 Block 重新排序；刷新不丢 ✅ (2026-05-12)

## S5 任务清单

> **设计策略**: Task 加 workspaceId 实现空间隔离，保持 taskStore 扁平结构不重构。侧边栏用右键菜单管理空间（重命名/删除），底部加新增按钮。视图切换器放在顶部导航栏。

- [x] workspaceStore + Task 改造
  - **验收**：创建 workspaceStore 含 CRUD + 持久化；Task 上加 workspaceId；新建任务自动绑定当前空间；切换空间后看板/表格只显示当前空间任务 ✅ (2026-05-13)
- [x] 动态 WorkspaceSidebar
  - **验收**：左侧栏列出所有空间，高亮当前空间，点击切换；右键菜单可重命名/删除；底部有新建按钮
- [x] 视图切换器
  - **验收**：在看板和表格页顶部有切换按钮，点击切换视图，不丢空间上下文

## S6 任务清单

> **设计策略**: OpenAI 兼容 API 直调，API Key 存 localStorage。AI 功能入口放在 DetailView。每个 AI 操作独立请求，返回结果直接写入 Task/Block。

- [x] AI Service 层 + 配置 UI
  - **验收**：创建 aiService 抽象模型调用（OpenAI 兼容）；侧边栏加设置入口可配 API Key / 模型 / Base URL；配置持久化 ✅ (2026-05-13)
- [x] AI 总结 + 标签生成
  - **验收**：Detail 页"AI 总结"按钮→调 AI 生成摘要写入 ai Block；"生成标签"按钮→AI 返回标签写回 Task.tags ✅ (2026-05-13)
- [x] 内容优化 + AI Block 集成
  - **验收**：text/todo Block 加"优化"按钮→AI 润色文字；ai Block 输入 prompt 调 AI 生成内容 ✅ (2026-05-13)

## 阻塞

无
