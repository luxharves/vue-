import type { BlockType } from '@/types'

export interface BlockRegistryEntry {
  type: BlockType
  label: string
  icon: string        // emoji shortcut
  description: string
  defaultContent: unknown
}

export const blockRegistry: BlockRegistryEntry[] = [
  {
    type: 'text',
    label: '文本',
    icon: 'Aa',
    description: '普通文本段落',
    defaultContent: '',
  },
  {
    type: 'todo',
    label: '待办',
    icon: '☑',
    description: '可勾选的待办事项',
    defaultContent: { text: '', checked: false },
  },
  {
    type: 'code',
    label: '代码',
    icon: '</>',
    description: '代码片段，等宽字体显示',
    defaultContent: '',
  },
  {
    type: 'image',
    label: '图片',
    icon: '🖼',
    description: '上传或粘贴图片',
    defaultContent: '',
  },
  {
    type: 'ai',
    label: 'AI',
    icon: '✦',
    description: 'AI 辅助生成内容',
    defaultContent: '',
  },
]

/** 快速按 type 查询 */
export function getRegistryEntry(type: BlockType): BlockRegistryEntry | undefined {
  return blockRegistry.find((e) => e.type === type)
}

/** 搜索 Block 类型（用于 Slash 命令） */
export function searchRegistry(query: string): BlockRegistryEntry[] {
  const q = query.toLowerCase()
  return blockRegistry.filter(
    (e) =>
      e.label.includes(q) ||
      e.description.includes(q) ||
      e.type.includes(q)
  )
}
