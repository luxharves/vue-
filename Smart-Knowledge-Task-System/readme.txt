项目一句话定义（标准版）

一个基于 Vue3 的前端任务管理系统，通过 Task + Block 数据模型驱动多视图（Kanban / Table / Detail）展示，并具备轻量可扩展 AI 辅助能力。

二、项目本质（核心理解）

这个项目的核心不是“任务工具”，而是：

❗一个“数据驱动 UI 的前端系统”
✔ 本质结构：
同一份 Task 数据
        ↓
不同 UI 视图渲染
        ↓
Kanban / Table / Detail
三、系统构成（真正三大模块）
🧱 1. Task 系统（业务层）

负责：

创建任务
管理状态（todo / doing / done）
标签分类
生命周期管理

👉 本质：任务管理核心数据

📦 2. Block 系统（内容结构层）

Task 内部不是纯文本，而是：

Task
 └── Block[]

Block 类型：

text（文本）
todo（子任务）
code（代码片段）
ai（AI生成内容）

👉 本质：任务内容的结构化表达

🖥️ 3. View 系统（展示层）

同一份 Task 数据，用不同方式展示：

Kanban（看进度流转）
Table（看整体管理）
Detail（看具体内容 Block）

👉 本质：多视图同源渲染

🤖 4. AI 扩展层（辅助能力）

AI 不参与核心逻辑，只做辅助：

总结任务
生成标签
拆分任务步骤

👉 本质：工具层，不是系统层

四、整体产品形态（你最终做出来的样子）
🧭 左侧：Workspace
项目A
项目B
学习计划

👉 切换不同任务空间

🟨 中间：核心工作区（3种模式切换）
1️⃣ Kanban 看板
Todo     Doing     Done
-------------------------
学Vue    写项目    完成Git

👉 管任务流转

2️⃣ Table 表格
任务       状态     标签
学Vue      doing    前端
写项目     todo     实战

👉 管理与筛选

3️⃣ Detail Block 编辑器
任务：学Vue
-------------------
- 学基础语法
- 写demo
- 做总结

👉 写内容 + 知识沉淀

🟩 右侧：AI助手（可选）
总结当前任务
拆分步骤
优化描述
五、核心数据模型（系统灵魂）
✔ Task
Task {
  id: string
  title: string
  status: "todo" | "doing" | "done"
  tags: string[]
  blocks: Block[]
}
✔ Block
Block {
  id: string
  type: "text" | "todo" | "code" | "ai"
  content: any
}
✔ Workspace
Workspace {
  id: string
  name: string
  tasks: Task[]
}
六、核心设计思想（面试重点）
✔ 1. 数据驱动 UI

一份数据，多种展示方式

✔ 2. 多视图同源

Kanban / Table / Detail 全部来自同一 Task

✔ 3. Block 化内容结构

任务不再是文本，而是：

可组合内容单元集合

✔ 4. 状态集中管理（Pinia）
tasks
workspace
ui状态
✔ 5. AI解耦设计

AI 不影响系统结构，只是服务层：

UI → Store → AI Service → 返回结果 → 更新 Task

目标:好，那就按“**完美交付版本（偏作品级，而不是练习级）**”给你一份完整功能清单。你可以把它当成**产品需求文档（PRD）级别目标**。

---

# ⭐ Smart Knowledge Task System（完美版功能清单）

---

# 一、🧭 工作空间系统（Workspace）

## ✔ 功能

* 创建 Workspace（工作空间）
* 重命名 Workspace
* 删除 Workspace
* 切换 Workspace
* Workspace 数据独立隔离

## ✔ 进阶点

* 每个 Workspace 有独立任务集合
* 支持“最近访问 Workspace”

---

# 二、🧱 Task 任务系统（核心）

## ✔ 基础功能

* 创建 Task
* 编辑 Task（标题 / 描述）
* 删除 Task
* 修改状态
* 添加标签 tags
* 设置优先级（low / medium / high）
* 时间字段（创建时间 / 更新时间）

---

## ✔ 状态系统

```text id="task_flow"
todo → doing → done
```

---

## ✔ 进阶功能

* 任务搜索（标题 / 标签）
* 任务筛选（状态 / 标签 / 优先级）
* 批量操作（删除 / 修改状态）

---

# 三、🧠 Block 知识块系统（核心亮点）

## ✔ Block结构（完整版）

```ts id="block_model"
Block {
  id: string
  type: "text" | "todo" | "code" | "image" | "ai"
  content: any
}
```

---

## ✔ Block功能

### 1️⃣ 文本块（text）

* 普通笔记
* 富文本（基础 Markdown）

---

### 2️⃣ Todo块

* 子任务列表
* 勾选完成状态

---

### 3️⃣ 代码块

* 代码高亮
* 语言标识

---

### 4️⃣ AI块（生成内容）

* AI总结
* AI扩展内容
* AI重写

---

### 5️⃣ 图片块（可选增强）

* 图片插入
* 链接支持

---

## ✔ Block编辑能力

* 新增 block
* 删除 block
* block排序（拖拽）
* block类型切换

---

# 四、🖥️ 多视图系统（核心亮点）

---

## ✔ 1. Kanban 看板

### 功能

* 三列：

```text id="kanban"
Todo | Doing | Done
```

* Task拖拽切换状态
* 卡片展示标签 / 优先级
* 动画过渡

---

## ✔ 2. Table 表格视图

### 功能

* 列表展示任务
* 排序（时间 / 优先级）
* 筛选（状态 / 标签）
* 快速编辑

---

## ✔ 3. Detail Block 视图（核心编辑器）

### 功能

* 进入 Task 详情页
* Block编辑系统
* 类 Notion 编辑体验
* 实时保存

---

## ✔ 4. 视图切换系统

* Kanban / Table / Detail 自由切换
* 保持数据同步

---

# 五、⚡ 状态管理系统（Pinia）

---

## ✔ Store设计（完整）

### 1️⃣ taskStore

* tasks[]
* CRUD操作
* 状态流转逻辑

---

### 2️⃣ workspaceStore

* workspace列表
* 当前workspace

---

### 3️⃣ uiStore

* 当前视图（kanban/table/detail）
* modal状态
* loading状态

---

### 4️⃣ blockStore（可选拆分）

* block操作逻辑

---

# 六、🔍 搜索与过滤系统（高级能力）

---

## ✔ 功能

* 全局搜索 Task
* 标签过滤
* 状态过滤
* 优先级过滤

---

# 七、🤖 AI智能系统（高级亮点）

---

## ✔ AI服务层（独立设计）

```text id="ai_arch"
UI → AI Service → 返回结果 → 写入 Task / Block
```

---

## ✔ AI功能

### 1️⃣ Task总结

* 自动总结任务内容

---

### 2️⃣ Task拆分

* 把一个任务拆成子任务

---

### 3️⃣ 标签生成

* 自动生成 tags

---

### 4️⃣ Block优化

* 优化文本表达

---

# 八、🔁 交互系统（高级体验）

---

## ✔ 拖拽系统

* Kanban拖拽任务
* Block排序拖拽

---

## ✔ Undo / Redo（高级）

* 操作历史记录
* 支持撤销 / 重做

---

## ✔ 快捷操作

* 快捷键新增任务
* 快捷键切换视图

---

# 九、💾 数据持久化系统

---

## ✔ 功能

* 自动保存
* 页面刷新不丢数据

---

## ✔ 实现方式

* localStorage（基础）
* IndexedDB（高级）

---

# 十、📐 系统级架构能力（最重要亮点）

---

## ✔ 1. 数据驱动UI

```text id="core_principle"
Task数据 → 多种UI渲染
```

---

## ✔ 2. 组件拆分清晰

* TaskCard
* BlockRenderer
* KanbanColumn
* TableRow

---

## ✔ 3. 服务层隔离

* AIService
* StorageService

---

## ✔ 4. 可扩展设计

* Block可无限扩展类型
* AI可替换模型

---

# 十一、🎯 完整产品形态（最终样子）

---

## 🧭 左侧

* Workspace列表
* 项目切换

---

## 🟨 中间

* Kanban
* Table
* Detail Editor

---

## 🟩 右侧

* AI助手
* Task辅助信息
* 快捷操作

---

# 十二、🔥 这个“完美版”的本质

一句话总结：

> 一个“数据驱动 + Block结构 + 多视图 + AI增强 + 可扩展架构”的前端系统级项目

---

# 十三、你最终做完后，你会具备什么能力？

---

## ✔ Vue工程能力（中级→高级）

* 组件设计
* 状态管理
* 复杂UI拆分

---

## ✔ 前端系统设计能力（核心）

* 数据建模
* UI与数据解耦
* 多视图架构

---

## ✔ 工程化能力

* services层
* store设计
* 模块拆分

---

## ✔ AI应用思维（轻量但关键）

* AI作为工具层
* 不破坏系统结构

---

项目构建流程：
S1：数据模型 + Store
🟢 S2：Kanban（第一个系统闭环）
🟡 S3：Table（第二视图）
🟡 S4：Block系统（核心升级）
🟠 S5：Workspace + UI整合
🔵 S6：AI Service + 扩展能力




