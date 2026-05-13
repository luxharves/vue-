# PRD — Smart Knowledge Task System

## 产品定义

基于 Vue3 的前端任务管理系统，通过 Task + Block 数据模型驱动多视图（Kanban / Table / Detail）展示，并具备轻量可扩展 AI 辅助能力。

**本质：一个"数据驱动 UI 的前端系统"，不是 Todo 工具。**

---

## 系统模块

| 模块 | 职责 | 本质 |
|---|---|---|
| Task 系统 | 创建/管理任务、状态流转、标签分类 | 业务层 |
| Block 系统 | 任务内结构化内容（text/todo/code/ai） | 内容结构层 |
| View 系统 | Kanban / Table / Detail 三种视图 | 展示层，同源渲染 |
| AI 扩展层 | 总结/标签生成/任务拆分 | 工具层，不侵入核心 |

## 产品形态

```
左侧 Workspace       中间工作区                  右侧 AI
├─ 项目A            ├─ Kanban (Todo/Doing/Done)   ├─ 总结任务
├─ 项目B            ├─ Table (表格+筛选)          ├─ 拆分步骤
└─ 学习计划         └─ Detail (Block 编辑器)      └─ 优化描述
```

---

## 核心数据模型

```ts
Block {
  id: string
  type: "text" | "todo" | "code" | "image" | "ai"
  content: any
}

Task {
  id: string
  title: string
  status: "todo" | "doing" | "done"
  priority: "low" | "medium" | "high"
  tags: string[]
  blocks: Block[]
  createdAt: number
  updatedAt: number
}

Workspace {
  id: string
  name: string
  tasks: Task[]
}
```

---

## 功能清单

### Workspace 系统
- 创建/重命名/删除/切换 Workspace
- 各 Workspace 任务数据隔离
- 最近访问 Workspace

### Task 系统
- CRUD + 状态流转（todo → doing → done）
- 标签、优先级（low/medium/high）
- 搜索（标题/标签）、筛选（状态/标签/优先级）
- 批量操作（删除/改状态）

### Block 系统
- 类型：text / todo（子任务+勾选）/ code（语法高亮）/ image / ai
- Block 增删改、排序拖拽、类型切换
- 类 Notion 编辑体验

### View 系统
- Kanban：三列 + 拖拽流转 + 卡片展示标签/优先级 + 动画
- Table：列表 + 排序（时间/优先级）+ 筛选 + 快速编辑
- Detail：任务详情 + Block 编辑器 + 实时保存
- 三视图自由切换，数据保持同步

### AI 系统
- 架构：UI → Store → AI Service → 返回 → 更新 Task/Block
- 功能：任务总结、任务拆分、标签生成、Block 内容优化
- AI 可替换模型，服务层独立

### 交互系统
- Kanban 拖拽任务 + Block 排序拖拽
- Undo/Redo（操作历史）
- 快捷键（新增任务、切换视图）

### 持久化
- localStorage（基础）/ IndexedDB（高级）
- 自动保存，刷新不丢

---

## 核心设计原则

1. **数据驱动 UI** — 一份 Task 数据，多种视图渲染
2. **多视图同源** — Kanban / Table / Detail 全部来自同一 Store
3. **Block 化内容** — 任务不等于文本，是可组合内容单元
4. **状态集中管理** — Pinia 统一管理 task / workspace / ui 状态
5. **AI 解耦** — AI 不影响系统结构，作为独立服务层

---

## 路由设计

| 路由 | 视图 | 说明 |
|---|---|---|
| `/` | 重定向到默认 Workspace | — |
| `/workspace/:id` | Kanban（默认视图） | 包含 ViewSwitcher |
| `/workspace/:id/table` | Table | 同一数据表格形式 |
| `/workspace/:id/task/:taskId` | Detail | Block 编辑器 |

---

## 开发分阶段

| 阶段 | 内容 | 产出 |
|---|---|---|
| S1 | 数据模型 + Store + 持久化 | 类型定义、taskStore、storageService |
| S2 | Kanban 视图 | 三列看板 + 拖拽 + CRUD |
| S3 | Table 视图 | 表格 + 排序/筛选 + 视图切换 |
| S4 | Block 系统 + Detail 视图 | Block 编辑器 + 任务详情 |
| S5 | Workspace + UI 整合 | 左侧栏 + 三栏布局 + 空间隔离 |
| S6 | AI Service | AI 总结/标签/拆分 |
