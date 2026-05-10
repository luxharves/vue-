//src/services/ 一般放：所有“与 UI 无关、但需要被多个模块复用的逻辑,也就是工具层的意思
//这里放的是存储类的工具是对本例浏览器的localstorage的处理
const PREFIX = 'skts:'//就是所有存储的 key 加“命名空间前缀”，以避免和其他 localStorage 项目的 key 冲突

function prefixed(key: string): string {
  return PREFIX + key
}//加前缀的函数

export const storageService = {
  save<T>(key: string, value: T): void {//save是存数据
    try {
      localStorage.setItem(prefixed(key), JSON.stringify(value))//这里的json是转变了字符串
    } catch {
      console.error(`[storageService] 保存 "${key}" 失败`)
    }
  },

  load<T>(key: string): T | null {//load是取数据，T是泛型的意思是这个函数可以适用于任何类型的数据，调用时可以指定具体的类型，比如storageService.load<Task>('tasks')，这样就会返回一个Task类型的对象或者null
    try {
      const raw = localStorage.getItem(prefixed(key))
      return raw !== null ? (JSON.parse(raw) as T) : null//这里的JSon是转换回去
    } catch {
      console.error(`[storageService] 读取 "${key}" 失败`)
      return null
    }
  },

  remove(key: string): void {//删除数据
    localStorage.removeItem(prefixed(key))
  },

  clear(): void {//清空整个项目数据
    const keysToRemove: string[] = []//待删除列表
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) {//判断是只删除带有前缀的数据
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  },
}
