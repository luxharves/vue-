<template>
  <div class="kanban-view">
    <div class="view-header">
      <div class="header-top">
        <h2 class="view-title">看板</h2>
        <ViewSwitcher />
      </div>
      <div class="add-task-bar">
        <input
          ref="inputRef"
          v-model="newTitle"
          type="text"
          class="task-input"
          placeholder="输入任务标题，回车新建..."
          @keydown.enter="handleAdd"
        />
        <button class="add-btn" @click="handleAdd">+</button>
      </div>
    </div>
    <div class="board">
      <KanbanColumn
        v-for="status in statuses"
        :key="status"
        :status="status"
        :tasks="taskStore.currentTasksByStatus[status]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/taskStore'
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import ViewSwitcher from '@/components/common/ViewSwitcher.vue'

const taskStore = useTaskStore()

const statuses: TaskStatus[] = ['todo', 'doing', 'done']

const newTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleAdd(): void {
  const title = newTitle.value.trim()
  if (!title) return
  taskStore.addTask(title)
  newTitle.value = ''
  inputRef.value?.focus()
}
</script>

<style scoped>
.kanban-view {
  padding: 24px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.view-header {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.view-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.add-task-bar {
  display: flex;
  gap: 8px;
  max-width: 400px;
}

.task-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d5d8e0;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;
}

.task-input::placeholder {
  color: #bbb;
}

.task-input:focus {
  border-color: #409eff;
}

.add-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #409eff;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.add-btn:hover {
  background: #337ecc;
}

.board {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow: auto;
  align-items: flex-start;
  padding-bottom: 16px;
}
</style>
