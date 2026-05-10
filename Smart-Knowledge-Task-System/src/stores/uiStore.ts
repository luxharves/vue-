import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ViewType } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const currentView = ref<ViewType>('kanban')
  const selectedTaskId = ref<string | null>(null)//当前又有没有选中task
  const modals = ref({//控制弹窗
    taskForm: false,
    workspaceForm: false,
  })

  function setView(view: ViewType): void {
    currentView.value = view//切换视图
  }

  function selectTask(id: string | null): void {
    selectedTaskId.value = id
  }

  function openModal(name: keyof typeof modals.value): void {
    modals.value[name] = true
  }

  function closeModal(name: keyof typeof modals.value): void {
    modals.value[name] = false
  }//关闭弹窗

  return { currentView, selectedTaskId, modals, setView, selectTask, openModal, closeModal }
})
