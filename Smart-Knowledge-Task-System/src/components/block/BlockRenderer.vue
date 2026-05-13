<template>
  <div
    class="block-renderer"
    :data-block-id="block.id"
    :class="[`block-${block.type}`, { 'is-active': active, 'is-dragging': dragging }]"
    draggable="true"
    @click.stop="setActive"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- 拖拽把手 + 类型标签 -->
    <div class="block-tools">
      <span class="drag-handle" @mousedown.stop>⠿</span>
      <el-dropdown trigger="click" @command="onSwitchType">
        <span class="type-label" @click.stop>{{ typeLabel }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="t in otherTypes"
              :key="t"
              :command="t"
            >{{ t }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- text -->
    <template v-if="block.type === 'text'">
      <textarea ref="textareaRef" :value="textContent" class="block-textarea" :rows="1"
        placeholder="输入文本..." @input="onTextInput" @keydown="handleKey" />
      <button v-if="textContent" class="btn-polish" @click.stop="onPolish" :disabled="polishing" title="AI 优化">
        <el-icon><MagicStick /></el-icon>
      </button>
    </template>

    <!-- todo -->
    <template v-else-if="block.type === 'todo'">
      <label class="todo-row">
        <input type="checkbox" class="todo-check" :checked="todoChecked" @change="onTodoToggle" />
        <textarea ref="textareaRef" :value="todoText" class="block-textarea" :class="{ 'todo-done': todoChecked }"
          :rows="1" placeholder="待办事项..." @input="onTodoInput" @keydown="handleKey" />
      </label>
      <button v-if="todoText" class="btn-polish" @click.stop="onPolish" :disabled="polishing" title="AI 优化">
        <el-icon><MagicStick /></el-icon>
      </button>
    </template>

    <!-- code -->
    <template v-else-if="block.type === 'code'">
      <div class="code-header"><span class="code-lang">Code</span></div>
      <textarea ref="textareaRef" :value="textContent" class="block-textarea code-text" :rows="1"
        placeholder="输入代码..." spellcheck="false" @input="onTextInput" @keydown="handleKey" />
    </template>

    <!-- image -->
    <template v-else-if="block.type === 'image'">
      <img v-if="textContent" :src="textContent" class="block-image" alt="block image" @load="onImgLoad" />
      <div class="image-upload" @click.stop>
        <button class="upload-label" @click="triggerFileInput">
          <el-icon><Plus /></el-icon>
          <span>{{ textContent ? '更换图片' : '上传图片' }}</span>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="file-input-hidden"
          @change="onFileChange"
        />
      </div>
    </template>

    <!-- ai -->
    <template v-else-if="block.type === 'ai'">
      <span class="ai-badge">AI</span>
      <template v-if="textContent">
        <div class="ai-result">{{ textContent }}</div>
      </template>
      <template v-else>
        <textarea ref="textareaRef" v-model="aiPrompt" class="block-textarea" :rows="1"
          placeholder="输入提示词，按 Ctrl+Enter 生成..." @keydown="onAiKey" />
        <button class="btn-generate" @click.stop="onAiGenerate" :disabled="aiGenerating || !aiPrompt.trim()">
          <el-icon><MagicStick /></el-icon>
          <span>{{ aiGenerating ? '生成中...' : '生成' }}</span>
        </button>
      </template>
    </template>

    <!-- 右侧删除按钮 -->
    <span class="block-delete" @click.stop="onDelete" title="删除">×</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, MagicStick } from '@element-plus/icons-vue'
import type { Block, BlockType } from '@/types'
import { aiService } from '@/services/aiService'

const DRAG_DATA_KEY = 'block-id'

const props = defineProps<{
  block: Block
  active: boolean
}>()

const emit = defineEmits<{
  setActive: [blockId: string]
  update: [blockId: string, content: unknown]
  newBlock: [afterBlockId: string]
  deleteBlock: [blockId: string]
  switchType: [blockId: string, newType: BlockType]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
const dragging = ref(false)

const allTypes: BlockType[] = ['text', 'todo', 'code', 'image', 'ai']

const typeLabel = computed(() => props.block.type)

const otherTypes = computed(() => allTypes.filter((t) => t !== props.block.type))

const textContent = computed(() =>
  typeof props.block.content === 'string' ? props.block.content : ''
)

const todoChecked = computed(() => {
  const c = props.block.content as { checked?: boolean } | null
  return c?.checked ?? false
})

const todoText = computed(() => {
  const c = props.block.content as { text?: string } | null
  return c?.text ?? ''
})

function setActive(): void {
  emit('setActive', props.block.id)
  setTimeout(() => textareaRef.value?.focus(), 0)
}

function emitUpdate(content: unknown): void {
  emit('update', props.block.id, content)
}

function onTextInput(e: Event): void {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
  emitUpdate(el.value)
}

function onTodoInput(e: Event): void {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
  emitUpdate({ text: el.value, checked: todoChecked.value })
}

function onTodoToggle(): void {
  emitUpdate({ text: todoText.value, checked: !todoChecked.value })
}

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function onFileChange(): void {
  const file = fileInputRef.value?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    emitUpdate(dataUrl)
  }
  reader.readAsDataURL(file)
}

function onImgLoad(e: Event): void {
  const img = e.target as HTMLImageElement
  img.style.maxWidth = '100%'
}

function onSwitchType(newType: BlockType): void {
  emit('switchType', props.block.id, newType)
}

function handleKey(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); emit('newBlock', props.block.id) }
}

function onDragStart(e: DragEvent): void {
  if (!e.dataTransfer) return
  e.dataTransfer.setData(DRAG_DATA_KEY, props.block.id)
  e.dataTransfer.effectAllowed = 'move'
  dragging.value = true
}

function onDelete(): void { emit('deleteBlock', props.block.id) }

const polishing = ref(false)

async function onPolish(): Promise<void> {
  const text = props.block.type === 'todo' ? todoText.value : textContent.value
  if (!text) return
  polishing.value = true
  try {
    const polished = await aiService.polish(text, props.block.type as 'text' | 'todo')
    if (polished) {
      const content = props.block.type === 'todo'
        ? { text: polished, checked: todoChecked.value }
        : polished
      emitUpdate(content)
    }
  } catch (e) {
    // 静默失败
  } finally {
    polishing.value = false
  }
}

// AI Block
const aiPrompt = ref('')
const aiGenerating = ref(false)

function onAiKey(e: KeyboardEvent): void {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    onAiGenerate()
  }
}

async function onAiGenerate(): Promise<void> {
  const prompt = aiPrompt.value.trim()
  if (!prompt) return
  aiGenerating.value = true
  try {
    const result = await aiService.chat(prompt)
    if (result) {
      emitUpdate(result)
      aiPrompt.value = ''
    }
  } catch (e) {
    // 静默失败
  } finally {
    aiGenerating.value = false
  }
}

function onDragEnd(): void { dragging.value = false }
</script>

<style scoped>
.block-renderer {
  position: relative;
  padding: 8px 12px 8px 40px;
  border-radius: 6px;
  transition: background 0.12s, opacity 0.15s;
  cursor: text;
}

.block-renderer:hover  { background: #f8f9fb; }
.block-renderer.is-active { background: #f0f4ff; }
.block-renderer.is-dragging { opacity: 0.4; }

.block-tools {
  position: absolute;
  left: 4px;
  top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.12s;
}

.block-renderer:hover .block-tools { opacity: 1; }

.drag-handle {
  cursor: grab;
  font-size: 14px;
  color: #ccc;
  user-select: none;
  line-height: 1;
}

.drag-handle:active { cursor: grabbing; }

.type-label {
  font-size: 9px;
  font-weight: 600;
  color: #bbb;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
  padding: 1px 3px;
  border-radius: 3px;
}

.type-label:hover { color: #409eff; background: #e6f0ff; }

.block-delete {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: #c0c4cc;
  cursor: pointer;
  line-height: 1;
  user-select: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  opacity: 0.55;
  transition: opacity 0.12s, color 0.12s, background 0.12s;
}

.block-renderer:hover .block-delete { opacity: 1; }

.block-delete:hover {
  color: #6b7280;
  background: #f3f4f6;
}

/* Polish/AI buttons */
.btn-polish, .btn-generate {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: none;
  color: #c0c4cc;
  cursor: pointer;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.12s, color 0.12s, background 0.12s;
}

.block-renderer:hover .btn-polish,
.block-renderer:hover .btn-generate { opacity: 0.55; }

.btn-polish:hover, .btn-generate:hover {
  opacity: 1 !important;
  color: #5b6abf;
  background: #f0f1fd;
}

.btn-polish:disabled, .btn-generate:disabled {
  cursor: not-allowed;
  opacity: 0.3 !important;
}

/* AI Block */
.ai-result {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.btn-generate {
  position: static;
  transform: none;
  display: inline-flex;
  gap: 4px;
  padding: 4px 10px;
  width: auto;
  height: auto;
  font-size: 12px;
  color: #5b6abf;
  opacity: 0.7;
  margin-top: 6px;
  border-radius: 6px;
}

.btn-generate:hover { opacity: 1; background: #f0f1fd; }

.block-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  color: #333;
  resize: none;
  overflow: hidden;
}

.block-textarea::placeholder { color: #ccc; }

/* todo */
.todo-row { display: flex; align-items: flex-start; gap: 8px; }

.todo-check {
  margin-top: 6px; width: 16px; height: 16px;
  cursor: pointer; accent-color: #409eff;
}

.todo-done { text-decoration: line-through; color: #bbb !important; }

/* code */
.code-header { margin-bottom: 4px; }

.code-lang {
  font-size: 11px; font-weight: 600; color: #999;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.code-text {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px; background: #f5f6fa;
  padding: 8px 10px; border-radius: 6px;
}

/* image */
.block-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 6px;
  margin-bottom: 8px;
  display: block;
}

.image-upload {
  display: flex;
  align-items: center;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: none;
  font-family: inherit;
  transition: background 0.12s;
}

.upload-label:hover { background: #e6f0ff; }

.file-input-hidden {
  display: none;
}

/* ai */
.ai-badge {
  display: inline-block;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; margin-bottom: 4px; letter-spacing: 0.5px;
}
</style>
