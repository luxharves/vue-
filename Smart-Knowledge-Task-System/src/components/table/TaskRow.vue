<template>
  <div class="task-row">
    <!-- 标题：双击可编辑 -->
    <div class="row-cell cell-title">
      <template v-if="editing">
        <input
          ref="editInputRef"
          v-model="editTitle"
          class="inline-input"
          @keydown.enter="confirmEdit"
          @keydown.escape="cancelEdit"
          @blur="confirmEdit"
        />
      </template>
      <template v-else>
        <span class="title-text" @dblclick="startEdit">{{ task.title }}</span>
      </template>
    </div>

    <!-- 状态 -->
    <div class="row-cell cell-status">
      <span class="status-tag" :class="`status-${task.status}`">
        {{ statusLabel }}
      </span>
    </div>

    <!-- 优先级 -->
    <div class="row-cell cell-priority">
      <span class="priority-dot" :class="`priority-${task.priority}`"></span>
      {{ priorityLabel }}
    </div>

    <!-- 标签 -->
    <div class="row-cell cell-tags">
      <template v-if="task.tags.length">
        <el-tag
          v-for="tag in task.tags"
          :key="tag"
          size="small"
          round
        >{{ tag }}</el-tag>
      </template>
      <span v-else class="no-tags">—</span>
    </div>

    <!-- 时间 -->
    <div class="row-cell cell-date">{{ formattedDate }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps<{
  task: Task
}>()

const taskStore = useTaskStore()

const editing = ref(false)
const editTitle = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

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

const statusLabel = computed(() => statusMap[props.task.status])
const priorityLabel = computed(() => priorityMap[props.task.priority])

const formattedDate = computed(() => {
  const d = new Date(props.task.createdAt)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
})

async function startEdit(): Promise<void> {
  editTitle.value = props.task.title
  editing.value = true
  await nextTick()
  editInputRef.value?.focus()
}

function confirmEdit(): void {
  if (!editing.value) return
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.task.title) {
    taskStore.updateTask(props.task.id, { title: newTitle })
  }
  editing.value = false
}

function cancelEdit(): void {
  editing.value = false
  editTitle.value = props.task.title
}
</script>

<style scoped>
.task-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.12s;
}

.task-row:hover {
  background: #f8f9fb;
}

.row-cell {
  flex-shrink: 0;
  font-size: 13px;
  color: #333;
}

.cell-title {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.title-text {
  cursor: default;
  font-weight: 500;
  color: #1a1a2e;
  word-break: break-word;
}

.inline-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.cell-status {
  width: 80px;
  text-align: center;
}

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

.cell-priority {
  width: 72px;
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

.cell-tags {
  width: 130px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.no-tags {
  color: #ccc;
}

.cell-date {
  width: 100px;
  text-align: right;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}
</style>
