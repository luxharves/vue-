import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ViewType } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const currentView = ref<ViewType>('kanban')
  const selectedTaskId = ref<string | null>(null)
  const modals = ref({
    taskForm: false,
    workspaceForm: false,
  })

  function setView(view: ViewType): void {
    currentView.value = view
  }

  function selectTask(id: string | null): void {
    selectedTaskId.value = id
  }

  function openModal(name: keyof typeof modals.value): void {
    modals.value[name] = true
  }

  function closeModal(name: keyof typeof modals.value): void {
    modals.value[name] = false
  }

  return { currentView, selectedTaskId, modals, setView, selectTask, openModal, closeModal }
})
