<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-brand" @click="goHome">
      <span class="brand-mark">◆</span>
      <span class="brand-text">SKTS</span>
    </div>

    <!-- 空间列表 -->
    <div class="workspace-section">
      <div class="section-label">工作空间</div>
      <div class="workspace-list" ref="listRef">
        <div
          v-for="ws in wsStore.workspaces"
          :key="ws.id"
          class="workspace-item"
          :class="{ active: ws.id === wsStore.currentId }"
          @click="wsStore.switchWorkspace(ws.id)"
          @contextmenu.prevent="openMenu($event, ws)"
        >
          <span class="ws-icon">{{ ws.id === wsStore.currentId ? '◆' : '◇' }}</span>
          <span class="ws-name">{{ ws.name }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="sidebar-footer">
      <button class="add-ws-btn" @click="handleAdd" title="新建工作空间">
        <span class="add-icon">+</span>
        <span class="add-text">新建空间</span>
      </button>
      <button class="ai-settings-btn" @click="showAiSettings = true" title="AI 设置">
        <el-icon><Setting /></el-icon>
        <span class="ai-settings-text">AI 设置</span>
      </button>
    </div>

    <!-- AI 设置弹窗 -->
    <el-dialog v-model="showAiSettings" title="AI 设置" width="420px">
      <el-form label-position="top">
        <el-form-item label="API Key">
          <el-input
            v-model="aiConfig.apiKey"
            type="password"
            show-password
            placeholder="sk-..."
          />
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="aiConfig.baseUrl" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="aiConfig.model" placeholder="gpt-4o-mini" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAiSettings = false">取消</el-button>
        <el-button type="primary" @click="saveAiConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 (teleported) -->
    <Teleport to="body">
      <div
        v-if="menu.visible"
        class="context-menu"
        :style="{ left: menu.x + 'px', top: menu.y + 'px' }"
        @click.stop
      >
        <button class="menu-item" @click="handleRename">重命名</button>
        <button class="menu-item danger" @click="handleDelete">删除</button>
      </div>
    </Teleport>

    <!-- 关闭菜单的遮罩 -->
    <div v-if="menu.visible" class="menu-backdrop" @click="closeMenu" />
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTaskStore } from '@/stores/taskStore'
import { aiService } from '@/services/aiService'

const wsStore = useWorkspaceStore()
const taskStore = useTaskStore()
const router = useRouter()
const listRef = ref<HTMLElement | null>(null)

// AI 设置
const showAiSettings = ref(false)
const aiConfig = reactive(aiService.getConfig())

function saveAiConfig(): void {
  aiService.saveConfig({ ...aiConfig })
  ElMessage.success('AI 配置已保存')
  showAiSettings.value = false
}

const menu = reactive({
  visible: false,
  x: 0,
  y: 0,
  wsId: '',
})

function goHome(): void {
  router.push(`/workspace/${wsStore.currentId}`)
}

function openMenu(e: MouseEvent, ws: { id: string }): void {
  menu.x = e.clientX
  menu.y = e.clientY
  menu.wsId = ws.id
  menu.visible = true
}

function closeMenu(): void {
  menu.visible = false
}

async function handleAdd(): Promise<void> {
  try {
    const { value } = await ElMessageBox.prompt('请输入空间名称', '新建工作空间', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPlaceholder: '工作空间名称',
    })
    if (value?.trim()) {
      const ws = wsStore.addWorkspace(value.trim())
      router.push(`/workspace/${ws.id}`)
    }
  } catch {
    // 用户取消
  }
}

async function handleRename(): Promise<void> {
  closeMenu()
  try {
    const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: wsStore.workspaces.find((w) => w.id === menu.wsId)?.name,
    })
    if (value?.trim()) {
      wsStore.renameWorkspace(menu.wsId, value.trim())
    }
  } catch {
    // 用户取消
  }
}

async function handleDelete(): Promise<void> {
  closeMenu()
  if (wsStore.workspaces.length <= 1) return
  try {
    await ElMessageBox.confirm(
      '确定删除该工作空间吗？其中的任务将一并删除。',
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    // 移除该空间下所有任务
    const tasksToDelete = taskStore.tasks.filter((t) => t.workspaceId === menu.wsId)
    for (const t of tasksToDelete) {
      taskStore.deleteTask(t.id)
    }
    wsStore.deleteWorkspace(menu.wsId)
    router.push(`/workspace/${wsStore.currentId}`)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #fafbfc;
  border-right: 1px solid #edf0f4;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  user-select: none;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 18px 12px;
  cursor: pointer;
}

.brand-mark {
  font-size: 16px;
  color: #5b6abf;
}

.brand-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #333;
}

/* Section */
.workspace-section {
  flex: 1;
  padding: 0 10px;
  overflow: auto;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  color: #b0b8c0;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  padding: 8px 8px 6px;
}

.workspace-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workspace-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: background 0.12s, color 0.12s;
}

.workspace-item:hover {
  background: #eef1f6;
  color: #333;
}

.workspace-item.active {
  background: #eaedf9;
  color: #4a5ac0;
  font-weight: 500;
}

.ws-icon {
  font-size: 11px;
  flex-shrink: 0;
}

.ws-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer */
.sidebar-footer {
  padding: 10px;
  border-top: 1px solid #edf0f4;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.add-ws-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px;
  border: 1px dashed #d5dae0;
  border-radius: 7px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: #999;
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}

.add-ws-btn:hover {
  border-color: #5b6abf;
  color: #5b6abf;
  background: #f5f6fd;
}

.add-icon {
  font-size: 15px;
  font-weight: 300;
}

/* Context Menu */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 4px;
  min-width: 120px;
  animation: menu-in 0.15s ease;
}

@keyframes menu-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.menu-item {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  color: #444;
  text-align: left;
  font-family: inherit;
  transition: background 0.1s;
}

.menu-item:hover { background: #f0f2f7; }
.menu-item.danger { color: #e74c3c; }
.menu-item.danger:hover { background: #fef0f0; }

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

/* AI Settings */
.ai-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px;
  border: none;
  border-radius: 7px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: #bbb;
  font-family: inherit;
  transition: color 0.12s, background 0.12s;
}

.ai-settings-btn:hover {
  color: #5b6abf;
  background: #f5f6fd;
}

.ai-settings-text {
  font-size: 12px;
}
</style>
