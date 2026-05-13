import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Block, Task, TaskStatus, TaskPriority } from '@/types'
import { storageService } from '@/services/storageService'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const STORAGE_KEY = 'tasks'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>(storageService.load<Task[]>(STORAGE_KEY) ?? [])

  // 迁移旧数据：没有 workspaceId 的任务归属到默认空间
  const wsStore = useWorkspaceStore()
  let migrated = false
  for (const t of tasks.value) {
    if (!t.workspaceId) {
      t.workspaceId = wsStore.currentId || 'default'
      migrated = true
    }
  }
  if (migrated) {
    storageService.save(STORAGE_KEY, tasks.value)
  }

  const currentTasks = computed(() =>
    tasks.value.filter((t) => t.workspaceId === wsStore.currentId)
  )

  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    for (const task of tasks.value) {
      grouped[task.status].push(task)
    }
    return grouped
  })

  const currentTasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    for (const task of currentTasks.value) {
      grouped[task.status].push(task)
    }
    return grouped
  })

  function addTask(title: string, options?: { priority?: TaskPriority; tags?: string[] }): Task {
    const now = Date.now()
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      priority: options?.priority ?? 'medium',
      tags: options?.tags ?? [],
      blocks: [],
      workspaceId: wsStore.currentId,
      createdAt: now,
      updatedAt: now,
    }
    tasks.value.unshift(task)
    return task
  }

  function updateTask(id: string, patch: Partial<Pick<Task, 'title' | 'priority' | 'tags'>>): void {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    Object.assign(task, patch, { updatedAt: Date.now() })
  }

  function deleteTask(id: string): void {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function changeStatus(id: string, status: TaskStatus): void {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.status = status
      task.updatedAt = Date.now()
    }
  }

  function addBlock(taskId: string, block: Block): void {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.blocks.push(block)
    task.updatedAt = Date.now()
  }

  function updateBlock(taskId: string, blockId: string, patch: Partial<Pick<Block, 'type' | 'content'>>): void {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    const block = task.blocks.find((b) => b.id === blockId)
    if (!block) return
    Object.assign(block, patch)
    task.updatedAt = Date.now()
  }

  function deleteBlock(taskId: string, blockId: string): void {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.blocks = task.blocks.filter((b) => b.id !== blockId)
    task.updatedAt = Date.now()
  }

  function reorderBlocks(taskId: string, ordered: Block[]): void {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.blocks = ordered
    task.updatedAt = Date.now()
  }

  watch(tasks, (val) => {
    storageService.save(STORAGE_KEY, val)
  }, { deep: true })

  return { tasks, currentTasks, tasksByStatus, currentTasksByStatus, addTask, updateTask, deleteTask, changeStatus, addBlock, updateBlock, deleteBlock, reorderBlocks }
})
