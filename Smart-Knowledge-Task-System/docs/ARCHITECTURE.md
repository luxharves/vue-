# ARCHITECTURE — Smart Knowledge Task System

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vue 3.5 + TypeScript 6.0 |
| 状态管理 | Pinia 3.0（setup store 语法） |
| 路由 | Vue Router 5.0（history 模式） |
| 构建 | Vite 8.0 |
| UI 库 | Element Plus |
| 图标 | @element-plus/icons-vue |
| 持久化 | localStorage（通过 storageService 抽象） |

## 目录结构

```
src/
├── types/           # TypeScript 类型定义
│   └── index.ts     # Task / Block / Workspace 接口
├── stores/          # Pinia Store
│   ├── taskStore.ts
│   ├── workspaceStore.ts
│   └── uiStore.ts
├── services/        # 服务层（不依赖 Vue）
│   ├── storageService.ts   # 持久化抽象
│   └── aiService.ts        # AI 调用封装
├── views/           # 路由级视图
│   ├── KanbanView.vue
│   ├── TableView.vue
│   └── DetailView.vue
├── components/      # 可复用组件
│   ├── kanban/
│   ├── table/
│   ├── block/
│   └── common/
├── router/
│   └── index.ts
├── App.vue
└── main.ts
```

## 数据流

```
localStorage ──→ storageService ──→ Store (Pinia) ──→ View
                   ↑                    │
                   └── $subscribe ──────┘ (自动持久化)

┌──────────┐    ┌──────────┐    ┌──────────────┐
│  Kanban   │    │  Table   │    │   Detail     │
│  View     │    │  View    │    │   View       │
└─────┬─────┘    └─────┬────┘    └──────┬───────┘
      │                │                │
      └────────────────┼────────────────┘
                       │
              同一份 taskStore.tasks
```

## Store 设计

### taskStore
- `tasks: Ref<Task[]>` — 当前 workspace 的任务列表
- `tasksByStatus: Computed` — 按 todo/doing/done 分组
- `addTask()` / `updateTask()` / `deleteTask()` / `changeStatus()`
- `$subscribe` → storageService.save 自动持久化

### workspaceStore
- `workspaces: Ref<Workspace[]>` — 所有工作空间
- `currentId: Ref<string>` — 当前激活的 workspace
- `currentWorkspace: Computed` — 当前 workspace 对象
- `addWorkspace()` / `deleteWorkspace()` / `switchWorkspace()`

### uiStore
- `currentView: Ref<'kanban' | 'table' | 'detail'>`
- `selectedTaskId: Ref<string | null>`
- `modals: Ref<{...}>` — 各弹窗开关状态

## 路由设计

```
/                                    → redirect to /workspace/default
/workspace/:id                       → KanbanView (默认视图)
/workspace/:id/table                 → TableView
/workspace/:id/task/:taskId          → DetailView (Block 编辑器)
```

## 组件树（目标）

```
App.vue
├── WorkspaceSidebar.vue        # 左侧：空间列表 + 切换
├── ViewContainer.vue           # 中间：视图切换器 + 视图渲染
│   ├── KanbanView.vue
│   │   ├── KanbanColumn.vue    # Todo / Doing / Done 列
│   │   └── TaskCard.vue        # 单个任务卡片
│   ├── TableView.vue
│   │   └── TaskRow.vue
│   └── DetailView.vue
│       ├── TaskEditor.vue
│       └── BlockRenderer.vue   # 根据 Block type 动态渲染
└── AIPanel.vue                 # 右侧：AI 助手
```

## 设计决策

| 决策 | 原因 |
|---|---|
| Types 单文件 | 三个接口总行数 < 40，拆文件徒增 import 噪音 |
| storageService 独立 | 未来换 IndexedDB 时 Store 代码零修改 |
| $subscribe 持久化 | 数据量小，无需防抖；Pinia 原生支持，零依赖 |
| setup store 语法 | 项目已选用，组合式 API 风格统一 |
| Element Plus | 弹窗/表单/图标等通用 UI 由 Element Plus 兜底 |
| frontend-design (S2+) | 看板核心视觉（卡片/列/拖拽动画）调用 frontend-design 产出，Element Plus 负责表单弹窗；看板是系统门面，值得花设计功夫 |
