<template>
  <div
    class="kanban-column"
    :class="[`column-${status}`, { 'is-drag-over': dragOver }]"
    @dragover.prevent="onDragOver"
    @dragenter.prevent="onDragEnter"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="column-header">
      <div class="column-title-row">
        <span class="column-dot"></span>
        <h3 class="column-title">{{ statusLabel }}</h3>
        <span class="column-count">{{ tasks.length }}</span>
      </div>
    </div>

    <div class="column-body">
      <div v-if="tasks.length === 0" class="column-empty">
        <p class="empty-text">暂无任务</p>
      </div>
      <TransitionGroup v-else name="card-list" tag="div" class="card-list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task, TaskStatus } from '@/types'
import TaskCard from '@/components/kanban/TaskCard.vue'
import { useTaskStore } from '@/stores/taskStore'

const DRAG_DATA_KEY = 'task-id'

const props = defineProps<{
  status: TaskStatus
  tasks: Task[]
}>()

const taskStore = useTaskStore()
const dragOver = ref(false)
let enterCount = 0

const statusMap: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' }
const statusLabel = computed(() => statusMap[props.status])

function onDragOver(e: DragEvent): void { if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' }
function onDragEnter(): void { enterCount++; dragOver.value = true }
function onDragLeave(): void { enterCount--; if (enterCount <= 0) { enterCount = 0; dragOver.value = false } }
function onDrop(e: DragEvent): void {
  dragOver.value = false; enterCount = 0
  const taskId = e.dataTransfer?.getData(DRAG_DATA_KEY)
  if (!taskId) return
  taskStore.changeStatus(taskId, props.status)
}
</script>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  width: 278px;
  flex-shrink: 0;
  border-radius: 14px;
  background: #f8f9fb;
  max-height: 100%;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.kanban-column.is-drag-over {
  background: #eef1ff;
  box-shadow: inset 0 0 0 2px #5b8def;
}

.column-header {
  padding: 18px 16px 12px;
  flex-shrink: 0;
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-todo .column-dot    { background: #5b8def; }
.column-doing .column-dot   { background: #f5b041; }
.column-done .column-dot    { background: #30a46c; }

.column-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e1e20;
  margin: 0;
  flex: 1;
  letter-spacing: -0.01em;
}

.column-count {
  font-size: 12px;
  font-weight: 500;
  color: #8e8e93;
  background: #ecedf0;
  padding: 1px 9px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

.column-body {
  padding: 0 12px 14px;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  border: 1.5px dashed #e2e4e9;
  border-radius: 10px;
}

.empty-text {
  font-size: 12.5px;
  color: #c0c4cc;
  margin: 0;
}

/* TransitionGroup */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.card-list-leave-active {
  position: absolute;
}
</style>
