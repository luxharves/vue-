//实际上这个包含了两件事，一个是task的crud，另外一个是task的状态管理，且task是跨组件的核心业务数据

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Block, Task, TaskStatus, TaskPriority } from '@/types'
import { storageService } from '@/services/storageService'

const STORAGE_KEY = 'tasks'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>(storageService.load<Task[]>(STORAGE_KEY) ?? [])
//这里是从localStorage中加载之前保存的任务数据，如果没有数据则初始化为空数组
  const tasksByStatus = computed(() => {//派生出去变成todo,doing,done三个数组，方便后续在不同组件中使用
    const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    for (const task of tasks.value) {
      grouped[task.status].push(task)
    }
    return grouped
  })

  function addTask(title: string, options?: { priority?: TaskPriority; tags?: string[] }): Task {
    const now = Date.now()//生成了时间戳
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      priority: options?.priority ?? 'medium',
      tags: options?.tags ?? [],
      blocks: [],
      createdAt: now,
      updatedAt: now,
    }
    tasks.value.unshift(task)//最上方unshift
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
      task.updatedAt = Date.now()//更新时间
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

  watch(tasks, (val) => {//持久化watch监听tasks的变化，每当tasks发生变化时，就会调用storageService.save方法将最新的tasks数据保存到localStorage中，这样即使刷新页面，之前的任务数据也不会丢失。
    storageService.save(STORAGE_KEY, val)
  }, { deep: true })

  return { tasks, tasksByStatus, addTask, updateTask, deleteTask, changeStatus, addBlock, updateBlock, deleteBlock, reorderBlocks }
})
