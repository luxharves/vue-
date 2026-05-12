<template>
  <div class="table-view">
    <div class="view-header">
      <h2 class="view-title">表格视图</h2>
      <p class="view-desc">
        共 {{ filteredTasks.length }} / {{ taskStore.tasks.length }} 条任务
      </p>
    </div>

    <!-- 搜索与筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索任务标题..."
        clearable
        :prefix-icon="Search"
        class="filter-input"
      />
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        clearable
        class="filter-select"
      >
        <el-option label="待办" value="todo" />
        <el-option label="进行中" value="doing" />
        <el-option label="已完成" value="done" />
      </el-select>
      <el-select
        v-model="priorityFilter"
        placeholder="优先级"
        clearable
        class="filter-select"
      >
        <el-option label="高" value="high" />
        <el-option label="中" value="medium" />
        <el-option label="低" value="low" />
      </el-select>
      <el-button
        v-if="hasFilters"
        size="small"
        text
        @click="clearFilters"
      >清除筛选</el-button>
    </div>

    <el-table
      :data="filteredTasks"
      stripe
      style="width: 100%"
      row-class-name="table-row"
    >
      <!-- 标题（双击编辑） -->
      <el-table-column label="标题" min-width="200">
        <template #default="{ row }">
          <template v-if="editingId === row.id">
            <input
              ref="editInputRef"
              v-model="editTitle"
              class="inline-input"
              @keydown.enter="confirmEdit(row)"
              @keydown.escape="cancelEdit"
              @blur="confirmEdit(row)"
            />
          </template>
          <template v-else>
            <span
              class="title-link"
              @click="handleTitleClick(row)"
            >{{ row.title }}</span>
          </template>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column prop="status" label="状态" width="90" align="center" sortable :sort-method="sortByStatus">
        <template #default="{ row }">
          <span class="status-tag" :class="`status-${row.status}`">
            {{ statusMap[row.status as TaskStatus] }}
          </span>
        </template>
      </el-table-column>

      <!-- 优先级 -->
      <el-table-column prop="priority" label="优先级" width="80" align="center" sortable :sort-method="sortByPriority">
        <template #default="{ row }">
          <span class="priority-cell">
            <span class="priority-dot" :class="`priority-${row.priority}`"></span>
            {{ priorityMap[row.priority as TaskPriority] }}
          </span>
        </template>
      </el-table-column>

      <!-- 标签 -->
      <el-table-column label="标签" width="150">
        <template #default="{ row }">
          <template v-if="row.tags.length">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              round
              class="row-tag"
            >{{ tag }}</el-tag>
          </template>
          <span v-else class="no-data">—</span>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column prop="createdAt" label="创建时间" width="120" align="right" sortable>
        <template #default="{ row }">
          <span class="time-cell">{{ formatDate(row.createdAt) }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="110" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-dropdown trigger="click" @command="(cmd: string) => handleAction(row.id, cmd)">
              <el-button size="small" text>
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="s in otherOptions(row.status, allStatuses)"
                    :key="s"
                    :command="s"
                  >
                    {{ statusMap[s as TaskStatus] }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-for="p in otherOptions(row.priority, allPriorities)"
                    :key="`p-${p}`"
                    :command="`priority:${p}`"
                    divided
                  >
                    {{ priorityMap[p as TaskPriority] }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" text type="danger" @click="handleDelete(row.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, Delete, Search } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const router = useRouter()
const route = useRoute()

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)
let clickTimer: ReturnType<typeof setTimeout> | null = null

// 筛选状态
const searchText = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const hasFilters = computed(() =>
  searchText.value !== '' || statusFilter.value !== '' || priorityFilter.value !== ''
)

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks

  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(kw))
  }

  if (statusFilter.value) {
    tasks = tasks.filter((t) => t.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    tasks = tasks.filter((t) => t.priority === priorityFilter.value)
  }

  return tasks
})

function clearFilters(): void {
  searchText.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
}

const statusMap: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

const priorityMap: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const allStatuses: TaskStatus[] = ['todo', 'doing', 'done']
const allPriorities: TaskPriority[] = ['high', 'medium', 'low']

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
const statusOrder: Record<string, number> = { todo: 1, doing: 2, done: 3 }

function sortByPriority(a: Task, b: Task): number {
  return priorityOrder[a.priority] - priorityOrder[b.priority]
}

function sortByStatus(a: Task, b: Task): number {
  return statusOrder[a.status] - statusOrder[b.status]
}

function otherOptions(current: string, options: readonly string[]): string[] {
  return options.filter((s) => s !== current)
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function handleTitleClick(row: Task): void {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    startEdit(row)
  } else {
    clickTimer = setTimeout(() => {
      clickTimer = null
      goDetail(row.id)
    }, 250)
  }
}

async function startEdit(row: Task): Promise<void> {
  editingId.value = row.id
  editTitle.value = row.title
  await nextTick()
  editInputRef.value?.focus()
}

function confirmEdit(row: Task): void {
  if (editingId.value !== row.id) return
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== row.title) {
    taskStore.updateTask(row.id, { title: newTitle })
  }
  editingId.value = null
}

function cancelEdit(): void {
  editingId.value = null
}

function handleAction(id: string, cmd: string): void {
  if (cmd.startsWith('priority:')) {
    const newPriority = cmd.replace('priority:', '') as TaskPriority
    taskStore.updateTask(id, { priority: newPriority })
  } else {
    taskStore.changeStatus(id, cmd as TaskStatus)
  }
}

async function handleDelete(id: string): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    taskStore.deleteTask(id)
  } catch {
    // 用户点了取消
  }
}

function goDetail(taskId: string): void {
  router.push(`/workspace/${route.params.id}/task/${taskId}`)
}
</script>

<style scoped>
.table-view {
  padding: 24px 28px;
  height: 100%;
  overflow: auto;
}

.view-header {
  margin-bottom: 12px;
}

.view-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.view-desc {
  color: #999;
  font-size: 13px;
  margin: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 120px;
}

/* 标题列 */
.title-link {
  cursor: pointer;
  font-weight: 500;
  color: #1a1a2e;
}

.title-link:hover {
  color: #409eff;
}

.inline-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

/* 状态 */
.status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.status-todo  { background: #e6f0ff; color: #2563eb; }
.status-doing { background: #fef3cd; color: #b45309; }
.status-done  { background: #d4edda; color: #1e7e34; }

/* 优先级 */
.priority-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  font-size: 12px;
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.priority-dot.priority-high   { background: #e74c3c; }
.priority-dot.priority-medium { background: #f39c12; }
.priority-dot.priority-low    { background: #27ae60; }

/* 标签 */
.row-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.no-data {
  color: #ccc;
}

/* 时间 */
.time-cell {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

/* 操作 */
.action-btns {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: center;
}
</style>
