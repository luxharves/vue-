import { storageService } from '@/services/storageService'

const AI_CONFIG_KEY = 'ai-config'

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
}

function getConfig(): AIConfig {
  return storageService.load<AIConfig>(AI_CONFIG_KEY) ?? {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  }
}

export const aiService = {
  getConfig,

  saveConfig(config: AIConfig): void {
    storageService.save(AI_CONFIG_KEY, config)
  },

  async chat(prompt: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    const config = getConfig()
    if (!config.apiKey) {
      throw new Error('请先配置 AI API Key')
    }

    const messages: { role: string; content: string }[] = []
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: 2000,
      }),
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      throw new Error(`AI 请求失败 (${res.status}): ${err}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  },

  /** 总结任务的所有 Block 内容 */
  async summarize(blocks: { type: string; content: unknown }[]): Promise<string> {
    const text = blocks
      .filter((b) => b.type === 'text' || b.type === 'todo' || b.type === 'code')
      .map((b) => {
        if (typeof b.content === 'string') return b.content
        if (typeof b.content === 'object' && b.content !== null && 'text' in b.content) {
          return (b.content as { text: string }).text
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')

    if (!text.trim()) throw new Error('没有可总结的内容')

    return aiService.chat(`请用简洁的中文总结以下内容要点（不超过 200 字）：\n\n${text}`, {
      systemPrompt: '你是一个任务管理助手的摘要生成器。请用简洁、清晰的中文总结内容，提取关键信息。',
      temperature: 0.3,
    })
  },

  /** 根据任务内容生成标签 */
  async generateTags(title: string, blocks: { type: string; content: unknown }[]): Promise<string[]> {
    const text = blocks
      .filter((b) => b.type === 'text' || b.type === 'todo')
      .map((b) => {
        if (typeof b.content === 'string') return b.content
        if (typeof b.content === 'object' && b.content !== null && 'text' in b.content) {
          return (b.content as { text: string }).text
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')

    const result = await aiService.chat(
      `任务标题：${title}\n内容：${text || '（无额外内容）'}\n\n请为这个任务生成 2-4 个中文标签，用逗号分隔，只返回标签文字。`,
      {
        systemPrompt: '你是一个标签生成器。根据任务标题和内容，生成简短准确的中文标签。只返回标签，用逗号分隔，不要其他内容。',
        temperature: 0.5,
      }
    )

    return result.split(/[,，]/).map((t) => t.trim()).filter(Boolean).slice(0, 4)
  },

  /** 优化/润色文本内容 */
  async polish(text: string, type: 'text' | 'todo'): Promise<string> {
    return aiService.chat(`请优化以下${type === 'todo' ? '待办事项' : '文本'}，使其更清晰准确，保持原意，不超过原文字数太多：\n\n${text}`, {
      systemPrompt: '你是一个文字编辑助手。优化文本使其更清晰、准确、简洁。保持原意，只返回优化后的文本，不要加解释。',
      temperature: 0.4,
    })
  },
}
