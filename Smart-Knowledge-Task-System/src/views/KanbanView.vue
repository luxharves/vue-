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
        <button class="add-btn" @click="handleAdd">
          <span>+</span>
        </button>
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
  padding: 28px 28px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fcfcfd;
}

.view-header {
  flex-shrink: 0;
  margin-bottom: 22px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.view-title {
  font-size: 22px;
  font-weight: 650;
  color: #1e1e20;
  margin: 0;
  letter-spacing: -0.02em;
}

.add-task-bar {
  display: flex;
  gap: 6px;
  max-width: 460px;
}

.task-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #e2e4e9;
  border-radius: 10px;
  font-size: 13.5px;
  color: #1e1e20;
  outline: none;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  letter-spacing: -0.01em;
}

.task-input::placeholder { color: #c5c8cd; }

.task-input:focus {
  border-color: #5b8def;
  box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.12);
}

.add-btn {
  width: 38px; height: 38px;
  border: 1px solid #e2e4e9;
  border-radius: 10px;
  background: #fff;
  color: #8e8e93;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  border-color: #5b8def;
  color: #5b8def;
  background: #f5f8ff;
}

.board {
  display: flex;
  gap: 18px;
  flex: 1;
  overflow: auto;
  align-items: flex-start;
  padding-bottom: 16px;
}
</style>
