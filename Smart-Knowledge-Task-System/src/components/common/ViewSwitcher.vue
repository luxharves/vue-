<template>
  <div class="view-switcher">
    <button
      class="switch-tab"
      :class="{ active: activeView === 'kanban' }"
      @click="switchView('kanban')"
    >
      <el-icon><Grid /></el-icon>
      <span>看板</span>
    </button>
    <button
      class="switch-tab"
      :class="{ active: activeView === 'table' }"
      @click="switchView('table')"
    >
      <el-icon><List /></el-icon>
      <span>表格</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Grid, List } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeView = computed(() => (route.name === 'table' ? 'table' : 'kanban'))

function switchView(view: string): void {
  if (activeView.value === view) return
  const wsId = route.params.id
  if (view === 'table') {
    router.push(`/workspace/${wsId}/table`)
  } else {
    router.push(`/workspace/${wsId}`)
  }
}
</script>

<style scoped>
.view-switcher {
  display: inline-flex;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.switch-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #777;
  font-family: inherit;
  transition: all 0.15s;
}

.switch-tab:hover {
  color: #444;
  background: #e8eaf0;
}

.switch-tab.active {
  background: #fff;
  color: #333;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
