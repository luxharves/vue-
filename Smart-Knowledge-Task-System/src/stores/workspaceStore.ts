import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { storageService } from '@/services/storageService'

interface WsItem {
  id: string
  name: string
  updatedAt: number
}

const WS_KEY = 'workspaces'
const CURRENT_KEY = 'current-workspace'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<WsItem[]>(storageService.load<WsItem[]>(WS_KEY) ?? [])
  const currentId = ref<string>(storageService.load<string>(CURRENT_KEY) ?? '')

  // 首次启动，没有任何空间时自动创建默认空间
  if (workspaces.value.length === 0) {
    const now = Date.now()
    const defaultWs: WsItem = { id: 'default', name: '默认空间', updatedAt: now }
    workspaces.value = [defaultWs]
    currentId.value = 'default'
  }

  if (!currentId.value || !workspaces.value.find((w) => w.id === currentId.value)) {
    currentId.value = workspaces.value[0].id
  }

  const currentWorkspace = computed(() =>
    workspaces.value.find((w) => w.id === currentId.value) ?? workspaces.value[0]
  )

  function addWorkspace(name: string): WsItem {
    const ws: WsItem = {
      id: crypto.randomUUID(),
      name,
      updatedAt: Date.now(),
    }
    workspaces.value.push(ws)
    currentId.value = ws.id
    return ws
  }

  function renameWorkspace(id: string, name: string): void {
    const ws = workspaces.value.find((w) => w.id === id)
    if (!ws) return
    ws.name = name
    ws.updatedAt = Date.now()
  }

  function deleteWorkspace(id: string): void {
    if (workspaces.value.length <= 1) return // 至少保留一个
    workspaces.value = workspaces.value.filter((w) => w.id !== id)
    if (currentId.value === id) {
      currentId.value = workspaces.value[0].id
    }
  }

  function switchWorkspace(id: string): void {
    if (workspaces.value.find((w) => w.id === id)) {
      currentId.value = id
    }
  }

  watch(workspaces, (val) => {
    storageService.save(WS_KEY, val)
  }, { deep: true })

  watch(currentId, (val) => {
    storageService.save(CURRENT_KEY, val)
  })

  return { workspaces, currentId, currentWorkspace, addWorkspace, renameWorkspace, deleteWorkspace, switchWorkspace }
})
