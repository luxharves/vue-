export type BlockType = 'text' | 'todo' | 'code' | 'image' | 'ai'

export type TaskStatus = 'todo' | 'doing' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type ViewType = 'kanban' | 'table' | 'detail'
//规定好类型之后就不需要再修改了，除非需要新增类型

export interface Block {
  id: string
  type: BlockType
  content: unknown
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  blocks: Block[]
  createdAt: number
  updatedAt: number
}

export interface Workspace {
  id: string
  name: string
  tasks: Task[]
}
//这些是规定好的数据类型，未来我引入的是类似上面的数据类型，比如const tasks=ref<Task[]>([]),意思是tasks这个变量是一个数组，数组中的每个元素都是Task类型的对象，这样就可以保证在使用tasks变量时，里面的每个元素都符合Task类型的结构和要求。