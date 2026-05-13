<template>
  <div
    class="task-card"
    :class="[`priority-${task.priority}`, { 'is-dragging': dragging }]"
    draggable="true"
    @click="goDetail"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
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
                :key="opt.value" :command="opt.value"
                :class="`status-option-${opt.value}`"
              >
                <span class="status-dot" :class="`dot-${opt.value}`"></span>
                {{ opt.label }}
              </el-dropdown-item>
              <el-dropdown-item
                v-for="p in availablePriorities"
                :key="`p-${p.value}`" :command="`priority:${p.value}`" divided
              >
                <span class="priority-dot-sm" :class="`dot-p-${p.value}`"></span>
                {{ p.label }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided class="delete-option">
                <el-icon><Delete /></el-icon><span>删除任务</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="card-meta">
        <span class="priority-dot" :class="`p-${task.priority}`"></span>
        <span class="priority-text">{{ priorityLabel }}</span>
        <el-tag
          v-for="tag in task.tags" :key="tag"
          size="small" round class="card-tag"
        >{{ tag }}</el-tag>
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

const props = defineProps<{ task: Task }>()

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
function onDragEnd(): void { dragging.value = false }

const priorityMap: Record<TaskPriority, string> = { high: '高', medium: '中', low: '低' }
const statusMap: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' }
const allStatuses: TaskStatus[] = ['todo', 'doing', 'done']
const allPriorities: TaskPriority[] = ['high', 'medium', 'low']

const availableStatuses = computed(() =>
  allStatuses.filter((s) => s !== props.task.status).map((s) => ({ value: s, label: statusMap[s] }))
)
const availablePriorities = computed(() =>
  allPriorities.filter((p) => p !== props.task.priority).map((p) => ({ value: p, label: priorityMap[p] }))
)
const priorityLabel = computed(() => priorityMap[props.task.priority] ?? props.task.priority)

function handleCommand(cmd: string): void {
  if (cmd === 'delete') { taskStore.deleteTask(props.task.id) }
  else if (cmd.startsWith('priority:')) { taskStore.updateTask(props.task.id, { priority: cmd.replace('priority:', '') as TaskPriority }) }
  else { taskStore.changeStatus(props.task.id, cmd as TaskStatus) }
}

function goDetail(): void { router.push(`/workspace/${route.params.id}/task/${props.task.id}`) }

const formattedDate = computed(() => {
  const d = new Date(props.task.createdAt)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  if (h < 24) return `${h} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})
</script>

<style scoped>
.task-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.02),
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  transition: background 0.2s ease;
}

.priority-high::before  { background: #e5484d; }
.priority-medium::before { background: #f5b041; }
.priority-low::before   { background: #30a46c; }

.task-card:hover {
  border-color: rgba(0, 0, 0, 0.09);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.task-card.is-dragging {
  opacity: 0.35;
  transform: scale(0.97);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.card-body {
  padding: 14px 16px 16px 16px;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 13.5px;
  font-weight: 550;
  color: #1e1e20;
  margin: 0;
  line-height: 1.45;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.01em;
}

.status-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 7px;
  color: #c5c8cd;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
  opacity: 0;
}

.task-card:hover .status-trigger { opacity: 1; }
.status-trigger:hover { background: #f1f3f6; color: #555; }

.card-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

/* Priority — subtle dot + text */
.priority-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot.p-high   { background: #e5484d; }
.priority-dot.p-medium { background: #f5b041; }
.priority-dot.p-low    { background: #30a46c; }

.priority-text {
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
  margin-right: 4px;
}

/* Tags */
.card-tag {
  font-size: 10px !important;
  border-radius: 5px !important;
  padding: 0 8px !important;
  height: 20px !important;
  line-height: 20px !important;
  border: none !important;
  background: #f2f3f5 !important;
  color: #6b6e76 !important;
  font-weight: 500 !important;
}

.card-date {
  font-size: 11px;
  color: #b0b3ba;
  margin: 0;
}

/* Dropdown */
.status-dot, .priority-dot-sm {
  display: inline-block; width: 8px; height: 8px;
  border-radius: 50%; margin-right: 6px; vertical-align: middle;
}
.dot-todo  { background: #5b8def; }
.dot-doing { background: #f5b041; }
.dot-done  { background: #30a46c; }
.dot-p-high   { background: #e5484d; }
.dot-p-medium { background: #f5b041; }
.dot-p-low    { background: #30a46c; }

.delete-option { color: #e5484d !important; }
.delete-option:hover { background: #fef2f2 !important; }
</style>
