<template>
  <div class="detail-view">
    <div class="detail-topbar">
      <el-button size="small" text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <div v-if="task" class="detail-content">
      <!-- 标题 -->
      <div class="detail-title-area">
        <template v-if="editingTitle">
          <input
            ref="titleInputRef"
            v-model="editTitleText"
            class="title-input"
            @keydown.enter="confirmTitle"
            @keydown.escape="cancelTitleEdit"
            @blur="confirmTitle"
          />
        </template>
        <template v-else>
          <h2 class="detail-title" @click="startTitleEdit">{{ task.title }}</h2>
        </template>
      </div>

      <!-- 属性 -->
      <div class="detail-props">
        <div class="prop-item">
          <span class="prop-label">状态</span>
          <el-select :model-value="task.status" size="small" class="prop-select" @change="handleStatusChange">
            <el-option v-for="s in allStatuses" :key="s" :label="statusMap[s]" :value="s" />
          </el-select>
        </div>
        <div class="prop-item">
          <span class="prop-label">优先级</span>
          <el-select :model-value="task.priority" size="small" class="prop-select" @change="handlePriorityChange">
            <el-option v-for="p in allPriorities" :key="p" :label="priorityMap[p]" :value="p" />
          </el-select>
        </div>
        <div class="prop-item">
          <span class="prop-label">标签</span>
          <el-tag v-for="tag in task.tags" :key="tag" size="small" round class="detail-tag">{{ tag }}</el-tag>
          <span v-if="!task.tags.length" class="no-data">—</span>
        </div>
      </div>

      <div class="detail-meta">
        <span>创建于 {{ formatDate(task.createdAt) }}</span>
        <span v-if="task.updatedAt !== task.createdAt"> · 更新于 {{ formatDate(task.updatedAt) }}</span>
      </div>

      <!-- AI 操作 -->
      <div class="ai-actions">
        <el-button size="small" :loading="aiLoading === 'summary'" @click="handleAiSummary">
          <el-icon><MagicStick /></el-icon>
          AI 总结
        </el-button>
        <el-button size="small" :loading="aiLoading === 'tags'" @click="handleAiTags">
          <el-icon><MagicStick /></el-icon>
          生成标签
        </el-button>
        <span v-if="aiError" class="ai-error">{{ aiError }}</span>
      </div>

      <el-divider />

      <!-- Block 列表 -->
      <div class="blocks-section">
        <div v-if="task.blocks.length === 0" class="blocks-empty" @click="addBlock('text')">
          <p>点击这里添加第一个内容块</p>
        </div>
        <TransitionGroup v-else name="block-list" tag="div" class="blocks-list"
          @dragover.prevent="onDragOver"
          @dragenter.prevent="onDragEnter"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop"
        >
          <BlockRenderer
            v-for="block in task.blocks"
            :key="block.id"
            :block="block"
            :active="activeBlockId === block.id"
            @set-active="activeBlockId = $event"
            @update="onBlockUpdate"
            @new-block="onNewBlock"
            @delete-block="onBlockDelete"
            @switch-type="onBlockSwitchType"
          />
        </TransitionGroup>
        <div class="add-block-btns">
          <el-button size="small" text @click="addBlock('text')">+ 文本</el-button>
          <el-button size="small" text @click="addBlock('todo')">+ 待办</el-button>
          <el-button size="small" text @click="addBlock('code')">+ 代码</el-button>
          <el-button size="small" text @click="addBlock('image')">+ 图片</el-button>
          <el-button size="small" text @click="addBlock('ai')">+ AI</el-button>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>任务不存在</p>
      <el-button size="small" @click="goBack">返回看板</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, MagicStick } from '@element-plus/icons-vue'
import { aiService } from '@/services/aiService'
import type { BlockType, TaskPriority, TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/taskStore'
import BlockRenderer from '@/components/block/BlockRenderer.vue'

const taskStore = useTaskStore()
const router = useRouter()
const route = useRoute()

const allStatuses: TaskStatus[] = ['todo', 'doing', 'done']
const allPriorities: TaskPriority[] = ['high', 'medium', 'low']

const statusMap: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' }
const priorityMap: Record<TaskPriority, string> = { high: '高', medium: '中', low: '低' }

const task = computed(() =>
  taskStore.tasks.find((t) => t.id === route.params.taskId) ?? null
)

const editingTitle = ref(false)
const editTitleText = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)
const activeBlockId = ref<string | null>(null)

async function startTitleEdit(): Promise<void> {
  if (!task.value) return
  editTitleText.value = task.value.title
  editingTitle.value = true
  await nextTick()
  titleInputRef.value?.focus()
}

function confirmTitle(): void {
  if (!editingTitle.value || !task.value) return
  const newTitle = editTitleText.value.trim()
  if (newTitle && newTitle !== task.value.title) {
    taskStore.updateTask(task.value.id, { title: newTitle })
  }
  editingTitle.value = false
}

function cancelTitleEdit(): void { editingTitle.value = false }

function handleStatusChange(val: string): void {
  if (!task.value) return
  taskStore.changeStatus(task.value.id, val as TaskStatus)
}

function handlePriorityChange(val: string): void {
  if (!task.value) return
  taskStore.updateTask(task.value.id, { priority: val as TaskPriority })
}

// Block 操作
function addBlock(type: BlockType): void {
  if (!task.value) return
  const content = type === 'todo' ? { text: '', checked: false } : ''
  const block = { id: crypto.randomUUID(), type, content }
  taskStore.addBlock(task.value.id, block)
  activeBlockId.value = block.id
}

function onBlockUpdate(blockId: string, content: unknown): void {
  if (!task.value) return
  taskStore.updateBlock(task.value.id, blockId, { content })
}

function onNewBlock(afterBlockId: string): void {
  if (!task.value) return
  const idx = task.value.blocks.findIndex((b) => b.id === afterBlockId)
  const block = { id: crypto.randomUUID(), type: 'text' as const, content: '' }
  taskStore.addBlock(task.value.id, block)
  // Move new block to position after current
  if (idx !== -1) {
    const blocks = [...task.value.blocks]
    const newBlock = blocks.pop()!
    blocks.splice(idx + 1, 0, newBlock)
    taskStore.reorderBlocks(task.value.id, blocks)
  }
  activeBlockId.value = block.id
}

function onBlockSwitchType(blockId: string, newType: BlockType): void {
  if (!task.value) return
  const block = task.value.blocks.find((b) => b.id === blockId)
  if (!block) return
  // Preserve content if possible, otherwise reset
  const prevContent = block.content
  const newContent = (newType === 'todo' && typeof prevContent === 'string')
    ? { text: prevContent, checked: false }
    : (newType !== 'todo' && typeof prevContent === 'object' && (prevContent as { text?: string }).text)
      ? (prevContent as { text: string }).text
      : ''
  taskStore.updateBlock(task.value.id, blockId, { type: newType, content: newContent })
}

// Drag-and-drop 重排
let dragEnterCount = 0

function onDragOver(e: DragEvent): void {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDragEnter(): void { dragEnterCount++ }

function onDragLeave(): void {
  dragEnterCount--
  if (dragEnterCount <= 0) dragEnterCount = 0
}

function onDrop(e: DragEvent): void {
  dragEnterCount = 0
  if (!task.value) return
  const blockId = e.dataTransfer?.getData('block-id')
  if (!blockId) return

  const blocks = [...task.value.blocks]
  const fromIdx = blocks.findIndex((b) => b.id === blockId)
  if (fromIdx === -1) return

  // Find drop position
  const dropTarget = (e.target as HTMLElement).closest('.block-renderer')
  if (!dropTarget) return
  const toId = dropTarget.getAttribute('data-block-id')
  const toIdx = blocks.findIndex((b) => b.id === toId)
  if (toIdx === -1 || fromIdx === toIdx) return

  const moved = blocks.splice(fromIdx, 1)[0]
  if (!moved) return
  blocks.splice(toIdx, 0, moved)
  taskStore.reorderBlocks(task.value.id, blocks)
}

function onBlockDelete(blockId: string): void {
  if (!task.value) return
  const idx = task.value.blocks.findIndex((b) => b.id === blockId)
  taskStore.deleteBlock(task.value.id, blockId)
  if (task.value.blocks.length > 0) {
    const prev = task.value.blocks[Math.max(0, idx - 1)]
    if (prev) activeBlockId.value = prev.id
  } else {
    activeBlockId.value = null
  }
}

// AI 操作
const aiLoading = ref<string | null>(null)
const aiError = ref('')

async function handleAiSummary(): Promise<void> {
  if (!task.value) return
  aiError.value = ''
  aiLoading.value = 'summary'
  try {
    const result = await aiService.summarize(task.value.blocks)
    taskStore.addBlock(task.value.id, { id: crypto.randomUUID(), type: 'ai', content: result })
  } catch (e) {
    aiError.value = (e as Error).message
  } finally {
    aiLoading.value = null
  }
}

async function handleAiTags(): Promise<void> {
  if (!task.value) return
  aiError.value = ''
  aiLoading.value = 'tags'
  try {
    const newTags = await aiService.generateTags(task.value.title, task.value.blocks)
    if (newTags.length) {
      const merged = [...new Set([...task.value.tags, ...newTags])]
      taskStore.updateTask(task.value.id, { tags: merged })
    }
  } catch (e) {
    aiError.value = (e as Error).message
  } finally {
    aiLoading.value = null
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function goBack(): void {
  router.push(`/workspace/${route.params.id}`)
}
</script>

<style scoped>
.detail-view {
  padding: 24px 32px;
  height: 100%;
  overflow: auto;
  max-width: 680px;
  margin: 0 auto;
}

.detail-topbar { margin-bottom: 20px; }
.detail-content { display: flex; flex-direction: column; gap: 16px; }

.detail-title-area { margin-bottom: 8px; }

.detail-title {
  font-size: 24px; font-weight: 700; color: #1a1a2e;
  margin: 0; cursor: pointer; line-height: 1.3; word-break: break-word;
}
.detail-title:hover { color: #409eff; }

.title-input {
  width: 100%; height: 36px; padding: 0 12px;
  border: 1px solid #409eff; border-radius: 6px;
  font-size: 24px; font-weight: 700; color: #1a1a2e; outline: none;
}

.detail-props { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.prop-item { display: flex; align-items: center; gap: 6px; }
.prop-label { font-size: 12px; color: #999; flex-shrink: 0; }
.prop-select { width: 100px; }
.detail-tag { margin-right: 4px; }
.no-data { color: #ccc; font-size: 13px; }

.detail-meta { font-size: 12px; color: #bbb; }

.ai-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-error {
  font-size: 12px;
  color: #e74c3c;
}

/* Blocks */
.blocks-section { display: flex; flex-direction: column; gap: 4px; }

.blocks-empty {
  text-align: center; padding: 32px 16px; border: 1.5px dashed #d5d8e0;
  border-radius: 8px; cursor: pointer; color: #bbb; font-size: 13px;
}
.blocks-empty:hover { border-color: #409eff; color: #409eff; }

.blocks-list { display: flex; flex-direction: column; gap: 2px; }

.add-block-btns {
  display: flex; gap: 2px; flex-wrap: wrap; margin-top: 4px;
}

/* TransitionGroup */
.block-list-enter-active, .block-list-leave-active { transition: all 0.2s ease; }
.block-list-enter-from { opacity: 0; transform: translateY(-4px); }
.block-list-leave-to { opacity: 0; transform: translateY(4px); }

.not-found { text-align: center; padding: 60px 0; color: #999; }
</style>
