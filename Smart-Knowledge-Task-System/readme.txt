⭐ Smart Knowledge Task System（智能任务 + 知识块系统）
二、项目一句话定义

一个基于 Vue3 的“任务 + 知识块统一管理系统”，通过 Block 数据结构驱动多视图展示，并提供轻量 AI 增强能力。

三、项目本质（非常重要）

这个项目不是普通 ToDo，而是三合一系统：

🧱 1. 任务系统（执行层）

管理“做什么”

📚 2. 知识块系统（沉淀层）

管理“记录什么”

🤖 3. AI增强层（辅助层）

帮助“总结 / 分类 / 提示”

四、整体产品形态（你最终会做出来的东西）
🧭 左侧：工作空间（Workspace）
项目A
项目B
归档
📌 中间：核心工作区（可切换）
1️⃣ Kanban 看板
Todo | Doing | Done

任务拖拽流转

2️⃣ Table 表格

类似 Excel

筛选
排序
批量管理
3️⃣ Block 编辑器（核心亮点）

类似 Notion：

文本块
todo块
code块
AI生成块
🤖 右侧：AI助手（轻量）
总结任务
生成标签
优化描述
五、核心数据模型（系统灵魂）
1️⃣ Task（任务）
Task {
  id: string
  title: string
  status: "todo" | "doing" | "done"
  tags: string[]
  blocks: Block[]
  createdAt: number
  updatedAt: number
}
2️⃣ Block（知识块核心）
Block {
  id: string
  type: "text" | "todo" | "code" | "ai"
  content: any
}
3️⃣ Workspace（空间）
Workspace {
  id: string
  name: string
  tasks: Task[]
}
六、系统架构（前端工程结构）
src/
 ├── components/
 │    ├── kanban/
 │    ├── table/
 │    ├── block/
 │    └── ai/
 │
 ├── views/
 │    ├── KanbanView.vue
 │    ├── TableView.vue
 │    └── BlockView.vue
 │
 ├── stores/ (Pinia)
 │    ├── taskStore.ts
 │    ├── workspaceStore.ts
 │    └── uiStore.ts
 │
 ├── services/
 │    └── aiService.ts
 │
 ├── types/
 └── utils/
七、核心设计思想（面试重点）
✔ 1. 数据驱动 UI

同一份数据 → 多种展示方式

Task data → Kanban / Table / Block
✔ 2. Block化结构（关键升级点）

任务不只是文本，而是：

一个可组合内容系统

✔ 3. 状态集中管理（Pinia）

所有状态统一管理：

tasks
workspace
ui状态
✔ 4. AI作为“工具层”，不是核心逻辑
UI → Pinia → AIService → 返回结果 → 写回数据
八、核心功能拆解（你要做的东西）
🟢 Phase 1（MVP - 必做）
✔ Task系统
新增任务
修改状态
删除任务
✔ Kanban视图
todo / doing / done
点击移动
✔ Pinia状态管理
tasks统一存储

👉 目标：能跑起来

🟡 Phase 2（进阶）
✔ 拖拽功能
Vue Draggable
✔ Table视图
列表展示
筛选功能
✔ Block系统（简化版）
blocks: string[]
🔵 Phase 3（高级）
✔ Block升级结构
text / todo / code / ai
✔ 多视图切换
Kanban
Table
Block
✔ AI接入（轻量）
标签推荐
任务总结
九、这个项目的“面试价值点”

你可以讲这些：

⭐ 1. 数据模型设计
Task + Block结构设计
⭐ 2. 多视图架构
同一数据多种UI渲染
⭐ 3. 状态管理设计
Pinia模块化拆分
⭐ 4. 组件拆分能力
TaskCard / BlockRenderer / ViewContainer
⭐ 5. AI解耦设计
AIService独立层
十、这个项目的本质价值
❗不是“做一个工具”

而是：

✔ 用 Vue 做一个“可扩展的前端系统模型”

十一、最终你会学到什么
✔ 基础前端
Vue3响应式
组件通信
DOM事件
✔ 进阶前端
架构设计
数据驱动UI
状态管理
拖拽系统
✔ 工程能力
模块拆分
服务层设计
系统设计思维
✔ AI思维（轻量）
AI不是功能，是工具层
数据 → AI → 回写系统
十二、最关键一句话总结

这个项目本质是：用 Block 数据模型驱动的多视图任务与知识管理系统，并通过轻量 AI 增强能力。

十三、下一步建议（很重要）

你现在不要急着写代码，下一步应该是：

👉 先做“第一版工程结构设计”

包括：

Vue项目结构
Pinia设计
Kanban怎么实现
Block怎么简化