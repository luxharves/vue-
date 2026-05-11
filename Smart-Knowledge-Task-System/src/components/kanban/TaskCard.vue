<template>
  <div
    class="task-card"
    :class="[`priority-${task.priority}`, { 'is-dragging': dragging }]"
    draggable="true"
    @click="goDetail"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="card-accent"></div>
    <div class="card-body">
      <div class="card-top">
        <h3 class="card-title">{{ task.title }}</h3>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="status-trigger" @click.stop>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="opt in availableStatuses"
                :key="opt.value"
                :command="opt.value"
                :class="`status-option-${opt.value}`"
              >
                <span class="status-dot" :class="`dot-${opt.value}`"></span>
                {{ opt.label }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided class="delete-option">
                <el-icon><Delete /></el-icon>
                <span>删除任务</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="card-meta">
        <span class="priority-badge" :class="`priority-${task.priority}`">
          {{ priorityLabel }}
        </span>
        <el-tag
          v-for="tag in task.tags"
          :key="tag"
          size="small"
          round
          class="card-tag"
        >
          {{ tag }}
        </el-tag>
      </div>
      <p class="card-date">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, Delete } from '@element-plus/icons-vue'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/taskStore'

const DRAG_DATA_KEY = 'task-id'

const props = defineProps<{
  task: Task
}>()

const taskStore = useTaskStore()
const router = useRouter()
const route = useRoute()

const dragging = ref(false)

function onDragStart(e: DragEvent): void {
  if (!e.dataTransfer) return
  e.dataTransfer.setData(DRAG_DATA_KEY, props.task.id)
  e.dataTransfer.effectAllowed = 'move'
  dragging.value = true
}

function onDragEnd(): void {
  dragging.value = false
}

const priorityMap: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const statusMap: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

const allStatuses: TaskStatus[] = ['todo', 'doing', 'done']

const availableStatuses = computed(() =>
  allStatuses
    .filter((s) => s !== props.task.status)
    .map((s) => ({ value: s, label: statusMap[s] }))
)

const priorityLabel = computed(() => priorityMap[props.task.priority] ?? props.task.priority)

function handleCommand(cmd: string): void {
  if (cmd === 'delete') {
    taskStore.deleteTask(props.task.id)
  } else {
    taskStore.changeStatus(props.task.id, cmd as TaskStatus)
  }
}

function goDetail(): void {
  router.push(`/workspace/${route.params.id}/task/${props.task.id}`)
}

const formattedDate = computed(() => {
  const d = new Date(props.task.createdAt)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})
</script>

<style scoped>
.task-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.task-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.task-card.is-dragging {
  opacity: 0.4;
  transform: rotate(2deg) scale(0.97);
}

.card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 10px 0 0 10px;
}

.priority-high .card-accent   { background: #e74c3c; }
.priority-medium .card-accent { background: #f39c12; }
.priority-low .card-accent    { background: #27ae60; }

.card-body {
  padding: 12px 16px 12px 16px;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.status-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: #bbb;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.status-trigger:hover {
  background: #edf0f4;
  color: #666;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.priority-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.priority-badge.priority-high   { background: #fde8e8; color: #c0392b; }
.priority-badge.priority-medium { background: #fef3cd; color: #b45309; }
.priority-badge.priority-low    { background: #d4edda; color: #1e7e34; }

.card-tag {
  font-size: 11px !important;
}

.card-date {
  font-size: 11px;
  color: #aaa;
  margin: 0;
}

/* Status dropdown */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.dot-todo  { background: #4a90d9; }
.dot-doing { background: #f39c12; }
.dot-done  { background: #27ae60; }

/* Delete option */
.delete-option {
  color: #e74c3c !important;
}

.delete-option:hover {
  background: #fde8e8 !important;
}
</style>
